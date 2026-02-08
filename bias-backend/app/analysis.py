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


def _score_from_midpoint(value: Any, midpoint: float, steepness: float) -> float:
    """
    Maps value to 0..100 using sigmoid centered at midpoint.
    steepness ~ how quickly it ramps.
    """
    v = _to_float(value, default=float("nan"))
    if not math.isfinite(v):
        return 0.0
    return float(100.0 * _sigmoid((v - midpoint) * steepness))


def _level(score: Any) -> str:
    s = _to_float(score, default=0.0)
    if s >= 80:
        return "high"
    if s >= 50:
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
    df = df.with_columns(
        [
            (pl.col("quantity") * pl.col("entry_price")).abs().alias("notional"),
            pl.col("profit_loss").alias("pnl"),
            pl.col("timestamp").dt.date().alias("date"),
            pl.col("timestamp").dt.hour().alias("hour"),
        ]
    )

    # Polars-version-safe dt-to-next in seconds + NULL-safe
    dt_to_next = (
        pl.col("timestamp").shift(-1).dt.epoch(time_unit="s")
        - pl.col("timestamp").dt.epoch(time_unit="s")
    ).fill_null(0.0).alias("dt_to_next_s")

    return df.with_columns(
        [
            dt_to_next,
            pl.col("pnl").shift(1).alias("prev_pnl"),
            pl.col("notional").shift(1).alias("prev_notional"),
            pl.col("timestamp").shift(1).alias("prev_ts"),
        ]
    )


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
    daily = df.group_by("date").agg(pl.len().alias("trades")).sort("date")

    tpd_mean = _to_float(daily.select(pl.col("trades").mean()).item(), default=0.0)
    tpd_p95 = _to_float(daily.select(pl.col("trades").quantile(0.95)).item(), default=0.0)

    hourly = df.group_by("hour").agg(pl.len().alias("trades")).sort("hour")
    top_hour_row = hourly.sort("trades", descending=True).head(1)

    top_hour = _to_int(top_hour_row.select(pl.col("hour")).item(), default=0)
    top_hour_trades = _to_int(top_hour_row.select(pl.col("trades")).item(), default=0)

    total_notional = _to_float(df.select(pl.col("notional").sum()).item(), default=0.0)
    avg_balance = _to_float(df.select(pl.col("balance").mean()).item(), default=0.0)
    turnover = (total_notional / avg_balance) if avg_balance > 0 else float("inf")

    bursts = (
        df.group_by_dynamic("timestamp", every="60m", period="60m", closed="left")
        .agg(pl.len().alias("trades"))
        .sort("timestamp")
    )
    burst_max = _to_int(bursts.select(pl.col("trades").max()).item(), default=0)

    abs_pnl = df.select(pl.col("pnl").abs()).to_series()
    thresh = _to_float(abs_pnl.quantile(0.95), default=0.0)
    after_event = df.filter(pl.col("pnl").abs() >= thresh)

    after_event_quick = int(after_event.filter(pl.col("dt_to_next_s") <= 1800).height)
    after_event_total = int(after_event.height)
    after_event_rate = (after_event_quick / after_event_total) if after_event_total > 0 else 0.0

    s1 = _score_from_midpoint(tpd_mean, midpoint=8.0, steepness=0.25)
    s2 = _score_from_midpoint(turnover, midpoint=5.0, steepness=0.35)
    s3 = _score_from_midpoint(burst_max, midpoint=6.0, steepness=0.30)
    s4 = _score_from_midpoint(after_event_rate, midpoint=0.35, steepness=4.0)
    score = float(0.30 * s1 + 0.25 * s2 + 0.25 * s3 + 0.20 * s4)

    triggers: List[str] = []
    if tpd_mean >= 10:
        triggers.append(f"High average trade frequency: {tpd_mean:.1f} trades/day (p95 {tpd_p95:.0f}).")
    if burst_max >= 8:
        triggers.append(f"Time clustering: up to {burst_max} trades in a 60-minute window.")
    if turnover >= 6:
        triggers.append(f"High turnover vs balance: notional/avg_balance ≈ {turnover:.1f}×.")
    if after_event_rate >= 0.4:
        triggers.append(
            f"Reactive trading: {after_event_rate*100:.0f}% of large P/L events followed by a trade within 30 minutes."
        )

    recs: List[str] = []
    daily_cap = int(max(3, math.ceil(tpd_p95 * 0.8))) if tpd_p95 > 0 else 3
    recs.append(f"Set a daily trade cap of {daily_cap} (≈80% of your p95 daily volume).")
    if burst_max >= 6:
        recs.append("Add a 10–20 minute cooldown when you place >3 trades within an hour.")
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
        "turnover_notional_over_avg_balance": turnover,
        "burst_max_trades_in_60m": burst_max,
        "after_large_event_quick_trade_rate": after_event_rate,
    }
    return metrics, score, triggers, recs, charts


def _loss_aversion(df: pl.DataFrame) -> Tuple[Dict[str, Any], float, List[str], List[str], Dict[str, Any]]:
    wins = df.filter(pl.col("pnl") > 0).select(pl.col("pnl")).to_series()
    losses = df.filter(pl.col("pnl") < 0).select(pl.col("pnl")).to_series()

    win_rate = float((wins.len() / df.height) if df.height else 0.0)
    avg_win = _to_float(wins.mean(), default=0.0) if wins.len() else 0.0
    avg_loss_abs = _to_float(losses.abs().mean(), default=0.0) if losses.len() else 0.0

    sum_wins = _to_float(wins.sum(), default=0.0) if wins.len() else 0.0
    sum_losses_abs = _to_float(losses.abs().sum(), default=0.0) if losses.len() else 0.0
    profit_factor = (sum_wins / sum_losses_abs) if sum_losses_abs > 0 else float("inf")

    ratio = (avg_loss_abs / avg_win) if avg_win > 0 else float("inf")

    p95_win = _to_float(wins.quantile(0.95), default=0.0) if wins.len() else 0.0
    p95_loss_abs = _to_float(losses.abs().quantile(0.95), default=0.0) if losses.len() else 0.0
    tail_ratio = (p95_loss_abs / p95_win) if p95_win > 0 else float("inf")

    s1 = _score_from_midpoint(ratio, midpoint=1.2, steepness=2.2)
    s2 = _score_from_midpoint(tail_ratio, midpoint=1.4, steepness=1.8)
    disposition_flag = (win_rate >= 0.6 and profit_factor < 1.0)
    s3 = 85.0 if disposition_flag else 20.0
    score = float(0.50 * s1 + 0.35 * s2 + 0.15 * s3)

    triggers: List[str] = []
    if math.isfinite(ratio) and ratio >= 1.3:
        triggers.append(f"Average loss is {ratio:.2f}× your average win.")
    if math.isfinite(tail_ratio) and tail_ratio >= 1.5:
        triggers.append(f"Tail risk: your large losses dominate large wins (p95 loss/win ≈ {tail_ratio:.2f}×).")
    if disposition_flag:
        triggers.append(f"High win rate ({win_rate*100:.0f}%) but weak expectancy (profit factor {profit_factor:.2f}).")

    recs: List[str] = []
    if losses.len():
        median_loss_abs = _to_float(losses.abs().median(), default=0.0)
        recs.append(
            f"Adopt a stop-loss discipline: cap losses near your median loss (~{median_loss_abs:.2f}) before the tail grows."
        )
    if avg_win > 0 and avg_loss_abs > 0:
        recs.append("Require a minimum risk/reward for new trades (e.g., target ≥ 1.5× stop).")
    recs.append("Do not close winners early: consider partial take-profit instead of full exits.")

    pnl = df.select(pl.col("pnl")).to_series().to_list()
    if pnl:
        lo, hi = min(pnl), max(pnl)
    else:
        lo, hi = -1, 1
    bins = 20
    if lo == hi:
        lo -= 1
        hi += 1
    step = (hi - lo) / bins
    edges = [lo + i * step for i in range(bins + 1)]
    counts = [0] * bins
    for x in pnl:
        idx = int((x - lo) / step)
        if idx == bins:
            idx = bins - 1
        if 0 <= idx < bins:
            counts[idx] += 1

    charts = {
        "pnl_hist": [
            {"bin_start": float(edges[i]), "bin_end": float(edges[i + 1]), "count": int(counts[i])}
            for i in range(bins)
        ]
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
    return metrics, score, triggers, recs, charts


def _revenge_trading(df: pl.DataFrame) -> Tuple[Dict[str, Any], float, List[str], List[str], Dict[str, Any]]:
    pnl = df.select(pl.col("pnl")).to_series().to_list()
    notional = df.select(pl.col("notional")).to_series().to_list()
    dt_next = df.select(pl.col("dt_to_next_s")).to_series().to_list()

    n = len(pnl)
    after_loss_indices = [i for i in range(1, n) if pnl[i - 1] < 0]
    base_indices = list(range(1, n))

    def median(vals: List[float]) -> float:
        if not vals:
            return 0.0
        s = sorted(vals)
        m = len(s) // 2
        return float(s[m]) if len(s) % 2 == 1 else float((s[m - 1] + s[m]) / 2)

    after_loss_notional = [_to_float(notional[i], 0.0) for i in after_loss_indices]
    base_notional = [_to_float(notional[i], 0.0) for i in base_indices]
    med_after = median(after_loss_notional)
    med_base = median(base_notional)
    size_jump = (med_after / med_base) if med_base > 0 else float("inf")

    # Use only positive dt values to avoid 0s (last row / missing-next)
    loss_trade_indices = [i for i in range(n - 1) if pnl[i] < 0 and _to_float(dt_next[i], 0.0) > 0]
    base_trade_indices = [i for i in range(n - 1) if _to_float(dt_next[i], 0.0) > 0]

    dt_after_loss = [_to_float(dt_next[i], 0.0) for i in loss_trade_indices]
    dt_base = [_to_float(dt_next[i], 0.0) for i in base_trade_indices]
    med_dt_after = median(dt_after_loss)
    med_dt_base = median(dt_base)
    speedup = (med_dt_base / med_dt_after) if med_dt_after > 0 else 0.0

    streak = 0
    escalations = 0
    streak_events = 0
    baseline_notional = median(base_notional)

    for i in range(n):
        if pnl[i] < 0:
            streak += 1
        else:
            streak = 0
        if streak >= 2:
            streak_events += 1
            if baseline_notional > 0 and _to_float(notional[i], 0.0) >= 1.5 * baseline_notional:
                escalations += 1
    streak_escalation_rate = (escalations / streak_events) if streak_events > 0 else 0.0

    s1 = _score_from_midpoint(size_jump, midpoint=1.2, steepness=2.0)
    s2 = _score_from_midpoint(speedup, midpoint=1.25, steepness=2.5)
    s3 = _score_from_midpoint(streak_escalation_rate, midpoint=0.25, steepness=4.5)
    score = float(0.45 * s1 + 0.30 * s2 + 0.25 * s3)

    triggers: List[str] = []
    if math.isfinite(size_jump) and size_jump >= 1.25:
        triggers.append(f"Position sizing increases after losses (median notional {size_jump:.2f}× baseline).")
    if speedup >= 1.3:
        triggers.append(f"You trade faster after losses (median time-to-next-trade speed-up {speedup:.2f}×).")
    if streak_events >= 3 and streak_escalation_rate >= 0.3:
        triggers.append(
            f"Loss-streak escalation: {streak_escalation_rate*100:.0f}% of 2+ loss-streak trades are ≥1.5× baseline size."
        )

    recs: List[str] = []
    recs.append("After any loss, enforce a 15–30 minute cooldown before the next trade.")
    if math.isfinite(size_jump) and size_jump >= 1.2:
        recs.append("After a loss, cap the next 3 trades at ≤ your baseline median position size.")
    if streak_events >= 2:
        recs.append("If you hit 2 losses in a row, pause trading and write a 1-sentence reason for the next trade (anti-impulse).")

    charts = {
        "size_jump": {"median_after_loss": med_after, "median_baseline": med_base, "ratio": size_jump},
        "speed": {"median_dt_after_loss_s": med_dt_after, "median_dt_baseline_s": med_dt_base, "speedup_ratio": speedup},
        "streak": {"events": streak_events, "escalations": escalations, "rate": streak_escalation_rate},
    }

    metrics = {
        "size_jump_ratio": size_jump,
        "speedup_ratio": speedup,
        "loss_streak_escalation_rate": streak_escalation_rate,
        "loss_streak_events": streak_events,
    }
    return metrics, score, triggers, recs, charts


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