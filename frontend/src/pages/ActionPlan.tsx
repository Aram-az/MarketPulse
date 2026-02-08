import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Lock,
  Plus,
  Trash2,
  Shield,
  Zap,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function ActionPlan() {
  const {
    guardrails,
    toggleGuardrail,
    addGuardrail,
    deleteGuardrail,
    analyses,
  } = useData();

  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleText, setNewRuleText] = useState("");

  const recentAnalysisKey = Object.keys(analyses).pop();
  const recentAnalysis = recentAnalysisKey ? analyses[recentAnalysisKey] : null;
  const riskType = recentAnalysis?.riskType || "Calm Trading";

  // --- LOGIC: GET 3 RECOMMENDATIONS BASED ON RISK ---
  const getRecommendations = (risk: string) => {
    switch (risk) {
      case "Overtrading":
        return [
          {
            icon: Shield,
            title: "Hard Trade Cap",
            rule: "Max 5 Trades per Day",
            desc: "Forces quality over quantity.",
          },
          {
            icon: Clock,
            title: "Time-Restricted Trading",
            rule: "No Trading 11:30am - 1:30pm",
            desc: "Avoids low-volume/chop hours.",
          },
          {
            icon: Zap,
            title: "Cooldown Timer",
            rule: "Mandatory 30m Break after 3 Trades",
            desc: "Prevents rapid-fire execution.",
          },
        ];
      case "Revenge Trading":
        return [
          {
            icon: Shield,
            title: "Circuit Breaker",
            rule: "Stop Trading after 2 Consecutive Losses",
            desc: "Prevents emotional spirals.",
          },
          {
            icon: Clock,
            title: "Tilt Timeout",
            rule: "Mandatory 15m Walk after Loss > $500",
            desc: "Resets your mental state.",
          },
          {
            icon: TrendingUp,
            title: "Size Down",
            rule: "Halve Position Size after a Loss",
            desc: "Reduces risk while regaining confidence.",
          },
        ];
      case "Loss Aversion":
        return [
          {
            icon: Shield,
            title: "Automated Exit",
            rule: "Set Hard Stop Loss at Entry",
            desc: "Removes decision paralysis.",
          },
          {
            icon: Clock,
            title: "End of Day Exit",
            rule: "Close All Losing Positions by 3:45 PM",
            desc: "Prevents holding losers overnight.",
          },
          {
            icon: TrendingUp,
            title: "Risk/Reward Check",
            rule: "Only take trades with 1:2 R/R",
            desc: "Ensures winners outpace losers.",
          },
        ];
      default: // Calm / Default
        return [
          {
            icon: Shield,
            title: "Daily Loss Limit",
            rule: "Max Daily Loss: 2% of Account",
            desc: "Protect your capital.",
          },
          {
            icon: TrendingUp,
            title: "Profit Target",
            rule: "Stop Trading after +$1,000 Profit",
            desc: "Secure your wins.",
          },
          {
            icon: Zap,
            title: "Weekly Review",
            rule: "Review Trade Journal every Friday",
            desc: "Continuous improvement.",
          },
        ];
    }
  };

  const recommendations = getRecommendations(riskType);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRuleText.trim()) {
      addGuardrail(newRuleText);
      setNewRuleText("");
      setIsAddingRule(false);
    }
  };

  const handleApplySuggestion = (rule: string) => {
    if (!guardrails.find((g) => g.label === rule)) {
      addGuardrail(rule);
    }
  };

  return (
    <div className="h-screen bg-black text-white p-8 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <Link
            to="/dashboard"
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Action Plan</h1>
            <p className="text-muted text-sm">
              Automated discipline and psychological guardrails.
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
          {/* LEFT: Active Guardrails */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Lock size={18} className="text-[#DC143C]" /> Active Guardrails
              </h2>
              <button
                onClick={() => setIsAddingRule(!isAddingRule)}
                className="text-xs flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
              >
                <Plus size={14} /> Custom Rule
              </button>
            </div>

            {isAddingRule && (
              <form
                onSubmit={handleAddRule}
                className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="e.g. No trading on Fridays"
                  value={newRuleText}
                  onChange={(e) => setNewRuleText(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#DC143C] outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-[#DC143C] text-white px-3 py-2 rounded-lg text-xs font-bold"
                >
                  Add
                </button>
              </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {guardrails.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 transition-all hover:border-white/10 group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleGuardrail(rule.id)}
                      className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${rule.active ? "bg-green-500" : "bg-white/20"}`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${rule.active ? "translate-x-4" : "translate-x-0"}`}
                      />
                    </button>
                    <div>
                      <p
                        className={`font-medium ${rule.active ? "text-white" : "text-muted"}`}
                      >
                        {rule.label}
                      </p>
                      {rule.active && (
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider ${rule.status === "Violated" ? "text-red-400" : rule.status === "Adhered" ? "text-green-400" : "text-gray-500"}`}
                        >
                          {rule.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {rule.status === "Violated" && rule.active && (
                      <AlertTriangle
                        size={18}
                        className="text-red-500 animate-pulse"
                      />
                    )}
                    {rule.status === "Adhered" && rule.active && (
                      <CheckCircle size={18} className="text-green-500" />
                    )}
                    <button
                      onClick={() => deleteGuardrail(rule.id)}
                      className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: AI Coach Recommendations (3 Items) */}
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/10 rounded-2xl p-8 flex flex-col h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Shield size={180} className="text-[#DC143C]" />
            </div>

            <div className="shrink-0 mb-6">
              <h2 className="font-semibold text-xl flex items-center gap-2 mb-2">
                <Lightbulb size={24} className="text-yellow-400" /> AI Coach
                Recommendations
              </h2>
              <p className="text-sm text-gray-400">
                Based on your{" "}
                <span className="text-[#DC143C] font-bold">{riskType}</span>{" "}
                analysis (Score: {recentAnalysis?.riskScore || "N/A"}), adopt
                these protocols:
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {recommendations.map((rec, index) => {
                const isAdded = guardrails.some((g) => g.label === rec.rule);
                const Icon = rec.icon;

                return (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#DC143C]/20 rounded-lg text-[#DC143C]">
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">
                            {rec.title}
                          </h3>
                          <p className="text-xs text-muted">Strategy</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplySuggestion(rec.rule)}
                        disabled={isAdded}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                          isAdded
                            ? "bg-green-500/20 text-green-400 cursor-default"
                            : "bg-white text-black hover:bg-gray-200"
                        }`}
                      >
                        {isAdded ? "Active" : "Apply"}
                      </button>
                    </div>

                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 mb-2">
                      <p className="text-[#DC143C] font-bold text-xs">
                        Rule: "{rec.rule}"
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 italic">"{rec.desc}"</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper icons needed: Clock, Shield, Zap, TrendingUp
