import { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import type { Trade } from "../context/DataContext";
import {
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Hash,
  ArrowLeft,
  FileText,
  ChevronRight,
  Activity,
  AlertTriangle,
  X,
  Loader2,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TradeJournal() {
  const { dataVersion } = useData();

  // DB State
  const [dbTrades, setDbTrades] = useState<Trade[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Local State
  const [selectedSource, setSelectedFile] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Form State
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<"Buy" | "Sell">("Buy");
  const [qty, setQty] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchTrades();
    fetchSources();
  }, [page, dataVersion, selectedSource]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      // Build Query
      let url = `http://localhost:8000/api/trades?page=${page}&limit=50`;
      if (selectedSource)
        url += `&source=${encodeURIComponent(selectedSource)}`;

      const res = await fetch(url);
      const data = await res.json();
      setDbTrades(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/sources");
      const data = await res.json();
      setSources(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Manual entry Logic (Should ideally POST to backend)
    alert(
      "Manual entry requires backend endpoint update. For now, please upload a CSV.",
    );
  };

  return (
    <div className="h-screen bg-black text-white p-8 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Trade Journal</h1>
              <p className="text-muted text-sm">
                {selectedSource
                  ? `Viewing: ${selectedSource}`
                  : "Viewing All Trades"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1 hover:text-white text-muted disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-muted">
              Page {page} / {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1 hover:text-white text-muted disabled:opacity-30"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
          {/* LEFT SIDEBAR */}
          <div className="flex flex-col gap-6 h-full overflow-hidden">
            {/* QUICK ADD */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shrink-0">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Plus size={16} className="text-green-500" /> Quick Add
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-green-500 outline-none"
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-green-500 outline-none text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                >
                  Add Record
                </button>
              </form>
            </div>

            {/* DATA SOURCES */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex-1 flex flex-col overflow-hidden">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 shrink-0">
                <FileText size={18} className="text-[#DC143C]" /> Data Sources
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {sources.length === 0 ? (
                  <p className="text-sm text-muted italic">No files found.</p>
                ) : (
                  sources.map((file) => (
                    <button
                      key={file}
                      onClick={() =>
                        setSelectedFile(selectedSource === file ? null : file)
                      }
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedSource === file ? "bg-[#DC143C]/10 border-[#DC143C] text-white" : "bg-white/5 border-white/5 text-muted hover:bg-white/10"}`}
                    >
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {file}
                      </span>
                      <ChevronRight
                        size={16}
                        className={
                          selectedSource === file
                            ? "text-[#DC143C]"
                            : "opacity-50"
                        }
                      />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: TABLE */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col relative h-full">
            <div className="p-6 border-b border-white/10 bg-[#0a0a0a] shrink-0">
              <h2 className="font-semibold text-lg">Trade Records</h2>
            </div>
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#DC143C]" />
                </div>
              ) : (
                <table className="w-full text-left text-sm text-muted">
                  <thead className="bg-[#0a0a0a] text-xs uppercase tracking-wider text-white font-medium sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 bg-[#0a0a0a]">Date</th>
                      <th className="px-6 py-4 bg-[#0a0a0a]">Symbol</th>
                      <th className="px-6 py-4 bg-[#0a0a0a]">Side</th>
                      <th className="px-6 py-4 bg-[#0a0a0a] text-right">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dbTrades.map((trade) => (
                      <tr
                        key={trade.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedTrade(trade)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(
                            trade.entry_date || "",
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {trade.symbol}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${trade.type?.toLowerCase() === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                          >
                            {trade.type}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-bold ${trade.pl >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          ${trade.pl}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
