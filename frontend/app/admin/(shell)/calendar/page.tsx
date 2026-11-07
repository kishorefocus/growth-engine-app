"use client";

import React, { useState } from "react";
import {
  useCalendarFeed,
  usePosts,
  useApprovePost,
  useRejectPost,
  useReschedulePost,
  useRetryPost,
  usePublishPost,
  useUpdatePost,
} from "@/lib/hooks";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  Send,
  AlertCircle,
  Eye,
  Edit3,
  CalendarDays,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import Link from "next/link";

const PLATFORMS = [
  { id: "all", name: "All Platforms" },
  { id: "x", name: "X (Twitter)", color: "#38bdf8", bg: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  { id: "linkedin", name: "LinkedIn", color: "#60a5fa", bg: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  { id: "instagram", name: "Instagram", color: "#f472b6", bg: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  { id: "facebook", name: "Facebook", color: "#818cf8", bg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
  { id: "youtube", name: "YouTube", color: "#f87171", bg: "bg-red-500/15 text-red-400 border-red-500/20" },
];

const PLATFORM_BADGE: Record<string, string> = {
  x: "bg-sky-500 border-sky-900",
  linkedin: "bg-blue-500 border-blue-900",
  instagram: "bg-pink-500 border-pink-900",
  facebook: "bg-indigo-500 border-indigo-900",
  youtube: "bg-red-600 border-red-900",
};

function getLivePostUrl(platform: string, externalId?: string): string | null {
  if (!externalId || externalId.includes("mock") || externalId.includes("dryrun")) return null;
  const plat = platform.toLowerCase();
  if (plat === "linkedin") {
    return `https://www.linkedin.com/feed/update/${encodeURIComponent(externalId)}/`;
  }
  if (plat === "x") {
    return `https://x.com/i/status/${externalId}`;
  }
  if (plat === "facebook") {
    if (externalId.includes("_")) {
      const parts = externalId.split("_");
      return `https://www.facebook.com/${parts[0]}/posts/${parts[1]}`;
    }
    return `https://www.facebook.com/${externalId}`;
  }
  return null;
}

function PostMediaGallery({ mediaUrls, platform }: { mediaUrls?: string[]; platform: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const validImages = mediaUrls.filter(
    (url) => url.endsWith(".png") || url.endsWith(".jpg") || url.startsWith("http") || url.startsWith("/")
  );

  if (validImages.length === 0) {
    return (
      <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400">
        <span className="font-bold text-slate-800 dark:text-slate-200">Image Prompt:</span> {mediaUrls[0]}
      </div>
    );
  }

  const currentImg = validImages[currentIndex] || validImages[0];
  const imageName = currentImg.split("/").pop()?.replace(".png", "").replace(".jpg", "") || "";

  return (
    <div className="space-y-2">
      {/* Main image viewer with carousel navigation */}
      <div className="rounded-xl overflow-hidden border-2 border-slate-900 dark:border-slate-700 bg-black/70 shadow-xl group relative">
        <img
          src={currentImg}
          alt={`Slide ${currentIndex + 1} - ${imageName}`}
          className="w-full h-56 object-cover object-top hover:scale-[1.01] transition-transform duration-200"
        />

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10 shadow-sm">
            {currentIndex + 1} / {validImages.length}
          </span>
          <span
            className={clsx(
              "px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-md border shadow-sm",
              platform === "instagram"
                ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
            )}
          >
            {platform === "instagram" ? "Instagram Carousel" : "Facebook Gallery"} ({validImages.length} images)
          </span>
        </div>

        {/* Prev / Next controls */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 border border-white/10 text-sm font-bold shadow-md cursor-pointer"
              title="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 border border-white/10 text-sm font-bold shadow-md cursor-pointer"
              title="Next image"
            >
              ›
            </button>
          </>
        )}

        {/* Bottom bar with filename */}
        <div className="px-3 py-1.5 bg-black/90 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/[0.06]">
          <span className="font-mono text-slate-200 capitalize font-medium">{imageName.replace(/-/g, " ")}.png</span>
          <span className="text-slate-400 text-[10px]">
            {validImages.length > 1 ? `${validImages.length} screenshots attached` : "1 screenshot"}
          </span>
        </div>
      </div>

      {/* Thumbnails row */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {validImages.map((img, idx) => {
            const thumbName = img.split("/").pop()?.replace(".png", "") || "";
            return (
              <button
                key={img + idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={clsx(
                  "relative shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                  idx === currentIndex
                    ? "border-blue-500 ring-2 ring-blue-500/50 scale-105"
                    : "border-slate-700 opacity-60 hover:opacity-100"
                )}
                title={thumbName}
              >
                <img
                  src={img}
                  alt={thumbName}
                  className="w-12 h-9 object-cover object-top"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-center text-white truncate px-0.5">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "approval">("calendar");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"month" | "week">("week");
  const [selectedPostForPreview, setSelectedPostForPreview] = useState<any | null>(null);

  // Reschedule state
  const [reschedulingPost, setReschedulingPost] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");

  // Queries & Mutations
  const { data: calendarData, isLoading: isCalendarLoading, refetch: refetchCalendar } = useCalendarFeed({
    platform: selectedPlatform === "all" ? undefined : selectedPlatform,
  });

  const { data: posts, isLoading: isPostsLoading, refetch: refetchPosts } = usePosts({
    platform: selectedPlatform === "all" ? undefined : selectedPlatform,
  });

  const approveMutation = useApprovePost();
  const rejectMutation = useRejectPost();
  const rescheduleMutation = useReschedulePost();
  const retryMutation = useRetryPost();
  const publishMutation = usePublishPost();

  const pendingPosts = posts?.filter((p) => p.status === "pending_approval") || [];
  const scheduledPosts = posts?.filter((p) => p.status === "scheduled") || [];

  const handlePublishNow = async (id: string) => {
    try {
      const res = await publishMutation.mutateAsync(id);
      if (res?.external_post_id?.includes("mock") || res?.external_post_id?.includes("dryrun")) {
        toast.info("Published in Sandbox / Test Mode. To publish live to your Facebook Page or Instagram feed, connect your real Meta Page Access Token in Connections.", { duration: 7000 });
      } else {
        toast.success("Post published live to platform!");
      }
      refetchCalendar();
      refetchPosts();
    } catch (err: any) {
      toast.error(`Publishing failed: ${err.message}`);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast.success("Post approved and scheduled for publishing!");
      refetchCalendar();
      refetchPosts();
    } catch (err: any) {
      toast.error(`Approval failed: ${err.message}`);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Optional reason for rejection:", "Tone adjustment needed");
    try {
      await rejectMutation.mutateAsync({ id, reason: reason || undefined });
      toast.info("Post rejected");
      refetchCalendar();
      refetchPosts();
    } catch (err: any) {
      toast.error(`Rejection failed: ${err.message}`);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingPost || !rescheduleDate) return;
    try {
      await rescheduleMutation.mutateAsync({
        id: reschedulingPost.id,
        scheduledAt: new Date(rescheduleDate).toISOString(),
      });
      toast.success("Post rescheduled successfully!");
      setReschedulingPost(null);
      refetchCalendar();
      refetchPosts();
    } catch (err: any) {
      toast.error(`Rescheduling failed: ${err.message}`);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await retryMutation.mutateAsync(id);
      toast.success("Retry queued! Publisher will execute within 1 minute.");
      refetchCalendar();
      refetchPosts();
    } catch (err: any) {
      toast.error(`Retry failed: ${err.message}`);
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
            <CalendarDays className="w-3.5 h-3.5" />
            Schedule
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Content Calendar
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            Review drafts, approve in queue with side-by-side platform previews, and manage schedule times.
          </p>
        </div>

        {/* Tab toggles */}
        <div className="flex items-center gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setActiveTab("calendar")}
            className={clsx(
              "font-bold text-sm px-4 py-2 flex items-center gap-1.5 transition-colors",
              activeTab === "calendar"
                ? "bg-slate-900 dark:bg-blue-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab("approval")}
            className={clsx(
              "font-bold text-sm px-4 py-2 flex items-center gap-1.5 relative border-l-2 border-slate-900 dark:border-slate-700 transition-colors",
              activeTab === "approval"
                ? "bg-slate-900 dark:bg-blue-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approval Queue
            {pendingPosts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-bold">
                {pendingPosts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Platform Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] overflow-x-auto">
          {PLATFORMS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={clsx(
                "font-bold text-sm px-4 py-2 whitespace-nowrap transition-colors",
                i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                selectedPlatform === p.id
                  ? "bg-slate-900 dark:bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        {activeTab === "calendar" && (
          <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setViewMode("week")}
              className={clsx(
                "font-bold text-sm px-4 py-2 transition-colors",
                viewMode === "week"
                  ? "bg-slate-900 dark:bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={clsx(
                "font-bold text-sm px-4 py-2 border-l-2 border-slate-900 dark:border-slate-700 transition-colors",
                viewMode === "month"
                  ? "bg-slate-900 dark:bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              Month
            </button>
          </div>
        )}
      </div>

      {/* ─── TAB 1: CALENDAR VIEW ───────────────────────────────────────────── */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          {/* Best Time Heuristic Bar */}
          {calendarData?.best_time_suggestions && (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-800 dark:text-white">Suggested Posting Windows:</span>
                <span className="text-slate-400 hidden md:inline">(Weekday mornings in target timezones)</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {Object.entries(calendarData.best_time_suggestions).map(([plat, times]) => (
                  <div key={plat} className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="capitalize text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{plat}:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{(times as string[]).join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Items */}
          {isCalendarLoading ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mx-auto" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mx-auto" />
            </div>
          ) : !calendarData || calendarData.items.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-12 text-center space-y-4">
              <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No scheduled posts on calendar</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Approve drafts from the Approval Queue or generate a new batch from Content Ideas to schedule posts.
              </p>
              <Link
                href="/admin/ideas"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
              >
                Go to Ideas Studio
              </Link>
            </div>
          ) : (
            <div className="border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.75)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.3)] rounded-2xl overflow-hidden">
              <div className="bg-slate-900 dark:bg-slate-800 px-5 py-3 flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-blue-500" />
                <h2 className="text-xs font-black text-white uppercase tracking-widest">Scheduled Posts</h2>
                <span className="ml-auto text-xs font-black text-slate-400">{calendarData.items.length} posts</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {calendarData.items.map((item) => {
                  const platConf = PLATFORMS.find((p) => p.id === item.platform.toLowerCase()) || {
                    name: item.platform,
                    bg: "bg-slate-800 text-slate-400 border-white/[0.06]",
                  };
                  const badgeColor = PLATFORM_BADGE[item.platform.toLowerCase()] || "bg-slate-700 border-slate-900";

                  return (
                    <div
                      key={item.id}
                      className="px-5 py-4 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={clsx(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]",
                              badgeColor
                            )}>
                              {platConf.name}
                            </span>
                            <span className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
                              item.status === "published"
                                ? "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40"
                                : item.status === "failed"
                                ? "bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-400/40"
                                : "bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-400/40"
                            )}>
                              <span className={clsx(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                item.status === "published" ? "bg-emerald-500"
                                  : item.status === "failed" ? "bg-rose-500"
                                  : "bg-blue-500"
                              )} />
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {item.body}
                          </p>
                          {item.error && (
                            <div className="flex gap-3 p-3 mt-2 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 border border-red-200 dark:border-red-500/30 rounded-xl">
                              <p className="text-xs font-medium text-red-700 dark:text-red-300">{item.error}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-slate-400">
                            <Clock className="w-3 h-3" />
                            {new Date(item.scheduled_at).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {item.status === "published" && item.external_post_id && getLivePostUrl(item.platform, item.external_post_id) && (
                              <a
                                href={getLivePostUrl(item.platform, item.external_post_id)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Live
                              </a>
                            )}
                            {item.status !== "published" && (
                              <button
                                onClick={() => handlePublishNow(item.id)}
                                disabled={publishMutation.isPending}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                              >
                                <Send className="w-3 h-3" />
                                Publish Now
                              </button>
                            )}
                            {item.status === "failed" && (
                              <button
                                onClick={() => handleRetry(item.id)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-bold text-sm border-2 border-red-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(127,29,29,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(127,29,29,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all duration-100"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Retry
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setReschedulingPost(item);
                                setRescheduleDate(item.scheduled_at.slice(0, 16));
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                            >
                              Reschedule
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: APPROVAL QUEUE ─────────────────────────────────────────── */}
      {activeTab === "approval" && (
        <div className="space-y-5">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-blue-500" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Approval Queue
            </h2>
            {pendingPosts.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-amber-500 text-white border-2 border-amber-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
                {pendingPosts.length} pending
              </span>
            )}
          </div>

          {pendingPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Approval Queue is Clear</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No items are currently pending review. When new weekly batches are generated or converted from ideas, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {pendingPosts.map((post) => {
                const badgeColor = PLATFORM_BADGE[post.platform?.toLowerCase()] || "bg-slate-700 border-slate-900";
                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow space-y-4"
                  >
                    {/* Top card row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]",
                          badgeColor
                        )}>
                          {post.platform}
                        </span>
                        {post.link_url && (
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            UTM: <span className="text-slate-500 dark:text-slate-400 font-mono">{post.link_url}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(post.id)}
                          disabled={rejectMutation.isPending}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-bold text-sm border-2 border-red-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(127,29,29,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(127,29,29,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all duration-100"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => handlePublishNow(post.id)}
                          disabled={publishMutation.isPending}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Publish Now
                        </button>
                        <button
                          onClick={() => handleApprove(post.id)}
                          disabled={approveMutation.isPending}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve & Schedule
                        </button>
                      </div>
                    </div>

                    {/* Platform Preview Mockup */}
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      {post.platform === "x" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                              GC
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">GetyourclientsB2B</span>
                                <span className="text-xs font-medium text-slate-400">@getyourclientsb2b · Just now</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pl-10">
                            {post.body}
                          </p>
                          <div className="pl-10">
                            <PostMediaGallery mediaUrls={post.media_urls} platform="x" />
                          </div>
                          <div className="text-xs font-black uppercase tracking-widest text-slate-400 pl-10 pt-1">
                            {post.body?.length || 0} / 280 chars
                          </div>
                        </div>
                      )}

                      {post.platform === "linkedin" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                              GC
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">GetyourclientsB2B</span>
                              <p className="text-xs font-medium text-slate-400">B2B Client Discovery & Cold Outreach CRM</p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {post.body}
                          </p>
                          <PostMediaGallery mediaUrls={post.media_urls} platform="linkedin" />
                          <div className="text-xs font-black uppercase tracking-widest text-slate-400 pt-1">
                            {post.body?.length || 0} chars (Target 800–1,300)
                          </div>
                        </div>
                      )}

                      {post.platform === "instagram" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 p-0.5">
                              <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                GC
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">getyourclientsb2b</span>
                          </div>
                          <PostMediaGallery mediaUrls={post.media_urls} platform="instagram" />
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {post.body}
                          </p>
                        </div>
                      )}

                      {post.platform === "facebook" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                              f
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">GetyourclientsB2B</span>
                          </div>
                          <PostMediaGallery mediaUrls={post.media_urls} platform="facebook" />
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {post.body}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-blue-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Reschedule Post</h3>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Select the new timestamp to publish to {reschedulingPost.platform.toUpperCase()}:
            </p>

            <input
              type="datetime-local"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingPost(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRescheduleSubmit}
                disabled={rescheduleMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
