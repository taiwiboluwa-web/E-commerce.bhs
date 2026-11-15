import { NextRequest, NextResponse } from "next/server";
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "sp_clothing_session";
const COOKIE_PATH = "/api/sp-clothing-services";

function verifyPassword(candidate: string) {
  const stored = process.env.SP_CLOTHING_ADMIN_PASSWORD_HASH || "";
  const [scheme, iterationsText, saltText, hashText] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterationsText || !saltText || !hashText) return false;
  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;
  try {
    const expected = Buffer.from(hashText, "base64url");
    const actual = pbkdf2Sync(candidate, Buffer.from(saltText, "base64url"), iterations, expected.length, "sha256");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}
function sign(value: string) {
  return createHmac("sha256", process.env.SP_CLOTHING_SESSION_SECRET || "").update(value).digest("base64url");
}
export async function POST(req: NextRequest) {
  if (!process.env.SP_CLOTHING_ADMIN_PASSWORD_HASH || !process.env.SP_CLOTHING_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin sign-in is not configured. Contact BlueHaven Studios." }, { status: 503 });
  }
  try {
    const body = await req.json();
    if (typeof body.password !== "string" || !verifyPassword(body.password)) {
      return NextResponse.json({ error: "Password not accepted." }, { status: 401 });
    }
    const payload = String(Date.now() + 8 * 60 * 60 * 1000) + "." + randomBytes(24).toString("base64url");
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE, payload + "." + sign(payload), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
      path: COOKIE_PATH, maxAge: 8 * 60 * 60
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to verify sign-in." }, { status: 400 });
  }
}
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: COOKIE_PATH, maxAge: 0
  });
  return response;
}
