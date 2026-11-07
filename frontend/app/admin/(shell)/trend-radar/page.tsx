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

const FORMAT_BADGE: Record<string, { label: string; bg: string; border: string }> = {
  carousel: { label: "Carousel", bg: "bg-violet-500", border: "border-violet-900" },
  reel:     { label: "Reel",     bg: "bg-pink-500",   border: "border-pink-900" },
  text:     { label: "Text Post",bg: "bg-blue-500",   border: "border-blue-900" },
  image:    { label: "Image",    bg: "bg-emerald-500",border: "border-emerald-900" },
};

function RelevanceBadge({ score }: { score: number | null | undefined }) {
  const s = score ?? 0;
  const color =
    s >= 8
      ? "bg-emerald-500 border-emerald-900"
      : s >= 5
      ? "bg-amber-500 border-amber-900"
      : "bg-slate-400 border-slate-700";
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]",
      color
    )}>
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
    <span className={clsx("inline-flex items-center gap-1 text-xs font-medium", urgent ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-500")}>
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
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
      <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
      <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-lg mb-1" />
      <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-5" />
      <div className="flex gap-2 mt-4">
        <div className="h-9 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-9 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
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
    educational: "bg-sky-500 border-sky-900",
    contrarian:  "bg-rose-500 border-rose-900",
    "how-to":    "bg-violet-500 border-violet-900",
  };
  const rawAngle = (card.angle_type ?? "").toLowerCase().replace(/[^a-z-]/g, "");
  const normalizedAngle = rawAngle === "howto" ? "how-to" : rawAngle;
  const angleClass = angleColor[normalizedAngle] ?? "bg-slate-500 border-slate-700";

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
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow flex flex-col gap-3">
      {/* Top badges */}
      <div className="flex flex-wrap items-center gap-2">
        <RelevanceBadge score={card.relevance_score} />
        <span className={clsx(
          "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]",
          angleClass
        )}>
          {card.angle_type ?? "General"}
        </span>
        {platInfo && (
          <span className={clsx("inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black border-2 border-black/20", platInfo.color)}>
            {platInfo.icon}
          </span>
        )}
        {formatInfo && (
          <span className={clsx(
            "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]",
            formatInfo.bg, formatInfo.border
          )}>
            {formatInfo.label}
          </span>
        )}
      </div>

      {/* Status pill */}
      {card.status === "saved" && (
        <div className="w-fit">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Saved
          </span>
        </div>
      )}

      {/* Headline */}
      <h3 className="font-bold text-sm leading-snug text-slate-800 dark:text-slate-100 line-clamp-2">
        {card.headline ?? "Untitled idea"}
      </h3>

      {/* Core insight */}
      {card.core_insight && (
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {card.core_insight}
        </p>
      )}

      {/* Pain point */}
      {card.audience_pain_point && (
        <p className="text-xs font-medium italic text-slate-400 dark:text-slate-500 line-clamp-2">
          💡 {card.audience_pain_point}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <FreshnessTimer expires={card.freshness_expires} />
        {card.risk_flags && card.risk_flags.length > 0 && (
          <span
            className="flex items-center gap-1 text-xs font-semibold text-amber-500"
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
            "inline-flex items-center justify-center gap-1 flex-1 py-2 text-xs font-bold border-2 rounded-xl transition-all duration-100",
            saved
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[1px] hover:translate-y-[1px]"
              : "bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px]"
          )}
        >
          <Bookmark className="w-3.5 h-3.5" fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save"}
        </button>
        <button
          onClick={() => router.push(`/admin/content-studio?idea_card_id=${card.id}`)}
          className="inline-flex items-center justify-center gap-1 flex-[2] py-2 text-xs font-bold bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
        >
          <Sparkles className="w-3.5 h-3.5" /> Generate
        </button>
        <button
          onClick={handleDismiss}
          className="p-2 rounded-xl border-2 border-transparent hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all"
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
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-500 flex items-center justify-center border-2 border-slate-900 dark:border-blue-400">
            <Target className="w-5 h-5 text-white dark:text-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{niche.industry}</span>
              {niche.sub_niche && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">→ {niche.sub_niche}</span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Niche configured
              </span>
            </div>
            {niche.pillars && niche.pillars.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {niche.pillars.slice(0, 4).map((p) => (
                  <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md font-medium border border-slate-200 dark:border-slate-700">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-xs border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
        >
          <Settings2 className="w-3 h-3" /> Edit Niche
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-500 flex items-center justify-center border-2 border-slate-900 dark:border-blue-400">
          <Target className="w-5 h-5 text-white dark:text-slate-900" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Configure Your Niche</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            The engine matches live trends to your specific niche and audience
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
            Industry <span className="text-red-400">*</span>
          </label>
          <input
            value={form.industry}
            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
            placeholder="e.g. Real Estate, SaaS, Healthcare"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Sub-niche</label>
          <input
            value={form.sub_niche}
            onChange={(e) => setForm((f) => ({ ...f, sub_niche: e.target.value }))}
            placeholder="e.g. Luxury condos in Dubai"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Target Audience</label>
          <textarea
            value={form.audience_description}
            onChange={(e) => setForm((f) => ({ ...f, audience_description: e.target.value }))}
            placeholder="Describe your ideal audience (e.g. B2B SaaS founders raising their Series A)"
            rows={2}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Content Pillars</label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {form.pillars.map((p) => (
              <span key={p} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
                {p}
                <button
                  onClick={() => setForm((f) => ({ ...f, pillars: f.pillars.filter((x) => x !== p) }))}
                  className="hover:text-blue-200 transition-colors"
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
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Competitors to track</label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {form.competitors.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-rose-500 text-white border-2 border-rose-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(136,19,55,1)]">
                {c}
                <button
                  onClick={() => setForm((f) => ({ ...f, competitors: f.competitors.filter((x) => x !== c) }))}
                  className="hover:text-rose-200 transition-colors"
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
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <button
          onClick={handleSave}
          disabled={upsert.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
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
    { id: "all",         label: "All",      icon: Globe },
    { id: "rss",         label: "RSS",       icon: Rss },
    { id: "hackernews",  label: "HN",        icon: FlameKindling },
    { id: "youtube",     label: "YouTube",   icon: Youtube },
  ];

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
            <TrendingUp className="w-3.5 h-3.5" />
            AI Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Trend Radar
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            Live signals matched to your niche — updated hourly
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleIngest}
            disabled={ingest.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            <Zap className="w-3.5 h-3.5" /> {ingest.isPending ? "Ingesting..." : "Trigger Ingest"}
          </button>
        </div>
      </div>

      {/* Niche Setup */}
      <NicheSetup onSaved={() => refetch()} />

      {/* Source filter tabs */}
      <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
        {SOURCE_TABS.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setSourceFilter(tab.id)}
            className={clsx(
              "flex items-center gap-1.5 font-bold text-sm px-4 py-2 transition-colors",
              i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
              sourceFilter === tab.id
                ? "bg-slate-900 dark:bg-blue-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Idea Cards */}
      {!niche ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 text-center py-20">
          <Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-600 dark:text-slate-400 mb-2">Configure your niche first</h3>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
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
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 text-center py-20">
          <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-600 dark:text-slate-400 mb-2">No trend ideas yet</h3>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-6">
            Click &ldquo;Trigger Ingest&rdquo; to fetch the latest signals and generate your idea feed
          </p>
          <button
            onClick={handleIngest}
            disabled={ingest.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
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
