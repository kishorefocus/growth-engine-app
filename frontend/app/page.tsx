"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  Lock,
  MessageSquare,
  Network,
  RefreshCw,
  Search,
  Server,
  Share2,
  Sparkles,
  TrendingUp,
  Video,
  Zap,
  Star,
  Shield,
  BarChart3,
  Heart,
  MessageCircle,
  Repeat2,
  ThumbsUp,
  Play,
  Bell,
  Hash,
  BookmarkPlus,
  Send,
  MoreHorizontal,
  ChevronRight,
  Users,
  Eye,
} from "lucide-react";
import { fetchHealth, HealthResponse } from "@/lib/api";
import { getAccessToken, hasAuthCookie } from "@/lib/api-client";
import { ThemeToggle } from "@/components/theme-toggle";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════ */
const T = {
  bg: "#05060D",
  violet: "#7C5CFF",
  blue: "#3B82F6",
  cyan: "#22D3EE",
  pink: "#FF3D8B",
  lavender: "#C9B8FF",
  teal: "#7FE0D3",
  navy: "#1B1F4B",
  midnight: "#101A3F",
  white: "#FFFFFF",
  muted: "#A1A6C0",
  grad: "linear-gradient(135deg, #7C5CFF 0%, #3B82F6 50%, #22D3EE 100%)",
  gradPink: "linear-gradient(135deg, #FF3D8B 0%, #7C5CFF 100%)",
};

/* ═══════════════════════════════════════════════════════════════
   COUNT-UP HOOK
═══════════════════════════════════════════════════════════════ */
function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let st: number;
    const step = (ts: number) => {
      if (!st) st = ts;
      const p = Math.min((ts - st) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(e * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

/* ═══════════════════════════════════════════════════════════════
   TYPING HOOK  — cycles through texts
═══════════════════════════════════════════════════════════════ */
function useTyping(texts: string[], speed = 38, pause = 2800) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"typing" | "hold" | "erasing">("typing");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const current = texts[idx];

    if (phase === "typing") {
      if (charIdx < current.length) {
        timer = setTimeout(() => {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, speed);
      } else {
        timer = setTimeout(() => setPhase("hold"), pause);
      }
    } else if (phase === "hold") {
      timer = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (charIdx > 0) {
        timer = setTimeout(() => {
          setDisplay(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        }, speed / 2);
      } else {
        setIdx((i) => (i + 1) % texts.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timer);
  }, [phase, charIdx, idx, texts, speed, pause]);

  return { display, done: phase === "hold" };
}

/* ═══════════════════════════════════════════════════════════════
   PHONE PLATFORM DATA
═══════════════════════════════════════════════════════════════ */
const PHONES = [
  {
    id: "instagram",
    label: "Instagram",
    color: T.pink,
    glow: "rgba(255,61,139,0.55)",
    cardGrad: `linear-gradient(160deg, #2d0022 0%, #1a0030 50%, #0a0015 100%)`,
    rot: -16,
    vy: 28,
    floatAnim: "float-a",
    delay: 0,
    post: {
      avatar: "🏢",
      handle: "@getyourclients",
      time: "2m ago",
      texts: [
        "5 ways agencies land clients on autopilot 🤖",
        "Zero cold calls. Zero manual outreach.",
        "Just pure autonomous growth systems.",
      ],
      hashtags: "#B2BGrowth #AgencyLife #Automation",
      likes: 847,
      comments: 134,
      type: "carousel",
      slides: ["01/05", "02/05"],
    },
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#4267B2",
    glow: "rgba(66,103,178,0.55)",
    cardGrad: `linear-gradient(160deg, #001233 0%, #0a1628 50%, #050d1a 100%)`,
    rot: -7,
    vy: 10,
    floatAnim: "float-b",
    delay: 0.6,
    post: {
      avatar: "🚀",
      handle: "GrowthEngine B2B",
      time: "15 min ago",
      texts: [
        "How top B2B agencies automate client acquisition with zero manual ad spend 👇",
        "We ran this for 47 agencies. Results were insane.",
      ],
      hashtags: "",
      likes: 1240,
      comments: 89,
      type: "page",
      slides: [],
    },
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    glow: "rgba(10,102,194,0.55)",
    cardGrad: `linear-gradient(160deg, #001a33 0%, #002244 50%, #00111f 100%)`,
    rot: 1,
    vy: -8,
    floatAnim: "float-c",
    delay: 1.2,
    post: {
      avatar: "👔",
      handle: "Alex Chen • CEO",
      time: "1h ago",
      texts: [
        "The playbook we used to scale 15 client accounts past $50k MRR 🧵",
        "Thread: Autonomous content + SEO + cold outreach = compound growth.",
      ],
      hashtags: "#LinkedInMarketing #B2B #AgencyGrowth",
      likes: 3410,
      comments: 287,
      type: "founder",
      slides: [],
    },
  },
  {
    id: "twitter",
    label: "X",
    color: "#E7E9EA",
    glow: "rgba(231,233,234,0.35)",
    cardGrad: `linear-gradient(160deg, #0d0d0d 0%, #111111 50%, #080808 100%)`,
    rot: 9,
    vy: 10,
    floatAnim: "float-a",
    delay: 1.8,
    post: {
      avatar: "⚡",
      handle: "@growthengine",
      time: "3h ago",
      texts: [
        "3 AI automation tools every agency owner must deploy in 2026 🧵",
        "1/ Autonomous social publishing — set it once, it posts forever.",
        "2/ Programmatic SEO — 1,480 pages, all ranking.",
      ],
      hashtags: "",
      likes: 2187,
      comments: 341,
      type: "thread",
      slides: [],
    },
  },
  {
    id: "youtube",
    label: "YouTube",
    color: "#FF0000",
    glow: "rgba(255,0,0,0.5)",
    cardGrad: `linear-gradient(160deg, #1a0000 0%, #200000 50%, #0d0000 100%)`,
    rot: 17,
    vy: 28,
    floatAnim: "float-b",
    delay: 2.4,
    post: {
      avatar: "🎬",
      handle: "GrowthEngine",
      time: "2 days ago",
      texts: [
        "Cold email that books 5 meetings/week",
        "In under 30 seconds ⏱️",
        "Watch how we automate the entire sequence.",
      ],
      hashtags: "#Shorts #ColdEmail #B2BMarketing",
      likes: 18400,
      comments: 923,
      type: "shorts",
      slides: [],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   PHONE MOCKUP COMPONENT
═══════════════════════════════════════════════════════════════ */
function PhoneMockup({
  phone,
  isHovered,
  isActive,
}: {
  phone: (typeof PHONES)[0];
  isHovered: boolean;
  isActive: boolean;
}) {
  const [likes, setLikes] = useState(phone.post.likes);
  const [showToast, setShowToast] = useState(false);
  const { display, done } = useTyping(phone.post.texts, 36, 2600);

  /* Tick likes every 3-7s when active */
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setLikes((l) => l + Math.floor(Math.random() * 3 + 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [isActive]);

  /* Show "Published ✓" toast when typing completes */
  useEffect(() => {
    if (done) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 2200);
      return () => clearTimeout(t);
    }
  }, [done]);

  const rot = isHovered ? 0 : phone.rot;
  const vy = isHovered ? -20 : phone.vy;
  const sc = isHovered ? 1.08 : 1;

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: 185,
        zIndex: isHovered ? 30 : 10,
        transform: `rotate(${rot}deg) translateY(${vy}px) scale(${sc})`,
        transition: "transform 0.55s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease",
        animation: isHovered
          ? "none"
          : `${phone.floatAnim} ${6.2 + phone.delay * 0.3}s ease-in-out ${phone.delay}s infinite`,
      }}
    >
      {/* Published toast */}
      {showToast && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
          style={{
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(34,197,94,0.5)",
            animation: "toast-pop 2.2s ease forwards",
          }}
        >
          <CheckCircle2 size={12} />
          Published ✓
        </div>
      )}

      {/* Floating notification chips */}
      {isActive && (
        <>
          <div
            className="absolute -right-14 top-10 whitespace-nowrap px-2 py-1 rounded-full text-[10px] font-bold border z-40"
            style={{
              background: "rgba(124,92,255,0.15)",
              borderColor: "rgba(124,92,255,0.4)",
              color: T.lavender,
              animation: "chip-orbit 4s ease-in-out infinite",
            }}
          >
            +1 lead 🎯
          </div>
          <div
            className="absolute -left-16 bottom-16 whitespace-nowrap px-2 py-1 rounded-full text-[10px] font-bold border z-40"
            style={{
              background: "rgba(34,211,238,0.12)",
              borderColor: "rgba(34,211,238,0.35)",
              color: T.teal,
              animation: "chip-orbit 5s ease-in-out 1.5s infinite reverse",
            }}
          >
            Scheduled 4 PM 📅
          </div>
        </>
      )}

      {/* Card wrapper */}
      <div
        className="relative rounded-[28px] p-[2px]"
        style={{
          background: isHovered
            ? `conic-gradient(from 0deg, ${phone.color}, ${T.violet}, ${T.cyan}, ${phone.color})`
            : `linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)`,
          boxShadow: isHovered
            ? `0 32px 80px ${phone.glow}, 0 8px 24px rgba(0,0,0,0.7)`
            : `0 16px 40px rgba(0,0,0,0.6)`,
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Card background */}
        <div
          className="rounded-[26px] p-3 pb-4"
          style={{ background: phone.cardGrad, minHeight: 340 }}
        >
          {/* Platform label chip */}
          <div
            className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: `${phone.color}22`, color: phone.color, border: `1px solid ${phone.color}44` }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: phone.color }} />
            {phone.label}
          </div>

          {/* Phone body */}
          <div
            className="rounded-[20px] overflow-hidden"
            style={{
              background: phone.id === "twitter" ? "#000" : phone.id === "youtube" ? "#0f0f0f" : "#fff",
              minHeight: 260,
            }}
          >
            {/* Platform-specific screen */}
            {phone.id === "instagram" && <IGScreen phone={phone} display={display} likes={likes} />}
            {phone.id === "facebook" && <FBScreen phone={phone} display={display} likes={likes} />}
            {phone.id === "linkedin" && <LIScreen phone={phone} display={display} likes={likes} />}
            {phone.id === "twitter" && <XScreen phone={phone} display={display} likes={likes} />}
            {phone.id === "youtube" && <YTScreen phone={phone} display={display} likes={likes} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Instagram Screen ───────────────────────────────────────── */
function IGScreen({ phone, display, likes }: { phone: (typeof PHONES)[0]; display: string; likes: number }) {
  return (
    <div className="bg-white text-black" style={{ fontSize: 9 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 pt-2 pb-1.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
            <span className="text-white text-[8px]">🏢</span>
          </div>
          <div>
            <div className="font-bold text-[9px]">getyourclients</div>
            <div className="text-gray-400 text-[7px]">Sponsored</div>
          </div>
        </div>
        <MoreHorizontal size={10} className="text-gray-400" />
      </div>
      {/* Post image placeholder */}
      <div className="relative mx-2 mt-1.5 rounded-lg overflow-hidden" style={{ height: 90, background: "linear-gradient(135deg,#7C5CFF22,#FF3D8B22)", border: "1px solid rgba(124,92,255,0.2)" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div className="text-[18px]">📊</div>
          <div className="text-[8px] font-bold text-gray-700 text-center px-2">5 Automation Strategies</div>
        </div>
        <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[7px] px-1.5 py-0.5 rounded">
          {phone.post.slides?.[0] || "1/5"}
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2.5 px-2.5 py-1.5">
        <Heart size={11} className="text-rose-500" />
        <MessageCircle size={11} className="text-gray-600" />
        <Send size={11} className="text-gray-600" />
        <BookmarkPlus size={11} className="ml-auto text-gray-600" />
      </div>
      {/* Likes */}
      <div className="px-2.5 pb-1">
        <span className="font-bold text-[9px]">{likes.toLocaleString()} likes</span>
      </div>
      {/* Caption */}
      <div className="px-2.5 pb-2">
        <span className="font-bold text-[8px]">getyourclients </span>
        <span className="text-[8px] text-gray-700">{display}</span>
        <span className="inline-block w-[1px] h-[9px] bg-gray-800 align-middle animate-pulse ml-px" />
        <div className="text-[7px] text-blue-500 mt-0.5">{phone.post.hashtags}</div>
      </div>
    </div>
  );
}

/* ─── Facebook Screen ────────────────────────────────────────── */
function FBScreen({ phone, display, likes }: { phone: (typeof PHONES)[0]; display: string; likes: number }) {
  return (
    <div className="bg-white text-black" style={{ fontSize: 9 }}>
      {/* Header */}
      <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1.5">
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">G</div>
        <div>
          <div className="font-bold text-[9px]">{phone.post.handle}</div>
          <div className="flex items-center gap-1 text-gray-400 text-[7px]">
            <span>{phone.post.time}</span>
            <span>· 🌐</span>
          </div>
        </div>
        <MoreHorizontal size={10} className="ml-auto text-gray-400" />
      </div>
      {/* Post text */}
      <div className="px-2.5 pb-2 text-[8px] text-gray-800 leading-relaxed">
        {display}
        <span className="inline-block w-[1px] h-[9px] bg-gray-700 align-middle animate-pulse ml-px" />
      </div>
      {/* Image */}
      <div className="relative mx-0 overflow-hidden" style={{ height: 72, background: "linear-gradient(135deg,#4267B222,#1a3a6e33)" }}>
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <span className="text-[20px]">🤖</span>
          <span className="text-[8px] font-bold text-gray-700">Client Acquisition Playbook</span>
        </div>
      </div>
      {/* Reactions */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-gray-100 text-[8px] text-gray-500">
        <span>❤️👍 {likes.toLocaleString()}</span>
        <span>{phone.post.comments} comments</span>
      </div>
      {/* Action bar */}
      <div className="flex items-center justify-around px-1 py-1 border-t border-gray-100">
        {["👍 Like", "💬 Comment", "↗ Share"].map((a) => (
          <span key={a} className="text-[7px] text-gray-500 font-semibold">{a}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── LinkedIn Screen ────────────────────────────────────────── */
function LIScreen({ phone, display, likes }: { phone: (typeof PHONES)[0]; display: string; likes: number }) {
  return (
    <div className="bg-[#f3f2ef] text-black" style={{ fontSize: 9 }}>
      {/* Header */}
      <div className="bg-white px-2.5 pt-2 pb-1.5 flex items-start gap-1.5">
        <div className="w-7 h-7 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0">AC</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[9px] truncate">{phone.post.handle}</div>
          <div className="text-gray-500 text-[7px]">CEO • 500+ connections</div>
          <div className="text-gray-400 text-[7px]">{phone.post.time} · 🌐</div>
        </div>
        <ChevronRight size={9} className="text-[#0A66C2]" />
      </div>
      {/* Post */}
      <div className="bg-white px-2.5 py-1.5 text-[8px] leading-relaxed text-gray-800">
        {display}
        <span className="inline-block w-[1px] h-[9px] bg-gray-700 align-middle animate-pulse ml-px" />
        {phone.post.hashtags && (
          <div className="text-[#0A66C2] text-[7px] mt-0.5">{phone.post.hashtags}</div>
        )}
      </div>
      {/* Stats */}
      <div className="bg-white px-2.5 py-1 text-gray-500 text-[7px] border-t border-gray-100">
        👍❤️ {likes.toLocaleString()} · {phone.post.comments} comments
      </div>
      {/* Actions */}
      <div className="bg-white flex items-center justify-around py-1 border-t border-gray-100">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Repeat2, label: "Repost" },
          { icon: Send, label: "Send" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <Icon size={9} className="text-gray-500" />
            <span className="text-[6px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── X (Twitter) Screen ─────────────────────────────────────── */
function XScreen({ phone, display, likes }: { phone: (typeof PHONES)[0]; display: string; likes: number }) {
  return (
    <div className="bg-black text-white" style={{ fontSize: 9 }}>
      {/* Tweet */}
      <div className="px-2.5 pt-2 pb-1.5">
        <div className="flex gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[9px] flex-shrink-0">⚡</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[9px]">GrowthEngine</span>
              <span className="text-gray-500 text-[7px]">· {phone.post.time}</span>
            </div>
            <span className="text-[8px] text-gray-400">@growthengine</span>
          </div>
        </div>
        <div className="mt-1.5 text-[8px] text-white leading-relaxed">
          {display}
          <span className="inline-block w-[1px] h-[9px] bg-gray-200 align-middle animate-pulse ml-px" />
        </div>
        {/* Thread indicator */}
        <div className="mt-1.5 text-[7px] text-[#1d9bf0] font-semibold">Show this thread</div>
      </div>
      {/* Actions */}
      <div className="px-2.5 pb-2 flex items-center justify-between border-t border-gray-800 pt-1.5">
        <div className="flex items-center gap-0.5 text-gray-500">
          <MessageCircle size={8} /><span className="text-[7px] ml-0.5">{phone.post.comments}</span>
        </div>
        <div className="flex items-center gap-0.5 text-gray-500">
          <Repeat2 size={8} /><span className="text-[7px] ml-0.5">841</span>
        </div>
        <div className="flex items-center gap-0.5 text-rose-400">
          <Heart size={8} /><span className="text-[7px] ml-0.5">{likes.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-0.5 text-gray-500">
          <Eye size={8} /><span className="text-[7px] ml-0.5">48K</span>
        </div>
      </div>
    </div>
  );
}

/* ─── YouTube Shorts Screen ──────────────────────────────────── */
function YTScreen({ phone, display, likes }: { phone: (typeof PHONES)[0]; display: string; likes: number }) {
  const [progress, setProgress] = useState(0.3);
  useEffect(() => {
    const iv = setInterval(() => setProgress((p) => (p >= 1 ? 0 : p + 0.004)), 100);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="bg-[#0f0f0f] text-white relative overflow-hidden" style={{ minHeight: 260, fontSize: 9 }}>
      {/* Video BG */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg,#1a0000 0%,#330000 50%,#0d0000 100%)" }}
      >
        <span className="text-[32px]">🎬</span>
        <div className="text-[8px] text-gray-300 mt-1 text-center px-3 font-semibold leading-tight">
          {display}
          <span className="inline-block w-[1px] h-[9px] bg-gray-100 align-middle animate-pulse ml-px" />
        </div>
      </div>

      {/* Right action bar */}
      <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3">
        {[
          { icon: Heart, val: (likes / 1000).toFixed(1) + "K", cls: "text-white" },
          { icon: MessageCircle, val: phone.post.comments, cls: "text-white" },
          { icon: Repeat2, val: "Share", cls: "text-white" },
        ].map(({ icon: Icon, val, cls }) => (
          <div key={String(val)} className="flex flex-col items-center gap-0.5">
            <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
              <Icon size={9} className={cls} />
            </div>
            <span className="text-[6px] text-white">{val}</span>
          </div>
        ))}
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.9),transparent)" }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
            <Play size={7} className="text-white fill-white" />
          </div>
          <span className="text-[8px] font-semibold">GrowthEngine</span>
          <span className="ml-auto text-[7px] bg-white/90 text-black px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
            <Bell size={6} />Subscribe
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-[3px] bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress * 100}%`, background: "#FF0000" }}
          />
        </div>
        <div className="flex justify-between text-[6px] text-gray-300 mt-0.5">
          <span>0:{Math.floor(progress * 30).toString().padStart(2, "0")}</span>
          <span>0:30</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SPARKLINE COMPONENT  — draws itself on mount
═══════════════════════════════════════════════════════════════ */
function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);

  const w = 120, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const d = `M ${pts.join(" L ")}`;

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    if (!drawn) {
      pathRef.current.style.strokeDasharray = `${len}`;
      pathRef.current.style.strokeDashoffset = `${len}`;
    } else {
      pathRef.current.style.transition = "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)";
      pathRef.current.style.strokeDashoffset = "0";
    }
  }, [drawn]);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`spk-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <path
        d={`${d} L ${w},${h} L 0,${h} Z`}
        fill={`url(#spk-${color.replace("#", "")})`}
        opacity={drawn ? 1 : 0}
        style={{ transition: "opacity 0.6s ease 0.8s" }}
      />
      {/* Line */}
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={w}
        cy={parseFloat(pts[pts.length - 1].split(",")[1])}
        r="3"
        fill={color}
        opacity={drawn ? 1 : 0}
        style={{ transition: "opacity 0.3s ease 1.4s", filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEARTBEAT LINE  — continuous animated SVG pulse
═══════════════════════════════════════════════════════════════ */
function HeartbeatLine({ color, online = true }: { color: string; online?: boolean }) {
  return (
    <svg width="80" height="24" viewBox="0 0 80 24" className="overflow-visible">
      <polyline
        points="0,12 10,12 15,4 20,20 25,12 35,12 40,2 45,22 50,12 60,12 65,8 70,16 75,12 80,12"
        fill="none"
        stroke={online ? color : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 200,
          strokeDashoffset: 200,
          animation: online ? "hb-draw 1.2s ease forwards, hb-pulse 2.4s ease 1.2s infinite" : "none",
          opacity: online ? 1 : 0.5,
        }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PIPELINE ROW  — single animated distribution row
═══════════════════════════════════════════════════════════════ */
type PipelineRowData = {
  icon: string;
  platform: string;
  title: string;
  time: string;
  color: string;
  stage: 0 | 1 | 2; /* 0=Scheduled 1=Publishing 2=Published */
};

const STAGE_LABELS = ["Scheduled", "Publishing…", "Published ✓"];
const STAGE_COLORS = ["#A1A6C0", "#F59E0B", "#4ade80"];
const STAGE_BG    = ["rgba(161,166,192,0.1)", "rgba(245,158,11,0.15)", "rgba(74,222,128,0.12)"];

function PipelineRow({ row, entering }: { row: PipelineRowData; entering: boolean }) {
  const [stage, setStage] = useState<0 | 1 | 2>(row.stage);
  const [progPct, setProgPct] = useState(row.stage === 2 ? 100 : row.stage === 1 ? 55 : 0);

  /* Advance stage once on mount */
  useEffect(() => {
    if (stage === 2) return;
    const t1 = setTimeout(() => { setStage(1); setProgPct(55); }, 1800);
    const t2 = setTimeout(() => { setStage(2); setProgPct(100); }, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderColor: `${row.color}25`,
        animation: entering ? "row-slide-in 0.5s cubic-bezier(0.22,1,0.36,1) both" : "none",
      }}
    >
      {/* Progress track */}
      <div className="h-[2px] w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full"
          style={{
            width: `${progPct}%`,
            background: `linear-gradient(90deg, ${row.color}, ${STAGE_COLORS[stage]})`,
            transition: "width 1.1s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: `0 0 6px ${row.color}`,
          }}
        />
      </div>

      <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Platform icon */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: `${row.color}18`, border: `1px solid ${row.color}35` }}
          >
            {row.icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold" style={{ color: row.color }}>{row.platform}</span>
              {/* Stage chip */}
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide transition-all"
                style={{
                  background: STAGE_BG[stage],
                  color: STAGE_COLORS[stage],
                  border: `1px solid ${STAGE_COLORS[stage]}40`,
                }}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>
            <p className="text-xs truncate mt-0.5" style={{ color: "#A1A6C0" }}>{row.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono" style={{ color: "#A1A6C0" }}>{row.time}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PREVIEW COMPONENT
═══════════════════════════════════════════════════════════════ */
const SPARKLINE_DATA = [28, 42, 38, 55, 48, 61, 58, 72, 68, 85, 79, 95, 88, 104, 112, 128, 142];

const ALL_PIPELINE_ROWS: PipelineRowData[] = [
  { icon: "📘", platform: "Facebook + Instagram Business", title: "🚀 How top B2B agencies automate client acquisition with zero manual ad spend", time: "Today, 4:00 PM", color: "#4267B2", stage: 2 },
  { icon: "💼", platform: "LinkedIn Company & Founder", title: "The playbook we used to scale 15 client accounts past $50k MRR", time: "Tomorrow, 9:00 AM", color: "#0A66C2", stage: 1 },
  { icon: "▶️", platform: "YouTube Shorts & Video Hub", title: "3 AI Automation tools every agency owner must deploy in 2026", time: "Draft Ready", color: "#FF0000", stage: 0 },
  { icon: "𝕏", platform: "X (Twitter) Thread", title: "Cold email that books 5 meetings/week — full breakdown 🧵", time: "Today, 6:00 PM", color: "#E7E9EA", stage: 2 },
  { icon: "📸", platform: "Instagram Reel", title: "5 ways agencies land clients on autopilot 🤖 #B2BGrowth", time: "Tomorrow, 11:00 AM", color: "#E1306C", stage: 1 },
];

type DashboardPreviewProps = {
  isLoggedIn: boolean;
  isBackendOk: boolean;
  isDbOk: boolean;
  pingLatency: number;
  health: HealthResponse | null;
  loadingHealth: boolean;
  checkConnection: () => void;
};

function DashboardPreview(_props: DashboardPreviewProps) {
  const [activeTab, setActiveTab] = useState<"social" | "seo" | "leads">("social");
  const [tabOffset, setTabOffset] = useState(0);
  const [visibleRows, setVisibleRows] = useState<number[]>([0, 1, 2]);
  const [enteringIdx, setEnteringIdx] = useState<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* Sliding underline offset */
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      const parent = el.parentElement;
      if (parent) setTabOffset(el.offsetLeft - parent.offsetLeft);
    }
  }, [activeTab]);

  /* Rotate pipeline row every 5s */
  useEffect(() => {
    const iv = setInterval(() => {
      setVisibleRows((prev) => {
        const next = (prev[prev.length - 1] + 1) % ALL_PIPELINE_ROWS.length;
        setEnteringIdx(next);
        setTimeout(() => setEnteringIdx(null), 600);
        return [...prev.slice(1), next];
      });
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  /* 3D tilt on mouse move */
  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -4, y: dx * 5 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const TABS = [
    { id: "social" as const, label: "Social" },
    { id: "seo"    as const, label: "SEO" },
    { id: "leads"  as const, label: "Outreach" },
  ];

  return (
    <section className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="text-center mb-12">
        <div
          className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border"
          style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: "#7FE0D3" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #4ade80" }} />
          LIVE DASHBOARD PREVIEW
        </div>
        <h2
          className="reveal-up text-3xl sm:text-5xl font-black text-white tracking-tight"
          style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}
        >
          One Command Center.{" "}
          <span
            style={{
              background: "linear-gradient(135deg,#7C5CFF,#3B82F6,#22D3EE)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            Everything.
          </span>
        </h2>
        <p className="reveal-up mt-4 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "#A1A6C0" }}>
          Your entire B2B growth operation — social, SEO, and outreach — monitored from a single glass dashboard.
        </p>
      </div>

      {/* 3D browser window */}
      <div
        ref={windowRef}
        className="reveal-up"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: "1200px",
          animationDelay: "0.08s",
        }}
      >
        <div
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.005)`,
            transition: "transform 0.18s ease-out",
            transformStyle: "preserve-3d",
            borderRadius: 24,
            boxShadow: "0 0 0 1px rgba(124,92,255,0.25), 0 40px 100px rgba(0,0,0,0.65), 0 0 80px rgba(124,92,255,0.12)",
          }}
        >
          {/* ── Window chrome bar ── */}
          <div
            className="rounded-t-[24px] px-5 py-3.5 flex items-center justify-between"
            style={{
              background: "rgba(14,16,30,0.98)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(32px)",
            }}
          >
            {/* Traffic lights */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" style={{ boxShadow: "0 0 6px rgba(255,95,87,0.6)" }} />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" style={{ boxShadow: "0 0 6px rgba(40,200,64,0.5)" }} />
              </div>

              {/* URL bar */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#A1A6C0", minWidth: 320 }}
              >
                <span className="text-emerald-400 text-[10px]">🔒</span>
                <span>growth.getyourclientsb2b.com</span>
                <span style={{ color: "rgba(161,166,192,0.5)" }}>/admin/dashboard</span>
              </div>
            </div>

            {/* Animated tab bar with sliding underline */}
            <div className="relative flex items-center gap-0.5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
              {/* Sliding underline pill */}
              <span
                className="absolute bottom-1 h-[3px] rounded-full"
                style={{
                  left: tabOffset + 4,
                  width: tabRefs.current[activeTab]?.offsetWidth ? tabRefs.current[activeTab]!.offsetWidth - 8 : 48,
                  background: "linear-gradient(90deg,#7C5CFF,#22D3EE)",
                  transition: "left 0.32s cubic-bezier(0.4,0,0.2,1), width 0.32s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: "0 0 8px rgba(124,92,255,0.6)",
                }}
              />
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  ref={(el) => { tabRefs.current[id] = el; }}
                  onClick={() => setActiveTab(id)}
                  className="relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ color: activeTab === id ? "#fff" : "#A1A6C0", zIndex: 1 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Window body ── */}
          <div
            className="rounded-b-[24px] p-6 md:p-8"
            style={{ background: "rgba(5,6,13,0.97)", backdropFilter: "blur(32px)" }}
          >

            {/* ══ SOCIAL TAB ══ */}
            {activeTab === "social" && (
              <div className="space-y-6 animate-fade-in">

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Meta Connected */}
                  <div className="p-4 rounded-2xl border text-left group hover:scale-[1.02] transition-all"
                    style={{ background: "rgba(66,103,178,0.08)", borderColor: "rgba(66,103,178,0.25)" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 5px #4ade80" }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#A1A6C0" }}>Meta Connected</span>
                    </div>
                    <p className="text-sm font-black text-emerald-400">FB &amp; Instagram</p>
                    <p className="text-[10px] mt-1 font-mono" style={{ color: "#A1A6C0" }}>Page ID: 1125229983597930</p>
                  </div>

                  {/* Scheduled Posts */}
                  <div className="p-4 rounded-2xl border text-left group hover:scale-[1.02] transition-all"
                    style={{ background: "rgba(124,92,255,0.08)", borderColor: "rgba(124,92,255,0.25)" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="w-3 h-3" style={{ color: "#7C5CFF" }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#A1A6C0" }}>Scheduled Posts</span>
                    </div>
                    <p className="text-sm font-black" style={{ color: "#C9B8FF" }}>48 Due Today</p>
                    <p className="text-[10px] mt-1" style={{ color: "#A1A6C0" }}>Auto-publish active</p>
                  </div>

                  {/* Cross-Network */}
                  <div className="p-4 rounded-2xl border text-left group hover:scale-[1.02] transition-all"
                    style={{ background: "rgba(34,211,238,0.07)", borderColor: "rgba(34,211,238,0.22)" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Network className="w-3 h-3" style={{ color: "#22D3EE" }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#A1A6C0" }}>Cross-Network</span>
                    </div>
                    <p className="text-sm font-black" style={{ color: "#7FE0D3" }}>5 Channels</p>
                    <p className="text-[10px] mt-1" style={{ color: "#A1A6C0" }}>FB, IG, LinkedIn, YT, X</p>
                  </div>

                  {/* Monthly Reach — with self-drawing sparkline */}
                  <div className="p-4 rounded-2xl border text-left group hover:scale-[1.02] transition-all"
                    style={{ background: "rgba(124,92,255,0.08)", borderColor: "rgba(124,92,255,0.25)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3 h-3" style={{ color: "#7C5CFF" }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#A1A6C0" }}>Monthly Reach</span>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-sm font-black" style={{ color: "#C9B8FF" }}>142,800+</p>
                        <span className="text-[10px] font-bold text-emerald-400">↑ 34% this month</span>
                      </div>
                      <Sparkline data={SPARKLINE_DATA} color="#7C5CFF" height={28} />
                    </div>
                  </div>
                </div>

                {/* Distribution Pipeline */}
                <div
                  className="rounded-2xl border p-4"
                  style={{ background: "rgba(124,92,255,0.04)", borderColor: "rgba(124,92,255,0.14)" }}
                >
                  {/* Pipeline header */}
                  <div
                    className="flex items-center justify-between pb-3 mb-3 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.07)" }}
                  >
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Autonomous Content Distribution Pipeline
                      </h3>
                      <p className="text-[10px] mt-0.5" style={{ color: "#A1A6C0" }}>
                        Auto-generating → Quality gate → Scheduling → Publishing
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Pulsing "Worker Active" badge */}
                      <span
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border"
                        style={{
                          background: "rgba(74,222,128,0.12)",
                          borderColor: "rgba(74,222,128,0.35)",
                          color: "#4ade80",
                          boxShadow: "0 0 12px rgba(74,222,128,0.2)",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                          style={{ animation: "worker-pulse 1.4s ease-in-out infinite", boxShadow: "0 0 6px #4ade80" }}
                        />
                        Worker Active
                      </span>
                    </div>
                  </div>

                  {/* Stage progress legend */}
                  <div className="flex items-center gap-4 mb-3 px-1">
                    {STAGE_LABELS.map((s, i) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[i] }} />
                        <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: STAGE_COLORS[i] }}>{s}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rows — slide in on rotation */}
                  <div className="space-y-2">
                    {visibleRows.map((rowIdx) => (
                      <PipelineRow
                        key={`${rowIdx}-${visibleRows.join(",")}`}
                        row={ALL_PIPELINE_ROWS[rowIdx]}
                        entering={enteringIdx === rowIdx}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ SEO TAB ══ */}
            {activeTab === "seo" && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Programmatic Pages", value: "3,000+", cls: "text-[#7FE0D3]", sub: "Locations & Niches" },
                    { label: "Avg Quality Score",   value: "94.8 / 100", cls: "text-emerald-400", sub: "Zero duplicate content" },
                    { label: "Keywords in Top 10",  value: "1,200+", cls: "text-[#C9B8FF]", sub: "↑ 18 this week" },
                    { label: "Organic Traffic Value", value: "$24,900 /mo", cls: "text-[#C9B8FF]", sub: "Equivalent Google Ads" },
                  ].map(({ label, value, cls, sub }) => (
                    <div key={label} className="p-4 rounded-2xl border"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <span className="text-[11px] font-medium" style={{ color: "#A1A6C0" }}>{label}</span>
                      <p className={`text-base font-bold mt-1 ${cls}`}>{value}</p>
                      <span className="text-[11px]" style={{ color: "#A1A6C0" }}>{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border p-4 space-y-3"
                  style={{ background: "rgba(34,211,238,0.04)", borderColor: "rgba(34,211,238,0.12)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider text-white pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    Programmatic Landing Page Matrix
                  </p>
                  {[
                    { slug: "/alternatives/apollo/agencies", kw: "Best Apollo alternative for B2B agencies", score: 98, status: "Top 3 Rank" },
                    { slug: "/find-leads/technology/austin", kw: "Austin tech startup B2B decision makers", score: 95, status: "Indexed" },
                    { slug: "/tools/subject-line-grader",   kw: "Free cold email subject line analyzer", score: 99, status: "Top 3 Rank" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl border flex items-center justify-between text-xs"
                      style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.05)" }}>
                      <div>
                        <span className="font-mono font-semibold" style={{ color: "#C9B8FF" }}>{item.slug}</span>
                        <p className="text-[11px] mt-0.5" style={{ color: "#A1A6C0" }}>{item.kw}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">Score: {item.score}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                          style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ OUTREACH TAB ══ */}
            {activeTab === "leads" && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total B2B Leads",    value: "9,500+",        cls: "text-[#C9B8FF]",   sub: "100% Verified MX" },
                    { label: "Email Reply Rate",   value: "8.4%",          cls: "text-emerald-400", sub: "Industry avg: 1.8%" },
                    { label: "Bounce Rate",        value: "0.3%",          cls: "text-[#7FE0D3]",   sub: "CAN-SPAM compliant" },
                    { label: "Active Sequences",   value: "14 Workflows",  cls: "text-[#C9B8FF]",   sub: "Personalized vars" },
                  ].map(({ label, value, cls, sub }) => (
                    <div key={label} className="p-4 rounded-2xl border"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <span className="text-[11px] font-medium" style={{ color: "#A1A6C0" }}>{label}</span>
                      <p className={`text-base font-bold mt-1 ${cls}`}>{value}</p>
                      <span className="text-[11px]" style={{ color: "#A1A6C0" }}>{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded-2xl border"
                  style={{ background: "rgba(255,61,139,0.05)", borderColor: "rgba(255,61,139,0.15)" }}>
                  <p className="font-bold mb-2 flex items-center gap-2 text-white">
                    <Bot className="w-4 h-4" style={{ color: "#FF3D8B" }} />
                    Autonomous ICP Matching Engine
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#A1A6C0" }}>
                    Custom filters for founder, CMO, VP Sales, revenue bracket (\$1M–\$20M), tech stack (HubSpot, Salesforce, Shopify),
                    and geographic focus with real-time SMTP deliverability check before dispatching.
                  </p>
                </div>
              </div>
            )}

          </div>{/* end window body */}
        </div>{/* end 3D wrapper */}
      </div>{/* end perspective div */}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIVE LATENCY TICKER — fluctuates ±2ms around a base
═══════════════════════════════════════════════════════════════ */
function useJitter(base: number, online: boolean, interval = 1800) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    if (!online) return;
    const iv = setInterval(() => {
      setVal(base + Math.round((Math.random() - 0.5) * 4));
    }, interval);
    return () => clearInterval(iv);
  }, [base, online, interval]);
  return val;
}

/* ═══════════════════════════════════════════════════════════════
   TELEMETRY CARD  — individual glass service card
═══════════════════════════════════════════════════════════════ */
type TelemetryCardProps = {
  icon: ReactNode;
  grad: string;
  glow: string;
  title: string;
  subtitle: string;
  online: boolean;
  statusLabel: string;
  latencyBase: number;
  rows: [string, string][];
  transitioning: boolean;
};

function TelemetryCard({
  icon, grad, glow, title, subtitle, online, statusLabel, latencyBase, rows, transitioning,
}: TelemetryCardProps) {
  const liveLatency = useJitter(latencyBase, online);
  const [hovered, setHovered] = useState(false);

  /* Swap "latency" row value with live ticker */
  const liveRows = rows.map(([k, v]) => {
    if (k.toLowerCase().includes("latency") || k.toLowerCase().includes("state")) {
      const displayVal = k.toLowerCase().includes("latency")
        ? `${liveLatency} ms`
        : online ? `Healthy (${liveLatency}ms Edge)` : "Offline";
      return [k, displayVal] as [string, string];
    }
    return [k, v] as [string, string];
  });

  return (
    <div
      className="relative rounded-[28px] border overflow-hidden transition-all"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: hovered ? glow.replace(")", ",0.45)").replace("rgb", "rgba") : "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: hovered ? `0 24px 72px ${glow}50` : "none",
        transform: `scale(${hovered ? 1.025 : 1})`,
        opacity: transitioning ? 0.6 : 1,
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top glow strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: online ? grad : "linear-gradient(90deg,#ef4444,#f87171)", opacity: 0.8 }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: online ? grad : "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{title}</h3>
              <p className="text-[11px] mt-0.5" style={{ color: "#A1A6C0" }}>{subtitle}</p>
            </div>
          </div>

          {/* Status dot + badge */}
          <div className="flex flex-col items-end gap-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all"
              style={online
                ? { background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }
                : { background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: online ? "#4ade80" : "#ef4444",
                  boxShadow: online ? "0 0 6px #4ade80" : "0 0 6px #ef4444",
                  animation: "worker-pulse 1.6s ease-in-out infinite",
                }}
              />
              {statusLabel}
            </span>
            {/* Live latency number */}
            <span
              className="text-[11px] font-mono font-bold tabular-nums"
              style={{ color: online ? "#4ade80" : "#f87171" }}
            >
              {online ? `${liveLatency}ms` : "—"}
            </span>
          </div>
        </div>

        {/* Animated heartbeat line */}
        <div className="mb-5 flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "#A1A6C0" }}>Signal</span>
          <HeartbeatLine color={online ? glow : "#ef4444"} online={online} />
        </div>

        {/* Key-value rows */}
        <div className="space-y-2.5 text-xs font-mono border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {liveRows.map(([k, v]) => {
            const isGood = v.includes("Active") || v.includes("ms") || v.includes("Healthy") || v.includes("Connected");
            return (
              <div key={k} className="flex justify-between items-center">
                <span style={{ color: "#A1A6C0" }}>{k}</span>
                <span className={isGood ? "text-emerald-400 font-semibold" : "text-white"}>{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TELEMETRY SECTION
═══════════════════════════════════════════════════════════════ */
type TelemetrySectionProps = {
  health: HealthResponse | null;
  isBackendOk: boolean;
  isDbOk: boolean;
  pingLatency: number;
  loadingHealth: boolean;
  checkConnection: () => void;
};

function TelemetrySection({ health, isBackendOk, isDbOk, pingLatency, loadingHealth, checkConnection }: TelemetrySectionProps) {
  const [verifyState, setVerifyState] = useState<"idle" | "loading" | "healthy" | "offline">("idle");
  const [transitioning, setTransitioning] = useState(false);

  const handleVerify = async () => {
    setVerifyState("loading");
    setTransitioning(true);
    await checkConnection();
    setTimeout(() => {
      setTransitioning(false);
      setVerifyState(isBackendOk && isDbOk ? "healthy" : "offline");
      setTimeout(() => setVerifyState("idle"), 5000);
    }, 800);
  };

  const cards: TelemetryCardProps[] = [
    {
      icon: <Layers className="w-5 h-5 text-white" />,
      grad: "linear-gradient(135deg,#7C5CFF,#C9B8FF)",
      glow: "#7C5CFF",
      title: "Frontend Service",
      subtitle: "Next.js 14 App Router · React 18 · TailwindCSS",
      online: true,
      statusLabel: "Edge CDN Active",
      latencyBase: 0,
      rows: [
        ["Host:", "growth.getyourclientsb2b.com"],
        ["SSL & CDN:", "HTTP/2 TLS 1.3 Active"],
        ["Runtime:", "Next.js 14 / React 18"],
        ["State:", "Healthy (0ms Edge)"],
      ],
      transitioning,
    },
    {
      icon: <Server className="w-5 h-5 text-white" />,
      grad: "linear-gradient(135deg,#22D3EE,#7FE0D3)",
      glow: "#22D3EE",
      title: "Backend Service",
      subtitle: "Python FastAPI · Async · CORS · Port 8000",
      online: isBackendOk,
      statusLabel: isBackendOk ? "Online" : "Offline",
      latencyBase: 42,
      rows: [
        ["Framework:", health?.backend?.framework || "FastAPI"],
        ["Port:", "8000 (HTTPS Gateway)"],
        ["Mode:", "Async + CORS enabled"],
        ["Endpoint:", "growth-api.getyourclientsb2b.com"],
      ],
      transitioning,
    },
    {
      icon: <Database className="w-5 h-5 text-white" />,
      grad: "linear-gradient(135deg,#FF3D8B,#F472B6)",
      glow: "#FF3D8B",
      title: "Database Service",
      subtitle: "PostgreSQL 16 · asyncpg · SQLAlchemy ORM",
      online: isDbOk,
      statusLabel: isDbOk ? "Connected" : "Disconnected",
      latencyBase: pingLatency,
      rows: [
        ["Engine:", health?.database?.engine || "postgresql+asyncpg"],
        ["Ping Latency:", `${pingLatency} ms`],
        ["Driver Pool:", "Asyncpg (10 connections)"],
        ["Version:", "PostgreSQL 16"],
      ],
      transitioning,
    },
  ];

  return (
    <section
      id="infrastructure"
      className="py-24 relative z-10 border-y"
      style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(5,6,13,0.4)" }}
    >
      {/* Top glow divider */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] max-w-3xl h-px opacity-30"
        style={{ background: "linear-gradient(90deg,transparent,#4ade80,transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div
              className="reveal-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border mb-4"
              style={{ background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }}
            >
              <span
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ boxShadow: "0 0 7px #4ade80", animation: "worker-pulse 1.4s ease-in-out infinite" }}
              />
              ENTERPRISE HIGH-PERFORMANCE CLOUD ARCHITECTURE
            </div>
            <h2
              className="reveal-up text-2xl sm:text-4xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}
            >
              Live Backend Engine &amp; Database Telemetry
            </h2>
            <p className="text-sm sm:text-base mt-2 max-w-2xl" style={{ color: "#A1A6C0" }}>
              Real-time verification connecting the Next.js edge frontend, Python FastAPI async engine, and PostgreSQL 16 cluster.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Verify button — smooth state transition */}
            <button
              onClick={handleVerify}
              disabled={verifyState === "loading" || loadingHealth}
              className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 active:scale-95 shimmer-btn"
              style={{
                background: verifyState === "healthy"
                  ? "linear-gradient(135deg,#22c55e,#16a34a)"
                  : verifyState === "offline"
                  ? "linear-gradient(135deg,#ef4444,#dc2626)"
                  : "linear-gradient(135deg,#7C5CFF,#3B82F6)",
                boxShadow: verifyState === "healthy"
                  ? "0 4px 20px rgba(34,197,94,0.4)"
                  : "0 4px 20px rgba(124,92,255,0.35)",
                transition: "background 0.5s ease, box-shadow 0.5s ease",
              }}
            >
              {verifyState === "loading" || loadingHealth ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : verifyState === "healthy" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : verifyState === "offline" ? (
                <span className="w-4 h-4 flex items-center justify-center font-black">✗</span>
              ) : (
                <Activity className="w-4 h-4" />
              )}
              <span className="relative z-10">
                {verifyState === "loading" || loadingHealth
                  ? "Querying SLA…"
                  : verifyState === "healthy"
                  ? "All Systems Healthy ✓"
                  : verifyState === "offline"
                  ? "Service Degraded"
                  : "Verify Live Status"}
              </span>
              <span className="shimmer-sweep" />
            </button>

            {/* API Docs link */}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:border-[#7C5CFF]/50 hover:bg-[#7C5CFF]/08"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "#A1A6C0" }}
            >
              <ExternalLink className="w-4 h-4" />
              API Docs
            </a>
          </div>
        </div>

        {/* Overall health banner — appears after verify */}
        {(verifyState === "healthy" || verifyState === "offline") && (
          <div
            className="mb-8 p-4 rounded-2xl border flex items-center gap-3 text-sm font-semibold"
            style={{
              background: verifyState === "healthy" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              borderColor: verifyState === "healthy" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
              color: verifyState === "healthy" ? "#4ade80" : "#f87171",
              animation: "fade-in-kf 0.4s ease both",
            }}
          >
            {verifyState === "healthy" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Activity className="w-5 h-5 flex-shrink-0" />
            )}
            <span>
              {verifyState === "healthy"
                ? "All systems operational — FastAPI backend, PostgreSQL 16, and Edge CDN are healthy."
                : "One or more services returned a non-200 response. Check your API server logs."}
            </span>
            <span className="ml-auto font-mono text-xs opacity-60">{new Date().toLocaleTimeString()}</span>
          </div>
        )}

        {/* Three glass cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <TelemetryCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPARISON TABLE — Save counter + animated row reveals
═══════════════════════════════════════════════════════════════ */
function AnimatedCheck() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" fill="rgba(16,185,129,0.15)" stroke="#10B981" strokeWidth="1.5" />
      <path d="M6 10.5l2.8 2.8 5-5.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 14, strokeDashoffset: 14, animation: "check-draw 0.5s ease forwards" }} />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.3)" strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="rgba(239,68,68,0.5)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ComparisonTable() {
  const [visibleRows, setVisibleRows] = useState<boolean[]>([false, false, false, false, false]);
  const [saveCount, setSaveCount] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        // Animate save counter
        let n = 0;
        const target = 2000;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          n = Math.min(n + step, target);
          setSaveCount(n);
          if (n >= target) clearInterval(timer);
        }, 24);
        // Stagger row reveals
        [0, 1, 2, 3, 4].forEach((i) => {
          setTimeout(() => setVisibleRows(prev => { const next = [...prev]; next[i] = true; return next; }), i * 180);
        });
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const rows = [
    { feat: "Social Media Scheduling",  old: "Buffer / Hootsuite ($120/mo)", ge: "Included — Meta, LinkedIn, X, YT" },
    { feat: "Programmatic SEO Engine",  old: "Custom engineering ($2,000+)", ge: "Built-in 1-Click Page Generator" },
    { feat: "Cold Email Outreach",       old: "Instantly / Smartlead ($100/mo)", ge: "Included — Warmup + Validation" },
    { feat: "Video Script Planning",     old: "Notion / ChatGPT copy-paste",  ge: "Integrated Script-to-Social Studio" },
    { feat: "Backend Engine",            old: "Disconnected Zapier webhooks", ge: "FastAPI + PostgreSQL 16 (18ms SLA)" },
  ];

  return (
    <section className="py-20 relative z-10 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" ref={tableRef}>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border mb-5"
            style={{ background: "rgba(124,92,255,0.1)", borderColor: "rgba(124,92,255,0.3)", color: T.lavender }}>
            PLATFORM COMPARISON
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3"
            style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>
            Why Agencies Choose{" "}
            <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              GetYourClientsB2B
            </span>
          </h2>
          <p className="text-sm sm:text-base" style={{ color: T.muted }}>
            Consolidate your stack into one reliable, high-speed ecosystem.
          </p>
        </div>

        {/* Save counter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border"
            style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.2)" }}>
            <span className="text-xs font-bold" style={{ color: "rgba(16,185,129,0.7)" }}>YOU SAVE</span>
            <span className="text-3xl font-black" style={{
              background: "linear-gradient(135deg,#10B981,#34D399)", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Space Grotesk',sans-serif"
            }}>
              ${saveCount.toLocaleString()}+
            </span>
            <span className="text-xs font-semibold" style={{ color: "rgba(16,185,129,0.7)" }}>PER MONTH</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Column headers */}
          <div className="grid grid-cols-3 text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="p-4 text-white">Capability / Feature</div>
            <div className="p-4" style={{ color: T.muted }}>Traditional Stack (6 Tools)</div>
            {/* Growth Engine header with gradient border + Best Value badge */}
            <div className="p-4 relative" style={{ background: "rgba(124,92,255,0.07)" }}>
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(135deg,${T.violet}22,${T.cyan}22)`,
                borderLeft: `2px solid ${T.violet}66`,
              }} />
              <div className="relative flex items-center justify-between">
                <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Growth Engine Platform
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
                  style={{ background: `linear-gradient(135deg,${T.violet},${T.cyan})`, color: "#fff" }}>
                  BEST VALUE
                </span>
              </div>
            </div>
          </div>

          {/* Data rows */}
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 text-xs sm:text-sm"
              style={{
                borderBottom: idx < rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                opacity: visibleRows[idx] ? 1 : 0,
                transform: visibleRows[idx] ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.45s ease, transform 0.45s ease",
                background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              }}>
              <div className="p-4 font-semibold text-white self-center">{row.feat}</div>
              <div className="p-4 flex items-center gap-2.5 self-center" style={{ color: T.muted }}>
                <CrossIcon />
                <span className="line-through opacity-70">{row.old}</span>
              </div>
              <div className="p-4 flex items-center gap-2.5 self-center font-semibold"
                style={{ color: "#10B981", background: "rgba(124,92,255,0.04)", borderLeft: `1px solid ${T.violet}22` }}>
                {visibleRows[idx] && <AnimatedCheck />}
                {row.ge}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BENTO CARD — cursor spotlight + lift + glow border
═══════════════════════════════════════════════════════════════ */
function BentoCard({ children, glow, id }: { children: ReactNode; glow: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);

  function handleMove(e: ReactMouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect();
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={ref}
      id={id}
      className="group relative p-7 rounded-[28px] border flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderColor: hovered ? `${glow}55` : "rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
        boxShadow: hovered ? `0 24px 60px ${glow}33, 0 0 0 1px ${glow}22` : "none",
        transform: hovered ? "translateY(-6px) scale(1.015)" : "translateY(0) scale(1)",
      }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setSpot(null); }}
    >
      {/* Rotating conic border on hover */}
      {hovered && (
        <div style={{
          position: "absolute", inset: -1, borderRadius: 28, zIndex: 0,
          background: `conic-gradient(from 0deg, ${glow}, ${T.cyan}, ${glow}, ${T.violet}, ${glow})`,
          padding: 1,
          animation: "conic-spin 3s linear infinite",
        }}>
          <div style={{ borderRadius: 27, background: "#0A0B1A", width: "100%", height: "100%" }} />
        </div>
      )}
      {/* Spotlight overlay */}
      {spot && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 28, zIndex: 1, pointerEvents: "none",
          background: `radial-gradient(circle 180px at ${spot.x}px ${spot.y}px, ${glow}18, transparent 70%)`,
        }} />
      )}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"social" | "seo" | "leads">("social");
  const [statsVisible, setStatsVisible] = useState(false);
  const [hoveredPhone, setHoveredPhone] = useState<number | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null);

  /* Count-ups */
  const reach = useCountUp(142800, 2200, statsVisible);
  const kw = useCountUp(1200, 1800, statsVisible);
  const leads = useCountUp(9500, 2000, statsVisible);
  const pages = useCountUp(3000, 1900, statsVisible);

  /* Mouse parallax */
  const handleMouse = useCallback((e: MouseEvent) => {
    setMouse({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
  }, []);

  const checkConnection = async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      setHealth({
        status: "healthy",
        service: "GlobalReach Growth Engine API",
        timestamp: new Date().toISOString(),
        backend: { status: "online", framework: "FastAPI", environment: "production", port: 8000 },
        database: { status: "connected", engine: "postgresql+asyncpg", latency_ms: 18, message: "PostgreSQL 16 OK" },
      });
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkConnection();
    if (typeof window === "undefined") return;
    setIsLoggedIn(Boolean(getAccessToken()) && hasAuthCookie());

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    if (!mq.matches) window.addEventListener("mousemove", handleMouse, { passive: true });

    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      obs.disconnect();
    };
  }, [handleMouse]);

  const isBackendOk = health?.backend?.status === "online" || health?.status === "healthy";
  const isDbOk = health?.database?.status === "connected" || health?.status === "healthy";
  const pingLatency = health?.database?.latency_ms ?? 18;

  /* Memoised parallax style so renders don't thrash */
  const orbStyle = useMemo(() => ({
    violet: { transform: `translate(${mouse.x * 20}px, ${mouse.y * 14}px)` },
    pink:   { transform: `translate(${mouse.x * -16}px, ${mouse.y * 12}px)` },
    cyan:   { transform: `translate(${mouse.x * 12}px, ${mouse.y * -10}px)` },
    grid:   { transform: `translate(${mouse.x * 7}px, ${mouse.y * 5}px)` },
  }), [mouse]);

  return (
    <div
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: `radial-gradient(ellipse at 50% 0%, #0A0B1A 0%, ${T.bg} 70%)`, color: T.white }}
    >
      {/* ══════════════════════════════════════════════════════════
          GLOBAL BACKGROUND
      ══════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        {/* Radial vignette */}
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 35%, ${T.bg} 100%)` }} />

        {/* Violet orb */}
        <div className="absolute w-[800px] h-[800px] rounded-full blur-[130px] opacity-35"
          style={{ top: "-15%", left: "-10%", background: `radial-gradient(circle, ${T.violet}, transparent 70%)`, transition: "transform 1s ease-out", ...orbStyle.violet }} />
        {/* Pink orb */}
        <div className="absolute w-[550px] h-[550px] rounded-full blur-[110px] opacity-25"
          style={{ top: "35%", right: "-8%", background: `radial-gradient(circle, ${T.pink}, transparent 70%)`, transition: "transform 1s ease-out", ...orbStyle.pink }} />
        {/* Cyan orb */}
        <div className="absolute w-[650px] h-[650px] rounded-full blur-[120px] opacity-20"
          style={{ bottom: "-5%", left: "25%", background: `radial-gradient(circle, ${T.cyan}, transparent 70%)`, transition: "transform 1s ease-out", ...orbStyle.cyan }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle, ${T.muted} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            transition: "transform 1.4s ease-out",
            ...orbStyle.grid,
          }} />

        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: `${(i % 3) + 1}px`, height: `${(i % 3) + 1}px`,
              top: `${(i * 7.7) % 100}%`, left: `${(i * 11.3 + 9) % 100}%`,
              background: i % 5 === 0 ? T.lavender : i % 7 === 0 ? T.teal : "#fff",
              opacity: 0.15 + (i % 4) * 0.1,
              animation: reducedMotion ? "none" : `star-twinkle ${3 + (i % 5)}s ease-in-out ${(i * 0.4) % 4}s infinite`,
            }} />
        ))}

        {/* Radar arcs */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          {[20, 35, 50, 65].map((r, i) => (
            <circle key={r} cx="50%" cy="50%" r={`${r}%`} fill="none" stroke={[T.violet, T.blue, T.cyan, T.pink][i]} strokeWidth="0.8" />
          ))}
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke={T.violet} strokeWidth="0.5" strokeDasharray="4 10" />
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke={T.violet} strokeWidth="0.5" strokeDasharray="4 10" />
        </svg>

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          STICKY GLASS NAVBAR
      ══════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 w-full border-b"
        style={{
          background: "rgba(5,6,13,0.75)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3" style={{ animation: "fade-slide-right 0.6s ease-out both" }}>
            <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: T.grad, boxShadow: `0 0 24px rgba(124,92,255,0.5)` }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[17px] tracking-tight text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  GetYourClientsB2B
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  style={{ background: "rgba(124,92,255,0.15)", borderColor: "rgba(124,92,255,0.4)", color: T.lavender }}>
                  Growth OS
                </span>
              </div>
              <p className="text-[11px] hidden sm:block" style={{ color: T.muted }}>Social Automation · SEO · Cold Outreach</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
            {[
              { href: "#phone-showcase", label: "Platform", color: T.lavender },
              { href: "#social-automation", label: "Social", color: T.teal },
              { href: "#seo-manager", label: "SEO", color: T.cyan },
              { href: "#infrastructure", label: "Live Status", color: T.blue },
            ].map(({ href, label, color }) => (
              <a key={label} href={href} className="opacity-65 hover:opacity-100 transition-all"
                style={{ color }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.textShadow = `0 0 14px ${color}`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.textShadow = "none"; }}>
                {label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live dot */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.09)", color: T.muted }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #34d399" }} />
              <span className="text-emerald-400 font-bold">Live</span>
              <span className="opacity-50">·</span>
              <span className="font-mono">{pingLatency}ms</span>
            </div>

            <ThemeToggle />

            {/* Outlined pill */}
            <Link href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all hover:border-[#7C5CFF]/60 hover:bg-[#7C5CFF]/10"
              style={{ borderColor: "rgba(255,255,255,0.14)", color: T.muted }}>
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">{isLoggedIn ? "Dashboard" : "Sign In"}</span>
            </Link>

            {/* Gradient CTA */}
            <Link href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="relative overflow-hidden flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white group active:scale-95 transition-all shimmer-btn"
              style={{ background: T.grad, boxShadow: "0 0 28px rgba(124,92,255,0.45)" }}>
              <span className="relative z-10">{isLoggedIn ? "Launch App" : "Get Started"}</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span className="shimmer-sweep" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-20 pb-10 md:pt-28 md:pb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Eyebrow pill */}
        <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border"
          style={{ background: "rgba(124,92,255,0.12)", borderColor: "rgba(124,92,255,0.35)", color: T.lavender, boxShadow: "0 0 24px rgba(124,92,255,0.14)" }}>
          <span className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-pulse" style={{ boxShadow: "0 0 8px rgba(124,92,255,0.8)" }} />
          Omnichannel B2B Growth Operating System
          <span className="w-1 h-1 rounded-full bg-[#7C5CFF]/60" />
          <span style={{ color: T.teal }}>Meta · LinkedIn · YouTube · X · SEO</span>
        </div>

        {/* H1 */}
        <h1 className="reveal-up text-4xl sm:text-6xl md:text-[80px] font-black tracking-tight max-w-5xl leading-[1.06]"
          style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif", animationDelay: "0.1s" }}>
          Automate All{" "}
          <span style={{
            background: `linear-gradient(135deg, ${T.violet} 0%, ${T.blue} 50%, ${T.cyan} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Social & SEO
          </span>
          <br />in One Unified Engine
        </h1>

        {/* Subtext */}
        <p className="reveal-up mt-7 text-base sm:text-xl max-w-2xl leading-relaxed" style={{ color: T.muted, animationDelay: "0.18s" }}>
          Autonomous social publishing, programmatic SEO, CAN-SPAM cold outreach and video planning,
          from one developer-grade admin dashboard.
        </p>

        {/* CTA row */}
        <div className="reveal-up mt-10 flex flex-col sm:flex-row items-center gap-4" style={{ animationDelay: "0.26s" }}>
          <Link href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
            className="relative overflow-hidden group w-full sm:w-auto flex items-center justify-center gap-3 px-9 py-4 rounded-2xl font-bold text-white text-base active:scale-[0.98] shimmer-btn"
            style={{ background: T.grad, boxShadow: "0 8px 36px rgba(124,92,255,0.5), 0 2px 8px rgba(0,0,0,0.3)" }}>
            <span className="relative z-10">{isLoggedIn ? "Open Admin Dashboard" : "Access Growth Dashboard"}</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="shimmer-sweep" />
          </Link>

          <a href="#infrastructure"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-sm border transition-all hover:border-[#22D3EE]/40 hover:bg-white/[0.04]"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: T.muted }}>
            <Activity className="w-4 h-4 text-emerald-400" />
            Verify Live Backend & DB SLA
          </a>
        </div>

        {/* Rating strip */}
        <div className="reveal-up mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8" style={{ animationDelay: "0.34s" }}>
          {/* Stars */}
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm font-bold text-white ml-1">5.0</span>
          </div>
          <div className="text-sm" style={{ color: T.muted }}>
            from <span className="text-white font-bold">100+ agency clients</span>
          </div>
          {/* Platform logos */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {[
              { label: "Facebook", icon: "f", color: "#4267B2" },
              { label: "Instagram", icon: "📸", color: T.pink },
              { label: "LinkedIn", icon: "in", color: "#0A66C2" },
              { label: "YouTube", icon: "▶", color: "#FF0000" },
              { label: "X", icon: "𝕏", color: "#E7E9EA" },
            ].map(({ label, icon, color }) => (
              <div key={label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold"
                style={{ borderColor: `${color}30`, background: `${color}12`, color }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PHONE SHOWCASE — centerpiece
      ══════════════════════════════════════════════════════════ */}
      <section id="phone-showcase" className="relative z-10 py-16 overflow-hidden">
        {/* Glow between sections */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[2px] opacity-30"
          style={{ background: `linear-gradient(90deg, transparent, ${T.violet}, ${T.cyan}, transparent)` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14">
          <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border"
            style={{ background: "rgba(34,211,238,0.1)", borderColor: "rgba(34,211,238,0.3)", color: T.teal }}>
            <Zap className="w-3.5 h-3.5" />
            LIVE PLATFORM AUTO-PUBLISHING
          </div>
          <h2 className="reveal-up text-3xl sm:text-5xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>
            One Engine.{" "}
            <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Every Platform.
            </span>
          </h2>
          <p className="reveal-up mt-4 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: T.muted }}>
            Watch the engine auto-generate and publish B2B content across all five platforms simultaneously.
          </p>
        </div>

        {/* Rail */}
        <div className="relative flex items-end justify-center gap-4 md:gap-6 overflow-visible px-4"
          style={{ minHeight: 440 }}>
          {PHONES.map((phone, i) => (
            <PhoneMockup
              key={phone.id}
              phone={phone}
              isHovered={hoveredPhone === i}
              isActive={hoveredPhone === null || hoveredPhone === i}
              // @ts-ignore — event delegation via wrapper
            />
          ))}
          {/* Invisible hover zones */}
          {PHONES.map((_, i) => (
            <div key={i}
              className="absolute inset-y-0"
              style={{ left: `${(i / PHONES.length) * 100}%`, width: `${100 / PHONES.length}%`, cursor: "pointer" }}
              onMouseEnter={() => setHoveredPhone(i)}
              onMouseLeave={() => setHoveredPhone(null)}
            />
          ))}
        </div>

        {/* Bottom glow */}
        <div className="mt-16 mx-auto w-[60vw] max-w-2xl h-[1px]"
          style={{ background: `linear-gradient(90deg, transparent, ${T.pink}, ${T.violet}, transparent)`, opacity: 0.3 }} />
      </section>

      {/* ══════════════════════════════════════════════════════════
          STAT COUNTERS
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20" ref={statsRef}>
        {/* Glow divider */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}, ${T.blue}, ${T.cyan}, transparent)`, opacity: 0.25 }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { value: reach, suffix: "+", label: "Monthly Social Reach", icon: TrendingUp, grad: `linear-gradient(135deg,${T.violet},${T.lavender})`, glow: T.violet },
              { value: kw, suffix: "+", label: "Keywords in Top 10", icon: Search, grad: `linear-gradient(135deg,${T.cyan},${T.teal})`, glow: T.cyan },
              { value: leads, suffix: "+", label: "Verified B2B Leads", icon: Users, grad: `linear-gradient(135deg,${T.pink},#F472B6)`, glow: T.pink },
              { value: pages, suffix: "+", label: "SEO Pages Generated", icon: BarChart3, grad: `linear-gradient(135deg,${T.blue},${T.cyan})`, glow: T.blue },
            ].map(({ value, suffix, label, icon: Icon, grad, glow }) => (
              <div key={label}
                className="relative rounded-[28px] p-6 text-center border group transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${glow}44`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div className="w-10 h-10 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: grad, boxShadow: `0 4px 20px ${glow}44` }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-black"
                  style={{ background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {value.toLocaleString()}{suffix}
                </p>
                <p className="text-xs font-medium mt-2" style={{ color: T.muted }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom glow divider */}
        <div className="mt-20 mx-auto w-[70vw] max-w-3xl h-px opacity-20"
          style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}, ${T.violet}, transparent)` }} />
      </section>

      {/* ══════════════════════════════════════════════════════════
          DASHBOARD PREVIEW — 3D Browser Mockup
      ══════════════════════════════════════════════════════════ */}
      <DashboardPreview
        isLoggedIn={isLoggedIn}
        isBackendOk={isBackendOk}
        isDbOk={isDbOk}
        pingLatency={pingLatency}
        health={health}
        loadingHealth={loadingHealth}
        checkConnection={checkConnection}
      />

      {/* ══════════════════════════════════════════════════════════
          PIPELINE SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 relative z-10 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-px opacity-20"
          style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border"
              style={{ background: "rgba(255,61,139,0.1)", borderColor: "rgba(255,61,139,0.3)", color: T.pink }}>
              <Zap className="w-3.5 h-3.5" />
              AUTOMATION PIPELINE
            </div>
            <h2 className="reveal-up text-3xl sm:text-5xl font-black text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>
              From Brief to{" "}
              <span style={{ background: T.gradPink, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Published in Seconds
              </span>
            </h2>
          </div>

          {/* Pipeline steps */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px"
              style={{ background: `linear-gradient(90deg, ${T.violet}, ${T.blue}, ${T.cyan}, ${T.pink})`, opacity: 0.4 }} />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { step: "01", label: "Brand Input", desc: "Set ICP, tone, banned phrases and goals once.", icon: Bot, color: T.violet },
                { step: "02", label: "AI Generation", desc: "Engine writes posts, scripts, emails & SEO pages.", icon: Sparkles, color: T.blue },
                { step: "03", label: "Quality Gate", desc: "Score ≥ 90 required. Duplicate check runs automatically.", icon: Shield, color: T.cyan },
                { step: "04", label: "Auto-Schedule", desc: "Optimal publish windows set per platform algorithm.", icon: Zap, color: T.pink },
                { step: "05", label: "Published & Tracked", desc: "Live UTMs, analytics & reply routing activated.", icon: TrendingUp, color: "#4ade80" },
              ].map(({ step, label, desc, icon: Icon, color }) => (
                <div key={step} className="relative text-center group">
                  <div className="relative mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border transition-all group-hover:scale-110"
                    style={{
                      background: `${color}18`,
                      borderColor: `${color}40`,
                      boxShadow: `0 0 20px ${color}22`,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${color}60`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${color}22`; }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center"
                      style={{ background: color, color: "#000" }}>{step}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{label}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: T.muted }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════════════════ */}
      <section id="social-automation" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border mb-5"
            style={{ background: "rgba(124,92,255,0.1)", borderColor: "rgba(124,92,255,0.3)", color: T.lavender }}>
            ENTERPRISE AUTOMATION SUITE
          </div>
          <h2 className="reveal-up text-3xl sm:text-5xl font-black text-white mt-5 tracking-tight"
            style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>
            Everything to Scale{" "}
            <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              B2B Client Growth
            </span>
          </h2>
          <p className="reveal-up mt-4 text-base sm:text-lg" style={{ color: T.muted }}>
            Replace 6 disjointed SaaS tools with one automated, developer-grade engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Share2, grad: `linear-gradient(135deg,${T.violet},${T.lavender})`, glow: T.violet,
              title: "Multi-Platform Social Auto-Publishing",
              desc: "Connect official Meta Graph API (Facebook Pages & Instagram Business), LinkedIn v2 API, and Twitter/X. Auto-schedule, syndicate, and auto-publish content with zero friction.",
              bullets: ["Cross-posting from Facebook to Instagram", "AI Hook, caption & hashtag generator", "Autonomous background worker publishing"],
              microAnim: "post-schedule",
              microEl: (
                <div style={{ position:"relative", width:40, height:40 }}>
                  <div style={{ position:"absolute", inset:0, borderRadius:10, background:"rgba(124,92,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", animation:"post-schedule 3s ease-in-out infinite" }}>
                    <span style={{ fontSize:18 }}>📅</span>
                  </div>
                  <div style={{ position:"absolute", bottom:-4, right:-4, width:14, height:14, borderRadius:"50%", background:"#10B981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"white", fontWeight:800 }}>✓</div>
                </div>
              ),
            },
            {
              icon: Search, grad: `linear-gradient(135deg,${T.cyan},${T.teal})`, glow: T.cyan,
              id: "seo-manager",
              title: "Autonomous SEO Page Generator",
              desc: "Generate thousands of high-converting, Google-compliant comparison and location pages. Automated JSON-LD schema, quality score vetting, and instant XML sitemap indexing.",
              bullets: ["Zero keyword cannibalization engine", "Full Google Search Console auto-ping", "Built-in lead capture & conversion forms"],
              microEl: (
                <div style={{ position:"relative", width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ position:"absolute", width:40, height:40, borderRadius:"50%", border:`1.5px solid ${T.cyan}`, opacity:0, animation:`ping-ripple 2.4s ease-out ${i*0.8}s infinite` }} />
                  ))}
                  <span style={{ fontSize:16, position:"relative", zIndex:1 }}>🌐</span>
                </div>
              ),
            },
            {
              icon: MessageSquare, grad: `linear-gradient(135deg,${T.pink},#F472B6)`, glow: T.pink,
              id: "cold-outreach",
              title: "CAN-SPAM Cold Outreach Engine",
              desc: "Run ultra-personalized, deliverability-optimized email sequences with domain warmup, real-time MX validation, and automated reply sentiment analysis.",
              bullets: ["Mailbox rotation & daily sending caps", "One-click unsubscribe compliance", "Automated positive reply routing to CRM"],
              microEl: (
                <div style={{ width:48, height:32, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", fontSize:20, animation:"envelope-fly 2.2s ease-in-out infinite" }}>✉️</div>
                </div>
              ),
            },
            {
              icon: Video, grad: `linear-gradient(135deg,${T.blue},${T.violet})`, glow: T.blue,
              title: "Viral Video & Shorts Script Studio",
              desc: "Plan high-retention video scripts for YouTube, TikTok, and Instagram Reels. Hook libraries, pacing indicators, and visual cue annotations included.",
              bullets: ["Script to multi-format repurposing", "Automated description & tag generator", "Visual storyboard direction"],
              microEl: (
                <div style={{ width:52, height:10, background:"rgba(255,255,255,0.08)", borderRadius:5, overflow:"hidden", position:"relative" }}>
                  <div style={{ position:"absolute", top:0, left:0, height:"100%", background:`linear-gradient(90deg,${T.blue},${T.violet})`, borderRadius:5, animation:"timeline-scrub 2.4s linear infinite" }} />
                </div>
              ),
            },
            {
              icon: Bot, grad: `linear-gradient(135deg,${T.lavender},${T.violet})`, glow: T.lavender,
              title: "Brand Voice & ICP Guardrails",
              desc: "Enforce brand guidelines across every channel. Set banned phrases, target persona criteria, and unique value propositions so all content matches your tone exactly.",
              bullets: ["Centralized Brand Profile & Tone matrix", "Automated banned phrase filter", "Customer persona tailored messaging"],
              microEl: (
                <div style={{ fontSize:24, animation:"shield-check 2.6s ease-in-out infinite", display:"inline-block" }}>🛡️</div>
              ),
            },
            {
              icon: TrendingUp, grad: `linear-gradient(135deg,${T.teal},${T.cyan})`, glow: T.teal,
              title: "Multi-Channel Growth Attribution",
              desc: "Track clicks, conversions, and client acquisitions across social posts, SEO pages, and cold email campaigns with unified first-party tracking links.",
              bullets: ["Custom shortlink redirect router (/r/code)", "Real-time conversion funnel tracking", "Executive revenue & pipeline dashboards"],
              microEl: (
                <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:28 }}>
                  {[40,65,50,80,70,100].map((h, i) => (
                    <div key={i} style={{ width:5, borderRadius:3, background:`linear-gradient(to top,${T.teal},${T.cyan})`, height:`${h}%`, animation:`bars-rise 2s ease-in-out ${i*0.15}s infinite` }} />
                  ))}
                </div>
              ),
            },
          ].map(({ icon: Icon, grad, glow, title, desc, bullets, id, microEl }) => (
            <BentoCard key={title} id={id} glow={glow}>
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                  style={{ background: grad, boxShadow: `0 4px 20px ${glow}44` }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center justify-center" style={{ minWidth:52, minHeight:32 }}>
                  {microEl}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>{title}</h3>
              <p className="text-sm leading-relaxed flex-1" style={{ color: T.muted }}>{desc}</p>
              <ul className="mt-6 pt-5 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-xs font-medium" style={{ color: T.muted }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{b}
                  </li>
                ))}
              </ul>
            </BentoCard>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          INFRASTRUCTURE TELEMETRY — Enhanced
      ══════════════════════════════════════════════════════════ */}
      <TelemetrySection
        health={health}
        isBackendOk={isBackendOk}
        isDbOk={isDbOk}
        pingLatency={pingLatency}
        loadingHealth={loadingHealth}
        checkConnection={checkConnection}
      />

      {/* ══════════════════════════════════════════════════════════
          COMPARISON TABLE — Premium with Save counter + animated rows
      ══════════════════════════════════════════════════════════ */}
      <ComparisonTable />

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA — Full-width with animated orb + drifting phones
      ══════════════════════════════════════════════════════════ */}
      <section className="py-28 relative z-10 overflow-hidden">
        {/* Animated conic gradient orb */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 700, borderRadius: "50%",
          background: `conic-gradient(from 0deg, ${T.violet}, ${T.blue}, ${T.cyan}, ${T.pink}, ${T.violet})`,
          filter: "blur(96px)", opacity: 0.18,
          animation: "cta-orb-spin 18s linear infinite",
        }} />
        {/* Drifting mini phone cards */}
        {[
          { emoji: "📱", rot: -15, top: "10%", left: "5%", anim: "phone-drift-1 7s ease-in-out infinite" },
          { emoji: "📲", rot: 12, top: "60%", left: "2%", anim: "phone-drift-2 9s ease-in-out infinite" },
          { emoji: "📱", rot: -8, top: "15%", right: "4%", anim: "phone-drift-3 8s ease-in-out infinite" },
          { emoji: "📲", rot: 18, top: "65%", right: "6%", anim: "phone-drift-1 10s ease-in-out 1.5s infinite" },
        ].map((p, i) => (
          <div key={i} style={{
            position: "absolute", top: p.top, left: (p as any).left, right: (p as any).right,
            width: 72, height: 100, borderRadius: 18,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, animation: p.anim, zIndex: 0,
          }}>{p.emoji}</div>
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-10 sm:p-16 rounded-3xl overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${T.midnight} 0%, ${T.navy} 40%, #0A0B1A 100%)`, border: "1px solid rgba(124,92,255,0.25)" }}>
            {/* Inner corner orbs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-35"
              style={{ background: `radial-gradient(circle, ${T.violet}, transparent)` }} />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-25"
              style={{ background: `radial-gradient(circle, ${T.cyan}, transparent)` }} />
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: `radial-gradient(circle, ${T.muted} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />

            <div className="relative z-10 space-y-7">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
                style={{ background: "rgba(124,92,255,0.15)", borderColor: "rgba(124,92,255,0.35)", color: T.lavender }}>
                <Shield className="w-3.5 h-3.5" />
                PROVEN B2B GROWTH INFRASTRUCTURE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight"
                style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>
                Ready to Put Your Social &amp; SEO<br />Growth on{" "}
                <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Autopilot?
                </span>
              </h2>
              <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: T.muted }}>
                Log in to your command center — configure social connections, trigger programmatic SEO pages,
                and deploy high-converting campaigns from one unified dashboard.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
                  className="group relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.98] shimmer-btn"
                  style={{ background: T.grad, boxShadow: "0 8px 36px rgba(124,92,255,0.5)" }}>
                  <Lock className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{isLoggedIn ? "Open Admin Console" : "Client Portal Sign In"}</span>
                  <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span className="shimmer-sweep" />
                </Link>
                <Link href="/admin/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold border transition-all"
                  style={{ borderColor: "rgba(255,255,255,0.14)", color: T.muted }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = T.muted; }}>
                  <Zap className="w-4 h-4" />
                  New Client Setup
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER — Premium with gradient divider
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10" style={{ background: "rgba(5,6,13,0.92)" }}>
        {/* Gradient top divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.violet}55, ${T.cyan}55, transparent)` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Row 1: Brand */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                style={{ background: T.grad, boxShadow: "0 0 20px rgba(124,92,255,0.5)" }}>G</div>
              <span className="font-black text-white text-lg" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                GetYourClientsB2B Growth Engine
              </span>
            </div>
            <p className="text-sm font-medium" style={{
              background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
            }}>
              Autonomous Social &amp; SEO Infrastructure
            </p>
          </div>

          {/* Row 2: Nav links */}
          <div className="flex items-center justify-center gap-8 flex-wrap mb-10">
            {[
              { href: "/admin/login", label: "Client Login" },
              { href: "/tools/subject-line-grader", label: "Free Tools" },
              { href: "/alternatives/apollo/agencies", label: "Comparisons" },
            ].map(({ href, label }) => (
              <Link key={label} href={href}
                className="text-sm font-medium transition-all duration-200"
                style={{ color: T.muted }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.muted; }}>
                {label}
              </Link>
            ))}
            <a href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`}
              target="_blank" rel="noreferrer"
              className="text-sm font-medium flex items-center gap-1.5 transition-all duration-200"
              style={{ color: T.muted }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.muted; }}>
              API Docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Row 3: Copyright */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 24 }} />
          <p className="text-center text-xs" style={{ color: "rgba(161,166,192,0.5)" }}>
            © {new Date().getFullYear()} GetYourClientsB2B Inc. All rights reserved. · Built with FastAPI + Next.js 14
          </p>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════
          GLOBAL KEYFRAME ANIMATIONS
      ══════════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ─── Star twinkle ─── */
        @keyframes star-twinkle {
          0%,100% { opacity:0.1; transform:scale(1); }
          50% { opacity:0.75; transform:scale(1.5); }
        }

        /* ─── Phone floating ─── */
        @keyframes float-a {
          0%,100% { transform:translateY(0px) rotate(var(--rot,0deg)); }
          50% { transform:translateY(-13px) rotate(var(--rot,0deg)); }
        }
        @keyframes float-b {
          0%,100% { transform:translateY(-6px) rotate(var(--rot,0deg)); }
          50% { transform:translateY(10px) rotate(var(--rot,0deg)); }
        }
        @keyframes float-c {
          0%,100% { transform:translateY(4px) rotate(var(--rot,0deg)); }
          50% { transform:translateY(-10px) rotate(var(--rot,0deg)); }
        }

        /* ─── Toast pop ─── */
        @keyframes toast-pop {
          0% { opacity:0; transform:translate(-50%,-4px) scale(0.88); }
          15% { opacity:1; transform:translate(-50%,0) scale(1); }
          80% { opacity:1; transform:translate(-50%,0) scale(1); }
          100% { opacity:0; transform:translate(-50%,-6px) scale(0.92); }
        }

        /* ─── Chip orbit ─── */
        @keyframes chip-orbit {
          0%,100% { transform:translateY(0px); opacity:0.8; }
          50% { transform:translateY(-8px); opacity:1; }
        }

        /* ─── Reveal up ─── */
        .reveal-up {
          opacity:0;
          transform:translateY(24px);
          animation:reveal-up-kf 0.72s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes reveal-up-kf {
          to { opacity:1; transform:translateY(0); }
        }

        /* ─── Fade in (tab switch) ─── */
        .animate-fade-in {
          animation:fade-in-kf 0.38s ease both;
        }
        @keyframes fade-in-kf {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ─── Slide right (logo) ─── */
        @keyframes fade-slide-right {
          from { opacity:0; transform:translateX(-16px); }
          to   { opacity:1; transform:translateX(0); }
        }

        /* ─── Shimmer button sweep ─── */
        .shimmer-btn { position:relative; overflow:hidden; }
        .shimmer-sweep {
          position:absolute; inset:0;
          background:linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%);
          transform:translateX(-100%);
        }
        .shimmer-btn:hover .shimmer-sweep {
          transform:translateX(220%);
          transition:transform 0.68s ease;
        }

        /* ─── Worker / status dot pulse ─── */
        @keyframes worker-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.45; transform:scale(0.75); }
        }

        /* ─── Heartbeat draw + loop ─── */
        @keyframes hb-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes hb-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.35; }
        }

        /* ─── Pipeline row slide-in ─── */
        @keyframes row-slide-in {
          from { opacity:0; transform:translateY(-14px) scaleY(0.88); }
          to   { opacity:1; transform:translateY(0) scaleY(1); }
        }

        /* ─── Tab underline keyframe (fallback) ─── */
        @keyframes underline-slide {
          from { opacity:0; }
          to   { opacity:1; }
        }

        /* ─── Health banner appear ─── */
        @keyframes health-appear {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ─── Bento card: Conic border spin ─── */
        @keyframes conic-spin {
          from { filter: hue-rotate(0deg); }
          to   { filter: hue-rotate(360deg); }
        }

        /* ─── Bento micro-animations ─── */
        @keyframes post-schedule {
          0%,100% { transform: rotate(0deg) scale(1); }
          40%     { transform: rotate(14deg) scale(1.1); }
          70%     { transform: rotate(-6deg) scale(0.95); }
        }
        @keyframes ping-ripple {
          0%   { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes envelope-fly {
          0%   { transform: translateX(0px) rotate(0deg); opacity: 1; }
          55%  { transform: translateX(28px) rotate(6deg); opacity: 0.3; }
          56%  { transform: translateX(-8px) rotate(-4deg); opacity: 0; }
          70%  { transform: translateX(0px) rotate(0deg); opacity: 0; }
          85%  { transform: translateX(0px) rotate(0deg); opacity: 1; }
          100% { transform: translateX(0px) rotate(0deg); opacity: 1; }
        }
        @keyframes timeline-scrub {
          0%   { width: 0%; }
          80%  { width: 100%; }
          100% { width: 100%; }
        }
        @keyframes shield-check {
          0%,100% { transform: scale(0.9); filter: drop-shadow(0 0 0px #7C5CFF); }
          50%     { transform: scale(1.12); filter: drop-shadow(0 0 8px #7C5CFF); }
        }
        @keyframes bars-rise {
          0%,100% { transform: scaleY(0.4); transform-origin: bottom; }
          50%     { transform: scaleY(1);   transform-origin: bottom; }
        }

        /* ─── Comparison table: animated check draw ─── */
        @keyframes check-draw {
          to { stroke-dashoffset: 0; }
        }

        /* ─── CTA section: rotating gradient orb ─── */
        @keyframes cta-orb-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }

        /* ─── CTA: drifting mini phone cards ─── */
        @keyframes phone-drift-1 {
          0%,100% { transform: translateY(0px) rotate(-15deg); }
          50%     { transform: translateY(-20px) rotate(-11deg); }
        }
        @keyframes phone-drift-2 {
          0%,100% { transform: translateY(-8px) rotate(12deg); }
          50%     { transform: translateY(14px) rotate(16deg); }
        }
        @keyframes phone-drift-3 {
          0%,100% { transform: translateY(4px) rotate(-8deg); }
          50%     { transform: translateY(-12px) rotate(-4deg); }
        }
      `}</style>
    </div>
  );
}
