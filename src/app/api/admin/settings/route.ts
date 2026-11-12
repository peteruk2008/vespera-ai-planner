import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
const Schema = z.object({ siteName: z.string().min(1).max(60), tagline: z.string().max(180), heroTitle: z.string().min(1).max(180), heroSubtitle: z.string().max(500), heroCtaText: z.string().min(1).max(50), accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), footerText: z.string().max(250), maintenanceMode: z.boolean() });
export async function GET() { try { await requireAdmin(); return NextResponse.json({ settings: await prisma.siteSettings.findUnique({ where: { id: "singleton" } }) }); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); } }
export async function PUT(req: Request) { try { await requireAdmin(); const data = Schema.parse(await req.json()); return NextResponse.json({ settings: await prisma.siteSettings.upsert({ where: { id: "singleton" }, update: data, create: { id: "singleton", ...data } }) }); } catch { return NextResponse.json({ error: "Failed" }, { status: 403 }); } }
