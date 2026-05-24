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
    <div className="min-h-screen overflow-x-hidden bg-mesh-light px-2 py-2 dark:bg-mesh-dark sm:px-3 sm:py-3 md:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-3 sm:space-y-4">
        <div className="glass-panel sticky top-2 z-40 flex items-center justify-between px-4 py-3 lg:hidden">
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
          <div className="fixed inset-0 z-50 bg-slate-950/45 p-3 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}>
            <div className="h-full max-w-[340px]" onClick={(event) => event.stopPropagation()}>
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="hidden lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)]">
            <Sidebar />
          </div>
          <main className="min-w-0 space-y-3 sm:space-y-4">
            <Topbar />
            {children}
            <footer className="rounded-[24px] border border-white/10 bg-white/60 px-4 py-4 text-center text-xs sm:text-sm text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:bg-white/5 dark:text-slate-400">
              © 2026 PoluSuraj. All rights reserved.
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
