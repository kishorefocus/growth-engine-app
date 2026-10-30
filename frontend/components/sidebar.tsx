"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/lib/hooks";
import { clearTokens } from "@/lib/api-client";
import {
  BarChart3, CalendarDays, Clapperboard, Globe, Inbox,
  LayoutDashboard, Lightbulb, Link2, LogOut, Mail,
  Rocket, Search, Settings, TrendingUp, Users,
  ChevronRight, Moon, Sun, Sparkles, X, Menu,
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

/* Vibrant multi-color accent system: blue, green, pink, red, yellow, cyan */
const ACTIVE_COLORS = [
  "bg-blue-50 dark:bg-blue-500/12 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/25",
  "bg-green-50 dark:bg-green-500/12 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/25",
  "bg-pink-50 dark:bg-pink-500/12 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-500/25",
  "bg-red-50 dark:bg-red-500/12 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/25",
  "bg-yellow-50 dark:bg-yellow-500/12 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/25",
  "bg-cyan-50 dark:bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/25",
  "bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25",
  "bg-violet-50 dark:bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/25",
  "bg-orange-50 dark:bg-orange-500/12 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/25",
  "bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/25",
  "bg-indigo-50 dark:bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/25",
];
const ACTIVE_ICON_COLORS = [
  "text-blue-600 dark:text-blue-400",
  "text-green-600 dark:text-green-400",
  "text-pink-600 dark:text-pink-400",
  "text-red-600 dark:text-red-400",
  "text-yellow-600 dark:text-yellow-400",
  "text-cyan-600 dark:text-cyan-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-violet-600 dark:text-violet-400",
  "text-orange-600 dark:text-orange-400",
  "text-teal-600 dark:text-teal-400",
  "text-indigo-600 dark:text-indigo-400",
];

/* Icon glow colors for the logo strip on each nav item */
const ITEM_GRADIENT = [
  "from-blue-500 to-cyan-400",
  "from-green-500 to-emerald-400",
  "from-pink-500 to-rose-400",
  "from-red-500 to-orange-400",
  "from-yellow-400 to-amber-500",
  "from-cyan-500 to-sky-400",
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-400",
  "from-orange-500 to-amber-400",
  "from-teal-500 to-cyan-400",
  "from-indigo-500 to-blue-400",
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMe();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted ? theme === "dark" : true;

  // Close mobile sidebar on route change
  useEffect(() => { onClose(); }, [pathname]);

  const handleLogout = () => {
    clearTokens();
    document.cookie = "gr_auth=; path=/; max-age=0";
    router.push("/admin/login");
  };

  const sidebarContent = (
    <aside className={clsx(
      "w-64 shrink-0 h-full flex flex-col",
      "bg-white/95 dark:bg-[#0d0d14]/98",
      "border-r border-blue-100/80 dark:border-white/[0.06]",
      "transition-colors shadow-xl shadow-blue-100/30 dark:shadow-black/40",
      "backdrop-blur-xl"
    )}>

      {/* Logo */}
      <div className="px-4 py-5 border-b border-blue-100/60 dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse-slow">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-slate-900 dark:text-white font-extrabold text-sm leading-none tracking-tight">GetYourClients</p>
              <p className="text-[10px] font-mono mt-0.5 bg-gradient-to-r from-blue-600 via-pink-500 to-green-500 dark:from-blue-400 dark:via-pink-400 dark:to-green-400 bg-clip-text text-transparent font-bold">Growth Engine</p>
            </div>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[9px] font-black uppercase tracking-[0.18em] bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">Navigation</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isComingSoon = !!item.comingIn;
          const activeColor = ACTIVE_COLORS[idx % ACTIVE_COLORS.length];
          const activeIconColor = ACTIVE_ICON_COLORS[idx % ACTIVE_ICON_COLORS.length];
          const gradient = ITEM_GRADIENT[idx % ITEM_GRADIENT.length];

          return (
            <button
              key={item.href}
              onClick={() => !isComingSoon && router.push(item.href)}
              disabled={isComingSoon}
              title={isComingSoon ? `Coming in ${item.comingIn}` : item.label}
              className={clsx(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all group relative overflow-hidden",
                isActive
                  ? `border ${activeColor} font-semibold shadow-sm`
                  : isComingSoon
                  ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                  : "text-slate-600 dark:text-slate-400 hover:bg-blue-50/80 dark:hover:bg-white/[0.04] hover:text-blue-700 dark:hover:text-slate-200 border border-transparent"
              )}
            >
              {/* Active left-accent strip */}
              {isActive && (
                <span className={clsx("absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b", gradient)} />
              )}

              {/* Icon wrapper */}
              <span className={clsx(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                isActive
                  ? `bg-gradient-to-br ${gradient} text-white shadow-sm`
                  : isComingSoon
                  ? "text-slate-300 dark:text-slate-700"
                  : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-slate-300 group-hover:bg-blue-100/60 dark:group-hover:bg-white/[0.06]"
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
      <div className="px-3 py-3 border-t border-blue-100/60 dark:border-white/[0.06] space-y-2 bg-gradient-to-b from-transparent to-blue-50/40 dark:to-transparent">
        {user && (
          <div className="px-2 py-2 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-pink-50/50 dark:bg-white/[0.03] border border-blue-100/80 dark:border-white/[0.05]">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 via-pink-500 to-green-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 truncate">{user.email}</p>
              <p className="text-[10px] font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-green-500 dark:from-blue-400 dark:via-pink-400 dark:to-green-400 bg-clip-text text-transparent capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <div className="flex gap-1.5">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border",
              isDark
                ? "text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 border-white/[0.06] hover:border-yellow-500/20"
                : "text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-100"
            )}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
            {isDark ? "Light" : "Dark"}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] border border-slate-100 dark:border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />Sign out
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — slide-in overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden animate-slide-in-left">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
