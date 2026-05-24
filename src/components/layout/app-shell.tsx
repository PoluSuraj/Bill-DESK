"use client";

import { Menu, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SessionUser } from "@/types";
import { useAppStore } from "@/store/app-store";

export function AppShell({ children, initialUser }: { children: ReactNode; initialUser: SessionUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (!currentUser || currentUser.id !== initialUser.id || currentUser.role !== initialUser.role) {
      setCurrentUser(initialUser);
    }
  }, [currentUser, initialUser, setCurrentUser]);

  return (
    <div className="min-h-screen bg-mesh-light px-3 py-3 dark:bg-mesh-dark md:px-4 lg:px-6">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <div className="glass-panel flex items-center justify-between px-4 py-3 lg:hidden">
          <div>
            <p className="font-display text-lg font-semibold">Bill Desk</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser?.role === "ADMIN" ? "Admin Console" : "Billing & Inventory"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="lg:hidden">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
          <div className="hidden lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)]">
            <Sidebar />
          </div>
          <main className="min-w-0 space-y-4">
            <Topbar />
            {children}
            <footer className="rounded-[28px] border border-white/10 bg-white/60 px-5 py-4 text-center text-sm text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:bg-white/5 dark:text-slate-400">
              © 2026 PoluSuraj. All rights reserved.
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
