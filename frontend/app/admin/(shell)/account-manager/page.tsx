"use client";

import React, { useState } from "react";
import {
  BarChart3, TrendingUp, Clock, CheckSquare, FileText,
  RefreshCw, ChevronRight, AlertCircle, Sparkles,
  Linkedin, Instagram, Facebook, Youtube, ArrowUpRight,
  Star, Zap, Target, Users, Eye,
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import {
  useAccountAudit,
  useRunAccountAudit,
  useBestTimes,
  useStrategyMemo,
  useEngagementTasks,
  useMetricsInsights,
} from "@/lib/hooks";
import type { AccountAuditFinding } from "@/lib/api-client";

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "linkedin",  label: "LinkedIn",  icon: Linkedin,  activeBg: "bg-blue-600",   activeBorder: "border-blue-900",   activeShadow: "shadow-[3px_3px_0px_0px_rgba(30,58,138,0.9)]",   bg: "bg-blue-600" },
  { id: "instagram", label: "Instagram", icon: Instagram, activeBg: "bg-pink-600",   activeBorder: "border-pink-900",   activeShadow: "shadow-[3px_3px_0px_0px_rgba(131,24,67,0.9)]",   bg: "bg-pink-600" },
  { id: "facebook",  label: "Facebook",  icon: Facebook,  activeBg: "bg-indigo-600", activeBorder: "border-indigo-900", activeShadow: "shadow-[3px_3px_0px_0px_rgba(49,46,129,0.9)]",   bg: "bg-indigo-600" },
  { id: "youtube",   label: "YouTube",   icon: Youtube,   activeBg: "bg-red-600",    activeBorder: "border-red-900",    activeShadow: "shadow-[3px_3px_0px_0px_rgba(127,29,29,0.9)]",   bg: "bg-red-600" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── ScoreRing ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 100, label }: { score: number; size?: number; label?: string }) {
  const r = (size / 2) * 0.78;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-slate-200 dark:text-slate-700" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ / 4}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x="50%" y="45%" textAnchor="middle" dominantBaseline="central" fontSize={size * 0.26} fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x="50%" y="68%" textAnchor="middle" dominantBaseline="central" fontSize={size * 0.14} fill="#94a3b8">
          {grade}
        </text>
      </svg>
      {label && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
}

// ─── Heatmap cell ─────────────────────────────────────────────────────────────

function HeatCell({ score }: { score: number }) {
  const opacity =
    score >= 90 ? "bg-emerald-500" :
    score >= 70 ? "bg-emerald-400" :
    score >= 50 ? "bg-emerald-300 dark:bg-emerald-600" :
    score >= 30 ? "bg-slate-200 dark:bg-slate-600" :
    "bg-slate-100 dark:bg-slate-700";
  return (
    <div className={clsx("h-8 rounded-md transition-all duration-300 relative group", opacity)}>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 px-1.5 py-0.5 rounded whitespace-nowrap z-10">
        {score}%
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={clsx("h-4 bg-slate-200 dark:bg-slate-700 rounded-lg", i % 2 === 0 ? "w-3/4" : "w-1/2")} />
      ))}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "audit",    label: "Profile Audit",  icon: BarChart3 },
  { id: "times",    label: "Best Times",     icon: Clock },
  { id: "strategy", label: "Strategy Memo",  icon: FileText },
  { id: "tasks",    label: "Daily Tasks",    icon: CheckSquare },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AccountManagerPage() {
  const [platform, setPlatform] = useState("linkedin");
  const [tab, setTab] = useState("audit");

  const { data: audit, isLoading: auditLoading, refetch: refetchAudit } = useAccountAudit(platform);
  const { data: bestTimes, isLoading: timesLoading } = useBestTimes(platform);
  const { data: memo, isLoading: memoLoading } = useStrategyMemo();
  const { data: tasksData, isLoading: tasksLoading } = useEngagementTasks();
  const { data: insights } = useMetricsInsights();
  const runAudit = useRunAccountAudit();

  const handleRunAudit = () => {
    runAudit.mutate({ platform }, {
      onSuccess: () => { toast.success("Audit complete!"); refetchAudit(); },
      onError: () => toast.error("Audit failed — check your connections."),
    });
  };

  const activePlatform = PLATFORMS.find(p => p.id === platform)!;
  const PlatformIcon = activePlatform.icon;

  return (
    <div className="relative min-h-screen p-5 md:p-8 space-y-8">
      {/* Ambient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] animate-pulse" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-3.5 h-3.5" />
            AI Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Account Manager
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            AI-powered profile audits, optimal posting times &amp; weekly strategy
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={runAudit.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {runAudit.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {runAudit.isPending ? "Running Audit…" : "Run AI Audit"}
        </button>
      </div>

      {/* Platform Selector */}
      <div className="flex flex-wrap gap-3">
        {PLATFORMS.map(p => {
          const Icon = p.icon;
          const active = platform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-2 rounded-xl transition-all duration-100",
                active
                  ? clsx(
                      p.activeBg, p.activeBorder, p.activeShadow,
                      "text-white hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none"
                    )
                  : "bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px]"
              )}
            >
              <Icon className="w-4 h-4" />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Metrics Overview Strip — LAYER 5 KPI cards */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Avg Reach",      value: insights.avg_reach?.toFixed(0) ?? "—",           icon: Eye,       shadowColor: "shadow-[4px_4px_0px_0px_rgba(37,99,235,0.8)]" },
            { label: "Posts Tracked",  value: String(insights.total_posts_tracked ?? "—"),      icon: TrendingUp, shadowColor: "shadow-[4px_4px_0px_0px_rgba(16,185,129,0.8)]" },
            { label: "Best Platform",  value: insights.best_platform ?? "—",                    icon: Star,       shadowColor: "shadow-[4px_4px_0px_0px_rgba(245,158,11,0.8)]" },
            { label: "Top Insight",    value: insights.insights?.[0]?.slice(0, 20) ?? "—",      icon: Target,     shadowColor: "shadow-[4px_4px_0px_0px_rgba(139,92,246,0.8)]" },
          ].map(({ label, value, icon: Icon, shadowColor }) => (
            <div key={label} className={clsx(
              "relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-5 group",
              shadowColor
            )}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-blue-500/8 dark:bg-blue-500/10" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
              <Icon className="w-4 h-4 text-slate-400 mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* Tab Nav — LAYER 8 brutalist tab strip */}
      <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] flex-wrap">
        {TABS.map((t, i) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "flex items-center gap-1.5 font-bold text-sm px-4 py-2 transition-colors",
                i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                tab === t.id
                  ? "bg-slate-900 dark:bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab: Profile Audit ───────────────────────────────────────────────── */}
      {tab === "audit" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Score Ring card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow flex flex-col items-center justify-center gap-4">
            {auditLoading ? (
              <Skeleton lines={3} />
            ) : audit ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <PlatformIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                  <span className="font-bold text-slate-700 dark:text-slate-200 capitalize text-sm">{platform} Score</span>
                </div>
                <ScoreRing score={audit.score ?? 0} size={120} />
                <div className="text-center mt-2">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Last audited</p>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                    {audit.created_at ? new Date(audit.created_at).toLocaleString() : "—"}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center mx-auto">
                  <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No audit yet</p>
                <button onClick={handleRunAudit} className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mx-auto hover:underline">
                  Run first audit <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Findings card */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full bg-blue-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Audit Findings
              </h3>
            </div>
            {auditLoading ? (
              <Skeleton lines={5} />
            ) : audit?.findings && audit.findings.length > 0 ? (
              <div className="space-y-3">
                {audit.findings.map((f: AccountAuditFinding, i: number) => {
                  const severity = f.score >= 70 ? "low" : f.score >= 40 ? "medium" : "high";
                  return (
                    <div key={i} className={clsx(
                      "flex items-start gap-3 rounded-xl p-4",
                      severity === "high"
                        ? "flex gap-3 p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 border border-red-200 dark:border-red-500/30 rounded-xl"
                        : severity === "medium"
                        ? "flex gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 border border-amber-200 dark:border-amber-500/30 rounded-xl"
                        : "flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 border-l-4 border-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl"
                    )}>
                      <AlertCircle className={clsx("w-4 h-4 mt-0.5 flex-shrink-0",
                        severity === "high" ? "text-red-500" : severity === "medium" ? "text-amber-500" : "text-slate-400"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">{f.field.replace(/_/g, " ")}</span>
                          <span className={clsx(
                            "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-black uppercase tracking-wider border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]",
                            severity === "high"
                              ? "bg-red-500 text-white border-red-900"
                              : severity === "medium"
                              ? "bg-amber-500 text-white border-amber-900"
                              : "bg-emerald-500 text-white border-emerald-900"
                          )}>score {f.score}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{f.issue}</p>
                        {f.suggestion && (
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" /> {f.suggestion}
                          </p>
                        )}
                        {f.rewrite && (
                          <p className="text-xs bg-white dark:bg-slate-800 rounded-xl p-2 mt-2 text-slate-700 dark:text-slate-200 italic border border-slate-200 dark:border-slate-700">
                            Suggested: &ldquo;{f.rewrite}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Run an audit to see findings</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab: Best Times ──────────────────────────────────────────────────── */}
      {tab === "times" && (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-blue-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Best Posting Times — {activePlatform.label}
            </h3>
          </div>
          {timesLoading ? (
            <Skeleton lines={4} />
          ) : bestTimes ? (
            <div className="space-y-6">
              {/* Recommended Hours */}
              {bestTimes.recommended_hours_utc && bestTimes.recommended_hours_utc.length > 0 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Best Hours to Post (UTC)</p>
                  <div className="flex flex-wrap gap-3">
                    {bestTimes.recommended_hours_utc.map((hour, i) => {
                      const label = hour === 0 ? "12:00 AM" : hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`;
                      return (
                        <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl px-4 py-2.5 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.6)]">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500 border-2 border-emerald-700 text-white text-xs flex items-center justify-center font-black">#{i+1}</div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              {bestTimes.reasoning && (
                <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-1.5">AI Reasoning</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">{bestTimes.reasoning}</p>
                  </div>
                </div>
              )}

              {/* Hour visualization */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">24-Hour Activity Map</p>
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 24 }, (_, h) => {
                    const isRecommended = bestTimes.recommended_hours_utc?.includes(h);
                    const label = h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h-12}p`;
                    return (
                      <div key={h} className="text-center">
                        <div className={clsx(
                          "h-10 rounded-lg mb-1 transition-all border-2",
                          isRecommended
                            ? "bg-emerald-500 border-emerald-700 shadow-[2px_2px_0px_0px_rgba(4,120,87,0.6)]"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        )} />
                        <span className="text-xs font-medium text-slate-400">{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-700" />
                    <span className="text-xs font-medium text-slate-400">Recommended</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
                    <span className="text-xs font-medium text-slate-400">Not recommended</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Run an audit to unlock best-time insights</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Strategy Memo ───────────────────────────────────────────────── */}
      {tab === "strategy" && (
        <div className="space-y-5">
          {memoLoading ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-6">
              <Skeleton lines={8} />
            </div>
          ) : memo ? (
            <>
              {/* Week Header — Hero Accent */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,27,75,0.9)] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 opacity-80" />
                  <span className="font-black uppercase tracking-widest text-sm">Weekly Strategy Memo</span>
                </div>
                <p className="text-sm opacity-70 font-medium">Week of {memo.week}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* What Worked */}
                {memo.what_worked?.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-1 h-6 rounded-full bg-emerald-500" />
                      <h3 className="text-base font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> What Worked
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {memo.what_worked.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                          <span className="text-emerald-500 mt-0.5 font-bold">✓</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What Flopped */}
                {memo.what_flopped?.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-1 h-6 rounded-full bg-red-500" />
                      <h3 className="text-base font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> What Flopped
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {memo.what_flopped.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                          <span className="text-red-500 mt-0.5 font-bold">✗</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Content Mix */}
              {memo.content_mix && (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 rounded-full bg-blue-500" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Recommended Content Mix</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(memo.content_mix).map(([key, pct]) => {
                      const colors: Record<string, string> = {
                        educational: "bg-blue-500",
                        story: "bg-violet-500",
                        trend_jacking: "bg-pink-500",
                        promotional: "bg-amber-500",
                      };
                      return (
                        <div key={key} className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                              <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                                stroke="currentColor"
                                className={colors[key] ?? "bg-slate-400"}
                                strokeDasharray={`${(pct / 100) * 94} 94`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-800 dark:text-slate-100">{pct}%</span>
                          </div>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 capitalize">{key.replace("_", " ")}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next Week Ideas */}
              {memo.next_week_ideas?.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 rounded-full bg-blue-500" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-500" /> Next Week Content Ideas
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {memo.next_week_ideas.map((idea, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <div className="w-6 h-6 rounded-lg bg-violet-500 border-2 border-violet-900 text-white text-xs flex items-center justify-center font-black flex-shrink-0 mt-0.5">{i+1}</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{idea.topic}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-violet-500 text-white border-2 border-violet-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">{idea.format}</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">{idea.platform}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{idea.angle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 text-center py-16">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-slate-500 dark:text-slate-400 text-sm">No strategy memo yet</p>
              <p className="text-xs font-medium text-slate-400 mt-1">The AI generates this weekly based on your post metrics</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Daily Tasks ─────────────────────────────────────────────────── */}
      {tab === "tasks" && (
        <div className="space-y-4">
          {tasksLoading ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-6">
              <Skeleton lines={5} />
            </div>
          ) : tasksData?.tasks && tasksData.tasks.length > 0 ? (
            <div className="space-y-3">
              {tasksData.tasks.map((task, i) => {
                const p = PLATFORMS.find(pl => pl.id === task.platform);
                const TaskIcon = p?.icon ?? Users;
                return (
                  <div key={i} className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-black/20", p?.bg ?? "bg-slate-500")}>
                        <TaskIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">{task.platform}</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{task.task}</span>
                        </div>
                        {task.draft && (
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mt-2 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Draft:</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">{task.draft}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 text-center py-16">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-slate-500 dark:text-slate-400 text-sm">No engagement tasks yet</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Run an audit to generate your daily action list</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
