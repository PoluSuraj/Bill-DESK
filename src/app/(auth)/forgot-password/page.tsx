"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/shared/auth-shell";
import { useAppStore } from "@/store/app-store";
import { SessionUser } from "@/types";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to prepare reset token.");
        return;
      }

      setResetRequested(true);
      if (payload.data?.resetToken) {
        setToken(payload.data.resetToken);
        setMessage("Reset token generated for this local build. In production this token should be delivered by email or OTP.");
      } else {
        setMessage(payload.message || "If this email is registered, reset instructions are ready.");
      }
    } catch {
      setError("Unable to prepare reset right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password: newPassword })
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to reset password.");
        return;
      }

      const user = payload.data.user as SessionUser;
      setCurrentUser(user);
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch {
      setError("Unable to reset password right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset access securely"
      subtitle="Restore access with a verified reset token and a new password."
    >
      <form onSubmit={requestReset} className="space-y-4">
        <label className="block text-sm text-slate-700 dark:text-slate-300">
          Registered email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none"
            placeholder="Enter registered email"
            autoComplete="email"
            required
          />
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">
          {loading && !resetRequested ? "Preparing reset..." : "Send reset token"}
        </button>
      </form>

      {resetRequested ? (
        <form onSubmit={resetPassword} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 p-4">
          <label className="block text-sm text-slate-700 dark:text-slate-300">
            Reset token
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none"
              placeholder="Paste reset token"
              required
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" className="rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none" placeholder="New password" autoComplete="new-password" required />
            <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="rounded-2xl border border-slate-200 bg-white/85 text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-slate-500 px-4 py-3 outline-none" placeholder="Confirm password" autoComplete="new-password" required />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-brand-600 px-4 py-3 font-medium text-white shadow-lg shadow-brand-600/20 dark:bg-brand-100 dark:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Resetting password..." : "Reset password and sign in"}
          </button>
        </form>
      ) : null}

      {message ? <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-100">{message}</div> : null}
      {error ? <div className="mt-6 rounded-3xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">{error}</div> : null}
    </AuthShell>
  );
}
