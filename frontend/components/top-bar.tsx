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
    <header className="h-14 px-3 sm:px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e17] backdrop-blur-xl sticky top-0 z-10 transition-colors shadow-sm shadow-slate-200/50 dark:shadow-none">

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-sm"
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
        <div className="hidden xs:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 shadow-sm">
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 hidden sm:block">DRY_RUN</span>
        </div>

        <ThemeToggle />

        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all relative group active:scale-95 shadow-sm">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 border-2 border-white dark:border-[#0c0e17] group-hover:scale-110 transition-transform animate-pulse" />
        </button>
      </div>
    </header>
  );
}
