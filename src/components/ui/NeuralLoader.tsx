"use client";
import { motion } from "framer-motion";

export function NeuralLoader({ label = "Vespera Neural Engine is structuring your day..." }: { label?: string }) {
  return (
    <div className="liquid-glass rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-5 border-sky-400/30">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 border-r-purple-400" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-300 border-l-indigo-400" />
        <motion.div animate={{ scale: [0.85, 1.15, 0.85] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-purple-500 shadow-[0_0_24px_#38bdf8]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-sky-200">{label}</p>
        <p className="text-xs text-slate-400">Balancing priorities, durations, and cognitive rest windows</p>
      </div>
    </div>
  );
}
