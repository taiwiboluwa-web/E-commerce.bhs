import Link from "next/link";
import { demoStorefronts } from "@/lib/demo-storefronts";
import "./demo-storefronts.css";

export const metadata = { title: "Storefront Demo Gallery — BLUEHAVEN STUDIOS", description: "Explore ten illustrative BlueHaven Commerce storefront demos." };

export default function StorefrontGallery() {
  return <main className="demo-page"><div className="demo-inner">
    <header className="demo-top"><Link className="demo-brand" href="/">BLUEHAVEN <span>STUDIOS</span></Link><Link href="/">← Master control centre</Link></header>
    <section className="demo-heading"><span className="demo-kicker">BLUEHAVEN COMMERCE / STOREFRONT GALLERY</span><h1>Ten ways to <em>come to life.</em></h1><p>Explore a selection of storefront experiences built to demonstrate how a BlueHaven Commerce tenant can present its brand, services and customer journey.</p><span className="demo-note">DEMO ENVIRONMENT · SAMPLE CONTENT ONLY</span></section>
    <section className="demo-grid">{demoStorefronts.map((store,index)=><Link className="demo-store-card" href={`/store/${store.slug}`} key={store.slug}><span className="demo-store-mark" style={{background:store.accent}}>{store.initials}</span><span className="demo-store-info"><small>{String(index+1).padStart(2,"0")} / {store.category}</small><h2>{store.name}</h2><p>e-commerce-bhs.vercel.app/store/{store.slug}</p></span><span className="demo-arrow">↗</span></Link>)}</section>
    <footer className="demo-footer"><span>© {new Date().getFullYear()} BLUEHAVEN STUDIOS</span><span>CREATIVITY BEYOND LIMITS</span><span>ILLUSTRATIVE DEMO STORES</span></footer>
  </div></main>;
}
