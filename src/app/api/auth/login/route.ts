import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signSessionToken, SESSION_COOKIE } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    const payload = { userId: user.id, email: user.email, name: user.name, role: user.role };
    const token = await signSessionToken(payload);
    const res = NextResponse.json({ user: payload });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
    return res;
  } catch { return NextResponse.json({ error: "Authentication failed" }, { status: 400 }); }
}
