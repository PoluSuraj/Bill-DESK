"use client";

import { motion } from "framer-motion";
import {
  BadgeIndianRupee,
  BarChart3,
  BookOpen,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const currentUser = useAppStore((state) => state.currentUser);

  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/billing", label: "Billing", icon: BadgeIndianRupee },
    { href: "/inventory", label: "Inventory", icon: Boxes },
    { href: "/customers", label: "Customers", icon: UsersRound },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/help", label: "Help Center", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
    ...(currentUser?.role === "ADMIN"
      ? [{ href: "/admin", label: "Admin Panel", icon: ShieldCheck }]
      : [])
  ];

  return (
    <aside className="glass-panel flex h-full max-h-[calc(100vh-1.5rem)] flex-col overflow-y-auto p-4">
      <div className="mb-6 flex items-center gap-3 px-2 pt-2">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-glow">
          <span className="absolute inset-0 rounded-2xl border border-white/30" />
          <ClipboardList className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-base font-semibold sm:text-lg">Bill Desk</p>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {currentUser?.role === "ADMIN" ? "Platform Admin Console" : "Multi-Business POS Suite"}
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-sm sm:px-4 font-medium transition",
                active
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/5"
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-nav"
                  className="absolute inset-0 rounded-2xl bg-slate-900 dark:bg-white"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-slate-950 p-4 sm:p-5 text-white dark:bg-white dark:text-slate-950">
        <p className="font-display text-lg">{currentUser?.role === "ADMIN" ? "Platform Control" : "AI Inventory Signal"}</p>
        <p className="mt-2 text-sm text-white/70 dark:text-slate-600">
          {currentUser?.role === "ADMIN"
            ? "Review subscriptions, pause access, publish offers, and manage tenant growth from one place."
            : "Demand for restaurant supplies may spike 22% this weekend."}
        </p>
      </div>
    </aside>
  );
}
