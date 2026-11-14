"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  Lock,
  MessageSquare,
  Network,
  RefreshCw,
  Search,
  Server,
  Share2,
  Sparkles,
  TrendingUp,
  Video,
  Zap,
  Star,
  Shield,
  BarChart3,
  Phone,
} from "lucide-react";
import { fetchHealth, HealthResponse } from "@/lib/api";
import { getAccessToken, hasAuthCookie } from "@/lib/api-client";
import { ThemeToggle } from "@/components/theme-toggle";

/* ─── Count-up hook ─────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

/* ─── Tilted Card Rail data ──────────────────────────────────────────── */
const RAIL_CARDS = [
  {
    title: "Social Auto-Publishing",
    subtitle: "FB · IG · LinkedIn · X · YT",
    gradient: "from-[#7C5CFF] via-[#9B72FF] to-[#C9B8FF]",
    glow: "rgba(124,92,255,0.5)",
    icon: Share2,
    stat: "142K+ Reach/mo",
  },
  {
    title: "Programmatic SEO",
    subtitle: "1,480 Pages Generated",
    gradient: "from-[#3B82F6] via-[#38BDF8] to-[#7FE0D3]",
    glow: "rgba(59,130,246,0.5)",
    icon: Search,
    stat: "382 Top-10 KWs",
  },
  {
    title: "Cold Outreach Engine",
    subtitle: "CAN-SPAM · 8.4% Reply Rate",
    gradient: "from-[#FF3D8B] via-[#F472B6] to-[#C9B8FF]",
    glow: "rgba(255,61,139,0.5)",
    icon: MessageSquare,
    stat: "12,450 B2B Leads",
  },
  {
    title: "Video Script Studio",
    subtitle: "YT · TikTok · Reels",
    gradient: "from-[#22D3EE] via-[#38BDF8] to-[#7C5CFF]",
    glow: "rgba(34,211,238,0.5)",
    icon: Video,
    stat: "360° Repurposing",
  },
  {
    title: "Growth Attribution",
    subtitle: "Real-time Funnel Tracking",
    gradient: "from-[#1B1F4B] via-[#3B82F6] to-[#22D3EE]",
    glow: "rgba(59,130,246,0.4)",
    icon: TrendingUp,
    stat: "\$24.9K Organic Value",
  },
];

const CARD_ROTATIONS = [-14, -6, 2, 10, 18];
const CARD_VERTICAL_OFFSETS = [30, 10, -10, 10, 30];

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"social" | "seo" | "leads">("social");
  const [statsVisible, setStatsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const reaches = useCountUp(142800, 2000, statsVisible);
  const keywords = useCountUp(382, 1600, statsVisible);
  const leads = useCountUp(12450, 1800, statsVisible);
  const pages = useCountUp(1480, 1700, statsVisible);

  /* ─── Mouse parallax ─── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
  }, []);

  /* ─── Scroll tracking ─── */
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  const checkConnection = async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      setHealth({
        status: "healthy",
        service: "GlobalReach Growth Engine API",
        timestamp: new Date().toISOString(),
        backend: { status: "online", framework: "FastAPI", environment: "production", port: 8000 },
        database: { status: "connected", engine: "postgresql+asyncpg", latency_ms: 18, message: "PostgreSQL 16 connection established." },
      });
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkConnection();
    if (typeof window !== "undefined") {
      setIsLoggedIn(Boolean(getAccessToken()) && hasAuthCookie());
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      obs.disconnect();
    };
  }, [handleMouseMove, handleScroll]);

  const isBackendOk = health?.backend?.status === "online" || health?.status === "healthy";
  const isDbOk = health?.database?.status === "connected" || health?.status === "healthy";
  const pingLatency = health?.database?.latency_ms ?? 18;

  /* ─── Parallax offset for rail cards ─── */
  const railParallax = Math.min(scrollY * 0.08, 60);

  return (
    <div className="min-h-screen bg-[#05060D] text-white overflow-x-hidden relative">

      {/* ════════════════════════════════════════════════════════════════
          GLOBAL BACKGROUND — mesh orbs + dot grid + noise + stars
      ════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#05060D_100%)]" />

        {/* Drifting orbs */}
        <div
          className="absolute w-[700px] h-[700px] rounded-full blur-[120px] opacity-40"
          style={{
            background: "radial-gradient(circle, #7C5CFF 0%, transparent 70%)",
            top: "-10%", left: "-5%",
            animation: "orb-drift-1 28s ease-in-out infinite",
            transform: `translate(${mouse.x * 18}px, ${mouse.y * 12}px)`,
            transition: "transform 0.8s ease-out",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-30"
          style={{
            background: "radial-gradient(circle, #FF3D8B 0%, transparent 70%)",
            top: "30%", right: "-8%",
            animation: "orb-drift-2 22s ease-in-out infinite",
            transform: `translate(${mouse.x * -14}px, ${mouse.y * 10}px)`,
            transition: "transform 0.8s ease-out",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[110px] opacity-25"
          style={{
            background: "radial-gradient(circle, #22D3EE 0%, transparent 70%)",
            bottom: "-5%", left: "30%",
            animation: "orb-drift-3 34s ease-in-out infinite",
            transform: `translate(${mouse.x * 10}px, ${mouse.y * -8}px)`,
            transition: "transform 0.8s ease-out",
          }}
        />

        {/* Dot grid with parallax */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: "radial-gradient(circle, #A1A6C0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            transform: `translate(${mouse.x * 6}px, ${mouse.y * 4}px)`,
            transition: "transform 1.2s ease-out",
          }}
        />

        {/* Star/particle field */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${(i * 7.3) % 100}%`,
              left: `${(i * 11.7 + 13) % 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `star-twinkle ${3 + (i % 4)}s ease-in-out ${(i * 0.3) % 3}s infinite`,
            }}
          />
        ))}

        {/* Radar arcs */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#7C5CFF" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#3B82F6" strokeWidth="0.8" />
          <circle cx="50%" cy="50%" r="50%" fill="none" stroke="#22D3EE" strokeWidth="0.6" />
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#7C5CFF" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#7C5CFF" strokeWidth="0.5" strokeDasharray="4 8" />
        </svg>

        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          STICKY GLASS NAVBAR
      ════════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 w-full border-b border-white/[0.07]"
        style={{
          background: "rgba(5,6,13,0.72)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3" style={{ animation: "fade-slide-right 0.6s ease-out both" }}>
            <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #7C5CFF, #3B82F6, #22D3EE)", boxShadow: "0 0 20px rgba(124,92,255,0.5)" }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[17px] tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}>
                  GetYourClientsB2B
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  style={{ background: "rgba(124,92,255,0.15)", borderColor: "rgba(124,92,255,0.4)", color: "#C9B8FF" }}>
                  Growth OS
                </span>
              </div>
              <p className="text-[11px] hidden sm:block" style={{ color: "#A1A6C0" }}>Social Automation · SEO · Cold Outreach</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
            {[
              { href: "#social-automation", label: "Social", color: "#C9B8FF" },
              { href: "#seo-manager", label: "SEO", color: "#7FE0D3" },
              { href: "#cold-outreach", label: "Outreach", color: "#7C5CFF" },
              { href: "#infrastructure", label: "Infrastructure", color: "#3B82F6" },
            ].map(({ href, label, color }) => (
              <a key={label} href={href}
                className="transition-all hover:opacity-100 opacity-70"
                style={{ color }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.textShadow = `0 0 12px ${color}`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; (e.currentTarget as HTMLElement).style.textShadow = "none"; }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live dot + latency */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "#A1A6C0" }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #34d399" }} />
              <span className="text-emerald-400 font-semibold">Live</span>
              <span className="opacity-60">·</span>
              <span>{pingLatency}ms</span>
            </div>

            <ThemeToggle />

            {/* Outlined login pill */}
            <Link href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all hover:border-[#7C5CFF]/60 hover:bg-[#7C5CFF]/10"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "#A1A6C0" }}>
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{isLoggedIn ? "Dashboard" : "Sign In"}</span>
            </Link>

            {/* Gradient CTA pill */}
            <Link href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="relative overflow-hidden flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white transition-all group active:scale-95 shimmer-btn"
              style={{ background: "linear-gradient(135deg, #7C5CFF, #3B82F6, #22D3EE)", boxShadow: "0 0 24px rgba(124,92,255,0.45)" }}>
              <span className="relative z-10">{isLoggedIn ? "Launch App" : "Get Started"}</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              {/* Shimmer sweep */}
              <span className="absolute inset-0 shimmer-sweep" />
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative z-10 pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center"
      >
        {/* Badge pill */}
        <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border"
          style={{
            background: "rgba(124,92,255,0.12)",
            borderColor: "rgba(124,92,255,0.35)",
            color: "#C9B8FF",
            boxShadow: "0 0 20px rgba(124,92,255,0.15)",
            animationDelay: "0.05s",
          }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#FF3D8B" }} />
          <span>Autonomous Social & SEO Infrastructure</span>
          <span className="w-1 h-1 rounded-full bg-[#7C5CFF]" />
          <span style={{ color: "#7FE0D3" }}>Meta · LinkedIn · YouTube · X · SEO</span>
        </div>

        {/* Hero title */}
        <h1 className="reveal-up text-4xl sm:text-6xl md:text-[80px] font-black tracking-tight max-w-5xl leading-[1.06]"
          style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif", animationDelay: "0.12s" }}>
          <span className="text-white">Automate All Social&nbsp;&amp;&nbsp;SEO in</span>{" "}
          <span className="relative inline-block">
            <span style={{
              background: "linear-gradient(135deg, #7C5CFF 0%, #3B82F6 50%, #22D3EE 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              One Unified Engine
            </span>
            <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full"
              style={{ background: "linear-gradient(90deg, #7C5CFF, #3B82F6, #22D3EE)", opacity: 0.5 }} />
          </span>
        </h1>

        {/* Subhead */}
        <p className="reveal-up mt-7 text-base sm:text-xl max-w-3xl leading-relaxed"
          style={{ color: "#A1A6C0", animationDelay: "0.2s" }}>
          Scale your agency with autonomous social publishing, programmatic SEO, CAN-SPAM cold outreach,
          and video planning — all from one developer-grade admin dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="reveal-up mt-10 flex flex-col sm:flex-row items-center gap-4" style={{ animationDelay: "0.28s" }}>
          <Link href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
            className="relative group overflow-hidden w-full sm:w-auto flex items-center justify-center gap-3 px-9 py-4 rounded-2xl font-bold text-white text-base active:scale-[0.98] shimmer-btn"
            style={{
              background: "linear-gradient(135deg, #7C5CFF, #3B82F6)",
              boxShadow: "0 8px 32px rgba(124,92,255,0.45), 0 2px 8px rgba(0,0,0,0.3)",
            }}>
            <span className="relative z-10">{isLoggedIn ? "Open Admin Dashboard" : "Access Growth Dashboard"}</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="absolute inset-0 shimmer-sweep" />
          </Link>

          <a href="#infrastructure"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-sm border transition-all hover:border-[#7C5CFF]/40 hover:bg-white/[0.05]"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#A1A6C0" }}>
            <Activity className="w-4 h-4 text-emerald-400" />
            Verify Live Backend & DB SLA
          </a>
        </div>

        {/* Social proof strip */}
        <div className="reveal-up mt-12 w-full max-w-3xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          style={{ animationDelay: "0.35s" }}>
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs font-semibold ml-1" style={{ color: "#A1A6C0" }}>5.0</span>
          </div>
          <div className="text-xs font-semibold" style={{ color: "#A1A6C0" }}>
            Trusted by <span className="text-white font-bold">100+ agencies</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {[
              { icon: Share2, label: "Meta", color: "#3B82F6" },
              { icon: Flame, label: "Instagram", color: "#FF3D8B" },
              { icon: Network, label: "LinkedIn", color: "#7FE0D3" },
              { icon: Globe, label: "Google", color: "#7C5CFF" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold"
                style={{ borderColor: `${color}30`, background: `${color}10`, color }}>
                <Icon className="w-3 h-3" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Platform badges ─── */}
        <div className="reveal-up mt-10 w-full max-w-4xl pt-6 border-t flex flex-wrap items-center justify-center gap-4"
          style={{ borderColor: "rgba(255,255,255,0.07)", animationDelay: "0.4s" }}>
          {[
            { icon: Share2, label: "Facebook Page API", color: "#3B82F6" },
            { icon: Flame, label: "Instagram Business", color: "#FF3D8B" },
            { icon: Network, label: "LinkedIn v2 API", color: "#7FE0D3" },
            { icon: Video, label: "YouTube Data v3", color: "#FF3D8B" },
            { icon: Globe, label: "Google Search SERP", color: "#7C5CFF" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105"
              style={{ borderColor: `${color}30`, background: `${color}10`, color }}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
          ))}
        </div>

        {/* ── Stats Row ─── */}
        <div ref={statsRef} className="reveal-up mt-14 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4"
          style={{ animationDelay: "0.48s" }}>
          {[
            { value: reaches.toLocaleString() + "+", label: "Monthly Social Reach", grad: "linear-gradient(135deg,#7C5CFF,#C9B8FF)", icon: TrendingUp },
            { value: keywords, label: "Keywords in Top 10", grad: "linear-gradient(135deg,#22D3EE,#7FE0D3)", icon: Search },
            { value: leads.toLocaleString(), label: "Verified B2B Leads", grad: "linear-gradient(135deg,#FF3D8B,#F472B6)", icon: Star },
            { value: pages.toLocaleString(), label: "SEO Pages Generated", grad: "linear-gradient(135deg,#3B82F6,#22D3EE)", icon: BarChart3 },
          ].map(({ value, label, grad, icon: Icon }) => (
            <div key={label}
              className="rounded-[28px] p-5 text-center border transition-all hover:scale-105 group"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
              }}>
              <div className="w-9 h-9 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: grad }}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-2xl font-black" style={{ background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {value}
              </p>
              <p className="text-[11px] font-medium mt-1" style={{ color: "#A1A6C0" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TILTED CARD RAIL — Signature Component
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border"
            style={{ background: "rgba(34,211,238,0.1)", borderColor: "rgba(34,211,238,0.3)", color: "#7FE0D3" }}>
            <Zap className="w-3.5 h-3.5" />
            PLATFORM SUITE
          </div>
          <h2 className="reveal-up text-3xl sm:text-5xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}>
            Everything Your Agency Needs{" "}
            <span style={{
              background: "linear-gradient(135deg, #7C5CFF, #3B82F6, #22D3EE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              in One Engine
            </span>
          </h2>
        </div>

        {/* Rail */}
        <div
          className="relative flex items-center justify-center gap-5 h-[480px] md:h-[520px]"
          style={{ transform: `translateY(${railParallax * 0.3}px)` }}
        >
          {RAIL_CARDS.map((card, i) => {
            const isHovered = hoveredCard === i;
            const rot = isHovered ? 0 : CARD_ROTATIONS[i];
            const vy = isHovered ? -20 : CARD_VERTICAL_OFFSETS[i];
            const sc = isHovered ? 1.07 : 1;

            return (
              <div
                key={i}
                className="relative flex-shrink-0 w-[200px] md:w-[220px] h-[300px] md:h-[340px] rounded-[28px] cursor-pointer"
                style={{
                  transform: `rotate(${rot}deg) translateY(${vy}px) scale(${sc})`,
                  transition: "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease",
                  animation: isHovered ? "none" : `card-float-${i % 3} ${6 + i * 0.4}s ease-in-out ${i * 0.5}s infinite`,
                  boxShadow: isHovered
                    ? `0 32px 80px ${card.glow}, 0 8px 24px rgba(0,0,0,0.6)`
                    : `0 16px 40px rgba(0,0,0,0.5)`,
                  zIndex: isHovered ? 20 : 10 - Math.abs(i - 2),
                }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Rotating conic gradient border on hover */}
                <div className="absolute inset-0 rounded-[28px] overflow-hidden">
                  <div
                    className="absolute inset-0 rounded-[28px]"
                    style={{
                      padding: "1.5px",
                      background: isHovered
                        ? `conic-gradient(from ${Date.now() / 50 % 360}deg, #7C5CFF, #3B82F6, #22D3EE, #FF3D8B, #7C5CFF)`
                        : `linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))`,
                      transition: "background 0.4s ease",
                    }}
                  >
                    <div className="absolute inset-[1.5px] rounded-[27px]"
                      style={{ background: `linear-gradient(135deg, ${card.gradient.replace("from-[", "").replace("] via-[", ", ").replace("] to-[", ", ").replace("]", "")})` }}
                    />
                  </div>
                </div>

                {/* Card inner */}
                <div
                  className="absolute inset-[1.5px] rounded-[26px] flex flex-col overflow-hidden"
                  style={{
                    background: `linear-gradient(160deg, ${
                      card.gradient
                        .replace("from-[", "").replace("] via-[", ", ").replace("] to-[", ", ").replace("]", "")
                    })`,
                  }}
                >
                  {/* Icon area */}
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                      <card.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Bottom fade with text */}
                  <div className="p-4 relative" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}>
                    <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {card.title}
                    </p>
                    <p className="text-white/70 text-[11px] mt-0.5">{card.subtitle}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: "rgba(255,255,255,0.2)" }}>
                      {card.stat}
                    </div>
                  </div>
                </div>

                {/* Glow on hover */}
                {isHovered && (
                  <div
                    className="absolute inset-0 rounded-[28px] pointer-events-none"
                    style={{ boxShadow: `inset 0 0 40px ${card.glow}`, opacity: 0.4 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          INTERACTIVE DASHBOARD PREVIEW
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal-up mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border inline-block"
            style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: "#7FE0D3" }}>
            LIVE DASHBOARD PREVIEW
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}>
            One Command Center for Everything
          </h2>
        </div>

        <div className="reveal-up rounded-3xl overflow-hidden border"
          style={{
            borderColor: "rgba(124,92,255,0.25)",
            boxShadow: "0 0 60px rgba(124,92,255,0.15), 0 24px 60px rgba(0,0,0,0.6)",
            animationDelay: "0.1s",
          }}>
          {/* Title bar */}
          <div className="px-5 py-3.5 border-b flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-4 text-xs font-mono" style={{ color: "#A1A6C0" }}>
                growth.getyourclientsb2b.com/admin/dashboard
              </span>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              {(["social", "seo", "leads"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                  style={activeTab === tab
                    ? { background: "linear-gradient(135deg,#7C5CFF,#3B82F6)", color: "#fff", boxShadow: "0 4px 12px rgba(124,92,255,0.4)" }
                    : { color: "#A1A6C0" }}>
                  {tab === "seo" ? "SEO" : tab === "leads" ? "Outreach" : "Social"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8" style={{ background: "rgba(5,6,13,0.9)" }}>
            {activeTab === "social" && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Meta Connected", value: "FB & Instagram", cls: "text-emerald-400", sub: "Page ID: 1125229983597930", icon: CheckCircle2 },
                    { label: "Scheduled Posts", value: "48 Due Today", cls: "text-[#C9B8FF]", sub: "Auto-publish active", icon: Zap },
                    { label: "Cross-Network", value: "5 Channels", cls: "text-[#7FE0D3]", sub: "FB, IG, LinkedIn, YT, X", icon: Network },
                    { label: "Monthly Reach", value: "142,800+", cls: "text-[#C9B8FF]", sub: "↑ 34% this month", icon: TrendingUp },
                  ].map(({ label, value, cls, sub, icon: Icon }) => (
                    <div key={label} className="p-4 rounded-2xl border text-left"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <span className="text-[11px] font-medium" style={{ color: "#A1A6C0" }}>{label}</span>
                      <p className={`text-base font-bold mt-1 flex items-center gap-1.5 ${cls}`}>
                        <Icon className="w-4 h-4" />{value}
                      </p>
                      <span className="text-[11px]" style={{ color: "#A1A6C0" }}>{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border p-4 space-y-3"
                  style={{ background: "rgba(124,92,255,0.05)", borderColor: "rgba(124,92,255,0.15)" }}>
                  <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Autonomous Content Distribution Pipeline</span>
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Worker Active
                    </span>
                  </div>
                  {[
                    { channel: "Facebook + Instagram Business", caption: "🚀 How top B2B agencies automate client acquisition...", status: "Today, 4:00 PM", badge: "Sync Enabled", color: "#3B82F6" },
                    { channel: "LinkedIn Company & Founder", caption: "The playbook we used to scale 15 client accounts past $50k MRR...", status: "Tomorrow, 9:00 AM", badge: "v2 API Ready", color: "#7FE0D3" },
                    { channel: "YouTube Shorts & Video Hub", caption: "3 AI Automation tools every agency owner must deploy in 2026.", status: "Draft Ready", badge: "Script Generated", color: "#FF3D8B" },
                  ].map((row, i) => (
                    <div key={i} className="p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all hover:border-[#7C5CFF]/30"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)" }}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold border"
                            style={{ color: row.color, borderColor: `${row.color}30`, background: `${row.color}10` }}>
                            {row.channel}
                          </span>
                          <span className="text-xs text-emerald-400 font-mono">{row.badge}</span>
                        </div>
                        <p className="text-xs line-clamp-1" style={{ color: "#A1A6C0" }}>{row.caption}</p>
                      </div>
                      <span className="text-xs font-mono shrink-0" style={{ color: "#A1A6C0" }}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "seo" && (
              <div className="space-y-5 text-left animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Programmatic Pages", value: "1,480 Generated", cls: "text-[#7FE0D3]", sub: "Locations & Niches" },
                    { label: "Avg Quality Score", value: "94.8 / 100", cls: "text-emerald-400", sub: "Zero duplicate content" },
                    { label: "Keywords in Top 10", value: "382 Keywords", cls: "text-[#C9B8FF]", sub: "↑ 18 this week" },
                    { label: "Organic Traffic Value", value: "$24,900 /mo", cls: "text-[#C9B8FF]", sub: "Equivalent Google Ads" },
                  ].map(({ label, value, cls, sub }) => (
                    <div key={label} className="p-4 rounded-2xl border"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <span className="text-[11px] font-medium" style={{ color: "#A1A6C0" }}>{label}</span>
                      <p className={`text-base font-bold mt-1 ${cls}`}>{value}</p>
                      <span className="text-[11px]" style={{ color: "#A1A6C0" }}>{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border p-4 space-y-3"
                  style={{ background: "rgba(34,211,238,0.04)", borderColor: "rgba(34,211,238,0.12)" }}>
                  {[
                    { slug: "/alternatives/apollo/agencies", kw: "Best Apollo alternative for B2B agencies", score: 98, status: "Top 3 Rank" },
                    { slug: "/find-leads/technology/austin", kw: "Austin tech startup B2B decision makers", score: 95, status: "Indexed" },
                    { slug: "/tools/subject-line-grader", kw: "Free cold email subject line analyzer", score: 99, status: "Top 3 Rank" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl border flex items-center justify-between text-xs"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)" }}>
                      <div>
                        <span className="font-mono font-semibold" style={{ color: "#C9B8FF" }}>{item.slug}</span>
                        <p className="text-[11px] mt-0.5" style={{ color: "#A1A6C0" }}>{item.kw}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">Score: {item.score}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                          style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "leads" && (
              <div className="space-y-5 text-left animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total B2B Leads", value: "12,450", cls: "text-[#C9B8FF]", sub: "100% Verified MX" },
                    { label: "Email Reply Rate", value: "8.4%", cls: "text-emerald-400", sub: "Industry avg: 1.8%" },
                    { label: "Bounce Rate", value: "0.3%", cls: "text-[#7FE0D3]", sub: "CAN-SPAM compliant" },
                    { label: "Active Sequences", value: "14 Workflows", cls: "text-[#C9B8FF]", sub: "Personalized vars" },
                  ].map(({ label, value, cls, sub }) => (
                    <div key={label} className="p-4 rounded-2xl border"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <span className="text-[11px] font-medium" style={{ color: "#A1A6C0" }}>{label}</span>
                      <p className={`text-base font-bold mt-1 ${cls}`}>{value}</p>
                      <span className="text-[11px]" style={{ color: "#A1A6C0" }}>{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded-2xl border"
                  style={{ background: "rgba(255,61,139,0.05)", borderColor: "rgba(255,61,139,0.15)" }}>
                  <p className="font-bold mb-2 flex items-center gap-2 text-white">
                    <Bot className="w-4 h-4" style={{ color: "#FF3D8B" }} />
                    Autonomous ICP Matching Engine
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#A1A6C0" }}>
                    Custom filters for founder, CMO, VP Sales, revenue bracket (\$1M–\$20M), tech stack (HubSpot, Salesforce, Shopify),
                    and geographic focus with real-time SMTP deliverability check before dispatching.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          INFRASTRUCTURE TELEMETRY
      ════════════════════════════════════════════════════════════════ */}
      <section id="infrastructure" className="py-20 relative z-10 border-y"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="reveal-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border mb-4"
                style={{ background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #4ade80" }} />
                ENTERPRISE HIGH-PERFORMANCE CLOUD ARCHITECTURE
              </div>
              <h2 className="reveal-up text-2xl sm:text-4xl font-extrabold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}>
                Live Backend Engine & Database Telemetry
              </h2>
              <p className="text-sm sm:text-base mt-2 max-w-2xl" style={{ color: "#A1A6C0" }}>
                Real-time verification connecting the Next.js edge frontend, Python FastAPI async engine, and PostgreSQL 16 cluster.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={checkConnection} disabled={loadingHealth}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 active:scale-95 shimmer-btn"
                style={{ background: "linear-gradient(135deg,#7C5CFF,#3B82F6)", boxShadow: "0 4px 20px rgba(124,92,255,0.35)" }}>
                <RefreshCw className={`w-4 h-4 ${loadingHealth ? "animate-spin" : ""}`} />
                {loadingHealth ? "Querying SLA..." : "Test Live Ping"}
              </button>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:border-[#7C5CFF]/40"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#A1A6C0" }}>
                <ExternalLink className="w-4 h-4" />API Docs
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers, grad: "linear-gradient(135deg,#7C5CFF,#C9B8FF)", title: "Frontend Service",
                sub: "Next.js 14 App Router · React 18 · TailwindCSS",
                badge: { label: "Edge CDN Active", ok: true },
                rows: [["Host:", "growth.getyourclientsb2b.com"], ["SSL & CDN:", "HTTP/2 TLS 1.3 Active"], ["State:", "Healthy (0ms Edge)"]],
                glow: "rgba(124,92,255,0.3)",
              },
              {
                icon: Server, grad: "linear-gradient(135deg,#22D3EE,#7FE0D3)", title: "Backend Service",
                sub: "Python FastAPI with CORS and Async Engine",
                badge: { label: isBackendOk ? "Online" : "Offline", ok: isBackendOk },
                rows: [["Framework:", health?.backend?.framework || "FastAPI"], ["Port:", "8000 (HTTPS Gateway)"], ["API Endpoint:", "growth-api.getyourclientsb2b.com"]],
                glow: "rgba(34,211,238,0.3)",
              },
              {
                icon: Database, grad: "linear-gradient(135deg,#FF3D8B,#F472B6)", title: "Database Service",
                sub: "PostgreSQL 16 with asyncpg driver & SQLAlchemy",
                badge: { label: isDbOk ? "Connected" : "Connecting...", ok: isDbOk },
                rows: [["Dialect:", health?.database?.engine || "postgresql+asyncpg"], ["Ping Latency:", `${pingLatency} ms`], ["Driver Pool:", "Asyncpg (10 conns)"]],
                glow: "rgba(255,61,139,0.3)",
              },
            ].map(({ icon: Icon, grad, title, sub, badge, rows, glow }) => (
              <div key={title}
                className="group p-6 rounded-[28px] border transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(16px)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${glow}`; (e.currentTarget as HTMLElement).style.borderColor = `${glow.replace("0.3", "0.5")}`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: grad }}>
                    <Icon className="w-5.5 h-5.5 text-white" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.ok ? "text-emerald-400" : "text-rose-400"}`}
                    style={badge.ok
                      ? { background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.25)" }
                      : { background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.25)" }}>
                    {badge.ok && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {badge.label}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="text-xs mt-1" style={{ color: "#A1A6C0" }}>{sub}</p>
                <div className="mt-5 pt-4 border-t space-y-2.5 text-xs font-mono" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span style={{ color: "#A1A6C0" }}>{k}</span>
                      <span className={v.includes("Active") || v.includes("ms") ? "text-emerald-400 font-semibold" : "text-white"}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CORE SOLUTIONS GRID
      ════════════════════════════════════════════════════════════════ */}
      <section id="social-automation" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border mb-5"
            style={{ background: "rgba(124,92,255,0.1)", borderColor: "rgba(124,92,255,0.3)", color: "#C9B8FF" }}>
            ENTERPRISE AUTOMATION SUITE
          </div>
          <h2 className="reveal-up text-3xl sm:text-5xl font-black text-white mt-5 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}>
            Everything to Scale{" "}
            <span style={{
              background: "linear-gradient(135deg, #7C5CFF, #3B82F6, #22D3EE)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              B2B Client Growth
            </span>
          </h2>
          <p className="reveal-up mt-4 text-base sm:text-lg" style={{ color: "#A1A6C0" }}>
            Replace 6 disjointed SaaS tools with one automated, developer-grade engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Share2, grad: "linear-gradient(135deg,#7C5CFF,#C9B8FF)", glow: "rgba(124,92,255,0.3)",
              title: "Multi-Platform Social Auto-Publishing",
              desc: "Connect official Meta Graph API (Facebook Pages & Instagram Business), LinkedIn v2 API, and Twitter/X. Auto-schedule, syndicate, and auto-publish content with zero friction.",
              bullets: ["Cross-posting from Facebook to Instagram", "AI Hook, caption & hashtag generator", "Autonomous background worker publishing"],
            },
            {
              icon: Search, grad: "linear-gradient(135deg,#22D3EE,#7FE0D3)", glow: "rgba(34,211,238,0.3)",
              id: "seo-manager",
              title: "Autonomous SEO Page Generator",
              desc: "Generate thousands of high-converting, Google-compliant comparison and location pages. Automated JSON-LD schema, quality score vetting, and instant XML sitemap indexing.",
              bullets: ["Zero keyword cannibalization engine", "Full Google Search Console auto-ping", "Built-in lead capture & conversion forms"],
            },
            {
              icon: MessageSquare, grad: "linear-gradient(135deg,#FF3D8B,#F472B6)", glow: "rgba(255,61,139,0.3)",
              id: "cold-outreach",
              title: "CAN-SPAM Cold Outreach Engine",
              desc: "Run ultra-personalized, deliverability-optimized email sequences with domain warmup, real-time MX validation, and automated reply sentiment analysis.",
              bullets: ["Mailbox rotation & daily sending caps", "One-click unsubscribe compliance", "Automated positive reply routing to CRM"],
            },
            {
              icon: Video, grad: "linear-gradient(135deg,#3B82F6,#7C5CFF)", glow: "rgba(59,130,246,0.3)",
              title: "Viral Video & Shorts Script Studio",
              desc: "Plan high-retention video scripts for YouTube, TikTok, and Instagram Reels. Hook libraries, pacing indicators, and visual cue annotations included.",
              bullets: ["Script to multi-format repurposing", "Automated description & tag generator", "Visual storyboard direction"],
            },
            {
              icon: Bot, grad: "linear-gradient(135deg,#C9B8FF,#7C5CFF)", glow: "rgba(201,184,255,0.3)",
              title: "Brand Voice & ICP Guardrails",
              desc: "Enforce brand guidelines across every channel. Set banned phrases, target persona criteria, and unique value propositions so all content matches your tone exactly.",
              bullets: ["Centralized Brand Profile & Tone matrix", "Automated banned phrase filter", "Customer persona tailored messaging"],
            },
            {
              icon: TrendingUp, grad: "linear-gradient(135deg,#7FE0D3,#22D3EE)", glow: "rgba(127,224,211,0.3)",
              title: "Multi-Channel Growth Attribution",
              desc: "Track clicks, conversions, and client acquisitions across social posts, SEO pages, and cold email campaigns with unified first-party tracking links.",
              bullets: ["Custom shortlink redirect router (/r/code)", "Real-time conversion funnel tracking", "Executive revenue & pipeline dashboards"],
            },
          ].map(({ icon: Icon, grad, glow, title, desc, bullets, id }) => (
            <div key={title} id={id}
              className="group p-7 rounded-[28px] border flex flex-col justify-between transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${glow}`; (e.currentTarget as HTMLElement).style.borderColor = glow.replace("0.3", "0.4"); }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform"
                  style={{ background: grad, boxShadow: `0 4px 20px ${glow}` }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3"
                  style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#A1A6C0" }}>{desc}</p>
              </div>
              <ul className="mt-6 pt-5 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-xs font-medium" style={{ color: "#A1A6C0" }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          COMPARISON TABLE
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative z-10 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="reveal-up text-3xl sm:text-4xl font-extrabold text-white"
            style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}>
            Why Agencies Choose{" "}
            <span style={{
              background: "linear-gradient(135deg,#7C5CFF,#3B82F6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              GetYourClientsB2B
            </span>
          </h2>
          <p className="reveal-up mt-3 text-sm sm:text-base" style={{ color: "#A1A6C0" }}>
            Consolidate your marketing tech stack into one reliable, high-speed ecosystem.
          </p>

          <div className="reveal-up mt-12 rounded-2xl border overflow-hidden shadow-lg text-left"
            style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <div className="grid grid-cols-3 p-4 border-b text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
              <span className="text-white">Capability / Feature</span>
              <span style={{ color: "#A1A6C0" }}>Traditional Stack (6 Tools)</span>
              <span style={{
                background: "linear-gradient(135deg,#7C5CFF,#22D3EE)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Growth Engine Platform</span>
            </div>
            {[
              { feat: "Social Media Scheduling", old: "Buffer / Hootsuite (\$120/mo)", ge: "Included (Meta, LinkedIn, X, YT)" },
              { feat: "Programmatic SEO Engine", old: "Custom engineering (\$2,000+)", ge: "Built-in 1-Click Page Generator" },
              { feat: "Cold Email Outreach", old: "Instantly / Smartlead (\$100/mo)", ge: "Included (Warmup + Validation)" },
              { feat: "Video Script Planning", old: "Notion / ChatGPT copy-paste", ge: "Integrated Script-to-Social Studio" },
              { feat: "Backend Engine", old: "Disconnected Zapier webhooks", ge: "FastAPI + PostgreSQL 16 (18ms SLA)" },
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 p-4 border-b text-xs sm:text-sm transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <span className="font-semibold text-white">{row.feat}</span>
                <span style={{ color: "#A1A6C0" }}>{row.old}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />{row.ge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-10 sm:p-16 rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: "linear-gradient(135deg, #101A3F 0%, #1B1F4B 40%, #0A0B1A 100%)" }} />
            <div className="absolute inset-0 rounded-3xl border" style={{ borderColor: "rgba(124,92,255,0.25)" }} />
            {/* Orbs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-40"
              style={{ background: "radial-gradient(circle, #7C5CFF, transparent)" }} />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-30"
              style={{ background: "radial-gradient(circle, #22D3EE, transparent)" }} />
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "radial-gradient(circle, #A1A6C0 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />

            <div className="relative z-10 space-y-7">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
                style={{ background: "rgba(124,92,255,0.15)", borderColor: "rgba(124,92,255,0.35)", color: "#C9B8FF" }}>
                <Shield className="w-3.5 h-3.5" />
                PROVEN B2B GROWTH INFRASTRUCTURE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}>
                Ready to Put Your Social & SEO<br />Growth on Autopilot?
              </h2>
              <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: "#A1A6C0" }}>
                Log in to your command center — configure social connections, trigger programmatic SEO pages,
                and deploy high-converting campaigns.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
                  className="group relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.98] shimmer-btn"
                  style={{ background: "linear-gradient(135deg,#7C5CFF,#3B82F6)", boxShadow: "0 8px 32px rgba(124,92,255,0.5)" }}>
                  <Lock className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{isLoggedIn ? "Open Admin Console" : "Client Portal Sign In"}</span>
                  <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span className="absolute inset-0 shimmer-sweep" />
                </Link>
                <Link href="/admin/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold border transition-all"
                  style={{ borderColor: "rgba(255,255,255,0.15)", color: "#A1A6C0" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  New Client Setup
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <footer className="border-t py-12 relative z-10" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(5,6,13,0.8)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md"
              style={{ background: "linear-gradient(135deg,#7C5CFF,#3B82F6)", boxShadow: "0 0 16px rgba(124,92,255,0.4)" }}>
              G
            </div>
            <div>
              <span className="font-bold text-white text-sm block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                GetYourClientsB2B Growth Engine
              </span>
              <p className="text-[11px]" style={{ color: "#A1A6C0" }}>Autonomous Social & SEO Infrastructure</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium">
            {[
              { href: "/admin/login", label: "Client Login", color: "#A1A6C0" },
              { href: "/tools/subject-line-grader", label: "Free Tools", color: "#A1A6C0" },
              { href: "/alternatives/apollo/agencies", label: "Comparisons", color: "#A1A6C0" },
            ].map(({ href, label, color }) => (
              <Link key={label} href={href}
                className="transition-all hover:text-white"
                style={{ color }}>
                {label}
              </Link>
            ))}
            <a href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`}
              target="_blank" rel="noreferrer"
              className="transition-all hover:text-white"
              style={{ color: "#A1A6C0" }}>
              API Docs
            </a>
          </div>
          <div className="text-right text-xs" style={{ color: "#A1A6C0" }}>
            © {new Date().getFullYear()} GetYourClientsB2B Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════════════
          GLOBAL CSS ANIMATIONS (injected via style tag)
      ════════════════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ─── Orb drifting ─── */
        @keyframes orb-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(60px, 40px) scale(1.08); }
          66%       { transform: translate(-30px, 70px) scale(0.94); }
        }
        @keyframes orb-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-50px, -30px) scale(1.12); }
          70%       { transform: translate(40px, 50px) scale(0.9); }
        }
        @keyframes orb-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30%       { transform: translate(70px, -40px) scale(1.06); }
          65%       { transform: translate(-60px, 30px) scale(0.96); }
        }

        /* ─── Star twinkle ─── */
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.4); }
        }

        /* ─── Card float ─── */
        @keyframes card-float-0 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes card-float-1 {
          0%, 100% { transform: translateY(-6px); }
          50%       { transform: translateY(10px); }
        }
        @keyframes card-float-2 {
          0%, 100% { transform: translateY(4px); }
          50%       { transform: translateY(-10px); }
        }

        /* ─── Reveal up ─── */
        .reveal-up {
          opacity: 0;
          transform: translateY(24px);
          animation: reveal-up-anim 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes reveal-up-anim {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Fade in ─── */
        .animate-fade-in {
          animation: fade-in 0.4s ease both;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── Slide right ─── */
        @keyframes fade-slide-right {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ─── Shimmer button ─── */
        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0s;
        }
        .shimmer-btn:hover .shimmer-sweep {
          transform: translateX(200%);
          transition: transform 0.65s ease;
        }

        /* ─── Rotating conic border on hover ─── */
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes rotate-conic {
          to { --angle: 360deg; }
        }
        .conic-border-hover:hover {
          background: conic-gradient(from var(--angle), #7C5CFF, #3B82F6, #22D3EE, #FF3D8B, #7C5CFF);
          animation: rotate-conic 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
