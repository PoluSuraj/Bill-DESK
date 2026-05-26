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
        <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-cyan-100/15 dark:bg-slate-900/70 dark:text-white dark:shadow-inner dark:shadow-white/5 dark:placeholder:text-slate-400 dark:focus:border-cyan-300/60 dark:focus:ring-cyan-300/10" placeholder="Business name" required />
        <input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-cyan-100/15 dark:bg-slate-900/70 dark:text-white dark:shadow-inner dark:shadow-white/5 dark:placeholder:text-slate-400 dark:focus:border-cyan-300/60 dark:focus:ring-cyan-300/10" placeholder="Owner full name" required />
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-cyan-100/15 dark:bg-slate-900/70 dark:text-white dark:shadow-inner dark:shadow-white/5 dark:placeholder:text-slate-400 dark:focus:border-cyan-300/60 dark:focus:ring-cyan-300/10" placeholder="Email address" autoComplete="email" required />
        <div className="grid gap-4 md:grid-cols-2">
          <input value={mobile} onChange={(event) => setMobile(event.target.value)} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-cyan-100/15 dark:bg-slate-900/70 dark:text-white dark:shadow-inner dark:shadow-white/5 dark:placeholder:text-slate-400 dark:focus:border-cyan-300/60 dark:focus:ring-cyan-300/10" placeholder="Mobile number" required />
          <select value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-cyan-100/15 dark:bg-slate-900/70 dark:text-white dark:shadow-inner dark:shadow-white/5 dark:placeholder:text-slate-400 dark:focus:border-cyan-300/60 dark:focus:ring-cyan-300/10">
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
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-cyan-100/15 dark:bg-slate-900/70 dark:text-white dark:shadow-inner dark:shadow-white/5 dark:placeholder:text-slate-400 dark:focus:border-cyan-300/60 dark:focus:ring-cyan-300/10" placeholder="Create password" autoComplete="new-password" required />
          <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-cyan-100/15 dark:bg-slate-900/70 dark:text-white dark:shadow-inner dark:shadow-white/5 dark:placeholder:text-slate-400 dark:focus:border-cyan-300/60 dark:focus:ring-cyan-300/10" placeholder="Confirm password" autoComplete="new-password" required />
        </div>
        {error ? <p className="rounded-2xl border border-rose-400/40 dark:border-rose-300/25 bg-rose-500/10 dark:bg-rose-500/15 px-4 py-3 text-sm text-rose-700 dark:text-rose-100">{error}</p> : null}
        <button type="submit" disabled={loading} className="mt-2 rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-cyan-100 dark:text-slate-950 dark:shadow-cyan-400/10 dark:hover:bg-white disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
