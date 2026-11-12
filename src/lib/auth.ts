import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { SESSION_COOKIE, signSessionToken, verifySessionToken, type SessionPayload } from "./jwt";
export { SESSION_COOKIE, signSessionToken, verifySessionToken, type SessionPayload };

export async function getSessionUser(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const parsed = await verifySessionToken(token);
  if (!parsed) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: parsed.userId }, select: { id: true, email: true, name: true, role: true } });
  if (!dbUser) return null;
  return { userId: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role };
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
