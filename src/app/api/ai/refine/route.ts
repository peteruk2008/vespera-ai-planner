import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { refineDailySchedule } from "@/lib/ai";
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { date, message } = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), message: z.string().min(2).max(1500) }).parse(await req.json());
    const [currentTasks, history] = await Promise.all([
      prisma.task.findMany({ where: { userId: user.userId, date }, orderBy: { sortOrder: "asc" } }),
      prisma.chatMessage.findMany({ where: { userId: user.userId, date }, orderBy: { createdAt: "asc" }, take: 10 }),
    ]);
    const result = await refineDailySchedule({ instruction: message, date, currentTasks, history: history.map((h) => ({ role: h.role === "assistant" ? "assistant" : "user", content: h.content })) });
    const updatedTasks = await prisma.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { userId: user.userId, date } });
      const created = [];
      for (let i = 0; i < result.tasks.length; i++) {
        const t = result.tasks[i];
        const prev = currentTasks.find((c) => c.title.toLowerCase() === t.title.toLowerCase());
        created.push(await tx.task.create({ data: { userId: user.userId, date, ...t, status: prev?.status ?? "PENDING", sortOrder: i, aiGenerated: true } }));
      }
      await tx.chatMessage.createMany({ data: [{ userId: user.userId, date, role: "user", content: message }, { userId: user.userId, date, role: "assistant", content: result.reply }] });
      return created;
    });
    return NextResponse.json({ reply: result.reply, tasks: updatedTasks });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof Error && err.message === "AI_NOT_CONFIGURED") return NextResponse.json({ error: "OPENAI_API_KEY missing in .env" }, { status: 503 });
    return NextResponse.json({ error: "Could not refine schedule." }, { status: 500 });
  }
}
