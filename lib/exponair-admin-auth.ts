import { createHmac, timingSafeEqual, pbkdf2Sync } from "node:crypto";
import { NextRequest } from "next/server";

const COOKIE = "exponair_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
function passwordHash() {
  const value=process.env.EXPONAIR_ADMIN_PASSWORD_HASH||"";
  const [salt,digest]=value.split(":");
  if(!salt||!digest)throw new Error("EXPONAIR_ADMIN_PASSWORD_HASH is not configured.");
  return {salt,digest};
}
export function verifyExponairPassword(candidate:string) {
  try {
    const {salt,digest}=passwordHash();
    const expected=Buffer.from(digest,"base64url");
    const actual=pbkdf2Sync(candidate,Buffer.from(salt,"base64url"),310000,32,"sha256");
    return expected.length===actual.length&&timingSafeEqual(expected,actual);
  } catch { return false; }
}
function sessionSecret(){return process.env.EXPONAIR_ADMIN_PASSWORD_HASH||"";}
export function createExponairSession() {
  const expires=Math.floor(Date.now()/1000)+SESSION_SECONDS,payload=String(expires);
  const signature=createHmac("sha256",sessionSecret()).update(payload).digest("base64url");
  return {token:payload+"."+signature,maxAge:SESSION_SECONDS};
}
export function hasExponairSession(req:NextRequest) {
  try {
    const token=req.cookies.get(COOKIE)?.value||"",dot=token.lastIndexOf(".");
    if(dot<1)return false;
    const payload=token.slice(0,dot),signature=Buffer.from(token.slice(dot+1),"base64url");
    const expected=createHmac("sha256",sessionSecret()).update(payload).digest();
    return signature.length===expected.length&&timingSafeEqual(signature,expected)&&Number(payload)>Math.floor(Date.now()/1000);
  } catch {return false;}
}
export const EXPONAIR_SESSION_COOKIE=COOKIE;
