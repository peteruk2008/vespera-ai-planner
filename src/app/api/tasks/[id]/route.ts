import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
const Schema = z.object({ title: z.string().min(1).max(120).optional(), description: z.string().max(400).optional(), startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), durationMinutes: z.number().int().min(5).max(720).optional(), priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(), category: z.enum(["WORK", "STUDY", "HEALTH", "PERSONAL", "BREAK", "FREE_TIME"]).optional(), status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"]).optional(), isBreak: z.boolean().optional() });
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const data = Schema.parse(await req.json());
    if (!(await prisma.task.findFirst({ where: { id, userId: user.userId } }))) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ task: await prisma.task.update({ where: { id }, data }) });
  } catch { return NextResponse.json({ error: "Update failed" }, { status: 400 }); }
}
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const deleted = await prisma.task.deleteMany({ where: { id, userId: user.userId } });
    return deleted.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}
