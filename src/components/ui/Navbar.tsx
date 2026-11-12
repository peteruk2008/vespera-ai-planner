"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, LayoutDashboard, CalendarClock, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import type { SessionPayload } from "@/lib/jwt";

export function Navbar({ siteName, user, customPages }: { siteName: string; user: SessionPayload | null; customPages: Array<{ slug: string; title: string }> }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const navLink = (href: string, label: string, Icon?: React.ComponentType<{ className?: string }>) => (
    <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition ${pathname === href ? "bg-white/15 text-white border border-white/20" : "text-slate-300 hover:text-white hover:bg-white/5"}`}>
      {Icon && <Icon className="w-4 h-4 text-sky-400" />}
      <span>{label}</span>
    </Link>
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3">
      <nav className="max-w-7xl mx-auto liquid-glass rounded-2xl px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.45)]">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="text-lg bg-gradient-to-r from-white via-sky-100 to-purple-200 bg-clip-text text-transparent">{siteName}</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {navLink("/", "Home")}
          {customPages.map((p) => navLink(`/${p.slug}`, p.title))}
          {user && navLink("/planner", "AI Planner", CalendarClock)}
          {user && navLink("/dashboard", "Dashboard", LayoutDashboard)}
          {user?.role === "ADMIN" && navLink("/admin", "Admin", ShieldCheck)}
        </div>
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <span className="text-xs text-slate-300 px-2">{user.name}</span>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-200 cursor-pointer"><LogOut className="w-3.5 h-3.5" /> Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3.5 py-2 text-sm text-slate-300 hover:text-white">Sign In</Link>
              <Link href="/register" className="glow-btn px-4 py-2 rounded-xl text-sm font-medium text-white">Get Started</Link>
            </>
          )}
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-200">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </nav>
      {open && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto liquid-glass rounded-2xl p-3 flex flex-col gap-1">
          {navLink("/", "Home")}
          {customPages.map((p) => navLink(`/${p.slug}`, p.title))}
          {user ? (
            <>
              {navLink("/planner", "AI Planner", CalendarClock)}
              {navLink("/dashboard", "Dashboard", LayoutDashboard)}
              {user.role === "ADMIN" && navLink("/admin", "Admin", ShieldCheck)}
              <button onClick={handleLogout} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm text-rose-300 hover:bg-white/5 text-left"><LogOut className="w-4 h-4" /> Sign Out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2 rounded-xl bg-white/10 text-sm">Sign In</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="flex-1 text-center py-2 rounded-xl glow-btn text-sm font-medium">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
