import type { Metadata } from "next";
import ExponairStorefront from "../store/[slug]/exponair-storefront";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exponair Events Management Limited | Event Planners, Kiddies' Parties & Styling in Lagos",
  description: "Passionately bringing events to life. Exponair plans kiddies' parties, adult celebrations, weddings, corporate events, event styling and rentals across Lagos, Nigeria.",
  keywords: [
    "kiddies party planners in Lagos",
    "children's birthday decoration Lagos",
    "luxury kiddies birthday celebrations",
    "adult birthday event planners Lagos",
    "wedding and proposal decoration Lagos",
    "corporate event planners Lagos",
    "event rentals Lagos",
    "event styling and coordination Nigeria",
  ],
  alternates: { canonical: "/exponair" },
  openGraph: {
    siteName: "Exponair Events Management Limited",
    title: "Exponair Events | Passionately Bringing Events to Life",
    description: "Kiddies' parties, social celebrations, weddings, corporate events and event rentals in Lagos.",
    type: "website",
    locale: "en_NG",
    images: [{ url: "/exponair-logo.svg", alt: "Exponair Events Management Limited logo" }],
  },
};

export default async function ExponairPage() {
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    const records = await sql.query("SELECT id,status,access_expires_at FROM public.tenants WHERE slug='exponair-events-management' AND deleted_at IS NULL LIMIT 1");
    const tenant = records[0] as {id:string;status:string;access_expires_at:string|null}|undefined;
    if (tenant) {
      const expired = Boolean(tenant.access_expires_at && new Date(tenant.access_expires_at).getTime() <= Date.now());
      if (expired && tenant.status === "active") {
        await sql.query("UPDATE public.tenants SET status='suspended'::public.tenant_status,access_suspended_at=COALESCE(access_suspended_at,now()),updated_at=now() WHERE id=$1::uuid", [tenant.id]);
      }
      if (expired || tenant.status !== "active") {
        return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#09090b",color:"#f5f3ef",fontFamily:"Arial,sans-serif",textAlign:"center"}}><section style={{maxWidth:520}}><p style={{letterSpacing:".22em",fontSize:11,color:"#d4b15b"}}>STOREFRONT TEMPORARILY UNAVAILABLE</p><h1 style={{fontSize:"clamp(30px,6vw,52px)",fontWeight:500}}>This storefront is taking a short pause.</h1><p style={{color:"#aaa",lineHeight:1.7}}>The store owner is arranging access renewal. Please check back shortly.</p></section></main>;
      }
    }
  }
  return <ExponairStorefront />;
}
