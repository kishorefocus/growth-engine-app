"use client";

import React, { useState } from "react";
import {
  TrendingUp, Sparkles, Bookmark, X, RefreshCw, Clock,
  AlertTriangle, Globe, Settings2, Plus,
  Rss, Youtube, FlameKindling, Zap, Target, Lightbulb,
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useNicheProfile,
  useUpsertNicheProfile,
  useTrendFeed,
  useTriggerIngest,
  useUpdateCardStatus,
} from "@/lib/hooks";
import type { IdeaCard } from "@/lib/api-client";

const PLATFORM_ICONS: Record<string, { icon: string; color: string }> = {
  linkedin: { icon: "in", color: "bg-blue-600 text-white" },
  instagram: { icon: "ig", color: "bg-pink-600 text-white" },
  facebook: { icon: "fb", color: "bg-indigo-600 text-white" },
  x: { icon: "𝕏", color: "bg-black text-white" },
  youtube: { icon: "▶", color: "bg-red-600 text-white" },
};

const FORMAT_BADGE: Record<string, { label: string; color: string }> = {
  carousel: { label: "Carousel", color: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
  reel: { label: "Reel", color: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300" },
  text: { label: "Text Post", color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  image: { label: "Image", color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" },
};

function RelevanceBadge({ score }: { score: number | null | undefined }) {
  const s = score ?? 0;
  const color =
    s >= 8
      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 ring-emerald-300/30"
      : s >= 5
      ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 ring-amber-300/30"
      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-slate-200/30";
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ring-1", color)}>
      <span className="text-[10px]">▲</span> {s}/10
    </span>
  );
}

function FreshnessTimer({ expires }: { expires: string | null | undefined }) {
  if (!expires) return null;
  const expiry = new Date(expires);
  const now = new Date();
  const diffH = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 3600000));
  const urgent = diffH < 24;
  return (
    <span className={clsx("inline-flex items-center gap-1 text-xs", urgent ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-500")}>
      {urgent && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
        </span>
      )}
      <Clock className="w-3 h-3" /> {diffH}h left
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/40 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm p-5 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded mb-1" />
      <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded mb-5" />
      <div className="flex gap-2 mt-4">
        <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-8 flex-1 bg-indigo-200 dark:bg-indigo-900/40 rounded-lg" />
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  );
}

function IdeaCardUI({ card, onDismiss }: { card: IdeaCard; onDismiss: (id: string) => void }) {
  const router = useRouter();
  const updateStatus = useUpdateCardStatus();
  const [saved, setSaved] = useState(card.status === "saved");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const angleColor: Record<string, string> = {
    educational: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
    contrarian: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    "how-to": "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
  };
  const rawAngle = (card.angle_type ?? "").toLowerCase().replace(/[^a-z-]/g, "");
  const normalizedAngle = rawAngle === "howto" ? "how-to" : rawAngle;
  const angleClass = angleColor[normalizedAngle] ?? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";

  const platform = card.best_platform?.toLowerCase() ?? "";
  const platInfo = PLATFORM_ICONS[platform];
  const formatInfo = FORMAT_BADGE[card.suggested_format ?? ""] ?? null;

  const handleSave = async () => {
    try {
      await updateStatus.mutateAsync({ id: card.id, status: saved ? "new" : "saved" });
      setSaved(!saved);
      toast.success(saved ? "Removed from saved" : "Saved to your feed");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDismiss = async () => {
    try {
      await updateStatus.mutateAsync({ id: card.id, status: "dismissed" });
      setDismissed(true);
      onDismiss(card.id);
    } catch {
      toast.error("Failed to dismiss");
    }
  };

  return (
    <div
      className={clsx(
        "group relative rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200",
        "border-slate-200/60 dark:border-slate-700/40",
        "bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm",
        "hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5",
        "hover:border-indigo-300/40 dark:hover:border-indigo-700/40"
      )}
    >
      {/* Top badges */}
      <div className="flex flex-wrap items-center gap-2">
        <RelevanceBadge score={card.relevance_score} />
        <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium", angleClass)}>
          {card.angle_type ?? "General"}
        </span>
        {platInfo && (
          <span className={clsx("inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black", platInfo.color)}>
            {platInfo.icon}
          </span>
        )}
        {formatInfo && (
          <span className={clsx("px-2 py-0.5 rounded-full text-xs", formatInfo.color)}>
            {formatInfo.label}
          </span>
        )}
      </div>

      {/* Headline */}
      <h3 className="font-semibold text-sm leading-snug text-slate-800 dark:text-slate-100 line-clamp-2">
        {card.headline ?? "Untitled idea"}
      </h3>

      {/* Core insight */}
      {card.core_insight && (
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {card.core_insight}
        </p>
      )}

      {/* Pain point */}
      {card.audience_pain_point && (
        <p className="text-xs italic text-slate-400 dark:text-slate-500 line-clamp-2">
          💡 {card.audience_pain_point}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <FreshnessTimer expires={card.freshness_expires} />
        {card.risk_flags && card.risk_flags.length > 0 && (
          <span
            className="flex items-center gap-1 text-xs text-amber-500"
            title={card.risk_flags.join(", ")}
          >
            <AlertTriangle className="w-3 h-3" /> Risk
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className={clsx(
            "flex items-center justify-center gap-1 flex-1 py-2 rounded-xl text-xs font-medium transition-all",
            saved
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <Bookmark className="w-3.5 h-3.5" fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save"}
        </button>
        <button
          onClick={() => router.push(`/admin/content-studio?idea_card_id=${card.id}`)}
          className="flex items-center justify-center gap-1 flex-[2] py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" /> Generate
        </button>
        <button
          onClick={handleDismiss}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function NicheSetup({ onSaved }: { onSaved: () => void }) {
  const { data: niche } = useNicheProfile();
  const upsert = useUpsertNicheProfile();
  const [editing, setEditing] = useState(!niche);
  const [form, setForm] = useState({
    industry: niche?.industry ?? "",
    sub_niche: niche?.sub_niche ?? "",
    audience_description: niche?.audience_description ?? "",
    pillars: (niche?.pillars ?? []) as string[],
    competitors: (niche?.competitors ?? []) as string[],
    tone_notes: niche?.tone_notes ?? "",
  });
  const [pillarInput, setPillarInput] = useState("");
  const [compInput, setCompInput] = useState("");

  React.useEffect(() => {
    if (niche) {
      setForm({
        industry: niche.industry ?? "",
        sub_niche: niche.sub_niche ?? "",
        audience_description: niche.audience_description ?? "",
        pillars: niche.pillars ?? [],
        competitors: niche.competitors ?? [],
        tone_notes: niche.tone_notes ?? "",
      });
      setEditing(false);
    }
  }, [niche]);

  const handleSave = async () => {
    if (!form.industry.trim()) {
      toast.error("Industry is required");
      return;
    }
    try {
      await upsert.mutateAsync(form);
      toast.success("Niche profile saved!");
      setEditing(false);
      onSaved();
    } catch {
      toast.error("Failed to save niche profile");
    }
  };

  const addTag = (
    arr: string[],
    val: string,
    setter: (v: string[]) => void,
    inputSetter: (v: string) => void
  ) => {
    const trimmed = val.trim();
    if (trimmed && !arr.includes(trimmed)) {
      setter([...arr, trimmed]);
      inputSetter("");
    }
  };

  if (!editing && niche) {
    return (
      <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{niche.industry}</span>
              {niche.sub_niche && (
                <span className="text-xs text-slate-500 dark:text-slate-400">→ {niche.sub_niche}</span>
              )}
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs rounded-full font-medium">
                Niche configured ✓
              </span>
            </div>
            {niche.pillars && niche.pillars.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {niche.pillars.slice(0, 4).map((p) => (
                  <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 transition-all"
        >
          <Settings2 className="w-3 h-3" /> Edit Niche
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-300/50 dark:border-indigo-700/40 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Configure Your Niche</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The engine matches live trends to your specific niche and audience
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Industry <span className="text-red-400">*</span>
          </label>
          <input
            value={form.industry}
            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
            placeholder="e.g. Real Estate, SaaS, Healthcare"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Sub-niche</label>
          <input
            value={form.sub_niche}
            onChange={(e) => setForm((f) => ({ ...f, sub_niche: e.target.value }))}
            placeholder="e.g. Luxury condos in Dubai"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Target Audience</label>
          <textarea
            value={form.audience_description}
            onChange={(e) => setForm((f) => ({ ...f, audience_description: e.target.value }))}
            placeholder="Describe your ideal audience (e.g. B2B SaaS founders raising their Series A)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Content Pillars</label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {form.pillars.map((p) => (
              <span key={p} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                {p}
                <button
                  onClick={() => setForm((f) => ({ ...f, pillars: f.pillars.filter((x) => x !== p) }))}
                  className="hover:text-red-500"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
          <input
            value={pillarInput}
            onChange={(e) => setPillarInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(form.pillars, pillarInput, (pillars) => setForm((f) => ({ ...f, pillars })), setPillarInput);
              }
            }}
            placeholder="Type a pillar, press Enter"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Competitors to track</label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {form.competitors.map((c) => (
              <span key={c} className="flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs rounded-full">
                {c}
                <button
                  onClick={() => setForm((f) => ({ ...f, competitors: f.competitors.filter((x) => x !== c) }))}
                  className="hover:text-red-500"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
          <input
            value={compInput}
            onChange={(e) => setCompInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(form.competitors, compInput, (competitors) => setForm((f) => ({ ...f, competitors })), setCompInput);
              }
            }}
            placeholder="Competitor name or URL, press Enter"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <button
          onClick={handleSave}
          disabled={upsert.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-500/20 disabled:opacity-50"
        >
          {upsert.isPending ? (
            <>
              <span className="animate-spin">⟳</span> Saving...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Save Niche Profile
            </>
          )}
        </button>
        {niche && (
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default function TrendRadarPage() {
  const { data: niche } = useNicheProfile();
  const { data: cards, isLoading, refetch } = useTrendFeed(12);
  const ingest = useTriggerIngest();
  const [sourceFilter, setSourceFilter] = useState("all");

  const handleIngest = async () => {
    try {
      const r = await ingest.mutateAsync();
      toast.success(`Ingested ${r.signals_ingested} signals, created ${r.clusters_created} clusters`);
      refetch();
    } catch {
      toast.error("Ingest failed");
    }
  };

  const filteredCards = (cards ?? []).filter(() => {
    if (sourceFilter === "all") return true;
    return true; // source filtering requires backend support
  });

  const SOURCE_TABS = [
    { id: "all", label: "All Sources", icon: Globe },
    { id: "rss", label: "RSS / News", icon: Rss },
    { id: "hackernews", label: "Hacker News", icon: FlameKindling },
    { id: "youtube", label: "YouTube", icon: Youtube },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trend Radar</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live signals matched to your niche — updated hourly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleIngest}
            disabled={ingest.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" /> {ingest.isPending ? "Ingesting..." : "Trigger Ingest"}
          </button>
        </div>
      </div>

      {/* Niche Setup */}
      <NicheSetup onSaved={() => refetch()} />

      {/* Source filter tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSourceFilter(tab.id)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              sourceFilter === tab.id
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <tab.icon className="w-3 h-3" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Idea Cards */}
      {!niche ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-slate-600 dark:text-slate-400 mb-2">Configure your niche first</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Set your industry and audience above to see trend-matched ideas
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-slate-600 dark:text-slate-400 mb-2">No trend ideas yet</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            Click &ldquo;Trigger Ingest&rdquo; to fetch the latest signals and generate your idea feed
          </p>
          <button
            onClick={handleIngest}
            disabled={ingest.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-sm"
          >
            <Zap className="w-4 h-4" /> {ingest.isPending ? "Ingesting..." : "Trigger Ingest Now"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => (
            <IdeaCardUI key={card.id} card={card} onDismiss={() => refetch()} />
          ))}
        </div>
      )}
    </div>
  );
}
