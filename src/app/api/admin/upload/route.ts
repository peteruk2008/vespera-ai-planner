import { NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
export async function GET() { try { await requireAdmin(); return NextResponse.json({ media: await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }) }); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); } }
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const file = (await req.formData()).get("file");
    if (!(file instanceof File) || !ALLOWED.has(file.type) || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Invalid image (max 5MB)" }, { status: 400 });
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = (path.extname(file.name) || ".png").replace(/[^a-zA-Z0-9.]/g, "");
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
    const asset = await prisma.mediaAsset.create({ data: { filename, originalName: file.name, url: `/uploads/${filename}`, mimeType: file.type, sizeBytes: file.size } });
    return NextResponse.json({ asset }, { status: 201 });
  } catch { return NextResponse.json({ error: "Upload failed" }, { status: 500 }); }
}
export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await unlink(path.join(UPLOAD_DIR, path.basename(asset.filename))).catch(() => {});
    await prisma.mediaAsset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
}
