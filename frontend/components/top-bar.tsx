"use client";

import { Bell, Menu, Search, Zap, CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMe } from "@/lib/hooks";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Executive Overview",
  "/admin/calendar": "Social Content Calendar",
  "/admin/seo": "Programmatic SEO Manager",
  "/admin/campaigns": "CAN-SPAM Outreach Sequences",
  "/admin/video": "Video & Shorts Script Studio",
  "/admin/content-studio": "Brand Voice & Content Studio",
  "/admin/account-manager": "Attribution & Client Analytics",
  "/admin/connections": "Engine Health & API SLA",
  "/admin/settings": "System Settings",
  "/admin/leads": "Verified B2B Leads",
  "/admin/inbox": "Unified Growth Inbox",
  "/admin/ideas": "Content Idea Generator",
  "/admin/trend-radar": "Market Trend Radar",
  "/admin/launch": "Launch & Directory Hub",
};

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const { data: user } = useMe();
  const title = PAGE_TITLES[pathname] || "Growth Engine";

  // Dispatch custom event to trigger Command Palette in dashboard/shell
  const triggerCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <header
      className="h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 transition-colors"
      style={{
        background: "rgba(5, 6, 13, 0.85)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Left: Mobile Menu & Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-white/5 border border-white/10 transition-all active:scale-95"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-1.5 h-5 rounded-full"
            style={{ background: "linear-gradient(180deg, #7C5CFF, #22D3EE)" }}
          />
          <h1
            className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[160px] sm:max-w-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Search / Command Palette Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          type="button"
          onClick={triggerCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all text-left"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#A1A6C0",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(124, 92, 255, 0.4)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
          }}
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-violet-400" />
            <span>Search pages, posts, leads...</span>
          </div>
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#C9B8FF",
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Worker Active status, Notifications, User Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Worker Active status badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            borderColor: "rgba(16, 185, 129, 0.25)",
            color: "#34D399",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline text-[11px] font-bold">Worker Active</span>
          <span className="sm:hidden text-[11px] font-bold">Active</span>
        </div>

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition-all relative group"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#FF3D8B", boxShadow: "0 0 8px #FF3D8B" }}
          />
        </button>

        {/* User Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white cursor-pointer select-none"
          style={{
            background: "linear-gradient(135deg, #7C5CFF 0%, #3B82F6 100%)",
            boxShadow: "0 0 14px rgba(124, 92, 255, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          title={user?.email || "Admin"}
        >
          {user?.email ? user.email[0].toUpperCase() : "G"}
        </div>
      </div>
    </header>
  );
}
