import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

const COOKIE = "exponair_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;

function secret() {
  const value = process.env.EXPONAIR_ADMIN_PASSWORD || "";
  if (!value) throw new Error("EXPONAIR_ADMIN_PASSWORD is not configured.");
  return value;
}
export function verifyExponairPassword(candidate: string) {
  const expected = Buffer.from(secret());
  const supplied = Buffer.from(candidate);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
export function createExponairSession() {
  const expires = Math.floor(Date.now()/1000) + SESSION_SECONDS;
  const payload = String(expires);
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return { token: payload + "." + signature, maxAge: SESSION_SECONDS };
}
export function hasExponairSession(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE)?.value || "";
    const dot = token.lastIndexOf(".");
    if (dot < 1) return false;
    const payload = token.slice(0,dot);
    const signature = Buffer.from(token.slice(dot+1),"base64url");
    const expected = createHmac("sha256",secret()).update(payload).digest();
    return signature.length === expected.length && timingSafeEqual(signature,expected) &&
      Number(payload) > Math.floor(Date.now()/1000);
  } catch { return false; }
}
export const EXPONAIR_SESSION_COOKIE = COOKIE;
