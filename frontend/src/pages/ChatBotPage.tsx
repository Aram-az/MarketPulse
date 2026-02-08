import ChatBot from "../components/Chatbot";
import stockBackdrop from "/stockBackdrop.png";

export default function ChatBotPage() {
  return (
    <main
      className="relative flex flex-col items-center justify-center p-4"
      style={{
        minHeight: "calc(100vh - 80px)",
        backgroundImage: `url(${stockBackdrop})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/85 z-0" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8 mb-16">
        <div className="text-center">
          <h1 className="h1 text-white mb-2">AI Bias Detector</h1>
          <p className="text-muted text-lg">
            Upload your trading history to detect behavioral patterns.
          </p>
        </div>

        <div className="w-full h-[600px] bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <ChatBot />
        </div>
      </div>
    </main>
  );
}
