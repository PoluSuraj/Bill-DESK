"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthShell } from "@/components/shared/auth-shell";
import { useAppStore } from "@/store/app-store";
import { SessionUser } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const updateShop = useAppStore((state) => state.updateShop);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [businessType, setBusinessType] = useState("Grocery");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, ownerName, email, mobile, businessType, password })
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to create account.");
        return;
      }

      const user = payload.data.user as SessionUser;
      setCurrentUser(user);
      updateShop({
        name: payload.data.shop.name,
        phone: payload.data.shop.phone,
        email: payload.data.shop.email,
        businessType: payload.data.shop.businessType
      });
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch {
      setError("Unable to create account right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Launch your store workspace" subtitle="Set up branches, billing profile, GST, and staff access in one place.">
      <form onSubmit={submit} className="grid gap-4">
        <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none" placeholder="Business name" required />
        <input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} className="rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none" placeholder="Owner full name" required />
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none" placeholder="Email address" autoComplete="email" required />
        <div className="grid gap-4 md:grid-cols-2">
          <input value={mobile} onChange={(event) => setMobile(event.target.value)} className="rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none" placeholder="Mobile number" required />
          <select value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none">
            <option>Grocery</option>
            <option>Clothing</option>
            <option>Electronics</option>
            <option>Medical</option>
            <option>Hardware</option>
            <option>Restaurant</option>
            <option>Other small business</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none" placeholder="Create password" autoComplete="new-password" required />
          <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none" placeholder="Confirm password" autoComplete="new-password" required />
        </div>
        {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">{error}</p> : null}
        <button type="submit" disabled={loading} className="mt-2 rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
