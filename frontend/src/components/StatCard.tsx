import {
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive?: boolean;
  isAlert?: boolean;
}

export default function StatCard({
  label,
  value,
  change,
  isPositive,
  isAlert,
}: StatCardProps) {
  return (
    <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] p-6 rounded-2xl hover:border-[#DC143C]/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-muted text-sm font-medium">{label}</h4>
        <div className="p-2 bg-[rgba(255,255,255,0.05)] rounded-lg group-hover:bg-[#DC143C]/20 transition-colors">
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
            ? "text-[#DC143C] font-bold" // Red for Risk
            : isPositive
              ? "text-green-400 font-bold" // Green for Calm/Profit
              : "text-red-400"
        }`}
      >
        {isAlert && <AlertTriangle size={12} />}
        {isPositive && <CheckCircle size={12} />}

        {/* Default Arrows if not explicit Alert/Positive */}
        {!isPositive && !isAlert && <ArrowDownRight size={12} />}

        {change}
      </div>
    </div>
  );
}
