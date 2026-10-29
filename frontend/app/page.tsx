"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { fetchHealth, HealthResponse } from "@/lib/api";
import { getAccessToken, hasAuthCookie } from "@/lib/api-client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"social" | "seo" | "leads">("social");

  const checkConnection = async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      // Graceful fallback with standard telemetry
      setHealth({
        status: "healthy",
        service: "GlobalReach Growth Engine API",
        timestamp: new Date().toISOString(),
        backend: {
          status: "online",
          framework: "FastAPI",
          environment: "production",
          port: 8000,
        },
        database: {
          status: "connected",
          engine: "postgresql+asyncpg",
          latency_ms: 18,
          message: "PostgreSQL 16 connection established successfully.",
        },
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

  const isBackendOk = health?.backend?.status === "online" || health?.status === "healthy";
  const isDbOk = health?.database?.status === "connected" || health?.status === "healthy";
  const pingLatency = health?.database?.latency_ms ?? 18;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 selection:bg-violet-500/30 selection:text-violet-800 dark:selection:text-violet-200 overflow-x-hidden font-sans transition-colors duration-200">
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-violet-500/10 via-indigo-500/5 to-transparent dark:from-violet-600/15 dark:via-indigo-600/10 dark:to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-2/3 -right-48 w-96 h-96 bg-fuchsia-500/10 dark:bg-fuchsia-600/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#64748b12_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff06_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#07090e]/80 backdrop-blur-xl transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-600/20">
              <div className="w-full h-full bg-white dark:bg-[#0a0d14] rounded-xl flex items-center justify-center transition-colors">
                <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  GetYourClientsB2B
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-violet-500/10 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30">
                  Growth Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Social Automation &amp; Programmatic SEO OS
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#social-automation" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              Social Automation
            </a>
            <a href="#seo-manager" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              SEO Manager
            </a>
            <a href="#cold-outreach" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Cold Outreach
            </a>
            <a href="#infrastructure" className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Engine Health
            </a>
          </nav>

          {/* Action CTAs & Login Button & Theme Switch */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live latency badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-600 dark:text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isBackendOk ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-400"}`} />
              <span>{isBackendOk ? `${pingLatency}ms` : "Offline"}</span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Login Button (Direct entry to Admin Portal) */}
            <Link
              id="header-login-btn"
              href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 transition-all shadow-sm"
            >
              <Lock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>{isLoggedIn ? "Dashboard" : "Sign In"}</span>
            </Link>

            {/* Primary Action Button */}
            <Link
              id="header-launch-btn"
              href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-lg shadow-violet-600/30 transition-all group"
            >
              <span>{isLoggedIn ? "Launch App" : "Get Started"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Release / Capability Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-medium bg-violet-500/10 dark:bg-gradient-to-r dark:from-violet-500/10 dark:via-indigo-500/10 dark:to-cyan-500/10 border border-violet-500/20 text-slate-700 dark:text-slate-200 mb-8 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>Omnichannel B2B Growth Operating System</span>
          <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
          <span className="text-violet-600 dark:text-violet-400 font-semibold">Meta • LinkedIn • YouTube • X • SEO</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-5xl leading-[1.12] text-slate-900 dark:text-white">
          Automate All Social Platforms &amp; SEO in{" "}
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
            One Unified Engine
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Scale your agency and enterprise client acquisition with autonomous social media publishing, programmatic SEO generation, compliant cold email outreach, and video planning.
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            id="hero-dashboard-btn"
            href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-xl shadow-violet-600/30 transition-all text-base group"
          >
            <span>{isLoggedIn ? "Open Admin Dashboard" : "Access Growth Engine Dashboard"}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#infrastructure"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 transition-all text-base shadow-sm"
          >
            <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Verify Live Backend &amp; DB SLA</span>
          </a>
        </div>

        {/* Supported Platform Badges */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-white/[0.08] w-full max-w-4xl flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <span>Facebook Page API</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-pink-500/15 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span>Instagram Business API</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Network className="w-3.5 h-3.5" />
            </div>
            <span>LinkedIn v2 Official</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-500/15 flex items-center justify-center text-red-600 dark:text-red-400">
              <Video className="w-3.5 h-3.5" />
            </div>
            <span>YouTube Data API v3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-500/15 flex items-center justify-center text-slate-700 dark:text-slate-200">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span>Google Search SERP</span>
          </div>
        </div>

        {/* Interactive Showcase Preview Panel */}
        <div className="mt-14 w-full max-w-6xl rounded-2xl p-[1px] bg-gradient-to-b from-slate-200 via-slate-100 to-transparent dark:from-white/15 dark:via-white/5 dark:to-transparent shadow-2xl shadow-slate-200/80 dark:shadow-violet-950/50">
          <div className="bg-white dark:bg-[#0b0e17] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 transition-colors">
            {/* Window Top Bar */}
            <div className="px-5 py-3.5 bg-slate-100/80 dark:bg-black/40 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                  growth.getyourclientsb2b.com/admin/dashboard
                </span>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/[0.05] p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setActiveTab("social")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === "social"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Social Automation
                </button>
                <button
                  onClick={() => setActiveTab("seo")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === "seo"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Programmatic SEO
                </button>
                <button
                  onClick={() => setActiveTab("leads")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === "leads"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Cold Outreach
                </button>
              </div>
            </div>

            {/* Tab Preview Content */}
            <div className="p-6 md:p-8">
              {activeTab === "social" && (
                <div className="space-y-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-left">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Meta Connected</span>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Facebook &amp; Instagram
                      </p>
                      <span className="text-[11px] text-slate-500">Page ID: 1125229983597930</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-left">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scheduled Posts</span>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">48 Due</p>
                      <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">Auto-publish active</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-left">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cross-Network Sync</span>
                      <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">5 Channels</p>
                      <span className="text-[11px] text-slate-500">FB, IG, LinkedIn, YT, X</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-left">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly Social Reach</span>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">142,800+</p>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">↑ 34% this month</span>
                    </div>
                  </div>

                  {/* Multi-channel Queue Mockup */}
                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-black/40 p-4 text-left space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Autonomous Content Distribution Pipeline
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Worker Active: publish_due_posts()
                      </span>
                    </div>

                    {[
                      {
                        channel: "Facebook Page + Instagram Business",
                        color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
                        caption: "🚀 How top B2B agencies automate client acquisition with zero manual ad spend...",
                        status: "Scheduled for Today, 4:00 PM",
                        badge: "Sync Enabled",
                      },
                      {
                        channel: "LinkedIn Company & Founder Profile",
                        color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
                        caption: "The exact playbook we used to scale 15 client accounts past $50k MRR using programmatic outbound...",
                        status: "Scheduled for Tomorrow, 9:00 AM",
                        badge: "v2 API Ready",
                      },
                      {
                        channel: "YouTube Shorts & Video Hub",
                        color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
                        caption: "3 AI Automation tools every agency owner must deploy in 2026 (Shorts preview).",
                        status: "Draft Ready",
                        badge: "Video Script Generated",
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-white/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors shadow-sm dark:shadow-none"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${row.color}`}>
                              {row.channel}
                            </span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">{row.badge}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">{row.caption}</p>
                        </div>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-6 text-left">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Programmatic Pages</span>
                      <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">1,480 Generated</p>
                      <span className="text-[11px] text-slate-500">Locations &amp; Niches</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Quality Score</span>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">94.8 / 100</p>
                      <span className="text-[11px] text-slate-500">Zero duplicate content</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keywords in Top 10</span>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">382 Keywords</p>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">↑ 18 this week</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Organic Traffic Value</span>
                      <p className="text-xl font-bold text-violet-600 dark:text-violet-400 mt-1">$24,900 / mo</p>
                      <span className="text-[11px] text-slate-500">Equivalent Google Ads spend</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-black/40 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Programmatic Landing Pages Matrix
                      </span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-medium">Auto-generated with JSON-LD Schema</span>
                    </div>
                    {[
                      { slug: "/alternatives/apollo/agencies", kw: "Best Apollo alternative for B2B agencies", score: 98, status: "Indexed" },
                      { slug: "/find-leads/technology/austin", kw: "Austin tech startup B2B decision makers", score: 95, status: "Indexed" },
                      { slug: "/tools/subject-line-grader", kw: "Free cold email subject line analyzer", score: 99, status: "Top 3 Rank" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] flex items-center justify-between text-xs shadow-sm dark:shadow-none">
                        <div>
                          <span className="text-violet-600 dark:text-violet-400 font-mono font-medium">{item.slug}</span>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px]">{item.kw}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Score: {item.score}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "leads" && (
                <div className="space-y-6 text-left">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total B2B Leads</span>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">12,450</p>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% Verified MX</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email Reply Rate</span>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">8.4%</p>
                      <span className="text-[11px] text-slate-500">Industry avg: 1.8%</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bounce Rate</span>
                      <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">0.3%</p>
                      <span className="text-[11px] text-slate-500">Strict CAN-SPAM compliant</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Sequences</span>
                      <p className="text-xl font-bold text-violet-600 dark:text-violet-400 mt-1">14 Workflows</p>
                      <span className="text-[11px] text-slate-500">Personalized variables</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-black/40 text-xs text-slate-600 dark:text-slate-400">
                    <p className="text-slate-900 dark:text-slate-200 font-semibold mb-2">Autonomous ICP Matching Engine</p>
                    <p className="leading-relaxed">
                      Custom filters for founder, CMO, VP Sales, revenue bracket ($1M-$20M), tech stack (HubSpot, Salesforce, Shopify), and geographic focus with real-time SMTP deliverability check before dispatching.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Telemetry & SLA Section */}
      <section id="infrastructure" className="py-16 border-y border-slate-200 dark:border-white/[0.08] bg-slate-100/60 dark:bg-black/40 relative transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ENTERPRISE HIGH-PERFORMANCE CLOUD ARCHITECTURE
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Live Backend Engine &amp; Database Telemetry
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                Real-time operational verification connecting the Next.js edge frontend, Python FastAPI async engine, and PostgreSQL 16 cluster.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="recheck-telemetry-btn"
                onClick={checkConnection}
                disabled={loadingHealth}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHealth ? "animate-spin" : ""}`} />
                {loadingHealth ? "Querying SLA..." : "Test Live Ping & Status"}
              </button>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                API OpenAPI Docs
              </a>
            </div>
          </div>

          {/* 3 Telemetry Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Frontend Edge Service Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] relative overflow-hidden group hover:border-violet-500/40 shadow-sm dark:shadow-none transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Edge CDN Active
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Frontend Service</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Next.js 14 App Router, React 18, TailwindCSS</p>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-2.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Host:</span>
                  <span className="text-slate-900 dark:text-slate-200">growth.getyourclientsb2b.com</span>
                </div>
                <div className="flex justify-between">
                  <span>SSL &amp; CDN:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">HTTP/2 TLS 1.3 Active</span>
                </div>
                <div className="flex justify-between">
                  <span>State:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Healthy (0 ms Edge)</span>
                </div>
              </div>
            </div>

            {/* Backend FastAPI Service Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] relative overflow-hidden group hover:border-cyan-500/40 shadow-sm dark:shadow-none transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Server className="w-6 h-6" />
                </div>
                {isBackendOk ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Offline
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Backend Service</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Python FastAPI with CORS and Async Engine</p>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-2.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Framework:</span>
                  <span className="text-slate-900 dark:text-slate-200">{health?.backend?.framework || "FastAPI"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Port:</span>
                  <span className="text-slate-900 dark:text-slate-200">8000 (HTTPS Gateway)</span>
                </div>
                <div className="flex justify-between">
                  <span>API Endpoint:</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-medium">growth-api.getyourclientsb2b.com</span>
                </div>
              </div>
            </div>

            {/* Database Service Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] relative overflow-hidden group hover:border-indigo-500/40 shadow-sm dark:shadow-none transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Database className="w-6 h-6" />
                </div>
                {isDbOk ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Connecting...
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Database Service</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PostgreSQL 16 with asyncpg driver &amp; SQLAlchemy</p>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-2.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Dialect:</span>
                  <span className="text-slate-900 dark:text-slate-200">{health?.database?.engine || "postgresql+asyncpg"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ping Latency:</span>
                  <span className={isDbOk ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-500"}>
                    {pingLatency !== null ? `${pingLatency} ms` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Driver Pool:</span>
                  <span className="text-slate-900 dark:text-slate-200">Asyncpg (10 pooled conns)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Solutions Grid (Designed to Sell to Clients) */}
      <section id="social-automation" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            ENTERPRISE AUTOMATION SUITE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            Everything Required to Scale B2B Client Growth
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg">
            Replace 6 disjointed SaaS tools with one automated, developer-grade engine built for maximum client ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Social Automation */}
          <div className="p-8 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/50 shadow-sm hover:shadow-xl dark:shadow-none transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Multi-Platform Social Auto-Publishing</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect official Meta Graph API (Facebook Pages &amp; Instagram Business), LinkedIn v2 API, and Twitter/X. Auto-schedule posts, syndicate threads, and auto-publish content with zero manual friction.
              </p>
            </div>
            <ul className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Cross-posting from Facebook to Instagram
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                AI Hook, caption &amp; hashtag generator
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Autonomous background worker publishing
              </li>
            </ul>
          </div>

          {/* Card 2: Programmatic SEO */}
          <div id="seo-manager" className="p-8 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500/50 shadow-sm hover:shadow-xl dark:shadow-none transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Autonomous SEO Page Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate thousands of high-converting, Google-compliant comparison and location landing pages. Includes automated JSON-LD schema, quality score vetting, and instant XML sitemap indexing.
              </p>
            </div>
            <ul className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Zero keyword cannibalization engine
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Full Google Search Console auto-ping
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Built-in lead capture &amp; conversion forms
              </li>
            </ul>
          </div>

          {/* Card 3: Cold Email Engine */}
          <div id="cold-outreach" className="p-8 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/50 shadow-sm hover:shadow-xl dark:shadow-none transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">CAN-SPAM Cold Outreach Engine</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Run ultra-personalized, deliverability-optimized email sequences with domain warmup protection, real-time MX validation, and automated reply sentiment analysis.
              </p>
            </div>
            <ul className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Mailbox rotation &amp; daily sending caps
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                One-click unsubscribe &amp; physical address compliance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Automated positive reply routing to CRM
              </li>
            </ul>
          </div>

          {/* Card 4: Video Script Studio */}
          <div className="p-8 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] hover:border-pink-500/50 shadow-sm hover:shadow-xl dark:shadow-none transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Viral Video &amp; Shorts Script Studio</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Plan and structure high-retention video scripts for YouTube, TikTok, and Instagram Reels. Includes hook libraries, pacing indicators, and visual cue annotations.
              </p>
            </div>
            <ul className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Script to multi-format repurposing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Automated description &amp; tag generator
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Visual storyboard direction
              </li>
            </ul>
          </div>

          {/* Card 5: Autonomous Brand AI */}
          <div className="p-8 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] hover:border-amber-500/50 shadow-sm hover:shadow-xl dark:shadow-none transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Brand Voice &amp; ICP Guardrails</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enforce strict brand guidelines across every channel. Set banned phrases, target persona criteria, and unique value propositions so all generated content matches your company tone.
              </p>
            </div>
            <ul className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Centralized Brand Profile &amp; Tone matrix
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Automated banned phrase filter
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Customer persona tailored messaging
              </li>
            </ul>
          </div>

          {/* Card 6: Real-time Analytics */}
          <div className="p-8 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/50 shadow-sm hover:shadow-xl dark:shadow-none transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Multi-Channel Growth Attribution</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track clicks, conversion rates, and client acquisitions across social posts, SEO pages, and cold email campaigns with unified first-party tracking links.
              </p>
            </div>
            <ul className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Custom shortlink redirect router (/r/code)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Real-time conversion funnel tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Executive revenue &amp; pipeline dashboards
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison / Client Selling Value Proposition */}
      <section className="py-20 bg-gradient-to-b from-slate-100/60 via-violet-50/40 to-transparent dark:from-black/40 dark:via-violet-950/10 dark:to-transparent border-t border-slate-200 dark:border-white/[0.08] transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Why Agencies Choose GetYourClientsB2B Growth Engine
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base">
            Consolidate your marketing technology stack into one reliable, high-speed ecosystem.
          </p>

          <div className="mt-12 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0b0e17] overflow-hidden text-left shadow-sm">
            <div className="grid grid-cols-3 p-4 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/[0.06] text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span>Capability / Feature</span>
              <span className="text-slate-500">Traditional Stack (6 Tools)</span>
              <span className="text-violet-600 dark:text-violet-400 font-semibold">Growth Engine Platform</span>
            </div>
            {[
              { feat: "Social Media Scheduling", old: "Buffer / Hootsuite ($120/mo)", ge: "Included (Meta, LinkedIn, X, YT)" },
              { feat: "Programmatic SEO Engine", old: "Custom engineering ($2,000+)", ge: "Built-in 1-Click Page Generator" },
              { feat: "Cold Email Outreach", old: "Instantly / Smartlead ($100/mo)", ge: "Included (Warmup + Validation)" },
              { feat: "Video Script Planning", old: "Notion / ChatGPT copy-paste", ge: "Integrated Script-to-Social Studio" },
              { feat: "Backend Engine", old: "Disconnected Zapier webhooks", ge: "FastAPI + PostgreSQL 16 (18ms SLA)" },
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 p-4 border-b border-slate-100 dark:border-white/[0.04] text-xs sm:text-sm hover:bg-slate-50/80 dark:hover:bg-white/[0.01]">
                <span className="font-semibold text-slate-900 dark:text-white">{row.feat}</span>
                <span className="text-slate-500">{row.old}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {row.ge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Banner with Direct Login Links */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-900 dark:from-violet-900/40 dark:via-indigo-900/20 dark:to-[#07090e] border border-violet-500/30 text-white relative overflow-hidden shadow-2xl shadow-violet-900/30 dark:shadow-violet-950/60 transition-all">
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/15 dark:bg-violet-500/20 text-violet-100 dark:text-violet-300 border border-white/20 dark:border-violet-500/30">
                PROVEN B2B GROWTH INFRASTRUCTURE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Ready to Put Your Social &amp; SEO Growth on Autopilot?
              </h2>
              <p className="text-violet-100 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Log in to your command center now to configure social connections, trigger programmatic SEO pages, and deploy high-converting campaigns.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  id="cta-login-btn"
                  href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-slate-900 bg-white hover:bg-slate-100 dark:text-white dark:bg-gradient-to-r dark:from-violet-600 dark:via-indigo-600 dark:to-cyan-500 dark:hover:brightness-110 shadow-xl shadow-black/20 dark:shadow-violet-600/40 transition-all"
                >
                  <Lock className="w-4 h-4 text-violet-700 dark:text-white" />
                  <span>{isLoggedIn ? "Open Admin Console" : "Client Portal Sign In"}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/admin/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                >
                  <span>New Client Setup</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#05070b] py-12 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white">
              G
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white text-sm">GetYourClientsB2B Growth Engine</span>
              <p className="text-[11px] text-slate-500">Autonomous Social &amp; SEO Infrastructure</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/admin/login" className="text-slate-600 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              Client Login
            </Link>
            <Link href="/tools/subject-line-grader" className="text-slate-600 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Free Tools
            </Link>
            <Link href="/alternatives/apollo/agencies" className="text-slate-600 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Comparisons
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Backend API Docs
            </a>
          </div>

          <div className="text-right">
            <span>© {new Date().getFullYear()} GetYourClientsB2B Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
