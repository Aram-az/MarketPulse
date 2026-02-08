import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import ChatBot from "../components/ChatBot";
import SidebarItem from "../components/SidebarItem";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";
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
  FileSpreadsheet,
  ShieldCheck,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CheckCircle,
  Trash2,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  // We use addTrades to push parsed CSV data to the global context for the Journal
  const {
    analysis,
    setAnalysis,
    clearAnalysis,
    addTrades,
    removeFile,
    clearData,
    trades,
  } = useData();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [hoveredHour, setHoveredHour] = useState<{
    hour: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const dashboardFileRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    dashboardFileRef.current?.click();
  };

  const handleDeleteFile = () => {
    clearData();
    clearAnalysis();
    setImportedFile(null);
    setIsChatOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportedFile(file);
      setIsLoading(true);

      try {
        // 1. Local Parse (Populates Journal & Heatmap)
        const text = await file.text();
        const { heatmap, localStats } = processLocalCSV(text, file.name);

        // 2. Python Backend (Risk Analysis)
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:8000/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Analysis failed");
        const data = await res.json();
        const biases = data.biases || {};

        // 3. Determine Risk
        let maxScore = 0;
        let riskType = "Calm Trading";
        let riskLevel = "Low";

        if (biases.overtrading && biases.overtrading.score > maxScore) {
          maxScore = biases.overtrading.score;
          riskType = "Overtrading";
          riskLevel = biases.overtrading.level;
        }
        if (biases.loss_aversion && biases.loss_aversion.score > maxScore) {
          maxScore = biases.loss_aversion.score;
          riskType = "Loss Aversion";
          riskLevel = biases.loss_aversion.level;
        }
        if (biases.revenge_trading && biases.revenge_trading.score > maxScore) {
          maxScore = biases.revenge_trading.score;
          riskType = "Revenge Trading";
          riskLevel = biases.revenge_trading.level;
        }

        if (maxScore < 20) {
          riskType = "Calm Trading";
          riskLevel = "Low";
        }

        // 4. Update Context
        setAnalysis({
          netPL: localStats.netPL,
          winRate: localStats.winRate,
          tradesPerHour: localStats.tradesPerHour,
          totalTrades: localStats.totalTrades,
          heatmap: heatmap, // Use locally parsed heatmap
          riskType,
          riskLevel,
          riskScorePct: `${Math.round(maxScore)}%`,
          insightBody: `Analysis complete. Detected ${riskType} patterns.`,
          scores: {
            overtrading: Math.round(biases.overtrading?.score || 0),
            lossAversion: Math.round(biases.loss_aversion?.score || 0),
            revenge: Math.round(biases.revenge_trading?.score || 0),
          },
        });

        setAnalysis(newAnalysis);

        generateAiNarrative(riskType, maxScore, file.name, newAnalysis);
      } catch (err) {
        console.error("Dashboard Error:", err);
        alert("Failed to analyze file.");
      } finally {
        setIsLoading(false);
        e.target.value = "";
      }
    }
  };

  const generateAiNarrative = async (
    riskType: string,
    score: number,
    filename: string,
    currentAnalysisObj: any,
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
        const prompt = `The user has a risk score of ${score}% for "${riskType}". Write a concise behavioral analysis and 1 mitigation tip.`;
        const formData = new FormData();
        formData.append("message", prompt);
        formData.append("threadId", initData.threadId);
        const chatRes = await fetch("http://localhost:5000/api/chat/message", {
          method: "POST",
          body: formData,
        });
        const chatData = await chatRes.json();
        if (chatData.response) {
          // FIX: Use the object directly, do not use (prev => ...)
          setAnalysis({
            ...currentAnalysisObj,
            insightBody: chatData.response,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // --- LOCAL CSV PARSER (THE ENGINE) ---
  const processLocalCSV = (csvText: string, filename: string) => {
    try {
      const lines = csvText.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const timeIdx = headers.findIndex(
        (h) => h.includes("time") || h.includes("date"),
      );
      const plIdx = headers.findIndex(
        (h) => h.includes("profit") || h.includes("p/l") || h.includes("pl"),
      );
      const symbolIdx = headers.findIndex(
        (h) => h.includes("asset") || h.includes("symbol"),
      );
      const typeIdx = headers.findIndex(
        (h) => h.includes("side") || h.includes("type"),
      );
      const qtyIdx = headers.findIndex(
        (h) => h.includes("qty") || h.includes("quantity"),
      );
      const entryIdx = headers.findIndex((h) => h.includes("entry"));
      const exitIdx = headers.findIndex((h) => h.includes("exit"));

      const tIdx = timeIdx !== -1 ? timeIdx : 0;
      const pIdx = plIdx !== -1 ? plIdx : 6;
      const sIdx = symbolIdx !== -1 ? symbolIdx : 1;
      const tyIdx = typeIdx !== -1 ? typeIdx : 2;

      const hourCounts = Array(24).fill(0);
      let minTime = Infinity;
      let maxTime = 0;

      const newTrades = lines
        .slice(1)
        .filter((line) => line.trim() !== "")
        .map((line, index) => {
          const cols = line.split(",");
          const timestampRaw = cols[tIdx];
          const symbol = cols[sIdx] || "UNK";
          const type = cols[tyIdx] || "Buy";
          const pl = parseFloat(cols[pIdx] || "0");
          const qty = qtyIdx !== -1 ? parseFloat(cols[qtyIdx]) : 1;
          const entryPrice = entryIdx !== -1 ? parseFloat(cols[entryIdx]) : 0;
          const exitPrice = exitIdx !== -1 ? parseFloat(cols[exitIdx]) : 0;

          let dateStr = "";
          if (timestampRaw) {
            let cleanTime = timestampRaw.replace(/\s+/g, " ").trim();
            let date = new Date(cleanTime);
            if (isNaN(date.getTime()))
              date = new Date(cleanTime.replace(/-/g, "/"));

            if (!isNaN(date.getTime())) {
              const hour = date.getHours();
              if (hour >= 0 && hour < 24) hourCounts[hour]++;
              dateStr = date.toISOString().split("T")[0];

              const time = date.getTime();
              if (time < minTime) minTime = time;
              if (time > maxTime) maxTime = time;
            }
          }

          return {
            id: Date.now() + index,
            symbol,
            type: type as "Buy" | "Sell",
            pl,
            plText:
              pl >= 0 ? `+$${pl.toFixed(2)}` : `-$${Math.abs(pl).toFixed(2)}`,
            status: pl < 0 ? "Risk" : "Good",
            bias: "Analyzing...",
            price: `$${entryPrice ? entryPrice.toFixed(2) : "0.00"}`,
            quantity: qty,
            entryPrice,
            exitPrice,
            date: dateStr,
            source: filename,
          };
        });

      if (newTrades.length > 0) {
        addTrades(newTrades); // Push to Global Context

        const totalPL = newTrades.reduce((acc, t) => acc + t.pl, 0);
        const wins = newTrades.filter((t) => t.pl > 0).length;
        const winRate = ((wins / newTrades.length) * 100).toFixed(1) + "%";

        let durationHours = (maxTime - minTime) / (1000 * 60 * 60);
        if (!durationHours || durationHours < 1) durationHours = 1;
        const tph = (newTrades.length / durationHours).toFixed(1);

        return {
          heatmap: hourCounts,
          localStats: {
            netPL:
              totalPL >= 0
                ? `+$${totalPL.toFixed(2)}`
                : `-$${Math.abs(totalPL).toFixed(2)}`,
            winRate,
            tradesPerHour: tph,
            totalTrades: newTrades.length,
          },
        };
      }
      return {
        heatmap: Array(24).fill(0),
        localStats: {
          netPL: "0",
          winRate: "0",
          tradesPerHour: "0",
          totalTrades: 0,
        },
      };
    } catch (err) {
      console.error("Local CSV Parse Error:", err);
      return {
        heatmap: Array(24).fill(0),
        localStats: {
          netPL: "0",
          winRate: "0",
          tradesPerHour: "0",
          totalTrades: 0,
        },
      };
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-[#DC143C] selection:text-white relative">
      <aside className="w-64 border-r border-[rgba(255,255,255,0.1)] flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
          <span className="font-bold text-xl tracking-tight">MarketPulse</span>
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

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
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
            {analysis ? (
              <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-full">
                <FileText size={16} className="text-[#DC143C]" />
                <span className="text-sm text-white font-medium truncate max-w-[150px]">
                  {importedFile?.name || "Trades Loaded"}
                </span>
                <button
                  onClick={handleDeleteFile}
                  className="ml-2 text-muted hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleImportClick}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <UploadCloud size={16} />
                )}
                <span>{isLoading ? "Analyzing..." : "Import Data"}</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-800 pb-24">
          {!analysis ? (
            <div className="h-full flex flex-col items-center justify-center text-center pb-20">
              <UploadCloud size={40} className="text-[#DC143C] mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                No Trading Data
              </h2>
              <button
                onClick={handleImportClick}
                className="px-8 py-3 rounded-xl bg-[#DC143C] text-white font-bold mt-4"
              >
                Select File
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                  label="Net P/L"
                  value={analysis.netPL}
                  change="Total"
                  isPositive={!analysis.netPL.startsWith("-")}
                />
                <StatCard
                  label="Trades / Hour"
                  value={analysis.tradesPerHour}
                  change="Avg"
                  isAlert={parseFloat(analysis.tradesPerHour) > 10}
                />
                <StatCard
                  label="Risk Score"
                  value={`${analysis.riskLevel} (${analysis.riskScorePct})`}
                  change={analysis.riskType}
                  isAlert={analysis.riskLevel === "High"}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6">
                  <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-[#DC143C]" /> AI
                    Behavioral Analysis
                  </h3>
                  {aiLoading ? (
                    <p className="text-muted italic flex items-center gap-2">
                      <Loader2 className="animate-spin" size={14} /> Generating
                      insights...
                    </p>
                  ) : (
                    <p className="text-gray-400 leading-relaxed">
                      {analysis.insightBody}
                    </p>
                  )}
                </div>
                <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6">
                  <h3 className="font-semibold text-sm text-white mb-6">
                    Risk Profile
                  </h3>
                  <div className="space-y-5">
                    <BiasMeter
                      label="Overtrading"
                      score={analysis.scores.overtrading}
                      color="bg-blue-500"
                    />
                    <BiasMeter
                      label="Loss Aversion"
                      score={analysis.scores.lossAversion}
                      color="bg-yellow-500"
                    />
                    <BiasMeter
                      label="Revenge"
                      score={analysis.scores.revenge}
                      color="bg-[#DC143C]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 relative">
                  <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                    <Clock size={16} /> Trading Intensity
                  </h3>
                  <div
                    className="grid grid-cols-6 gap-2"
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    {analysis.heatmap.map((count, i) => {
                      const maxCount = Math.max(...analysis.heatmap, 1);
                      const intensity = count / maxCount;
                      let bgClass = "rgba(255,255,255,0.05)";
                      if (count > 0) {
                        if (intensity >= 0.7)
                          bgClass = `rgba(220, 20, 60, ${0.4 + intensity * 0.6})`;
                        else if (intensity >= 0.4)
                          bgClass = `rgba(234, 179, 8, ${0.4 + intensity * 0.6})`;
                        else
                          bgClass = `rgba(16, 185, 129, ${0.3 + intensity * 0.7})`;
                      }
                      return (
                        <div
                          key={i}
                          className="h-8 rounded-sm flex items-center justify-center text-[10px]"
                          style={{
                            background: bgClass,
                            color: count > 0 ? "white" : "#666",
                          }}
                          title={`${count} trades`}
                        >
                          {i}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Recent Trades</h3>
                    <Link
                      to="/journal"
                      className="flex items-center gap-2 text-xs text-muted hover:text-white transition-colors"
                    >
                      View All <ArrowUpRight size={14} />
                    </Link>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-muted">
                      <thead className="bg-white/5 text-xs uppercase tracking-wider text-white">
                        <tr>
                          <th className="px-6 py-4">Symbol</th>
                          <th className="px-6 py-4">P/L</th>
                          <th className="px-6 py-4">Side</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                        {trades.slice(0, 5).map((trade) => (
                          <tr key={trade.id}>
                            <td className="px-6 py-4 text-white font-medium">
                              {trade.symbol}
                            </td>
                            <td
                              className={`px-6 py-4 font-medium ${trade.pl >= 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {trade.plText}
                            </td>
                            <td className="px-6 py-4">{trade.type}</td>
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

        <div className="fixed bottom-6 right-6 z-50">
          {isChatOpen && (
            <div className="mb-4 w-96 h-[500px] bg-[#111] border border-white/20 rounded-xl overflow-hidden">
              <ChatBot initialFile={importedFile} />
            </div>
          )}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-[#DC143C] p-4 rounded-full text-white shadow-lg"
          >
            <MessageSquare />
          </button>
        </div>
      </main>
    </div>
  );
}

function BiasMeter({ label, score, color }: any) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{score}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
