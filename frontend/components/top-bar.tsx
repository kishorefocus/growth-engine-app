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
    <header className="h-14 px-6 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-10 transition-colors">
      <h1 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
          <span className="text-[11px] font-mono text-amber-600 dark:text-amber-300 font-semibold">DRY_RUN</span>
        </div>

        <ThemeToggle />

        <button className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all relative">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
