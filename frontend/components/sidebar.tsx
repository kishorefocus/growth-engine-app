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

/* Vibrant multi-color accent system: blue, green, pink, red, yellow, cyan with high contrast in both modes */
const ACTIVE_COLORS = [
  "bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/60 font-bold",
  "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 font-bold",
  "bg-pink-50 dark:bg-pink-950/50 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-700/60 font-bold",
  "bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700/60 font-bold",
  "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-bold",
  "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/60 font-bold",
  "bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700/60 font-bold",
  "bg-violet-50 dark:bg-violet-950/50 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-700/60 font-bold",
  "bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700/60 font-bold",
  "bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700/60 font-bold",
  "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60 font-bold",
];
const ACTIVE_ICON_COLORS = [
  "text-blue-600 dark:text-blue-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-pink-600 dark:text-pink-400",
  "text-red-600 dark:text-red-400",
  "text-amber-600 dark:text-yellow-400",
  "text-cyan-600 dark:text-cyan-400",
  "text-green-600 dark:text-green-400",
  "text-violet-600 dark:text-violet-400",
  "text-orange-600 dark:text-orange-400",
  "text-teal-600 dark:text-teal-400",
  "text-indigo-600 dark:text-indigo-400",
];

/* Icon glow colors for the logo strip on each nav item */
const ITEM_GRADIENT = [
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-pink-500 to-rose-400",
  "from-red-500 to-orange-400",
  "from-amber-400 to-yellow-500",
  "from-cyan-500 to-sky-400",
  "from-green-500 to-emerald-400",
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
      "bg-white dark:bg-[#0c0e17]",
      "border-r border-slate-200 dark:border-slate-800",
      "transition-colors shadow-xl shadow-slate-200/50 dark:shadow-black/70"
    )}>

      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-200 dark:border-slate-800">
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
            className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-slate-200 dark:border-slate-700"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[9px] font-black uppercase tracking-[0.18em] bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">Navigation</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isComingSoon = !!item.comingIn;
          const activeColor = ACTIVE_COLORS[idx % ACTIVE_COLORS.length];
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
                  ? `border ${activeColor} shadow-sm`
                  : isComingSoon
                  ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-700 dark:hover:text-white font-medium border border-transparent"
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
                  ? "text-slate-400 dark:text-slate-600"
                  : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-800"
              )}>
                {item.icon}
              </span>

              <span className="flex-1 text-left truncate text-[13px]">{item.label}</span>

              {isComingSoon && (
                <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
                  {item.comingIn}
                </span>
              )}
              {isActive && !isComingSoon && (
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/70 dark:bg-slate-900/40">
        {user && (
          <div className="px-2 py-2 flex items-center gap-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 via-pink-500 to-green-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{user.email}</p>
              <p className="text-[10px] font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-green-500 dark:from-blue-400 dark:via-pink-400 dark:to-green-400 bg-clip-text text-transparent capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <div className="flex gap-1.5">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border",
              isDark
                ? "text-yellow-400 bg-slate-800/80 hover:bg-slate-700 border-slate-700"
                : "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-sm"
            )}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
            {isDark ? "Light" : "Dark"}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden animate-slide-in-left bg-white dark:bg-[#0c0e17] shadow-2xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
