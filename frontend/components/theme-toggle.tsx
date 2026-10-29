"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-xl bg-indigo-50 dark:bg-white/[0.04] border border-indigo-100 dark:border-white/10 flex items-center justify-center opacity-0 ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 group active:scale-95 ${
        isDark
          ? "bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-amber-400"
          : "bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600"
      } shadow-sm ${className}`}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label="Toggle visual theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}


