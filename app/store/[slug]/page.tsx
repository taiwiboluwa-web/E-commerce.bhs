import { notFound, redirect } from "next/navigation";
import { demoStorefronts, getDemoStorefront } from "@/lib/demo-storefronts";
import ExponairHomePage from "./exponair-homepage";
import "../../storefronts/demo-storefronts.css";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return demoStorefronts.map((store) => ({ slug: store.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "atelier-nova") redirect("/store/exponair-events-management");
  const store = getDemoStorefront(slug);
  if (slug === "exponair-events-management") {
    return { title: "Exponair Events Management Ltd | Kiddies Parties & Celebrations", description: "Creative kiddies party planning, decorations, rentals and memorable children’s celebrations for ages 1–10 in Lagos." };
  }
  return { title: store ? `${store.name} — Storefront Demo | BLUEHAVEN STUDIOS` : "Storefront Demo | BLUEHAVEN STUDIOS", description: store?.tagline ?? "BlueHaven Commerce storefront demonstration." };
}

export default async function DemoStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    const records = await sql.query("SELECT id,status,access_expires_at FROM public.tenants WHERE slug=$1 AND deleted_at IS NULL LIMIT 1", [slug]);
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
  const store = getDemoStorefront(slug);
  if (!store) notFound();
  if (slug === "exponair-events-management") return <ExponairHomePage />;

  return <main className="demo-page" style={{"--shop-accent":store.accent} as React.CSSProperties}><div className="demo-inner">
    <header className="demo-top"><a className="demo-brand" href="/">BLUEHAVEN <span>STUDIOS</span></a><a href="/storefronts">All demo storefronts ↗</a></header>
    <section className="shop-hero"><span className="shop-category">{store.category} / DEMO STORE</span><h1>{store.tagline}</h1><p>{store.description}</p><span className="demo-note">DEMO STOREFRONT · NOT A LIVE TENANT</span></section>
    <section className="shop-products-head"><div><span className="demo-kicker">THE SAMPLE COLLECTION</span><h2>Made to be explored.</h2><p>Illustrative product cards for layout and shopping-flow review.</p></div><span className="demo-note">{store.products.length} SAMPLE ITEMS</span></section>
    <section className="shop-product-grid">{store.products.map((product,index)=><article className="shop-product" key={product.name}><div className="shop-product-art">{store.initials}<span style={{fontSize:12,alignSelf:"end",marginBottom:14,marginLeft:-38,opacity:.65}}>0{index+1}</span></div><span className="shop-product-tag">{product.tag}</span><h3>{product.name}</h3><p>{product.detail}</p><div className="shop-product-bottom"><b>{product.price}</b><button className="shop-demo-button" type="button" disabled>PREVIEW ONLY</button></div></article>)}</section>
    <div className="shop-disclaimer"><strong>DEMO CONTENT:</strong> This storefront is a visual demonstration. Names, products, prices and product artwork are illustrative—not real merchant listings. Checkout, inventory and payment are intentionally disabled. No orders or customer records are created.</div>
    <a className="shop-back" href="/storefronts">← Back to all demo storefronts</a>
    <footer className="demo-footer"><span>© {new Date().getFullYear()} BLUEHAVEN STUDIOS</span><span>CREATIVITY BEYOND LIMITS</span><span>STOREFRONT PREVIEW</span></footer>
  </div></main>;
}
