import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Bot,
  User,
  FileText,
  TrendingUp,
  X,
  Menu,
  History,
  Brain,
  BarChart3,
  Shield,
} from "lucide-react";

// --- TYPES ---
type Sender = "user" | "bot";

interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isThinking?: boolean;
  attachmentName?: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  intro: string;
}

// --- AGENT CONFIGURATION ---
const AGENTS: Agent[] = [
  {
    id: "norman",
    name: "Norman",
    role: "Bias Detector AI",
    icon: Brain,
    color: "#DC143C",
    intro:
      "I am Norman. Upload your trading history and I will detect Overtrading, Loss Aversion, and Revenge Trading patterns.",
  },
  {
    id: "analyst",
    name: "Atlas",
    role: "Data Analyst",
    icon: BarChart3,
    color: "#3b82f6",
    intro:
      "I am Atlas. I focus on raw P/L data, win-rates, and statistical anomalies in your trading performance.",
  },
  {
    id: "coach",
    name: "Sage",
    role: "Mitigation Strategy",
    icon: Shield,
    color: "#10b981",
    intro:
      "I am Sage. I provide psychological strategies and cooling-off rules to help you maintain discipline.",
  },
];

const MOCK_HISTORY = [
  "TSLA Analysis - Oct 24",
  "Overtrading Check - Oct 22",
  "Monthly P/L Review",
];

const SUGGESTED_PROMPTS = [
  "Analyze for Overtrading",
  "Check for Loss Aversion",
  "Detect Revenge Trading",
  "Summarize my P/L performance",
];

export default function ChatBot() {
  // State
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for the SCROLLABLE container
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Chat when agent changes
  useEffect(() => {
    setMessages([
      {
        id: "init-1",
        text: activeAgent.intro,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setIsMenuOpen(false);
  }, [activeAgent]);

  // FIX #1: Scroll logic that DOES NOT jump the whole page
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      // Smoothly scroll the container to the bottom
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- BACKEND MOCK ---
  const processMessageToBackend = async (
    userText: string,
    file: File | null,
  ) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        if (activeAgent.id === "norman") {
          resolve(
            "Based on your history, I detected a pattern of **Overtrading** between 14:00 and 16:00 EST. Your win rate drops by 15% during high-volatility periods.",
          );
        } else if (activeAgent.id === "analyst") {
          resolve(
            "Your Sharpe Ratio for the selected period is 1.2. The standard deviation of your daily returns suggests higher volatility than your defined risk profile.",
          );
        } else {
          resolve(
            "To mitigate this, I recommend the '2-Strike Rule': If you lose 2 trades in a row, step away from the terminal for 30 minutes to reset your mental state.",
          );
        }
      }, 1500);
    });
  };

  // --- HANDLERS ---
  const handleSendMessage = async () => {
    if (!inputValue.trim() && !uploadedFile) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      attachmentName: uploadedFile?.name,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsLoading(true);

    const thinkingMsgId = "thinking-" + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingMsgId,
        text: `${activeAgent.name} is thinking...`,
        sender: "bot",
        timestamp: new Date(),
        isThinking: true,
      },
    ]);

    try {
      const responseText = await processMessageToBackend(
        newUserMsg.text,
        uploadedFile,
      );
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingMsgId)
          .concat({
            id: Date.now().toString(),
            text: responseText,
            sender: "bot",
            timestamp: new Date(),
          }),
      );
      if (uploadedFile) setUploadedFile(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const AgentIcon = activeAgent.icon;

  return (
    <div className="relative flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] rounded-2xl overflow-hidden shadow-2xl">
      {/* --- HEADER (Fixed Height for stability) --- */}
      <div className="h-[72px] bg-[#111] px-4 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between relative z-20 shrink-0">
        {/* LEFT: Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-lg transition-colors ${isMenuOpen ? "bg-[rgba(255,255,255,0.15)] text-white" : "text-muted hover:text-white hover:bg-[rgba(255,255,255,0.1)]"}`}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* RIGHT: Profile Icon & Hover Tooltip */}
        <div className="group relative flex items-center cursor-help">
          {/* Tooltip */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap mr-2">
            <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-lg shadow-xl">
              <span className="text-xs text-white font-medium">
                {activeAgent.name}, the {activeAgent.role}
              </span>
            </div>
          </div>

          {/* Profile Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${activeAgent.color} 0%, #000 100%)`,
            }}
          >
            <AgentIcon size={20} color="white" />
          </div>
        </div>
      </div>

      {/* --- MENU DROPDOWN --- */}
      {/* FIX #2: Positioned exactly under the 72px header */}
      {isMenuOpen && (
        <div
          className="absolute top-[72px] left-0 bottom-0 w-64 bg-[#111] border-r border-[rgba(255,255,255,0.1)] z-30 flex flex-col animate-in slide-in-from-left-5 duration-200"
          style={{ height: "calc(100% - 72px)" }} // Ensures it doesn't overflow bottom
        >
          <div className="p-4 flex-1 overflow-y-auto">
            {/* Agents Section */}
            <div className="mb-6">
              <h4 className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] font-bold mb-3 pl-2">
                Select Agent
              </h4>
              <div className="space-y-1">
                {AGENTS.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setActiveAgent(agent)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${activeAgent.id === agent.id ? "bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.1)]" : "text-muted hover:text-white hover:bg-[rgba(255,255,255,0.05)]"}`}
                  >
                    <agent.icon size={16} style={{ color: agent.color }} />
                    <div className="text-left">
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-[10px] opacity-60">{agent.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* History Section */}
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] font-bold mb-3 pl-2">
                Recent History
              </h4>
              <div className="space-y-1">
                {MOCK_HISTORY.map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left"
                  >
                    <History size={14} className="opacity-50" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#0d0d0d]">
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Operational
            </div>
          </div>
        </div>
      )}

      {/* --- CHAT AREA --- */}
      {/* Attached the ref here for scoped scrolling */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent bg-gradient-to-b from-[#0a0a0a] to-[#050505]"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Message Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.sender === "user"
                  ? "bg-[rgba(255,255,255,0.1)]"
                  : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
              }`}
            >
              {msg.sender === "user" ? (
                <User size={16} className="text-white" />
              ) : (
                <AgentIcon size={16} style={{ color: activeAgent.color }} />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`flex flex-col max-w-[80%] ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#DC143C] text-white rounded-tr-sm"
                    : "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.9)] rounded-tl-sm"
                } ${msg.isThinking ? "animate-pulse" : ""}`}
              >
                {msg.attachmentName && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[rgba(255,255,255,0.2)]">
                    <FileText size={14} />
                    <span className="text-xs font-mono">
                      {msg.attachmentName}
                    </span>
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>
              <span className="text-[10px] text-[rgba(255,255,255,0.3)] mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- INPUT AREA --- */}
      <div className="bg-[#050505] p-4 border-t border-[rgba(255,255,255,0.1)] relative z-20 shrink-0">
        {/* Suggested Chips */}
        {!isMenuOpen && messages.length < 3 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputValue(prompt)}
                className="text-xs bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-1"
              >
                <TrendingUp size={12} /> {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Upload Preview */}
        {uploadedFile && (
          <div className="flex items-center justify-between bg-[rgba(255,255,255,0.05)] px-3 py-2 rounded-lg mb-2 border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#DC143C]" />
              <span className="text-sm text-white truncate max-w-[200px]">
                {uploadedFile.name}
              </span>
            </div>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-[rgba(255,255,255,0.5)] hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".csv, .xlsx, .xls"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors border border-[rgba(255,255,255,0.1)]"
          >
            <Paperclip size={20} />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeAgent.name}...`}
              className="w-full bg-[#1a1a1a] text-white rounded-xl pl-4 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DC143C] border border-[rgba(255,255,255,0.1)] resize-none h-[48px] max-h-[120px] scrollbar-hide text-sm"
              rows={1}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputValue.trim() && !uploadedFile)}
            className={`p-3 rounded-xl transition-all ${
              isLoading || (!inputValue.trim() && !uploadedFile)
                ? "bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] cursor-not-allowed"
                : "bg-[#DC143C] hover:bg-[#b01030] text-white shadow-lg shadow-red-900/20"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
