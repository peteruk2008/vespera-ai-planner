import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const [settings, sections, projects, pages] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.siteSection.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    prisma.projectShowcase.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.customPage.findMany({ where: { published: true }, select: { id: true, slug: true, title: true, summary: true } }),
  ]);
  return NextResponse.json({ settings, sections, projects, pages });
}
