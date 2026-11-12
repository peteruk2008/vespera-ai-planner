import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateDailySchedule } from "@/lib/ai";
const Schema = z.object({ prompt: z.string().min(3).max(2000), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), wakeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), sleepTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), replaceExisting: z.boolean().default(true) });
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const input = Schema.parse(await req.json());
    const existingTasks = input.replaceExisting ? [] : await prisma.task.findMany({ where: { userId: user.userId, date: input.date }, orderBy: { sortOrder: "asc" } });
    const aiPlan = await generateDailySchedule({ ...input, existingTasks });
    const savedTasks = await prisma.$transaction(async (tx) => {
      if (input.replaceExisting) await tx.task.deleteMany({ where: { userId: user.userId, date: input.date } });
      const created = [];
      for (let i = 0; i < aiPlan.tasks.length; i++) {
        created.push(await tx.task.create({ data: { userId: user.userId, date: input.date, ...aiPlan.tasks[i], status: "PENDING", sortOrder: i, aiGenerated: true } }));
      }
      await tx.chatMessage.createMany({ data: [{ userId: user.userId, date: input.date, role: "user", content: input.prompt }, { userId: user.userId, date: input.date, role: "assistant", content: `${aiPlan.summary} — ${aiPlan.coachNote}` }] });
      return created;
    });
    return NextResponse.json({ summary: aiPlan.summary, coachNote: aiPlan.coachNote, tasks: savedTasks });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof Error && err.message === "AI_NOT_CONFIGURED") return NextResponse.json({ error: "OPENAI_API_KEY is not configured in .env" }, { status: 503 });
    return NextResponse.json({ error: "Failed to generate schedule." }, { status: 500 });
  }
}
