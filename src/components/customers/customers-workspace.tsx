"use client";

import { FormEvent, useMemo, useState } from "react";
import { Gift, Trash2, UserPlus, Wallet } from "lucide-react";

import { currency } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Customer } from "@/types";

const blankCustomer = {
  name: "",
  phone: "",
  email: "",
  loyaltyPoints: 0,
  creditBalance: 0,
  notes: "",
  segment: "Retail",
  birthday: ""
};

export function CustomersWorkspace() {
  const customers = useAppStore((state) => state.customers);
  const invoices = useAppStore((state) => state.invoices);
  const saveCustomer = useAppStore((state) => state.saveCustomer);
  const deleteCustomer = useAppStore((state) => state.deleteCustomer);
  const lastActionMessage = useAppStore((state) => state.lastActionMessage);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string>("");
  const [form, setForm] = useState(blankCustomer);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        [customer.name, customer.phone, customer.email || "", customer.segment, customer.notes]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [customers, query]
  );

  function startEdit(customer?: Customer) {
    if (!customer) {
      setEditingId("");
      setForm(blankCustomer);
      return;
    }

    setEditingId(customer.id);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      loyaltyPoints: customer.loyaltyPoints,
      creditBalance: customer.creditBalance,
      notes: customer.notes,
      segment: customer.segment,
      birthday: customer.birthday || ""
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCustomer({
      id: editingId || undefined,
      ...form,
      email: form.email || undefined,
      birthday: form.birthday || undefined
    });
    startEdit();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title">Customer Relationship Hub</h2>
            <p className="section-subtitle mt-2">Track loyalty, credit, birthdays, and purchase history.</p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers..."
            className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div className="mt-6 space-y-4">
          {filteredCustomers.map((customer) => {
            const customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id);
            const totalSpent = customerInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

            return (
              <div key={customer.id} className="rounded-3xl border border-white/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl font-semibold">{customer.name}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{customer.segment}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{customer.phone}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{customer.loyaltyPoints} pts</p>
                    <p className="mt-1 text-orange-600 dark:text-orange-200">{currency(customer.creditBalance)} due</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
                  <div className="rounded-2xl bg-slate-900/5 p-3 dark:bg-white/5">Spent {currency(totalSpent)}</div>
                  <div className="rounded-2xl bg-slate-900/5 p-3 dark:bg-white/5">{customerInvoices.length} invoices</div>
                  <div className="rounded-2xl bg-slate-900/5 p-3 dark:bg-white/5">{customer.birthday || "Birthday not set"}</div>
                </div>
                <p className="mt-4 text-sm">{customer.notes || "No notes added yet."}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => startEdit(customer)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteCustomer(customer.id)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-rose-500">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <form onSubmit={submit} className="glass-panel p-6">
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5" />
            <h3 className="font-display text-xl font-semibold">{editingId ? "Edit Customer" : "Add Customer"}</h3>
          </div>
          <div className="mt-4 grid gap-3">
            <input value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} placeholder="Full name" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white" required />
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.phone} onChange={(event) => setForm((state) => ({ ...state, phone: event.target.value }))} placeholder="Phone" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white" required />
              <input value={form.email} onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))} placeholder="Email" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input value={form.segment} onChange={(event) => setForm((state) => ({ ...state, segment: event.target.value }))} placeholder="Segment" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
              <input type="number" min={0} value={form.loyaltyPoints} onChange={(event) => setForm((state) => ({ ...state, loyaltyPoints: Number(event.target.value) }))} placeholder="Loyalty points" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
              <input type="number" min={0} value={form.creditBalance} onChange={(event) => setForm((state) => ({ ...state, creditBalance: Number(event.target.value) }))} placeholder="Credit balance" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
            </div>
            <input type="date" value={form.birthday} onChange={(event) => setForm((state) => ({ ...state, birthday: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
            <textarea value={form.notes} onChange={(event) => setForm((state) => ({ ...state, notes: event.target.value }))} placeholder="Notes" className="min-h-28 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white" />
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
              {editingId ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </form>

        <div className="glass-panel p-6">
          <h3 className="font-display text-xl font-semibold">Smart Engagement</h3>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
              <div className="flex items-center gap-2 font-medium"><Gift className="h-4 w-4" />Birthday offers ready</div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{customers.filter((customer) => customer.birthday?.slice(5) === new Date().toISOString().slice(5, 10)).length} customers have birthdays today.</p>
            </div>
            <div className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
              <div className="flex items-center gap-2 font-medium"><Wallet className="h-4 w-4" />Credit tracking</div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{currency(customers.reduce((sum, customer) => sum + customer.creditBalance, 0))} outstanding across all customer ledgers.</p>
            </div>
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
