import { useState, useMemo } from "react";
import { useData, type Trade } from "../context/DataContext";
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
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TradeJournal() {
  // Now using 'trades' from context, which is populated by Dashboard
  const { trades, addTrade, removeFile, clearData, analyses } = useData();

  const [selectedSource, setSelectedFile] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const files = useMemo(() => {
    const sources = new Set(trades.map((t) => t.source || "Manual Entry"));
    return Array.from(sources);
  }, [trades]);

  const activeTrades = useMemo(() => {
    if (!selectedSource) return trades;
    return trades.filter(
      (t) => (t.source || "Manual Entry") === selectedSource,
    );
  }, [trades, selectedSource]);

  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<"Buy" | "Sell">("Buy");
  const [qty, setQty] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !qty || !entryPrice || !exitPrice) return;
    const q = parseFloat(qty);
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    let pl = type === "Buy" ? (exit - entry) * q : (entry - exit) * q;

    addTrade({
      id: Date.now(),
      symbol: symbol.toUpperCase(),
      type,
      price: `$${entry.toFixed(2)}`,
      quantity: q,
      entryPrice: entry,
      exitPrice: exit,
      pl: pl,
      plText: pl >= 0 ? `+$${pl.toFixed(2)}` : `-$${Math.abs(pl).toFixed(2)}`,
      date: date,
      status: pl >= 0 ? "Good" : "Risk",
      bias: "Manual Entry",
      source: "Manual Entry",
    });
    setSymbol("");
    setQty("");
    setEntryPrice("");
    setExitPrice("");
  };

  const currentAnalysis =
    selectedTrade && selectedTrade.source
      ? analyses[selectedTrade.source]
      : null;

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
          {trades.length > 0 && (
            <button
              onClick={clearData}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
          <div className="flex flex-col gap-6 h-full overflow-hidden">
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
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-green-500 outline-none"
                  />
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-green-500 outline-none text-white"
                  >
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Entry"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-green-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Exit"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-green-500 outline-none"
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
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex-1 flex flex-col overflow-hidden">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 shrink-0">
                <FileText size={18} className="text-[#DC143C]" /> Data Sources
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {files.length === 0 ? (
                  <p className="text-sm text-muted italic">
                    No files imported.
                  </p>
                ) : (
                  files.map((file) => (
                    <div key={file} className="flex gap-2">
                      <button
                        onClick={() =>
                          setSelectedFile(selectedSource === file ? null : file)
                        }
                        className={`flex-1 flex items-center justify-between p-3 rounded-xl border transition-all ${selectedSource === file ? "bg-[#DC143C]/10 border-[#DC143C] text-white" : "bg-white/5 border-white/5 text-muted hover:bg-white/10"}`}
                      >
                        <span className="text-sm font-medium truncate max-w-[150px]">
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
                      <button
                        onClick={() => removeFile(file)}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-muted hover:text-red-400 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col relative h-full">
            <div className="p-6 border-b border-white/10 bg-[#0a0a0a] shrink-0">
              <h2 className="font-semibold text-lg">
                {selectedSource
                  ? `Records from: ${selectedSource}`
                  : "All Trades"}
              </h2>
            </div>
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              {activeTrades.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted">
                  <p>No trades to display.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-muted">
                  <thead className="bg-[#0a0a0a] text-xs uppercase tracking-wider text-white font-medium sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 bg-[#0a0a0a]">Date</th>
                      <th className="px-6 py-4 bg-[#0a0a0a]">Symbol</th>
                      <th className="px-6 py-4 bg-[#0a0a0a]">Side</th>
                      <th className="px-6 py-4 bg-[#0a0a0a] text-right">P/L</th>
                      <th className="px-6 py-4 bg-[#0a0a0a] text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeTrades.map((trade) => (
                      <tr
                        key={trade.id}
                        className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedTrade?.id === trade.id ? "bg-white/10" : ""}`}
                        onClick={() => setSelectedTrade(trade)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {trade.date}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {trade.symbol}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${trade.type === "Buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                          >
                            {trade.type}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-bold ${trade.pl >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {trade.plText}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[10px] text-[#DC143C] border border-[#DC143C]/30 px-2 py-1 rounded">
                            View Analysis
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {selectedTrade && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
                <div className="w-[450px] h-full bg-[#111] border-l border-white/10 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-white">
                      Trade Insight
                    </h3>
                    <button
                      onClick={() => setSelectedTrade(null)}
                      className="text-muted hover:text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-white">
                        {selectedTrade.symbol}
                      </span>
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded ${selectedTrade.type === "Buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {selectedTrade.type}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-sm text-muted">Net P/L</span>
                      <span
                        className={`text-xl font-bold ${selectedTrade.pl >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {selectedTrade.plText}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[#DC143C] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity size={16} /> AI Bias Detection
                    </h4>
                    {currentAnalysis ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-[#DC143C]/20 bg-[#DC143C]/5">
                          <p className="text-sm text-gray-400 leading-relaxed">
                            Session Risk:{" "}
                            <span className="text-white font-bold">
                              {currentAnalysis.riskType}
                            </span>
                          </p>
                        </div>
                        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/10">
                          <p className="text-xs text-muted leading-relaxed">
                            {currentAnalysis.insightBody}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
                        <p className="text-sm text-muted">
                          No analysis available.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
