"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/lib/hooks";
import { clearTokens, getAccessToken, hasAuthCookie, setTokens } from "@/lib/api-client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight, Shield, Lock } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const T = {
  bg: "#05060D",
  bg2: "#0A0B1A",
  violet: "#7C5CFF",
  blue: "#3B82F6",
  cyan: "#22D3EE",
  pink: "#FF3D8B",
  lavender: "#C9B8FF",
  muted: "#A1A6C0",
  grad: "linear-gradient(135deg,#7C5CFF,#3B82F6,#22D3EE)",
};

/* ═══════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  { initial: "S", name: "Sarah Chen", role: "Head of Growth · Prismatic", quote: "Tripled our outbound pipeline in 6 weeks. The automation is next-level.", color: T.violet },
  { initial: "M", name: "Marcus Webb", role: "Founder · Stacklify", quote: "One platform replaced four tools. Our CAC dropped by 38% immediately.", color: T.blue },
  { initial: "A", name: "Aisha Okonkwo", role: "CMO · Velox Agency", quote: "The LinkedIn + cold email combo is unmatched. Clients love the ROI reports.", color: T.cyan },
];

const PHONE_CARDS = [
  { emoji: "📸", platform: "Instagram", preview: "Post published · +2.4K reach", rot: "-14deg", anim: "float-a", delay: "0s", bg: `linear-gradient(145deg,#1a0533,#2d1060)`, accent: T.violet },
  { emoji: "💼", platform: "LinkedIn", preview: "Founder post · 847 impressions", rot: "-4deg", anim: "float-b", delay: "1.4s", bg: `linear-gradient(145deg,#001233,#0a2a6e)`, accent: T.blue },
  { emoji: "𝕏", platform: "X / Twitter", preview: "Thread live · 312 retweets", rot: "8deg", anim: "float-c", delay: "0.8s", bg: `linear-gradient(145deg,#0d0d0d,#1a1a2e)`, accent: "#fff" },
];

/* ═══════════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════════ */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted }}>
        Loading…
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOGIN FORM
═══════════════════════════════════════════════════════════ */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/dashboard";
  const login = useLogin();

  /* —— Auth state —— */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [shake, setShake] = useState(false);

  /* —— Testimonial rotator —— */
  const [tIdx, setTIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(id);
  }, []);

  /* —— Auth redirect —— */
  useEffect(() => {
    const isFromMiddleware = searchParams.has("next");
    if (isFromMiddleware) { if (!hasAuthCookie()) clearTokens(); return; }
    if (getAccessToken() && hasAuthCookie()) router.replace(next);
  }, [next, router, searchParams]);

  /* —— Validation —— */
  function validate() {
    let ok = true;
    setEmailErr(""); setPwErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr("Please enter a valid email address"); ok = false; }
    if (password.length < 6) { setPwErr("Password must be at least 6 characters"); ok = false; }
    return ok;
  }

  /* —— Submit —— */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { setShake(true); setTimeout(() => setShake(false), 600); return; }
    try {
      const data = await login.mutateAsync({ email, password });
      setTokens(data.access_token, data.refresh_token);
      toast.success("Login successful! Redirecting…");
      window.location.href = next;
    } catch (err: any) {
      toast.error(err.message || "Login failed. Check your credentials.");
      setShake(true); setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: T.bg, fontFamily: "system-ui,sans-serif" }}>

      {/* ══════════════ LEFT — Glass Login Card ══════════════ */}
      <div style={{ flex: "0 0 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }} className="login-left">

        {/* Mesh gradient orbs */}
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${T.violet}30,transparent 70%)`, top: "-10%", left: "-15%", filter: "blur(60px)", animation: "orb-drift-1 25s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${T.pink}20,transparent 70%)`, bottom: "5%", right: "-10%", filter: "blur(70px)", animation: "orb-drift-2 30s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle,${T.cyan}18,transparent 70%)`, bottom: "30%", left: "60%", filter: "blur(55px)", animation: "orb-drift-3 20s ease-in-out infinite", pointerEvents: "none" }} />
        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(161,166,192,0.12) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* Glass card */}
        <div
          style={{
            width: "100%", maxWidth: 440, position: "relative", zIndex: 1,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(24px)", borderRadius: 28, padding: "2.5rem",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
            animation: shake ? "input-shake 0.55s ease" : "none",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 18, boxShadow: `0 4px 20px ${T.violet}60` }}>G</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "'Space Grotesk',sans-serif" }}>GetYourClientsB2B</div>
              <div style={{ display: "inline-flex", alignItems: "center", marginTop: 2, padding: "1px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: `${T.violet}22`, border: `1px solid ${T.violet}44`, color: T.lavender }}>Growth Engine v2.0</div>
            </div>
          </div>

          <div style={{ marginBottom: 28, marginTop: 20 }}>
            <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 28, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.5px", margin: 0 }}>Welcome back</h1>
            <p style={{ color: T.muted, fontSize: 13.5, marginTop: 6 }}>
              Access your growth engine dashboard.{" "}
              <a href="/admin/register" style={{ color: T.lavender, fontWeight: 600, textDecoration: "none" }}>New Client Setup →</a>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", color: T.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>EMAIL ADDRESS</label>
              <input
                type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailErr(""); }}
                placeholder="you@company.com" autoComplete="email"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${emailErr ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14,
                  outline: "none", transition: "all 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violet}25`; }}
                onBlur={e => { e.target.style.borderColor = emailErr ? "#EF4444" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
              {emailErr && <p style={{ color: "#F87171", fontSize: 11.5, marginTop: 5, marginLeft: 2 }}>{emailErr}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", color: T.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setPwErr(""); }}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${pwErr ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 14, padding: "12px 44px 12px 16px", color: "#fff", fontSize: 14,
                    outline: "none", transition: "all 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violet}25`; }}
                  onBlur={e => { e.target.style.borderColor = pwErr ? "#EF4444" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 0, display: "flex" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErr && <p style={{ color: "#F87171", fontSize: 11.5, marginTop: 5, marginLeft: 2 }}>{pwErr}</p>}
            </div>

            {/* Remember me + forgot */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: T.violet, cursor: "pointer" }} />
                <span style={{ color: T.muted, fontSize: 13 }}>Remember me</span>
              </label>
              <a href="#" style={{ color: T.lavender, fontSize: 13, textDecoration: "none", fontWeight: 500 }}>Forgot password?</a>
            </div>

            {/* Sign In button */}
            <button type="submit" disabled={login.isPending}
              style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: login.isPending ? "not-allowed" : "pointer",
                background: login.isPending ? "rgba(124,92,255,0.5)" : T.grad,
                color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "'Space Grotesk',sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: `0 8px 32px ${T.violet}44`, transition: "all 0.2s", position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { if (!login.isPending) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <span className="shimmer-sweep" style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 38%,rgba(255,255,255,0.18) 50%,transparent 62%)", transform: "translateX(-100%)" }} />
              {login.isPending ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />Signing in…</> : <><Lock size={15} />Sign In<ArrowRight size={15} /></>}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ color: T.muted, fontSize: 12 }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* SSO buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Google", icon: "🔵" },
                { label: "SSO / SAML", icon: "🏢" },
              ].map(({ label, icon }) => (
                <button key={label} type="button"
                  style={{
                    flex: 1, padding: "11px", borderRadius: 12, cursor: "pointer",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: T.muted, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.08)"; el.style.color = "#fff"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.04)"; el.style.color = T.muted; }}
                >
                  <span>{icon}</span>{label}
                </button>
              ))}
            </div>
          </form>

          {/* Security note */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20, color: "rgba(161,166,192,0.5)", fontSize: 11.5 }}>
            <Shield size={12} /><span>Secured with JWT + 30-day refresh tokens</span>
          </div>
        </div>
      </div>

      {/* ══════════════ RIGHT — Animated Panel ══════════════ */}
      <div style={{ flex: "0 0 50%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem" }} className="login-right">
        {/* Background */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${T.bg2} 0%, #0D0F1E 60%, ${T.bg} 100%)` }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${T.violet}15,transparent 65%)`, top: "-20%", right: "-10%", filter: "blur(80px)", animation: "orb-drift-1 28s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${T.cyan}10,transparent 65%)`, bottom: "10%", left: "-5%", filter: "blur(70px)", animation: "orb-drift-2 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(161,166,192,0.07) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, fontSize: 32, color: "#fff", lineHeight: 1.2, margin: 0 }}>
            One Platform.{" "}<br />
            <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Every Growth Channel.
            </span>
          </h2>
          {/* Stat pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            {["142,800+ Reach", "1,200+ Keywords", "9,500+ Leads"].map(s => (
              <span key={s} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: T.muted }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* 3 tilted phone cards */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-end", gap: -12, marginBottom: 48, height: 220 }}>
          {PHONE_CARDS.map((card, i) => (
            <div key={card.platform}
              style={{
                width: 150, height: 200, borderRadius: 20, background: card.bg,
                border: `1px solid rgba(255,255,255,0.12)`, backdropFilter: "blur(12px)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16,
                transform: `rotate(${card.rot}) translateY(${i === 1 ? 0 : 20}px)`,
                animation: `${card.anim} 6s ease-in-out ${card.delay} infinite`,
                boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
                transition: "transform 0.3s ease",
                cursor: "default",
                position: "relative",
                flexShrink: 0,
                marginLeft: i === 0 ? 0 : -20,
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.transform = "rotate(0deg) scale(1.06) translateY(-8px)"; el.style.zIndex = "10"; el.style.boxShadow = `0 30px 60px rgba(0,0,0,0.6), 0 0 20px ${card.accent}44`; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.transform = `rotate(${card.rot}) translateY(${i === 1 ? 0 : 20}px)`; el.style.zIndex = "1"; el.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)"; }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{card.emoji}</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 12, textAlign: "center", fontFamily: "'Space Grotesk',sans-serif" }}>{card.platform}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textAlign: "center", marginTop: 6, lineHeight: 1.5 }}>{card.preview}</div>
              <div style={{ position: "absolute", bottom: 10, right: 10, width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
            </div>
          ))}
        </div>

        {/* Rotating testimonial */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 380, width: "100%" }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name}
              style={{
                position: i === tIdx ? "relative" : "absolute",
                opacity: i === tIdx ? 1 : 0,
                transform: i === tIdx ? "translateY(0)" : "translateY(10px)",
                transition: "all 0.6s ease",
                pointerEvents: i === tIdx ? "auto" : "none",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: "20px 24px", backdropFilter: "blur(16px)",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${t.color},${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14 }}>{t.initial}</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                  <div style={{ color: T.muted, fontSize: 11 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
          {/* Testimonial dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTIdx(i)}
                style={{ width: i === tIdx ? 24 : 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer", transition: "all 0.3s", background: i === tIdx ? T.violet : "rgba(255,255,255,0.2)", padding: 0 }} />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ KEYFRAMES ══════════════ */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orb-drift-1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        @keyframes orb-drift-2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
        @keyframes orb-drift-3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,20px)} }
        @keyframes float-a { 0%,100%{transform:translateY(0) rotate(-14deg)} 50%{transform:translateY(-14px) rotate(-14deg)} }
        @keyframes float-b { 0%,100%{transform:translateY(-6px) rotate(-4deg)} 50%{transform:translateY(10px) rotate(-4deg)} }
        @keyframes float-c { 0%,100%{transform:translateY(4px) rotate(8deg)} 50%{transform:translateY(-10px) rotate(8deg)} }
        @keyframes input-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .shimmer-btn:hover .shimmer-sweep { transform:translateX(220%); transition:transform 0.65s ease; }
        @media (max-width:768px) { .login-right{display:none!important} .login-left{flex:1!important} }
        input::placeholder { color: rgba(161,166,192,0.4); }
        input { color-scheme: dark; }
      ` }} />
    </div>
  );
}
