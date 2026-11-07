"use client";

import React, { useState, useEffect } from "react";
import {
  useConnections,
  useConnectMock,
  useDirectConnect,
  useDisconnectAccount,
} from "@/lib/hooks";
import {
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Unlink,
  Link2,
  Sparkles,
  Info,
  KeyRound,
  Copy,
  Check,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";

interface PlatformConfig {
  id: "x" | "linkedin" | "instagram" | "facebook" | "youtube";
  name: string;
  category: string;
  description: string;
  scopes: string[];
  gradient: string;
  iconBg: string;
  iconColor: string;
  officialDocUrl: string;
  defaultId?: string;
  defaultHandle?: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: "facebook",
    name: "Facebook Page",
    category: "Social Network",
    description: "Meta Graph API for publishing feed posts, links, screenshots, and updates to your verified Page.",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    gradient: "from-indigo-600/10 to-blue-700/10 border-indigo-500/20",
    iconBg: "bg-indigo-600",
    iconColor: "text-white",
    officialDocUrl: "https://developers.facebook.com/docs/pages-api",
    defaultId: "",
    defaultHandle: "GetyourclientsB2B Facebook",
  },
  {
    id: "instagram",
    name: "Instagram Business",
    category: "Visual Media",
    description: "Meta Graph API container publishing for carousels, screenshots, single images, and Reels.",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
    gradient: "from-pink-600/10 to-rose-600/10 border-pink-500/20",
    iconBg: "bg-pink-600",
    iconColor: "text-white",
    officialDocUrl: "https://developers.facebook.com/docs/instagram-api/guides/content-publishing",
    defaultId: "",
    defaultHandle: "@getyourclientsb2b",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Professional Network",
    description: "LinkedIn Posts API for publishing directly to your company / organization page.",
    scopes: ["openid", "profile", "email", "w_member_social"],
    gradient: "from-blue-600/10 to-indigo-600/10 border-blue-500/20",
    iconBg: "bg-blue-600",
    iconColor: "text-white",
    officialDocUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api",
    defaultId: "urn:li:organization:98765432",
    defaultHandle: "GetyourclientsB2B",
  },
  {
    id: "x",
    name: "X (Twitter)",
    category: "Microblogging",
    description: "Official API v2 integration with single tweets and multi-tweet thread support.",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    gradient: "from-sky-500/10 to-blue-600/10 border-sky-500/20",
    iconBg: "bg-slate-900",
    iconColor: "text-white",
    officialDocUrl: "https://developer.twitter.com/en/docs/twitter-api",
    defaultId: "1654321987654321",
    defaultHandle: "@getyourclients",
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Video Streaming",
    description: "Google Cloud YouTube Data API v3 for uploading private review videos and Shorts.",
    scopes: ["youtube.upload", "youtube.readonly"],
    gradient: "from-red-600/10 to-rose-700/10 border-red-500/20",
    iconBg: "bg-red-600",
    iconColor: "text-white",
    officialDocUrl: "https://developers.google.com/youtube/v3/docs/videos/insert",
    defaultId: "UCgetyourclientsb2b_mock",
    defaultHandle: "@getyourclientsb2b_youtube",
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com";

export default function ConnectionsPage() {
  const { data: accounts, isLoading, refetch } = useConnections();
  const connectMockMutation = useConnectMock();
  const directConnectMutation = useDirectConnect();
  const disconnectMutation = useDisconnectAccount();

  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showMetaGuide, setShowMetaGuide] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<"meta" | "linkedin" | "x" | "youtube">("meta");
  const [copiedUri, setCopiedUri] = useState<string | null>(null);

  // Direct connect modal state
  const [modalPlatform, setModalPlatform] = useState<PlatformConfig | null>(null);
  const [directExternalId, setDirectExternalId] = useState("");
  const [directHandle, setDirectHandle] = useState("");
  const [directToken, setDirectToken] = useState("");
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");
    if (connected) {
      toast.success(`Connected ${connected.toUpperCase()} account successfully!`);
      refetch();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (error) {
      toast.error(`Connection notice: ${error}`, { duration: 6000 });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [refetch]);

  const getAccountForPlatform = (platformId: string) => {
    return accounts?.find((a) => a.platform.toLowerCase() === platformId.toLowerCase());
  };

  const handleCopyUri = (uri: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedUri(uri);
    toast.success("Redirect URI copied to clipboard!");
    setTimeout(() => setCopiedUri(null), 2500);
  };

  const handleStartOAuth = async (platformId: string) => {
    setConnectingPlatform(platformId);

    // If connecting Instagram and Facebook is already connected, try direct sync
    if (platformId === "instagram") {
      const fbConnected = accounts?.some((a) => a.platform.toLowerCase() === "facebook" && a.status === "active");
      if (fbConnected) {
        try {
          const syncRes = await fetch(`${API_BASE}/api/v1/connections/instagram/sync-from-facebook`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("gr_access_token") || ""}`,
            },
          });
          if (syncRes.ok) {
            const data = await syncRes.json();
            toast.success(`Connected Instagram (${data.handle}) from Facebook Page!`);
            refetch();
            setConnectingPlatform(null);
            return;
          } else {
            const errData = await syncRes.json().catch(() => ({}));
            const errMsg = errData.detail || "Could not sync Instagram account from Facebook.";
            toast.error(errMsg, { duration: 7000 });
            refetch();
            setConnectingPlatform(null);
            return;
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to connect to server for Instagram sync.");
          setConnectingPlatform(null);
          return;
        }
      }
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/connections/${platformId}/authorize`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("gr_access_token") || ""}`,
        },
      });
      if (!res.ok) throw new Error("Could not start OAuth flow");
      const data = await res.json();
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast.error(err.message || "OAuth initialization failed. Using Sandbox/Mock mode.");
      handleQuickConnect(platformId);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleQuickConnect = async (platformId: string) => {
    const config = PLATFORMS.find((p) => p.id === platformId);
    try {
      await connectMockMutation.mutateAsync({
        platform: platformId,
        handle: config?.defaultHandle || `@getyourclientsb2b_${platformId}`,
      });
      toast.success(`Connected ${config?.name || platformId.toUpperCase()} successfully!`);
    } catch (err: any) {
      toast.error(`Connection failed: ${err.message}`);
    }
  };

  const openDirectModal = (config: PlatformConfig) => {
    setModalPlatform(config);
    const existing = getAccountForPlatform(config.id);
    const existingId = existing?.external_id && !existing.external_id.startsWith("mock_") && existing.external_id !== "108923481729012"
      ? existing.external_id
      : "";
    setDirectExternalId(existingId);
    setDirectHandle(existing?.handle || config.defaultHandle || "");
    setDirectToken("");
  };

  const handleDirectConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPlatform) return;

    if (!directToken.trim()) {
      toast.error("Please enter an Access Token or Page Token");
      return;
    }

    setIsSubmittingDirect(true);
    try {
      await directConnectMutation.mutateAsync({
        platform: modalPlatform.id,
        handle: directHandle.trim() || undefined,
        external_id: directExternalId.trim() || undefined,
        access_token: directToken.trim(),
      });
      toast.success(`Connected ${modalPlatform.name} successfully!`);

      // If Facebook was connected with a real token, attempt to auto-sync linked Instagram Business account
      if (modalPlatform.id === "facebook" && !directToken.trim().startsWith("mock_")) {
        try {
          const syncRes = await fetch(`${API_BASE}/api/v1/connections/instagram/sync-from-facebook`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("gr_access_token") || ""}`,
            },
          });
          if (syncRes.ok) {
            const data = await syncRes.json();
            toast.success(`Also linked Instagram Business account (${data.handle})!`);
          } else {
            const errData = await syncRes.json().catch(() => ({}));
            if (errData.detail) {
              toast.info(errData.detail, { duration: 6000 });
            }
          }
        } catch {
          // Instagram might not be linked to this Page
        }
      }

      refetch();
      setModalPlatform(null);
    } catch (err: any) {
      toast.error(`Direct connection failed: ${err.message}`);
    } finally {
      setIsSubmittingDirect(false);
    }
  };

  const handleDisconnect = async (accountId: string, platformName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformName}?`)) return;
    try {
      await disconnectMutation.mutateAsync(accountId);
      toast.success(`Disconnected ${platformName}`);
    } catch (err: any) {
      toast.error(`Disconnect failed: ${err.message}`);
    }
  };

  const fbAccount = getAccountForPlatform("facebook");
  const isFbConnected = !!fbAccount && fbAccount.status === "active";

  const INPUT_CLS = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all";

  return (
    <div className="relative min-h-screen p-5 md:p-8 space-y-8 max-w-6xl">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] animate-pulse-slow" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Link2 className="w-3.5 h-3.5" />
            Integrations
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Connections
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            Connect verified social accounts to publish approved posts and video assets directly via official APIs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
            <ShieldCheck className="w-3 h-3" /> Official APIs
          </span>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin text-blue-500")} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* OAuth Setup & Developer Portal Guide */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 text-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-blue-500 text-white flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">OAuth 2.0 Redirect URIs & Setup Guide</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mt-0.5">
                API Base: <span className="font-mono text-blue-600 dark:text-blue-400">{API_BASE}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMetaGuide(!showMetaGuide)}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-sm border-2 border-slate-900 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
          >
            {showMetaGuide ? "Hide Setup Guide" : "View Whitelist URLs & Dev Setup"}
            {showMetaGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showMetaGuide && (
          <div className="mt-5 pt-4 border-t-2 border-slate-900 dark:border-slate-700 space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
            {/* Guide Tabs */}
            <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
              {[
                { id: "meta", label: "Meta (FB & IG)" },
                { id: "linkedin", label: "LinkedIn" },
                { id: "x", label: "X (Twitter)" },
                { id: "youtube", label: "YouTube (Google)" },
              ].map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveGuideTab(tab.id as any)}
                  className={clsx(
                    "font-bold text-xs px-4 py-2 whitespace-nowrap transition-colors",
                    i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                    activeGuideTab === tab.id
                      ? "bg-slate-900 dark:bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Meta Guide */}
            {activeGuideTab === "meta" && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Configure Facebook Login settings in your{" "}
                  <a
                    href="https://developers.facebook.com/apps/1125229983597930/fb-login/settings/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-0.5 font-bold"
                  >
                    Meta Developer Console (App ID 1125229983597930) <ExternalLink className="w-3 h-3" />
                  </a>:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 rounded-xl p-3 space-y-2">
                  {[
                    { label: "Facebook Redirect URI:", value: `${API_BASE}/api/v1/connections/facebook/callback`, color: "text-blue-600 dark:text-blue-400" },
                    { label: "Instagram Redirect URI:", value: `${API_BASE}/api/v1/connections/instagram/callback`, color: "text-pink-600 dark:text-pink-400" },
                  ].map(({ label, value, color }) => (
                    <div key={value} className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
                      <div className="flex items-center gap-2">
                        <code className={clsx("text-[11px] font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700", color)}>
                          {value}
                        </code>
                        <button
                          onClick={() => handleCopyUri(value)}
                          className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Copy URI"
                        >
                          {copiedUri === value ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  {[
                    { title: "1. Facebook Page Requirement", body: "Meta only allows automated posting to Facebook Pages, not personal profiles. Make sure you have created a Page under your Facebook account." },
                    { title: "2. Instagram Business Requirement", body: "Instagram accounts must be a Professional/Business account linked to your Facebook Page in Meta Business Suite." },
                  ].map(({ title, body }) => (
                    <div key={title} className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-xl p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <p className="font-black text-slate-900 dark:text-white mb-1 uppercase tracking-wider">{title}</p>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LinkedIn Guide */}
            {activeGuideTab === "linkedin" && (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Configure OAuth settings in your{" "}
                  <a href="https://www.linkedin.com/developers/apps/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 inline-flex items-center gap-0.5 font-bold">
                    LinkedIn Developer Portal (Client ID: 779fkl5zbp48jc) <ExternalLink className="w-3 h-3" />
                  </a>:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Authorized Redirect URL:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] text-blue-600 dark:text-blue-400 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {`${API_BASE}/api/v1/connections/linkedin/callback`}
                      </code>
                      <button onClick={() => handleCopyUri(`${API_BASE}/api/v1/connections/linkedin/callback`)} className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        {copiedUri === `${API_BASE}/api/v1/connections/linkedin/callback` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-xl p-3 text-[11px]">
                  <p className="font-black text-slate-900 dark:text-white mb-1 uppercase tracking-wider">LinkedIn App Requirements</p>
                  <p className="text-slate-500 font-medium">Go to <strong>Auth</strong> tab → <strong>Authorized redirect URLs for your app</strong>, and paste the URL above. Under the <strong>Products</strong> tab, enable <em>&quot;Share on LinkedIn&quot;</em> and <em>&quot;Sign In with LinkedIn using OpenID Connect&quot;</em>.</p>
                </div>
              </div>
            )}

            {/* X / Twitter Guide */}
            {activeGuideTab === "x" && (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Configure User Authentication in your{" "}
                  <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noreferrer" className="text-sky-600 dark:text-sky-400 underline hover:text-sky-700 inline-flex items-center gap-0.5 font-bold">
                    X (Twitter) Developer Portal (Client ID: LTQzaGZPMFMxNGdqVHNaNjlkamY6MTpjaQ) <ExternalLink className="w-3 h-3" />
                  </a>:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 rounded-xl p-3 space-y-2">
                  {[
                    { label: "Callback / Redirect URI:", value: `${API_BASE}/api/v1/connections/x/callback`, color: "text-sky-600 dark:text-sky-400" },
                    { label: "Website URL:", value: "https://growth.getyourclientsb2b.com", color: "text-slate-600 dark:text-slate-300" },
                  ].map(({ label, value, color }) => (
                    <div key={value} className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500">{label}</span>
                      <code className={clsx("text-[11px] font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700", color)}>{value}</code>
                    </div>
                  ))}
                </div>
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-xl p-3 text-[11px]">
                  <p className="font-black text-slate-900 dark:text-white mb-1 uppercase tracking-wider">X App Authentication Settings</p>
                  <p className="text-slate-500 font-medium">Set <strong>App permissions</strong> to <em>Read and write</em>. Set <strong>Type of App</strong> to <em>Web App, Automated App or Bot</em>. Enter the Callback URI and Website URL as shown above.</p>
                </div>
              </div>
            )}

            {/* YouTube Guide */}
            {activeGuideTab === "youtube" && (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Configure OAuth 2.0 Credentials in your{" "}
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-red-600 dark:text-red-400 underline hover:text-red-700 inline-flex items-center gap-0.5 font-bold">
                    Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Authorized Redirect URI:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] text-red-600 dark:text-red-400 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {`${API_BASE}/api/v1/connections/youtube/callback`}
                      </code>
                      <button onClick={() => handleCopyUri(`${API_BASE}/api/v1/connections/youtube/callback`)} className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        {copiedUri === `${API_BASE}/api/v1/connections/youtube/callback` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Authorized JavaScript Origins:</span>
                    <div className="space-y-1 text-right">
                      {["https://growth.getyourclientsb2b.com", "https://growth-api.getyourclientsb2b.com"].map((v) => (
                        <code key={v} className="block text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{v}</code>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-xl p-3 text-[11px]">
                  <p className="font-black text-slate-900 dark:text-white mb-1 uppercase tracking-wider">Google Cloud Console Requirements</p>
                  <p className="text-slate-500 font-medium">Under <strong>APIs &amp; Services</strong> → <strong>Library</strong>, ensure <em>YouTube Data API v3</em> is enabled. Under <strong>Credentials</strong> → Edit your OAuth 2.0 Web Client, add the Authorized Javascript Origins and Authorized Redirect URI shown above.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PLATFORMS.map((plat) => {
          const account = getAccountForPlatform(plat.id);
          const isConnected = !!account && account.status === "active";
          const isExpired = account?.status === "expired";

          return (
            <div
              key={plat.id}
              className={clsx(
                "bg-white dark:bg-slate-900 border-2 rounded-2xl p-5 transition-shadow flex flex-col justify-between",
                isConnected
                  ? "border-emerald-500 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,0.5)]"
                  : "border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)]"
              )}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={clsx("w-12 h-12 rounded-xl border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]", plat.iconBg, plat.iconColor)}>
                      {plat.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{plat.name}</h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{plat.category}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isConnected ? (
                    <div className="flex items-center gap-1.5">
                      {account?.external_id?.startsWith("mock_") || account?.external_id === plat.defaultId ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 backdrop-blur-sm" title="Connected in Sandbox / Test Mode. Posts are simulated.">
                          Sandbox Mode
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live API
                        </span>
                      )}
                    </div>
                  ) : isExpired ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 backdrop-blur-sm">
                      <AlertTriangle className="w-3 h-3" />
                      Token Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/15 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300 border border-slate-400/40 backdrop-blur-sm">
                      Not Connected
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-3.5 leading-relaxed">{plat.description}</p>

                {/* Scopes & Details */}
                <div className="mt-4 pt-3 border-t-2 border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connected Account:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                      {account?.handle || "—"}
                    </span>
                  </div>

                  {account?.external_id && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account / Page ID:</span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {account.external_id}
                      </span>
                    </div>
                  )}

                  {account?.expires_at && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Token Status:</span>
                      <span className={clsx("font-mono text-[10px] font-medium", isExpired ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-500 dark:text-slate-400")}>
                        {isExpired
                          ? "Expired (Refresh required)"
                          : `Valid until ${new Date(account.expires_at).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}

                  {isExpired && (
                    <div className="mt-3 flex gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                        <span className="font-black">Session Expired on Meta:</span> Click <span className="underline">Reconnect (OAuth)</span> below to refresh, or click <span className="underline">Token / ID</span> to paste a new token.
                      </div>
                    </div>
                  )}

                  {/* Scope chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {plat.scopes.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-400/30 backdrop-blur-sm font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <a
                  href={plat.officialDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-900 dark:hover:border-slate-500 transition-all"
                >
                  Official Docs <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2 flex-wrap">
                  {isConnected && account ? (
                    <>
                      {(account?.external_id?.startsWith("mock_") || account?.external_id === plat.defaultId) && (
                        <button
                          onClick={() => openDirectModal(plat)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-blue-900 dark:border-blue-700 rounded-xl bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(30,27,75,1)] hover:shadow-[1px_1px_0px_0px_rgba(30,27,75,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all duration-100"
                          title="Replace sandbox credentials with real live Meta Page Access Token"
                        >
                          <KeyRound className="w-3 h-3" />
                          Enter Live Token
                        </button>
                      )}
                      <button
                        onClick={() => handleDisconnect(account.id, plat.name)}
                        disabled={disconnectMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-rose-900 rounded-xl bg-rose-600 text-white shadow-[2px_2px_0px_0px_rgba(136,19,55,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(136,19,55,0.8)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all duration-100 disabled:opacity-50"
                      >
                        <Unlink className="w-3 h-3" />
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Direct Page ID / Token Modal trigger */}
                      <button
                        onClick={() => openDirectModal(plat)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-slate-500 transition-all"
                        title="Connect directly with Page ID & Access Token"
                      >
                        <KeyRound className="w-3 h-3" />
                        Token / ID
                      </button>

                      {/* Disconnect button for expired account */}
                      {account && (
                        <button
                          onClick={() => handleDisconnect(account.id, plat.name)}
                          disabled={disconnectMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-rose-900 rounded-xl bg-rose-600 text-white shadow-[2px_2px_0px_0px_rgba(136,19,55,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(136,19,55,0.8)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100 disabled:opacity-50"
                          title="Remove expired connection"
                        >
                          <Unlink className="w-3 h-3" />
                          Disconnect
                        </button>
                      )}

                      {/* 1-Click Quick Connect */}
                      <button
                        onClick={() => handleQuickConnect(plat.id)}
                        disabled={connectMockMutation.isPending}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-slate-500 transition-all"
                        title="1-click connect with verified GetyourclientsB2B test account"
                      >
                        1-Click Connect
                      </button>

                      {/* Primary OAuth Connect Button */}
                      <button
                        onClick={() => handleStartOAuth(plat.id)}
                        disabled={connectingPlatform === plat.id}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                      >
                        <Link2 className="w-3 h-3" />
                        {connectingPlatform === plat.id
                          ? "Connecting..."
                          : isExpired
                          ? "Reconnect (OAuth)"
                          : plat.id === "instagram" && isFbConnected
                          ? "Sync from FB"
                          : "Connect (OAuth)"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Connect / Token Modal */}
      {modalPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_0px_rgba(99,102,241,0.5)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={clsx("w-10 h-10 rounded-xl border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]", modalPlatform.iconBg, modalPlatform.iconColor)}>
                  {modalPlatform.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Direct Connect: {modalPlatform.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Connect immediately using a Page ID / Access Token or 1-click test mode.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalPlatform(null)}
                className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-900 dark:hover:border-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-click fill button */}
            <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 border border-blue-200 dark:border-blue-500/30 rounded-xl items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Testing / Sandbox Mode</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Connect immediately with verified @getyourclientsb2b credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDirectExternalId(modalPlatform.defaultId || "108923481729012");
                  setDirectHandle(modalPlatform.defaultHandle || `@getyourclientsb2b_${modalPlatform.id}`);
                  setDirectToken(`mock_token_${modalPlatform.id}_live_ready`);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold text-xs border-2 border-blue-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(30,27,75,1)] hover:shadow-[1px_1px_0px_0px_rgba(30,27,75,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100 shrink-0"
              >
                Autofill Test Data
              </button>
            </div>

            <form onSubmit={handleDirectConnectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  {modalPlatform.id === "facebook" ? "Facebook Page ID (Numeric)" : modalPlatform.id === "instagram" ? "Instagram Business Account ID (Numeric)" : "Account / Page ID"}
                </label>
                <input
                  type="text"
                  value={directExternalId}
                  onChange={(e) => setDirectExternalId(e.target.value)}
                  placeholder={modalPlatform.id === "facebook" ? "Leave blank to auto-detect from token" : "e.g. numeric ID"}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                />
                <p className="text-[10px] font-medium text-slate-500 mt-1">
                  {modalPlatform.id === "facebook" && "Must be a Facebook Page ID (not personal profile). Leave blank to auto-detect from your token."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Display Handle / Page Name
                </label>
                <input
                  type="text"
                  value={directHandle}
                  onChange={(e) => setDirectHandle(e.target.value)}
                  placeholder={modalPlatform.defaultHandle || "e.g. @getyourclientsb2b"}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Access Token / Page Token <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={directToken}
                  onChange={(e) => setDirectToken(e.target.value)}
                  placeholder="Paste Meta Page Access Token (from Graph API Explorer or Meta Business Suite) or test token..."
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none font-mono"
                />
                <p className="text-[10px] font-medium text-slate-500 mt-1">
                  Tokens are encrypted at rest with Fernet. Real tokens are auto-verified against Meta Graph API.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t-2 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalPlatform(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDirect}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  {isSubmittingDirect ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Connecting...</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Save & Connect</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
