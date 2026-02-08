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
      "I am Norman. I analyze your trading history for Overtrading, Loss Aversion, and Revenge Trading.",
  },
  {
    id: "analyst",
    name: "Atlas",
    role: "Data Analyst",
    icon: BarChart3,
    color: "#3b82f6",
    intro:
      "I am Atlas. I focus on raw P/L data, win-rates, and statistical anomalies.",
  },
  {
    id: "coach",
    name: "Sage",
    role: "Mitigation Strategy",
    icon: Shield,
    color: "#10b981",
    intro:
      "I am Sage. I provide psychological strategies to help you maintain discipline.",
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
  "Summarize P/L",
];

interface ChatBotProps {
  initialFile?: File | null;
}

export default function ChatBot({ initialFile }: ChatBotProps) {
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(
    initialFile || null,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) setUploadedFile(initialFile);
  }, [initialFile]);

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

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processMessageToBackend = async (
    userText: string,
    file: File | null,
  ) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        if (file) {
          resolve(
            `I've analyzed **${file.name}**. I detected a 15% drop in win-rate during high-volatility hours, suggesting Impulse Trading.`,
          );
        } else if (activeAgent.id === "norman") {
          resolve(
            "Based on your history, I detected a pattern of **Overtrading** between 14:00 and 16:00 EST.",
          );
        } else if (activeAgent.id === "analyst") {
          resolve(
            "Your Sharpe Ratio is 1.2. Standard deviation indicates high volatility risks.",
          );
        } else {
          resolve(
            "I recommend the '2-Strike Rule': If you lose 2 trades in a row, step away for 30 minutes.",
          );
        }
      }, 1500);
    });
  };

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
    <div className="relative flex flex-col h-full w-full bg-[#0a0a0a] overflow-hidden">
      {/* HEADER */}
      <div className="h-[60px] bg-[#111] px-4 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between relative z-20 shrink-0">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-lg transition-colors ${isMenuOpen ? "bg-[rgba(255,255,255,0.15)] text-white" : "text-muted hover:text-white hover:bg-[rgba(255,255,255,0.1)]"}`}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${activeAgent.color} 0%, #000 100%)`,
            }}
          >
            <AgentIcon size={16} color="white" />
          </div>
          <span className="text-sm font-semibold text-white">
            {activeAgent.name}
          </span>
        </div>
      </div>

      {/* MENU */}
      {isMenuOpen && (
        <div className="absolute top-[60px] left-0 bottom-0 w-64 bg-[#111] border-r border-[rgba(255,255,255,0.1)] z-30 flex flex-col animate-in slide-in-from-left-5 duration-200">
          <div className="p-4 flex-1 overflow-y-auto">
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
                    <div>{agent.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAT AREA */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent bg-gradient-to-b from-[#0a0a0a] to-[#050505]"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                msg.sender === "user" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              {msg.sender === "user" ? (
                <User size={12} className="text-white" />
              ) : (
                <AgentIcon size={12} style={{ color: activeAgent.color }} />
              )}
            </div>

            <div
              className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-lg text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#DC143C] text-white"
                    : "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.9)]"
                } ${msg.isThinking ? "animate-pulse" : ""}`}
              >
                {msg.attachmentName && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[rgba(255,255,255,0.2)]">
                    <FileText size={12} />
                    <span className="text-[10px] font-mono">
                      {msg.attachmentName}
                    </span>
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT AREA - IMPROVED SPACING */}
      <div className="bg-[#050505] p-4 border-t border-[rgba(255,255,255,0.1)] relative z-20 shrink-0">
        {/* Suggested Chips */}
        {!isMenuOpen && messages.length < 3 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputValue(prompt)}
                className="text-xs bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <TrendingUp size={12} /> {prompt}
              </button>
            ))}
          </div>
        )}

        {uploadedFile && (
          <div className="flex items-center justify-between bg-[rgba(255,255,255,0.05)] px-3 py-2 rounded-lg mb-2 border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-[#DC143C]" />
              <span className="text-xs text-white truncate max-w-[150px]">
                {uploadedFile.name}
              </span>
            </div>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-[rgba(255,255,255,0.5)] hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-3 items-center">
          {/* File Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".csv, .xlsx, .xls"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors border border-white/5"
          >
            <Paperclip size={18} />
          </button>

          {/* Text Area (Larger) */}
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-[#1a1a1a] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DC143C] border border-[rgba(255,255,255,0.1)] text-sm h-[50px] resize-none pt-3.5 scrollbar-hide"
            rows={1}
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputValue.trim() && !uploadedFile)}
            className={`p-3 rounded-xl transition-all ${
              isLoading || (!inputValue.trim() && !uploadedFile)
                ? "bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] cursor-not-allowed"
                : "bg-[#DC143C] hover:bg-[#b01030] text-white"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
