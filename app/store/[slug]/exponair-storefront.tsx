"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Menu, X, Instagram, Facebook, Youtube, Music2, MessageCircle, Sparkles, Palette, CalendarCheck2, HeartHandshake } from "lucide-react";
import "./exponair.css";

const WHATSAPP = "2348023387671";
const phoneDisplay = "+234 802 338 7671";
const packages = [
  { name: "Little Moments", note: "Beautifully simple", detail: "For intimate celebrations and thoughtful first birthdays.", items: ["Planning consultation", "Event timeline", "On-the-day coordination"] },
  { name: "Big Smiles", note: "The signature experience", detail: "For themed birthdays with personalised styling and activities.", items: ["Everything in Little Moments", "Theme and décor direction", "Games and activity schedule", "Vendor coordination"], featured: true },
  { name: "The Grand Celebration", note: "A full-service affair", detail: "For larger celebrations with a complete creative and coordination team.", items: ["Full event planning support", "Bespoke styling direction", "Entertainment and rental coordination", "Event-day management"] },
];
const serviceGroups = [
  { id:"kiddies", number:"01", title:"Kiddies' parties", eyebrow:"A LITTLE MAGIC, A LOT OF JOY", text:"Thoughtfully imagined celebrations for children aged 1–10. From first birthdays to big milestone parties, we bring their favourite worlds to life.", tags:["Themed birthdays","Customised décor","Games & entertainment","Treat tables","Party coordination"], image:"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85" },
  { id:"adult", number:"02", title:"Adult celebrations", eyebrow:"YOUR MOMENT, BEAUTIFULLY DONE", text:"Birthdays, anniversaries, bridal showers and intimate gatherings with considered styling, seamless coordination and a personal touch.", tags:["Milestone birthdays","Anniversaries","Bridal showers","Private dinners","Surprise celebrations"], image:"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85" },
  { id:"weddings", number:"03", title:"Weddings & special occasions", eyebrow:"THE DETAILS THAT MAKE IT YOURS", text:"Beautifully coordinated moments for engagements, proposals, weddings and the celebrations surrounding them.", tags:["Engagements","Proposal setups","Wedding styling","Romantic surprises","Special occasions"], image:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85" },
  { id:"corporate", number:"04", title:"Corporate events", eyebrow:"BRING PEOPLE TOGETHER", text:"Creative event experiences for organisations, schools and teams—planned with purpose and delivered with care.", tags:["Company celebrations","School events","Family fun days","Brand experiences","Event management"], image:"https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85" },
  { id:"rentals", number:"05", title:"Event rentals & styling", eyebrow:"THE FINISHING TOUCHES", text:"A considered selection of event essentials and styling support to help every venue feel ready for the occasion.", tags:["Children's tables & chairs","Party furniture","Décor elements","Event essentials","Setup coordination"], image:"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85" },
];
const faqs = [
  ["What areas do you serve?", "Exponair is based in Lagos and currently serves Lagos. Share your venue or preferred location so the team can confirm logistics."],
  ["How do I get a price?", "Every event is quoted around its date, venue, guest count, theme, selected services and budget. Send an enquiry and the team will prepare a tailored quotation."],
  ["What secures my booking?", "A 70% deposit of the agreed quotation is required to secure a booking. Your date is not confirmed until availability has been checked and the deposit has been received."],
  ["When is the balance due?", "The remaining 30% balance is due in full at least 24 hours before the scheduled event."],
  ["Can I change my event date or theme?", "Please communicate changes as early as possible. Changes are subject to availability and may affect the quotation or attract additional charges."],
  ["Do you offer rentals without full planning?", "Yes. Tell us which rental items or styling support you need and the team will confirm availability and a tailored quote."],
];
const weekdays = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const formatDate = (d: Date) => d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

function ExponairFlowerMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 120 128" role="img" aria-label="Exponair flower emblem">
    <path className="expo-petal expo-petal-one" d="M61 66 C31 37 40 12 58 3 C79 26 77 47 61 66Z" fill="#f4c400"/>
    <path className="expo-petal expo-petal-two" d="M64 66 C73 35 91 23 116 23 C108 48 88 62 64 66Z" fill="#f4c400"/>
    <path className="expo-leaf" d="M59 84 C36 57 17 57 3 61 C17 83 38 91 59 84Z" fill="#0b9d57"/>
    <path className="expo-leaf-vein" d="M12 65 C30 70 43 77 57 84" fill="none" stroke="#fff" strokeWidth="2"/>
    <path className="expo-flourish" d="M65 82 C82 108 111 108 117 89 C121 76 107 72 104 81" fill="none" stroke="#d52d2d" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="103" cy="81" r="4" fill="#d52d2d"/>
  </svg>;
}

function ExponairWordmark({ compact = false }: { compact?: boolean }) {
  return <span className={compact ? "expo-wordmark expo-wordmark-compact" : "expo-wordmark"}>
    <ExponairFlowerMark className="expo-flower-mark"/>
    <span className="expo-wordmark-copy"><strong>Exponair</strong><small>EVENTS MANAGEMENT LTD</small><em>Passionately bringing your events alive</em></span>
  </span>;
}

export default function ExponairStorefront() {
  const [menuOpen,setMenuOpen]=useState(false);
  const [showBrandReveal,setShowBrandReveal]=useState(false);
  const [reviews,setReviews]=useState<Array<{id:string;customer_name:string;event_type:string;rating:number;review_text:string;created_at:string}>>([]);
  const [reviewSummary,setReviewSummary]=useState({count:0,average:0});
  const [reviewForm,setReviewForm]=useState({name:"",eventType:"Kiddies' birthday party",rating:5,review:""});
  const [reviewStatus,setReviewStatus]=useState("");
  const [reviewBusy,setReviewBusy]=useState(false);
  useEffect(()=>{let active=true;fetch("/api/exponair-reviews").then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(active){setReviews(data.reviews||[]);setReviewSummary(data.summary||{count:0,average:0});}}).catch(()=>{});return()=>{active=false;};},[]);
  const submitReview=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setReviewBusy(true);setReviewStatus("");try{const response=await fetch("/api/exponair-reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(reviewForm)});const data=await response.json();if(!response.ok)throw new Error(data.error||"Unable to submit your review.");setReviewStatus(data.message||"Thank you. Your review has been received for approval.");setReviewForm({name:"",eventType:"Kiddies' birthday party",rating:5,review:""});}catch(error){setReviewStatus(error instanceof Error?error.message:"Unable to submit your review. Please try again.");}finally{setReviewBusy(false);}};

  useEffect(()=>{
    const root=document.querySelector(".exponair");
    if(!root || !("IntersectionObserver" in window)) return;
    const targets=Array.from(root.querySelectorAll<HTMLElement>(
      "section h1, section h2, section h3, section p:not(.expo-review-privacy):not(.expo-review-status)"
    ));
    const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reducedMotion) return;

    targets.forEach(el=>{
      if(el.dataset.expoTyped==="true") return;
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{
        acceptNode(node){
          const parent=node.parentElement;
          if(!parent || !node.textContent?.length) return NodeFilter.FILTER_REJECT;
          if(parent.closest("script,style,svg,button,[data-no-type],.expo-review-stars")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes:Text[]=[];
      while(walker.nextNode()) nodes.push(walker.currentNode as Text);
      let index=0;
      nodes.forEach(node=>{
        const value=node.textContent||"";
        if(!value) return;
        const fragment=document.createDocumentFragment();
        const pieces=value.match(/\s+|[^\s]+/gu)||[];
        for(const piece of pieces){
          if(/^\s+$/u.test(piece)){
            fragment.appendChild(document.createTextNode(piece));
            continue;
          }
          const word=document.createElement("span");
          word.className="expo-type-word";
          word.setAttribute("aria-hidden","true");
          for(const character of piece){
            const span=document.createElement("span");
            span.className="expo-type-char";
            span.style.setProperty("--expo-char-index",String(index++));
            span.textContent=character;
            word.appendChild(span);
          }
          fragment.appendChild(word);
        }
        node.parentNode?.replaceChild(fragment,node);
      });
      el.dataset.expoTyped="true";
      el.setAttribute("aria-label",el.textContent||"");
      el.classList.add("expo-type-target");
    });

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const el=entry.target as HTMLElement;
        el.classList.add("expo-type-playing");
        observer.unobserve(el);
      });
    },{threshold:0.12,rootMargin:"0px 0px -5% 0px"});
    targets.forEach(el=>{if(el.dataset.expoTyped==="true") observer.observe(el);});
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const dismissedKey="exponair-brand-reveal-dismissed-v2";
    if(window.sessionStorage.getItem(dismissedKey)) return;
    setShowBrandReveal(true);
    const timer=window.setTimeout(()=>setShowBrandReveal(false),4200);
    return ()=>window.clearTimeout(timer);
  },[]);
  const [activeFaq,setActiveFaq]=useState<number|null>(0);
  const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
  const [selectedDate,setSelectedDate]=useState("");
  const [form,setForm]=useState({name:"",phone:"",email:"",event:"Kiddies birthday party",guests:"",location:"",budget:"",package:"Big Smiles",details:""});
  const closeMenu=()=>setMenuOpen(false);
  const today=new Date();today.setHours(0,0,0,0);
  const calendarCells=useMemo(()=>{const first=new Date(month.getFullYear(),month.getMonth(),1).getDay();const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();return [...Array(first).fill(null),...Array.from({length:count},(_,i)=>i+1)];},[month]);
  const chosenDate=selectedDate?formatDate(new Date(selectedDate+"T12:00:00")):"";
  const sendInquiry=()=>{
    const message=[
      "Hello Exponair Events Management Limited, I'd like to request an event quotation.",
      "Name: "+form.name,"Phone: "+form.phone,"Email: "+(form.email||"Not provided"),
      "Event type: "+form.event,"Preferred date: "+(chosenDate||"To be discussed"),
      "Package: "+form.package,"Expected guests: "+(form.guests||"To be discussed"),
      "Venue / area: "+(form.location||"To be discussed"),"Budget: "+(form.budget||"Please advise"),
      "Event brief: "+(form.details||"Please contact me to discuss."),
      "I understand that a booking is confirmed only after availability is checked and the 70% deposit is received."
    ].join("\n");
    window.open("https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(message),"_blank","noopener,noreferrer");
  };
  const nav=[["Our story","#about"],["Kiddies' parties","#kiddies"],["Celebrations","#adult"],["Weddings","#weddings"],["Corporate","#corporate"],["Rentals","#rentals"],["Packages","#packages"],["Reviews","#reviews"],["Journal","#journal"]];
  return (
    <main className="exponair">
      {showBrandReveal&&<div className="expo-brand-reveal" role="status" aria-label="Exponair Events logo animation">
        <div className="expo-reveal-lockup">
          <ExponairFlowerMark className="expo-reveal-flower"/>
          <div className="expo-reveal-word">Exponair</div>
          <div className="expo-reveal-rule"/>
          <div className="expo-reveal-subtitle">EVENTS MANAGEMENT LTD</div>
          <div className="expo-reveal-tagline">Passionately bringing your events alive</div>
        </div>
        <button type="button" className="expo-reveal-skip" onClick={()=>{window.sessionStorage.setItem("exponair-brand-reveal-dismissed-v2","1");setShowBrandReveal(false);}}>Skip intro</button>
      </div>}
      <div className="expo-grain" aria-hidden="true"/>
      <div className="expo-announcement">LAGOS, NIGERIA <span>·</span> THOUGHTFULLY PLANNED. BEAUTIFULLY CELEBRATED.</div>
      <header className="expo-header" id="top">
        <a className="expo-brand expo-brand-logo" href="#top" aria-label="Exponair home"><ExponairWordmark compact/></a>
        <nav className={menuOpen?"expo-nav is-open":"expo-nav"} aria-label="Main navigation">{nav.map(([label,href])=><a key={href} href={href} onClick={closeMenu}>{label}</a>)}</nav>
        <a className="expo-header-cta" href="#booking">Plan your event </a>
        <button className="expo-menu-toggle" onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?"Close menu":"Open menu"}>{menuOpen?<X/>:<Menu/>}</button>
      </header>

      <section className="expo-hero">
        <div className="expo-hero-copy">
          <div className="expo-eyebrow"><span/> THE ART OF A GOOD CELEBRATION</div>
          <h1 className="expo-kinetic-title"><span className="expo-title-line">Passionately</span><span className="expo-title-line"><em>bringing events</em></span><span className="expo-title-line">to life<span className="expo-period">.</span></span></h1>
          <p className="expo-hero-lede">From wonder-filled kiddies' parties to elegant celebrations and corporate experiences, Exponair turns your ideas into moments worth remembering.</p>
          <div className="expo-hero-actions"><a className="expo-button expo-button-dark" href="#booking">Let's plan something </a><a className="expo-text-link" href="#services">Discover our world</a></div>
          <div className="expo-hero-foot"><span>IMAGINE</span><i/><span>CREATE</span><i/><span>CELEBRATE</span></div>
        </div>
        <div className="expo-hero-visual"><div className="expo-image-frame"><div className="expo-hero-image" role="img" aria-label="An artfully styled celebration with colourful event décor"/><div className="expo-image-caption"><span>MADE FOR YOUR MOMENT</span><span>LAGOS · NIGERIA</span></div></div><div className="expo-stamp"><span>PLAY</span><b>·</b><span>STYLE</span><b>·</b><span>CELEBRATE</span></div><div className="expo-hero-number">E / 01</div><div className="expo-hero-orbit">THE DETAILS<br/>MAKE THE DAY</div></div>
        <div className="expo-scroll-note"><span/> SCROLL TO EXPLORE</div>
      </section>

      <section className="expo-intro" id="about"><div className="expo-section-label"><span>01</span> THE EXPONAIR STORY</div><div className="expo-intro-content"><h2>Every occasion has a feeling.<br/><em>We make it unforgettable.</em></h2><div className="expo-intro-bottom"><p>Exponair Events Management Limited is a Lagos-based event planning, decoration, styling and rental company. We bring creative ideas, thoughtful details and professional coordination together to create celebrations that feel personal, beautiful and effortless for the people enjoying them.</p><a href="#booking" className="expo-circle-link">Meet your event partner </a></div></div></section>

      <section className="expo-experience" aria-label="The Exponair experience">
        <div className="expo-experience-heading"><span>THE EXPONAIR TOUCH</span><h2>More than a beautiful setup.<br/><em>A beautifully considered day.</em></h2></div>
        <div className="expo-experience-grid">
          <article><span className="expo-experience-icon"><Sparkles size={22} strokeWidth={1.5}/></span><div><h3>Ideas with imagination</h3><p>Creative themes and thoughtful details shaped around the people you're celebrating.</p></div></article>
          <article><span className="expo-experience-icon"><Palette size={22} strokeWidth={1.5}/></span><div><h3>Styling with intention</h3><p>Colour, décor and finishing touches brought together as one cohesive experience.</p></div></article>
          <article><span className="expo-experience-icon"><CalendarCheck2 size={22} strokeWidth={1.5}/></span><div><h3>Planning with purpose</h3><p>Clear conversations, organised timelines and coordination from first brief to event day.</p></div></article>
          <article><span className="expo-experience-icon"><HeartHandshake size={22} strokeWidth={1.5}/></span><div><h3>A personal partnership</h3><p>A team that listens, understands your priorities and works within your agreed brief.</p></div></article>
        </div>
      </section>

      <section className="expo-services" id="services"><div className="expo-section-head"><div><div className="expo-section-label"><span>02</span> WHAT WE BRING TO LIFE</div><h2>One creative team.<br/><em>Many ways to celebrate.</em></h2></div><p>Whether you are planning a little one's big day or an occasion for the grown-ups, we shape the experience around your people, your purpose and your vision.</p></div>
        <div className="expo-service-feature-grid">{serviceGroups.map((s)=><article className="expo-service-feature" id={s.id} key={s.id}><div className="expo-feature-image" style={{backgroundImage:"url('"+s.image+"')"}}/><div className="expo-feature-content"><span className="expo-feature-index">{s.number} / {s.eyebrow}</span><h3>{s.title}</h3><p>{s.text}</p><div className="expo-tags">{s.tags.map(t=><span key={t}>{t}</span>)}</div><a href="#booking">Enquire about this service </a></div></article>)}</div>
      </section>

      <section className="expo-packages" id="packages"><div className="expo-section-head"><div><div className="expo-section-label"><span>03</span> PACKAGES & PRICING</div><h2>Your vision.<br/><em>Your kind of magic.</em></h2></div><p>Our packages are a starting point, not a box. We tailor every quotation to the details of your event, your guest count and your budget.</p></div>
        <div className="expo-package-grid">{packages.map(p=><article className={p.featured?"expo-package featured":"expo-package"} key={p.name}><span className="expo-package-note">{p.note}</span><h3>{p.name}</h3><p>{p.detail}</p><div className="expo-package-price">Custom quotation</div><span className="expo-package-includes">A FEW THINGS INCLUDED</span><ul>{p.items.map(item=><li key={item}><Check size={14}/>{item}</li>)}</ul><a href="#booking" onClick={()=>setForm({...form,package:p.name})}>Enquire about this package </a></article>)}</div>
        <p className="expo-pricing-note">Pricing varies by event scope, location, guest count and selected services. No package price is assumed or published without Exponair's approval.</p>
      </section>

      <section className="expo-gallery" id="gallery"><div className="expo-gallery-head"><div><div className="expo-section-label"><span>04</span> THE ART OF THE EXPERIENCE</div><h2>Little details.<br/><em>Lasting impressions.</em></h2></div><p>Every colour, table setting and finishing touch should feel like it belongs to your story.</p></div><div className="expo-gallery-grid"><article className="expo-moment moment-tall"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=85')"}}/><div className="expo-moment-meta"><span>01 / KIDDIES' CELEBRATIONS</span><h3>A world of wonder<br/>for little guests.</h3></div></article><article className="expo-moment moment-wide"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=85')"}}/><div className="expo-moment-meta"><span>02 / SOCIAL OCCASIONS</span><h3>Make the moment<br/>feel like yours.</h3></div></article><article className="expo-moment moment-small"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85')"}}/><div className="expo-moment-meta"><span>03 / CORPORATE EXPERIENCES</span><h3>Bring everyone<br/>together.</h3></div></article></div><p className="expo-gallery-note">Visual inspiration only. Exponair's own event photography will replace these images before the final public launch.</p></section>

      <section className="expo-quote"><span className="expo-quote-mark">“</span><blockquote className="expo-kinetic-quote"><span>Passionately bringing events</span><em>to life.</em></blockquote><span className="expo-quote-rule"/><span className="expo-quote-caption">THE EXPONAIR PROMISE</span></section>

      <section className="expo-faq" id="journal"><div><div className="expo-section-label"><span>05</span> NOTES BEFORE THE BIG DAY</div><h2>Good to know.<br/><em>Good to plan.</em></h2><p>Helpful answers about our services, event enquiries and booking process.</p><div className="expo-journal-card"><span>THE EXPONAIR JOURNAL · COMING SOON</span><h3>Ideas, inspiration and little details for your next celebration.</h3><a href="#booking">Ask us for ideas </a></div></div><div className="expo-faq-list">{faqs.map(([q,a],i)=><article className={activeFaq===i?"expo-faq-item active":"expo-faq-item"} key={q}><button onClick={()=>setActiveFaq(activeFaq===i?null:i)}><span>0{i+1}</span><b>{q}</b><i>{activeFaq===i?"−":"+"}</i></button>{activeFaq===i&&<p>{a}</p>}</article>)}</div></section>

      <section className="expo-booking" id="booking"><div className="expo-contact-copy"><div className="expo-section-label"><span>06</span> LET'S START WITH YOUR IDEA</div><h2>Tell us what<br/>you're <em>imagining.</em></h2><p>Share a few details about your event. We'll take it from there with a conversation, availability check and a tailored quotation.</p><div className="expo-contact-note"><span>WhatsApp: {phoneDisplay}</span><span>Mon – Sat · 9 am – 5 pm</span></div><a className="expo-email-link" href="mailto:helenojukotola@gmail.com">helenojukotola@gmail.com</a></div>
        <div className="expo-booking-panel"><div className="expo-calendar"><div className="expo-calendar-head"><div><span>YOUR PREFERRED EVENT DATE</span><strong>{monthNames[month.getMonth()]} {month.getFullYear()}</strong></div><div className="expo-calendar-controls"><button type="button" disabled={month.getFullYear()===today.getFullYear()&&month.getMonth()===today.getMonth()} onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>Prev</button><button type="button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>Next</button></div></div><div className="expo-calendar-grid">{weekdays.map(d=><span className="expo-calendar-weekday" key={d}>{d}</span>)}{calendarCells.map((day,i)=>{if(!day)return <span key={"blank-"+i}/>;const date=new Date(month.getFullYear(),month.getMonth(),day);const iso=[date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(day).padStart(2,"0")].join("-");const past=date<today;return <button type="button" key={iso} className={(selectedDate===iso?"selected ":"")+(past?"past":"")} disabled={past} onClick={()=>setSelectedDate(iso)} aria-pressed={selectedDate===iso}>{day}</button>;})}</div><p className="expo-calendar-note">Choose a preferred date. This is an enquiry only, not a live availability confirmation or a secured booking.</p><p className="expo-calendar-selected">{chosenDate?<>Preferred date: <strong>{chosenDate}</strong></>:"No date selected yet."}</p></div>
          <form className="expo-form" onSubmit={e=>{e.preventDefault();sendInquiry();}}><div className="expo-form-top"><span>YOUR EVENT BRIEF</span><span>* REQUIRED</span></div>
            <label>Your full name *<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Name of contact person"/></label>
            <div className="expo-form-row"><label>Phone / WhatsApp *<input required type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Your phone number"/></label><label>Email address<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label></div>
            <label>What are we celebrating? *<select required value={form.event} onChange={e=>setForm({...form,event:e.target.value})}><option>Kiddies birthday party</option><option>Children's themed party</option><option>Adult birthday or anniversary</option><option>Wedding / engagement / proposal</option><option>Corporate or school event</option><option>Event rentals and styling</option><option>Other special occasion</option></select></label>
            <div className="expo-form-row"><label>Package of interest<select value={form.package} onChange={e=>setForm({...form,package:e.target.value})}>{packages.map(p=><option key={p.name}>{p.name}</option>)}<option>Custom event brief</option></select></label><label>Estimated guests<input value={form.guests} onChange={e=>setForm({...form,guests:e.target.value})} placeholder="e.g. 40"/></label></div>
            <div className="expo-form-row"><label>Venue / Lagos area<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Venue or neighbourhood"/></label><label>Budget range<input value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="Your estimated budget"/></label></div>
            <label>Tell us about the event<textarea rows={4} value={form.details} onChange={e=>setForm({...form,details:e.target.value})} placeholder="Theme, age group, event style, rentals, entertainment, ideas and anything else we should know..."/></label>
            <button className="expo-button expo-button-dark expo-submit" type="submit">Send your event enquiry </button><p className="expo-form-disclaimer">This opens WhatsApp with your details for you to review and send. Exponair will confirm availability and send a quotation. No payment is collected on this page.</p>
          </form>
        </div>
      </section>

      <section className="expo-terms" id="terms"><div className="expo-section-label"><span>07</span> BOOKING & PAYMENT POLICY</div><div className="expo-terms-head"><h2>Clear terms.<br/><em>Confident planning.</em></h2><p>Please review the booking terms before confirming an event with Exponair Events Management Limited.</p></div><div className="expo-terms-grid">
        <article><span>01 / SECURING YOUR DATE</span><h3>70% booking deposit</h3><p>A deposit of 70% of the total agreed quotation is required to secure a booking. Bookings remain unconfirmed until availability has been checked and the deposit has been received.</p></article>
        <article><span>02 / FINAL BALANCE</span><h3>30% before event day</h3><p>The outstanding 30% balance must be paid in full at least 24 hours before the scheduled event. Exponair may withhold service delivery if agreed payment terms have not been met.</p></article>
        <article><span>03 / CANCELLATIONS</span><h3>Confirmed payments</h3><p>Payments made towards confirmed bookings are non-refundable. Cancellation or postponement requests must be communicated formally. Any approved rescheduling is subject to availability and may attract additional charges.</p></article>
        <article><span>04 / CHANGES & AGREEMENT</span><h3>Keep us in the loop</h3><p>Changes to dates, venues, themes or agreed services should be communicated in advance. Changes affecting the original quotation may attract extra charges. Payment of the booking deposit constitutes acceptance of these terms.</p></article>
      </div></section>

      <section className="expo-contact-strip"><div><span>HAVE A DATE IN MIND?</span><h2>Let's make it a moment.</h2></div><a href="#booking">Start your enquiry </a></section>

      <section className="expo-reviews" id="reviews">
        <div className="expo-reviews-heading">
          <div><div className="expo-section-label"><span>08</span> KIND WORDS, REAL EXPERIENCES</div><h2>Celebrations worth<br/><em>talking about.</em></h2><p>Have you celebrated with Exponair? Tell us how it went. Your feedback helps other clients plan with confidence.</p></div>
          <div className="expo-reviews-score"><strong>{reviewSummary.count?reviewSummary.average.toFixed(1):"—"}</strong><div className="expo-review-stars" aria-label={reviewSummary.count?reviewSummary.average+" out of 5 stars":"No ratings yet"}>{[1,2,3,4,5].map(n=><span key={n}>{n<=Math.round(reviewSummary.average)?"★":"☆"}</span>)}</div><span>{reviewSummary.count?reviewSummary.count+" APPROVED REVIEWS":"BE THE FIRST TO REVIEW"}</span></div>
        </div>
        <div className="expo-reviews-layout">
          <div className="expo-review-list">
            {reviews.length?reviews.slice(0,3).map(review=><article className="expo-review-card" key={review.id}><div className="expo-review-card-top"><span className="expo-review-stars">{"★".repeat(review.rating)}<span>{"☆".repeat(5-review.rating)}</span></span><span>{new Date(review.created_at).toLocaleDateString("en-GB",{month:"short",year:"numeric"})}</span></div><p>“{review.review_text}”</p><div className="expo-review-author"><strong>{review.customer_name}</strong><span>{review.event_type}</span></div></article>):<div className="expo-reviews-empty"><span>THE FIRST CHAPTER</span><h3>Your experience could be the first story here.</h3><p>We're looking forward to hearing from our first reviewers.</p></div>}
          </div>
          <form className="expo-review-form" onSubmit={submitReview}>
            <div className="expo-review-form-heading"><span>SHARE YOUR EXPERIENCE</span><h3>How did we do?</h3><p>Your honest feedback means a lot to our team.</p></div>
            <label>Your name<input required minLength={2} maxLength={100} value={reviewForm.name} onChange={e=>setReviewForm({...reviewForm,name:e.target.value})} placeholder="How should we address you?"/></label>
            <label>What did we help you celebrate?<select value={reviewForm.eventType} onChange={e=>setReviewForm({...reviewForm,eventType:e.target.value})}><option>Kiddies' birthday party</option><option>Adult birthday or anniversary</option><option>Wedding or engagement</option><option>Corporate or school event</option><option>Event rentals and styling</option><option>Other special occasion</option></select></label>
            <div className="expo-review-rating"><span>Your rating</span><div role="radiogroup" aria-label="Your rating">{[1,2,3,4,5].map(n=><button key={n} type="button" role="radio" aria-checked={reviewForm.rating===n} aria-label={n+" star"+(n===1?"":"s")} className={n<=reviewForm.rating?"selected":""} onClick={()=>setReviewForm({...reviewForm,rating:n})}>★</button>)}</div><small>{["","Not great","Could be better","Good","Very good","Excellent"][reviewForm.rating]}</small></div>
            <label>Your review<textarea required minLength={15} maxLength={2000} rows={4} value={reviewForm.review} onChange={e=>setReviewForm({...reviewForm,review:e.target.value})} placeholder="Tell us about your experience with Exponair..."/></label>
            <button className="expo-review-submit" type="submit" disabled={reviewBusy}>{reviewBusy?"Submitting…":"Submit your review"}</button>
            <p className="expo-review-privacy">Reviews are checked by the Exponair team before being published. Please don't include private contact or payment details.</p>
            {reviewStatus&&<p className="expo-review-status" role="status">{reviewStatus}</p>}
          </form>
        </div>
      </section>

      <footer className="expo-footer">
        <div className="expo-footer-grid">
          <div className="expo-footer-about">
            <a className="expo-brand expo-brand-logo" href="#top" aria-label="Exponair home"><ExponairWordmark/></a>
            <p>Passionately bringing events to life. Thoughtful planning, creative styling and joyful experiences for celebrations big and small.</p>
            <div className="expo-footer-social">
              <a href="https://www.instagram.com/exponairevent/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={16}/></a>
              <a href="https://www.facebook.com/exponairevent" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={16}/></a>
              <a href="https://www.tiktok.com/@exponairevent" target="_blank" rel="noreferrer" aria-label="TikTok"><Music2 size={16}/></a>
              <a href="https://wa.me/2348023387671" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={16}/></a>
            </div>
          </div>
          <div className="expo-footer-column">
            <h3>QUICK LINKS</h3>
            <a href="#top">Home</a><a href="#about">About</a><a href="#services">Our services</a><a href="#kiddies">Kiddies' parties</a><a href="#adult">Adult celebrations</a><a href="#weddings">Weddings & occasions</a><a href="#corporate">Corporate events</a><a href="#rentals">Event rentals</a><a href="#packages">Packages</a><a href="#gallery">Gallery</a><a href="#booking">Enquiries</a>
          </div>
          <div className="expo-footer-column expo-footer-contact">
            <h3>CONTACT & LOCATION</h3>
            <p>Lagos, Nigeria</p>
            <a href="mailto:helenojukotola@gmail.com">helenojukotola@gmail.com</a>
            <a href="tel:+2348023387671">+234 802 338 7671</a>
            <p>Monday – Saturday<br/>9:00 am – 5:00 pm</p>
            <a href="#terms">Booking terms & conditions</a>
          </div>
        </div>
        <div className="expo-footer-bottom"><span>© {new Date().getFullYear()} EXPONAIR EVENTS MANAGEMENT LIMITED · RC1517280. ALL RIGHTS RESERVED.</span><span>LAGOS, NIGERIA</span></div>
      </footer>
      <a className="expo-whatsapp-float" href="https://wa.me/2348023387671?text=Hello%20Exponair%2C%20I%27d%20like%20to%20enquire%20about%20an%20event." target="_blank" rel="noreferrer"><span className="expo-whatsapp-mark" aria-hidden="true"><MessageCircle size={17} strokeWidth={1.8}/></span><span className="expo-whatsapp-label">Chat with Exponair</span><span className="expo-whatsapp-status" aria-hidden="true"/></a>
    </main>
  );
}
