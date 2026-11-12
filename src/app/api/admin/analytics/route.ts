import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
export async function GET() {
  try {
    await requireAdmin();
    const since = new Date(); since.setDate(since.getDate() - 14);
    const [totalViews, events, totalUsers, totalTasks] = await Promise.all([
      prisma.visitorEvent.count(),
      prisma.visitorEvent.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" } }),
      prisma.user.count(),
      prisma.task.count(),
    ]);
    const byPath = new Map<string, number>(), byDay = new Map<string, number>();
    for (const e of events) {
      byPath.set(e.path, (byPath.get(e.path) ?? 0) + 1);
      const day = e.createdAt.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    return NextResponse.json({
      totalViews, last14DaysViews: events.length, uniqueVisitors14d: new Set(events.map((e) => e.visitorId)).size, totalUsers, totalTasks,
      topPages: Array.from(byPath, ([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 8),
      dailyTraffic: Array.from(byDay, ([date, views]) => ({ date, views })).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
}
