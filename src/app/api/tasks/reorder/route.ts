import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { orderedIds } = z.object({ orderedIds: z.array(z.string()).min(1) }).parse(await req.json());
    await prisma.$transaction(orderedIds.map((id, i) => prisma.task.updateMany({ where: { id, userId: user.userId }, data: { sortOrder: i } })));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Reorder failed" }, { status: 400 }); }
}
