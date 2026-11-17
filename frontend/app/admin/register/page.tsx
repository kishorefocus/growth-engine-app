"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/lib/hooks";
import { getAccessToken, setTokens } from "@/lib/api-client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ChevronRight, ChevronLeft, Check, ArrowRight, Zap } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════ */
const T = {
  bg: "#05060D", bg2: "#0A0B1A",
  violet: "#7C5CFF", blue: "#3B82F6", cyan: "#22D3EE", pink: "#FF3D8B",
  lavender: "#C9B8FF", muted: "#A1A6C0",
  grad: "linear-gradient(135deg,#7C5CFF,#3B82F6,#22D3EE)",
};

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
function pwStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(s, 4) as 0 | 1 | 2 | 3 | 4;
}
const PW_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const PW_COLORS = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

/* ═══════════════════════════════════════════════════════
   CHANNELS DATA
═══════════════════════════════════════════════════════ */
const CHANNELS = [
  { id: "meta",     label: "Facebook & Instagram", emoji: "📘", sub: "Meta Business Suite", color: "#1877F2" },
  { id: "linkedin", label: "LinkedIn",              emoji: "💼", sub: "LinkedIn v2 API",      color: "#0A66C2" },
  { id: "youtube",  label: "YouTube",               emoji: "🎬", sub: "YouTube Data API v3",  color: "#FF0000" },
  { id: "x",        label: "X / Twitter",           emoji: "🐦", sub: "X API v2",             color: "#000" },
];

/* ═══════════════════════════════════════════════════════
   CONFETTI
═══════════════════════════════════════════════════════ */
const CONFETTI_COLORS = ["#7C5CFF","#3B82F6","#22D3EE","#FF3D8B","#F59E0B","#10B981","#C9B8FF"];
function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${1.8 + Math.random() * 1.2}s`,
    size: Math.round(6 + Math.random() * 8),
    rotate: Math.random() * 360,
  }));
  return (
    <>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: p.left, top: 0,
          width: p.size, height: p.size, borderRadius: p.size > 10 ? "50%" : 2,
          background: p.color, animation: `confetti-fall ${p.duration} ${p.delay} ease-in both`,
          transform: `rotate(${p.rotate}deg)`, pointerEvents: "none",
        }} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   INPUT COMPONENT
═══════════════════════════════════════════════════════ */
function GlassInput({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", color: T.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>{label.toUpperCase()}</label>
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "#EF4444" : focused ? T.violet : "rgba(255,255,255,0.1)"}`,
          borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", transition: "all 0.2s",
          boxShadow: focused ? `0 0 0 3px ${T.violet}22` : "none",
          ...props.style,
        }}
      />
      {error && <p style={{ color: "#F87171", fontSize: 11.5, marginTop: 5, marginLeft: 2 }}>{error}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SELECT COMPONENT
═══════════════════════════════════════════════════════ */
function GlassSelect({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label style={{ display: "block", color: T.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>{label.toUpperCase()}</label>
      <select {...props} style={{
        width: "100%", boxSizing: "border-box",
        background: "#0A0B1A", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", transition: "all 0.2s",
        ...props.style,
      }}>
        {children}
      </select>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STEP PROGRESS BAR
═══════════════════════════════════════════════════════ */
function StepBar({ step }: { step: number }) {
  const steps = ["Account", "Agency Details", "Channels"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {steps.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 14, transition: "all 0.4s",
                background: done ? "#10B981" : active ? T.grad : "rgba(255,255,255,0.06)",
                border: `2px solid ${done ? "#10B981" : active ? T.violet : "rgba(255,255,255,0.12)"}`,
                color: done || active ? "#fff" : T.muted,
                boxShadow: active ? `0 0 16px ${T.violet}55` : "none",
              }}>
                {done ? <Check size={16} /> : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? "#fff" : T.muted, whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: "0 8px", marginBottom: 20, borderRadius: 2, background: "rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 2, background: T.grad, width: i < step ? "100%" : "0%", transition: "width 0.6s ease" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();

  /* —— redirect if already logged in —— */
  useEffect(() => { if (getAccessToken()) router.replace("/admin/dashboard"); }, []);

  /* —— wizard state —— */
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
  const [success, setSuccess] = useState(false);

  /* —— step 1: Account —— */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});

  /* —— step 2: Agency —— */
  const [agencyName, setAgencyName] = useState("");
  const [website, setWebsite] = useState("");
  const [icp, setIcp] = useState("");
  const [industry, setIndustry] = useState("Agency");

  /* —— step 3: Channels —— */
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<Set<string>>(new Set());

  const strength = pwStrength(password);

  /* —— validation per step —— */
  function validateStep1() {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Valid email required";
    if (password.length < 6) e.password = "At least 6 characters required";
    if (password !== confirmPw) e.confirmPw = "Passwords do not match";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!agencyName.trim()) e.agencyName = "Agency name is required";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setDirection("fwd");
    setStep(s => s + 1);
    setErrs({});
  }

  function goBack() {
    setDirection("back");
    setStep(s => s - 1);
    setErrs({});
  }

  /* —— channel connect simulation —— */
  function connectChannel(id: string) {
    if (connected.has(id)) { const s = new Set(connected); s.delete(id); setConnected(s); return; }
    setConnecting(prev => new Set(prev).add(id));
    setTimeout(() => {
      setConnecting(prev => { const s = new Set(prev); s.delete(id); return s; });
      setConnected(prev => new Set(prev).add(id));
    }, 1500);
  }

  /* —— final submit —— */
  async function handleFinish() {
    try {
      const data = await register.mutateAsync({ email, password });
      setTokens(data.access_token, data.refresh_token);
      setSuccess(true);
      setTimeout(() => router.push("/admin/dashboard"), 3000);
    } catch (err: any) {
      if (err.status === 403) toast.error("Registration locked — contact owner.");
      else { toast.error(err.message || "Registration failed."); }
    }
  }

  /* ——— slide animation key ——— */
  const slideKey = `${step}-${direction}`;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden", fontFamily: "system-ui,sans-serif" }}>
      {/* Background orbs */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${T.violet}20,transparent 70%)`, top: "-15%", left: "-10%", filter: "blur(70px)", animation: "orb1 25s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${T.cyan}14,transparent 70%)`, bottom: "5%", right: "-5%", filter: "blur(60px)", animation: "orb2 30s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(161,166,192,0.07) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 520, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(24px)", borderRadius: 28, padding: "2.5rem", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", padding: 5, boxShadow: `0 4px 16px ${T.violet}40`, overflow: "hidden" }}>
            <img src="/images/logo.png" alt="GetYourClientsB2B" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 13.5, fontFamily: "'Space Grotesk',sans-serif" }}>GetYourClientsB2B Growth Engine</div>
            <div style={{ color: T.muted, fontSize: 11 }}>New Client Setup</div>
          </div>
          <a href="/admin/login" style={{ marginLeft: "auto", color: T.lavender, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Sign in →</a>
        </div>

        {!success ? (
          <>
            <StepBar step={step} />

            {/* Step panels */}
            <div style={{ overflow: "hidden", position: "relative" }}>
              <div key={slideKey} style={{ animation: `${direction === "fwd" ? "slide-in-right" : "slide-in-left"} 0.38s cubic-bezier(0.22,1,0.36,1) both` }}>

                {/* ── STEP 1: Account ── */}
                {step === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", margin: 0 }}>Create your account</h2>
                    <GlassInput label="Full Name" type="text" placeholder="Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} error={errs.fullName} />
                    <GlassInput label="Email Address" type="email" placeholder="jane@agency.com" value={email} onChange={e => setEmail(e.target.value)} error={errs.email} />
                    <div>
                      <label style={{ display: "block", color: T.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>PASSWORD</label>
                      <div style={{ position: "relative" }}>
                        <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: `1px solid ${errs.password ? "#EF4444" : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: "12px 44px 12px 16px", color: "#fff", fontSize: 14, outline: "none" }} />
                        <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer" }}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                      </div>
                      {/* Strength meter */}
                      {password && (
                        <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                          {[1,2,3,4].map(lvl => (
                            <div key={lvl} style={{ flex: 1, height: 3, borderRadius: 2, background: strength >= lvl ? PW_COLORS[strength] : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
                          ))}
                          <span style={{ color: PW_COLORS[strength] || T.muted, fontSize: 11, fontWeight: 600, marginLeft: 4, whiteSpace: "nowrap" }}>{PW_LABELS[strength]}</span>
                        </div>
                      )}
                      {errs.password && <p style={{ color: "#F87171", fontSize: 11.5, marginTop: 5 }}>{errs.password}</p>}
                    </div>
                    <div style={{ position: "relative" }}>
                      <GlassInput label="Confirm Password" type={showConfirm ? "text" : "password"} placeholder="Repeat password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} error={errs.confirmPw} style={{ paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: 36, background: "none", border: "none", color: T.muted, cursor: "pointer" }}>{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Agency Details ── */}
                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", margin: 0 }}>Tell us about your agency</h2>
                    <GlassInput label="Agency Name" type="text" placeholder="Acme Growth Agency" value={agencyName} onChange={e => setAgencyName(e.target.value)} error={errs.agencyName} />
                    <GlassInput label="Website URL" type="url" placeholder="https://youragency.com" value={website} onChange={e => setWebsite(e.target.value)} />
                    <div>
                      <label style={{ display: "block", color: T.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>ICP DESCRIPTION</label>
                      <textarea value={icp} onChange={e => setIcp(e.target.value)} placeholder="Describe your ideal client profile — industry, company size, pain points…" rows={3}
                        style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                    </div>
                    <GlassSelect label="Industry" value={industry} onChange={e => setIndustry(e.target.value)}>
                      {["SaaS", "Agency", "E-commerce", "Consulting", "Other"].map(o => <option key={o} value={o}>{o}</option>)}
                    </GlassSelect>
                  </div>
                )}

                {/* ── STEP 3: Connect Channels ── */}
                {step === 2 && (
                  <div>
                    <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", margin: "0 0 6px" }}>Connect your channels</h2>
                    <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>You can skip any and connect later from Settings.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {CHANNELS.map(ch => {
                        const isConnected = connected.has(ch.id);
                        const isConnecting = connecting.has(ch.id);
                        return (
                          <div key={ch.id}
                            style={{
                              padding: "16px", borderRadius: 20, cursor: "pointer", transition: "all 0.3s",
                              background: isConnected ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${isConnected ? "#10B98144" : "rgba(255,255,255,0.09)"}`,
                              boxShadow: isConnected ? "0 0 20px rgba(16,185,129,0.12)" : "none",
                            }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{ch.emoji}</div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{ch.label}</div>
                            <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>{ch.sub}</div>
                            <button onClick={() => connectChannel(ch.id)}
                              style={{
                                width: "100%", padding: "8px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.3s",
                                background: isConnected ? "#10B981" : "rgba(255,255,255,0.08)",
                                color: isConnected ? "#fff" : T.muted,
                              }}>
                              {isConnecting ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite", display: "inline" }} /> : isConnected ? "✓ Connected" : "Connect"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nav buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
              {step > 0 ? (
                <button onClick={goBack}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: T.muted, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  <ChevronLeft size={16} /> Back
                </button>
              ) : <div />}
              {step < 2 ? (
                <button onClick={goNext}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 14, border: "none", background: T.grad, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: `0 6px 24px ${T.violet}44` }}>
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleFinish} disabled={register.isPending}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 14, border: "none", background: T.grad, color: "#fff", fontWeight: 800, fontSize: 14, cursor: register.isPending ? "not-allowed" : "pointer", boxShadow: `0 6px 24px ${T.violet}44`, opacity: register.isPending ? 0.7 : 1 }}>
                  {register.isPending ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Setting up…</> : <><Zap size={15} /> Finish Setup <ArrowRight size={15} /></>}
                </button>
              )}
            </div>
          </>
        ) : (
          /* ── SUCCESS SCREEN ── */
          <div style={{ textAlign: "center", padding: "2rem 1rem", position: "relative", overflow: "hidden", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Confetti />
            {/* Animated checkmark */}
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ marginBottom: 24 }}>
              <circle cx="40" cy="40" r="36" fill="rgba(16,185,129,0.12)" stroke="#10B981" strokeWidth="3" style={{ animation: "check-circle 0.5s ease both" }} />
              <path d="M24 40l12 12 20-24" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: "check-draw 0.6s 0.4s ease forwards" }} />
            </svg>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 28, fontFamily: "'Space Grotesk',sans-serif", margin: "0 0 10px" }}>You're all set! 🎉</h2>
            <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>Your Growth Engine is being configured.<br />Redirecting to dashboard…</p>
            <div style={{ marginTop: 20, width: 48, height: 48, borderRadius: "50%", border: `3px solid ${T.violet}44`, borderTopColor: T.violet, animation: "spin 1s linear infinite" }} />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
        @keyframes slide-in-right { from{transform:translateX(50px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes slide-in-left  { from{transform:translateX(-50px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes confetti-fall   { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(360px) rotate(720deg);opacity:0} }
        @keyframes check-draw      { to{stroke-dashoffset:0} }
        @keyframes check-circle    { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes spin            { to{transform:rotate(360deg)} }
        input::placeholder,textarea::placeholder { color:rgba(161,166,192,0.4); }
        input,select,textarea { color-scheme:dark; }
      ` }} />
    </div>
  );
}
