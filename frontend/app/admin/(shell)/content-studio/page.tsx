"use client";

import React, { useState, Suspense } from "react";
import {
  Sparkles, Copy, Check, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle2, XCircle, Hash, Zap, ThumbsUp, ThumbsDown,
  FileText, Instagram, Linkedin, Youtube, Facebook, ArrowRight,
  Layers, BarChart2, Star, BookOpen, RefreshCw, PlusCircle, X,
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useGenerateContentPack,
  useContentPacks,
  useUpdatePackStatus,
  useOptimizeHashtags,
  useNicheProfile,
} from "@/lib/hooks";
import type { ContentPack, HashtagSet, HookItem, LintItem, HashtagItem } from "@/lib/api-client";

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "linkedin",  label: "LinkedIn",  icon: Linkedin,  activeBg: "bg-blue-600",   activeBorder: "border-blue-900",   activeShadow: "shadow-[3px_3px_0px_0px_rgba(30,58,138,0.9)]" },
  { id: "instagram", label: "Instagram", icon: Instagram, activeBg: "bg-pink-600",   activeBorder: "border-pink-900",   activeShadow: "shadow-[3px_3px_0px_0px_rgba(131,24,67,0.9)]" },
  { id: "reel",      label: "Reel",      icon: Youtube,   activeBg: "bg-red-600",    activeBorder: "border-red-900",    activeShadow: "shadow-[3px_3px_0px_0px_rgba(127,29,29,0.9)]" },
  { id: "facebook",  label: "Facebook",  icon: Facebook,  activeBg: "bg-indigo-600", activeBorder: "border-indigo-900", activeShadow: "shadow-[3px_3px_0px_0px_rgba(49,46,129,0.9)]" },
];

const STATUS_COLORS: Record<string, string> = {
  draft:     "bg-amber-500 border-amber-900",
  approved:  "bg-emerald-500 border-emerald-900",
  rejected:  "bg-rose-500 border-rose-900",
  scheduled: "bg-blue-500 border-blue-900",
  published: "bg-violet-500 border-violet-900",
};

const TIER_COLORS: Record<string, string> = {
  broad:   "bg-blue-500 border-blue-900",
  mid:     "bg-violet-500 border-violet-900",
  niche:   "bg-emerald-500 border-emerald-900",
  branded: "bg-amber-500 border-amber-900",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copied!");
      }}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 font-semibold transition-colors flex-shrink-0"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size / 2) * 0.8;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={4} className="text-slate-200 dark:text-slate-700" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
        strokeDasharray={`${filled} ${circ - filled}`} strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={size * 0.22} fontWeight="bold" fill={color}>
        {score}
      </text>
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-6 animate-pulse space-y-4">
      <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg" />
    </div>
  );
}

// ─── Pack Card (list) ─────────────────────────────────────────────────────────

function PackCard({ pack, onApprove, onReject }: {
  pack: ContentPack;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hooks = pack.hooks ?? [];
  const slides = pack.slides ?? [];
  const body = pack.body ?? pack.caption ?? "";
  const lintItems = pack.lint_report ?? [];

  const previewText = hooks[0]?.text ?? (typeof body === "string" ? body?.slice(0, 80) : "") ?? "Content Pack";

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx(
              "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]",
              STATUS_COLORS[pack.status] ?? STATUS_COLORS.draft
            )}>
              {pack.status}
            </span>
            <span className="text-xs font-medium text-slate-400 capitalize">{pack.platform}</span>
            {pack.quality_score != null && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Score: {pack.quality_score}</span>
            )}
          </div>
          <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2">{previewText}</p>
        </div>
        <button onClick={() => setOpen(o => !o)} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all mt-1">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div className="space-y-3 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
          {hooks.length > 0 && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Hooks</p>
              {hooks.map((h, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-lg bg-violet-500 border-2 border-violet-900 text-white text-xs flex items-center justify-center font-black">{i+1}</span>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">{h.text}</p>
                  <CopyButton text={h.text} />
                </div>
              ))}
            </div>
          )}
          {slides.length > 0 && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Slides ({slides.length})</p>
              {slides.map((s, i) => (
                <div key={i} className="text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 mb-1 border border-slate-200 dark:border-slate-700">
                  [{i+1}] {typeof s === "string" ? s : JSON.stringify(s)}
                </div>
              ))}
            </div>
          )}
          {body && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Post Body</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">{String(body).length} chars</span>
                  <CopyButton text={String(body)} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">{body}</p>
            </div>
          )}
          {lintItems.length > 0 && (
            <div className="space-y-1">
              {lintItems.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  {r.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />}
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{r.rule}{!r.pass && r.fix ? ` — ${r.fix}` : ""}</p>
                </div>
              ))}
            </div>
          )}
          {pack.status === "draft" && (
            <div className="flex gap-2 pt-1">
              <button onClick={onApprove} className="flex-1 py-2 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-bold text-sm border-2 border-emerald-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(6,78,59,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(6,78,59,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all duration-100">
                <ThumbsUp className="w-4 h-4" /> Approve
              </button>
              <button onClick={onReject} className="flex-1 py-2 inline-flex items-center justify-center gap-1.5 bg-red-600 text-white font-bold text-sm border-2 border-red-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(127,29,29,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(127,29,29,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all duration-100">
                <ThumbsDown className="w-4 h-4" /> Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ContentStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-4 md:p-8 space-y-8 animate-pulse">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        </div>
      }
    >
      <ContentStudioContent />
    </Suspense>
  );
}

function ContentStudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ideaCardId = searchParams.get("idea_card_id") ?? undefined;
  const ideaId = searchParams.get("idea_id") ?? undefined;

  const [platform, setPlatform] = useState("linkedin");
  const [verifiedFacts, setVerifiedFacts] = useState("");
  const [showFactsInput, setShowFactsInput] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<ContentPack | null>(null);
  const [hashtagSet, setHashtagSet] = useState<HashtagSet | null>(null);
  const [packFilter, setPackFilter] = useState<"all" | "draft" | "approved" | "rejected">("all");

  const { data: niche } = useNicheProfile();
  const generate = useGenerateContentPack();
  const updateStatus = useUpdatePackStatus();
  const optimizeHashtags = useOptimizeHashtags();
  const { data: packs, refetch: refetchPacks } = useContentPacks({ limit: 20 });

  const filteredPacks = (packs ?? []).filter(p => packFilter === "all" || p.status === packFilter);

  const handleGenerate = () => {
    generate.mutate(
      { idea_card_id: ideaCardId, idea_id: ideaId, platform, verified_facts: verifiedFacts || undefined },
      {
        onSuccess: (pack) => { setGeneratedPack(pack); refetchPacks(); toast.success("Content pack generated!"); },
        onError: () => toast.error("Generation failed — check API keys or try again."),
      }
    );
  };

  const handleGetHashtags = () => {
    if (!generatedPack) return;
    const bodyText = generatedPack.hooks?.[0]?.text ?? generatedPack.body ?? generatedPack.caption ?? "";
    optimizeHashtags.mutate(
      { post_text: String(bodyText), platform, niche_summary: niche?.audience_description ?? undefined, content_pack_id: generatedPack.id },
      {
        onSuccess: (set) => { setHashtagSet(set); toast.success("Hashtags optimized!"); },
        onError: () => toast.error("Hashtag optimization failed"),
      }
    );
  };

  const handlePackStatus = (id: string, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => {
        toast.success(status === "approved" ? "Pack approved ✅" : "Pack rejected");
        if (generatedPack?.id === id) setGeneratedPack(p => p ? { ...p, status: status as ContentPack["status"] } : p);
        refetchPacks();
      },
    });
  };

  // Derived from generatedPack
  const hooks: HookItem[] = generatedPack?.hooks ?? [];
  const body: string = String(generatedPack?.body ?? generatedPack?.caption ?? "");
  const slides = generatedPack?.slides ?? [];
  const lintResults: LintItem[] = generatedPack?.lint_report ?? [];
  const claims: string[] = generatedPack?.claims_to_verify ?? [];

  // Group hashtags by tier
  const hashtagsByTier: Record<string, HashtagItem[]> = { broad: [], mid: [], niche: [], branded: [] };
  if (hashtagSet?.hashtags) {
    for (const h of hashtagSet.hashtags) {
      (hashtagsByTier[h.tier] ?? (hashtagsByTier[h.tier] = [])).push(h);
    }
  }

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
            <Sparkles className="w-3.5 h-3.5" />
            AI Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Content Studio
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            AI-powered multi-format content generation with quality scoring
          </p>
        </div>
        {(ideaCardId || ideaId) && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Idea pre-loaded from Trend Radar
          </div>
        )}
      </div>

      {/* Generator Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 space-y-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
        {/* Section divider */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-blue-500" />
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" /> Generate Content Pack
          </h2>
        </div>

        {/* Platform Selector */}
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 block">Target Platform</label>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              const active = platform === p.id;
              return (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-2 rounded-xl transition-all duration-100",
                    active
                      ? clsx(
                          p.activeBg, p.activeBorder, p.activeShadow,
                          "text-white hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none"
                        )
                      : "bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px]"
                  )}>
                  <Icon className="w-4 h-4" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Verified Facts */}
        <div>
          <button onClick={() => setShowFactsInput(v => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
            {showFactsInput ? "Hide" : "Add"} verified facts / stats (optional)
          </button>
          {showFactsInput && (
            <textarea rows={3}
              placeholder="e.g. '73% of B2B buyers use LinkedIn, Source: Demand Gen Report 2024'"
              value={verifiedFacts} onChange={e => setVerifiedFacts(e.target.value)}
              className="mt-2 w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none"
            />
          )}
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerate} disabled={generate.isPending}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0">
          {generate.isPending
            ? <><RefreshCw className="w-4 h-4 animate-spin" />Generating with AI… (~15–20s)</>
            : <><Sparkles className="w-4 h-4" />Generate Content Pack</>}
        </button>

        {/* Progress shimmer */}
        {generate.isPending && (
          <div className="space-y-2">
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600">
              <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full w-2/3 origin-left animate-pulse" />
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Analyzing topic relevance…</span>
              <span>AI is writing your content</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Generated Pack Result ─────────────────────────────────────────── */}
      {generatedPack && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Generated Pack — <span className="capitalize">{generatedPack.platform}</span>
              <span className={clsx(
                "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)] ml-1",
                STATUS_COLORS[generatedPack.status] ?? STATUS_COLORS.draft
              )}>
                {generatedPack.status}
              </span>
            </h2>
            <button onClick={() => setGeneratedPack(null)} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Left col: hooks + content + claims + hashtags */}
            <div className="xl:col-span-2 space-y-5">
              {/* Hook Variants */}
              {hooks.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
                  {/* Section divider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 rounded-full bg-blue-500" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" /> Hook Variants (A/B Test)
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {hooks.map((hook, i) => (
                      <div key={i} className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 w-6 h-6 flex-shrink-0 rounded-lg bg-violet-500 border-2 border-violet-900 text-white text-xs flex items-center justify-center font-black">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug flex-1">{hook.text}</p>
                          <CopyButton text={hook.text} />
                        </div>
                        {hook.rationale && (
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 ml-8 italic">{hook.rationale}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Content */}
              {(body || slides.length > 0) && (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      {platform === "instagram" ? "Carousel Slides" : platform === "reel" ? "Script Beats" : "Post Body"}
                    </h3>
                    {body && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">{body.length} chars</span>
                        <CopyButton text={body} />
                      </div>
                    )}
                  </div>
                  {slides.length > 0 ? (
                    <div className="space-y-2">
                      {slides.map((slide, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="w-6 h-6 flex-shrink-0 rounded-lg bg-pink-500 border-2 border-pink-900 text-white text-xs flex items-center justify-center font-black">{i+1}</span>
                          <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {typeof slide === "string" ? slide : JSON.stringify(slide)}
                          </div>
                          <CopyButton text={typeof slide === "string" ? slide : JSON.stringify(slide)} />
                        </div>
                      ))}
                    </div>
                  ) : body ? (
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">{body}</p>
                  ) : null}
                </div>
              )}

              {/* Claims Warning */}
              {claims.length > 0 && (
                <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">Claims to Verify Before Publishing</h3>
                    <ul className="space-y-1">
                      {claims.map((claim, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium text-amber-700 dark:text-amber-200">
                          <span className="mt-0.5 text-amber-400">•</span> {claim}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Hashtag Optimizer */}
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-blue-500" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-500" /> Hashtag Optimizer
                    </h3>
                  </div>
                  <button onClick={handleGetHashtags} disabled={optimizeHashtags.isPending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 disabled:opacity-60 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]">
                    {optimizeHashtags.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Hash className="w-3 h-3" />}
                    {optimizeHashtags.isPending ? "Optimizing…" : "Get Hashtags"}
                  </button>
                </div>
                {hashtagSet ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{hashtagSet.reach_score?.toFixed(0) ?? "—"}</p>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Reach Score</p>
                        <p className="text-xs font-medium text-slate-400">{hashtagSet.hashtags?.length ?? 0} tags total</p>
                      </div>
                    </div>
                    {(["broad", "mid", "niche", "branded"] as const).map((tier) => {
                      const tags = hashtagsByTier[tier] ?? [];
                      if (!tags.length) return null;
                      return (
                        <div key={tier}>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 capitalize mb-1.5">{tier}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((h) => (
                              <span key={h.tag} className={clsx(
                                "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]",
                                TIER_COLORS[h.tier] ?? "bg-slate-500 border-slate-700"
                              )}>
                                {h.tag.startsWith("#") ? h.tag : `#${h.tag}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <CopyButton text={(hashtagSet.hashtags ?? []).map(h => h.tag.startsWith("#") ? h.tag : `#${h.tag}`).join(" ")} />
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400">Click &quot;Get Hashtags&quot; to generate platform-optimized tags for this content.</p>
                )}
              </div>
            </div>

            {/* Right col: Quality + Actions */}
            <div className="space-y-5">
              {/* Quality Score */}
              {generatedPack.quality_score != null && (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow text-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 rounded-full bg-blue-500" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-emerald-500" /> Quality Score
                    </h3>
                  </div>
                  <div className="flex justify-center mb-4">
                    <ScoreRing score={generatedPack.quality_score} size={88} />
                  </div>
                  {lintResults.length > 0 && (
                    <div className="space-y-1.5 text-left">
                      {lintResults.map((r, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {r.pass
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />}
                          <div>
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{r.rule}</p>
                            {!r.pass && r.fix && <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">↳ {r.fix}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {generatedPack.status === "draft" ? (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 space-y-3 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Actions</h3>
                  <button onClick={() => handlePackStatus(generatedPack.id, "approved")} disabled={updateStatus.isPending}
                    className="w-full py-3 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold text-sm border-2 border-emerald-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(6,78,59,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(6,78,59,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[3px_3px_0px_0px_rgba(6,78,59,0.8)]">
                    <ThumbsUp className="w-4 h-4" /> Approve &amp; Schedule
                  </button>
                  <button onClick={() => handlePackStatus(generatedPack.id, "rejected")} disabled={updateStatus.isPending}
                    className="w-full py-3 inline-flex items-center justify-center gap-2 bg-red-600 text-white font-bold text-sm border-2 border-red-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(127,29,29,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(127,29,29,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0">
                    <ThumbsDown className="w-4 h-4" /> Reject
                  </button>
                  <p className="text-xs font-medium text-slate-400 text-center">Human approval required before publishing</p>
                </div>
              ) : (
                <div className={clsx("rounded-2xl p-4 text-center border-2",
                  generatedPack.status === "approved"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500"
                    : "bg-red-50 dark:bg-red-500/10 border-red-500"
                )}>
                  <p className={clsx("text-sm font-bold", generatedPack.status === "approved" ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300")}>
                    {generatedPack.status === "approved" ? "✅ Approved for scheduling" : "❌ Rejected"}
                  </p>
                </div>
              )}

              <button onClick={() => router.push("/admin/trend-radar")}
                className="w-full py-2.5 inline-flex items-center justify-center gap-2 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100">
                <ArrowRight className="w-4 h-4" /> Browse Trend Ideas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Recent Packs List ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" /> Recent Content Packs
          </h2>
          {/* Filter tab strip */}
          <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
            {(["all", "draft", "approved", "rejected"] as const).map((f, i) => (
              <button key={f} onClick={() => setPackFilter(f)}
                className={clsx(
                  "font-bold text-sm px-4 py-2 capitalize transition-colors",
                  i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                  packFilter === f
                    ? "bg-slate-900 dark:bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {!packs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[0,1,2].map(i => <SkeletonCard key={i} />)}</div>
        ) : filteredPacks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 text-center py-16">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No {packFilter !== "all" ? packFilter : ""} packs yet.</p>
            <p className="text-xs font-medium text-slate-400 mt-1">Generate your first content pack above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPacks.map(pack => (
              <PackCard key={pack.id} pack={pack}
                onApprove={() => handlePackStatus(pack.id, "approved")}
                onReject={() => handlePackStatus(pack.id, "rejected")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
