import type { Metadata } from "next";
import { neon } from "@neondatabase/serverless";
import "./sp-clothing.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "SP Clothing Services | Style, Tailored to You",
  description: "Discover considered everyday pieces, occasion wear and custom tailoring from SP Clothing Services.",
};

type Product = { id:string; name:string; description:string|null; price_minor:number|string; image_url:string|null; category:string|null; stock_quantity:number };
const fallbackProducts: Product[] = [
  {id:"sample-1",name:"Classic Two-Piece Set",description:"A relaxed tailored two-piece set for polished everyday dressing.",price_minor:4850000,image_url:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85",category:"Ready to wear",stock_quantity:12},
  {id:"sample-2",name:"Everyday Linen Shirt",description:"A breathable wardrobe staple with an easy, refined silhouette.",price_minor:2250000,image_url:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=85",category:"Tops",stock_quantity:18},
  {id:"sample-3",name:"The Signature Dress",description:"A statement dress designed for special plans and memorable entrances.",price_minor:3950000,image_url:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",category:"Dresses",stock_quantity:8},
  {id:"sample-4",name:"Modern Agbada Set",description:"A contemporary take on a timeless Nigerian occasion look.",price_minor:9500000,image_url:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",category:"Traditional",stock_quantity:6},
  {id:"sample-5",name:"Everyday Co-ord",description:"An effortless matching set made for comfort and confident style.",price_minor:3450000,image_url:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",category:"Ready to wear",stock_quantity:10},
  {id:"sample-6",name:"Tailored Occasion Look",description:"Clean tailoring and thoughtful details for your next occasion.",price_minor:7250000,image_url:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85",category:"Occasion wear",stock_quantity:5},
];
const money = (value:number|string) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(Number(value)/100);

export default async function SPClothingStorefront() {
  let products = fallbackProducts;
  try {
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      const rows = await sql.query("SELECT p.id,p.name,p.description,p.price_minor,p.image_url,p.category,p.stock_quantity FROM public.products p JOIN public.tenants t ON t.id=p.tenant_id WHERE t.slug='sp-clothing-services' AND t.status='active' AND t.deleted_at IS NULL AND p.deleted_at IS NULL AND p.is_published=true ORDER BY p.created_at DESC") as any[];
      if (rows.length) products = rows as Product[];
    }
  } catch (error) { console.error("SP Clothing catalogue unavailable",error); }
  return <main className="sp-store">
    <div className="sp-ribbon">LAGOS, NIGERIA <span>—</span> MADE WITH INTENTION. WORN WITH CONFIDENCE.</div>
    <header className="sp-header">
      <a className="sp-logo" href="/sp-clothing-services"><span className="sp-logo-mark">SP</span><span><b>SP CLOTHING</b><small>SERVICES</small></span></a>
      <nav><a href="#collection">Collection</a><a href="#story">Our approach</a><a href="#services">What we do</a></nav>
      <a className="sp-header-cta" href="mailto:Sampraiserock@gmail.com?subject=SP%20Clothing%20Services%20Enquiry">Get in touch <span></span></a>
    </header>
    <section className="sp-hero">
      <div className="sp-hero-copy">
        <p className="sp-eyebrow"><i/> THE SP EDIT · LAGOS</p>
        <h1>Dress like<br/>you <em>mean it.</em></h1>
        <p className="sp-hero-text">Thoughtful pieces. Confident silhouettes. A little more intention in everything you wear.</p>
        <a className="sp-primary" href="#collection">Explore the collection <span></span></a>
        <div className="sp-hero-foot"><span>01 / 03</span><span>STYLE THAT SPEAKS FOR YOU</span></div>
      </div>
      <div className="sp-hero-image"><div className="sp-image-label">THE NEW<br/><i>POINT OF VIEW</i></div><span className="sp-image-index">SP — 001</span></div>
    </section>
    <section className="sp-intro" id="story">
      <span className="sp-section-index">01 / THE SP APPROACH</span>
      <h2>Good style is not about<br/><em>having more. It is about choosing well.</em></h2>
      <p>SP Clothing Services brings together considered fashion, personal expression and the details that make a look feel like yours. Explore the edit or get in touch about a piece made around you.</p>
    </section>
    <section className="sp-collection" id="collection">
      <div className="sp-section-head"><div><span className="sp-section-index">02 / THE COLLECTION</span><h2>Find your <em>next favourite.</em></h2></div><span className="sp-item-count">{products.length.toString().padStart(2,"0")} PIECES IN THE EDIT</span></div>
      <div className="sp-products">
        {products.map((product,index)=><article className="sp-product" key={product.id}>
          <a className="sp-product-image" href={"mailto:Sampraiserock@gmail.com?subject="+encodeURIComponent("Enquiry: "+product.name)} style={{backgroundImage:"url('"+(product.image_url||fallbackProducts[index%fallbackProducts.length].image_url)+"')"}}>
            <span>{(product.category||"THE SP EDIT").toUpperCase()}</span><i></i>
          </a>
          <div className="sp-product-meta"><h3>{product.name}</h3><b>{money(product.price_minor)}</b></div>
          <p>{product.description||"A considered piece from the SP Clothing Services collection."}</p>
          <a className="sp-product-link" href={"mailto:Sampraiserock@gmail.com?subject="+encodeURIComponent("Enquiry: "+product.name)}>Enquire about this piece <span></span></a>
        </article>)}
      </div>
      <p className="sp-demo-note">SAMPLE STOREFRONT · Product names, prices and imagery are demonstration content and can be replaced by the SP Clothing Services team.</p>
    </section>
    <section className="sp-services" id="services"><div><span className="sp-section-index">03 / HOW WE CAN HELP</span><h2>Made for your<br/><em>kind of style.</em></h2></div><div className="sp-service-list"><article><span>01</span><div><h3>Ready-to-wear</h3><p>Easy-to-style pieces for your everyday rotation.</p></div><b></b></article><article><span>02</span><div><h3>Custom tailoring</h3><p>Personalised looks shaped around your fit and preference.</p></div><b></b></article><article><span>03</span><div><h3>Occasion wear</h3><p>Distinctive looks for the moments worth dressing up for.</p></div><b></b></article></div></section>
    <section className="sp-contact"><span className="sp-section-index">THE NEXT LOOK STARTS HERE</span><h2>Let's make it<br/><em>feel like you.</em></h2><a className="sp-primary" href="mailto:Sampraiserock@gmail.com?subject=SP%20Clothing%20Services%20Enquiry">Start a conversation <span></span></a></section>
    <footer className="sp-footer">
      <div className="sp-footer-main">
        <div className="sp-footer-brand">
          <a className="sp-logo sp-footer-logo" href="/sp-clothing-services"><span className="sp-logo-mark">SP</span><span><b>SP CLOTHING</b><small>SERVICES</small></span></a>
          <p>Thoughtful fashion, considered details and personal style. Discover pieces made to help you feel confidently yourself.</p>
<div className="sp-social-icons" aria-label="Social media platforms"><span aria-label="Instagram" title="Instagram">◎</span><span aria-label="Facebook" title="Facebook">f</span><span aria-label="TikTok" title="TikTok">♪</span><span aria-label="WhatsApp" title="WhatsApp">◔</span></div>
        </div>
        <div className="sp-footer-links">
          <h3>QUICK LINKS</h3>
          <a href="/sp-clothing-services">Home</a>
          <a href="#story">Our approach</a>
          <a href="#collection">Shop the collection</a>
          <a href="#services">Our services</a>
          <a href="mailto:Sampraiserock@gmail.com?subject=Custom%20tailoring%20enquiry">Custom tailoring</a>
          <a href="mailto:Sampraiserock@gmail.com?subject=SP%20Clothing%20Services%20Enquiry">Enquiries</a>
        </div>
        <div className="sp-footer-contact">
          <h3>CONTACT & LOCATION</h3>
          <p className="sp-footer-location">Lagos, Nigeria</p>
          <a href="mailto:Sampraiserock@gmail.com">Sampraiserock@gmail.com</a>
          <p className="sp-footer-hours">For appointments and orders<br/>please get in touch by email.</p>
          <a className="sp-footer-terms" href="mailto:Sampraiserock@gmail.com?subject=Order%20enquiry">Orders & enquiries <span></span></a>
        </div>
      </div>
      <div className="sp-footer-bottom">
        <span>© {new Date().getFullYear()} SP CLOTHING SERVICES. ALL RIGHTS RESERVED.</span>
        <span>MADE WITH INTENTION.</span>
        <a href="/sp-clothing-services/admin">STORE OWNER LOGIN </a>
      </div>
    </footer>
  </main>;
}
