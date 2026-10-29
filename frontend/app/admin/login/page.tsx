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
} from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] flex items-center justify-center text-slate-500">Loading...</div>}>
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

  // Safeguard against infinite redirect loops:
  useEffect(() => {
    const isFromMiddleware = searchParams.has("next");
    const token = getAccessToken();
    const hasCookie = hasAuthCookie();

    // If redirected here because middleware saw no cookie, clear stale tokens and stay on login
    if (isFromMiddleware) {
      if (!hasCookie) {
        clearTokens();
      }
      return;
    }

    // Only redirect if explicitly visiting /admin/login with active token AND valid cookie
    if (token && hasCookie) {
      router.replace(next);
    }
  }, [next, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login.mutateAsync({ email, password });
      // Ensure tokens and 30-day cookie are firmly set
      setTokens(data.access_token, data.refresh_token);
      toast.success("Login successful! Redirecting to dashboard...");
      // Immediate redirect to dashboard
      window.location.href = next;
    } catch (err: any) {
      toast.error(err.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] flex transition-colors">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-[#0c0d15] text-white">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/70 via-[#0c0d15] to-[#0c0d15]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">GetyourclientsB2B</span>
          </div>
          <span className="text-xs font-mono text-violet-400/70 ml-12">Growth Engine</span>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            One platform.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              Every growth channel.
            </span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-sm">
            Cold email outreach, social content automation, programmatic SEO, video planning, and launch tracking — all in one admin.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "📧", label: "Cold Email", desc: "CAN-SPAM compliant" },
              { icon: "📱", label: "Social", desc: "Official APIs only" },
              { icon: "🔍", label: "SEO Pages", desc: "Programmatic at scale" },
              { icon: "🚀", label: "Launch Hub", desc: "PH, G2, Capterra" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-start gap-3"
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 w-fit">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-300 font-medium">DRY_RUN mode active — no sends until you enable live mode</span>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-white dark:bg-[#0a0a0f] transition-colors">
        {/* Floating Theme Toggle in top right */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-slate-900 dark:text-white font-bold">GetyourclientsB2B Growth Engine</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Sign in</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Access your growth engine dashboard.{" "}
              <a href="/admin/register" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">
                First time? Register →
              </a>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-white/[0.06] transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-white/[0.06] transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {login.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Internal tool — not publicly accessible.
          </p>
        </div>
      </div>
    </div>
  );
}
