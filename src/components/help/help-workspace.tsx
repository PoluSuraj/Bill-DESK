"use client";

import { BookOpen, CheckCircle2, CreditCard, Package2, ShieldCheck, Users2, Wallet } from "lucide-react";

const quickStart = [
  "Open Settings and enter shop name, address, GST number, invoice prefix, and UPI ID.",
  "Go to Inventory and add products with price, stock, SKU, barcode, and GST rate.",
  "Open Customers to save regular buyers with mobile, email, address, and credit details.",
  "Use Billing to choose products, enter customer details, select payment mode, and generate the bill.",
  "Use Reports to review daily sales, profit, GST totals, and export summaries.",
  "If you are the platform owner, use Admin Panel to control subscriptions, offers, and shop access."
];

const modules = [
  {
    title: "Billing Counter",
    icon: CreditCard,
    points: [
      "Search products by name, SKU, barcode, or category.",
      "Add quantity, discount, GST or non-GST mode, and payment status.",
      "Enter customer name, mobile, email, and address directly while billing.",
      "Generate invoice preview, print invoice, download text copy, and download PDF invoice.",
      "Show UPI QR code for UPI and split payments."
    ]
  },
  {
    title: "Inventory Management",
    icon: Package2,
    points: [
      "Add, edit, and delete products.",
      "Track stock levels and low-stock visibility.",
      "Store barcode, GST rate, purchase price, and selling price.",
      "Auto-reduce stock after invoice generation."
    ]
  },
  {
    title: "Customer Management",
    icon: Users2,
    points: [
      "Save regular customers for fast billing.",
      "Track loyalty points and credit balance.",
      "Store phone, email, notes, segment, birthday, and address.",
      "Create new customer directly from the billing screen."
    ]
  },
  {
    title: "Reports & Analytics",
    icon: Wallet,
    points: [
      "View sales totals, invoice performance, and profit numbers.",
      "Review GST values and payment status mix.",
      "Export report data for business review."
    ]
  },
  {
    title: "Admin Control",
    icon: ShieldCheck,
    points: [
      "Administrator role login.",
      "Manage tenant shops, plans, subscription status, and access.",
      "Create and remove promotional offers.",
      "Monitor platform growth from one dashboard."
    ]
  }
];

const platformStatus = [
  "Ready now: billing, inventory, customers, reports, settings, admin panel, UPI QR, printable invoice, PDF invoice download.",
  "Works as guided flow: WhatsApp Web and Gmail open with PDF/manual attach flow on desktop.",
  "Needs provider setup for real server sending: Resend for email and Twilio WhatsApp for PDF delivery.",
  "Needs backend completion for full commercial SaaS: real database records, persistent invoices, deployed public app URL, provider credentials, branch isolation, backups, and audit logs."
];

export function HelpWorkspace() {
  return (
    <div className="space-y-4">
      <section className="glass-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-700 dark:text-brand-100">
              <BookOpen className="h-4 w-4" />
              Bill Desk Help Center
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">Everything this software can do</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              This page is designed for shopkeepers, staff, accountants, and software buyers so they can understand the product quickly without guessing what each screen does.
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-700 dark:text-emerald-200">
            Built for grocery, clothing, electronics, medical, hardware, restaurant, and multi-business billing workflows.
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-6">
          <h3 className="font-display text-2xl font-semibold">Quick Start</h3>
          <div className="mt-5 space-y-3">
            {quickStart.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-6">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-display text-2xl font-semibold">Current Product Status</h3>
          <div className="mt-5 space-y-3">
            {platformStatus.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-sm leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div key={module.title} className="glass-panel p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-700 dark:text-brand-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold">{module.title}</h3>
              </div>
              <div className="mt-5 space-y-3">
                {module.points.map((point) => (
                  <div key={point} className="rounded-2xl bg-slate-900/5 p-4 text-sm leading-6 dark:bg-white/5">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
