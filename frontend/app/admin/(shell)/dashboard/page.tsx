"use client";

import {
  useAnalyticsOverview,
  useCampaigns,
  usePosts,
  useSEOPages,
  useToolsOverview,
  useLaunchTasks,
} from "@/lib/hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Mail,
  MousePointer,
  RefreshCw,
  TrendingUp,
  Users,
  AlertTriangle,
  Send,
  Eye,
  MessageSquare,
  XCircle,
  ExternalLink,
  CheckSquare,
  Share2,
  Rocket,
  Wrench,
  Search,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse", className)} />
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function KpiCard({ label, value, subLabel, icon, color, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.8)] rounded-2xl p-5">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.8)] rounded-2xl p-5 group hover:shadow-[6px_6px_0px_0px_rgba(37,99,235,0.8)] transition-shadow">
      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-blue-500/8 dark:bg-blue-500/10" />
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
        <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center text-xs", color)}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums leading-none">{value}</p>
      {subLabel && <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">{subLabel}</p>}
    </div>
  );
}

// ─── Channel Chart ────────────────────────────────────────────────────────────

const CHANNEL_COLORS: Record<string, string> = {
  email: "#8b5cf6",
  x: "#22d3ee",
  linkedin: "#3b82f6",
  instagram: "#ec4899",
  facebook: "#6366f1",
  youtube: "#ef4444",
  seo: "#10b981",
  tools: "#f59e0b",
  product_hunt: "#f97316",
  reddit: "#ff4500",
  indiehackers: "#14b8a6",
  direct: "#64748b",
};

interface ChannelData {
  channel: string;
  visits: number;
}

function ChannelChart({ data, loading }: { data: ChannelData[]; loading: boolean }) {
  if (loading) {
    return <Skeleton className="h-56 w-full" />;
  }

  const nonEmpty = data.filter((d) => d.visits > 0);
  const chartData = nonEmpty.length > 0 ? nonEmpty : data.slice(0, 5);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="channel"
          tick={{ fontSize: 10, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0d0d14",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e2e8f0",
          }}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={entry.channel}
              fill={CHANNEL_COLORS[entry.channel] || "#6366f1"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useAnalyticsOverview();
  const { data: campaigns } = useCampaigns();
  const { data: pendingPosts } = usePosts({ status: "pending_approval" });
  const { data: toolsOverview } = useToolsOverview();
  const { data: launchTasks } = useLaunchTasks();
  const { data: publishedSeoPages } = useSEOPages({ status: "published" });

  const pendingCount = pendingPosts?.length || 0;

  const totalLaunch = launchTasks?.length || 0;
  const completedLaunch = launchTasks?.filter((t) => t.status === "done").length || 0;
  const launchProgressPct = totalLaunch > 0 ? Math.round((completedLaunch / totalLaunch) * 100) : 0;

  const channelData: ChannelData[] = Object.entries(data?.channels || {}).map(([channel, visits]) => ({
    channel,
    visits: visits as number,
  }));

  // Detect campaign health alerts
  const pausedCampaigns = campaigns?.filter((c) => c.status === "paused") || [];

  return (
    <div className="relative min-h-screen p-5 md:p-8 space-y-8">
      {/* Ambient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] animate-pulse-slow" />
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            Growth Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">Overview of your growth engine and outreach</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          <RefreshCw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Items Awaiting Approval Banner */}
      {pendingCount > 0 && (
        <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 border border-blue-200 dark:border-blue-500/30 rounded-xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Items Awaiting Approval</p>
              <p className="mt-0.5 text-blue-800 dark:text-blue-200/80 font-medium text-xs">
                {pendingCount} social post {pendingCount === 1 ? "draft is" : "drafts are"} queued for your human review before publishing.
              </p>
            </div>
          </div>
          <Link
            href="/admin/calendar"
            className="inline-flex items-center gap-1 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 shrink-0"
          >
            Review Queue <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Campaign Health Alerts */}
      {pausedCampaigns.length > 0 && (
        <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 border border-amber-200 dark:border-amber-500/30 rounded-xl items-start justify-between">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Campaign Safety Alert</p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-200/80 font-medium text-xs">
                {pausedCampaigns.length === 1
                  ? `Campaign "${pausedCampaigns[0].name}" is paused. Auto-paused if bounce rate > 5% or complaint rate > 0.3%.`
                  : `${pausedCampaigns.length} campaigns are currently paused.`}
              </p>
            </div>
          </div>
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center gap-1 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 shrink-0"
          >
            Review Campaigns <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 border border-red-200 dark:border-red-500/30 rounded-xl">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">Could not load analytics. Is the backend running?</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Total Visits"
          value={data?.overview.total_visits.toLocaleString() ?? "—"}
          icon={<MousePointer className="w-4 h-4" />}
          color="bg-violet-500/15 text-violet-400"
          loading={isLoading}
        />
        <KpiCard
          label="Signups"
          value={data?.overview.total_signups.toLocaleString() ?? "—"}
          icon={<Users className="w-4 h-4" />}
          color="bg-emerald-500/15 text-emerald-400"
          loading={isLoading}
        />
        <KpiCard
          label="Conversion Rate"
          value={data ? `${data.overview.conversion_rate_pct}%` : "—"}
          icon={<TrendingUp className="w-4 h-4" />}
          color="bg-blue-500/15 text-blue-400"
          loading={isLoading}
        />
        <KpiCard
          label="Awaiting Approval"
          value={pendingCount}
          subLabel="Social review queue"
          icon={<CheckSquare className="w-4 h-4" />}
          color="bg-purple-500/15 text-purple-400"
          loading={isLoading}
        />
        <KpiCard
          label="Emails Sent"
          value={data?.email.sent.toLocaleString() ?? "—"}
          subLabel={data ? `Reply ${data.email.reply_rate_pct}% · Bounce ${data.email.bounce_rate_pct}%` : undefined}
          icon={<Mail className="w-4 h-4" />}
          color="bg-amber-500/15 text-amber-400"
          loading={isLoading}
        />
      </div>

      {/* Outreach Health & Channel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Channel attribution chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow flex flex-col justify-between">
          <div>
            {/* Section divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full bg-blue-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Channel Attribution (Visits)</h2>
              <span className="ml-auto text-xs font-medium text-slate-600 dark:text-slate-400">UTM source attribution</span>
            </div>
            <ChannelChart data={channelData} loading={isLoading} />
          </div>

          {/* Channel Breakdown Rows */}
          <div className="mt-4 pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3.5 text-xs">
            <span className="text-slate-700 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest">Attribution:</span>
            {[
              { id: "x", label: "X" },
              { id: "linkedin", label: "LinkedIn" },
              { id: "instagram", label: "Instagram" },
              { id: "facebook", label: "Facebook" },
              { id: "youtube", label: "YouTube" },
              { id: "seo", label: "SEO" },
              { id: "tools", label: "Tools" },
              { id: "product_hunt", label: "PH" },
              { id: "reddit", label: "Reddit" },
            ].map((ch) => {
              const visits = data?.channels?.[ch.id] || 0;
              return (
                <div key={ch.id} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CHANNEL_COLORS[ch.id] || "#64748b" }}
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{ch.label}:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{visits}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email Outreach Performance summary */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow flex flex-col justify-between">
          <div>
            {/* Section divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full bg-violet-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Email Deliverability
              </h2>
              <Link href="/admin/campaigns" className="ml-auto text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Total Sent</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  {data?.email.sent.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Total Scheduled</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {data?.email.total_scheduled.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Reply Rate</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  {data?.email.reply_rate_pct ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Bounce Rate</span>
                <span className={clsx(
                  "font-mono font-bold",
                  (data?.email.bounce_rate_pct ?? 0) > 5 ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-300"
                )}>
                  {data?.email.bounce_rate_pct ?? 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-slate-100 dark:border-slate-800">
            <Link
              href="/admin/inbox"
              className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              Open Prospect Inbox
            </Link>
          </div>
        </div>
      </div>

      {/* Free Tools + Launch Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Free Lead-Magnet Tools Card */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow flex flex-col justify-between">
          <div>
            {/* Section divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full bg-cyan-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Free Lead-Magnet Tools
              </h2>
              <span className="ml-auto text-xs text-cyan-600 dark:text-cyan-400 font-black font-mono">
                {toolsOverview?.conversion_rate_pct ?? 0}% conversion
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Runs</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {toolsOverview?.total_runs ?? 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Emails</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {toolsOverview?.emails_captured ?? 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">IP Limit</div>
                <div className="text-lg font-black text-slate-800 dark:text-slate-300 mt-0.5">5 / day</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <Link
              href="/tools/subject-line-grader"
              target="_blank"
              className="inline-flex items-center gap-1 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100"
            >
              Subject Grader <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/tools/email-verifier"
              target="_blank"
              className="inline-flex items-center gap-1 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100"
            >
              Email Verifier <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Product Launch Hub Progress Card */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow flex flex-col justify-between">
          <div>
            {/* Section divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full bg-amber-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Rocket className="w-4 h-4 text-amber-500" />
                Launch Hub Progress
              </h2>
              <Link href="/admin/launch" className="ml-auto text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                Manage Hub
              </Link>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Checklist Completion</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{launchProgressPct}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${launchProgressPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Tasks Done</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{completedLaunch} / {totalLaunch}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Platforms</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">5 Active</span>
              </div>
              <div className="p-2 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Reviews</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">G2/Capterra</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t-2 border-slate-100 dark:border-slate-800">
            <Link
              href="/admin/launch"
              className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
            >
              Open Launch Kanban Board →
            </Link>
          </div>
        </div>
      </div>

      {/* Top Posts + Top SEO Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top posts */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full bg-blue-500" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Top Published Posts</h2>
            <Link href="/admin/calendar" className="ml-auto inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-xs border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100">
              Calendar
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : data?.top_posts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm font-medium">
              No published posts yet. Schedule and approve in the Content Studio.
            </div>
          ) : (
            <div className="space-y-2">
              {data?.top_posts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)] shrink-0">
                    {post.platform}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium">{post.body_preview}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top SEO pages */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full bg-emerald-500" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Top SEO Pages
            </h2>
            <Link href="/admin/seo" className="ml-auto inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-xs border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100">
              SEO Manager
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (data?.top_seo_pages.length === 0 && (!publishedSeoPages || publishedSeoPages.length === 0)) ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm font-medium">
              No published SEO pages yet. Generate and publish in the SEO Manager.
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.top_seo_pages.length ? data.top_seo_pages : publishedSeoPages?.slice(0, 5) || []).map((page: any) => (
                <div key={page.id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-colors">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{page.title || page.slug}</p>
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline truncate block"
                    >
                      /{page.slug}
                    </a>
                  </div>
                  {page.quality_score != null && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm shrink-0 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {page.quality_score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
