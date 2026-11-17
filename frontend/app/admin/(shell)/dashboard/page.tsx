"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Share2,
  Search,
  Mail,
  Video,
  BarChart3,
  Users,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Command,
  X,
  ChevronRight,
  Globe,
  Shield,
  Layers,
  Send,
  ExternalLink,
  PlusCircle,
  FileText,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const T = {
  bg: "#05060D",
  bg2: "#0A0B1A",
  violet: "#7C5CFF",
  blue: "#3B82F6",
  cyan: "#22D3EE",
  pink: "#FF3D8B",
  lavender: "#C9B8FF",
  teal: "#7FE0D3",
  muted: "#A1A6C0",
  grad: "linear-gradient(135deg, #7C5CFF 0%, #3B82F6 50%, #22D3EE 100%)",
  gradPink: "linear-gradient(135deg, #FF3D8B 0%, #7C5CFF 100%)",
};

/* ═══════════════════════════════════════════════════════════
   COUNT-UP HOOK
═══════════════════════════════════════════════════════════ */
function useCountUp(target: number, duration = 1800, start = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * target));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [target, duration, start]);

  return count;
}

/* ═══════════════════════════════════════════════════════════
   SPARKLINE COMPONENT (SVG)
═══════════════════════════════════════════════════════════ */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 110;
  const height = 36;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   CHART DATA (30 DAYS)
═══════════════════════════════════════════════════════════ */
const CHART_DATA = [
  { day: "Oct 16", reach: 3200, leads: 180 },
  { day: "Oct 18", reach: 3800, leads: 210 },
  { day: "Oct 20", reach: 4100, leads: 240 },
  { day: "Oct 22", reach: 4900, leads: 290 },
  { day: "Oct 24", reach: 4600, leads: 270 },
  { day: "Oct 26", reach: 5400, leads: 340 },
  { day: "Oct 28", reach: 6200, leads: 390 },
  { day: "Oct 30", reach: 5900, leads: 370 },
  { day: "Nov 01", reach: 6800, leads: 430 },
  { day: "Nov 03", reach: 7400, leads: 480 },
  { day: "Nov 05", reach: 8100, leads: 520 },
  { day: "Nov 07", reach: 7900, leads: 510 },
  { day: "Nov 09", reach: 8900, leads: 580 },
  { day: "Nov 11", reach: 9800, leads: 640 },
  { day: "Nov 13", reach: 11200, leads: 720 },
  { day: "Nov 14", reach: 12400, leads: 810 },
];

/* ═══════════════════════════════════════════════════════════
   SCHEDULED POSTS TIMELINE DATA
═══════════════════════════════════════════════════════════ */
const SCHEDULED_POSTS = [
  {
    id: 1,
    time: "Today 4:00 PM",
    platform: "Instagram & FB",
    badge: "Meta Graph API",
    badgeColor: "#1877F2",
    title: "5 Ways High-Ticket Agencies Automate Client Acquisition",
    type: "Carousel (10 Slides)",
    status: "Publishing",
    statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: 2,
    time: "Today 6:30 PM",
    platform: "LinkedIn",
    badge: "v2 API Live",
    badgeColor: "#0A66C2",
    title: "The B2B Cold Outreach Playbook that book 80+ qualified calls/mo",
    type: "Founder Long-Form",
    status: "Scheduled",
    statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: 3,
    time: "Tonight 9:15 PM",
    platform: "X / Twitter",
    badge: "Thread",
    badgeColor: "#FFFFFF",
    title: "3 AI Growth engines top modern marketing agencies deploy in 2026 🧵",
    type: "7-Post Syndicate",
    status: "Scheduled",
    statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: 4,
    time: "Tomorrow 9:00 AM",
    platform: "YouTube",
    badge: "Shorts",
    badgeColor: "#EF4444",
    title: "How to automate CAN-SPAM compliant cold emails in 30 seconds",
    type: "Shorts 60fps",
    status: "Scheduled",
    statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: 5,
    time: "Completed",
    platform: "SEO Engine",
    badge: "Google GSC",
    badgeColor: "#10B981",
    title: "Published 24 location comparison pages: /alternatives/apollo/[city]",
    type: "Programmatic Schema",
    status: "Published ✓",
    statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
];

/* ═══════════════════════════════════════════════════════════
   LIVE ACTIVITY FEED DATA
═══════════════════════════════════════════════════════════ */
const ACTIVITY_FEED = [
  {
    id: 1,
    icon: Share2,
    color: "#7C5CFF",
    title: "Meta Graph API Cross-Post Verified",
    desc: "Carousel successfully published to FB Page & IG Business account.",
    time: "2m ago",
  },
  {
    id: 2,
    icon: Search,
    color: "#22D3EE",
    title: "Google Search Console Sitemap Pinged",
    desc: "18 new comparison URLs submitted & verified for indexing.",
    time: "14m ago",
  },
  {
    id: 3,
    icon: Mail,
    color: "#FF3D8B",
    title: "Outreach Sequence Dispatched",
    desc: "Mailbox rotation: 65 warmup emails sent. 0 bounce rate.",
    time: "32m ago",
  },
  {
    id: 4,
    icon: Users,
    color: "#10B981",
    title: "New Verified B2B Lead Captured",
    desc: "VP of Growth @ CloudScale requested marketing audit via /tools.",
    time: "1h ago",
  },
  {
    id: 5,
    icon: Video,
    color: "#F59E0B",
    title: "Shorts Script Synthesized",
    desc: "High-retention script exported with visual pacing cues & tags.",
    time: "2h ago",
  },
  {
    id: 6,
    icon: Shield,
    color: "#3B82F6",
    title: "Brand Voice Guardrail Check: PASSED",
    desc: "Filtered 4 prohibited buzzwords; tone score calibrated to 98%.",
    time: "3h ago",
  },
];

/* ═══════════════════════════════════════════════════════════
   COMMAND PALETTE ITEMS
═══════════════════════════════════════════════════════════ */
const COMMAND_ITEMS = [
  {
    category: "Navigation",
    items: [
      { label: "Executive Overview", href: "/admin/dashboard", icon: LayoutIcon },
      { label: "Social Content Calendar", href: "/admin/calendar", icon: Share2 },
      { label: "Programmatic SEO Manager", href: "/admin/seo", icon: Search },
      { label: "CAN-SPAM Cold Outreach", href: "/admin/campaigns", icon: Mail },
      { label: "Viral Video Script Studio", href: "/admin/video", icon: Video },
      { label: "Brand Voice Guardrails", href: "/admin/content-studio", icon: Sparkles },
      { label: "Analytics & Attribution", href: "/admin/account-manager", icon: BarChart3 },
      { label: "Engine Health & API SLA", href: "/admin/connections", icon: Activity },
      { label: "Settings & Credentials", href: "/admin/settings", icon: SettingsIcon },
    ],
  },
  {
    category: "Quick Actions",
    items: [
      { label: "New Social Post Syndicate", href: "/admin/calendar", icon: PlusCircle },
      { label: "Generate 50 SEO Comparison Pages", href: "/admin/seo", icon: FileText },
      { label: "Launch Cold Email Sequence", href: "/admin/campaigns", icon: Send },
      { label: "View FastAPI & Database SLA", href: "/admin/connections", icon: Zap },
    ],
  },
];

function LayoutIcon(props: any) {
  return <TrendingUp {...props} />;
}
function SettingsIcon(props: any) {
  return <Shield {...props} />;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Simulate skeleton loader finish
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Global Ctrl+K / ⌘K listener + custom event from top-bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };

    const handleCustomOpen = () => setPaletteOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, []);

  // Filter command palette items
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return COMMAND_ITEMS;
    const query = searchQuery.toLowerCase();

    return COMMAND_ITEMS.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.label.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  // Flattened items for keyboard navigation
  const flatItems = useMemo(() => {
    return filteredCommands.flatMap((cat) => cat.items);
  }, [filteredCommands]);

  const handleSelectCommand = (href: string) => {
    setPaletteOpen(false);
    router.push(href);
  };

  // Keyboard navigation inside command palette
  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (flatItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % (flatItems.length || 1));
    } else if (e.key === "Enter" && flatItems[selectedIndex]) {
      e.preventDefault();
      handleSelectCommand(flatItems[selectedIndex].href);
    }
  };

  // Animated KPI numbers
  const countReach = useCountUp(142800, 1600, !loading);
  const countKeywords = useCountUp(1247, 1600, !loading);
  const countLeads = useCountUp(9521, 1600, !loading);
  const countPages = useCountUp(3089, 1600, !loading);

  return (
    <div className="space-y-8 pb-16 md:pb-6 max-w-7xl mx-auto">
      {/* ─── Hero Headline & Quick Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border mb-2.5"
            style={{
              background: "rgba(124, 92, 255, 0.1)",
              borderColor: "rgba(124, 92, 255, 0.3)",
              color: T.lavender,
            }}
          >
            <Sparkles className="w-3 h-3 text-violet-400" />
            AUTONOMOUS SOCIAL & SEO INFRASTRUCTURE
          </div>
          <h2
            className="text-2xl sm:text-3xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Growth Command Center
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A6C0] mt-1">
            Meta Graph APIs, programmatic SEO pages, and CAN-SPAM deliverability telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border text-white transition-all hover:bg-white/5 active:scale-95"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Command className="w-3.5 h-3.5 text-violet-400" />
            <span>Command Menu</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#A1A6C0] bg-white/5 border border-white/10">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/admin/calendar"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-lg"
            style={{
              background: T.grad,
              boxShadow: "0 4px 20px rgba(124, 92, 255, 0.4)",
            }}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Content</span>
          </Link>
        </div>
      </div>

      {/* ─── 1. KPI Cards with Count-Up & Sparklines ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Social Reach */}
        <div
          className="p-5 rounded-[24px] border relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "rgba(255, 255, 255, 0.025)",
            borderColor: "rgba(124, 92, 255, 0.25)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A6C0]">
              Monthly Social Reach
            </span>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #7C5CFF, #C9B8FF)" }}
            >
              <Share2 className="w-4 h-4" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 py-2">
              <div className="h-8 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span
                  className="text-3xl font-black text-white tabular-nums tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {countReach.toLocaleString()}+
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                  ↑ 34%
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-[11px] text-[#A1A6C0]">Meta + LinkedIn + X</span>
                <Sparkline data={[12, 19, 15, 28, 22, 36, 42]} color={T.violet} />
              </div>
            </>
          )}
        </div>

        {/* Card 2: Keywords Top 10 */}
        <div
          className="p-5 rounded-[24px] border relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "rgba(255, 255, 255, 0.025)",
            borderColor: "rgba(34, 211, 238, 0.25)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A6C0]">
              Keywords in Top 10
            </span>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #22D3EE, #3B82F6)" }}
            >
              <Search className="w-4 h-4" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 py-2">
              <div className="h-8 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span
                  className="text-3xl font-black text-white tabular-nums tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {countKeywords.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                  ↑ 18%
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-[11px] text-[#A1A6C0]">Programmatic SEO</span>
                <Sparkline data={[8, 14, 18, 21, 29, 31, 38]} color={T.cyan} />
              </div>
            </>
          )}
        </div>

        {/* Card 3: Verified Leads */}
        <div
          className="p-5 rounded-[24px] border relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "rgba(255, 255, 255, 0.025)",
            borderColor: "rgba(16, 185, 129, 0.25)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A6C0]">
              Verified B2B Leads
            </span>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #10B981, #7FE0D3)" }}
            >
              <Users className="w-4 h-4" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 py-2">
              <div className="h-8 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span
                  className="text-3xl font-black text-white tabular-nums tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {countLeads.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                  ↑ 12%
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-[11px] text-[#A1A6C0]">Valid MX & CAN-SPAM</span>
                <Sparkline data={[14, 22, 20, 27, 34, 39, 48]} color="#10B981" />
              </div>
            </>
          )}
        </div>

        {/* Card 4: SEO Pages */}
        <div
          className="p-5 rounded-[24px] border relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "rgba(255, 255, 255, 0.025)",
            borderColor: "rgba(255, 61, 139, 0.25)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A6C0]">
              Programmatic SEO Pages
            </span>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #FF3D8B, #7C5CFF)" }}
            >
              <Globe className="w-4 h-4" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 py-2">
              <div className="h-8 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span
                  className="text-3xl font-black text-white tabular-nums tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {countPages.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                  ↑ 28%
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-[11px] text-[#A1A6C0]">Indexation 99.2%</span>
                <Sparkline data={[10, 16, 25, 30, 36, 44, 52]} color={T.pink} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── 2. Gradient Area Chart: Reach & Leads ─── */}
      <div
        className="p-6 rounded-[28px] border relative overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="text-lg font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Growth Trajectory & Organic Leads
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20">
                LAST 30 DAYS
              </span>
            </div>
            <p className="text-xs text-[#A1A6C0] mt-0.5">
              Correlation between autonomous social reach and inbound high-intent leads.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: T.violet }} />
              <span className="text-white">Social Reach (impressions)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: T.cyan }} />
              <span className="text-white">Inbound Leads</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 w-full bg-white/[0.02] rounded-2xl animate-pulse flex items-center justify-center text-xs text-[#A1A6C0]">
            Loading real-time telemetry analytics…
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={CHART_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.violet} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={T.violet} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.cyan} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={T.cyan} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#A1A6C0"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }}
                />
                <YAxis
                  stroke="#A1A6C0"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          className="p-3.5 rounded-xl border text-xs shadow-2xl"
                          style={{
                            background: "rgba(10, 11, 26, 0.95)",
                            borderColor: "rgba(124, 92, 255, 0.4)",
                            backdropFilter: "blur(16px)",
                          }}
                        >
                          <p className="font-bold text-white mb-2">{label}</p>
                          <div className="space-y-1.5">
                            <p className="flex items-center justify-between gap-4 text-violet-300">
                              <span>Social Reach:</span>
                              <span className="font-mono font-bold text-white">
                                {Number(payload[0]?.value).toLocaleString()}
                              </span>
                            </p>
                            <p className="flex items-center justify-between gap-4 text-cyan-300">
                              <span>Inbound Leads:</span>
                              <span className="font-mono font-bold text-white">
                                {Number(payload[1]?.value).toLocaleString()}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke={T.violet}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorReach)"
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke={T.cyan}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ─── 3. Two-Column Layout: Timeline + Activity Feed ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Scheduled Posts Timeline */}
        <div
          className="lg:col-span-7 p-6 rounded-[28px] border flex flex-col justify-between"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <h3
                  className="text-base font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Autonomous Content Distribution Pipeline
                </h3>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              <Link
                href="/admin/calendar"
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
              >
                Full Calendar <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3.5 relative">
                {/* Connecting subtle line */}
                <div
                  className="absolute left-4 top-4 bottom-4 w-0.5 pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(124, 92, 255, 0.4), rgba(34, 211, 238, 0.2))",
                  }}
                />

                {SCHEDULED_POSTS.map((post) => (
                  <div
                    key={post.id}
                    className="p-3.5 rounded-2xl border transition-all hover:border-white/20 relative z-10 flex items-start gap-3.5 group"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderColor: "rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    {/* Platform icon dot */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md group-hover:scale-105 transition-transform"
                      style={{
                        background: post.badgeColor,
                        boxShadow: `0 0 12px ${post.badgeColor}40`,
                      }}
                    >
                      {post.platform[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-white truncate max-w-[200px]">
                          {post.platform}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[#A1A6C0]">
                          {post.badge}
                        </span>
                        <span className="text-[10px] text-[#A1A6C0] font-mono ml-auto">
                          {post.time}
                        </span>
                      </div>

                      <p className="text-xs text-[#A1A6C0] line-clamp-1 leading-snug">
                        {post.title}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                        <span className="text-[10px] font-mono text-[#A1A6C0]">
                          {post.type}
                        </span>
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            post.statusColor
                          )}
                        >
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="mt-5 p-3 rounded-xl border flex items-center justify-between text-xs"
            style={{
              background: "rgba(124, 92, 255, 0.06)",
              borderColor: "rgba(124, 92, 255, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 text-violet-300">
              <Zap className="w-3.5 h-3.5" />
              <span>Next automated run in <strong>28 minutes</strong></span>
            </div>
            <span className="font-mono text-[11px] text-[#A1A6C0]">Queue: 14 posts ready</span>
          </div>
        </div>

        {/* Right Column (5 cols): Activity Feed */}
        <div
          className="lg:col-span-5 p-6 rounded-[28px] border flex flex-col justify-between"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3
                className="text-base font-bold text-white flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Growth Engine Feed
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                REAL-TIME
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-white/[0.02] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {ACTIVITY_FEED.map((event) => {
                  const Icon = event.icon;
                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-2xl border transition-all hover:bg-white/[0.03] flex items-start gap-3"
                      style={{
                        background: "rgba(255, 255, 255, 0.015)",
                        borderColor: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: `${event.color}18`,
                          border: `1px solid ${event.color}35`,
                          color: event.color,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-white truncate">
                            {event.title}
                          </p>
                          <span className="text-[10px] font-mono text-[#A1A6C0] shrink-0">
                            {event.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A1A6C0] mt-0.5 line-clamp-1">
                          {event.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/admin/connections"
            className="mt-5 w-full py-2.5 rounded-xl border text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-all text-[#A1A6C0] hover:text-white hover:bg-white/5"
            style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
          >
            <span>Verify Live API Connections & Webhooks</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── 4. Command Palette Modal (Ctrl+K / ⌘K) ─── */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border overflow-hidden shadow-2xl relative"
            style={{
              background: "#0A0B1A",
              borderColor: "rgba(124, 92, 255, 0.35)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(124, 92, 255, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handlePaletteKeyDown}
          >
            {/* Search Input */}
            <div
              className="p-4 flex items-center gap-3 border-b"
              style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <Search className="w-4 h-4 text-violet-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or jump to page... (e.g. Social, SEO, Leads)"
                className="w-full bg-transparent text-sm text-white placeholder-[#A1A6C0] focus:outline-none"
              />
              <button
                onClick={() => setPaletteOpen(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-[#A1A6C0] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-4">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#A1A6C0]">
                  No matching commands found.
                </div>
              ) : (
                filteredCommands.map((category) => (
                  <div key={category.category}>
                    <p className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#A1A6C0]">
                      {category.category}
                    </p>
                    <div className="space-y-0.5 mt-1">
                      {category.items.map((item) => {
                        const Icon = item.icon;
                        const isSelected =
                          flatItems[selectedIndex]?.label === item.label;

                        return (
                          <div
                            key={item.label}
                            onClick={() => handleSelectCommand(item.href)}
                            onMouseEnter={() => {
                              const idx = flatItems.findIndex(
                                (fi) => fi.label === item.label
                              );
                              if (idx !== -1) setSelectedIndex(idx);
                            }}
                            className={clsx(
                              "px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                              isSelected
                                ? "bg-violet-600/20 text-white border border-violet-500/30"
                                : "text-[#A1A6C0] hover:text-white hover:bg-white/[0.04] border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center"
                                style={{
                                  background: isSelected
                                    ? "linear-gradient(135deg, #7C5CFF, #3B82F6)"
                                    : "rgba(255, 255, 255, 0.05)",
                                  color: isSelected ? "#fff" : "#A1A6C0",
                                }}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span>{item.label}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#A1A6C0] opacity-60">
                              Jump ↵
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer guide */}
            <div
              className="p-3 border-t flex items-center justify-between text-[11px] text-[#A1A6C0]"
              style={{
                borderColor: "rgba(255, 255, 255, 0.06)",
                background: "rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="flex items-center gap-3">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>ESC to close</span>
              </div>
              <span className="text-violet-400 font-mono inline-flex items-center gap-1.5">
                <img src="/images/logo.png" alt="" className="w-3.5 h-3.5 object-contain" />
                GetYourClientsB2B v2.0
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. Mobile Bottom Navigation (md:hidden) ─── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t px-4 py-2 flex items-center justify-around"
        style={{
          background: "rgba(7, 8, 20, 0.94)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        {[
          { label: "Overview", href: "/admin/dashboard", icon: TrendingUp },
          { label: "Social", href: "/admin/calendar", icon: Share2 },
          { label: "SEO", href: "/admin/seo", icon: Search },
          { label: "Outreach", href: "/admin/campaigns", icon: Mail },
          { label: "Menu", href: "#", icon: Command, onClick: () => setPaletteOpen(true) },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === "/admin/dashboard";

          return (
            <button
              key={tab.label}
              onClick={() => {
                if (tab.onClick) {
                  tab.onClick();
                } else {
                  router.push(tab.href);
                }
              }}
              className="flex flex-col items-center gap-1 py-1 px-2 relative"
            >
              <div
                className={clsx(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                  isActive
                    ? "text-white"
                    : "text-[#A1A6C0]"
                )}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #7C5CFF, #3B82F6)",
                        boxShadow: "0 0 12px rgba(124, 92, 255, 0.5)",
                      }
                    : {}
                }
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span
                className={clsx(
                  "text-[10px] font-bold tracking-tight",
                  isActive ? "text-white" : "text-[#A1A6C0]"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
