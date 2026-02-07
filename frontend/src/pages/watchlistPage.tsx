import { useEffect, useMemo, useState } from "react";

type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: string;
};



const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "GOOGL"];

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function WatchlistPage() {
  const [query, setQuery] = useState("");
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);

  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const visibleSymbols = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return symbols;
    return symbols.filter((s) => s.includes(q));
  }, [query, symbols]);

  async function fetchQuotes(list: string[]) {
    if (list.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(list.join(","))}`);
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.error ? String(body.error) : `HTTP ${res.status}`);
      }

      const data = body as { quotes: Quote[] };

      setQuotes((prev) => {
        const next = { ...prev };
        for (const q of data.quotes || []) next[q.symbol] = q;
        return next;
      });

      setLastUpdated(new Date().toISOString());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotes(symbols);
    const id = window.setInterval(() => fetchQuotes(symbols), 8000);
    return () => window.clearInterval(id);
  }, [symbols]);

  function addSymbol() {
    const s = query.trim().toUpperCase();
    if (!s) return;
    if (!/^[A-Z.\-]{1,10}$/.test(s)) {
      setError("Invalid symbol format.");
      return;
    }
    setSymbols((prev) => (prev.includes(s) ? prev : [s, ...prev]));
    setQuery("");
  }

useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/watch?symbols=${encodeURIComponent(symbols.join(","))}`, {
    signal: controller.signal,
  }).catch((err) => {
    if (err?.name !== "AbortError") console.error("watch register failed", err);
  });

  return () => controller.abort();
}, [symbols]);

  function removeSymbol(symbol: string) {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
    setQuotes((prev) => {
      const next = { ...prev };
      delete next[symbol];
      return next;
    });
  }

  return (
    <section className="min-h-screen bg-[#f7f7f8] text-black dark:bg-[#0b0f14] dark:text-white">
      <div className="mx-auto min-h-screen max-w-[1400px] px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Watchlist</h1>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              Updates every ~8 seconds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or add symbol (e.g. AAPL)"
              className="w-full min-w-[260px] rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/40 focus:border-[#DC143C]/50 focus:shadow-[0_0_0_3px_rgba(220,20,60,0.12)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
            />
            <button
              type="button"
              onClick={addSymbol}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/80 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-black/50 dark:text-white/50">
          <div>
            {loading ? "Updating…" : "Idle"}
            {lastUpdated ? ` • Last updated: ${new Date(lastUpdated).toLocaleTimeString()}` : ""}
            {error ? ` • Error: ${error}` : ""}
          </div>
          <div>Symbols: {symbols.length}</div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-5 ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10">
          <div className="grid grid-cols-12 bg-black/5 px-4 py-3 text-xs font-semibold text-black/70 dark:bg-white/5 dark:text-white/70">
            <div className="col-span-3">Symbol</div>
            <div className="col-span-3">Price</div>
            <div className="col-span-4">Change</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="divide-y divide-black/10 dark:divide-white/10">
            {visibleSymbols.map((s) => {
              const q = quotes[s];
              const up = (q?.change ?? 0) >= 0;
              return (
                <div key={s} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
                  <div className="col-span-3 font-semibold">{s}</div>
                  <div className="col-span-3">{q ? fmtMoney(q.price) : "—"}</div>
                  <div className={`col-span-4 ${up ? "text-emerald-400" : "text-rose-400"}`}>
                    {q
                      ? `${up ? "+" : ""}${q.change.toFixed(2)} (${up ? "+" : ""}${q.changePercent.toFixed(2)}%)`
                      : "—"}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSymbol(s)}
                      className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {visibleSymbols.length === 0 && (
              <div className="px-4 py-8 text-sm text-black/60 dark:text-white/60">
                No matches.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
