import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signSessionToken, SESSION_COOKIE } from "@/lib/auth";
const Schema = z.object({ name: z.string().min(2).max(60), email: z.string().email(), password: z.string().min(8).max(100) });
export async function POST(req: Request) {
  try {
    const { name, email, password } = Schema.parse(await req.json());
    const normalized = email.toLowerCase().trim();
    if (await prisma.user.findUnique({ where: { email: normalized } })) return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name: name.trim(), email: normalized, passwordHash, role: "USER" }, select: { id: true, email: true, name: true, role: true } });
    const token = await signSessionToken({ userId: user.id, email: user.email, name: user.name, role: user.role });
    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0]?.message || "Invalid input" }, { status: 400 });
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
