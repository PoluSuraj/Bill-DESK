"use client";

import { PackagePlus, Pencil, ShieldAlert, Trash2, Truck } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";

import { currency } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Product } from "@/types";

const emptyProduct = {
  name: "",
  sku: "",
  price: 0,
  purchasePrice: 0,
  stock: 0,
  category: "Grocery",
  barcode: "",
  reorderLevel: 10,
  gstRate: 5,
  unit: "piece",
  image: ""
};

const fieldClassName =
  "h-14 w-full rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-white/5 dark:text-white";

function Field({
  title,
  hint,
  children
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 min-h-[3rem]">
        <label className="block text-sm font-medium">{title}</label>
        {hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function InventoryWorkspace() {
  const products = useAppStore((state) => state.products);
  const saveProduct = useAppStore((state) => state.saveProduct);
  const deleteProduct = useAppStore((state) => state.deleteProduct);
  const adjustStock = useAppStore((state) => state.adjustStock);
  const lastActionMessage = useAppStore((state) => state.lastActionMessage);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [form, setForm] = useState(emptyProduct);

  const filteredProducts = products.filter((product) =>
    [product.name, product.sku, product.category, product.barcode]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  const lowStock = products.filter((product) => product.stock <= product.reorderLevel);

  function startEdit(product?: Product) {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        sku: product.sku,
        price: product.price,
        purchasePrice: product.purchasePrice,
        stock: product.stock,
        category: product.category,
        barcode: product.barcode,
        reorderLevel: product.reorderLevel,
        gstRate: product.gstRate,
        unit: product.unit,
        image: product.image || ""
      });
      return;
    }

    setEditing(null);
    setForm(emptyProduct);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProduct({
      id: editing?.id,
      ...form,
      image: form.image || undefined
    });
    startEdit();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          { title: "Catalog Management", text: `${products.length} active products across all business types.` },
          { title: "Supplier Control", text: "Track vendors, purchase logic, and stock movement from one board." },
          { title: "Smart Prediction", text: `${lowStock.length} items need reorder attention right now.` }
        ].map((card) => (
          <div key={card.title} className="glass-panel p-5">
            <h2 className="font-display text-xl font-semibold">{card.title}</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{card.text}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel overflow-hidden">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="section-title">Inventory Master</h2>
              <p className="section-subtitle">Search, restock, edit, or remove products instantly.</p>
            </div>
            <div className="flex gap-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search product by name, SKU, category, or barcode"
                className={fieldClassName}
              />
              <button
                type="button"
                onClick={() => startEdit()}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
              >
                <PackagePlus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-y border-white/10 bg-slate-900/5 dark:bg-white/5">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-white/10">
                    <td className="px-5 py-4">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku} • {product.barcode}</p>
                    </td>
                    <td className="px-5 py-4">{product.category}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => adjustStock(product.id, -1)} className="rounded-lg border border-white/10 px-2 py-1">-</button>
                        <span>{product.stock}</span>
                        <button type="button" onClick={() => adjustStock(product.id, 1)} className="rounded-lg border border-white/10 px-2 py-1">+</button>
                      </div>
                    </td>
                    <td className="px-5 py-4">{currency(product.price)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(product)} className="rounded-xl border border-white/10 p-2">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => deleteProduct(product.id)} className="rounded-xl border border-white/10 p-2 text-rose-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="glass-panel p-5">
            <h3 className="font-display text-xl font-semibold">{editing ? "Edit Product" : "Add Product"}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Fill each field with the product details you use in your shop billing and stock management.</p>
            <div className="mt-4 grid gap-4">
              <Field title="Product Name" hint="Enter the full name printed on the product or used on the bill.">
                <input value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} placeholder="Example: Aashirvaad Atta 10kg" className={fieldClassName} required />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field title="SKU / Item Code" hint="Internal code used to identify the product quickly.">
                  <input value={form.sku} onChange={(event) => setForm((state) => ({ ...state, sku: event.target.value }))} placeholder="Example: GRC-ATTA-10" className={fieldClassName} required />
                </Field>
                <Field title="Barcode Number" hint="Scanner barcode number printed on the product.">
                  <input value={form.barcode} onChange={(event) => setForm((state) => ({ ...state, barcode: event.target.value }))} placeholder="Example: 890600945001" className={fieldClassName} required />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field title="Selling Price" hint="Price charged to the customer for one unit.">
                  <input type="number" min={0} value={form.price} onChange={(event) => setForm((state) => ({ ...state, price: Number(event.target.value) }))} placeholder="Example: 520" className={fieldClassName} required />
                </Field>
                <Field title="Purchase Price" hint="Price you paid to buy one unit from the supplier.">
                  <input type="number" min={0} value={form.purchasePrice} onChange={(event) => setForm((state) => ({ ...state, purchasePrice: Number(event.target.value) }))} placeholder="Example: 410" className={fieldClassName} required />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field title="Current Stock" hint="How many units are available in the shop right now.">
                  <input type="number" min={0} value={form.stock} onChange={(event) => setForm((state) => ({ ...state, stock: Number(event.target.value) }))} placeholder="Example: 18" className={fieldClassName} required />
                </Field>
                <Field title="Reorder Level" hint="Alert me when stock goes below this number.">
                  <input type="number" min={0} value={form.reorderLevel} onChange={(event) => setForm((state) => ({ ...state, reorderLevel: Number(event.target.value) }))} placeholder="Example: 10" className={fieldClassName} required />
                </Field>
                <Field title="GST Rate (%)" hint="Tax percentage applied on this product.">
                  <input type="number" min={0} value={form.gstRate} onChange={(event) => setForm((state) => ({ ...state, gstRate: Number(event.target.value) }))} placeholder="Example: 5" className={fieldClassName} required />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field title="Category" hint="Business category used for filtering and reporting.">
                  <input value={form.category} onChange={(event) => setForm((state) => ({ ...state, category: event.target.value }))} placeholder="Example: Grocery" className={fieldClassName} required />
                </Field>
                <Field title="Unit" hint="Unit used when selling this product.">
                  <input value={form.unit} onChange={(event) => setForm((state) => ({ ...state, unit: event.target.value }))} placeholder="Example: bag, piece, strip, combo" className={fieldClassName} required />
                </Field>
              </div>

              <Field title="Product Image URL (Optional)" hint="Paste an image link if you want a product image for the catalog.">
                <input value={form.image} onChange={(event) => setForm((state) => ({ ...state, image: event.target.value }))} placeholder="Example: https://example.com/product-image.jpg" className={fieldClassName} />
              </Field>

              <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
                {editing ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>

          <div className="glass-panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-orange-500/15 p-3 text-orange-600 dark:text-orange-200">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Low Stock Radar</h3>
                <p className="section-subtitle">Auto warnings with reorder urgency</p>
              </div>
            </div>
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                    </div>
                    <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm text-orange-600 dark:text-orange-200">
                      {item.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-brand-500/15 p-3 text-brand-700 dark:text-brand-100">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Suppliers</h3>
                <p className="section-subtitle">Restocking overview</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                "FreshMart Distributors • 6 purchase orders this month",
                "Metro Fabrics • Next delivery due tomorrow",
                "Medicore Pharma • Credit window 18 days remaining"
              ].map((supplier) => (
                <div key={supplier} className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5">
                  {supplier}
                </div>
              ))}
            </div>
          </div>

          {lastActionMessage ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
              {lastActionMessage}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
