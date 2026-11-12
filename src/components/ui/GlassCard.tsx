"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function GlassCard({ children, className = "", hover = true }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`liquid-glass rounded-3xl ${hover ? "liquid-glass-hover" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
