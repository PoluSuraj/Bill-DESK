"use client";

import { FormEvent, useState } from "react";

import { useAppStore } from "@/store/app-store";

export default function SettingsPage() {
  const shop = useAppStore((state) => state.shop);
  const currentUser = useAppStore((state) => state.currentUser);
  const updateShop = useAppStore((state) => state.updateShop);
  const lastActionMessage = useAppStore((state) => state.lastActionMessage);
  const [form, setForm] = useState(shop);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateShop(form);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <form onSubmit={submit} className="glass-panel p-6">
        <h2 className="section-title">Operations Control Center</h2>
        <p className="section-subtitle mt-2">
          Configure business identity, tax profile, invoice numbering, payment details, and language.
        </p>
        <div className="mt-6 grid gap-3">
          <input value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} placeholder="Business name" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
          <input value={form.address} onChange={(event) => setForm((state) => ({ ...state, address: event.target.value }))} placeholder="Address" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.gstNumber} onChange={(event) => setForm((state) => ({ ...state, gstNumber: event.target.value }))} placeholder="GST number" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
            <input value={form.phone} onChange={(event) => setForm((state) => ({ ...state, phone: event.target.value }))} placeholder="Phone" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.email} onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))} placeholder="Email" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
            <input value={form.businessType} onChange={(event) => setForm((state) => ({ ...state, businessType: event.target.value }))} placeholder="Business type" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.invoicePrefix} onChange={(event) => setForm((state) => ({ ...state, invoicePrefix: event.target.value.toUpperCase() }))} placeholder="Invoice prefix" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
            <input value={form.upiId} onChange={(event) => setForm((state) => ({ ...state, upiId: event.target.value }))} placeholder="UPI ID" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/40 p-4 dark:bg-white/5">
            <h3 className="font-display text-lg font-semibold">Bank Details For Invoice Footer</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">These details appear in the professional bill footer and PDF export.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.bankName} onChange={(event) => setForm((state) => ({ ...state, bankName: event.target.value }))} placeholder="Bank name" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
              <input value={form.bankBranch} onChange={(event) => setForm((state) => ({ ...state, bankBranch: event.target.value }))} placeholder="Branch" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
              <input value={form.bankAccountNumber} onChange={(event) => setForm((state) => ({ ...state, bankAccountNumber: event.target.value }))} placeholder="Account number" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
              <input value={form.bankIfsc} onChange={(event) => setForm((state) => ({ ...state, bankIfsc: event.target.value.toUpperCase() }))} placeholder="IFSC code" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
              <input value={form.bankAccountHolder} onChange={(event) => setForm((state) => ({ ...state, bankAccountHolder: event.target.value }))} placeholder="Account holder name" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5 md:col-span-2" />
            </div>
          </div>
          <select value={form.language} onChange={(event) => setForm((state) => ({ ...state, language: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5">
            <option>English</option>
            <option>Hindi</option>
            <option>Gujarati</option>
            <option>Marathi</option>
            <option>Tamil</option>
          </select>
          <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
            Save Settings
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="glass-panel p-6">
          <h2 className="section-title">Security & Roles</h2>
          <div className="mt-6 space-y-4">
            {[
              { role: "Shop Owner", access: "Full billing, inventory, settings, staff, subscription, backup" },
              { role: "Staff / Cashier", access: "Fast billing counter, customer lookup, invoice sharing" },
              { role: "Accountant", access: "Ledger, GST reports, expenses, profit & loss exports" }
            ].map((item) => (
              <div key={item.role} className="rounded-2xl border border-white/10 p-4">
                <p className="font-display text-xl font-semibold">{item.role}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.access}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-display text-xl font-semibold">Current Session</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <p>{currentUser?.name || "Not signed in"}</p>
            <p>{currentUser?.email || "No email"}</p>
            <p>{currentUser?.role || "No role"}</p>
            <p>UPI: {shop.upiId || "Not configured"}</p>
            <p>Prefix: {shop.invoicePrefix || "INV"}</p>
            <p>Bank: {shop.bankName || "Not configured"}</p>
            <p>IFSC: {shop.bankIfsc || "Not configured"}</p>
          </div>
        </div>

        {lastActionMessage ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
            {lastActionMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
