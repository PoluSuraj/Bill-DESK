"use client";

import { Bell, LogOut, Search, Sparkles, Wifi } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { currency } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function Topbar() {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const globalSearch = useAppStore((state) => state.globalSearch);
  const setGlobalSearch = useAppStore((state) => state.setGlobalSearch);
  const currentUser = useAppStore((state) => state.currentUser);
  const products = useAppStore((state) => state.products);
  const customers = useAppStore((state) => state.customers);
  const invoices = useAppStore((state) => state.invoices);
  const logout = useAppStore((state) => state.logout);
  const setActionMessage = useAppStore((state) => state.setActionMessage);
  const [searchActive, setSearchActive] = useState(false);

  const searchResults = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    if (!query) {
      return [] as string[];
    }

    const productMatches = products
      .filter((product) => [product.name, product.sku, product.category].join(" ").toLowerCase().includes(query))
      .slice(0, 2)
      .map((product) => `Product • ${product.name} • ${currency(product.price)}`);

    const customerMatches = customers
      .filter((customer) => [customer.name, customer.phone, customer.segment].join(" ").toLowerCase().includes(query))
      .slice(0, 2)
      .map((customer) => `Customer • ${customer.name} • ${customer.phone}`);

    const invoiceMatches = invoices
      .filter((invoice) => [invoice.invoiceNumber, invoice.customerName].join(" ").toLowerCase().includes(query))
      .slice(0, 2)
      .map((invoice) => `Invoice • ${invoice.invoiceNumber} • ${currency(invoice.total)}`);

    return [...productMatches, ...customerMatches, ...invoiceMatches].slice(0, 6);
  }, [customers, globalSearch, invoices, products]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setSearchActive(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <header className="glass-panel flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-brand-600 dark:text-brand-100">Live Operations</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Run billing, stock, and growth from one desk</h1>
        {currentUser ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Signed in as {currentUser.name} • {currentUser.role}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start xl:w-auto xl:justify-end">
        <div ref={searchContainerRef} className="relative w-full min-w-0 flex-1 sm:min-w-[260px] lg:max-w-[420px]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/60 px-4 py-3 dark:bg-white/5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={globalSearch}
              onChange={(event) => {
                setGlobalSearch(event.target.value);
                setSearchActive(true);
              }}
              onFocus={() => setSearchActive(true)}
              placeholder="Find any product, invoice, or customer"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </div>
          {searchActive && searchResults.length ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-2xl border border-white/10 bg-white/95 p-3 shadow-soft backdrop-blur dark:bg-slate-950/95">
              {searchResults.map((result) => (
                <button
                  key={result}
                  type="button"
                  onClick={() => {
                    setActionMessage(result);
                    setSearchActive(false);
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  {result}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="hidden items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:flex dark:text-emerald-200">
          <Wifi className="h-4 w-4" />
          Sync Healthy
        </div>
        <button
          type="button"
          onClick={() => setActionMessage(`${invoices.filter((invoice) => invoice.status !== "Paid").length} invoices still need follow-up.`)}
          className="inline-flex h-11 w-full items-center justify-center rounded-2xl sm:w-11 border border-white/15 bg-white/10"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setActionMessage("AI Assist suggests promoting combo offers and restocking low-stock items first.")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 sm:w-auto py-3 text-sm font-medium text-white shadow-glow dark:bg-white dark:text-slate-900"
        >
          <Sparkles className="h-4 w-4" />
          AI Assist
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } catch {}
            logout();
            router.push("/login");
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 sm:w-auto bg-white/10 px-4 py-3 text-sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
