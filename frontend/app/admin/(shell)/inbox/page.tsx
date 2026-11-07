"use client";

import { useState } from "react";
import { useInboxReplies, useHandleReply, useSuppressReply } from "@/lib/hooks";
import { ReplyItem } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Inbox as InboxIcon,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Copy,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";

const CLASSIFICATIONS = [
  { id: "all", label: "All Replies" },
  { id: "interested", label: "Interested", color: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-500/20 border-emerald-400/40" },
  { id: "not_now", label: "Not Now", color: "text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 border-amber-400/40" },
  { id: "not_interested", label: "Not Interested", color: "text-slate-600 dark:text-slate-300 bg-slate-500/15 dark:bg-slate-500/20 border-slate-400/40" },
  { id: "unsubscribe", label: "Unsubscribe", color: "text-rose-700 dark:text-rose-300 bg-rose-500/15 dark:bg-rose-500/20 border-rose-400/40" },
  { id: "out_of_office", label: "Out of Office", color: "text-blue-700 dark:text-blue-300 bg-blue-500/15 dark:bg-blue-500/20 border-blue-400/40" },
  { id: "other", label: "Other", color: "text-purple-700 dark:text-purple-300 bg-purple-500/15 dark:bg-purple-500/20 border-purple-400/40" },
];

export default function InboxPage() {
  const [filterClass, setFilterClass] = useState<string>("all");
  const [onlyUnhandled, setOnlyUnhandled] = useState<boolean>(true);
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);

  const { data: replies, isLoading, refetch } = useInboxReplies({
    classification: filterClass === "all" ? undefined : filterClass,
    handled: onlyUnhandled ? false : undefined,
    limit: 50,
  });

  const selectedReply = replies?.find((r) => r.id === (selectedReplyId || replies[0]?.id));

  return (
    <div className="relative min-h-screen p-5 md:p-8 space-y-8 max-w-7xl">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] animate-pulse-slow" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <InboxIcon className="w-3.5 h-3.5" />
            Conversations
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Outreach Inbox
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            AI-classified inbound prospect responses with 1-click suggested follow-ups
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyUnhandled(!onlyUnhandled)}
            className={clsx(
              "inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm border-2 rounded-xl transition-all duration-100",
              onlyUnhandled
                ? "bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 border-slate-900 dark:border-blue-400 shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.15)] hover:translate-x-[2px] hover:translate-y-[2px]"
            )}
          >
            {onlyUnhandled ? "Showing: Needs Action" : "Showing: All Messages"}
          </button>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-900 dark:hover:border-slate-500 transition-all"
            title="Refresh Inbox"
          >
            <RefreshCw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Classification Filter Tab Strip */}
      <div className="flex items-center gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] overflow-x-auto">
        {CLASSIFICATIONS.map((c, i) => {
          const isActive = filterClass === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setFilterClass(c.id);
                setSelectedReplyId(null);
              }}
              className={clsx(
                "font-bold text-xs px-4 py-2 whitespace-nowrap transition-colors",
                i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                isActive
                  ? "bg-slate-900 dark:bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Main Inbox Interface */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-16 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading inbound messages...</p>
        </div>
      ) : !replies || replies.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-16 text-center">
          <InboxIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">Inbox Zero</h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {onlyUnhandled
              ? "All inbound replies have been handled! Great job keeping up with prospects."
              : "No replies match the selected filters."}
          </p>
          {onlyUnhandled && (
            <button
              onClick={() => setOnlyUnhandled(false)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
            >
              View Handled Messages
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Message List (Left Pane) */}
          <div className="lg:col-span-5 space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {replies.map((reply) => {
              const isSelected = selectedReply?.id === reply.id;
              const classObj = CLASSIFICATIONS.find((c) => c.id === reply.classification);
              const sender = reply.lead?.email || "Prospect";
              const senderName = reply.lead?.first_name ? `${reply.lead.first_name} ${reply.lead.last_name || ""}` : sender;

              return (
                <div
                  key={reply.id}
                  onClick={() => setSelectedReplyId(reply.id)}
                  className={clsx(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all text-left space-y-2",
                    isSelected
                      ? "bg-blue-50 dark:bg-slate-800/80 border-blue-500 shadow-[2px_2px_0px_0px_rgba(37,99,235,0.8)]"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-slate-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)]"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-xs text-slate-900 dark:text-white truncate">
                      {senderName} {reply.lead?.company ? `· ${reply.lead.company}` : ""}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 shrink-0">
                      {new Date(reply.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
                    {reply.body || "(No message body)"}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm capitalize",
                        classObj?.color || "text-slate-600 dark:text-slate-300 bg-slate-500/15 border-slate-400/40"
                      )}
                    >
                      {reply.classification?.replace("_", " ") || "other"}
                      {reply.confidence ? ` · ${Math.round(reply.confidence * 100)}%` : ""}
                    </span>

                    {reply.handled && (
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Handled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Detail & Suggested Action (Right Pane) */}
          <div className="lg:col-span-7">
            {selectedReply ? (
              <ReplyDetailView reply={selectedReply} onUpdated={() => refetch()} />
            ) : (
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                Select a message to view details and suggested actions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reply Detail View ────────────────────────────────────────────────────────

function ReplyDetailView({
  reply,
  onUpdated,
}: {
  reply: ReplyItem;
  onUpdated: () => void;
}) {
  const handleReply = useHandleReply();
  const suppressReply = useSuppressReply();

  const [customReply, setCustomReply] = useState(reply.suggested_response || "");

  const handleMarkHandled = async () => {
    try {
      await handleReply.mutateAsync(reply.id);
      toast.success("Marked as handled");
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update reply status");
    }
  };

  const handleSuppress = async () => {
    const target = reply.lead?.email || "this prospect";
    if (!confirm(`Add ${target} to suppression list to stop all future outreach?`)) return;
    try {
      await suppressReply.mutateAsync(reply.id);
      toast.success(`Suppressed ${target}`);
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to suppress sender");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customReply);
    toast.success("Suggested response copied to clipboard");
  };

  const classObj = CLASSIFICATIONS.find((c) => c.id === reply.classification);
  const senderEmail = reply.lead?.email || "Unknown Email";

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl space-y-5 p-6">
      {/* Sender Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-900 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-black text-slate-900 dark:text-white">{senderEmail}</h3>
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm capitalize",
                classObj?.color || "text-slate-600 dark:text-slate-300 bg-slate-500/15 border-slate-400/40"
              )}
            >
              {reply.classification?.replace("_", " ")} ({Math.round((reply.confidence || 0.9) * 100)}% confidence)
            </span>
          </div>
          {reply.lead && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              {reply.lead.first_name} {reply.lead.last_name || ""} {reply.lead.company ? `· ${reply.lead.company}` : ""} {reply.lead.title ? `(${reply.lead.title})` : ""}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkHandled}
            disabled={handleReply.isPending}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 rounded-xl transition-all duration-100",
              reply.handled
                ? "bg-white dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-600"
                : "bg-emerald-600 text-white border-emerald-900 shadow-[3px_3px_0px_0px_rgba(6,78,59,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(6,78,59,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {reply.handled ? "Handled" : "Mark Handled"}
          </button>

          <button
            onClick={handleSuppress}
            disabled={suppressReply.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold border-2 border-rose-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(136,19,55,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(136,19,55,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
            title="Add email to suppression list"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Suppress
          </button>
        </div>
      </div>

      {/* Prospect Message Body */}
      <div>
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2">
          Prospect Message
        </span>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {reply.body || "(No message body)"}
          </p>
        </div>
      </div>

      {/* AI Suggested Response Box */}
      <div className="bg-white dark:bg-slate-900 border-2 border-blue-500 dark:border-blue-400 rounded-2xl shadow-[4px_4px_0px_0px_rgba(37,99,235,0.3)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">AI Suggested Response</span>
            <span className="text-[10px] font-medium text-slate-400">(Claude 3.5 Sonnet)</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-all"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>

        <textarea
          rows={5}
          value={customReply}
          onChange={(e) => setCustomReply(e.target.value)}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none"
          placeholder="No suggested reply available for this classification."
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="font-medium">Review and customize before sending via your primary email client.</span>
          <button
            onClick={() => {
              handleCopy();
              handleMarkHandled();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
          >
            Copy & Mark Handled
          </button>
        </div>
      </div>
    </div>
  );
}
