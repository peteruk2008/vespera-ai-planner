"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock, Flame, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface StatsResponse {
  today: string;
  todayTasks: Array<{ id: string; title: string; startTime: string; endTime: string; status: string; priority: string; isBreak: boolean }>;
  upcomingTasks: Array<{ id: string; title: string; date: string; startTime: string; priority: string }>;
  weeklyOverview: Array<{ date: string; total: number; completed: number; minutes: number; rate: number }>;
  metrics: { totalToday: number; completedToday: number; pendingToday: number; progressPct: number; focusMinutesToday: number; plannedMinutesToday: number; allTimeCompleted: number };
}

export function DashboardClient({ userName }: { userName: string }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/stats?date=${selectedDate}`).then((r) => r.json()).then((d) => setData(d)).catch(() => {});
  }, [selectedDate]);

  if (!data) return <div className="max-w-7xl mx-auto px-4 py-12 text-slate-400 text-sm">Loading productivity telemetry...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {userName}</h1>
          <p className="text-sm text-slate-400 mt-1">Vespera Personal Telemetry & Daily Cadence</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
          <Link href="/planner" className="glow-btn px-4 py-2.5 rounded-xl text-sm font-medium text-white">Open AI Planner</Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex items-center justify-between">
          <div><p className="text-xs text-slate-400">Daily Progress</p><p className="text-3xl font-bold text-white mt-1">{data.metrics.progressPct}%</p><p className="text-xs text-sky-300 mt-1">{data.metrics.completedToday} of {data.metrics.totalToday} completed</p></div>
          <TrendingUp className="w-8 h-8 text-sky-400" />
        </GlassCard>
        <GlassCard className="p-5 flex items-center justify-between">
          <div><p className="text-xs text-slate-400">Pending Today</p><p className="text-3xl font-bold text-white mt-1">{data.metrics.pendingToday}</p><p className="text-xs text-slate-400 mt-1">Remaining tasks</p></div>
          <Clock className="w-8 h-8 text-purple-400" />
        </GlassCard>
        <GlassCard className="p-5 flex items-center justify-between">
          <div><p className="text-xs text-slate-400">Focus Completed</p><p className="text-3xl font-bold text-white mt-1">{(data.metrics.focusMinutesToday / 60).toFixed(1)}h</p><p className="text-xs text-slate-400 mt-1">of {(data.metrics.plannedMinutesToday / 60).toFixed(1)}h planned</p></div>
          <Flame className="w-8 h-8 text-amber-400" />
        </GlassCard>
        <GlassCard className="p-5 flex items-center justify-between">
          <div><p className="text-xs text-slate-400">Lifetime Completed</p><p className="text-3xl font-bold text-white mt-1">{data.metrics.allTimeCompleted}</p><p className="text-xs text-emerald-300 mt-1">Total executed blocks</p></div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-7 p-6 space-y-4" hover={false}>
          <h2 className="font-semibold text-white flex items-center gap-2"><CalendarDays className="w-5 h-5 text-sky-400" /> 7-Day Calendar & Weekly Overview</h2>
          <div className="grid grid-cols-7 gap-2 items-end h-44 pt-4">
            {data.weeklyOverview.map((d) => (
              <button key={d.date} onClick={() => setSelectedDate(d.date)} className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition cursor-pointer ${d.date === selectedDate ? "bg-sky-500/20 border border-sky-400/40" : "hover:bg-white/5"}`}>
                <div className="w-full h-24 bg-white/5 rounded-xl flex items-end overflow-hidden p-1">
                  <div className="w-full rounded-lg bg-gradient-to-t from-sky-400 to-purple-500 transition-all" style={{ height: `${Math.max(8, d.rate)}%` }} />
                </div>
                <span className="text-[11px] font-mono text-slate-300">{d.date.slice(5)}</span>
                <span className="text-[10px] text-slate-400">{d.completed}/{d.total}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-5 p-6 space-y-4" hover={false}>
          <h2 className="font-semibold text-white">Upcoming Tasks</h2>
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {data.upcomingTasks.length === 0 ? <p className="text-xs text-slate-400">No pending upcoming tasks.</p> : data.upcomingTasks.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div><p className="text-sm font-medium text-white">{t.title}</p><p className="text-[11px] text-slate-400">{t.date} · {t.startTime}</p></div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300">{t.priority}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 space-y-4" hover={false}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Schedule for {selectedDate}</h2>
          <Link href="/planner" className="text-xs text-sky-400 hover:underline">Edit in AI Planner →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {data.todayTasks.length === 0 ? <p className="text-sm text-slate-400">No schedule saved for this date yet.</p> : data.todayTasks.map((t) => (
            <div key={t.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-sky-300">{t.startTime} – {t.endTime}</span>
                <p className={`text-sm font-medium mt-0.5 ${t.status === "COMPLETED" ? "line-through text-slate-400" : "text-white"}`}>{t.title}</p>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full ${t.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-300"}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
