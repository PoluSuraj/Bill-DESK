"use client";

import { MoonStar, SunMedium } from "lucide-react";

import { useTheme } from "@/components/shared/theme-provider";

export function ThemeToggle() {
  const { mounted, theme, toggleTheme } = useTheme();

  if (!mounted) {
    return <div className="h-11 w-11 rounded-2xl border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/10" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-800 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-black/20 dark:hover:bg-white/20"
      aria-label="Toggle theme"
    >
      {isDark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
    </button>
  );
}
