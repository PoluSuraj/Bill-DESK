import { ReactNode } from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AuthShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh-light p-4 text-slate-950 transition-colors duration-300 dark:bg-mesh-dark dark:text-white md:p-6">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-500/15" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-400/15" />

      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/72 dark:shadow-black/30 md:p-12">
          <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700 dark:text-brand-100">Bill Desk</p>
            <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-tight text-slate-950 dark:text-white md:text-5xl">
              Premium POS billing and inventory control for every kind of shop.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
              Built for grocery, fashion, electronics, medical, restaurant, hardware, and hybrid stores with fast billing, AI insights, and branch-level control.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                "Live billing with barcode, QR, and split payment support",
                "Stock intelligence, supplier management, and low-stock alerts",
                "Role-based access for owner, cashier, and accountant",
                "Reports, CRM, loyalty, and cloud-ready backups"
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/78 dark:shadow-black/30 md:p-8">
          <div className="w-full max-w-md">
            <h2 className="font-display text-3xl font-semibold text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
