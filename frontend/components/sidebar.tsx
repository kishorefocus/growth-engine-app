"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/lib/hooks";
import { clearTokens } from "@/lib/api-client";
import {
  LayoutDashboard,
  Share2,
  Search,
  Mail,
  Video,
  Sparkles,
  BarChart3,
  Activity,
  Settings,
  ChevronRight,
  LogOut,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview" },
  { href: "/admin/calendar", icon: <Share2 className="w-4 h-4" />, label: "Social" },
  { href: "/admin/seo", icon: <Search className="w-4 h-4" />, label: "SEO" },
  { href: "/admin/campaigns", icon: <Mail className="w-4 h-4" />, label: "Outreach" },
  { href: "/admin/video", icon: <Video className="w-4 h-4" />, label: "Video Studio" },
  { href: "/admin/content-studio", icon: <Sparkles className="w-4 h-4" />, label: "Brand Voice", badge: "AI" },
  { href: "/admin/account-manager", icon: <BarChart3 className="w-4 h-4" />, label: "Analytics" },
  { href: "/admin/connections", icon: <Activity className="w-4 h-4" />, label: "Engine Health", badge: "99.9%" },
  { href: "/admin/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMe();

  // Close mobile sidebar on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  const handleLogout = () => {
    clearTokens();
    document.cookie = "gr_auth=; path=/; max-age=0";
    router.push("/admin/login");
  };

  const sidebarContent = (
    <aside
      className="w-64 h-full flex flex-col justify-between select-none relative z-20"
      style={{
        background: "linear-gradient(180deg, #070814 0%, #05060D 100%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Top Section */}
      <div>
        {/* Brand Logo & Close */}
        <div
          className="h-16 px-5 flex items-center justify-between border-b"
          style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
        >
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center p-1.5 shadow-lg transition-transform group-hover:scale-105 overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 0 20px rgba(124, 92, 255, 0.35)",
              }}
            >
              <img src="/images/logo.png" alt="GetYourClientsB2B" className="w-full h-full object-contain" />
            </div>
            <div>
              <span
                className="font-extrabold text-sm text-white block tracking-tight leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                GetYourClientsB2B
              </span>
              <span className="text-[10px] font-medium text-[#A1A6C0] tracking-wider block mt-0.5">
                GROWTH ENGINE
              </span>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Worker Active telemetry status chip */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="px-3 py-2 rounded-xl border flex items-center justify-between"
            style={{
              background: "rgba(16, 185, 129, 0.06)",
              borderColor: "rgba(16, 185, 129, 0.2)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-emerald-400">Worker Active</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
              18ms SLA
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group overflow-hidden",
                  isActive
                    ? "text-white"
                    : "text-[#A1A6C0] hover:text-white hover:bg-white/[0.04]"
                )}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(90deg, rgba(124, 92, 255, 0.16) 0%, rgba(59, 130, 246, 0.08) 100%)",
                        border: "1px solid rgba(124, 92, 255, 0.35)",
                        boxShadow: "0 0 24px rgba(124, 92, 255, 0.18)",
                      }
                    : { border: "1px solid transparent" }
                }
              >
                {/* Glowing left bar for active item */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{
                      background: "linear-gradient(180deg, #7C5CFF, #22D3EE)",
                      boxShadow: "0 0 10px #7C5CFF",
                    }}
                  />
                )}

                {/* Icon square */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(135deg, #7C5CFF, #3B82F6)",
                          color: "#FFFFFF",
                          boxShadow: "0 2px 10px rgba(124, 92, 255, 0.4)",
                        }
                      : {
                          background: "rgba(255, 255, 255, 0.04)",
                          color: "#A1A6C0",
                        }
                  }
                >
                  {item.icon}
                </div>

                <span className="flex-1 truncate tracking-wide">{item.label}</span>

                {item.badge && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider shrink-0"
                    style={{
                      background: isActive ? "rgba(124, 92, 255, 0.3)" : "rgba(255, 255, 255, 0.06)",
                      color: isActive ? "#C9B8FF" : "#A1A6C0",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 text-violet-300" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div
        className="p-3 border-t space-y-2"
        style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
      >
        <div
          className="p-2.5 rounded-xl flex items-center gap-3 border"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 255, 255, 0.06)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #7C5CFF 0%, #FF3D8B 100%)",
              boxShadow: "0 0 12px rgba(255, 61, 139, 0.35)",
            }}
          >
            {user?.email ? user.email[0].toUpperCase() : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.email || "agency@getyourclients.com"}
            </p>
            <p
              className="text-[10px] font-semibold tracking-wide capitalize"
              style={{ color: "#7FE0D3" }}
            >
              {user?.role || "Owner (SLA Active)"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-[#A1A6C0] hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden shadow-2xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
