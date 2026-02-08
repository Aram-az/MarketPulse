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
  MessageSquare,
  Loader2,
} from "lucide-react";

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
  description: string;
}

const AGENTS: Agent[] = [
  {
    id: "norman",
    name: "Norman",
    role: "Bias Detector AI",
    icon: Brain,
    color: "#DC143C",
    intro:
      "I am Norman. I analyze your trading history for Overtrading, Loss Aversion, and Revenge Trading.",
    description:
      "Specializes in behavioral psychology. Detects emotional trading patterns.",
  },
  {
    id: "analyst",
    name: "Atlas",
    role: "Data Analyst",
    icon: BarChart3,
    color: "#3b82f6",
    intro:
      "I am Atlas. I focus on raw P/L data, win-rates, and statistical anomalies.",
    description:
      "Focuses on raw numbers. Calculates Sharpe ratio and volatility.",
  },
  {
    id: "coach",
    name: "Sage",
    role: "Mitigation Strategy",
    icon: Shield,
    color: "#10b981",
    intro:
      "I am Sage. I provide psychological strategies to help you maintain discipline.",
    description: "Your risk manager. Suggests cooling-off periods.",
  },
];

const MOCK_SESSIONS: Record<number, Message[]> = {
  1: [
    {
      id: "h1-1",
      text: "Analyze NVDA performance",
      sender: "user",
      timestamp: new Date("2023-10-26T10:00:00"),
    },
    {
      id: "h1-2",
      text: "NVDA shows a 15% drawdown. You held the loss for 4 hours, indicating Loss Aversion.",
      sender: "bot",
      timestamp: new Date("2023-10-26T10:00:05"),
    },
  ],
  2: [
    {
      id: "h2-1",
      text: "Am I overtrading?",
      sender: "user",
      timestamp: new Date("2023-10-25T14:30:00"),
    },
    {
      id: "h2-2",
      text: "Yes. You executed 12 trades in the last hour. Recommended limit is 5.",
      sender: "bot",
      timestamp: new Date("2023-10-25T14:30:05"),
    },
  ],
  3: [
    {
      id: "h3-1",
      text: "Portfolio Audit",
      sender: "user",
      timestamp: new Date("2023-10-24T09:15:00"),
    },
    {
      id: "h3-2",
      text: "Your Sharpe Ratio is 1.2. Risk adjusted returns are stable.",
      sender: "bot",
      timestamp: new Date("2023-10-24T09:15:10"),
    },
  ],
};

const CHAT_HISTORY_LIST = [
  { id: 1, label: "NVDA Analysis", date: "Today" },
  { id: 2, label: "Overtrading Check", date: "Yesterday" },
  { id: 3, label: "Portfolio Audit", date: "Oct 24" },
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

  const threadIdRef = useRef<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) setUploadedFile(initialFile);
  }, [initialFile]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "init-1",
          text: activeAgent.intro,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }

    connectToBackend();
  }, [activeAgent]);

  const connectToBackend = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName: activeAgent.name }),
      });
      const data = await res.json();
      if (data.threadId) {
        threadIdRef.current = data.threadId;
        console.log("Connected to Thread:", data.threadId);
      }
    } catch (err) {
      console.error("Connection failed (will retry on send):", err);
    }
  };

  const loadHistorySession = (sessionId: number) => {
    const sessionMessages = MOCK_SESSIONS[sessionId];
    if (sessionMessages) {
      setMessages(sessionMessages);
      setIsMenuOpen(false);
    }
  };

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
      let currentThreadId = threadIdRef.current;

      if (!currentThreadId) {
        console.log("Thread ID missing. Attempting to create new session...");
        const startRes = await fetch("http://127.0.0.1:5000/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentName: activeAgent.name }),
        });
        const startData = await startRes.json();
        if (startData.threadId) {
          currentThreadId = startData.threadId;
          threadIdRef.current = currentThreadId;
        } else {
          throw new Error("Failed to create chat session");
        }
      }

      const formData = new FormData();
      formData.append("message", newUserMsg.text);

      formData.append("threadId", currentThreadId!);
      if (uploadedFile) formData.append("file", uploadedFile);

      const response = await fetch("http://127.0.0.1:5000/api/chat/message", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingMsgId)
          .concat({
            id: Date.now().toString(),
            text: data.response || "Sorry, I couldn't process that request.",
            sender: "bot",
            timestamp: new Date(),
          }),
      );

      if (uploadedFile) setUploadedFile(null);
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingMsgId)
          .concat({
            id: Date.now().toString(),
            text: "Error: Unable to connect to the server. Please ensure the backend is running.",
            sender: "bot",
            timestamp: new Date(),
          }),
      );
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

      {isMenuOpen && (
        <div className="absolute top-[60px] left-0 bottom-0 w-64 bg-[#111] border-r border-[rgba(255,255,255,0.1)] z-30 flex flex-col animate-in slide-in-from-left-5 duration-200 overflow-x-hidden">
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="mb-8">
              <h4 className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] font-bold mb-3 pl-2">
                Select Agent
              </h4>
              <div className="space-y-1">
                {AGENTS.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setActiveAgent(agent);
                      setMessages([]);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors duration-200 ${activeAgent.id === agent.id ? "bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.1)]" : "text-muted hover:text-white hover:bg-[rgba(255,255,255,0.05)]"}`}
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

            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] font-bold mb-3 pl-2">
                Chat History
              </h4>
              <div className="space-y-1">
                {CHAT_HISTORY_LIST.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistorySession(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-muted hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare
                        size={14}
                        className="opacity-50 flex-shrink-0"
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-[10px] opacity-40">{item.date}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* INPUT AREA */}
      <div className="bg-[#050505] p-3 border-t border-[rgba(255,255,255,0.1)] relative z-20 shrink-0">
        {!isMenuOpen && messages.length < 3 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputValue(prompt)}
                className="text-[10px] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)] px-2 py-1 rounded-full border border-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <TrendingUp size={10} /> {prompt}
              </button>
            ))}
          </div>
        )}

        {uploadedFile && (
          <div className="flex items-center justify-between bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-lg mb-2 border border-[rgba(255,255,255,0.1)]">
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

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-[#1a1a1a] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DC143C] border border-[rgba(255,255,255,0.1)] text-sm h-[50px] resize-none pt-3.5 scrollbar-hide"
            rows={1}
          />

          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputValue.trim() && !uploadedFile)}
            className={`p-3 rounded-xl transition-all ${
              isLoading || (!inputValue.trim() && !uploadedFile)
                ? "bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] cursor-not-allowed"
                : "bg-[#DC143C] hover:bg-[#b01030] text-white"
            }`}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
