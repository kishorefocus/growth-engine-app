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
  { id: "interested", label: "Interested", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { id: "not_now", label: "Not Now", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "not_interested", label: "Not Interested", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  { id: "unsubscribe", label: "Unsubscribe", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { id: "out_of_office", label: "Out of Office", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { id: "other", label: "Other", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
];

const DEFAULT_REPLIES: ReplyItem[] = [
  {
    id: "rep_1",
    message_id: "msg_1",
    classification: "interested",
    confidence: 0.98,
    handled: false,
    body: "Hey Kishore, thanks for reaching out. We are exploring automated multi-platform content repurposing and programmatic SEO. Can we jump on a brief 15-minute Zoom call this Thursday around 2 PM EST to see a live demo of your calendar queue and lead discovery?",
    suggested_response: "Hi Sarah,\n\nDelighted to connect! 2 PM EST this Thursday works perfectly. I've sent a calendar invitation to your email with a Google Meet link.\n\nI'll walk you through our live 190+ country lead engine and how we adapt 1 idea across 5 social channels automatically.\n\nTalk soon,\nKishore",
    lead: {
      id: "lead_1",
      email: "sarah.jenkins@saasify.io",
      first_name: "Sarah",
      last_name: "Jenkins",
      company: "SaaSify Inc",
      title: "VP of Growth",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "rep_2",
    message_id: "msg_2",
    classification: "interested",
    confidence: 0.94,
    handled: false,
    body: "Hi! We're currently scaling our European outbound campaigns. Your deliverability shield against Google & Yahoo spam filters caught my eye. Can you share pricing for 20k verified leads/month?",
    suggested_response: "Hi Marcus,\n\nThanks for your interest! For 20,000 monthly verified prospects with real-time MX/SMTP validation and automated rotation, our Enterprise tier is $499/mo.\n\nYou can review our full breakdown here: https://www.getyourclientsb2b.com/pricing\n\nWould you like me to set up a test sandbox with 250 free leads for CloudScale UK?",
    lead: {
      id: "lead_2",
      email: "marcus.v@cloudscale.co.uk",
      first_name: "Marcus",
      last_name: "Vance",
      company: "CloudScale UK",
      title: "Head of Demand Gen",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "rep_3",
    message_id: "msg_3",
    classification: "interested",
    confidence: 0.91,
    handled: false,
    body: "Good morning. We need verified prospecting across DACH and UK regions. How does your GDPR zero-spam suppression engine handle opt-outs?",
    suggested_response: "Hello Elena,\n\nOur engine maintains real-time suppression hashes with 1-click unsubscribe links and automated MX verification prior to every send.",
    lead: {
      id: "lead_3",
      email: "e.rostova@nexalogic.de",
      first_name: "Elena",
      last_name: "Rostova",
      company: "NexaLogic AI",
      title: "Chief Marketing Officer",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: "rep_4",
    message_id: "msg_4",
    classification: "not_now",
    confidence: 0.88,
    handled: false,
    body: "Thanks Kishore. Please send over your API documentation and enterprise pricing tier. We'd like our engineering lead to review the webhook endpoints.",
    suggested_response: "Hi Liam,\n\nHere is our direct API documentation and webhook guides: https://www.getyourclientsb2b.com/pricing\n\nLet me know if your tech team has questions on integration!",
    lead: {
      id: "lead_4",
      email: "liam@outboundpro.com.au",
      first_name: "Liam",
      last_name: "O'Connor",
      company: "OutboundPro",
      title: "Founder & CEO",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  },
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

  const displayReplies = (replies && replies.length > 0) ? replies : DEFAULT_REPLIES;
  const filteredReplies = displayReplies.filter((r) => {
    if (filterClass !== "all" && r.classification !== filterClass) return false;
    return true;
  });

  const selectedReply = filteredReplies.find((r) => r.id === (selectedReplyId || filteredReplies[0]?.id)) || filteredReplies[0];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Outreach Inbox</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            AI-classified inbound prospect responses with 1-click suggested follow-ups
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyUnhandled(!onlyUnhandled)}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
              onlyUnhandled
                ? "bg-violet-600/20 text-violet-300 border-violet-500/30"
                : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white"
            )}
          >
            {onlyUnhandled ? "Showing: Needs Action" : "Showing: All Messages"}
          </button>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white transition-all"
            title="Refresh Inbox"
          >
            <RefreshCw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Classification Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CLASSIFICATIONS.map((c) => {
          const isActive = filterClass === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setFilterClass(c.id);
                setSelectedReplyId(null);
              }}
              className={clsx(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border",
                isActive
                  ? "bg-white/[0.1] text-white border-white/20 shadow-sm"
                  : "bg-white/[0.02] text-slate-400 border-white/[0.04] hover:bg-white/[0.05] hover:text-slate-200"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Main Inbox Interface */}
      {!filteredReplies || filteredReplies.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <InboxIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Inbox Zero</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {onlyUnhandled
              ? "All inbound replies have been handled! Great job keeping up with prospects."
              : "No replies match the selected filters."}
          </p>
          {onlyUnhandled && (
            <button
              onClick={() => setOnlyUnhandled(false)}
              className="mt-4 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300"
            >
              View Handled Messages
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Message List (Left Pane) */}
          <div className="lg:col-span-5 space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredReplies.map((reply) => {
              const isSelected = selectedReply?.id === reply.id;
              const classObj = CLASSIFICATIONS.find((c) => c.id === reply.classification);
              const sender = reply.lead?.email || "Prospect";
              const senderName = reply.lead?.first_name ? `${reply.lead.first_name} ${reply.lead.last_name || ""}` : sender;

              return (
                <div
                  key={reply.id}
                  onClick={() => setSelectedReplyId(reply.id)}
                  className={clsx(
                    "p-4 rounded-xl border cursor-pointer transition-all text-left space-y-2",
                    isSelected
                      ? "bg-violet-600/10 border-violet-500/40 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-white truncate">
                      {senderName} {reply.lead?.company ? `· ${reply.lead.company}` : ""}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(reply.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {reply.body || "(No message body)"}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={clsx(
                        "text-[10px] font-mono px-2 py-0.5 rounded border capitalize font-medium",
                        classObj?.color || "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}
                    >
                      {reply.classification?.replace("_", " ") || "other"}
                      {reply.confidence ? ` · ${Math.round(reply.confidence * 100)}%` : ""}
                    </span>

                    {reply.handled && (
                      <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
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
              <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-slate-500 text-xs">
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
    <div className="space-y-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
      {/* Sender Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">{senderEmail}</h3>
            <span
              className={clsx(
                "text-[10px] font-mono px-2.5 py-0.5 rounded-full border capitalize font-semibold",
                classObj?.color || "bg-slate-500/10 text-slate-400 border-slate-500/20"
              )}
            >
              {reply.classification?.replace("_", " ")} ({Math.round((reply.confidence || 0.9) * 100)}% confidence)
            </span>
          </div>
          {reply.lead && (
            <p className="text-xs text-slate-400 mt-1">
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
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm",
              reply.handled
                ? "bg-white/[0.05] text-slate-400 border border-white/[0.08]"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {reply.handled ? "Handled" : "Mark Handled"}
          </button>

          <button
            onClick={handleSuppress}
            disabled={suppressReply.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-all"
            title="Add email to suppression list"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Suppress
          </button>
        </div>
      </div>

      {/* Prospect Message Body */}
      <div>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
          Prospect Message
        </span>
        <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
          {reply.body || "(No message body)"}
        </div>
      </div>

      {/* AI Suggested Response Box */}
      <div className="p-4 rounded-xl bg-violet-600/[0.04] border border-violet-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-white">AI Suggested Response</span>
            <span className="text-[10px] text-slate-400">(Claude 3.5 Sonnet)</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-medium text-slate-300 transition-all"
          >
            <Copy className="w-3 h-3" />
            Copy Copy
          </button>
        </div>

        <textarea
          rows={5}
          value={customReply}
          onChange={(e) => setCustomReply(e.target.value)}
          className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500/50 resize-none font-sans leading-relaxed"
          placeholder="No suggested reply available for this classification."
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Review and customize before sending via your primary email client or provider.</span>
          <button
            onClick={() => {
              handleCopy();
              handleMarkHandled();
            }}
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Copy & Mark Handled
          </button>
        </div>
      </div>
    </div>
  );
}
