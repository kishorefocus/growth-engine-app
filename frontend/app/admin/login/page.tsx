"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/lib/hooks";
import { clearTokens, getAccessToken, hasAuthCookie, setTokens } from "@/lib/api-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
  Zap,
  CheckCircle2,
  Shield,
  BarChart3,
  Globe,
} from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f0f2ff] dark:bg-[#0a0a0f] flex items-center justify-center text-slate-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/dashboard";
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const isFromMiddleware = searchParams.has("next");
    const token = getAccessToken();
    const hasCookie = hasAuthCookie();
    if (isFromMiddleware) {
      if (!hasCookie) clearTokens();
      return;
    }
    if (token && hasCookie) router.replace(next);
  }, [next, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login.mutateAsync({ email, password });
      setTokens(data.access_token, data.refresh_token);
      toast.success("Login successful! Redirecting...");
      window.location.href = next;
    } catch (err: any) {
      toast.error(err.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2ff] dark:bg-[#0a0a0f] flex transition-colors">

      {/* ── Left panel — Vibrant Branding ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12">
        {/* Light mode: vibrant gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-[#0d0f1c] dark:via-[#0d0f1c] dark:to-[#0d0f1c]" />
        {/* Light mode accent shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 dark:bg-violet-600/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/20 dark:bg-indigo-600/15 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-20 dark:opacity-10" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/20 dark:bg-violet-500/20 border border-white/30 dark:border-violet-500/40 flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 text-white dark:text-violet-400" />
            </div>
            <span className="text-white dark:text-white font-bold text-lg tracking-tight">GetYourClientsB2B</span>
          </div>
          <span className="text-white/60 dark:text-violet-400/70 text-xs font-mono ml-[52px]">Growth Engine v2.0</span>
        </div>

        {/* Main pitch */}
        <div className="relative z-10 space-y-7">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight drop-shadow-sm">
              One platform.<br />
              <span className="text-white/80 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-violet-400 dark:to-indigo-400">
                Every growth channel.
              </span>
            </h1>
            <p className="text-white/75 dark:text-slate-300 text-base leading-relaxed max-w-sm mt-3">
              Cold email outreach, social content automation, programmatic SEO, video planning, and launch tracking — all in one admin.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "📧", label: "Cold Email", desc: "CAN-SPAM compliant", color: "bg-white/15 dark:bg-white/[0.04] border-white/25 dark:border-white/[0.08]" },
              { icon: "📱", label: "Social Auto", desc: "Official APIs only", color: "bg-white/15 dark:bg-white/[0.04] border-white/25 dark:border-white/[0.08]" },
              { icon: "🔍", label: "SEO Pages", desc: "Programmatic at scale", color: "bg-white/15 dark:bg-white/[0.04] border-white/25 dark:border-white/[0.08]" },
              { icon: "🚀", label: "Launch Hub", desc: "PH, G2, Capterra", color: "bg-white/15 dark:bg-white/[0.04] border-white/25 dark:border-white/[0.08]" },
            ].map((item) => (
              <div key={item.label} className={`p-3.5 rounded-2xl border ${item.color} flex items-start gap-3 backdrop-blur-sm`}>
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-white">{item.label}</p>
                  <p className="text-[11px] text-white/60 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            {[
              { icon: CheckCircle2, value: "99.9%", label: "Uptime SLA" },
              { icon: BarChart3, value: "142K+", label: "Monthly Reach" },
              { icon: Globe, value: "5", label: "Platforms" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-black text-white">{value}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DRY_RUN notice */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/20 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-500/20 w-fit backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-amber-300 dark:text-amber-400" />
            <span className="text-xs text-amber-200 dark:text-amber-300 font-medium">DRY_RUN mode active — no sends until you enable live mode</span>
          </div>
        </div>
      </div>

      {/* ── Right panel — Login Form ───────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-white/70 dark:bg-[#0a0a0f] backdrop-blur-sm transition-colors">
        {/* Subtle background gradient for light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-transparent to-violet-50/40 dark:from-transparent dark:to-transparent pointer-events-none" />

        {/* Theme toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-lg">GetYourClientsB2B Growth Engine</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Access your growth engine dashboard.{" "}
              <a href="/admin/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold transition-colors">
                First time? Register →
              </a>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
                className="w-full bg-white/90 dark:bg-white/[0.04] border border-indigo-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/15 focus:bg-white dark:focus:bg-white/[0.06] transition-all shadow-sm"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password"
                  className="w-full bg-white/90 dark:bg-white/[0.04] border border-indigo-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/15 focus:bg-white dark:focus:bg-white/[0.06] transition-all shadow-sm pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={login.isPending}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:brightness-110 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2 active:scale-[0.98] group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {login.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
              ) : (
                <><span>Sign in to Dashboard</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Internal tool — secured with JWT + 30-day refresh tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
}
