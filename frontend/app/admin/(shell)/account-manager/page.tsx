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
  { id: "linkedin",  label: "LinkedIn",  icon: Linkedin,  gradient: "from-blue-500 to-blue-700",  ring: "ring-blue-400", bg: "bg-blue-600" },
  { id: "instagram", label: "Instagram", icon: Instagram, gradient: "from-pink-500 to-rose-600",  ring: "ring-pink-400", bg: "bg-pink-600" },
  { id: "facebook",  label: "Facebook",  icon: Facebook,  gradient: "from-indigo-500 to-blue-600",ring: "ring-indigo-400", bg: "bg-indigo-600" },
  { id: "youtube",   label: "YouTube",   icon: Youtube,   gradient: "from-red-500 to-red-700",    ring: "ring-red-400", bg: "bg-red-600" },
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
      {label && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>}
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
        <div key={i} className={clsx("h-4 bg-slate-200 dark:bg-slate-700 rounded-full", i % 2 === 0 ? "w-3/4" : "w-1/2")} />
      ))}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "audit",    label: "Profile Audit",    icon: BarChart3 },
  { id: "times",    label: "Best Times",       icon: Clock },
  { id: "strategy", label: "Strategy Memo",    icon: FileText },
  { id: "tasks",    label: "Daily Tasks",      icon: CheckSquare },
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
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Account Manager
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            AI-powered profile audits, optimal posting times &amp; weekly strategy
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={runAudit.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-60"
        >
          {runAudit.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {runAudit.isPending ? "Running Audit…" : "Run AI Audit"}
        </button>
      </div>

      {/* Platform Selector */}
      <div className="flex flex-wrap gap-3">
        {PLATFORMS.map(p => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all duration-150",
                platform === p.id
                  ? `bg-gradient-to-r ${p.gradient} text-white border-transparent shadow-md ring-2 ${p.ring} ring-offset-1 dark:ring-offset-slate-900`
                  : "bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300"
              )}
            >
              <Icon className="w-4 h-4" />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Metrics Overview Strip */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Avg Reach", value: insights.avg_reach?.toFixed(0) ?? "—", icon: Eye, color: "text-blue-500" },
            { label: "Posts Tracked", value: insights.total_posts_tracked ?? "—", icon: TrendingUp, color: "text-emerald-500" },
            { label: "Best Platform", value: insights.best_platform ?? "—", icon: Star, color: "text-amber-500" },
            { label: "Top Insight", value: insights.insights?.[0]?.slice(0, 20) ?? "—", icon: Target, color: "text-purple-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-4 flex items-center gap-3">
              <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-700", color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t.id
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
          {/* Score Ring */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-6 flex flex-col items-center justify-center gap-4">
            {auditLoading ? (
              <Skeleton lines={3} />
            ) : audit ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <PlatformIcon className="w-5 h-5" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{platform} Score</span>
                </div>
                <ScoreRing score={audit.score ?? 0} size={120} />
                <div className="text-center mt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Last audited</p>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                    {audit.created_at ? new Date(audit.created_at).toLocaleString() : "—"}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto">
                  <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No audit yet</p>
                <button onClick={handleRunAudit} className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mx-auto">
                  Run first audit <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Findings */}
          <div className="xl:col-span-2 rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Audit Findings
            </h3>
            {auditLoading ? (
              <Skeleton lines={5} />
            ) : audit?.findings && audit.findings.length > 0 ? (
              <div className="space-y-3">
                {audit.findings.map((f: AccountAuditFinding, i: number) => {
                  const severity = f.score >= 70 ? "low" : f.score >= 40 ? "medium" : "high";
                  return (
                    <div key={i} className={clsx(
                      "flex items-start gap-3 rounded-xl p-3 border",
                      severity === "high"
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/40"
                        : severity === "medium"
                        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40"
                        : "bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600/40"
                    )}>
                      <AlertCircle className={clsx("w-4 h-4 mt-0.5 flex-shrink-0",
                        severity === "high" ? "text-red-500" : severity === "medium" ? "text-amber-500" : "text-slate-400"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">{f.field.replace(/_/g, " ")}</span>
                          <span className={clsx("text-xs px-1.5 py-0.5 rounded-full font-semibold",
                            severity === "high" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" :
                            severity === "medium" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" :
                            "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                          )}>score {f.score}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{f.issue}</p>
                        {f.suggestion && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" /> {f.suggestion}
                          </p>
                        )}
                        {f.rewrite && (
                          <p className="text-xs bg-white dark:bg-slate-700 rounded-lg p-2 mt-2 text-slate-700 dark:text-slate-200 italic">
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
                <p className="text-sm">Run an audit to see findings</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab: Best Times ──────────────────────────────────────────────────── */}
      {tab === "times" && (
        <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-6 space-y-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" /> Best Posting Times — {activePlatform.label}
          </h3>
          {timesLoading ? (
            <Skeleton lines={4} />
          ) : bestTimes ? (
            <div className="space-y-6">
              {/* Recommended Hours */}
              {bestTimes.recommended_hours_utc && bestTimes.recommended_hours_utc.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Best Hours to Post (UTC)</p>
                  <div className="flex flex-wrap gap-3">
                    {bestTimes.recommended_hours_utc.map((hour, i) => {
                      const label = hour === 0 ? "12:00 AM" : hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`;
                      return (
                        <div key={i} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-xl px-4 py-2.5">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">#{i+1}</div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              {bestTimes.reasoning && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-700/40 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5">AI Reasoning</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{bestTimes.reasoning}</p>
                </div>
              )}

              {/* Hour Heatmap visualization */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">24-Hour Activity Map</p>
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 24 }, (_, h) => {
                    const isRecommended = bestTimes.recommended_hours_utc?.includes(h);
                    const label = h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h-12}p`;
                    return (
                      <div key={h} className="text-center">
                        <div className={clsx(
                          "h-10 rounded-lg mb-1 transition-all",
                          isRecommended ? "bg-emerald-500 shadow-md" : "bg-slate-100 dark:bg-slate-700"
                        )} />
                        <span className="text-xs text-slate-400">{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-xs text-slate-400">Recommended</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" /><span className="text-xs text-slate-400">Not recommended</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Run an audit to unlock best-time insights</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Strategy Memo ───────────────────────────────────────────────── */}
      {tab === "strategy" && (
        <div className="space-y-5">
          {memoLoading ? (
            <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-6">
              <Skeleton lines={8} />
            </div>
          ) : memo ? (
            <>
              {/* Week Header */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 opacity-80" />
                  <span className="font-semibold">Weekly Strategy Memo</span>
                </div>
                <p className="text-sm opacity-70">Week of {memo.week}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* What Worked */}
                {memo.what_worked?.length > 0 && (
                  <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5">
                    <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> What Worked
                    </h3>
                    <ul className="space-y-2">
                      {memo.what_worked.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                          <span className="text-emerald-400 mt-0.5">✓</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What Flopped */}
                {memo.what_flopped?.length > 0 && (
                  <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5">
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> What Flopped
                    </h3>
                    <ul className="space-y-2">
                      {memo.what_flopped.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                          <span className="text-red-400 mt-0.5">✗</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Content Mix */}
              {memo.content_mix && (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Recommended Content Mix</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(memo.content_mix).map(([key, pct]) => {
                      const colors: Record<string, string> = {
                        educational: "bg-blue-500",
                        story: "bg-purple-500",
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
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-slate-100">{pct}%</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{key.replace("_", " ")}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next Week Ideas */}
              {memo.next_week_ideas?.length > 0 && (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Next Week Content Ideas
                  </h3>
                  <div className="space-y-3">
                    {memo.next_week_ideas.map((idea, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                        <div className="w-6 h-6 rounded-lg bg-purple-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{idea.topic}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">{idea.format}</span>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">{idea.platform}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{idea.angle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No strategy memo yet</p>
              <p className="text-xs text-slate-400 mt-1">The AI generates this weekly based on your post metrics</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Daily Tasks ─────────────────────────────────────────────────── */}
      {tab === "tasks" && (
        <div className="space-y-4">
          {tasksLoading ? (
            <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-6">
              <Skeleton lines={5} />
            </div>
          ) : tasksData?.tasks && tasksData.tasks.length > 0 ? (
            <div className="space-y-3">
              {tasksData.tasks.map((task, i) => {
                const p = PLATFORMS.find(pl => pl.id === task.platform);
                const TaskIcon = p?.icon ?? Users;
                return (
                  <div key={i} className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5">
                    <div className="flex items-start gap-3">
                      <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", p?.bg ?? "bg-slate-500")}>
                        <TaskIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-semibold capitalize text-slate-500 dark:text-slate-400">{task.platform}</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{task.task}</span>
                        </div>
                        {task.draft && (
                          <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 mt-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Draft:</p>
                            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{task.draft}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No engagement tasks yet</p>
              <p className="text-xs text-slate-400 mt-1">Run an audit to generate your daily action list</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
