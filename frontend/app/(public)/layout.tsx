"use client";

import Link from "next/link";
import React, { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, TrendingUp, ChevronRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/tools/subject-line-grader", label: "Subject Grader",    color: "blue" },
  { href: "/tools/email-verifier",      label: "Email Verifier",    color: "cyan" },
  { href: "/alternatives/apollo/agencies", label: "Apollo Alt",    color: "pink" },
  { href: "/find-leads/technology/austin", label: "Find Leads",    color: "green" },
];

const COLOR_MAP: Record<string, string> = {
  blue:  "hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10",
  cyan:  "hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10",
  pink:  "hover:text-pink-700 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10",
  green: "hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10",
  violet:"hover:text-violet-700 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10",
};

const MOBILE_COLOR_MAP: Record<string, string> = {
  blue:  "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
  cyan:  "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10",
  pink:  "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10",
  green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10",
  violet:"text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10",
};

const MOBILE_ICON_GRADIENTS: Record<string, string> = {
  blue:  "from-blue-500 to-cyan-400",
  cyan:  "from-cyan-500 to-sky-400",
  pink:  "from-pink-500 to-rose-400",
  green: "from-green-500 to-emerald-400",
  violet:"from-violet-500 to-purple-400",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f6ff] dark:bg-[#06080f] text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-blue-700 dark:selection:text-blue-300 transition-colors">

      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-3xl animate-orb1" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-pink-400/10 dark:bg-pink-500/5 blur-3xl animate-orb2" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-green-400/08 dark:bg-green-500/4 blur-3xl animate-orb3" />
      </div>

      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#06080f] backdrop-blur-xl transition-colors shadow-sm shadow-slate-200/50 dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 via-pink-500 to-green-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all">
                G
              </div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                GlobalReach
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-0.5 text-sm font-semibold">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-semibold transition-all ${COLOR_MAP[link.color]}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin/login"
              className="hidden sm:block text-sm font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
            >
              Sign In
            </Link>
            <a
              href="https://www.getyourclientsb2b.com/signup?utm_source=public_header&utm_medium=nav&utm_campaign=growth_engine"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-pink-500 to-green-500 hover:brightness-110 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 active:scale-95 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Start Free Trial</span>
              <span className="sm:hidden">Try Free</span>
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-sm"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Dropdown ────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#06080f] shadow-2xl animate-fade-down">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${MOBILE_COLOR_MAP[link.color]}`}
                >
                  <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${MOBILE_ICON_GRADIENTS[link.color]} flex items-center justify-center shrink-0`}>
                    <ChevronRight className="w-3 h-3 text-white" />
                  </span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 pb-1 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                >
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-400 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </span>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* ── Public Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-blue-100/60 dark:border-white/[0.07] bg-white/85 dark:bg-[#04060b]/85 backdrop-blur-sm py-10 sm:py-14 text-sm text-slate-600 dark:text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-pink-500 to-green-500 flex items-center justify-center font-black text-xs text-white shadow-md shadow-blue-500/20">G</div>
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
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Free Tools</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/tools/subject-line-grader" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                  Subject Line Grader
                </Link>
              </li>
              <li>
                <Link href="/tools/email-verifier" className="text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-medium">
                  Email Verifier
                </Link>
              </li>
            </ul>
          </div>

          {/* Comparisons */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Comparisons</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/alternatives/apollo/agencies" className="text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
                  Apollo Alternative
                </Link>
              </li>
              <li>
                <Link href="/alternatives/instantly/b2b-startups" className="text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
                  Instantly Alternative
                </Link>
              </li>
              <li>
                <Link href="/alternatives/lemlist/sales-teams" className="text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
                  Lemlist Alternative
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
                  className="text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
                >
                  Create Account
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                  Admin Login
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
