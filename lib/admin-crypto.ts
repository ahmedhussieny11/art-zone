import crypto from "crypto";

const SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

export function hashAdminPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(plain, salt, 64, SCRYPT_OPTS);
  return `${salt}:${derived.toString("hex")}`;
}

export function verifyAdminPasswordHash(stored: string, plain: string): boolean {
  const idx = stored.indexOf(":");
  if (idx <= 0) return false;
  const salt = stored.slice(0, idx);
  const hashHex = stored.slice(idx + 1);
  try {
    const hashBuf = Buffer.from(hashHex, "hex");
    const verifyBuf = crypto.scryptSync(plain, salt, 64, SCRYPT_OPTS);
    if (hashBuf.length !== verifyBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, verifyBuf);
  } catch {
    return false;
  }
}
