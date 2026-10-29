"use client";

import { Bell, Zap } from "lucide-react";
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

export function TopBar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Growth Engine";

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-indigo-100 dark:border-white/[0.06] bg-white/85 dark:bg-[#0a0a0f]/85 backdrop-blur-xl sticky top-0 z-10 transition-colors shadow-sm shadow-indigo-100/50 dark:shadow-none">
      {/* Page title with gradient accent */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
        <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2.5">
        {/* DRY_RUN badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-sm">
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">DRY_RUN</span>
        </div>

        <ThemeToggle />

        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-white/[0.05] border border-transparent hover:border-indigo-100 dark:hover:border-white/[0.08] transition-all relative group">
          <Bell className="w-4 h-4" />
          {/* notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 border-2 border-white dark:border-[#0a0a0f] group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
}
