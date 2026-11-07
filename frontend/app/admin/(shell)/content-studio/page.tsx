"use client";

import React, { useState } from "react";
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
  { id: "linkedin",  label: "LinkedIn",  icon: Linkedin,  color: "bg-blue-600",   ring: "ring-blue-400" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "bg-pink-600",   ring: "ring-pink-400" },
  { id: "reel",      label: "Reel",      icon: Youtube,   color: "bg-red-600",    ring: "ring-red-400" },
  { id: "facebook",  label: "Facebook",  icon: Facebook,  color: "bg-indigo-600", ring: "ring-indigo-400" },
];

const STATUS_COLORS: Record<string, string> = {
  draft:     "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  approved:  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  rejected:  "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  scheduled: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  published: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
};

const TIER_COLORS: Record<string, string> = {
  broad:   "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  mid:     "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  niche:   "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  branded: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
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
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0"
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
    <div className="rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-6 animate-pulse space-y-4">
      <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full" />
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
    <div className="rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_COLORS[pack.status] ?? STATUS_COLORS.draft)}>
              {pack.status}
            </span>
            <span className="text-xs text-slate-400 capitalize">{pack.platform}</span>
            {pack.quality_score != null && (
              <span className="text-xs text-slate-400">Score: {pack.quality_score}</span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2">{previewText}</p>
        </div>
        <button onClick={() => setOpen(o => !o)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-1">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          {hooks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Hooks</p>
              {hooks.map((h, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs flex items-center justify-center font-bold">{i+1}</span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 flex-1">{h.text}</p>
                  <CopyButton text={h.text} />
                </div>
              ))}
            </div>
          )}
          {slides.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Slides ({slides.length})</p>
              {slides.map((s, i) => (
                <div key={i} className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/40 rounded-lg p-2 mb-1">
                  [{i+1}] {typeof s === "string" ? s : JSON.stringify(s)}
                </div>
              ))}
            </div>
          )}
          {body && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Post Body</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{String(body).length} chars</span>
                  <CopyButton text={String(body)} />
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-700/40 rounded-lg p-3">{body}</p>
            </div>
          )}
          {lintItems.length > 0 && (
            <div className="space-y-1">
              {lintItems.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  {r.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />}
                  <p className="text-xs text-slate-700 dark:text-slate-200">{r.rule}{!r.pass && r.fix ? ` — ${r.fix}` : ""}</p>
                </div>
              ))}
            </div>
          )}
          {pack.status === "draft" && (
            <div className="flex gap-2 pt-1">
              <button onClick={onApprove} className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
                <ThumbsUp className="w-4 h-4" /> Approve
              </button>
              <button onClick={onReject} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
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
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Content Studio
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            AI-powered multi-format content generation with quality scoring
          </p>
        </div>
        {(ideaCardId || ideaId) && (
          <div className="flex items-center gap-2 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-700/40">
            <Zap className="w-3 h-3" />
            Idea pre-loaded from Trend Radar
          </div>
        )}
      </div>

      {/* Generator Card */}
      <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Generate Content Pack</h2>
        </div>

        {/* Platform Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">Target Platform</label>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              const active = platform === p.id;
              return (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all duration-150",
                    active
                      ? `${p.color} text-white border-transparent shadow-md ring-2 ${p.ring} ring-offset-1 dark:ring-offset-slate-900`
                      : "bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300"
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
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
            {showFactsInput ? "Hide" : "Add"} verified facts / stats (optional)
          </button>
          {showFactsInput && (
            <textarea rows={3}
              placeholder="e.g. '73% of B2B buyers use LinkedIn, Source: Demand Gen Report 2024'"
              value={verifiedFacts} onChange={e => setVerifiedFacts(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-100 p-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          )}
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerate} disabled={generate.isPending}
          className={clsx(
            "w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150",
            generate.isPending
              ? "bg-purple-400 cursor-not-allowed text-white"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg active:scale-[0.99]"
          )}>
          {generate.isPending
            ? <><RefreshCw className="w-4 h-4 animate-spin" />Generating with AI… (~15–20s)</>
            : <><Sparkles className="w-4 h-4" />Generate Content Pack</>}
        </button>

        {/* Progress shimmer */}
        {generate.isPending && (
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-2/3 origin-left animate-pulse" />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
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
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Generated Pack — <span className="capitalize">{generatedPack.platform}</span>
              <span className={clsx("text-xs px-2 py-0.5 rounded-full ml-1", STATUS_COLORS[generatedPack.status] ?? STATUS_COLORS.draft)}>
                {generatedPack.status}
              </span>
            </h2>
            <button onClick={() => setGeneratedPack(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Left col: hooks + content + claims + hashtags */}
            <div className="xl:col-span-2 space-y-5">
              {/* Hook Variants */}
              {hooks.length > 0 && (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Hook Variants (A/B Test)
                  </h3>
                  <div className="space-y-3">
                    {hooks.map((hook, i) => (
                      <div key={i} className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 w-6 h-6 flex-shrink-0 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug flex-1">{hook.text}</p>
                          <CopyButton text={hook.text} />
                        </div>
                        {hook.rationale && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 ml-8 italic">{hook.rationale}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Content */}
              {(body || slides.length > 0) && (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      {platform === "instagram" ? "Carousel Slides" : platform === "reel" ? "Script Beats" : "Post Body"}
                    </h3>
                    {body && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{body.length} chars</span>
                        <CopyButton text={body} />
                      </div>
                    )}
                  </div>
                  {slides.length > 0 ? (
                    <div className="space-y-2">
                      {slides.map((slide, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="w-6 h-6 flex-shrink-0 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 text-xs flex items-center justify-center font-semibold">{i+1}</span>
                          <div className="flex-1 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-200">
                            {typeof slide === "string" ? slide : JSON.stringify(slide)}
                          </div>
                          <CopyButton text={typeof slide === "string" ? slide : JSON.stringify(slide)} />
                        </div>
                      ))}
                    </div>
                  ) : body ? (
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4">{body}</p>
                  ) : null}
                </div>
              )}

              {/* Claims Warning */}
              {claims.length > 0 && (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Claims to Verify Before Publishing</h3>
                  </div>
                  <ul className="space-y-1">
                    {claims.map((claim, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-200">
                        <span className="mt-0.5 text-amber-400">•</span> {claim}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hashtag Optimizer */}
              <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-cyan-400" /> Hashtag Optimizer
                  </h3>
                  <button onClick={handleGetHashtags} disabled={optimizeHashtags.isPending}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors flex items-center gap-1 disabled:opacity-60">
                    {optimizeHashtags.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Hash className="w-3 h-3" />}
                    {optimizeHashtags.isPending ? "Optimizing…" : "Get Hashtags"}
                  </button>
                </div>
                {hashtagSet ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{hashtagSet.reach_score?.toFixed(0) ?? "—"}</p>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reach Score</p>
                        <p className="text-xs text-slate-400">{hashtagSet.hashtags?.length ?? 0} tags total</p>
                      </div>
                    </div>
                    {(["broad", "mid", "niche", "branded"] as const).map((tier) => {
                      const tags = hashtagsByTier[tier] ?? [];
                      if (!tags.length) return null;
                      return (
                        <div key={tier}>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize mb-1.5">{tier}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((h) => (
                              <span key={h.tag} className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", TIER_COLORS[h.tier])}>
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
                  <p className="text-sm text-slate-400">Click "Get Hashtags" to generate platform-optimized tags for this content.</p>
                )}
              </div>
            </div>

            {/* Right col: Quality + Actions */}
            <div className="space-y-5">
              {/* Quality Score */}
              {generatedPack.quality_score != null && (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5 text-center">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center justify-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" /> Quality Score
                  </h3>
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
                            <p className="text-xs text-slate-700 dark:text-slate-200">{r.rule}</p>
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
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Actions</h3>
                  <button onClick={() => handlePackStatus(generatedPack.id, "approved")} disabled={updateStatus.isPending}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md">
                    <ThumbsUp className="w-4 h-4" /> Approve & Schedule
                  </button>
                  <button onClick={() => handlePackStatus(generatedPack.id, "rejected")} disabled={updateStatus.isPending}
                    className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all">
                    <ThumbsDown className="w-4 h-4" /> Reject
                  </button>
                  <p className="text-xs text-slate-400 text-center">Human approval required before publishing</p>
                </div>
              ) : (
                <div className={clsx("rounded-2xl p-4 text-center border",
                  generatedPack.status === "approved"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/40"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/40"
                )}>
                  <p className={clsx("text-sm font-semibold", generatedPack.status === "approved" ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300")}>
                    {generatedPack.status === "approved" ? "✅ Approved for scheduling" : "❌ Rejected"}
                  </p>
                </div>
              )}

              <button onClick={() => router.push("/admin/trend-radar")}
                className="w-full py-2.5 rounded-xl border border-purple-200 dark:border-purple-700/40 text-purple-600 dark:text-purple-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                <ArrowRight className="w-4 h-4" /> Browse Trend Ideas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Recent Packs List ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" /> Recent Content Packs
          </h2>
          <div className="flex gap-2 flex-wrap">
            {(["all", "draft", "approved", "rejected"] as const).map(f => (
              <button key={f} onClick={() => setPackFilter(f)}
                className={clsx(
                  "text-xs px-3 py-1.5 rounded-full font-medium transition-colors capitalize",
                  packFilter === f ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                )}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {!packs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[0,1,2].map(i => <SkeletonCard key={i} />)}</div>
        ) : filteredPacks.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">No {packFilter !== "all" ? packFilter : ""} packs yet.</p>
            <p className="text-xs text-slate-400 mt-1">Generate your first content pack above.</p>
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
