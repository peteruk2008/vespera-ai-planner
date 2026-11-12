import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
const Schema = z.object({ id: z.string().optional(), slug: z.string().regex(/^[a-z0-9-]+$/), title: z.string().min(1).max(140), summary: z.string().max(300).default(""), content: z.string().min(1), heroImage: z.string().nullable().optional(), published: z.boolean().default(true) });
export async function GET() { try { await requireAdmin(); return NextResponse.json({ pages: await prisma.customPage.findMany({ orderBy: { createdAt: "desc" } }) }); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); } }
export async function POST(req: Request) { try { await requireAdmin(); const { id: _id, ...data } = Schema.parse(await req.json()); return NextResponse.json({ page: await prisma.customPage.create({ data }) }, { status: 201 }); } catch { return NextResponse.json({ error: "Failed" }, { status: 400 }); } }
export async function PUT(req: Request) { try { await requireAdmin(); const { id, ...rest } = Schema.parse(await req.json()); if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 }); return NextResponse.json({ page: await prisma.customPage.update({ where: { id }, data: rest }) }); } catch { return NextResponse.json({ error: "Failed" }, { status: 400 }); } }
export async function DELETE(req: Request) { try { await requireAdmin(); const id = new URL(req.url).searchParams.get("id"); if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 }); await prisma.customPage.delete({ where: { id } }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); } }
