"use client";

import { Bell, Menu, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/settings": "Settings",
  "/admin/leads": "Leads",
  "/admin/campaigns": "Campaigns",
  "/admin/inbox": "Inbox",
  "/admin/calendar": "Content Calendar",
  "/admin/ideas": "Ideas & Generator",
  "/admin/video": "Video Studio",
  "/admin/seo": "SEO Manager",
  "/admin/launch": "Launch Hub",
  "/admin/connections": "Connections",
};

const PAGE_GRADIENTS: Record<string, string> = {
  "/admin/dashboard": "from-blue-500 to-cyan-400",
  "/admin/leads": "from-green-500 to-emerald-400",
  "/admin/campaigns": "from-pink-500 to-rose-400",
  "/admin/inbox": "from-violet-500 to-purple-400",
  "/admin/calendar": "from-yellow-400 to-orange-400",
  "/admin/ideas": "from-amber-400 to-yellow-300",
  "/admin/video": "from-red-500 to-pink-400",
  "/admin/seo": "from-teal-500 to-cyan-400",
  "/admin/launch": "from-orange-500 to-red-400",
  "/admin/connections": "from-indigo-500 to-blue-400",
  "/admin/settings": "from-slate-500 to-slate-400",
};

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Growth Engine";
  const gradient = PAGE_GRADIENTS[pathname] || "from-blue-500 to-violet-500";

  return (
    <header className="h-14 px-3 sm:px-6 flex items-center justify-between border-b border-blue-100/70 dark:border-white/[0.06] bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-xl sticky top-0 z-10 transition-colors shadow-sm shadow-blue-100/40 dark:shadow-none">

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/[0.06] border border-transparent hover:border-blue-100 dark:hover:border-white/[0.1] transition-all active:scale-95"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title with color-coded gradient accent */}
        <div className="flex items-center gap-2.5">
          <div className={`w-1 h-5 rounded-full bg-gradient-to-b ${gradient} shadow-sm`} />
          <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[140px] sm:max-w-none">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* DRY_RUN badge — hidden on very small screens */}
        <div className="hidden xs:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 shadow-sm">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-yellow-600 dark:text-yellow-400 hidden sm:block">DRY_RUN</span>
        </div>

        <ThemeToggle />

        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/[0.05] border border-transparent hover:border-blue-100 dark:hover:border-white/[0.08] transition-all relative group active:scale-95">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 border-2 border-white dark:border-[#0a0a0f] group-hover:scale-110 transition-transform animate-pulse" />
        </button>
      </div>
    </header>
  );
}
