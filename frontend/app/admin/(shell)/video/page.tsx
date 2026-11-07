"use client";

import React, { useRef, useState } from "react";
import {
  useVideos,
  usePlanVideo,
  useUploadVideoAsset,
  useUploadVideoDirect,
  usePublishYouTube,
  useCrossPostCaptions,
} from "@/lib/hooks";
import {
  Video,
  Sparkles,
  FileText,
  ListOrdered,
  Tag,
  Image as ImageIcon,
  UploadCloud,
  Youtube,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Film,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";

const SUGGESTED_KEYWORDS = [
  "how to find 50 real estate leads in 5 minutes",
  "Apollo.io alternative for small agencies",
  "How to set up DMARC and stop landing in spam",
  "B2B lead generation workflow for commercial insurance",
  "Scraping vs real-time email verification",
];

export default function VideoStudioPage() {
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [activePlanTab, setActivePlanTab] = useState<"script" | "shots" | "metadata" | "thumbnail" | "crosspost">("script");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Queries & Mutations
  const { data: videos, isLoading, refetch } = useVideos();
  const planMutation = usePlanVideo();
  const uploadAssetMutation = useUploadVideoAsset();
  const uploadDirectMutation = useUploadVideoDirect();
  const publishYouTubeMutation = usePublishYouTube();
  const crossPostMutation = useCrossPostCaptions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [crossPostData, setCrossPostData] = useState<{
    instagram_reels: string;
    facebook_reels: string;
    linkedin_video: string;
  } | null>(null);

  const activeVideo = videos?.find((v) => v.id === selectedVideoId) || videos?.[0];

  const handleCreatePlan = async (kw?: string) => {
    const kwToUse = kw || keywordInput.trim();
    if (!kwToUse) {
      toast.error("Please enter a target keyword or topic");
      return;
    }
    try {
      toast.info(`Generating complete video production plan for: "${kwToUse}"...`);
      const newProject = await planMutation.mutateAsync({
        targetKeyword: kwToUse,
      });
      setSelectedVideoId(newProject.id);
      setKeywordInput("");
      toast.success("Video plan generated successfully!");
      refetch();
    } catch (err: any) {
      toast.error(`Plan generation failed: ${err.message}`);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUseDemoVideo = async (videoId: string) => {
    try {
      const res = await uploadAssetMutation.mutateAsync({
        id: videoId,
        filename: "demo_walkthrough.mp4",
      });
      toast.success("Attached demo walkthrough video! Ready to publish to YouTube.");
      refetch();
    } catch (err: any) {
      toast.error(`Could not attach demo video: ${err.message}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, videoId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.info(`Uploading "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
      await uploadDirectMutation.mutateAsync({ id: videoId, file });
      toast.success("Video file uploaded successfully! Ready to publish to YouTube.");
      refetch();
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handlePublishYouTube = async (videoId: string) => {
    if (!confirm("Publish this video to YouTube as PRIVATE?")) return;
    try {
      const res = await publishYouTubeMutation.mutateAsync(videoId);
      toast.success(`Published to YouTube! Video ID: ${res.youtube_video_id} (Privacy: Private)`);
      refetch();
    } catch (err: any) {
      toast.error(`YouTube publish failed: ${err.message}`);
    }
  };

  const handleLoadCrossPost = async (videoId: string) => {
    try {
      const res = await crossPostMutation.mutateAsync(videoId);
      setCrossPostData(res);
      setActivePlanTab("crosspost");
      toast.success("Generated cross-post caption variants!");
    } catch (err: any) {
      toast.error(`Could not generate cross-post captions: ${err.message}`);
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
            <Film className="w-3.5 h-3.5" />
            Media
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Video Studio
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            Turn search keywords into full scripts, step-by-step shot lists, YouTube metadata with UTM links, and cross-post captions.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-red-600 text-white border-2 border-red-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
          <Youtube className="w-3 h-3" />
          YouTube Data API v3
        </span>
      </div>

      {/* Target Keyword Input Bar */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-blue-500" />
          <label className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Target Keyword / Video Topic
          </label>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="e.g. how to find 50 real estate leads in 5 minutes"
            className="flex-1 w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleCreatePlan()}
          />
          <button
            onClick={() => handleCreatePlan()}
            disabled={planMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 shrink-0"
          >
            <Sparkles className={clsx("w-4 h-4", planMutation.isPending && "animate-spin")} />
            {planMutation.isPending ? "Generating Plan..." : "Generate Video Plan"}
          </button>
        </div>

        {/* Suggested Keywords Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Suggestions:</span>
          {SUGGESTED_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => handleCreatePlan(kw)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-white/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-600 transition-all font-medium"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Body: Project List (Left) + Detail Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Projects list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-blue-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Video Projects</h3>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <RefreshCw className={clsx("w-3.5 h-3.5 text-slate-400", isLoading && "animate-spin")} />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : !videos || videos.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-8 text-center space-y-2">
              <Film className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                No video projects planned yet. Enter a target keyword above to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {videos.map((vid) => {
                const isSelected = activeVideo?.id === vid.id;
                return (
                  <div
                    key={vid.id}
                    onClick={() => {
                      setSelectedVideoId(vid.id);
                      setCrossPostData(null);
                    }}
                    className={clsx(
                      "bg-white dark:bg-slate-900 border-2 rounded-2xl p-4 cursor-pointer transition-all space-y-2",
                      isSelected
                        ? "border-blue-500 dark:border-blue-400 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.6)]"
                        : "border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 truncate max-w-[180px]">
                        {vid.target_keyword || "Keyword"}
                      </span>
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm",
                        vid.status === "published"
                          ? "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40"
                          : "bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40"
                      )}>
                        <span className={clsx(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          vid.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                        {vid.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                      {vid.title}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Video Plan Details */}
        <div className="lg:col-span-8 space-y-4">
          {activeVideo ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 space-y-6">
              {/* Active Video Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  {/* Thumbnail placeholder */}
                  <div className="w-full h-32 rounded-xl bg-slate-800 dark:bg-slate-950 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center mb-3">
                    <Film className="w-10 h-10 text-slate-600" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono">
                    Keyword: {activeVideo.target_keyword}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {activeVideo.youtube_title || activeVideo.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleLoadCrossPost(activeVideo.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Cross-Post Captions
                  </button>

                  {activeVideo.youtube_video_id ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      YouTube: {activeVideo.youtube_video_id}
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePublishYouTube(activeVideo.id)}
                      disabled={publishYouTubeMutation.isPending}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-bold text-sm border-2 border-red-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(127,29,29,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(127,29,29,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all duration-100"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      Publish YouTube (Private)
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs Selector */}
              <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] overflow-x-auto">
                {[
                  { id: "script", label: "Script", icon: FileText },
                  { id: "shots", label: "Shot List", icon: ListOrdered },
                  { id: "metadata", label: "Metadata", icon: Tag },
                  { id: "thumbnail", label: "Thumbnail", icon: ImageIcon },
                  { id: "crosspost", label: "Cross-Post", icon: Share2 },
                ].map((tab, i) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePlanTab(tab.id as any)}
                      className={clsx(
                        "flex items-center gap-1.5 font-bold text-sm px-4 py-2 whitespace-nowrap transition-colors",
                        i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                        activePlanTab === tab.id
                          ? "bg-slate-900 dark:bg-blue-600 text-white"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panes */}
              {activePlanTab === "script" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-5 rounded-full bg-blue-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Verbatim Script & Outline
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeVideo.script || "", "script")}
                      className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      {copiedKey === "script" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Script
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border-2 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                    {activeVideo.script}
                  </pre>
                </div>
              )}

              {activePlanTab === "shots" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 rounded-full bg-blue-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Screen-Recording Shot List
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {activeVideo.shot_list && activeVideo.shot_list.length > 0 ? (
                      activeVideo.shot_list.map((shot, idx) => (
                        <div
                          key={idx}
                          className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-start gap-3"
                        >
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500 border-2 border-blue-900 text-white font-black text-xs shadow-[2px_2px_0px_0px_rgba(30,27,75,1)] shrink-0">
                            {shot.step_number || idx + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {shot.screen} — <span className="text-slate-500 dark:text-slate-400 font-medium">{shot.action}</span>
                            </p>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 italic">
                              Cue: &quot;{shot.voiceover_cue}&quot;
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No shot list generated.</p>
                    )}
                  </div>
                </div>
              )}

              {activePlanTab === "metadata" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Recommended Title</label>
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {activeVideo.youtube_title || activeVideo.title}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Description & Chapters</label>
                      <button
                        onClick={() => handleCopy(activeVideo.youtube_description || "", "desc")}
                        className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400"
                      >
                        {copiedKey === "desc" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border-2 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans max-h-[200px] overflow-y-auto">
                      {activeVideo.youtube_description}
                    </pre>
                  </div>

                  {activeVideo.tags && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Tags</label>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeVideo.tags.map((t) => (
                          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activePlanTab === "thumbnail" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-5 rounded-full bg-blue-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        AI Thumbnail Generation Prompt
                      </h4>
                    </div>
                    <button
                      onClick={() => handleCopy(activeVideo.thumbnail_prompt || "", "thumb")}
                      className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      {copiedKey === "thumb" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Prompt
                    </button>
                  </div>
                  <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                      {activeVideo.thumbnail_prompt}
                    </p>
                  </div>
                </div>
              )}

              {activePlanTab === "crosspost" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 rounded-full bg-blue-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Cross-Post Caption Cut-Downs
                    </h4>
                  </div>
                  {crossPostData ? (
                    <div className="space-y-3">
                      {/* Instagram Reels */}
                      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-pink-500 text-white border-2 border-pink-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
                            Instagram Reels
                          </span>
                          <button
                            onClick={() => handleCopy(crossPostData.instagram_reels, "ig")}
                            className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{crossPostData.instagram_reels}</p>
                      </div>

                      {/* Facebook Reels */}
                      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-indigo-500 text-white border-2 border-indigo-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
                            Facebook Reels
                          </span>
                          <button
                            onClick={() => handleCopy(crossPostData.facebook_reels, "fb")}
                            className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{crossPostData.facebook_reels}</p>
                      </div>

                      {/* LinkedIn Video */}
                      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
                            LinkedIn Video
                          </span>
                          <button
                            onClick={() => handleCopy(crossPostData.linkedin_video, "li")}
                            className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{crossPostData.linkedin_video}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-8 text-center space-y-3">
                      <Share2 className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Click below to generate platform-tailored caption variants.
                      </p>
                      <button
                        onClick={() => handleLoadCrossPost(activeVideo.id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
                      >
                        Generate Cut-Down Captions
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Asset Upload Bar */}
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-500/20 border-2 border-slate-900 dark:border-blue-500/40 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-white dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Video Asset Upload (Cloudflare R2 / S3)</p>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {activeVideo.asset_url ? activeVideo.asset_url : "No file attached yet (Signed PUT URL ready)"}
                    </p>
                    {/* Upload progress bar placeholder */}
                    {uploadDirectMutation.isPending && (
                      <div className="mt-2 w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-lg animate-pulse w-2/3" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="video/mp4,video/quicktime,video/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, activeVideo.id)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadDirectMutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {uploadDirectMutation.isPending ? "Uploading..." : "Upload MP4"}
                  </button>
                  <button
                    onClick={() => handleUseDemoVideo(activeVideo.id)}
                    disabled={uploadAssetMutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 disabled:opacity-50"
                    title="Attach the included demo video asset to test publishing immediately"
                  >
                    {uploadAssetMutation.isPending ? "Attaching..." : "Use Demo Video"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-16 text-center space-y-3">
              <Film className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Select or generate a video project to inspect its production plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
