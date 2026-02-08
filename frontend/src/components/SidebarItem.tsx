import type { ReactNode } from "react";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}

export default function SidebarItem({
  icon,
  label,
  active = false,
  badge,
}: SidebarItemProps) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
        active
          ? "bg-[#DC143C] text-white shadow-[0_4px_20px_rgba(220,20,60,0.4)]"
          : "text-muted hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-white/10 text-[10px] px-1.5 py-0.5 rounded text-white">
          {badge}
        </span>
      )}
    </div>
  );
}
