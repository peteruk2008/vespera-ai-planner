"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    let vid = localStorage.getItem("vespera_vid");
    if (!vid) { vid = crypto.randomUUID(); localStorage.setItem("vespera_vid", vid); }
    fetch("/api/analytics/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: pathname, visitorId: vid }) }).catch(() => {});
  }, [pathname]);
  return null;
}
