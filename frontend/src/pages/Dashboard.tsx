import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import ChatBot from "../components/ChatBot";
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Download,
  MoreHorizontal,
  UploadCloud,
  Clock,
  Activity,
  MessageSquare,
  X,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  ShieldCheck,
  FileText,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  // --- STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);

  // 1. INITIALIZE WITH EMPTY STATE
  const [trades, setTrades] = useState<any[]>([]);
  const [stats, setStats] = useState({
    netPL: "$0.00",
    winRate: "0%",
    riskReward: "0:0",
    tradesPerHour: "0",
    biasScore: "None",
  });

  const dashboardFileRef = useRef<HTMLInputElement>(null);

  // Helper to check if we have data to show
  const hasData = trades.length > 0;

  const handleImportClick = () => {
    dashboardFileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportedFile(file);

      // 2. PARSE CSV ON UPLOAD
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCSV(text);
        setIsChatOpen(true); // Open AI Coach after processing
      };
      reader.readAsText(file);
    }
  };

  const processCSV = (csvText: string) => {
    try {
      const lines = csvText.split("\n").slice(1);
      const newTrades = lines
        .filter((line) => line.trim() !== "")
        .map((line, index) => {
          const [symbol, type, price, plRaw] = line.split(",");
          const pl = parseFloat(plRaw);
          return {
            id: index,
            symbol: symbol || "UNK",
            type: type || "Buy",
            price: price || "$0.00",
            pl: pl,
            plText: pl >= 0 ? `+$${pl}` : `-$${Math.abs(pl)}`,
            duration: "Calculating...",
            status: pl < 0 ? "Risk" : "Good",
            bias: "Analyzing...",
          };
        });

      if (newTrades.length > 0) {
        setTrades(newTrades);

        // Simple Stats Calculation
        const totalPL = newTrades.reduce((acc, t) => acc + t.pl, 0);
        const wins = newTrades.filter((t) => t.pl > 0).length;
        const winRate = ((wins / newTrades.length) * 100).toFixed(1) + "%";

        setStats({
          netPL: totalPL >= 0 ? `+$${totalPL}` : `-$${Math.abs(totalPL)}`,
          winRate: winRate,
          riskReward: "1:1.5",
          tradesPerHour: "8.2",
          biasScore: "High",
        });
      }
    } catch (err) {
      console.error("Error parsing CSV:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-[#DC143C] selection:text-white relative">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[rgba(255,255,255,0.1)] flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
          <div className="w-8 h-8 bg-gradient-to-br from-[#DC143C] to-black rounded-lg flex items-center justify-center mr-3">
            <span className="font-bold text-lg">M</span>
          </div>
          <span className="font-bold text-xl tracking-tight">MarketPulse</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Overview"
            active
          />
          <SidebarItem
            icon={<FileSpreadsheet size={20} />}
            label="Trade Journal"
          />
          <SidebarItem icon={<PieChart size={20} />} label="Bias Reports" />
          <SidebarItem icon={<ShieldCheck size={20} />} label="Action Plan" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between px-8 bg-black/50 backdrop-blur-sm sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-semibold">Behavioral Dashboard</h1>
            <p className="text-xs text-muted">
              Welcome back, {user?.name || "Trader"}.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={dashboardFileRef}
              hidden
              accept=".csv,.xlsx"
              onChange={handleFileChange}
            />
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              <UploadCloud size={16} />
              <span>Import Data</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-800 pb-24">
          {!hasData ? (
            // --- EMPTY STATE (WAITING FOR UPLOAD) ---
            <div className="h-full flex flex-col items-center justify-center text-center pb-20 animate-in fade-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-[rgba(255,255,255,0.03)] rounded-full flex items-center justify-center mb-6 border border-[rgba(255,255,255,0.1)]">
                <UploadCloud
                  size={40}
                  className="text-[#DC143C] animate-pulse"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No Trading Data Detected
              </h2>
              <p className="text-muted max-w-md mb-8">
                Upload your trading history (CSV or Excel) to generate your
                Behavioral Bias Report and Risk Analysis.
              </p>
              <button
                onClick={handleImportClick}
                className="px-8 py-3 rounded-xl bg-[#DC143C] hover:bg-[#b01030] text-white font-semibold transition-all shadow-[0_0_30px_rgba(220,20,60,0.3)]"
              >
                Select File to Analyze
              </button>

              <div className="mt-12 grid grid-cols-3 gap-6 opacity-50 w-full max-w-2xl">
                <div className="p-4 rounded-xl border border-dashed border-white/20 flex flex-col items-center">
                  <FileText size={20} className="mb-2" />
                  <span className="text-xs">CSV / Excel</span>
                </div>
                <div className="p-4 rounded-xl border border-dashed border-white/20 flex flex-col items-center">
                  <Activity size={20} className="mb-2" />
                  <span className="text-xs">Deep Analysis</span>
                </div>
                <div className="p-4 rounded-xl border border-dashed border-white/20 flex flex-col items-center">
                  <ShieldCheck size={20} className="mb-2" />
                  <span className="text-xs">Privacy Safe</span>
                </div>
              </div>
            </div>
          ) : (
            // --- REAL DASHBOARD (SHOWN AFTER UPLOAD) ---
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  label="Net P/L"
                  value={stats.netPL}
                  change={stats.netPL.startsWith("-") ? "-4.2%" : "+12%"}
                  isPositive={!stats.netPL.startsWith("-")}
                />
                <StatCard
                  label="Win Rate"
                  value={stats.winRate}
                  change="-2.1%"
                  isPositive={parseFloat(stats.winRate) > 50}
                />
                <StatCard
                  label="Trades / Hour"
                  value={stats.tradesPerHour}
                  change="High Frequency"
                  isAlert={parseFloat(stats.tradesPerHour) > 10}
                />
                <StatCard
                  label="Bias Risk"
                  value={stats.biasScore}
                  change="Detected"
                  isAlert={stats.biasScore !== "None"}
                />
              </div>

              {/* ANALYSIS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-1 relative overflow-hidden group min-h-[320px]">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#DC143C] to-transparent opacity-50" />
                  <div className="bg-[#050505] rounded-xl p-6 h-full border border-white/5 relative z-10 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                        <Activity size={18} className="text-[#DC143C]" />
                        Psychometric Analysis
                      </h3>
                      <span className="text-[10px] bg-[#DC143C]/10 text-[#DC143C] px-2 py-1 rounded border border-[#DC143C]/20">
                        Live Insight
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4">
                      Initial Scan Complete
                    </h4>
                    <p className="text-lg text-gray-400 leading-relaxed font-light">
                      Data processed successfully. Our algorithms are currently
                      cross-referencing your timestamps and P/L curve to detect
                      specific behavioral patterns. <br />
                      <br />
                      <span className="text-[#DC143C]">
                        Pending full analysis from the Algo Engine...
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-white mb-1">
                      Hold Time Analysis
                    </h3>
                    <p className="text-xs text-muted mb-6">
                      Average duration of trades
                    </p>
                  </div>
                  <div className="flex items-center justify-center h-full text-muted text-sm italic">
                    Waiting for data processing...
                  </div>
                </div>
              </div>

              {/* HEATMAP & TABLE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6">
                  <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                    <Clock size={16} /> Trading Intensity
                  </h3>
                  <div className="grid grid-cols-6 gap-2 opacity-50">
                    {[...Array(24)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-muted"
                      >
                        {i}:00
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Trade Ledger</h3>
                    <button className="flex items-center gap-2 text-xs text-muted hover:text-white transition-colors">
                      <Download size={14} /> Export
                    </button>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-muted">
                      <thead className="bg-white/5 text-xs uppercase tracking-wider text-white">
                        <tr>
                          <th className="px-6 py-4">Symbol</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">P/L</th>
                          <th className="px-6 py-4">Bias</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                        {trades.map((trade) => (
                          <tr
                            key={trade.id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 text-white font-medium">
                              {trade.symbol}
                            </td>
                            <td className="px-6 py-4">{trade.type}</td>
                            <td
                              className={`px-6 py-4 font-medium ${trade.pl >= 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {trade.plText}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-[#DC143C]">
                                <AlertTriangle size={14} />
                                <span>{trade.bias}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-muted hover:text-white">
                                <MoreHorizontal size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI COACH CHAT OVERLAY */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {isChatOpen && (
            <div className="mb-4 w-[400px] h-[500px] bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
              <div className="bg-[#111] p-3 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-white">
                    Coach Norman
                  </span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-muted hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="h-[calc(100%-50px)]">
                <ChatBot initialFile={importedFile} />
              </div>
            </div>
          )}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-2 px-5 py-4 rounded-full font-semibold shadow-lg transition-all duration-300 ${isChatOpen ? "bg-white text-black" : "bg-[#DC143C] text-white hover:scale-105"}`}
          >
            {isChatOpen ? (
              <>Close Coach</>
            ) : (
              <>
                <MessageSquare size={20} /> Ask AI Coach
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

// --- SUB COMPONENTS DEFINED HERE ---

function SidebarItem({ icon, label, active = false, badge }: any) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
        active
          ? "bg-[#DC143C] text-white shadow-[0_4px_20px_rgba(220,20,60,0.4)]"
          : "text-muted hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-white/10 text-[10px] px-1.5 py-0.5 rounded text-white">
          {badge}
        </span>
      )}
    </div>
  );
}

function StatCard({ label, value, change, isPositive, isAlert }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] p-6 rounded-2xl hover:border-[#DC143C]/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-muted text-sm font-medium">{label}</h4>
        <div className="p-2 bg-[rgba(255,255,255,0.05)] rounded-lg group-hover:bg-[#DC143C]/20 transition-colors">
          <TrendingUp
            size={16}
            className="text-muted group-hover:text-[#DC143C]"
          />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div
        className={`text-xs flex items-center gap-1 ${
          isAlert
            ? "text-[#DC143C] font-bold"
            : isPositive
              ? "text-green-400"
              : "text-red-400"
        }`}
      >
        {isAlert && <AlertTriangle size={12} />}
        {isPositive && !isAlert && <ArrowUpRight size={12} />}
        {!isPositive && !isAlert && <ArrowDownRight size={12} />}
        {change}
      </div>
    </div>
  );
}
