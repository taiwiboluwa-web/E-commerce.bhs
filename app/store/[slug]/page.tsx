import Link from "next/link";
import { notFound } from "next/navigation";
import { demoStorefronts, getDemoStorefront } from "@/lib/demo-storefronts";
import "../storefronts/demo-storefronts.css";

export function generateStaticParams() {
  return demoStorefronts.map((store) => ({ slug: store.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = getDemoStorefront(slug);
  return { title: store ? `${store.name} — Storefront Demo | BLUEHAVEN STUDIOS` : "Storefront Demo | BLUEHAVEN STUDIOS", description: store?.tagline ?? "BlueHaven Commerce storefront demonstration." };
}

export default async function DemoStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = getDemoStorefront(slug);
  if (!store) notFound();

  return <main className="demo-page" style={{"--shop-accent":store.accent} as React.CSSProperties}><div className="demo-inner">
    <header className="demo-top"><Link className="demo-brand" href="/">BLUEHAVEN <span>STUDIOS</span></Link><Link href="/storefronts">All demo storefronts ↗</Link></header>
    <section className="shop-hero"><span className="shop-category">{store.category} / DEMO STORE</span><h1>{store.tagline}</h1><p>{store.description}</p><span className="demo-note">DEMO STOREFRONT · NOT A LIVE TENANT</span></section>
    <section className="shop-products-head"><div><span className="demo-kicker">THE SAMPLE COLLECTION</span><h2>Made to be explored.</h2><p>Illustrative product cards for layout and shopping-flow review.</p></div><span className="demo-note">{store.products.length} SAMPLE ITEMS</span></section>
    <section className="shop-product-grid">{store.products.map((product,index)=><article className="shop-product" key={product.name}><div className="shop-product-art">{store.initials}<span style={{fontSize:12,alignSelf:"end",marginBottom:14,marginLeft:-38,opacity:.65}}>0{index+1}</span></div><span className="shop-product-tag">{product.tag}</span><h3>{product.name}</h3><p>{product.detail}</p><div className="shop-product-bottom"><b>{product.price}</b><button className="shop-demo-button" type="button" disabled>PREVIEW ONLY</button></div></article>)}</section>
    <div className="shop-disclaimer"><strong>DEMO CONTENT:</strong> This storefront is a visual demonstration. Names, products, prices and product artwork are illustrative—not real merchant listings. Checkout, inventory and payment are intentionally disabled. No orders or customer records are created.</div>
    <Link className="shop-back" href="/storefronts">← Back to all ten demo storefronts</Link>
    <footer className="demo-footer"><span>© {new Date().getFullYear()} BLUEHAVEN STUDIOS</span><span>CREATIVITY BEYOND LIMITS</span><span>STOREFRONT PREVIEW</span></footer>
  </div></main>;
}
