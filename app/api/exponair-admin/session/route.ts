import { NextRequest, NextResponse } from "next/server";
import { createExponairSession, EXPONAIR_SESSION_COOKIE, verifyExponairPassword } from "../../../../lib/exponair-admin-auth";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!process.env.EXPONAIR_ADMIN_PASSWORD_HASH) return NextResponse.json({error:"Exponair admin access is not configured."},{status:503});
  try {
    const body = await req.json();
    if (typeof body.password !== "string" || !verifyExponairPassword(body.password))
      return NextResponse.json({error:"The password is incorrect."},{status:401});
    const session = createExponairSession();
    const response = NextResponse.json({ok:true});
    response.cookies.set(EXPONAIR_SESSION_COOKIE,session.token,{
      httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",
      path:"/api/exponair-admin",maxAge:session.maxAge
    });
    return response;
  } catch { return NextResponse.json({error:"Unable to sign in."},{status:400}); }
}
export async function DELETE() {
  const response=NextResponse.json({ok:true});
  response.cookies.set(EXPONAIR_SESSION_COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/api/exponair-admin",maxAge:0});
  return response;
}
