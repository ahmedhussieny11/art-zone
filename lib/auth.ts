import { cookies } from "next/headers";
import crypto from "crypto";
import { getAdminUserRecords } from "@/lib/data";
import { verifyAdminPasswordHash } from "@/lib/admin-crypto";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AdminAccount = { username: string; password: string };

function getSecret(): string {
  return process.env.ADMIN_SECRET || "artzone-default-secret-change-me";
}

function signToken(payload: string): string {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(payload);
  return hmac.digest("hex");
}

function safeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function parseAdminUsersJson(raw: string): AdminAccount[] | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return null;
    const out: AdminAccount[] = [];
    for (const item of data) {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as { username?: unknown }).username === "string" &&
        typeof (item as { password?: unknown }).password === "string"
      ) {
        const username = (item as { username: string }).username.trim();
        const password = (item as { password: string }).password;
        if (username && password) out.push({ username, password });
      }
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

/** From ADMIN_USERS (JSON array) or ADMIN_USERNAME + ADMIN_PASSWORD */
export function getEnvAdminAccounts(): AdminAccount[] {
  const fromEnv = process.env.ADMIN_USERS?.trim();
  if (fromEnv) {
    const parsed = parseAdminUsersJson(fromEnv);
    if (parsed?.length) return parsed;
  }
  const username = (process.env.ADMIN_USERNAME || "admin").trim() || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  return [{ username, password }];
}

export function verifyCredentials(username: string, password: string): boolean {
  const u = username.trim();
  if (!u || password == null) return false;

  const fileUsers = getAdminUserRecords();
  if (fileUsers.length > 0) {
    for (const acc of fileUsers) {
      if (acc.username !== u) continue;
      return verifyAdminPasswordHash(acc.passwordHash, password);
    }
    return false;
  }

  for (const acc of getEnvAdminAccounts()) {
    if (acc.username !== u) continue;
    return safeEqualString(password, acc.password);
  }
  return false;
}

export function createSession(): string {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin:${expires}`;
  const signature = signToken(payload);
  return `${payload}:${signature}`;
}

export function verifySession(token: string): boolean {
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [role, expiresStr, signature] = parts;
  if (role !== "admin") return false;
  const expires = parseInt(expiresStr, 10);
  if (Date.now() > expires) return false;
  const expectedSig = signToken(`${role}:${expiresStr}`);
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSig, "hex")
  );
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session?.value) return false;
  return verifySession(session.value);
}

export { COOKIE_NAME, SESSION_MAX_AGE };
