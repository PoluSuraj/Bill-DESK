"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { AuthShell } from "@/components/shared/auth-shell";
import { isSoftwareAdminEmail, resolveUserRole } from "@/lib/platform";
import { useAppStore } from "@/store/app-store";
import { SessionUser, UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("OWNER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const effectiveRole = useMemo(() => resolveUserRole(email, role), [email, role]);
  const softwareAdminSelected = isSoftwareAdminEmail(email);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to sign in.");
        return;
      }

      const user = payload.data.user as SessionUser;
      setCurrentUser(user);
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Secure access for platform admins, shop owners, staff, and accountants.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Email or mobile</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500" placeholder="Enter your registered email" autoComplete="email" required />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Password</label>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500" placeholder="Enter your password" autoComplete="current-password" required />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Role</label>
          <select value={effectiveRole} onChange={(event) => setRole(event.target.value as UserRole)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" disabled={softwareAdminSelected}>
            <option value="OWNER">Shop Owner</option>
            <option value="CASHIER">Staff / Cashier</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
        {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
        <div className="flex items-center justify-between text-sm text-slate-300">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-white/10 bg-white/5" defaultChecked />
            Keep me signed in for this session
          </label>
          <Link href="/forgot-password" className="text-brand-100">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-400">
        New shop? <Link href="/signup" className="text-brand-100">Create your workspace</Link>
      </p>
    </AuthShell>
  );
}
