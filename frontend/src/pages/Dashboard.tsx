import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import ChatBot from "../components/Chatbot"; // Assuming you have this
import SidebarItem from "../components/SidebarItem"; // Assuming you have this
import StatCard from "../components/StatCard"; // Assuming you have this
import {
  HourlyActivityChart,
  PnLDistributionChart,
} from "../components/AnalysisCharts";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  Activity,
  MessageSquare,
  FileText,
  ArrowUpRight,
  Loader2,
  Trash2,
  BrainCircuit,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { analysis, setAnalysis, clearAnalysis, refreshData, dataVersion } =
    useData();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  const dashboardFileRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Recent Trades (Populates the Table)
  useEffect(() => {
    if (analysis) {
      // Logic: analysis exists, so DB is populated. Fetch rows.
      fetch("http://localhost:8000/api/trades?page=1&limit=5")
        .then((res) => res.json())
        .then((data) => setRecentTrades(data.data || []))
        .catch((err) => console.error("Failed to load recent trades", err));
    } else {
      setRecentTrades([]);
    }
  }, [analysis, dataVersion]);

  const handleImportClick = () => {
    dashboardFileRef.current?.click();
  };

  const handleDeleteFile = async () => {
    try {
      await fetch("http://localhost:8000/api/clear", { method: "DELETE" });
      clearAnalysis();
      setImportedFile(null);
      setIsChatOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Main Analysis Logic (Frontend -> Python)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportedFile(file);
      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:8000/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Analysis failed");
        const data = await res.json(); // Returns { summary, biases } from analysis.py

        refreshData(); // Triggers the table fetch in useEffect

        // --- MAP PYTHON RESPONSE TO FRONTEND STATE ---
        const stats = data.summary || {};
        const biases = data.biases || {};

        // Find the highest risk bias
        let maxScore = 0;
        let riskType = "Disciplined";
        let riskLevel = "Low";

        const checkBias = (key: string, label: string) => {
          // Safety check in case key is missing
          if (biases[key] && biases[key].score > maxScore) {
            maxScore = biases[key].score;
            riskType = label;
            riskLevel = biases[key].level; // "high", "medium", "low"
          }
        };

        checkBias("overtrading", "Overtrading");
        checkBias("loss_aversion", "Loss Aversion");
        checkBias("revenge_trading", "Revenge Trading");

        if (maxScore < 20) {
          riskType = "Disciplined";
          riskLevel = "Low";
        }

        // Extract Chart Data (Directly from analysis.py output)
        const hourlyData = biases.overtrading?.charts?.hourly_trades || [];
        const pnlData = biases.loss_aversion?.charts?.pnl_hist || [];

        // Update Global Context
        setAnalysis({
          netPL: stats.pnl_total ? `$${stats.pnl_total.toFixed(2)}` : "$0.00",
          winRate: biases.loss_aversion?.metrics?.win_rate
            ? `${(biases.loss_aversion.metrics.win_rate * 100).toFixed(1)}%`
            : "0%",
          tradesPerHour: biases.overtrading?.metrics?.avg_trades_per_day
            ? (biases.overtrading.metrics.avg_trades_per_day / 24).toFixed(1)
            : "0",
          totalTrades: stats.rows || 0,
          riskType,
          riskLevel: riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1), // Capitalize
          riskScorePct: `${Math.round(maxScore)}%`,
          insightBody: `Analysis complete. Detected ${riskType} patterns.`,
          scores: {
            overtrading: Math.round(biases.overtrading?.score || 0),
            lossAversion: Math.round(biases.loss_aversion?.score || 0),
            revenge: Math.round(biases.revenge_trading?.score || 0),
          },
          charts: {
            hourly: hourlyData,
            pnlDistribution: pnlData,
            winLossRatio: [], // Not used in this version but kept for type safety
          },
        });

        // Trigger AI Narrative (Optional)
        generateAiNarrative(riskType, maxScore, file.name);
      } catch (err) {
        console.error("Dashboard Error:", err);
        alert("Failed to analyze file. Check console.");
        setImportedFile(null);
      } finally {
        setIsLoading(false);
        e.target.value = ""; // Reset input
      }
    }
  };

  const generateAiNarrative = async (
    riskType: string,
    score: number,
    filename: string,
  ) => {
    setAiLoading(true);
    try {
      const initRes = await fetch("http://localhost:5000/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName: "Norman" }),
      });
      const initData = await initRes.json();

      if (initData.threadId) {
        const prompt = `The user has a risk score of ${score}% for "${riskType}". Please write a concise 2-sentence behavioral analysis explaining this specific behavior and provide 1 actionable mitigation tip.`;
        const formData = new FormData();
        formData.append("message", prompt);
        formData.append("threadId", initData.threadId);

        const chatRes = await fetch("http://localhost:5000/api/chat/message", {
          method: "POST",
          body: formData,
        });
        const chatData = await chatRes.json();

        // FIX: Use 'analysis' directly, not 'prev' function
        if (chatData.response && analysis) {
          setAnalysis({
            ...analysis,
            insightBody: chatData.response,
          });
        }
      }
    } catch (err) {
      console.error(err);
      // FIX: Use 'analysis' directly here too
      if (analysis) {
        setAnalysis({
          ...analysis,
          insightBody: "AI connection failed, but data analysis is accurate.",
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-[#DC143C] selection:text-white relative">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[rgba(255,255,255,0.1)] flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="h-20 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
          <span className="font-bold text-xl tracking-tight flex items-center gap-2">
            <BrainCircuit className="text-[#DC143C]" /> MarketPulse
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Overview"
            active
          />
          <Link to="/journal">
            <SidebarItem
              icon={<FileSpreadsheet size={20} />}
              label="Trade Journal"
            />
          </Link>
          <Link to="/action-plan">
            <SidebarItem icon={<ShieldCheck size={20} />} label="Action Plan" />
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between px-8 bg-black/50 backdrop-blur-sm sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-semibold">Behavioral Dashboard</h1>
            <p className="text-xs text-gray-400">
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

            {/* FILE UPLOAD STATE TOGGLE */}
            {analysis ? (
              <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-full animate-in fade-in slide-in-from-right-4">
                <FileText size={16} className="text-[#DC143C]" />
                <span className="text-sm text-white font-medium truncate max-w-[150px]">
                  {importedFile?.name || "Data Loaded"}
                </span>
                <button
                  onClick={handleDeleteFile}
                  className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Close File"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleImportClick}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <UploadCloud size={16} />
                )}
                <span>
                  {isLoading ? "Crunching Numbers..." : "Import Data"}
                </span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-800 pb-24">
          {!analysis ? (
            /* EMPTY STATE */
            <div className="h-[70vh] flex flex-col items-center justify-center text-center pb-20 animate-in fade-in zoom-in-95 duration-700">
              <div
                className="bg-[#111] p-10 rounded-3xl border border-dashed border-gray-700 hover:border-[#DC143C] transition-colors cursor-pointer group max-w-lg"
                onClick={handleImportClick}
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#DC143C]/20 transition-colors">
                  <UploadCloud
                    size={32}
                    className="text-gray-400 group-hover:text-[#DC143C] transition-colors"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Upload Trading History
                </h2>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  Upload your CSV/Excel export. We will analyze your psychology
                  using our <strong>Bias Detection Engine</strong>.
                </p>
                <button className="px-8 py-3 rounded-xl bg-[#DC143C] text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20 w-full">
                  Select File
                </button>
              </div>
            </div>
          ) : (
            /* DASHBOARD CONTENT */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* TOP STATS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                  label="Net P/L"
                  value={analysis.netPL}
                  change="Total"
                  isPositive={!analysis.netPL.startsWith("-")}
                />
                <StatCard
                  label="Win Rate"
                  value={analysis.winRate}
                  change="Consistency"
                  isAlert={parseFloat(analysis.winRate) < 30}
                />
                <StatCard
                  label="Avg Trades/Hour"
                  value={analysis.tradesPerHour}
                  change="Intensity"
                  isAlert={parseFloat(analysis.tradesPerHour) > 5}
                />
                <StatCard
                  label="Primary Bias"
                  value={analysis.riskType}
                  change={analysis.riskLevel}
                  isAlert={analysis.riskLevel.toLowerCase() === "high"}
                />
              </div>

              {/* MAIN CONTENT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* AI INSIGHT */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity size={100} />
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-[#DC143C]" />
                    AI Psychological Diagnosis
                  </h3>
                  {aiLoading ? (
                    <div className="h-20 flex items-center gap-3 text-gray-400">
                      <Loader2
                        className="animate-spin text-[#DC143C]"
                        size={20}
                      />
                      <span className="animate-pulse">
                        Analyzing behavioral patterns...
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-300 leading-relaxed text-lg font-light">
                      {analysis.insightBody || "Analysis pending..."}
                    </p>
                  )}
                </div>

                {/* BIAS METERS */}
                <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 shadow-xl">
                  <h3 className="font-semibold text-sm text-gray-400 mb-6 uppercase tracking-wider">
                    Risk Profile Scores
                  </h3>
                  <BiasMeter
                    label="Overtrading (Discipline)"
                    score={analysis.scores.overtrading}
                    color="bg-blue-500"
                  />
                  <BiasMeter
                    label="Loss Aversion (Fear)"
                    score={analysis.scores.lossAversion}
                    color="bg-yellow-500"
                  />
                  <BiasMeter
                    label="Revenge Trading (Anger)"
                    score={analysis.scores.revenge}
                    color="bg-[#DC143C]"
                  />
                </div>
              </div>

              {/* CHARTS ROW (Using AnalysisCharts.tsx) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  {analysis.charts?.hourly && (
                    <HourlyActivityChart data={analysis.charts.hourly} />
                  )}
                </div>
                <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  {analysis.charts?.pnlDistribution && (
                    <PnLDistributionChart
                      data={analysis.charts.pnlDistribution}
                    />
                  )}
                </div>
              </div>

              {/* RECENT TRADES TABLE */}
              <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    Analysis Sample (Last 5 Trades)
                  </h3>
                  <Link
                    to="/journal"
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    View Full Journal <ArrowUpRight size={14} />
                  </Link>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-xs uppercase tracking-wider text-white">
                      <tr>
                        <th className="px-6 py-4">Symbol</th>
                        <th className="px-6 py-4">P/L</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4">Side</th>
                        <th className="px-6 py-4">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                      {recentTrades.length > 0 ? (
                        recentTrades.map((trade, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 text-white font-medium">
                              {trade.asset || trade.symbol}
                            </td>
                            <td
                              className={`px-6 py-4 font-bold ${trade.profit_loss >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {trade.profit_loss >= 0
                                ? `+$${trade.profit_loss.toFixed(2)}`
                                : `-$${Math.abs(trade.profit_loss).toFixed(2)}`}
                            </td>
                            <td className="px-6 py-4">{trade.quantity}</td>
                            <td className="px-6 py-4 uppercase text-xs font-bold">
                              <span
                                className={`px-2 py-1 rounded ${trade.side?.toLowerCase() === "buy" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"}`}
                              >
                                {trade.side}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono">
                              ${trade.entry_price}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center italic text-gray-600"
                          >
                            {isLoading
                              ? "Loading data..."
                              : "No recent trade data available."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CHATBOT */}
        <div className="fixed bottom-6 right-6 z-50">
          {isChatOpen && (
            <div className="mb-4 w-96 h-[500px] bg-[#111] border border-white/20 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
              <ChatBot initialFile={importedFile} />
            </div>
          )}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-[#DC143C] p-4 rounded-full text-white shadow-lg hover:bg-red-600 transition-transform hover:scale-105 active:scale-95 border border-red-500/50"
          >
            {isChatOpen ? <ShieldCheck /> : <MessageSquare />}
          </button>
        </div>
      </main>
    </div>
  );
}

// Simple Helper Component for the Meters
function BiasMeter({ label, score, color }: any) {
  return (
    <div className="mb-5">
      <div className="flex justify-between text-xs mb-2">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className={`${score > 50 ? "text-[#DC143C]" : "text-gray-400"}`}>
          {score}%
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
