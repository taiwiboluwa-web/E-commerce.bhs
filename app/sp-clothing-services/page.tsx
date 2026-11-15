import type { Metadata } from "next";
import { neon } from "@neondatabase/serverless";
import "./sp-clothing.css";
import SPHeroCarousel from "./SPHeroCarousel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "SP Clothing Services | Style, Tailored to You",
  description: "Discover considered everyday pieces, occasion wear and custom tailoring from SP Clothing Services.",
};

type Product = { id:string; name:string; description:string|null; price_minor:number|string; sale_price_minor:number|string|null; sale_starts_at:string|null; sale_ends_at:string|null; sale_label:string|null; image_url:string|null; category:string|null; stock_quantity:number };
type StoreContent = Record<string,string>;
const defaultContent:StoreContent = {
 ribbon_message:"MADE WITH INTENTION. WORN WITH CONFIDENCE.",hero_eyebrow:"{content.hero_eyebrow}",hero_cta_label:"Explore the collection",
 collection_title:"Find your",collection_emphasis:"next favourite.",services_title:"Made for your",services_emphasis:"kind of style.",
 contact_kicker:"THE NEXT LOOK STARTS HERE",contact_title:"Let's make it",contact_emphasis:"feel like you.",contact_cta_label:"Start a conversation",
 footer_description:"Thoughtful fashion, considered details and personal style. Discover pieces made to help you feel confidently yourself.",footer_location:"Lagos, Nigeria",footer_hours:"For appointments and orders\nplease get in touch by email.",footer_tagline:"MADE WITH INTENTION.",
 hero_title:"Dress like",hero_emphasis:"you mean it.",hero_description:"Thoughtful pieces. Confident silhouettes. A little more intention in everything you wear.",
 story_title:"Good style is not about",story_emphasis:"having more. It is about choosing well.",story_body:"SP Clothing Services brings together considered fashion, personal expression and the details that make a look feel like yours. Explore the edit or get in touch about a piece made around you.",
 service_1_title:"Ready-to-wear",service_1_body:"Easy-to-style pieces for your everyday rotation.",service_2_title:"Custom tailoring",service_2_body:"Personalised looks shaped around your fit and preference.",service_3_title:"Occasion wear",service_3_body:"Distinctive looks for the moments worth dressing up for.",contact_email:"Sampraiserock@gmail.com"
};
const fallbackProducts: Product[] = [
  {id:"sample-1",name:"Classic Two-Piece Set",description:"A relaxed tailored two-piece set for polished everyday dressing.",price_minor:4850000,sale_price_minor:null,sale_starts_at:null,sale_ends_at:null,sale_label:null,image_url:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85",category:"Ready to wear",stock_quantity:12},
  {id:"sample-2",name:"Everyday Linen Shirt",description:"A breathable wardrobe staple with an easy, refined silhouette.",price_minor:2250000,sale_price_minor:null,sale_starts_at:null,sale_ends_at:null,sale_label:null,image_url:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=85",category:"Tops",stock_quantity:18},
  {id:"sample-3",name:"The Signature Dress",description:"A statement dress designed for special plans and memorable entrances.",price_minor:3950000,sale_price_minor:null,sale_starts_at:null,sale_ends_at:null,sale_label:null,image_url:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",category:"Dresses",stock_quantity:8},
  {id:"sample-4",name:"Modern Agbada Set",description:"A contemporary take on a timeless Nigerian occasion look.",price_minor:9500000,sale_price_minor:null,sale_starts_at:null,sale_ends_at:null,sale_label:null,image_url:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",category:"Traditional",stock_quantity:6},
  {id:"sample-5",name:"Everyday Co-ord",description:"An effortless matching set made for comfort and confident style.",price_minor:3450000,sale_price_minor:null,sale_starts_at:null,sale_ends_at:null,sale_label:null,image_url:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",category:"Ready to wear",stock_quantity:10},
  {id:"sample-6",name:"Tailored Occasion Look",description:"Clean tailoring and thoughtful details for your next occasion.",price_minor:7250000,sale_price_minor:null,sale_starts_at:null,sale_ends_at:null,sale_label:null,image_url:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85",category:"Occasion wear",stock_quantity:5},
];
const money = (value:number|string) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(Number(value)/100);

export default async function SPClothingStorefront() {
  let products = fallbackProducts;
  let content = defaultContent;
  try {
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      const rows = await sql.query("SELECT p.id,p.name,p.description,p.price_minor,p.sale_price_minor,p.sale_starts_at,p.sale_ends_at,p.sale_label,p.image_url,p.category,p.stock_quantity FROM public.products p JOIN public.tenants t ON t.id=p.tenant_id WHERE t.slug='sp-clothing-services' AND t.status='active' AND t.deleted_at IS NULL AND p.deleted_at IS NULL AND p.is_published=true ORDER BY p.created_at DESC") as any[];
      if (rows.length) products = rows as Product[];
      const settings = await sql.query("SELECT s.content FROM public.storefront_settings s JOIN public.tenants t ON t.id=s.tenant_id WHERE t.slug='sp-clothing-services' AND t.deleted_at IS NULL LIMIT 1") as any[];
      if (settings[0]?.content) content = {...defaultContent,...settings[0].content};
    }
  } catch (error) { console.error("SP Clothing catalogue unavailable",error); }
  return <main className="sp-store">
    <div className="sp-ribbon">LAGOS, NIGERIA <span>—</span> {content.ribbon_message}</div>
    <header className="sp-header">
      <a className="sp-logo" href="/sp-clothing-services"><span className="sp-logo-mark">SP</span><span><b>SP CLOTHING</b><small>SERVICES</small></span></a>
      <nav><a href="#collection">Collection</a><a href="#story">Our approach</a><a href="#services">What we do</a></nav>
      <a className="sp-header-cta" href={`mailto:${content.contact_email}?subject=SP%20Clothing%20Services%20Enquiry`}>Get in touch <span></span></a>
    </header>
    <section className="sp-hero">
      <div className="sp-hero-copy">
        <p className="sp-eyebrow"><i/> THE SP EDIT · LAGOS</p>
        <h1>{content.hero_title}<br/><em>{content.hero_emphasis}</em></h1>
        <p className="sp-hero-text">{content.hero_description}</p>
        <a className="sp-primary" href="#collection">{content.hero_cta_label} <span></span></a>
        <div className="sp-hero-foot"><span>01 / 03</span><span>STYLE THAT SPEAKS FOR YOU</span></div>
      </div>
      <SPHeroCarousel images={products.filter((product) => product.image_url && /^https:\/\//i.test(product.image_url)).map((product) => ({ id: product.id, name: product.name, image_url: product.image_url as string }))} />
    </section>
    <section className="sp-intro" id="story">
      <span className="sp-section-index">01 / THE SP APPROACH</span>
      <h2>{content.story_title}<br/><em>{content.story_emphasis}</em></h2>
      <p>{content.story_body}</p>
    </section>
    <section className="sp-collection" id="collection">
      <div className="sp-section-head"><div><span className="sp-section-index">02 / THE COLLECTION</span><h2>{content.collection_title} <em>{content.collection_emphasis}</em></h2></div><span className="sp-item-count">{products.length.toString().padStart(2,"0")} PIECES IN THE EDIT</span></div>
      <div className="sp-products">
        {products.map((product,index)=><article className="sp-product" key={product.id}>
          <a className="sp-product-image" href={`mailto:${content.contact_email}?subject=${encodeURIComponent("Enquiry: "+product.name)}`} style={{backgroundImage:"url('"+(product.image_url||fallbackProducts[index%fallbackProducts.length].image_url)+"')"}}>
            <span>{(product.category||"THE SP EDIT").toUpperCase()}</span><i></i>
          </a>
          <div className="sp-product-meta"><h3>{product.name}</h3><b>{product.sale_price_minor !== null && product.sale_price_minor !== undefined && Number(product.sale_price_minor) < Number(product.price_minor) && (!product.sale_starts_at || new Date(product.sale_starts_at) <= new Date()) && (!product.sale_ends_at || new Date(product.sale_ends_at) >= new Date()) ? <><span className="sp-sale-price">{money(product.sale_price_minor)}</span><del>{money(product.price_minor)}</del></> : money(product.price_minor)}</b></div>
          <p>{product.description||"A considered piece from the SP Clothing Services collection."}</p>
          <a className="sp-product-link" href={`mailto:${content.contact_email}?subject=${encodeURIComponent("Enquiry: "+product.name)}`}>Enquire about this piece <span></span></a>
        </article>)}
      </div>
      <p className="sp-demo-note">SAMPLE STOREFRONT · Product names, prices and imagery are demonstration content and can be replaced by the SP Clothing Services team.</p>
    </section>
    <section className="sp-services" id="services"><div><span className="sp-section-index">03 / HOW WE CAN HELP</span><h2>{content.services_title}<br/><em>{content.services_emphasis}</em></h2></div><div className="sp-service-list"><article><span>01</span><div><h3>{content.service_1_title}</h3><p>{content.service_1_body}</p></div><b></b></article><article><span>02</span><div><h3>{content.service_2_title}</h3><p>{content.service_2_body}</p></div><b></b></article><article><span>03</span><div><h3>{content.service_3_title}</h3><p>{content.service_3_body}</p></div><b></b></article></div></section>
    <section className="sp-contact"><span className="sp-section-index">{content.contact_kicker}</span><h2>{content.contact_title}<br/><em>{content.contact_emphasis}</em></h2><a className="sp-primary" href={`mailto:${content.contact_email}?subject=SP%20Clothing%20Services%20Enquiry`}>{content.contact_cta_label} <span></span></a></section>
    <footer className="sp-footer">
      <div className="sp-footer-main">
        <div className="sp-footer-brand">
          <a className="sp-logo sp-footer-logo" href="/sp-clothing-services"><span className="sp-logo-mark">SP</span><span><b>SP CLOTHING</b><small>SERVICES</small></span></a>
          <p>{content.footer_description}</p>
<div className="sp-social-icons" aria-label="Social media platforms">
            <a href={content.instagram_url || undefined} aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" className="sp-icon-fill"/></svg></a>
            <a href={content.facebook_url || undefined} aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4C17.2 1.2 16.1 1 15 1c-3.3 0-5 2-5 5.4V9H7v4h3v8z"/></svg></a>
            <a href={content.tiktok_url || undefined} aria-label="TikTok" title="TikTok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3c.4 2.5 1.8 4 4 4.2v3.2a8 8 0 0 1-4-1.3v6.1a6.2 6.2 0 1 1-6.2-6.2c.4 0 .8 0 1.2.1v3.3a3 3 0 1 0 1.8 2.8V3z"/></svg></a>
            <a href={content.whatsapp_url || undefined} aria-label="WhatsApp" title="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z"/><path d="M9 8.5c.3-.5.6-.5.9-.5l.7 1.7-.7.9c.6 1.2 1.5 2.1 2.8 2.7l.8-.8 1.8.8c.2.1.3.5.1.9-.3.7-1.2 1.2-2 1.1-2.5-.4-5.8-3.3-6.1-5.8-.1-.4.6-.9 1.7-1Z"/></svg></a>
          </div>
        </div>
        <div className="sp-footer-links">
          <h3>QUICK LINKS</h3>
          <a href="/sp-clothing-services">Home</a>
          <a href="#story">Our approach</a>
          <a href="#collection">Shop the collection</a>
          <a href="#services">Our services</a>
          <a href={`mailto:${content.contact_email}?subject=Custom%20tailoring%20enquiry`}>Custom tailoring</a>
          <a href={`mailto:${content.contact_email}?subject=SP%20Clothing%20Services%20Enquiry`}>Enquiries</a>
        </div>
        <div className="sp-footer-contact">
          <h3>CONTACT & LOCATION</h3>
          <p className="sp-footer-location">{content.footer_location}</p>
          <a href={`mailto:${content.contact_email}`}>{content.contact_email}</a>
          <p className="sp-footer-hours">{content.footer_hours.split("\\n").map((line,i)=><span key={i}>{i>0&&<br/>}{line}</span>)}</p>
          <a className="sp-footer-terms" href={`mailto:${content.contact_email}?subject=Order%20enquiry`}>Orders & enquiries <span></span></a>
        </div>
      </div>
      <div className="sp-footer-bottom">
        <span>© {new Date().getFullYear()} SP CLOTHING SERVICES. ALL RIGHTS RESERVED.</span>
        <span>{content.footer_tagline}</span>
        <a href="/sp-clothing-services/admin">STORE OWNER LOGIN </a>
      </div>
    </footer>
  </main>;
}
