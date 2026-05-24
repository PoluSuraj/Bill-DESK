"use client";

import { BarChart3, Download, FileSpreadsheet, ReceiptText, TrendingUp } from "lucide-react";

import { downloadCsvFile, downloadJsonFile, currency, formatCompactNumber } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function ReportsWorkspace() {
  const invoices = useAppStore((state) => state.invoices);
  const products = useAppStore((state) => state.products);
  const customers = useAppStore((state) => state.customers);
  const setActionMessage = useAppStore((state) => state.setActionMessage);

  const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalProfit = invoices.reduce((sum, invoice) => sum + invoice.profit, 0);
  const totalTax = invoices.reduce((sum, invoice) => sum + invoice.tax, 0);
  const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid");
  const averageOrderValue = invoices.length ? totalSales / invoices.length : 0;
  const bestSelling = [...products]
    .map((product) => {
      const quantity = invoices.reduce((sum, invoice) => {
        const line = invoice.items.find((item) => item.id === product.id);
        return sum + (line?.quantity || 0);
      }, 0);
      return { ...product, quantity };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const reportCards = [
    { label: "Gross Sales", value: currency(totalSales), icon: TrendingUp },
    { label: "Net Profit", value: currency(totalProfit), icon: BarChart3 },
    { label: "GST Collected", value: currency(totalTax), icon: ReceiptText },
    { label: "Avg Order Value", value: currency(averageOrderValue), icon: FileSpreadsheet }
  ];

  const exportRows = invoices.map((invoice) => ({
    invoiceNumber: invoice.invoiceNumber,
    customer: invoice.customerName,
    paymentMethod: invoice.paymentMethod,
    status: invoice.status,
    total: invoice.total,
    tax: invoice.tax,
    createdAt: invoice.createdAt
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-panel p-5">
              <div className="flex items-center justify-between gap-3">
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
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="section-title">Analytics & Exports</h2>
              <p className="section-subtitle mt-2">Download live invoice data in JSON or CSV, ready for accounting review.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  downloadJsonFile("bill-desk-report.json", {
                    generatedAt: new Date().toISOString(),
                    sales: totalSales,
                    profit: totalProfit,
                    tax: totalTax,
                    invoices,
                    products,
                    customers
                  });
                  setActionMessage("JSON report exported successfully.");
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadCsvFile("bill-desk-invoices.csv", exportRows);
                  setActionMessage("CSV invoice report exported successfully.");
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-sm font-medium dark:bg-white/5"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              `Paid invoices: ${paidInvoices.length}`,
              `Outstanding invoices: ${invoices.length - paidInvoices.length}`,
              `Saved customers: ${customers.length}`,
              `Inventory SKUs: ${products.length}`,
              `Units sold: ${formatCompactNumber(bestSelling.reduce((sum, item) => sum + item.quantity, 0))}`,
              `Avg customer revenue: ${currency(customers.length ? totalSales / customers.length : 0)}`
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 p-4">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="section-title">Best Selling Products</h2>
          <div className="mt-6 space-y-3">
            {bestSelling.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{item.quantity} sold</p>
                    <p className="text-slate-500 dark:text-slate-400">Stock {item.stock}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
