import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Bot,
  User,
  FileText,
  AlertTriangle,
  TrendingUp,
  X,
} from "lucide-react";
import "../index.css"; // Ensure your Tailwind/CSS is imported

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

// --- INITIAL STATE ---
const INITIAL_MESSAGE: Message = {
  id: "init-1",
  text: "Hello! I am your MarketPulse Bias Detector. Upload your trading history (CSV/Excel) and I can analyze your patterns for Overtrading, Loss Aversion, and Revenge Trading.",
  sender: "bot",
  timestamp: new Date(),
};

const SUGGESTED_PROMPTS = [
  "Analyze for Overtrading",
  "Check for Loss Aversion",
  "Detect Revenge Trading",
  "Summarize my P/L performance",
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- BACKEND INTEGRATION PLACEHOLDER ---
  const processMessageToBackend = async (
    userText: string,
    file: File | null,
  ) => {
    // TODO: REPLACE THIS WITH YOUR ACTUAL API CALL
    // Example:
    // const formData = new FormData();
    // formData.append("message", userText);
    // if (file) formData.append("file", file);
    // const response = await fetch("http://localhost:5000/api/analyze", { method: "POST", body: formData });

    // Simulating API Delay
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        if (file && userText.includes("upload")) {
          resolve(
            `I've received **${file.name}**. I'm analyzing 2,400 trade records...\n\n**Preliminary Insight:**\nI detected a pattern of **Overtrading** between 14:00 and 16:00 EST. Your win rate drops by 15% during high-volatility periods.`,
          );
        } else if (userText.includes("Overtrading")) {
          resolve(
            "Based on your history, your average trades per hour spikes after a loss greater than 2%. This suggests reactive trading. I recommend a cooling-off period rule of 15 minutes after significant drawdowns.",
          );
        } else if (userText.includes("Revenge")) {
          resolve(
            "I found 3 instances where you increased position size by 200% immediately following a loss streak. This is a classic **Revenge Trading** signal. Be careful—this wipes out gains quickly.",
          );
        } else {
          resolve(
            "I'm analyzing your market data against behavioral finance models. Could you clarify if you want me to look at entry/exit timing specifically?",
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

    // Create a temporary "thinking" bot message
    const thinkingMsgId = "thinking-" + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingMsgId,
        text: "Analyzing behavioral patterns...",
        sender: "bot",
        timestamp: new Date(),
        isThinking: true,
      },
    ]);

    try {
      // Call Backend
      const responseText = await processMessageToBackend(
        newUserMsg.text,
        uploadedFile,
      );

      // Remove thinking message and add real response
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

      // Clear file after sending
      if (uploadedFile) setUploadedFile(null);
    } catch (error) {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingMsgId)
          .concat({
            id: Date.now().toString(),
            text: "Error: Unable to connect to the analysis engine. Please check the backend connection.",
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

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] rounded-2xl overflow-hidden shadow-2xl">
      {/* HEADER */}
      <div className="bg-[#111] p-4 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC143C] to-black flex items-center justify-center">
            <Bot size={20} color="white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">
              Bias Detector AI
            </h3>
            <p className="text-[11px] text-[rgba(255,255,255,0.5)] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Online • Ready for CSV/Excel
            </p>
          </div>
        </div>
        <div className="flex gap-2">{/* Optional Top Actions */}</div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.sender === "user"
                  ? "bg-[rgba(255,255,255,0.1)]"
                  : "bg-[rgba(220,20,60,0.1)] border border-[rgba(220,20,60,0.3)]"
              }`}
            >
              {msg.sender === "user" ? (
                <User size={16} className="text-white" />
              ) : (
                <Bot size={16} className="text-[#DC143C]" />
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
                {/* File Attachment Indicator */}
                {msg.attachmentName && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[rgba(255,255,255,0.2)]">
                    <FileText size={14} />
                    <span className="text-xs font-mono">
                      {msg.attachmentName}
                    </span>
                  </div>
                )}

                {/* Text Content (supports basic formatting) */}
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-[rgba(255,255,255,0.3)] mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-[#050505] p-4 border-t border-[rgba(255,255,255,0.1)]">
        {/* Suggested Chips */}
        {messages.length < 3 && (
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
              <span className="text-xs text-[rgba(255,255,255,0.4)]">
                ({(uploadedFile.size / 1024).toFixed(1)} KB)
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
          {/* File Upload Button */}
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
            title="Upload Trading History (CSV/Excel)"
          >
            <Paperclip size={20} />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                uploadedFile
                  ? "Ask about this file..."
                  : "Type a message or upload trading data..."
              }
              className="w-full bg-[#1a1a1a] text-white rounded-xl pl-4 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#DC143C] border border-[rgba(255,255,255,0.1)] resize-none h-[48px] max-h-[120px] scrollbar-hide text-sm"
              rows={1}
            />
          </div>

          {/* Send Button */}
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

        <p className="text-[10px] text-[rgba(255,255,255,0.3)] mt-2 text-center">
          <AlertTriangle size={10} className="inline mb-[2px] mr-1" />
          AI can make mistakes. Please verify important financial data.
        </p>
      </div>
    </div>
  );
}
