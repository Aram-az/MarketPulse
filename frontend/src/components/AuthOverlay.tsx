import { ReactNode } from "react";
import { X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LandingPage from "../pages/landingPage";

export default function AuthOverlay({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      {/* 1. Background Layer: The actual Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <LandingPage />
      </div>

      {/* 2. Overlay Layer: Dark Glassmorphism */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
        {/* 3. The Modal Card */}
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
          {/* Close Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#DC143C] to-black mb-4 border border-white/10">
              <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-muted text-sm">
              Access the MarketPulse Bias Detector
            </p>
          </div>

          {/* Form Content */}
          <div className="px-8 pb-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
