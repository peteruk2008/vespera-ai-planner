"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Sign in failed"); return; }
    router.push(data.user.role === "ADMIN" ? "/admin" : "/planner");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-8 space-y-6" hover={false}>
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome Back to Vespera</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to access your AI planner and analytics.</p>
        </div>
        {error && <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-xs text-rose-200">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-400" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-400" />
          <button disabled={loading} className="w-full glow-btn py-3 rounded-xl font-medium text-white cursor-pointer disabled:opacity-50">{loading ? "Authenticating..." : "Sign In"}</button>
        </form>
        <p className="text-xs text-center text-slate-400">New to Vespera? <Link href="/register" className="text-sky-400 hover:underline">Create an account</Link></p>
      </GlassCard>
    </div>
  );
}
