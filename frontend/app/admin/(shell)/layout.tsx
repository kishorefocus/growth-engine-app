"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

/** Layout for the authenticated admin shell — all sections except login/register */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f0f6ff] dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Animated mesh background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse at 15% 35%, rgba(59,130,246,0.09) 0%, transparent 55%)",
            "radial-gradient(ellipse at 85% 10%, rgba(236,72,153,0.07) 0%, transparent 50%)",
            "radial-gradient(ellipse at 50% 90%, rgba(34,197,94,0.06) 0%, transparent 50%)",
            "radial-gradient(ellipse at 70% 60%, rgba(234,179,8,0.05) 0%, transparent 40%)",
          ].join(", "),
        }}
      />

      {/* Sidebar (handles its own mobile overlay internally) */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
