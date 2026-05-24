"use client";

import { MoonStar, SunMedium } from "lucide-react";

import { useTheme } from "@/components/shared/theme-provider";

export function ThemeToggle() {
  const { mounted, theme, toggleTheme } = useTheme();

  if (!mounted) {
    return <div className="h-11 w-11 rounded-2xl bg-white/10" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/20 dark:text-white"
      aria-label="Toggle theme"
    >
      {isDark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
    </button>
  );
}
