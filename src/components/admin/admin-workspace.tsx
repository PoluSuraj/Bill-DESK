"use client";

import { BadgeIndianRupee, Megaphone, ShieldCheck, Store } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { currency, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { OfferCampaign, SubscriptionStatus } from "@/types";

const emptyOffer = {
  title: "",
  audience: "All customers",
  channel: "WhatsApp" as OfferCampaign["channel"],
  status: "Draft" as OfferCampaign["status"],
  discountLabel: "",
  scheduledFor: new Date().toISOString().slice(0, 10)
};

export function AdminWorkspace() {
  const currentUser = useAppStore((state) => state.currentUser);
  const tenantShops = useAppStore((state) => state.tenantShops);
  const offers = useAppStore((state) => state.offers);
  const invoices = useAppStore((state) => state.invoices);
  const updateTenantPlan = useAppStore((state) => state.updateTenantPlan);
  const updateTenantStatus = useAppStore((state) => state.updateTenantStatus);
  const toggleTenantAccess = useAppStore((state) => state.toggleTenantAccess);
  const saveOffer = useAppStore((state) => state.saveOffer);
  const deleteOffer = useAppStore((state) => state.deleteOffer);
  const lastActionMessage = useAppStore((state) => state.lastActionMessage);
  const [form, setForm] = useState(emptyOffer);

  const platformRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const activeShops = tenantShops.filter((shop) => shop.isAccessEnabled).length;
  const pausedShops = tenantShops.filter((shop) => !shop.isAccessEnabled).length;
  const liveOffers = offers.filter((offer) => offer.status === "Live").length;

  const subscriptionMix = useMemo(() => {
    return tenantShops.reduce<Record<SubscriptionStatus, number>>(
      (accumulator, shop) => {
        accumulator[shop.status] += 1;
        return accumulator;
      },
      {
        TRIAL: 0,
        ACTIVE: 0,
        PAST_DUE: 0,
        PAUSED: 0
      }
    );
  }, [tenantShops]);

  function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveOffer(form);
    setForm(emptyOffer);
  }

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="glass-panel p-8 text-center">
        <h2 className="section-title">Administrator Access Required</h2>
        <p className="section-subtitle mt-3">Sign in as an administrator to manage subscriptions, shop access, and platform offers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tenant Shops", value: String(tenantShops.length), icon: Store },
          { label: "Enabled Access", value: String(activeShops), icon: ShieldCheck },
          { label: "Live Offers", value: String(liveOffers), icon: Megaphone },
          { label: "Revenue Managed", value: currency(platformRevenue), icon: BadgeIndianRupee }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-panel p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                  <p className="mt-2 font-display text-2xl font-semibold">{card.value}</p>
                </div>
                <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-700 dark:text-brand-100">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div>
              <h2 className="section-title">Shopkeeper Access Control</h2>
              <p className="section-subtitle">Manage subscriptions, seat plans, branch permissions, and account access.</p>
            </div>
            <div className="text-right text-sm text-slate-500 dark:text-slate-400">
              <p>{activeShops} enabled</p>
              <p>{pausedShops} blocked</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-y border-white/10 bg-slate-900/5 dark:bg-white/5">
                <tr>
                  <th className="px-5 py-3">Shop</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Seats</th>
                  <th className="px-5 py-3">Renewal</th>
                  <th className="px-5 py-3">Access</th>
                </tr>
              </thead>
              <tbody>
                {tenantShops.map((shop) => (
                  <tr key={shop.id} className="border-t border-white/10">
                    <td className="px-5 py-4">
                      <p className="font-medium">{shop.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{shop.ownerName} • {shop.businessType}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={shop.planName}
                        onChange={(event) => updateTenantPlan(shop.id, event.target.value)}
                        className="rounded-xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5"
                      >
                        <option>Starter</option>
                        <option>Growth</option>
                        <option>Enterprise</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={shop.status}
                        onChange={(event) => updateTenantStatus(shop.id, event.target.value as SubscriptionStatus)}
                        className="rounded-xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5"
                      >
                        <option value="TRIAL">TRIAL</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PAST_DUE">PAST_DUE</option>
                        <option value="PAUSED">PAUSED</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">{shop.seatsUsed}/{shop.seatsLimit}</td>
                    <td className="px-5 py-4">{formatDate(`${shop.renewalDate}T09:00:00.000Z`)}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleTenantAccess(shop.id)}
                        className={`rounded-2xl px-4 py-2 text-xs font-medium ${shop.isAccessEnabled ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200" : "bg-rose-500/15 text-rose-700 dark:text-rose-200"}`}
                      >
                        {shop.isAccessEnabled ? "Enabled" : "Blocked"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5">
            <h3 className="font-display text-xl font-semibold">Subscription Snapshot</h3>
            <div className="mt-4 grid gap-3">
              {Object.entries(subscriptionMix).map(([status, count]) => (
                <div key={status} className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <span>{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-display text-xl font-semibold">Admin Capabilities</h3>
            <div className="mt-4 grid gap-3 text-sm">
              {[
                "Pause or enable shopkeeper access instantly",
                "Upgrade plans and manage seat limits",
                "Run platform-wide offers and campaigns",
                "Track branch growth and recurring subscription health"
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={submitOffer} className="glass-panel p-5">
          <h2 className="section-title">Offer Campaign Builder</h2>
          <p className="section-subtitle mt-2">Create promotions that administrators can push across shops and customer segments.</p>
          <div className="mt-5 grid gap-3">
            <input value={form.title} onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))} placeholder="Campaign title" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" required />
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.audience} onChange={(event) => setForm((state) => ({ ...state, audience: event.target.value }))} placeholder="Audience" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" required />
              <input value={form.discountLabel} onChange={(event) => setForm((state) => ({ ...state, discountLabel: event.target.value }))} placeholder="Offer detail" className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" required />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select value={form.channel} onChange={(event) => setForm((state) => ({ ...state, channel: event.target.value as OfferCampaign["channel"] }))} className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5">
                <option>WhatsApp</option>
                <option>SMS</option>
                <option>Email</option>
                <option>In-app</option>
              </select>
              <select value={form.status} onChange={(event) => setForm((state) => ({ ...state, status: event.target.value as OfferCampaign["status"] }))} className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5">
                <option>Draft</option>
                <option>Live</option>
                <option>Paused</option>
              </select>
              <input type="date" value={form.scheduledFor} onChange={(event) => setForm((state) => ({ ...state, scheduledFor: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/60 px-4 py-3 outline-none dark:bg-white/5" />
            </div>
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
              Save Campaign
            </button>
          </div>
        </form>

        <div className="glass-panel p-5">
          <h2 className="section-title">Live Offers</h2>
          <p className="section-subtitle mt-2">Monitor and remove platform promotions from a single control surface.</p>
          <div className="mt-5 space-y-3">
            {offers.map((offer) => (
              <div key={offer.id} className="rounded-3xl border border-white/10 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium">{offer.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{offer.audience} • {offer.channel}</p>
                    <p className="mt-2 text-sm">{offer.discountLabel}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{offer.status}</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{offer.scheduledFor}</p>
                    <button type="button" onClick={() => deleteOffer(offer.id)} className="mt-3 rounded-2xl border border-white/10 px-4 py-2 text-xs text-rose-500">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lastActionMessage ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
          {lastActionMessage}
        </div>
      ) : null}
    </div>
  );
}
