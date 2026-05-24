import { ReactNode } from "react";

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
    <div className="min-h-screen bg-mesh-dark p-4 text-white md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel relative overflow-hidden p-8 md:p-12">
          <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />
          <p className="text-sm uppercase tracking-[0.3em] text-brand-100">Bill Desk</p>
          <h1 className="mt-6 max-w-xl font-display text-5xl font-semibold leading-tight">
            Premium POS billing and inventory control for every kind of shop.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Built for grocery, fashion, electronics, medical, restaurant, hardware, and hybrid stores with fast billing, AI insights, and branch-level control.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "Live billing with barcode, QR, and split payment support",
              "Stock intelligence, supplier management, and low-stock alerts",
              "Role-based access for owner, cashier, and accountant",
              "Reports, CRM, loyalty, and cloud-ready backups"
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-md">
            <h2 className="font-display text-3xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
