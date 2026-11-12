"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BrainCircuit, Clock3, Shield, Sparkles } from "lucide-react";
import { LiquidOrbScene } from "@/components/three/LiquidOrbScene";
import { GlassCard } from "@/components/ui/GlassCard";
import { TypingText } from "@/components/ui/TypingText";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  settings: { siteName: string; tagline: string; heroTitle: string; heroSubtitle: string; heroCtaText: string; footerText: string };
  sections: Array<{ id: string; badge: string | null; title: string; subtitle: string; content: string; imageUrl: string | null }>;
  projects: Array<{ id: string; title: string; category: string; description: string; imageUrl: string | null; linkUrl: string | null }>;
  isAuthenticated: boolean;
}

export function LandingClient({ settings, sections, projects, isAuthenticated }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-stagger", { y: 28, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" });
      gsap.from(".gsap-section-card", { scrollTrigger: { trigger: ".sections-grid", start: "top 85%" }, y: 28, opacity: 0, duration: 0.7, stagger: 0.14 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <section className="min-h-[82vh] grid lg:grid-cols-12 gap-8 items-center py-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="hero-stagger inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass text-xs text-sky-300">
            <Sparkles className="w-3.5 h-3.5" /><span>{settings.tagline}</span>
          </div>
          <h1 className="hero-stagger text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08] bg-gradient-to-br from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">{settings.heroTitle}</h1>
          <p className="hero-stagger text-base sm:text-lg text-slate-300/90 max-w-2xl leading-relaxed">{settings.heroSubtitle}</p>
          <div className="hero-stagger liquid-glass rounded-2xl p-4 max-w-xl border-sky-400/20">
            <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1.5">Try Asking {settings.siteName}</p>
            <p className="text-sm text-sky-200 font-mono">&ldquo;<TypingText phrases={["I have 3 hours of studying, gym, and two client calls.", "Plan my day with deep coding blocks and evening rest.", "Shift my workout to 18:30 and add a 20m break."]} />&rdquo;</p>
          </div>
          <div className="hero-stagger flex flex-wrap gap-4 pt-2">
            <Link href={isAuthenticated ? "/planner" : "/register"} className="glow-btn px-6 py-3.5 rounded-2xl font-medium text-white inline-flex items-center gap-2">
              <span>{settings.heroCtaText}</span><ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={isAuthenticated ? "/dashboard" : "/login"} className="liquid-glass px-6 py-3.5 rounded-2xl font-medium text-slate-200 hover:bg-white/10 transition">
              {isAuthenticated ? "Open Dashboard" : "Sign In"}
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 h-[380px] sm:h-[460px] relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-transparent to-purple-500/20 blur-3xl rounded-full" />
          <LiquidOrbScene />
        </div>
      </section>

      <section className="py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Architecture</p>
            <h2 className="text-3xl font-bold text-white mt-1">Intelligence Built for Human Rhythm</h2>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><BrainCircuit className="w-4 h-4 text-sky-400" /> Real AI Core</span>
            <span className="flex items-center gap-1.5"><Clock3 className="w-4 h-4 text-purple-400" /> Ultradian Breaks</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Private Data</span>
          </div>
        </div>
        <div className="sections-grid grid md:grid-cols-3 gap-6">
          {sections.map((sec) => (
            <div key={sec.id} className="gsap-section-card liquid-glass liquid-glass-hover rounded-3xl p-6 flex flex-col gap-4">
              {sec.imageUrl && <img src={sec.imageUrl} alt={sec.title} className="w-full h-40 object-cover rounded-2xl border border-white/10" />}
              {sec.badge && <span className="self-start text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-sky-400/15 text-sky-300 border border-sky-400/25">{sec.badge}</span>}
              <div>
                <h3 className="text-xl font-semibold text-white">{sec.title}</h3>
                {sec.subtitle && <p className="text-sm text-sky-200/80 mt-1">{sec.subtitle}</p>}
              </div>
              <p className="text-sm text-slate-300/90 leading-relaxed">{sec.content}</p>
            </div>
          ))}
        </div>
      </section>

      {projects.length > 0 && (
        <section className="py-12 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-400">Ecosystem</p>
            <h2 className="text-3xl font-bold text-white mt-1">Core Systems & Modules</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((p) => (
              <GlassCard key={p.id} className="p-6 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover rounded-2xl border border-white/10" />}
                  <span className="text-xs text-purple-300 font-medium">{p.category}</span>
                  <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{p.description}</p>
                </div>
                {p.linkUrl && <a href={p.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline">Explore Module →</a>}
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-slate-400">{settings.footerText}</footer>
    </div>
  );
}
