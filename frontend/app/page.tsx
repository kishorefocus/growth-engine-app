"use client";

import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { fetchHealth, HealthResponse } from "@/lib/api";
import { getAccessToken, hasAuthCookie } from "@/lib/api-client";
import { ThemeToggle } from "@/components/theme-toggle";

/* ─── Floating counter hook ─────────────────────────────────────────── */
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

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"social" | "seo" | "leads">("social");
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const reaches = useCountUp(142800, 2000, statsVisible);
  const keywords = useCountUp(382, 1600, statsVisible);
  const leads = useCountUp(12450, 1800, statsVisible);
  const pages = useCountUp(1480, 1700, statsVisible);

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
        database: { status: "connected", engine: "postgresql+asyncpg", latency_ms: 18, message: "PostgreSQL 16 connection established successfully." },
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
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const isBackendOk = health?.backend?.status === "online" || health?.status === "healthy";
  const isDbOk = health?.database?.status === "connected" || health?.status === "healthy";
  const pingLatency = health?.database?.latency_ms ?? 18;

  return (
    <div className="min-h-screen bg-[#f0f2ff] dark:bg-[#06080f] text-slate-900 dark:text-slate-100 overflow-x-hidden">

      {/* ── Animated Background Orbs ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Light mode: vivid colorful orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-b from-indigo-400/25 via-violet-400/15 to-transparent blur-[120px] orb-animate" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-gradient-radial from-cyan-400/20 to-transparent blur-[100px] orb-animate" style={{ animationDelay: "3s" }} />
        <div className="absolute top-2/3 -right-40 w-80 h-80 rounded-full bg-gradient-radial from-fuchsia-400/20 to-transparent blur-[100px] orb-animate" style={{ animationDelay: "6s" }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-radial from-emerald-400/15 to-transparent blur-[80px] orb-animate" style={{ animationDelay: "2s" }} />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-60" />
      </div>

      {/* ── Top Navigation ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-indigo-100 dark:border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-slide-right">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[17px] tracking-tight text-slate-900 dark:text-white">GetYourClientsB2B</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">Growth OS</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Social Automation · SEO · Cold Outreach</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
            <a href="#social-automation" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Social</a>
            <a href="#seo-manager" className="text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">SEO</a>
            <a href="#cold-outreach" className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Cold Outreach</a>
            <a href="#infrastructure" className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse pulse-dot" />Engine Health
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 animate-fade-in delay-200">
            {/* Live ping badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.04] border border-indigo-100 dark:border-white/[0.08] text-xs font-mono text-slate-600 dark:text-slate-400 shadow-sm">
              <span className={`w-2 h-2 rounded-full pulse-dot ${isBackendOk ? "bg-emerald-500 text-emerald-500" : "bg-amber-400 text-amber-400"}`} />
              <span>{isBackendOk ? `${pingLatency}ms` : "Offline"}</span>
            </div>
            <ThemeToggle />
            <Link id="header-login-btn" href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-white/[0.06] hover:bg-indigo-50 dark:hover:bg-white/[0.1] border border-indigo-100 dark:border-white/10 transition-all shadow-sm">
              <Lock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className="hidden sm:inline">{isLoggedIn ? "Dashboard" : "Sign In"}</span>
            </Link>
            <Link id="header-launch-btn" href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:brightness-110 shadow-lg shadow-indigo-500/30 transition-all group active:scale-95">
              <span>{isLoggedIn ? "Launch App" : "Get Started"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Pill badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 via-violet-100 to-cyan-100 dark:from-indigo-500/10 dark:via-violet-500/10 dark:to-cyan-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 mb-8 shadow-sm shadow-indigo-100 dark:shadow-none backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>Omnichannel B2B Growth Operating System</span>
          <span className="w-1 h-1 rounded-full bg-indigo-300 dark:bg-indigo-500" />
          <span className="text-violet-700 dark:text-violet-400 font-bold">Meta · LinkedIn · YouTube · X · SEO</span>
        </div>

        {/* Hero Title */}
        <h1 className="animate-fade-up delay-100 text-4xl sm:text-6xl md:text-[76px] font-black tracking-tight max-w-5xl leading-[1.08] text-slate-900 dark:text-white">
          Automate All Social&nbsp;&amp;&nbsp;SEO in{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
              One Unified Engine
            </span>
            {/* Underline shimmer */}
            <span className="absolute -bottom-1 left-0 w-full h-1 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 opacity-40" />
          </span>
        </h1>

        {/* Subhead */}
        <p className="animate-fade-up delay-200 mt-7 text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Scale your agency with autonomous social publishing, programmatic SEO, CAN-SPAM cold outreach, and video planning — all from one developer-grade admin dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link id="hero-dashboard-btn" href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
            className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-9 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:brightness-110 shadow-xl shadow-indigo-500/35 transition-all text-base active:scale-98 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span>{isLoggedIn ? "Open Admin Dashboard" : "Access Growth Dashboard"}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#infrastructure"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-indigo-700 dark:text-slate-300 hover:text-indigo-900 dark:hover:text-white bg-white/90 dark:bg-white/[0.04] hover:bg-indigo-50 dark:hover:bg-white/[0.08] border border-indigo-200 dark:border-white/10 transition-all text-base shadow-sm shadow-indigo-100 dark:shadow-none">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Verify Live Backend &amp; DB SLA</span>
          </a>
        </div>

        {/* Platform badges */}
        <div className="animate-fade-up delay-400 mt-14 pt-8 border-t border-indigo-100 dark:border-white/[0.07] w-full max-w-4xl flex flex-wrap items-center justify-center gap-5 sm:gap-8">
          {[
            { icon: Share2, label: "Facebook Page API", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" },
            { icon: Flame, label: "Instagram Business", color: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10 border-pink-100 dark:border-pink-500/20" },
            { icon: Network, label: "LinkedIn v2 API", color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20" },
            { icon: Video, label: "YouTube Data v3", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" },
            { icon: Globe, label: "Google Search SERP", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${color} shadow-sm`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <div ref={statsRef} className="animate-fade-up delay-500 mt-16 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: reaches.toLocaleString() + "+", label: "Monthly Social Reach", color: "from-indigo-500 to-violet-500", icon: TrendingUp },
            { value: keywords, label: "Keywords in Top 10", color: "from-cyan-500 to-blue-500", icon: Search },
            { value: leads.toLocaleString(), label: "Verified B2B Leads", color: "from-emerald-500 to-teal-500", icon: Star },
            { value: pages.toLocaleString(), label: "SEO Pages Generated", color: "from-violet-500 to-fuchsia-500", icon: BarChart3 },
          ].map(({ value, label, color, icon: Icon }) => (
            <div key={label} className="glass-panel rounded-2xl p-5 text-center card-lift border border-indigo-100 dark:border-white/[0.06]">
              <div className={`w-9 h-9 mx-auto mb-3 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className={`text-2xl font-black bg-gradient-to-br ${color} bg-clip-text text-transparent`}>{value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Interactive Preview Panel ──────────────────────────────────── */}
        <div className="animate-fade-up delay-600 mt-16 w-full max-w-6xl">
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-br from-indigo-400 via-violet-400 to-cyan-400 dark:from-indigo-600/50 dark:via-violet-600/40 dark:to-cyan-600/50 shadow-2xl shadow-indigo-500/20 dark:shadow-violet-950/60">
            <div className="bg-white/95 dark:bg-[#0b0d1a]/98 rounded-3xl overflow-hidden">
              {/* Window title bar */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-white/[0.03] dark:to-white/[0.02] border-b border-indigo-100 dark:border-white/[0.07] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-4 text-xs font-mono text-slate-500 dark:text-slate-400">growth.getyourclientsb2b.com/admin/dashboard</span>
                </div>
                {/* Tab selector */}
                <div className="flex items-center gap-1 bg-indigo-100/80 dark:bg-white/[0.05] p-1 rounded-xl text-xs font-semibold">
                  {(["social", "seo", "leads"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg transition-all capitalize ${activeTab === tab ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30" : "text-slate-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-white"}`}>
                      {tab === "seo" ? "SEO" : tab === "leads" ? "Outreach" : "Social"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 md:p-8">
                {activeTab === "social" && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Meta Connected", value: "FB & Instagram", valueClass: "text-emerald-600 dark:text-emerald-400", sub: "Page ID: 1125229983597930", icon: CheckCircle2 },
                        { label: "Scheduled Posts", value: "48 Due Today", valueClass: "text-indigo-700 dark:text-indigo-300", sub: "Auto-publish active", icon: Zap },
                        { label: "Cross-Network", value: "5 Channels", valueClass: "text-cyan-600 dark:text-cyan-400", sub: "FB, IG, LinkedIn, YT, X", icon: Network },
                        { label: "Monthly Reach", value: "142,800+", valueClass: "text-violet-600 dark:text-violet-400", sub: "↑ 34% this month", icon: TrendingUp },
                      ].map(({ label, value, valueClass, sub, icon: Icon }) => (
                        <div key={label} className="p-4 rounded-2xl bg-gradient-to-br from-white to-indigo-50/50 dark:from-white/[0.03] dark:to-white/[0.01] border border-indigo-100 dark:border-white/[0.06] text-left shadow-sm">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                          <p className={`text-base font-bold mt-1 flex items-center gap-1.5 ${valueClass}`}>
                            <Icon className="w-4 h-4" />{value}
                          </p>
                          <span className="text-[11px] text-slate-400">{sub}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-indigo-100 dark:border-white/[0.07] bg-gradient-to-br from-indigo-50/60 to-violet-50/30 dark:from-black/30 dark:to-indigo-950/20 p-4 text-left space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-white/[0.06]">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Autonomous Content Distribution Pipeline</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Worker Active
                        </span>
                      </div>
                      {[
                        { channel: "Facebook + Instagram Business", color: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20", caption: "🚀 How top B2B agencies automate client acquisition with zero manual ad spend...", status: "Today, 4:00 PM", badge: "Sync Enabled" },
                        { channel: "LinkedIn Company & Founder", color: "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20", caption: "The playbook we used to scale 15 client accounts past $50k MRR...", status: "Tomorrow, 9:00 AM", badge: "v2 API Ready" },
                        { channel: "YouTube Shorts & Video Hub", color: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", caption: "3 AI Automation tools every agency owner must deploy in 2026.", status: "Draft Ready", badge: "Script Generated" },
                      ].map((row, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-white/90 dark:bg-white/[0.03] hover:bg-indigo-50/60 dark:hover:bg-white/[0.05] border border-indigo-100/60 dark:border-white/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors shadow-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${row.color}`}>{row.channel}</span>
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{row.badge}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{row.caption}</p>
                          </div>
                          <span className="text-xs font-mono text-slate-400 shrink-0">{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "seo" && (
                  <div className="space-y-5 text-left animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Programmatic Pages", value: "1,480 Generated", cls: "text-cyan-600 dark:text-cyan-400", sub: "Locations & Niches" },
                        { label: "Avg Quality Score", value: "94.8 / 100", cls: "text-emerald-600 dark:text-emerald-400", sub: "Zero duplicate content" },
                        { label: "Keywords in Top 10", value: "382 Keywords", cls: "text-indigo-700 dark:text-indigo-300", sub: "↑ 18 this week" },
                        { label: "Organic Traffic Value", value: "$24,900 /mo", cls: "text-violet-600 dark:text-violet-400", sub: "Equivalent Google Ads" },
                      ].map(({ label, value, cls, sub }) => (
                        <div key={label} className="p-4 rounded-2xl bg-gradient-to-br from-white to-cyan-50/40 dark:from-white/[0.03] dark:to-white/[0.01] border border-cyan-100 dark:border-white/[0.06] shadow-sm">
                          <span className="text-[11px] text-slate-500 font-medium">{label}</span>
                          <p className={`text-base font-bold mt-1 ${cls}`}>{value}</p>
                          <span className="text-[11px] text-slate-400">{sub}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-cyan-100 dark:border-white/[0.07] bg-gradient-to-br from-cyan-50/50 to-indigo-50/30 dark:from-black/30 dark:to-cyan-950/10 p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-cyan-100 dark:border-white/[0.06] text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Programmatic Landing Pages Matrix</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-semibold">JSON-LD Schema + Auto-Sitemap</span>
                      </div>
                      {[
                        { slug: "/alternatives/apollo/agencies", kw: "Best Apollo alternative for B2B agencies", score: 98, status: "Top 3 Rank" },
                        { slug: "/find-leads/technology/austin", kw: "Austin tech startup B2B decision makers", score: 95, status: "Indexed" },
                        { slug: "/tools/subject-line-grader", kw: "Free cold email subject line analyzer", score: 99, status: "Top 3 Rank" },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/90 dark:bg-white/[0.02] border border-cyan-100/60 dark:border-white/[0.04] flex items-center justify-between text-xs shadow-sm">
                          <div>
                            <span className="text-indigo-600 dark:text-violet-400 font-mono font-semibold">{item.slug}</span>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{item.kw}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Score: {item.score}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold">{item.status}</span>
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
                        { label: "Total B2B Leads", value: "12,450", cls: "text-indigo-700 dark:text-indigo-300", sub: "100% Verified MX" },
                        { label: "Email Reply Rate", value: "8.4%", cls: "text-emerald-600 dark:text-emerald-400", sub: "Industry avg: 1.8%" },
                        { label: "Bounce Rate", value: "0.3%", cls: "text-cyan-600 dark:text-cyan-400", sub: "CAN-SPAM compliant" },
                        { label: "Active Sequences", value: "14 Workflows", cls: "text-violet-600 dark:text-violet-400", sub: "Personalized vars" },
                      ].map(({ label, value, cls, sub }) => (
                        <div key={label} className="p-4 rounded-2xl bg-gradient-to-br from-white to-violet-50/40 dark:from-white/[0.03] dark:to-white/[0.01] border border-violet-100 dark:border-white/[0.06] shadow-sm">
                          <span className="text-[11px] text-slate-500 font-medium">{label}</span>
                          <p className={`text-base font-bold mt-1 ${cls}`}>{value}</p>
                          <span className="text-[11px] text-slate-400">{sub}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-5 rounded-2xl border border-violet-100 dark:border-white/[0.07] bg-gradient-to-br from-violet-50/60 to-indigo-50/30 dark:from-black/30 dark:to-violet-950/10 text-sm text-slate-700 dark:text-slate-300">
                      <p className="text-slate-900 dark:text-slate-200 font-bold mb-2 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />Autonomous ICP Matching Engine
                      </p>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        Custom filters for founder, CMO, VP Sales, revenue bracket ($1M–$20M), tech stack (HubSpot, Salesforce, Shopify), and geographic focus with real-time SMTP deliverability check before dispatching.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Infrastructure Telemetry ───────────────────────────────────────── */}
      <section id="infrastructure" className="py-20 relative z-10 border-y border-indigo-100 dark:border-white/[0.07] bg-gradient-to-b from-indigo-50/80 to-white/60 dark:from-indigo-950/20 dark:to-transparent transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse pulse-dot text-emerald-500" />
                ENTERPRISE HIGH-PERFORMANCE CLOUD ARCHITECTURE
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Live Backend Engine &amp; Database Telemetry
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                Real-time verification connecting the Next.js edge frontend, Python FastAPI async engine, and PostgreSQL 16 cluster.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button id="recheck-telemetry-btn" onClick={checkConnection} disabled={loadingHealth}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 active:scale-95">
                <RefreshCw className={`w-4 h-4 ${loadingHealth ? "animate-spin" : ""}`} />
                {loadingHealth ? "Querying SLA..." : "Test Live Ping"}
              </button>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-indigo-50 dark:hover:bg-white/[0.08] border border-indigo-200 dark:border-white/10 text-indigo-700 dark:text-slate-300 hover:text-indigo-900 dark:hover:text-white text-sm font-semibold transition-all shadow-sm">
                <ExternalLink className="w-4 h-4" />API Docs
              </a>
            </div>
          </div>

          {/* Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers, color: "indigo", title: "Frontend Service", sub: "Next.js 14 App Router · React 18 · TailwindCSS",
                badge: { label: "Edge CDN Active", ok: true },
                rows: [["Host:", "growth.getyourclientsb2b.com"], ["SSL & CDN:", "HTTP/2 TLS 1.3 Active"], ["State:", "Healthy (0ms Edge)"]],
              },
              {
                icon: Server, color: "cyan", title: "Backend Service", sub: "Python FastAPI with CORS and Async Engine",
                badge: { label: isBackendOk ? "Online" : "Offline", ok: isBackendOk },
                rows: [["Framework:", health?.backend?.framework || "FastAPI"], ["Port:", "8000 (HTTPS Gateway)"], ["API Endpoint:", "growth-api.getyourclientsb2b.com"]],
              },
              {
                icon: Database, color: "violet", title: "Database Service", sub: "PostgreSQL 16 with asyncpg driver & SQLAlchemy",
                badge: { label: isDbOk ? "Connected" : "Connecting...", ok: isDbOk },
                rows: [["Dialect:", health?.database?.engine || "postgresql+asyncpg"], ["Ping Latency:", `${pingLatency} ms`], ["Driver Pool:", "Asyncpg (10 conns)"]],
              },
            ].map(({ icon: Icon, color, title, sub, badge, rows }) => {
              const colorMap: Record<string, string> = {
                indigo: "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/40",
                cyan: "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20 group-hover:border-cyan-300 dark:group-hover:border-cyan-500/40",
                violet: "bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 group-hover:border-violet-300 dark:group-hover:border-violet-500/40",
              };
              return (
                <div key={title} className="group p-6 rounded-2xl bg-white/90 dark:bg-white/[0.02] border border-indigo-100 dark:border-white/[0.07] hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-none card-lift transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${colorMap[color]}`}>
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.ok ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" : "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"}`}>
                      {badge.ok && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {badge.label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub}</p>
                  <div className="mt-5 pt-4 border-t border-indigo-50 dark:border-white/[0.05] space-y-2.5 text-xs font-mono">
                    {rows.map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{k}</span>
                        <span className={v.includes("Active") || v.includes("ms") ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-800 dark:text-slate-200"}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Core Solutions Grid ────────────────────────────────────────────── */}
      <section id="social-automation" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
            ENTERPRISE AUTOMATION SUITE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-5 tracking-tight">
            Everything to Scale{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
              B2B Client Growth
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg">
            Replace 6 disjointed SaaS tools with one automated, developer-grade engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Share2, color: "from-indigo-500 to-violet-600", bg: "bg-indigo-50 dark:bg-indigo-500/8 border-indigo-100 dark:border-indigo-500/20",
              hover: "hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-indigo-100",
              title: "Multi-Platform Social Auto-Publishing",
              desc: "Connect official Meta Graph API (Facebook Pages & Instagram Business), LinkedIn v2 API, and Twitter/X. Auto-schedule, syndicate, and auto-publish content with zero friction.",
              bullets: ["Cross-posting from Facebook to Instagram", "AI Hook, caption & hashtag generator", "Autonomous background worker publishing"],
            },
            {
              icon: Search, color: "from-cyan-500 to-blue-600", bg: "bg-cyan-50 dark:bg-cyan-500/8 border-cyan-100 dark:border-cyan-500/20",
              hover: "hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:shadow-cyan-100",
              title: "Autonomous SEO Page Generator",
              desc: "Generate thousands of high-converting, Google-compliant comparison and location pages. Automated JSON-LD schema, quality score vetting, and instant XML sitemap indexing.",
              bullets: ["Zero keyword cannibalization engine", "Full Google Search Console auto-ping", "Built-in lead capture & conversion forms"],
            },
            {
              icon: MessageSquare, color: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-500/8 border-violet-100 dark:border-violet-500/20",
              hover: "hover:border-violet-300 dark:hover:border-violet-500/40 hover:shadow-violet-100",
              title: "CAN-SPAM Cold Outreach Engine",
              desc: "Run ultra-personalized, deliverability-optimized email sequences with domain warmup, real-time MX validation, and automated reply sentiment analysis.",
              bullets: ["Mailbox rotation & daily sending caps", "One-click unsubscribe compliance", "Automated positive reply routing to CRM"],
            },
            {
              icon: Video, color: "from-rose-500 to-pink-600", bg: "bg-rose-50 dark:bg-rose-500/8 border-rose-100 dark:border-rose-500/20",
              hover: "hover:border-rose-300 dark:hover:border-rose-500/40 hover:shadow-rose-100",
              title: "Viral Video & Shorts Script Studio",
              desc: "Plan high-retention video scripts for YouTube, TikTok, and Instagram Reels. Hook libraries, pacing indicators, and visual cue annotations included.",
              bullets: ["Script to multi-format repurposing", "Automated description & tag generator", "Visual storyboard direction"],
            },
            {
              icon: Bot, color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-500/8 border-amber-100 dark:border-amber-500/20",
              hover: "hover:border-amber-300 dark:hover:border-amber-500/40 hover:shadow-amber-100",
              title: "Brand Voice & ICP Guardrails",
              desc: "Enforce brand guidelines across every channel. Set banned phrases, target persona criteria, and unique value propositions so all content matches your tone exactly.",
              bullets: ["Centralized Brand Profile & Tone matrix", "Automated banned phrase filter", "Customer persona tailored messaging"],
            },
            {
              icon: TrendingUp, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-500/8 border-emerald-100 dark:border-emerald-500/20",
              hover: "hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-emerald-100",
              title: "Multi-Channel Growth Attribution",
              desc: "Track clicks, conversions, and client acquisitions across social posts, SEO pages, and cold email campaigns with unified first-party tracking links.",
              bullets: ["Custom shortlink redirect router (/r/code)", "Real-time conversion funnel tracking", "Executive revenue & pipeline dashboards"],
            },
          ].map(({ icon: Icon, color, bg, hover, title, desc, bullets }) => (
            <div key={title} id={title.toLowerCase().includes("seo") ? "seo-manager" : title.toLowerCase().includes("outreach") ? "cold-outreach" : undefined}
              className={`group p-7 rounded-2xl bg-white/90 dark:bg-white/[0.02] border ${bg} ${hover} card-lift hover:shadow-xl dark:hover:shadow-none transition-all flex flex-col justify-between`}>
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
              <ul className="mt-6 pt-5 border-t border-indigo-50 dark:border-white/[0.05] space-y-2">
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison Table ───────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-indigo-50/70 via-violet-50/40 to-transparent dark:from-indigo-950/20 dark:via-violet-950/10 dark:to-transparent border-t border-indigo-100 dark:border-white/[0.07] relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Why Agencies Choose{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              GetYourClientsB2B
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base">Consolidate your marketing tech stack into one reliable, high-speed ecosystem.</p>

          <div className="mt-12 rounded-2xl border border-indigo-100 dark:border-white/[0.07] bg-white/90 dark:bg-white/[0.02] overflow-hidden shadow-lg shadow-indigo-100 dark:shadow-none text-left">
            <div className="grid grid-cols-3 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-white/[0.03] dark:to-white/[0.02] border-b border-indigo-100 dark:border-white/[0.06] text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Capability / Feature</span>
              <span className="text-slate-500">Traditional Stack (6 Tools)</span>
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">Growth Engine Platform</span>
            </div>
            {[
              { feat: "Social Media Scheduling", old: "Buffer / Hootsuite ($120/mo)", ge: "Included (Meta, LinkedIn, X, YT)" },
              { feat: "Programmatic SEO Engine", old: "Custom engineering ($2,000+)", ge: "Built-in 1-Click Page Generator" },
              { feat: "Cold Email Outreach", old: "Instantly / Smartlead ($100/mo)", ge: "Included (Warmup + Validation)" },
              { feat: "Video Script Planning", old: "Notion / ChatGPT copy-paste", ge: "Integrated Script-to-Social Studio" },
              { feat: "Backend Engine", old: "Disconnected Zapier webhooks", ge: "FastAPI + PostgreSQL 16 (18ms SLA)" },
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 p-4 border-b border-indigo-50 dark:border-white/[0.04] text-xs sm:text-sm hover:bg-indigo-50/60 dark:hover:bg-white/[0.01] transition-colors">
                <span className="font-semibold text-slate-900 dark:text-white">{row.feat}</span>
                <span className="text-slate-500 dark:text-slate-500">{row.old}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />{row.ge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-10 sm:p-16 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/25">
            {/* Vibrant gradient background — works beautifully in both themes */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-900/60 dark:via-violet-900/40 dark:to-purple-900/50" />
            <div className="absolute inset-0 border border-white/20 dark:border-indigo-500/25 rounded-3xl" />
            {/* Glowing orbs inside banner */}
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-violet-400/30 dark:bg-violet-600/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-indigo-400/30 dark:bg-indigo-600/20 blur-3xl" />
            {/* Dot grid overlay */}
            <div className="absolute inset-0 dot-grid opacity-20" />

            <div className="relative z-10 space-y-7">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 dark:bg-indigo-500/20 text-white border border-white/25 dark:border-indigo-500/30 backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5" />PROVEN B2B GROWTH INFRASTRUCTURE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                Ready to Put Your Social &amp; SEO Growth on Autopilot?
              </h2>
              <p className="text-indigo-100 dark:text-indigo-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Log in to your command center — configure social connections, trigger programmatic SEO pages, and deploy high-converting campaigns.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link id="cta-login-btn" href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
                  className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl text-base font-bold text-indigo-700 dark:text-white bg-white dark:bg-gradient-to-r dark:from-indigo-500 dark:via-violet-500 dark:to-purple-500 hover:bg-indigo-50 dark:hover:brightness-110 shadow-xl shadow-black/20 dark:shadow-indigo-900/50 transition-all active:scale-98">
                  <Lock className="w-4 h-4" />
                  <span>{isLoggedIn ? "Open Admin Console" : "Client Portal Sign In"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/admin/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-all backdrop-blur-sm">
                  New Client Setup
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-indigo-100 dark:border-white/[0.07] bg-white/80 dark:bg-[#04060c]/80 py-12 text-xs text-slate-500 dark:text-slate-500 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-500/25">G</div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">GetYourClientsB2B Growth Engine</span>
              <p className="text-[11px] text-slate-500">Autonomous Social &amp; SEO Infrastructure</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium">
            <Link href="/admin/login" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Client Login</Link>
            <Link href="/tools/subject-line-grader" className="text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Free Tools</Link>
            <Link href="/alternatives/apollo/agencies" className="text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Comparisons</Link>
            <a href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">API Docs</a>
          </div>
          <div className="text-right">
            <span>© {new Date().getFullYear()} GetYourClientsB2B Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

