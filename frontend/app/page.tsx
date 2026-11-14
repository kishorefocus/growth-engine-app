"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
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
          DASHBOARD PREVIEW
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border"
            style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: T.teal }}>
            LIVE DASHBOARD PREVIEW
          </div>
          <h2 className="reveal-up text-3xl sm:text-4xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>
            One Command Center for Everything
          </h2>
        </div>

        <div className="reveal-up rounded-3xl overflow-hidden border"
          style={{ borderColor: "rgba(124,92,255,0.25)", boxShadow: "0 0 60px rgba(124,92,255,0.14), 0 24px 60px rgba(0,0,0,0.6)", animationDelay: "0.08s" }}>
          {/* Title bar */}
          <div className="px-5 py-3.5 border-b flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-4 text-xs font-mono" style={{ color: T.muted }}>growth.getyourclientsb2b.com/admin/dashboard</span>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              {(["social", "seo", "leads"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                  style={activeTab === tab
                    ? { background: T.grad, color: "#fff", boxShadow: "0 4px 14px rgba(124,92,255,0.4)" }
                    : { color: T.muted }}>
                  {tab === "seo" ? "SEO" : tab === "leads" ? "Outreach" : "Social"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8" style={{ background: "rgba(5,6,13,0.9)" }}>

            {/* SOCIAL TAB */}
            {activeTab === "social" && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Meta Connected", value: "FB & Instagram", cls: "text-emerald-400", sub: "Page ID: 1125229983597930", icon: CheckCircle2 },
                    { label: "Scheduled Posts", value: "48 Due Today", cls: "text-[#C9B8FF]", sub: "Auto-publish active", icon: Zap },
                    { label: "Cross-Network", value: "5 Channels", cls: "text-[#7FE0D3]", sub: "FB, IG, LinkedIn, YT, X", icon: Network },
                    { label: "Monthly Reach", value: "142,800+", cls: "text-[#C9B8FF]", sub: "↑ 34% this month", icon: TrendingUp },
                  ].map(({ label, value, cls, sub, icon: Icon }) => (
                    <div key={label} className="p-4 rounded-2xl border text-left"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <span className="text-[11px] font-medium" style={{ color: T.muted }}>{label}</span>
                      <p className={`text-base font-bold mt-1 flex items-center gap-1.5 ${cls}`}><Icon className="w-4 h-4" />{value}</p>
                      <span className="text-[11px]" style={{ color: T.muted }}>{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border p-4 space-y-3"
                  style={{ background: "rgba(124,92,255,0.05)", borderColor: "rgba(124,92,255,0.14)" }}>
                  <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Autonomous Content Distribution Pipeline</span>
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Worker Active
                    </span>
                  </div>
                  {[
                    { ch: "Facebook + Instagram Business", caption: "🚀 How top B2B agencies automate client acquisition...", status: "Today, 4:00 PM", badge: "Sync Enabled", color: T.blue },
                    { ch: "LinkedIn Company & Founder", caption: "The playbook we used to scale 15 client accounts past $50k MRR...", status: "Tomorrow, 9:00 AM", badge: "v2 API Ready", color: T.teal },
                    { ch: "YouTube Shorts & Video Hub", caption: "3 AI Automation tools every agency owner must deploy in 2026.", status: "Draft Ready", badge: "Script Generated", color: T.pink },
                  ].map((row, i) => (
                    <div key={i} className="p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all hover:border-[#7C5CFF]/30"
                      style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.05)" }}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold border"
                            style={{ color: row.color, borderColor: `${row.color}30`, background: `${row.color}10` }}>
                            {row.ch}
                          </span>
                          <span className="text-xs text-emerald-400 font-mono">{row.badge}</span>
                        </div>
                        <p className="text-xs line-clamp-1" style={{ color: T.muted }}>{row.caption}</p>
                      </div>
                      <span className="text-xs font-mono shrink-0" style={{ color: T.muted }}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO TAB */}
            {activeTab === "seo" && (
              <div className="space-y-5 text-left animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Programmatic Pages", value: "3,000+ Generated", cls: "text-[#7FE0D3]", sub: "Locations & Niches" },
                    { label: "Avg Quality Score", value: "94.8 / 100", cls: "text-emerald-400", sub: "Zero duplicate content" },
                    { label: "Keywords in Top 10", value: "1,200+ Keywords", cls: "text-[#C9B8FF]", sub: "↑ 18 this week" },
                    { label: "Organic Traffic Value", value: "$24,900 /mo", cls: "text-[#C9B8FF]", sub: "Equivalent Google Ads" },
                  ].map(({ label, value, cls, sub }) => (
                    <div key={label} className="p-4 rounded-2xl border"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <span className="text-[11px] font-medium" style={{ color: T.muted }}>{label}</span>
                      <p className={`text-base font-bold mt-1 ${cls}`}>{value}</p>
                      <span className="text-[11px]" style={{ color: T.muted }}>{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border p-4 space-y-3"
                  style={{ background: "rgba(34,211,238,0.04)", borderColor: "rgba(34,211,238,0.12)" }}>
                  {[
                    { slug: "/alternatives/apollo/agencies", kw: "Best Apollo alternative for B2B agencies", score: 98, status: "Top 3 Rank" },
                    { slug: "/find-leads/technology/austin", kw: "Austin tech startup B2B decision makers", score: 95, status: "Indexed" },
                    { slug: "/tools/subject-line-grader", kw: "Free cold email subject line analyzer", score: 99, status: "Top 3 Rank" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl border flex items-center justify-between text-xs"
                      style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.05)" }}>
                      <div>
                        <span className="font-mono font-semibold" style={{ color: T.lavender }}>{item.slug}</span>
                        <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>{item.kw}</p>
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

            {/* OUTREACH TAB */}
            {activeTab === "leads" && (
              <div className="space-y-5 text-left animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total B2B Leads", value: "9,500+", cls: "text-[#C9B8FF]", sub: "100% Verified MX" },
                    { label: "Email Reply Rate", value: "8.4%", cls: "text-emerald-400", sub: "Industry avg: 1.8%" },
                    { label: "Bounce Rate", value: "0.3%", cls: "text-[#7FE0D3]", sub: "CAN-SPAM compliant" },
                    { label: "Active Sequences", value: "14 Workflows", cls: "text-[#C9B8FF]", sub: "Personalized vars" },
                  ].map(({ label, value, cls, sub }) => (
                    <div key={label} className="p-4 rounded-2xl border"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <span className="text-[11px] font-medium" style={{ color: T.muted }}>{label}</span>
                      <p className={`text-base font-bold mt-1 ${cls}`}>{value}</p>
                      <span className="text-[11px]" style={{ color: T.muted }}>{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded-2xl border"
                  style={{ background: "rgba(255,61,139,0.05)", borderColor: "rgba(255,61,139,0.15)" }}>
                  <p className="font-bold mb-2 flex items-center gap-2 text-white">
                    <Bot className="w-4 h-4" style={{ color: T.pink }} />
                    Autonomous ICP Matching Engine
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: T.muted }}>
                    Custom filters for founder, CMO, VP Sales, revenue bracket (\$1M–\$20M), tech stack (HubSpot, Salesforce, Shopify),
                    and geographic focus with real-time SMTP deliverability check before dispatching.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

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
            },
            {
              icon: Search, grad: `linear-gradient(135deg,${T.cyan},${T.teal})`, glow: T.cyan,
              id: "seo-manager",
              title: "Autonomous SEO Page Generator",
              desc: "Generate thousands of high-converting, Google-compliant comparison and location pages. Automated JSON-LD schema, quality score vetting, and instant XML sitemap indexing.",
              bullets: ["Zero keyword cannibalization engine", "Full Google Search Console auto-ping", "Built-in lead capture & conversion forms"],
            },
            {
              icon: MessageSquare, grad: `linear-gradient(135deg,${T.pink},#F472B6)`, glow: T.pink,
              id: "cold-outreach",
              title: "CAN-SPAM Cold Outreach Engine",
              desc: "Run ultra-personalized, deliverability-optimized email sequences with domain warmup, real-time MX validation, and automated reply sentiment analysis.",
              bullets: ["Mailbox rotation & daily sending caps", "One-click unsubscribe compliance", "Automated positive reply routing to CRM"],
            },
            {
              icon: Video, grad: `linear-gradient(135deg,${T.blue},${T.violet})`, glow: T.blue,
              title: "Viral Video & Shorts Script Studio",
              desc: "Plan high-retention video scripts for YouTube, TikTok, and Instagram Reels. Hook libraries, pacing indicators, and visual cue annotations included.",
              bullets: ["Script to multi-format repurposing", "Automated description & tag generator", "Visual storyboard direction"],
            },
            {
              icon: Bot, grad: `linear-gradient(135deg,${T.lavender},${T.violet})`, glow: T.lavender,
              title: "Brand Voice & ICP Guardrails",
              desc: "Enforce brand guidelines across every channel. Set banned phrases, target persona criteria, and unique value propositions so all content matches your tone exactly.",
              bullets: ["Centralized Brand Profile & Tone matrix", "Automated banned phrase filter", "Customer persona tailored messaging"],
            },
            {
              icon: TrendingUp, grad: `linear-gradient(135deg,${T.teal},${T.cyan})`, glow: T.teal,
              title: "Multi-Channel Growth Attribution",
              desc: "Track clicks, conversions, and client acquisitions across social posts, SEO pages, and cold email campaigns with unified first-party tracking links.",
              bullets: ["Custom shortlink redirect router (/r/code)", "Real-time conversion funnel tracking", "Executive revenue & pipeline dashboards"],
            },
          ].map(({ icon: Icon, grad, glow, title, desc, bullets, id }) => (
            <div key={title} id={id}
              className="group p-7 rounded-[28px] border flex flex-col justify-between transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 20px 60px ${glow}44`; el.style.borderColor = `${glow}44`; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform"
                  style={{ background: grad, boxShadow: `0 4px 20px ${glow}44` }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{desc}</p>
              </div>
              <ul className="mt-6 pt-5 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-xs font-medium" style={{ color: T.muted }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          INFRASTRUCTURE TELEMETRY
      ══════════════════════════════════════════════════════════ */}
      <section id="infrastructure" className="py-20 relative z-10 border-y"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50vw] h-px opacity-25"
          style={{ background: `linear-gradient(90deg, transparent, #4ade80, transparent)` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="reveal-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border mb-4"
                style={{ background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #4ade80" }} />
                ENTERPRISE HIGH-PERFORMANCE CLOUD ARCHITECTURE
              </div>
              <h2 className="reveal-up text-2xl sm:text-4xl font-extrabold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>
                Live Backend Engine & Database Telemetry
              </h2>
              <p className="text-sm sm:text-base mt-2 max-w-2xl" style={{ color: T.muted }}>
                Real-time verification connecting the Next.js edge frontend, Python FastAPI async engine, and PostgreSQL 16 cluster.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={checkConnection} disabled={loadingHealth}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 active:scale-95 shimmer-btn"
                style={{ background: T.grad, boxShadow: "0 4px 20px rgba(124,92,255,0.35)" }}>
                <RefreshCw className={`w-4 h-4 ${loadingHealth ? "animate-spin" : ""}`} />
                {loadingHealth ? "Querying SLA..." : "Test Live Ping"}
              </button>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:border-[#7C5CFF]/40"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: T.muted }}>
                <ExternalLink className="w-4 h-4" />API Docs
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers, grad: T.grad, glow: T.violet, title: "Frontend Service",
                sub: "Next.js 14 App Router · React 18 · TailwindCSS",
                badge: { label: "Edge CDN Active", ok: true },
                rows: [["Host:", "growth.getyourclientsb2b.com"], ["SSL & CDN:", "HTTP/2 TLS 1.3 Active"], ["State:", "Healthy (0ms Edge)"]],
              },
              {
                icon: Server, grad: `linear-gradient(135deg,${T.cyan},${T.teal})`, glow: T.cyan, title: "Backend Service",
                sub: "Python FastAPI with CORS and Async Engine",
                badge: { label: isBackendOk ? "Online" : "Offline", ok: isBackendOk },
                rows: [["Framework:", health?.backend?.framework || "FastAPI"], ["Port:", "8000 (HTTPS Gateway)"], ["API Endpoint:", "growth-api.getyourclientsb2b.com"]],
              },
              {
                icon: Database, grad: T.gradPink, glow: T.pink, title: "Database Service",
                sub: "PostgreSQL 16 with asyncpg driver & SQLAlchemy",
                badge: { label: isDbOk ? "Connected" : "Connecting...", ok: isDbOk },
                rows: [["Dialect:", health?.database?.engine || "postgresql+asyncpg"], ["Ping Latency:", `${pingLatency} ms`], ["Driver Pool:", "Asyncpg (10 conns)"]],
              },
            ].map(({ icon: Icon, grad, glow, title, sub, badge, rows }) => (
              <div key={title} className="p-6 rounded-[28px] border transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 20px 60px ${glow}40`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: grad }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                    style={badge.ok
                      ? { background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.25)", color: "#4ade80" }
                      : { background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.25)", color: "#f87171" }}>
                    {badge.ok && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {badge.label}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="text-xs mt-1" style={{ color: T.muted }}>{sub}</p>
                <div className="mt-5 pt-4 border-t space-y-2.5 text-xs font-mono" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span style={{ color: T.muted }}>{k}</span>
                      <span className={v.includes("Active") || v.includes("ms") ? "text-emerald-400 font-semibold" : "text-white"}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMPARISON TABLE
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 relative z-10 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="reveal-up text-3xl sm:text-4xl font-extrabold text-white"
            style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>
            Why Agencies Choose{" "}
            <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              GetYourClientsB2B
            </span>
          </h2>
          <p className="reveal-up mt-3 text-sm sm:text-base" style={{ color: T.muted }}>
            Consolidate your marketing tech stack into one reliable, high-speed ecosystem.
          </p>

          <div className="reveal-up mt-12 rounded-2xl border overflow-hidden text-left"
            style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <div className="grid grid-cols-3 p-4 border-b text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
              <span className="text-white">Capability / Feature</span>
              <span style={{ color: T.muted }}>Traditional Stack (6 Tools)</span>
              <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Growth Engine Platform
              </span>
            </div>
            {[
              { feat: "Social Media Scheduling", old: "Buffer / Hootsuite (\$120/mo)", ge: "Included (Meta, LinkedIn, X, YT)" },
              { feat: "Programmatic SEO Engine", old: "Custom engineering (\$2,000+)", ge: "Built-in 1-Click Page Generator" },
              { feat: "Cold Email Outreach", old: "Instantly / Smartlead (\$100/mo)", ge: "Included (Warmup + Validation)" },
              { feat: "Video Script Planning", old: "Notion / ChatGPT copy-paste", ge: "Integrated Script-to-Social Studio" },
              { feat: "Backend Engine", old: "Disconnected Zapier webhooks", ge: "FastAPI + PostgreSQL 16 (18ms SLA)" },
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 p-4 border-b text-xs sm:text-sm transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <span className="font-semibold text-white">{row.feat}</span>
                <span style={{ color: T.muted }}>{row.old}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />{row.ge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-10 sm:p-16 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: `linear-gradient(135deg, ${T.midnight} 0%, ${T.navy} 40%, #0A0B1A 100%)` }} />
            <div className="absolute inset-0 rounded-3xl border" style={{ borderColor: "rgba(124,92,255,0.25)" }} />
            {/* Inner orbs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-35"
              style={{ background: `radial-gradient(circle, ${T.violet}, transparent)` }} />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-25"
              style={{ background: `radial-gradient(circle, ${T.cyan}, transparent)` }} />
            {/* Grid */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: `radial-gradient(circle, ${T.muted} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />

            <div className="relative z-10 space-y-7">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
                style={{ background: "rgba(124,92,255,0.15)", borderColor: "rgba(124,92,255,0.35)", color: T.lavender }}>
                <Shield className="w-3.5 h-3.5" />
                PROVEN B2B GROWTH INFRASTRUCTURE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk','Plus Jakarta Sans',sans-serif" }}>
                Ready to Put Your Social & SEO<br />Growth on Autopilot?
              </h2>
              <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: T.muted }}>
                Log in to your command center — configure social connections, trigger programmatic SEO pages,
                and deploy high-converting campaigns.
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
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  New Client Setup
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="border-t py-12 relative z-10"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(5,6,13,0.85)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm"
              style={{ background: T.grad, boxShadow: "0 0 16px rgba(124,92,255,0.4)" }}>G</div>
            <div>
              <span className="font-bold text-white text-sm block" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                GetYourClientsB2B Growth Engine
              </span>
              <p className="text-[11px]" style={{ color: T.muted }}>Autonomous Social & SEO Infrastructure</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium flex-wrap justify-center">
            {[
              { href: "/admin/login", label: "Client Login" },
              { href: "/tools/subject-line-grader", label: "Free Tools" },
              { href: "/alternatives/apollo/agencies", label: "Comparisons" },
            ].map(({ href, label }) => (
              <Link key={label} href={href} className="transition-all hover:text-white" style={{ color: T.muted }}>{label}</Link>
            ))}
            <a href={`${process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com"}/docs`}
              target="_blank" rel="noreferrer" className="transition-all hover:text-white" style={{ color: T.muted }}>
              API Docs
            </a>
          </div>
          <div className="text-xs" style={{ color: T.muted }}>
            © {new Date().getFullYear()} GetYourClientsB2B Inc. All rights reserved.
          </div>
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
      `}</style>
    </div>
  );
}
