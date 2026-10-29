"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLogout, useMe } from "@/lib/hooks";
import { clearTokens } from "@/lib/api-client";
import {
  BarChart3, CalendarDays, Clapperboard, Globe, Inbox,
  LayoutDashboard, Lightbulb, Link2, LogOut, Mail,
  Rocket, Search, Settings, TrendingUp, Users,
  ChevronRight, Moon, Sun, Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { clsx } from "clsx";

interface NavItem { href: string; icon: React.ReactNode; label: string; badge?: string; comingIn?: string; }

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
  { href: "/admin/leads",     icon: <Users className="w-4 h-4" />,           label: "Leads" },
  { href: "/admin/campaigns", icon: <Mail className="w-4 h-4" />,            label: "Campaigns" },
  { href: "/admin/inbox",     icon: <Inbox className="w-4 h-4" />,           label: "Inbox" },
  { href: "/admin/calendar",  icon: <CalendarDays className="w-4 h-4" />,    label: "Content Calendar" },
  { href: "/admin/ideas",     icon: <Lightbulb className="w-4 h-4" />,       label: "Ideas & Generator" },
  { href: "/admin/video",     icon: <Clapperboard className="w-4 h-4" />,    label: "Video Studio" },
  { href: "/admin/seo",       icon: <Search className="w-4 h-4" />,          label: "SEO Manager" },
  { href: "/admin/launch",    icon: <Rocket className="w-4 h-4" />,          label: "Launch Hub" },
  { href: "/admin/connections",icon: <Link2 className="w-4 h-4" />,          label: "Connections" },
  { href: "/admin/settings",  icon: <Settings className="w-4 h-4" />,        label: "Settings" },
];

/* Active item accent colors per index */
const ACTIVE_COLORS = [
  "bg-indigo-50 dark:bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/25",
  "bg-violet-50 dark:bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/25",
  "bg-cyan-50 dark:bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/25",
  "bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25",
  "bg-fuchsia-50 dark:bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-500/25",
  "bg-amber-50 dark:bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/25",
  "bg-rose-50 dark:bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/25",
  "bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/25",
  "bg-orange-50 dark:bg-orange-500/12 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/25",
  "bg-sky-50 dark:bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/25",
  "bg-slate-50 dark:bg-slate-500/12 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/25",
];
const ACTIVE_ICON_COLORS = [
  "text-indigo-600 dark:text-indigo-400", "text-violet-600 dark:text-violet-400",
  "text-cyan-600 dark:text-cyan-400", "text-emerald-600 dark:text-emerald-400",
  "text-fuchsia-600 dark:text-fuchsia-400", "text-amber-600 dark:text-amber-400",
  "text-rose-600 dark:text-rose-400", "text-teal-600 dark:text-teal-400",
  "text-orange-600 dark:text-orange-400", "text-sky-600 dark:text-sky-400",
  "text-slate-600 dark:text-slate-400",
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMe();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted ? theme === "dark" : true;

  const handleLogout = () => {
    clearTokens();
    document.cookie = "gr_auth=; path=/; max-age=0";
    router.push("/admin/login");
  };

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white dark:bg-[#0d0d14] border-r border-indigo-100 dark:border-white/[0.06] transition-colors shadow-sm shadow-indigo-100/40 dark:shadow-none">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-indigo-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <TrendingUp className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-extrabold text-sm leading-none tracking-tight">GetYourClients</p>
            <p className="text-[10px] font-mono mt-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent font-bold">Growth Engine</p>
          </div>
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">Navigation</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isComingSoon = !!item.comingIn;
          const activeColor = ACTIVE_COLORS[idx % ACTIVE_COLORS.length];
          const activeIconColor = ACTIVE_ICON_COLORS[idx % ACTIVE_ICON_COLORS.length];

          return (
            <button
              key={item.href}
              onClick={() => !isComingSoon && router.push(item.href)}
              disabled={isComingSoon}
              title={isComingSoon ? `Coming in ${item.comingIn}` : item.label}
              className={clsx(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all group",
                isActive
                  ? `border ${activeColor} font-semibold`
                  : isComingSoon
                  ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                  : "text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-white/[0.04] hover:text-indigo-700 dark:hover:text-slate-200 border border-transparent"
              )}
            >
              <span className={clsx(
                "transition-colors",
                isActive ? activeIconColor : isComingSoon ? "text-slate-300 dark:text-slate-700" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-slate-300"
              )}>
                {item.icon}
              </span>
              <span className="flex-1 text-left truncate text-[13px]">{item.label}</span>
              {isComingSoon && (
                <span className="text-[9px] font-mono bg-slate-100 dark:bg-white/[0.05] text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-white/[0.04] shrink-0">
                  {item.comingIn}
                </span>
              )}
              {isActive && !isComingSoon && (
                <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-indigo-100 dark:border-white/[0.06] space-y-2 bg-gradient-to-b from-transparent to-indigo-50/40 dark:to-transparent">
        {user && (
          <div className="px-2 py-2 flex items-center gap-2.5 rounded-xl bg-indigo-50 dark:bg-white/[0.03] border border-indigo-100 dark:border-white/[0.05]">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 truncate">{user.email}</p>
              <p className="text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <div className="flex gap-1.5">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border",
              isDark
                ? "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border-white/[0.06] hover:border-amber-500/20"
                : "text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-100"
            )}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            {isDark ? "Light" : "Dark"}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/[0.08] border border-slate-100 dark:border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
