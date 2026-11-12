import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    const { path, visitorId } = await req.json();
    if (typeof path !== "string" || typeof visitorId !== "string") return NextResponse.json({ ok: false }, { status: 400 });
    if (path.startsWith("/admin") || path.startsWith("/api")) return NextResponse.json({ ok: true });
    await prisma.visitorEvent.create({ data: { path: path.slice(0, 200), visitorId: visitorId.slice(0, 100), referrer: req.headers.get("referer")?.slice(0, 300) ?? null, userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false }, { status: 500 }); }
}
