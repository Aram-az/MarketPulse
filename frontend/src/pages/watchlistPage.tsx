import { useEffect, useMemo, useState } from "react";
import TradingViewMiniChart from "../components/TradingViewMiniChart";
import { useTheme } from "../theme/ThemeContext";

const DEFAULT_SYMBOLS = [
   "TSX:RY",
  "TSX:TD",
  "TSX:BNS",
  "TSX:BMO",
  "TSX:CM",
  "NASDAQ:AMZN",
  "NASDAQ:META",
  "NASDAQ:AVGO",
  "NASDAQ:COST",
];


export default function WatchlistPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  const [query, setQuery] = useState("");
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [error, setError] = useState<string | null>(null);

  const visibleSymbols = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return symbols;
    return symbols.filter((s) => s.includes(q));
  }, [query, symbols]);

  function addSymbol() {
    const raw = query.trim().toUpperCase();
    if (!raw) return;

    // allow either "AAPL" or "NASDAQ:AAPL"
    const normalized = raw.includes(":") ? raw : `NASDAQ:${raw}`;

    if (!/^[A-Z0-9.\-]{1,15}:[A-Z0-9.\-]{1,15}$/.test(normalized)) {
      setError("Use format EXCHANGE:SYMBOL (e.g. NASDAQ:AAPL) or just SYMBOL.");
      return;
    }

    setSymbols((prev) => (prev.includes(normalized) ? prev : [normalized, ...prev]));
    setQuery("");
    setError(null);
  }

  function removeSymbol(symbol: string) {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
  }

  return (
    <section className="min-h-screen bg-[#0b0f14] text-white">
      <div className="mx-auto min-h-screen max-w-[1400px] px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Watchlist</h1>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Add symbol (AAPL or NASDAQ:AAPL)"
              className="w-full min-w-[260px] rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)]"
            />
            <button
              type="button"
              onClick={addSymbol}
              className="btn-futuristic-red rounded-xl px-4 py-3 text-sm font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-rose-300">{error}</div>}

        <div className="mt-6 flex items-center justify-between text-xs text-white/50">
          <div>Symbols: {symbols.length}</div>
          <div>Search filter: {query.trim() ? query.trim().toUpperCase() : "—"}</div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleSymbols.map((s) => (
            <div key={s} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{s}</div>
                <button
                  type="button"
                  onClick={() => removeSymbol(s)}
                  className="rounded-lg border border-white/10 bg-black px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
                >
                  Remove
                </button>
              </div>

              <TradingViewMiniChart symbol={s} height={260} />
            </div>
          ))}

          {visibleSymbols.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-black p-6 text-sm text-white/60">
              No matches.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
