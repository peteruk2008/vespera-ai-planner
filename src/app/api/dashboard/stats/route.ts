import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const today = new URL(req.url).searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const base = new Date(today + "T00:00:00Z");
    const weekDates = Array.from({ length: 7 }, (_, idx) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() + idx - 3); return d.toISOString().slice(0, 10); });
    const allTasks = await prisma.task.findMany({ where: { userId: user.userId }, orderBy: [{ date: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }] });
    const todayTasks = allTasks.filter((t) => t.date === today);
    const actionable = todayTasks.filter((t) => !t.isBreak);
    const completed = actionable.filter((t) => t.status === "COMPLETED");
    const pending = actionable.filter((t) => t.status !== "COMPLETED" && t.status !== "SKIPPED");
    return NextResponse.json({
      today, todayTasks,
      upcomingTasks: allTasks.filter((t) => t.date >= today && t.status !== "COMPLETED" && !t.isBreak).slice(0, 10),
      weeklyOverview: weekDates.map((d) => { const dt = allTasks.filter((t) => t.date === d && !t.isBreak); const done = dt.filter((t) => t.status === "COMPLETED").length; return { date: d, total: dt.length, completed: done, minutes: dt.reduce((s, t) => s + t.durationMinutes, 0), rate: dt.length ? Math.round((done / dt.length) * 100) : 0 }; }),
      metrics: { totalToday: actionable.length, completedToday: completed.length, pendingToday: pending.length, progressPct: actionable.length ? Math.round((completed.length / actionable.length) * 100) : 0, focusMinutesToday: completed.reduce((s, t) => s + t.durationMinutes, 0), plannedMinutesToday: actionable.reduce((s, t) => s + t.durationMinutes, 0), allTimeCompleted: allTasks.filter((t) => t.status === "COMPLETED" && !t.isBreak).length },
    });
  } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}
