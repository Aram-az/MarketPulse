from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Tuple
import math
import os
from datetime import datetime, timezone

import polars as pl
import pandas as pd

REQUIRED_COLS = [
    "timestamp",
    "asset",
    "side",
    "quantity",
    "entry_price",
    "exit_price",
    "profit_loss",
    "balance",
]

MOCK_FILES = {
    "calm_trader": "calm_trader.csv",
    "overtrader": "overtrader.csv",
    "loss_averse_trader": "loss_averse_trader.csv",
    "revenge_trader": "revenge_trader.csv",
}


@dataclass
class LoadedData:
    df: pl.DataFrame
    warnings: List[str]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_float(x: Any, default: float = 0.0) -> float:
    try:
        if x is None:
            return default
        v = float(x)
        if math.isnan(v):
            return default
        return v
    except Exception:
        return default


def _to_int(x: Any, default: int = 0) -> int:
    try:
        if x is None:
            return default
        return int(x)
    except Exception:
        return default


def _sigmoid(x: float) -> float:
    # stable-ish sigmoid
    if x >= 0:
        z = math.exp(-x)
        return 1 / (1 + z)
    z = math.exp(x)
    return z / (1 + z)


def _score_from_midpoint(value: float, midpoint: float, steepness: float) -> float:
    """
    Maps value to 0..100 using sigmoid centered at midpoint.
    Handles infinities sensibly:
      +inf -> 100, -inf -> 0
    """
    if value is None:
        return 0.0
    if math.isinf(value):
        return 100.0 if value > 0 else 0.0
    if not math.isfinite(value):
        return 0.0
    return float(100.0 * _sigmoid((value - midpoint) * steepness))


def _level(score: float) -> str:
    s = float(score or 0.0)
    s_round = int(round(s))
    if s_round >= 80:
        return "high"
    if s_round >= 50:
        return "medium"
    return "low"


def load_trades_from_bytes(file_bytes: bytes, filename: str) -> LoadedData:
    warnings: List[str] = []
    ext = (filename or "").lower().split(".")[-1]

    if ext in ["csv"]:
        df = pl.read_csv(file_bytes, try_parse_dates=False)
    elif ext in ["xlsx", "xls"]:
        pdf = pd.read_excel(file_bytes)
        df = pl.from_pandas(pdf)
        warnings.append("Loaded Excel via pandas; CSV is faster for large files.")
    else:
        raise ValueError("Unsupported file type. Please upload CSV or Excel.")

    # Normalize columns
    df = df.rename({c: c.strip().lower() for c in df.columns})

    missing = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Enforce types; fill nulls on numerics to avoid None propagation
    df = df.with_columns(
        [
            pl.col("timestamp").cast(pl.Utf8),
            pl.col("asset").cast(pl.Utf8),
            pl.col("side").cast(pl.Utf8),
            pl.col("quantity").cast(pl.Float64).fill_null(0.0),
            pl.col("entry_price").cast(pl.Float64).fill_null(0.0),
            pl.col("exit_price").cast(pl.Float64).fill_null(0.0),
            pl.col("profit_loss").cast(pl.Float64).fill_null(0.0),
            pl.col("balance").cast(pl.Float64).fill_null(0.0),
        ]
    )

    # Parse timestamp (polars-version-safe: no utc= kwarg)
    parsed = df.with_columns(
        [pl.col("timestamp").str.strptime(pl.Datetime, strict=False).alias("_ts")]
    )

    null_ts = _to_int(parsed.select(pl.col("_ts").is_null().sum()).item(), default=0)
    if null_ts > 0:
        raise ValueError(
            "Failed to parse some timestamps. Ensure 'timestamp' is ISO-like or Excel datetime."
        )

    df = parsed.drop("timestamp").rename({"_ts": "timestamp"}).sort("timestamp")

    if df.height == 0:
        raise ValueError("No rows found after loading. Check the input file.")

    return LoadedData(df=df, warnings=warnings)


def load_mock(name: str, base_dir: str) -> LoadedData:
    key = (name or "").strip()
    if key not in MOCK_FILES:
        raise ValueError(f"Unknown mock dataset '{name}'. Use /api/mock/list.")
    path = os.path.join(base_dir, MOCK_FILES[key])
    if not os.path.exists(path):
        raise ValueError(f"Mock file not found at {path}. Copy CSVs into app/mock_data/.")
    df = pl.read_csv(path)
    return load_trades_from_bytes(df.write_csv().encode("utf-8"), filename="mock.csv")


def _feature_engineer(df: pl.DataFrame) -> pl.DataFrame:
    df = df.with_columns([
        (pl.col("quantity") * pl.col("entry_price")).abs().alias("notional"),
        pl.col("profit_loss").alias("pnl"),
        pl.col("timestamp").dt.date().alias("date"),
        pl.col("timestamp").dt.hour().alias("hour"),
    ])

    # time delta to next trade (seconds) — keep NULL on last row
    dt_to_next = (
        pl.col("timestamp").shift(-1).dt.epoch(time_unit="s")
        - pl.col("timestamp").dt.epoch(time_unit="s")
    ).alias("dt_to_next_s")

    return df.with_columns([
        dt_to_next,
        pl.col("pnl").shift(1).alias("prev_pnl"),
        pl.col("notional").shift(1).alias("prev_notional"),
        pl.col("timestamp").shift(1).alias("prev_ts"),
    ])


def _summary(df: pl.DataFrame) -> Dict[str, Any]:
    rows = df.height
    pnl_total = _to_float(df.select(pl.col("pnl").sum()).item(), default=0.0)
    bal_start = _to_float(df.select(pl.col("balance").first()).item(), default=0.0)
    bal_end = _to_float(df.select(pl.col("balance").last()).item(), default=0.0)
    start_ts = df.select(pl.col("timestamp").first()).item()
    end_ts = df.select(pl.col("timestamp").last()).item()
    return {
        "rows": rows,
        "pnl_total": pnl_total,
        "balance_start": bal_start,
        "balance_end": bal_end,
        "start": str(start_ts),
        "end": str(end_ts),
    }


def _overtrading(df: pl.DataFrame) -> Tuple[Dict[str, Any], float, List[str], List[str], Dict[str, Any]]:
    # trades per day
    daily = df.group_by("date").agg(pl.len().alias("trades")).sort("date")
    tpd_mean = float(daily.select(pl.col("trades").mean()).item())
    tpd_p95 = float(daily.select(pl.col("trades").quantile(0.95)).item())

    # hourly counts (by clock hour)
    hourly = df.group_by("hour").agg(pl.len().alias("trades")).sort("hour")
    top_hour_row = hourly.sort("trades", descending=True).head(1)
    top_hour = int(top_hour_row.select(pl.col("hour")).item())
    top_hour_trades = int(top_hour_row.select(pl.col("trades")).item())

    # burst metric: max trades in any 60-minute bucket
    bursts = (
        df.group_by_dynamic("timestamp", every="60m", period="60m", closed="left")
          .agg(pl.len().alias("trades"))
          .sort("timestamp")
    )
    burst_max = int(bursts.select(pl.col("trades").max()).item())

    # turnover proxy (keep, but log-scale; use abs(avg_balance) so negatives don't create inf)
    total_notional = float(df.select(pl.col("notional").sum()).item())
    avg_balance = float(df.select(pl.col("balance").mean()).item())
    denom = max(1.0, abs(avg_balance))
    turnover = total_notional / denom

    # after large P/L events: quick next trade within 30 min (ONLY when dt_to_next_s is not null)
    abs_pnl = df.select(pl.col("pnl").abs()).to_series()
    thresh = float(abs_pnl.quantile(0.95))
    after_event = df.filter(pl.col("pnl").abs() >= thresh)

    after_event_quick = int(
        after_event.filter(
            pl.col("dt_to_next_s").is_not_null() & (pl.col("dt_to_next_s") <= 1800)
        ).height
    )
    after_event_total = int(after_event.height)
    after_event_rate = (after_event_quick / after_event_total) if after_event_total > 0 else 0.0

    # ---- scoring (log-scale prevents saturation) ----
    # log10(trades/day + 1)
    tpd_log = math.log10(tpd_mean + 1.0)
    # log10(max trades in 60m + 1)
    burst_log = math.log10(burst_max + 1.0)
    # log10(turnover + 1)
    turnover_log = math.log10(turnover + 1.0)

    # Calibrated for your mocks:
    # midpoint tpd_log=3.2 ~ 1600 trades/day
    # midpoint burst_log=2.0 ~ 100 trades/hour
    s1 = _score_from_midpoint(tpd_log, midpoint=3.2, steepness=4.0)
    s2 = _score_from_midpoint(turnover_log, midpoint=4.0, steepness=2.5)
    s3 = _score_from_midpoint(burst_log, midpoint=2.0, steepness=5.0)
    s4 = _score_from_midpoint(after_event_rate, midpoint=0.35, steepness=4.0)

    score = 0.45*s1 + 0.15*s2 + 0.30*s3 + 0.10*s4

    triggers = []
    if tpd_mean >= 2000:
        triggers.append(f"Very high trade frequency: {tpd_mean:.0f} trades/day (p95 {tpd_p95:.0f}).")
    if burst_max >= 120:
        triggers.append(f"Time clustering: up to {burst_max} trades in a 60-minute window.")
    if turnover >= 50000:
        triggers.append(f"High turnover vs balance magnitude: notional/avg_balance ≈ {turnover:.0f}×.")
    if after_event_rate >= 0.4:
        triggers.append(f"Reactive trading: {after_event_rate*100:.0f}% of large P/L events followed by a trade within 30 minutes.")

    recs = []
    daily_cap = int(max(5, math.ceil(tpd_p95 * 0.6)))
    recs.append(f"Set a daily trade cap of {daily_cap} (≈60% of your p95 daily volume).")
    if burst_max >= 80:
        recs.append("Add a cooldown when you place many trades in a short window (e.g., 10–20 minutes).")
    if after_event_rate >= 0.35:
        recs.append("After a large win/loss, enforce a 30-minute pause before the next trade.")

    charts = {
        "daily_trades": [{"date": str(r[0]), "trades": int(r[1])} for r in daily.iter_rows()],
        "hourly_trades": [{"hour": int(r[0]), "trades": int(r[1])} for r in hourly.iter_rows()],
        "burst_60m": [{"start": str(r[0]), "trades": int(r[1])} for r in bursts.iter_rows()],
        "top_hour": {"hour": top_hour, "trades": top_hour_trades},
    }

    metrics = {
        "avg_trades_per_day": tpd_mean,
        "p95_trades_per_day": tpd_p95,
        "turnover_notional_over_abs_avg_balance": turnover,
        "burst_max_trades_in_60m": burst_max,
        "after_large_event_quick_trade_rate": after_event_rate,
        "tpd_log10": tpd_log,
        "burst_log10": burst_log,
        "turnover_log10": turnover_log,
    }

    return metrics, float(score), triggers, recs, charts


def _loss_aversion(df: pl.DataFrame) -> Tuple[Dict[str, Any], float, List[str], List[str], Dict[str, Any]]:
    # Clean series (drop NaNs / nulls defensively)
    pnl_s = df.select(pl.col("pnl")).to_series()
    pnl = [float(x) for x in pnl_s.to_list() if x is not None and math.isfinite(float(x))]

    if not pnl:
        metrics = {
            "win_rate": 0.0,
            "avg_win": 0.0,
            "avg_loss_abs": 0.0,
            "avg_loss_over_avg_win": float("inf"),
            "profit_factor": float("inf"),
            "p95_win": 0.0,
            "p95_loss_abs": 0.0,
            "p95_loss_over_p95_win": float("inf"),
        }
        return metrics, 0.0, ["No valid P/L values found."], ["Upload a file with numeric profit_loss values."], {"pnl_hist": []}

    wins = [x for x in pnl if x > 0]
    losses = [x for x in pnl if x < 0]

    win_rate = (len(wins) / len(pnl)) if pnl else 0.0
    avg_win = (sum(wins) / len(wins)) if wins else 0.0
    avg_loss_abs = (sum([-x for x in losses]) / len(losses)) if losses else 0.0

    sum_wins = sum(wins) if wins else 0.0
    sum_losses_abs = sum([-x for x in losses]) if losses else 0.0
    profit_factor = (sum_wins / sum_losses_abs) if sum_losses_abs > 0 else float("inf")

    ratio = (avg_loss_abs / avg_win) if avg_win > 0 else float("inf")

    # quantiles (safe)
    wins_sorted = sorted(wins)
    losses_abs_sorted = sorted([-x for x in losses])
    def q(arr, qq):
        if not arr:
            return 0.0
        idx = int(round((len(arr)-1) * qq))
        return float(arr[max(0, min(len(arr)-1, idx))])

    p95_win = q(wins_sorted, 0.95)
    p95_loss_abs = q(losses_abs_sorted, 0.95)
    tail_ratio = (p95_loss_abs / p95_win) if p95_win > 0 else float("inf")

    # ✅ Calibration changes:
    # - Use log scaling so 200k-trade datasets don't saturate instantly
    ratio_log = math.log10(ratio + 1.0) if math.isfinite(ratio) else float("inf")
    tail_log = math.log10(tail_ratio + 1.0) if math.isfinite(tail_ratio) else float("inf")
    pf_log = math.log10(profit_factor + 1.0) if math.isfinite(profit_factor) else float("inf")

    # Disposition-style flag: allow slightly lower win-rate than 0.60 to avoid brittle behavior
    disposition_flag = (win_rate >= 0.55 and profit_factor < 1.0)

    s1 = _score_from_midpoint(ratio_log, midpoint=0.35, steepness=8.0)    # ~ratio 1.2–1.5 starts ramping
    s2 = _score_from_midpoint(tail_log, midpoint=0.40, steepness=7.0)
    # Profit factor < 1 increases loss-aversion likelihood (log makes it stable)
    s3 = 0.0 if math.isinf(pf_log) else _score_from_midpoint(1.0 - pf_log, midpoint=0.10, steepness=6.0)
    s4 = 85.0 if disposition_flag else 15.0

    score = 0.45*s1 + 0.30*s2 + 0.15*s3 + 0.10*s4

    triggers: List[str] = []
    if math.isfinite(ratio) and ratio >= 1.3:
        triggers.append(f"Average loss is {ratio:.2f}× your average win.")
    if math.isfinite(tail_ratio) and tail_ratio >= 1.5:
        triggers.append(f"Tail risk: large losses dominate large wins (p95 loss/win ≈ {tail_ratio:.2f}×).")
    if disposition_flag:
        triggers.append(f"Disposition footprint: win rate {win_rate*100:.0f}% with profit factor {profit_factor:.2f}.")

    recs: List[str] = []
    if losses_abs_sorted:
        median_loss_abs = q(losses_abs_sorted, 0.50)
        recs.append(f"Cap losses near your median loss (~{median_loss_abs:.2f}) to prevent tail escalation.")
    recs.append("Require a minimum risk/reward for new trades (e.g., target ≥ 1.5× stop).")
    recs.append("Avoid closing winners early: consider partial take-profit instead of full exits.")

    # histogram (lightweight)
    lo, hi = (min(pnl), max(pnl)) if pnl else (-1.0, 1.0)
    bins = 20
    if lo == hi:
        lo -= 1.0
        hi += 1.0
    step = (hi - lo) / bins
    edges = [lo + i*step for i in range(bins+1)]
    counts = [0]*bins
    for x in pnl:
        idx = int((x - lo) / step)
        if idx == bins:
            idx = bins - 1
        if 0 <= idx < bins:
            counts[idx] += 1

    charts = {
        "pnl_hist": [{"bin_start": float(edges[i]), "bin_end": float(edges[i+1]), "count": int(counts[i])} for i in range(bins)]
    }

    metrics = {
        "win_rate": win_rate,
        "avg_win": avg_win,
        "avg_loss_abs": avg_loss_abs,
        "avg_loss_over_avg_win": ratio,
        "profit_factor": profit_factor,
        "p95_win": p95_win,
        "p95_loss_abs": p95_loss_abs,
        "p95_loss_over_p95_win": tail_ratio,
    }

    return metrics, float(score), triggers, recs, charts


def _revenge_trading(df: pl.DataFrame) -> Tuple[Dict[str, Any], float, List[str], List[str], Dict[str, Any]]:
    # Pull columns safely
    pnl_raw = df.select(pl.col("pnl")).to_series().to_list()
    notional_raw = df.select(pl.col("notional")).to_series().to_list()
    dt_next_raw = df.select(pl.col("dt_to_next_s")).to_series().to_list()

    n = min(len(pnl_raw), len(notional_raw), len(dt_next_raw))
    if n < 50:
        metrics = {
            "size_after_loss_logdiff": 0.0,
            "size_after_streak2_logdiff": 0.0,
            "fast_reentry_diff": 0.0,
            "risk_after_loss_logdiff": 0.0,
            "loss_streak_rate": 0.0,
            "post_loss_vol_spike": 0.0,
        }
        return metrics, 0.0, ["Very few trades; revenge signals may be unstable."], ["Upload more trades."], {}

    import math

    def f(x):
        try:
            x = float(x)
            return x if math.isfinite(x) else None
        except Exception:
            return None

    pnl = [f(p) for p in pnl_raw[:n]]
    notional = [f(x) for x in notional_raw[:n]]
    dt_next = [f(x) for x in dt_next_raw[:n]]  # seconds to next trade

    def quantile(vals: List[float], q: float) -> float:
        v = sorted([x for x in vals if x is not None])
        if not v:
            return 0.0
        idx = int(round((len(v) - 1) * q))
        idx = max(0, min(len(v) - 1, idx))
        return float(v[idx])

    def median(vals: List[float]) -> float:
        return quantile(vals, 0.50)

    def mad(vals: List[float], center: float) -> float:
        v = [abs(x - center) for x in vals if x is not None]
        return float(median(v)) if v else 1e-9

    # ---------- Derived series ----------
    # log size (robust to scale / 200k trades)
    log_next_size_all: List[float] = []
    log_next_size_after_loss: List[float] = []
    log_next_size_after_win: List[float] = []
    log_next_size_after_streak2: List[float] = []

    # timing after loss/win
    dt_after_loss: List[float] = []
    dt_after_win: List[float] = []
    dt_all: List[float] = []

    # risk proxy: abs(pnl)/notional (if meaningful)
    log_risk_after_loss: List[float] = []
    log_risk_after_win: List[float] = []
    log_risk_all: List[float] = []

    streak = 0
    streak2_trades = 0

    for i in range(n - 1):
        pi = pnl[i]
        ni_next = notional[i + 1]
        dti = dt_next[i]
        ni = notional[i]
        pi_next = pnl[i + 1]

        # loss streak counter (for prevalence)
        if pi is not None and pi < 0:
            streak += 1
        else:
            streak = 0
        if streak >= 2:
            streak2_trades += 1

        # size features use NEXT trade's size
        if ni_next is not None and ni_next > 0:
            ln = math.log(ni_next)
            log_next_size_all.append(ln)
            if pi is not None and pi < 0:
                log_next_size_after_loss.append(ln)
                if streak >= 2:
                    log_next_size_after_streak2.append(ln)
            elif pi is not None and pi > 0:
                log_next_size_after_win.append(ln)

        # timing features use dt_to_next after current trade
        if dti is not None and dti >= 0:
            dt_all.append(dti)
            if pi is not None and pi < 0:
                dt_after_loss.append(dti)
            elif pi is not None and pi > 0:
                dt_after_win.append(dti)

        # risk proxy after current trade: abs(pnl)/notional (current trade)
        if pi is not None and ni is not None and ni > 0:
            r = abs(pi) / ni
            if r > 0:
                lr = math.log(r)
                log_risk_all.append(lr)
                if pi < 0:
                    log_risk_after_loss.append(lr)
                elif pi > 0:
                    log_risk_after_win.append(lr)

    loss_streak_rate = streak2_trades / max(1, n)

    # ---------- Robust standardized diffs ----------
    # Sizes
    med_log_next_all = median(log_next_size_all)
    mad_log_next_all = mad(log_next_size_all, med_log_next_all)

    med_log_next_after_loss = median(log_next_size_after_loss)
    med_log_next_after_win = median(log_next_size_after_win)
    med_log_next_after_streak2 = median(log_next_size_after_streak2)

    size_after_loss_logdiff = max(
        0.0,
        (med_log_next_after_loss - med_log_next_after_win) / max(1e-9, mad_log_next_all),
    )
    size_after_streak2_logdiff = max(
        0.0,
        (med_log_next_after_streak2 - med_log_next_all) / max(1e-9, mad_log_next_all),
    )

    # Timing
    med_dt_all = median(dt_all)
    mad_dt_all = mad(dt_all, med_dt_all)
    med_dt_after_loss_s = median(dt_after_loss)
    med_dt_after_win_s = median(dt_after_win)

    # "fast re-entry" means LOWER dt after loss than after win
    fast_reentry_diff = max(
        0.0,
        (med_dt_after_win_s - med_dt_after_loss_s) / max(1e-9, mad_dt_all),
    )

    # Risk
    med_log_risk_all = median(log_risk_all)
    mad_log_risk_all = mad(log_risk_all, med_log_risk_all)
    med_log_risk_after_loss = median(log_risk_after_loss)
    med_log_risk_after_win = median(log_risk_after_win)

    risk_after_loss_logdiff = max(
        0.0,
        (med_log_risk_after_loss - med_log_risk_after_win) / max(1e-9, mad_log_risk_all),
    )

    # ---------- NEW: volatility spike after losses (works even if size/timing flat) ----------
    next_pnl_after_loss: List[float] = []
    next_pnl_after_win: List[float] = []

    for i in range(n - 1):
        if pnl[i] is None or pnl[i + 1] is None:
            continue
        if pnl[i] < 0:
            next_pnl_after_loss.append(float(pnl[i + 1]))
        elif pnl[i] > 0:
            next_pnl_after_win.append(float(pnl[i + 1]))

    def iqr(vals: List[float]) -> float:
        if not vals:
            return 0.0
        v = sorted(vals)
        q1 = quantile(v, 0.25)
        q3 = quantile(v, 0.75)
        return float(q3 - q1)

    abs_loss = [abs(x) for x in next_pnl_after_loss]
    abs_win = [abs(x) for x in next_pnl_after_win]
    iqr_loss = iqr(abs_loss)
    iqr_win = iqr(abs_win)
    vol_ratio = (iqr_loss / max(1e-9, iqr_win)) if (iqr_loss > 0 or iqr_win > 0) else 1.0
    post_loss_vol_spike = max(0.0, vol_ratio - 1.0)

    # ---------- Score mapping ----------
    # Assumes you already have this helper in your file:
    # def _score_from_midpoint(x: float, midpoint: float, steepness: float) -> float: ...
    s_size_loss = _score_from_midpoint(size_after_loss_logdiff, midpoint=0.35, steepness=10.0)
    s_size_stk2 = _score_from_midpoint(size_after_streak2_logdiff, midpoint=0.30, steepness=10.0)
    s_fast = _score_from_midpoint(fast_reentry_diff, midpoint=0.30, steepness=10.0)
    s_risk = _score_from_midpoint(risk_after_loss_logdiff, midpoint=0.30, steepness=10.0)
    s_streak = _score_from_midpoint(loss_streak_rate, midpoint=0.22, steepness=10.0)
    s_vol = _score_from_midpoint(post_loss_vol_spike, midpoint=0.35, steepness=10.0)

    # Make VOL spike matter, but not dominate if absent
    score = (
        0.18 * s_size_loss
        + 0.12 * s_size_stk2
        + 0.15 * s_fast
        + 0.10 * s_risk
        + 0.15 * s_streak
        + 0.30 * s_vol
    )

    # ---------- Output ----------
    metrics: Dict[str, Any] = {
        "size_after_loss_logdiff": float(size_after_loss_logdiff),
        "size_after_streak2_logdiff": float(size_after_streak2_logdiff),
        "fast_reentry_diff": float(fast_reentry_diff),
        "risk_after_loss_logdiff": float(risk_after_loss_logdiff),
        "loss_streak_rate": float(loss_streak_rate),
        "post_loss_vol_spike": float(post_loss_vol_spike),
    }

    triggers: List[str] = []
    if post_loss_vol_spike >= 0.35:
        triggers.append("Volatility spikes after losses: next-trade outcomes become materially more erratic after a loss.")
    if size_after_loss_logdiff >= 0.35:
        triggers.append("Position sizing increases after losses compared to after wins.")
    if fast_reentry_diff >= 0.30:
        triggers.append("Faster re-entry after losses than after wins.")
    if risk_after_loss_logdiff >= 0.30:
        triggers.append("Risk intensity increases after losses.")
    if loss_streak_rate >= 0.22:
        triggers.append(f"Loss streaks are common: {loss_streak_rate*100:.0f}% of trades occur during 2+ loss streaks.")

    recs: List[str] = [
        "After any loss, cap the next 1–3 trades to your typical size (no ‘make-it-back’ sizing).",
        "After 2 consecutive losses, force a cooldown + require a written rule-based entry rationale.",
        "Add a hard rule: position size must not increase until you’ve had 1 planned (rule-following) trade.",
    ]

    charts: Dict[str, Any] = {
        "sizes": {
            "median_log_next_all": float(med_log_next_all),
            "median_log_next_after_loss": float(med_log_next_after_loss),
            "median_log_next_after_win": float(med_log_next_after_win),
            "median_log_next_after_streak2": float(med_log_next_after_streak2),
            "mad_log_next_all": float(mad_log_next_all),
        },
        "timing": {
            "median_dt_after_loss_s": float(med_dt_after_loss_s),
            "median_dt_after_win_s": float(med_dt_after_win_s),
            "mad_dt_s": float(mad_dt_all),
        },
        "risk": {
            "median_log_risk_after_loss": float(med_log_risk_after_loss),
            "median_log_risk_after_win": float(med_log_risk_after_win),
            "mad_log_risk": float(mad_log_risk_all),
        },
        "volatility": {
            "iqr_abs_next_pnl_after_loss": float(iqr_loss),
            "iqr_abs_next_pnl_after_win": float(iqr_win),
            "vol_ratio": float(vol_ratio),
        },
        "streaks": {"loss_streak_rate": float(loss_streak_rate)},
    }

    return metrics, float(score), triggers, recs, charts


def analyze(df_raw: pl.DataFrame) -> Tuple[Dict[str, Any], Dict[str, Any], List[str]]:
    warnings: List[str] = []
    df = _feature_engineer(df_raw)

    if df.height < 5:
        warnings.append("Very few trades; bias signals may be unstable.")
    if _to_float(df.select(pl.col("balance").min()).item(), default=0.0) <= 0:
        warnings.append("Balance contains non-positive values; turnover metrics may be distorted.")

    summary = _summary(df)

    ot_metrics, ot_score, ot_triggers, ot_recs, ot_charts = _overtrading(df)
    la_metrics, la_score, la_triggers, la_recs, la_charts = _loss_aversion(df)
    rv_metrics, rv_score, rv_triggers, rv_recs, rv_charts = _revenge_trading(df)

    biases = {
        "overtrading": {
            "score": float(_to_float(ot_score, 0.0)),
            "level": _level(ot_score),
            "metrics": ot_metrics,
            "triggers": ot_triggers[:5],
            "recommendations": ot_recs[:5],
            "charts": ot_charts,
        },
        "loss_aversion": {
            "score": float(_to_float(la_score, 0.0)),
            "level": _level(la_score),
            "metrics": la_metrics,
            "triggers": la_triggers[:5],
            "recommendations": la_recs[:5],
            "charts": la_charts,
        },
        "revenge_trading": {
            "score": float(_to_float(rv_score, 0.0)),
            "level": _level(rv_score),
            "metrics": rv_metrics,
            "triggers": rv_triggers[:5],
            "recommendations": rv_recs[:5],
            "charts": rv_charts,
        },
    }

    return summary, biases, warnings