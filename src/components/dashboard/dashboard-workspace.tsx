"use client";

import { AlertTriangle, BrainCircuit, PackageCheck, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { CategoryChart, RevenueChart } from "@/components/dashboard/charts";
import { StatCard } from "@/components/shared/stat-card";
import { useAppStore } from "@/store/app-store";
import { DashboardMetric } from "@/types";
import { currency, formatCompactNumber, formatDate } from "@/lib/utils";

function sameDay(date: Date, reference: Date) {
  return date.toDateString() === reference.toDateString();
}

export function DashboardWorkspace() {
  const [mounted, setMounted] = useState(false);
  const products = useAppStore((state) => state.products);
  const customers = useAppStore((state) => state.customers);
  const invoices = useAppStore((state) => state.invoices);
  const insights = useAppStore((state) => state.insights);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-panel h-36 animate-pulse" />
          ))}
        </section>
        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="glass-panel h-[320px] animate-pulse" />
          <div className="glass-panel h-[320px] animate-pulse" />
        </section>
        <section className="glass-panel flex h-48 items-center justify-center p-6 text-sm text-slate-500 dark:text-slate-400">
          Preparing your live dashboard...
        </section>
      </div>
    );
  }

  const now = new Date();
  const todayInvoices = invoices.filter((invoice) => sameDay(new Date(invoice.createdAt), now));
  const monthlyInvoices = invoices.filter((invoice) => {
    const createdAt = new Date(invoice.createdAt);
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  });
  const todaySales = todayInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const monthlyRevenue = monthlyInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const pendingPayments = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const lowStock = products.filter((product) => product.stock <= product.reorderLevel);
  const totalLoyalCustomers = customers.filter((customer) => customer.loyaltyPoints > 0).length;

  const metrics: DashboardMetric[] = [
    {
      label: "Today's Sales",
      value: currency(todaySales),
      delta: `${todayInvoices.length} invoices today`,
      accent: "brand"
    },
    {
      label: "Monthly Revenue",
      value: currency(monthlyRevenue),
      delta: `${monthlyInvoices.length} completed bills`,
      accent: "accent"
    },
    {
      label: "Pending Payments",
      value: currency(pendingPayments),
      delta: `${invoices.filter((invoice) => invoice.status !== "Paid").length} open invoices`,
      accent: "warn"
    },
    {
      label: "Loyal Customers",
      value: formatCompactNumber(totalLoyalCustomers),
      delta: `${customers.length} saved contacts`,
      accent: "brand"
    }
  ];

  const salesTrend = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const dayInvoices = invoices.filter((invoice) => sameDay(new Date(invoice.createdAt), date));
    return {
      name: date.toLocaleDateString("en-IN", { weekday: "short" }),
      sales: dayInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
      orders: dayInvoices.length
    };
  });

  const categoryTotals = products.reduce<Record<string, number>>((accumulator, product) => {
    accumulator[product.category] = (accumulator[product.category] || 0) + product.stock * product.price;
    return accumulator;
  }, {});
  const totalCategoryValue = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0) || 1;
  const categoryMix = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value: Math.round((value / totalCategoryValue) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const topSelling = [...products]
    .map((product) => {
      const sold = invoices.reduce((sum, invoice) => {
        const line = invoice.items.find((item) => item.id === product.id);
        return sum + (line?.quantity || 0);
      }, 0);
      return { ...product, sold };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  const recentTransactions = invoices.slice(0, 5);

  const customerSegments = [
    { label: "Loyalty Members", value: `${customers.filter((customer) => customer.loyaltyPoints > 0).length} customers` },
    { label: "Credit Accounts", value: `${customers.filter((customer) => customer.creditBalance > 0).length} active ledgers` },
    { label: "Birthdays This Month", value: `${customers.filter((customer) => customer.birthday?.slice(5, 7) === String(now.getMonth() + 1).padStart(2, "0")).length} reminders` }
  ];

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <StatCard key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <RevenueChart data={salesTrend} />
        <CategoryChart data={categoryMix} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-orange-500/15 p-3 text-orange-600 dark:text-orange-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Low Stock Alerts</h3>
                <p className="section-subtitle">Items nearing reorder threshold</p>
              </div>
            </div>
            <div className="space-y-3">
              {lowStock.length ? lowStock.slice(0, 4).map((product) => (
                <div key={product.id} className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{product.category}</p>
                    </div>
                    <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm text-orange-600 dark:text-orange-200">
                      {product.stock} left
                    </span>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500 dark:text-slate-400">All inventory is above the reorder level.</p>}
            </div>
          </div>

          <div className="glass-panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-600 dark:text-emerald-200">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Customer Retention</h3>
                <p className="section-subtitle">Loyalty and CRM overview</p>
              </div>
            </div>
            <div className="grid gap-3">
              {customerSegments.map((segment) => (
                <div key={segment.label} className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{segment.label}</p>
                  <p className="mt-1 font-display text-xl font-semibold">{segment.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-brand-500/15 p-3 text-brand-700 dark:text-brand-100">
                <PackageCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Recent Transactions</h3>
                <p className="section-subtitle">Live billing activity with status tracking</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-white/10 bg-white/50 dark:bg-white/5">
                      <td className="px-4 py-3 font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3">{invoice.customerName}</td>
                      <td className="px-4 py-3">{currency(invoice.total)}</td>
                      <td className="px-4 py-3">{invoice.paymentMethod}</td>
                      <td className="px-4 py-3">{formatDate(invoice.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-panel p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-violet-500/15 p-3 text-violet-600 dark:text-violet-200">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">AI Insights</h3>
                  <p className="section-subtitle">Demand and basket recommendations</p>
                </div>
              </div>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight} className="rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                    <p className="text-sm leading-6">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-5">
              <h3 className="font-display text-xl font-semibold">Top Selling Products</h3>
              <p className="section-subtitle mb-4">Move fast, restock smart, bundle better</p>
              <div className="space-y-3">
                {topSelling.map((product) => (
                  <div key={product.id} className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.sold} sold</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Stock {product.stock}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
