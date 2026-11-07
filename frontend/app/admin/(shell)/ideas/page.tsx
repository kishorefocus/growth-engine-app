"use client";

import React, { useState } from "react";
import {
  useIdeas,
  useGenerateIdeasBatch,
  useCreateIdea,
  useDeleteIdea,
  useGeneratePlatformPosts,
} from "@/lib/hooks";
import {
  Sparkles,
  Plus,
  RefreshCw,
  Layers,
  ArrowRight,
  Trash2,
  CheckCircle2,
  Filter,
  Lightbulb,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PILLARS = [
  { id: "all", label: "All Pillars", color: "bg-slate-800 text-slate-300" },
  { id: "how-to", label: "How-To Tutorials", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  { id: "build-in-public", label: "Build in Public", color: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  { id: "competitor_alternatives", label: "Competitor Alternatives", color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  { id: "industry_lead_lists", label: "Industry Lead Lists", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  { id: "tips_and_stats", label: "Tips & Stats", color: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
];

const PILLAR_BADGE_COLORS: Record<string, string> = {
  "how-to": "bg-emerald-500 border-emerald-900",
  "build-in-public": "bg-sky-500 border-sky-900",
  "competitor_alternatives": "bg-violet-500 border-violet-900",
  "industry_lead_lists": "bg-amber-500 border-amber-900",
  "tips_and_stats": "bg-rose-500 border-rose-900",
};

export default function IdeasPage() {
  const router = useRouter();
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newPillar, setNewPillar] = useState("how-to");
  const [customPrompt, setCustomPrompt] = useState("");

  const { data: ideas, isLoading, refetch } = useIdeas({
    pillar: selectedPillar === "all" ? undefined : selectedPillar,
  });
  const generateBatchMutation = useGenerateIdeasBatch();
  const createIdeaMutation = useCreateIdea();
  const deleteIdeaMutation = useDeleteIdea();
  const generatePostsMutation = useGeneratePlatformPosts();

  const handleGenerateBatch = async () => {
    setIsGenerating(true);
    try {
      const res = await generateBatchMutation.mutateAsync({
        count: 20,
        customPrompt: customPrompt || undefined,
      });
      toast.success(`Generated ${res.generated_count} high-performing content ideas!`);
      setCustomPrompt("");
    } catch (err: any) {
      toast.error(`Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    try {
      await createIdeaMutation.mutateAsync({
        topic: newTopic.trim(),
        pillar: newPillar as any,
        source: "manual",
        status: "draft",
      });
      toast.success("Idea added successfully!");
      setNewTopic("");
      setShowNewModal(false);
    } catch (err: any) {
      toast.error(`Failed to add idea: ${err.message}`);
    }
  };

  const handleConvertToPosts = async (ideaId: string, topic: string) => {
    try {
      toast.info(`Drafting platform-adapted posts for: "${topic.slice(0, 35)}..."`);
      const res = await generatePostsMutation.mutateAsync({
        ideaId,
        platforms: ["x", "linkedin", "instagram", "facebook"],
      });
      toast.success(`Drafted ${res.posts.length} posts! Review them in the Approval Queue.`);
      router.push("/admin/calendar");
    } catch (err: any) {
      toast.error(`Adaptation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIdeaMutation.mutateAsync(id);
      toast.success("Idea deleted");
    } catch (err: any) {
      toast.error("Could not delete idea");
    }
  };

  return (
    <div className="relative min-h-screen p-5 md:p-8 space-y-8">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] animate-pulse" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Lightbulb className="w-3.5 h-3.5" />
            Content
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Ideas &amp; Generator
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            Generate 20-idea batches across core growth pillars and convert them into platform-adapted posts with 1 click.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
          >
            <Plus className="w-4 h-4" />
            Add Manual
          </button>
          <button
            onClick={handleGenerateBatch}
            disabled={isGenerating || generateBatchMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            <Sparkles className={clsx("w-4 h-4", isGenerating && "animate-spin")} />
            {isGenerating ? "Generating 20 Ideas..." : "Generate Batch (20 Ideas)"}
          </button>
        </div>
      </div>

      {/* Pillar Filter Tab Strip */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
          {PILLARS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedPillar(p.id)}
              className={clsx(
                "font-bold text-sm px-4 py-2 whitespace-nowrap transition-colors",
                i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                selectedPillar === p.id
                  ? "bg-slate-900 dark:bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : !ideas || ideas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-12 text-center space-y-4">
          <Lightbulb className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No content ideas found</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Click &quot;Generate Batch (20 Ideas)&quot; to immediately create curated lead generation and B2B growth concepts.
          </p>
          <button
            onClick={handleGenerateBatch}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            <Sparkles className="w-4 h-4" />
            Generate First Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea) => {
            const pillarBadge = PILLARS.find((p) => p.id === idea.pillar) || {
              label: idea.pillar || "General",
              color: "bg-slate-800 text-slate-400 border-white/[0.06]",
            };
            const badgeColor = (idea.pillar ? PILLAR_BADGE_COLORS[idea.pillar] : undefined) || "bg-slate-700 border-slate-900";

            return (
              <div
                key={idea.id}
                className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={clsx(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]",
                      badgeColor
                    )}>
                      {pillarBadge.label}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {idea.source}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {idea.topic}
                  </h4>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="p-2 rounded-xl border-2 border-transparent hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all"
                    title="Delete idea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleConvertToPosts(idea.id, idea.topic)}
                    disabled={generatePostsMutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Convert to Posts
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Idea Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 w-full max-w-md space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 rounded-full bg-blue-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Add Content Idea</h3>
            </div>
            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Topic / Title
                </label>
                <textarea
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. How to find verified real estate founders with 0% bounce..."
                  className="w-full h-24 px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Growth Pillar
                </label>
                <select
                  value={newPillar}
                  onChange={(e) => setNewPillar(e.target.value)}
                  className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="how-to">How-To Tutorials</option>
                  <option value="build-in-public">Build in Public</option>
                  <option value="competitor_alternatives">Competitor Alternatives</option>
                  <option value="industry_lead_lists">Industry Lead Lists</option>
                  <option value="tips_and_stats">Tips & Stats</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createIdeaMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
