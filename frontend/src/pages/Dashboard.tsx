import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
// Uncomment if you have the ChatBot file
import ChatBot from "../components/Chatbot";
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
} from "lucide-react";

const RECENT_TRADES = [
  {
    id: 1,
    symbol: "NVDA",
    type: "Sell",
    price: "$450.20",
    pl: "-$4,500",
    duration: "4h 15m",
    status: "Risk",
    bias: "Revenge Trading",
  },
  {
    id: 2,
    symbol: "NVDA",
    type: "Buy",
    price: "$460.00",
    pl: "-$850",
    duration: "15m",
    status: "Risk",
    bias: "Impulse Entry",
  },
  {
    id: 3,
    symbol: "TSLA",
    type: "Buy",
    price: "$240.50",
    pl: "+$200",
    duration: "12m",
    status: "Warning",
    bias: "Premature Exit",
  },
  {
    id: 4,
    symbol: "AMD",
    type: "Buy",
    price: "$105.00",
    pl: "-$1,200",
    duration: "6h 30m",
    status: "Risk",
    bias: "Loss Aversion",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const dashboardFileRef = useRef<HTMLInputElement>(null);

  // --- IMPORT LOGIC ---
  const handleImportClick = () => {
    dashboardFileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportedFile(file);
      setIsChatOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-[#DC143C] selection:text-white relative">
      {/* --- LEFT SIDEBAR --- */}
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
          <SidebarItem
            icon={<ShieldCheck size={20} />}
            label="Action Plan"
            badge="1 New"
          />
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.05)] space-y-2">
          <div className="p-4 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.05)]">
            <h4 className="text-xs font-semibold text-[#DC143C] uppercase tracking-wider mb-2">
              Coach's Tip
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              You tend to "Revenge Trade" after losses &gt; $1k. Try walking
              away for 15 mins next time.
            </p>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
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
            {/* HIDDEN FILE INPUT */}
            <input
              type="file"
              ref={dashboardFileRef}
              hidden
              accept=".csv,.xlsx"
              onChange={handleFileChange}
            />

            {/* WORKING UPLOAD BUTTON */}
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              <UploadCloud size={16} />
              <span>Import Data</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-800 pb-24">
          {/* 1. BIAS METRICS (KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Net P/L"
              value="-$3,150"
              change="-4.2%"
              isPositive={false}
            />

            <StatCard
              label="Risk/Reward Ratio"
              value="1:0.8"
              change="Unbalanced"
              isAlert={true}
            />

            <StatCard
              label="Trades / Hour"
              value="12.5"
              change="High Frequency"
              isAlert={true}
            />

            <StatCard
              label="Emotional Score"
              value="45/100"
              change="Tilt Detected"
              isAlert={true}
            />
          </div>

          {/* 2. PSYCHOMETRIC ANALYSIS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Narrative Engine (Left) */}
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
                  Detected: Loss Aversion & Revenge Trading
                </h4>

                <p className="text-lg text-gray-400 leading-relaxed font-light">
                  Analysis of your recent CSV upload indicates a breakdown in
                  discipline. You are currently holding losing positions{" "}
                  <span className="text-red-400 font-medium">3.5x longer</span>{" "}
                  than winning positions, a classic sign of{" "}
                  <span className="text-white border-b border-red-500/50">
                    Loss Aversion
                  </span>
                  .<br />
                  <br />
                  Additionally, immediately following your{" "}
                  <span className="text-red-400">$4,500 loss on NVDA</span>, you
                  executed 3 trades within 15 minutes with{" "}
                  <span className="text-red-400">200% increased size</span>.
                  This is a high-probability signal for{" "}
                  <span className="text-white border-b border-red-500/50">
                    Revenge Trading
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Hold Time Visualization (Right) */}
            <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-white mb-1">
                  Hold Time Analysis
                </h3>
                <p className="text-xs text-muted mb-6">
                  Average duration of trades
                </p>
              </div>

              <div className="space-y-6">
                {/* Winner Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-green-400 font-medium">
                      Winning Trades
                    </span>
                    <span className="text-white">12m Avg</span>
                  </div>
                  <div className="h-8 w-full bg-white/5 rounded-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 bottom-0 bg-green-500/20 w-[20%] border-r-2 border-green-500" />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] text-green-300">
                      Closed Early
                    </span>
                  </div>
                </div>

                {/* Loser Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-red-400 font-medium">
                      Losing Trades
                    </span>
                    <span className="text-white">6h 30m Avg</span>
                  </div>
                  <div className="h-8 w-full bg-white/5 rounded-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 bottom-0 bg-red-500/20 w-[85%] border-r-2 border-red-500" />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] text-red-300">
                      Held Too Long
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-[#DC143C] mt-0.5" />
                  <p className="text-xs text-muted">
                    You are "marrying" your losers but dating your winners. Set
                    a hard time-stop for losing trades.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. HEATMAP & TABLE ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Heatmap */}
            <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6">
              <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                <Clock size={16} /> Trading Intensity Heatmap
              </h3>
              {/* Mock Heatmap Grid */}
              <div className="grid grid-cols-6 gap-2">
                {[...Array(24)].map((_, i) => {
                  const isHot = i >= 9 && i <= 11;
                  const isWarm = i >= 14 && i <= 15;
                  return (
                    <div
                      key={i}
                      className={`h-8 rounded-md flex items-center justify-center text-[10px] 
                        ${
                          isHot
                            ? "bg-[#DC143C] text-white font-bold"
                            : isWarm
                              ? "bg-[#DC143C]/40 text-white"
                              : "bg-white/5 text-muted"
                        }`}
                    >
                      {i}:00
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted mt-4">
                Red zones indicate clustering of trades &gt; 10 per hour
                (Overtrading).
              </p>
            </div>

            {/* Recent Trades Table */}
            <div className="lg:col-span-2 bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                <h3 className="font-semibold text-lg">Flagged Trades</h3>
                <button className="flex items-center gap-2 text-xs text-muted hover:text-white transition-colors">
                  <Download size={14} /> Export Report
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm text-muted">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-white">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Symbol</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Duration</th>
                      <th className="px-6 py-4 font-semibold">P/L</th>
                      <th className="px-6 py-4 font-semibold">Bias Detected</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {RECENT_TRADES.map((trade) => (
                      <tr
                        key={trade.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-medium">
                          {trade.symbol}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] ${
                              trade.type === "Buy"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">{trade.duration}</td>
                        <td
                          className={`px-6 py-4 font-medium ${
                            trade.pl.startsWith("+")
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {trade.pl}
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

        {/* --- AI COACH CHAT OVERLAY --- */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {/* Chat Window */}
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

              {/* CHATBOT COMPONENT */}
              <div className="h-[calc(100%-50px)]">
                <ChatBot initialFile={importedFile} />
              </div>
            </div>
          )}

          {/* Floating Action Button (FAB) */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-2 px-5 py-4 rounded-full font-semibold shadow-lg transition-all duration-300 ${
              isChatOpen
                ? "bg-white text-black"
                : "bg-[#DC143C] text-white hover:scale-105"
            }`}
          >
            {isChatOpen ? (
              <>Close Coach</>
            ) : (
              <>
                <MessageSquare size={20} />
                Ask AI Coach
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

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
          {/* Ensure TrendingUp is available here */}
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
