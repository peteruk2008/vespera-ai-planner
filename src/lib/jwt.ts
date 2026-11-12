import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "vespera_session";
export interface SessionPayload { userId: string; email: string; name: string; role: "USER" | "ADMIN"; }

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET must be set (min 16 characters).");
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string" || (payload.role !== "USER" && payload.role !== "ADMIN")) return null;
    return { userId: payload.userId, email: payload.email, name: payload.name, role: payload.role };
  } catch { return null; }
}
