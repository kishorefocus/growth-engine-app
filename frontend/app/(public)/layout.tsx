import Link from "next/link";
import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2ff] dark:bg-[#06080f] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-700 dark:selection:text-indigo-300 transition-colors">

      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-indigo-100 dark:border-white/[0.07] bg-white/88 dark:bg-[#06080f]/85 backdrop-blur-xl transition-colors shadow-sm shadow-indigo-100/40 dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all">
                G
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                GlobalReach
              </span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
              <Link href="/tools/subject-line-grader" className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                Subject Grader
              </Link>
              <Link href="/tools/email-verifier" className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all">
                Email Verifier
              </Link>
              <Link href="/alternatives/apollo/agencies" className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all">
                Apollo Alternative
              </Link>
              <Link href="/find-leads/technology/austin" className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all">
                Find Leads
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/admin/login"
              className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
            >
              Sign In
            </Link>
            <a
              href="https://www.getyourclientsb2b.com/signup?utm_source=public_header&utm_medium=nav&utm_campaign=growth_engine"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:brightness-110 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Public Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-indigo-100 dark:border-white/[0.07] bg-white/80 dark:bg-[#04060b]/80 backdrop-blur-sm py-14 text-sm text-slate-600 dark:text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center font-black text-xs text-white shadow-md shadow-indigo-500/25">G</div>
              <span className="font-extrabold text-slate-900 dark:text-white">GlobalReach</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              Automated B2B client acquisition engine with real-time contact verification, compliant email sequencing, and multi-channel content planning.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600">
              © {new Date().getFullYear()} GlobalReach Inc. All rights reserved.
            </p>
          </div>

          {/* Free Tools */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Free Sales Tools</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/tools/subject-line-grader" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                  Cold Email Subject Line Grader
                </Link>
              </li>
              <li>
                <Link href="/tools/email-verifier" className="text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-medium">
                  Single Email Deliverability Verifier
                </Link>
              </li>
            </ul>
          </div>

          {/* Comparisons */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Popular Comparisons</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/alternatives/apollo/agencies" className="text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium">
                  Apollo.io Alternative for Agencies
                </Link>
              </li>
              <li>
                <Link href="/alternatives/instantly/b2b-startups" className="text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium">
                  Instantly Alternative for Startups
                </Link>
              </li>
              <li>
                <Link href="/alternatives/lemlist/sales-teams" className="text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium">
                  Lemlist Alternative for Sales Teams
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://www.getyourclientsb2b.com/signup?utm_source=public_footer&utm_medium=footer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                >
                  Create Account
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                  Admin Shell Login
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-600">Privacy &amp; Terms</span>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
