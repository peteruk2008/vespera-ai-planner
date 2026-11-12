"use client";
import { useEffect, useState } from "react";

export function TypingText({ phrases, className = "" }: { phrases: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index] || "";
    const timer = setTimeout(() => {
      if (!deleting) {
        if (sub < current.length) setSub((s) => s + 1);
        else setTimeout(() => setDeleting(true), 1500);
      } else {
        if (sub > 0) setSub((s) => s - 1);
        else { setDeleting(false); setIndex((i) => (i + 1) % phrases.length); }
      }
    }, deleting ? 28 : 50);
    return () => clearTimeout(timer);
  }, [sub, deleting, index, phrases]);

  return (
    <span className={className}>
      {phrases[index]?.slice(0, sub)}
      <span className="inline-block w-[2px] h-[1em] align-middle bg-sky-400 ml-1 animate-pulse" />
    </span>
  );
}
