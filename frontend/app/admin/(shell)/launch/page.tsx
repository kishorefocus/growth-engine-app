"use client";

import React, { useState } from "react";
import {
  useLaunchTasks,
  useCreateLaunchTask,
  useUpdateLaunchTask,
  useDeleteLaunchTask,
  useGenerateLaunchAssets,
  useReviewRequests,
  useSendReviewRequest,
} from "@/lib/hooks";
import { LaunchTaskItem } from "@/lib/api-client";
import { clsx } from "clsx";
import { Rocket, Star, Plus, X, Sparkles, Trash2, CheckCircle2 } from "lucide-react";

const PLATFORMS = [
  { id: "all", label: "All Platforms", icon: "🚀" },
  { id: "product_hunt", label: "Product Hunt", icon: "😸" },
  { id: "g2", label: "G2", icon: "⭐" },
  { id: "capterra", label: "Capterra", icon: "🔷" },
  { id: "reddit", label: "Reddit", icon: "🤖" },
  { id: "indiehackers", label: "IndieHackers", icon: "🛠️" },
];

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  if (priority === "high") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-rose-500 text-white border-2 border-rose-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(136,19,55,1)]">
        High
      </span>
    );
  }
  if (priority === "medium") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-amber-500 text-white border-2 border-amber-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(120,53,15,1)]">
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
      Low
    </span>
  );
}

export default function LaunchHubAdminPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const platformQuery = selectedPlatform === "all" ? undefined : selectedPlatform;

  const { data: tasks, isLoading: loadingTasks } = useLaunchTasks(platformQuery);
  const { data: reviewRequests, isLoading: loadingReviews } = useReviewRequests();

  const updateTaskMutation = useUpdateLaunchTask();
  const createTaskMutation = useCreateLaunchTask();
  const deleteTaskMutation = useDeleteLaunchTask();
  const generateAssetsMutation = useGenerateLaunchAssets();
  const sendReviewMutation = useSendReviewRequest();

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [activeAssetTask, setActiveAssetTask] = useState<LaunchTaskItem | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<any>(null);

  // Review request form
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewPlatform, setReviewPlatform] = useState<"g2" | "capterra">("g2");
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  // New task form
  const [newTaskPlatform, setNewTaskPlatform] = useState("product_hunt");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.status === "done").length || 0;
  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress").length || 0;
  const pendingTasks = tasks?.filter((t) => t.status === "pending").length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleStatusChange = async (task: LaunchTaskItem, newStatus: string) => {
    await updateTaskMutation.mutateAsync({
      id: task.id,
      data: { status: newStatus as any },
    });
  };

  const handleOpenAssetGenerator = async (task: LaunchTaskItem) => {
    setActiveAssetTask(task);
    try {
      const res = await generateAssetsMutation.mutateAsync({
        platform: task.platform,
        taskType: task.platform === "reddit" ? "build_journey" : "launch_copy",
      });
      setGeneratedAssets(res.assets);
    } catch {
      setGeneratedAssets(task.assets || null);
    }
  };

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMsg(null);
    try {
      await sendReviewMutation.mutateAsync({
        userEmail: reviewEmail,
        platform: reviewPlatform,
      });
      setReviewMsg(`Review request sent to ${reviewEmail}!`);
      setReviewEmail("");
      setTimeout(() => setShowReviewModal(false), 1500);
    } catch (err: any) {
      setReviewMsg(err?.message || "Failed to send review request.");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await createTaskMutation.mutateAsync({
      platform: newTaskPlatform as any,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
      status: "pending",
    });
    setNewTaskTitle("");
    setNewTaskDesc("");
    setShowNewTaskModal(false);
  };

  const filterTasksByStatus = (status: string) => {
    return (tasks || []).filter((t) => t.status === status);
  };

  return (
    <div className="relative min-h-screen p-5 md:p-8 space-y-8">
      {/* Ambient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] animate-pulse-slow" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Rocket className="w-3.5 h-3.5" />
            Growth
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Launch Hub
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            Track launch checklists for Product Hunt, G2, Capterra, Reddit, and IndieHackers with AI-assisted copy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReviewModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
          >
            <Star className="w-4 h-4" />
            Send Review Request
          </button>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Progress */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.8)] rounded-2xl p-5 group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-blue-500/8 dark:bg-blue-500/10" />
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Launch Progress</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            <span className="text-blue-600 dark:text-blue-400">{completedTasks}</span>
            <span className="text-slate-400 text-lg font-bold">/{totalTasks}</span>
          </div>
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Done */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.6)] rounded-2xl p-5 group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-emerald-500/8 dark:bg-emerald-500/10" />
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Done</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">{completedTasks}</div>
          <div className="font-medium text-xs text-slate-400 mt-1">Verified &amp; submitted</div>
        </div>

        {/* In Progress */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(245,158,11,0.6)] rounded-2xl p-5 group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-amber-500/8 dark:bg-amber-500/10" />
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">In Progress</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight mt-1">{inProgressTasks}</div>
          <div className="font-medium text-xs text-slate-400 mt-1">Copy &amp; assets ready</div>
        </div>

        {/* Review Requests */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(99,102,241,0.6)] rounded-2xl p-5 group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-violet-500/8 dark:bg-violet-500/10" />
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Review Requests</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{reviewRequests?.length || 0}</div>
          <div className="font-medium text-xs text-slate-400 mt-1">G2 &amp; Capterra campaigns</div>
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
        {PLATFORMS.map((p, i) => {
          const isActive = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={clsx(
                "font-bold text-sm px-4 py-2 flex items-center gap-1.5",
                i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                isActive
                  ? "bg-slate-900 dark:bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column: Pending */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-slate-400" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Pending ({filterTasksByStatus("pending").length})
            </h2>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filterTasksByStatus("pending").map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onOpenAsset={handleOpenAssetGenerator}
                onDelete={() => deleteTaskMutation.mutate(task.id)}
              />
            ))}
            {filterTasksByStatus("pending").length === 0 && (
              <div className="p-4 text-center font-medium text-xs text-slate-400 italic">No pending tasks</div>
            )}
          </div>
        </div>

        {/* Column: In Progress */}
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 dark:border-amber-500/60 shadow-[4px_4px_0px_0px_rgba(217,119,6,0.5)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-amber-500" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              In Progress ({filterTasksByStatus("in_progress").length})
            </h2>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filterTasksByStatus("in_progress").map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onOpenAsset={handleOpenAssetGenerator}
                onDelete={() => deleteTaskMutation.mutate(task.id)}
              />
            ))}
            {filterTasksByStatus("in_progress").length === 0 && (
              <div className="p-4 text-center font-medium text-xs text-slate-400 italic">No tasks in progress</div>
            )}
          </div>
        </div>

        {/* Column: Completed */}
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-500/60 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.5)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-emerald-500" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Completed ({filterTasksByStatus("done").length})
            </h2>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filterTasksByStatus("done").map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onOpenAsset={handleOpenAssetGenerator}
                onDelete={() => deleteTaskMutation.mutate(task.id)}
              />
            ))}
            {filterTasksByStatus("done").length === 0 && (
              <div className="p-4 text-center font-medium text-xs text-slate-400 italic">No completed tasks yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Send Review Request Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 mb-1 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  <Star className="w-3.5 h-3.5" />
                  Reviews
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Send Review Request</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Sends an honest review invitation email with direct links to G2 or Capterra.
                </p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSendReview} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  placeholder="client@agency.com"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Review Platform
                </label>
                <select
                  value={reviewPlatform}
                  onChange={(e) => setReviewPlatform(e.target.value as any)}
                  className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="g2">G2 Crowd</option>
                  <option value="capterra">Capterra / Gartner</option>
                </select>
              </div>

              {reviewMsg && (
                <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                  <p className="font-medium text-sm text-blue-700 dark:text-blue-300">{reviewMsg}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendReviewMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  {sendReviewMutation.isPending ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Generator Modal */}
      {activeAssetTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)] mb-1">
                  {activeAssetTask.platform.replace("_", " ")} Assets
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{activeAssetTask.title}</h3>
              </div>
              <button
                onClick={() => {
                  setActiveAssetTask(null);
                  setGeneratedAssets(null);
                }}
                className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {generatedAssets ? (
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] space-y-3">
                  {Object.entries(generatedAssets).map(([key, val]) => (
                    <div key={key}>
                      <div className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                        {key.replace(/_/g, " ")}:
                      </div>
                      {typeof val === "string" ? (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 whitespace-pre-line font-mono text-xs">
                          {val}
                        </div>
                      ) : (
                        <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 overflow-x-auto text-xs">
                          {JSON.stringify(val, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-pulse" />
                  <p className="font-medium text-sm text-slate-400">Loading AI assets...</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t-2 border-slate-100 dark:border-slate-800 mt-6">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(generatedAssets, null, 2));
                  alert("Copied assets to clipboard!");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              >
                Copy All Assets
              </button>
              <button
                onClick={() => {
                  setActiveAssetTask(null);
                  setGeneratedAssets(null);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 mb-1 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  <Plus className="w-3.5 h-3.5" />
                  New Task
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Create Launch Task</h3>
              </div>
              <button onClick={() => setShowNewTaskModal(false)} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Platform</label>
                <select
                  value={newTaskPlatform}
                  onChange={(e) => setNewTaskPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="product_hunt">Product Hunt</option>
                  <option value="g2">G2 Crowd</option>
                  <option value="capterra">Capterra</option>
                  <option value="reddit">Reddit</option>
                  <option value="indiehackers">IndieHackers</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule launch morning AMA"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onOpenAsset,
  onDelete,
}: {
  task: LaunchTaskItem;
  onStatusChange: (task: LaunchTaskItem, newStatus: string) => void;
  onOpenAsset: (task: LaunchTaskItem) => void;
  onDelete: () => void;
}) {
  const isDone = task.status === "done";
  return (
    <div className={clsx(
      "bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow space-y-2.5",
      isDone && "opacity-60"
    )}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
          {task.platform.replace("_", " ")}
        </span>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
          className="text-xs font-semibold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <h4 className={clsx(
        "font-bold text-sm text-slate-900 dark:text-white leading-snug",
        isDone && "line-through text-slate-500 dark:text-slate-500"
      )}>
        {task.title}
      </h4>

      {task.description && (
        <p className="font-medium text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t-2 border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onOpenAsset(task)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          View / Generate Assets
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg border-2 border-transparent hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
