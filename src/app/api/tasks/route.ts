import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
const Schema = z.object({ title: z.string().min(1).max(120), description: z.string().max(400).default(""), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), startTime: z.string().regex(/^\d{2}:\d{2}$/), endTime: z.string().regex(/^\d{2}:\d{2}$/), durationMinutes: z.number().int().min(5).max(720), priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"), category: z.enum(["WORK", "STUDY", "HEALTH", "PERSONAL", "BREAK", "FREE_TIME"]).default("WORK"), isBreak: z.boolean().default(false) });
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const date = new URL(req.url).searchParams.get("date");
    const [tasks, messages] = await Promise.all([
      prisma.task.findMany({ where: { userId: user.userId, ...(date ? { date } : {}) }, orderBy: [{ date: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }] }),
      date ? prisma.chatMessage.findMany({ where: { userId: user.userId, date }, orderBy: { createdAt: "asc" } }) : Promise.resolve([]),
    ]);
    return NextResponse.json({ tasks, messages });
  } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = Schema.parse(await req.json());
    const count = await prisma.task.count({ where: { userId: user.userId, date: body.date } });
    return NextResponse.json({ task: await prisma.task.create({ data: { ...body, userId: user.userId, sortOrder: count, aiGenerated: false } }) }, { status: 201 });
  } catch { return NextResponse.json({ error: "Invalid task" }, { status: 400 }); }
}
