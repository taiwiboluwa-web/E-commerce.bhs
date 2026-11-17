import type { Metadata } from "next";
import { neon } from "@neondatabase/serverless";
import BigBStorefront from "./big-b-client";
import "./big-b.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "BIG B'S — Ideas. People. Evolution.",
  description: "A student-led brand bringing people, ideas and opportunities closer together. Founded by Lukan Boluwatife Rita.",
  alternates: { canonical: "https://e-commerce-bhs.vercel.app/big-bs" },
  openGraph: { title: "BIG B'S — Ideas. People. Evolution.", description: "A student-led brand for connection, creativity and opportunity.", type: "website" }
};

function AccessNotice() {
  const message = encodeURIComponent("Hello BlueHaven Studios Support, I need assistance with the BIG B'S storefront.");
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#071d13",color:"#f6f8f2",fontFamily:"Arial,sans-serif",textAlign:"center"}}>
    <section style={{maxWidth:540}}>
      <p style={{letterSpacing:".22em",fontSize:10,color:"#e8ed36",fontWeight:700}}>BLUEHAVEN STUDIOS / STOREFRONT ACCESS</p>
      <h1 style={{fontSize:"clamp(34px,7vw,58px)",lineHeight:1.05,margin:"22px 0 14px"}}>BIG B'S is taking a short pause.</h1>
      <p style={{color:"#a5b7a9",lineHeight:1.8,fontSize:15}}>This storefront is currently unavailable. Please contact BlueHaven Studios Support for assistance.</p>
      <a href={`https://wa.me/2348068483718?text=${message}`} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",marginTop:22,padding:"15px 22px",borderRadius:4,background:"#e8ed36",color:"#10251a",fontWeight:700,textDecoration:"none"}}>Contact support on WhatsApp · 0806 848 3718</a>
    </section>
  </main>;
}

export default async function BigBStorefrontPage() {
  if (!process.env.DATABASE_URL) return <AccessNotice />;
  try {
    const sql = neon(process.env.DATABASE_URL);
    const records = await sql.query("SELECT id,status,access_expires_at FROM public.tenants WHERE slug='big-bs' AND deleted_at IS NULL LIMIT 1");
    const tenant = records[0] as {id:string;status:string;access_expires_at:string|null}|undefined;
    if (!tenant) return <AccessNotice />;
    const expired = Boolean(tenant.access_expires_at && new Date(tenant.access_expires_at).getTime() <= Date.now());
    if (expired && tenant.status === "active") {
      await sql.query("UPDATE public.tenants SET status='suspended'::public.tenant_status,access_suspended_at=COALESCE(access_suspended_at,now()),updated_at=now() WHERE id=$1::uuid", [tenant.id]);
    }
    if (expired || tenant.status !== "active") return <AccessNotice />;
    return <BigBStorefront />;
  } catch (error) {
    console.error("BIG B'S storefront access check failed", error);
    return <AccessNotice />;
  }
}
