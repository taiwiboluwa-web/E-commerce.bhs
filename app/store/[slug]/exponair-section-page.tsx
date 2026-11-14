"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { ExponairWordmark } from "./exponair-storefront";
import "./exponair.css";

const pages = {
  "our-story": { number:"01", label:"THE EXPONAIR STORY", title:"Every occasion has a feeling.", emphasis:"Get to know the team behind it.", intro:"Exponair Events Management Limited is a Lagos-based event planning, decoration, styling and rental company. We bring creative ideas, thoughtful details and professional coordination together to create celebrations that feel personal, beautiful and effortless.", image:"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1500&q=85", points:["A personal approach to every brief","Creative styling shaped around your vision","Thoughtful planning and clear communication","Professional coordination from first conversation to event day"] },
  "kiddies-parties": { number:"02", label:"A LITTLE MAGIC, A LOT OF JOY", title:"Big wonder for", emphasis:"little celebrations.", intro:"From first birthdays to milestone parties, we create joyful experiences for children aged 1–10. Think thoughtful themes, colourful details, playful activities and treats that make little guests feel special.", image:"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1500&q=85", points:["Themed birthday celebrations","Customised décor and treat tables","Games and age-appropriate entertainment","Popcorn, candyfloss, ice cream and kiddies' treats","Planning and event-day coordination"] },
  "celebrations": { number:"03", label:"YOUR MOMENT, BEAUTIFULLY DONE", title:"Make room for", emphasis:"a reason to celebrate.", intro:"Birthdays, anniversaries, bridal showers and intimate gatherings deserve more than a date on the calendar. Exponair brings styling, thoughtful details and seamless coordination together around your people and your story.", image:"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1500&q=85", points:["Milestone birthdays","Anniversaries and private dinners","Bridal and baby showers","Surprise celebrations","Personalised styling and coordination"] },
  "weddings": { number:"04", label:"THE DETAILS THAT MAKE IT YOURS", title:"A beautiful beginning,", emphasis:"thoughtfully celebrated.", intro:"From proposals and engagements to wedding celebrations, we help bring the atmosphere, details and coordination together so you can stay close to the moments that matter.", image:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1500&q=85", points:["Proposal setups and romantic surprises","Engagement celebrations","Wedding styling and décor direction","Coordination for special occasions","Personalised event details"] },
  "corporate": { number:"05", label:"BRING PEOPLE TOGETHER", title:"Purposeful events,", emphasis:"memorable experiences.", intro:"Exponair creates considered event experiences for organisations, schools and teams. From company celebrations to family fun days, we plan with purpose and deliver with care.", image:"https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1500&q=85", points:["Company celebrations and staff events","School events and end-of-year parties","Family fun days","Brand activations and experiences","Event planning and on-the-day management"] },
  "rentals": { number:"06", label:"THE FINISHING TOUCHES", title:"The right details", emphasis:"make the whole room.", intro:"Bring your event space together with considered rental essentials and styling support. Tell us what you have in mind and our team can help you plan the finishing touches.", image:"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1500&q=85", points:["Children's tables and chairs","Party furniture and event essentials","Décor elements and styling details","Setup and collection coordination","Standalone rentals or a wider event package"] },
  "packages": { number:"07", label:"PACKAGES & PRICING", title:"Your vision.", emphasis:"Your kind of magic.", intro:"Choose a starting point that feels right. Every quotation is tailored to your event date, venue, guest count, selected services and budget. No two celebrations need to be exactly alike.", image:"https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1500&q=85", points:["Basic Package — essential planning and coordination","Premium Package — enhanced styling, activities and vendor coordination","Luxury Package — full-service planning and event-day management","Custom quotations shaped around your brief"] },
  "reviews": { number:"08", label:"KIND WORDS, REAL EXPERIENCES", title:"Celebrations worth", emphasis:"talking about.", intro:"The best way to understand an event experience is to hear from the people who have lived it. Explore approved client feedback or share your own experience with the Exponair team.", image:"https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1500&q=85", points:["Feedback from clients who have celebrated with Exponair","Reviews are checked before they are published","Honest feedback helps future clients plan with confidence"] },
  "journal": { number:"09", label:"THE EXPONAIR JOURNAL", title:"Ideas, inspiration", emphasis:"and little details.", intro:"A growing collection of celebration inspiration, planning notes and thoughtful ideas to help you make the most of your next occasion. The journal is being prepared for its first stories.", image:"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1500&q=85", points:["Celebration inspiration and theme ideas","Helpful event planning checklists","Styling details and seasonal ideas","Behind-the-scenes stories from Exponair events"] }
} as const;

const navigation = [["Our story","our-story"],["Kiddies' parties","kiddies-parties"],["Celebrations","celebrations"],["Weddings","weddings"],["Corporate","corporate"],["Rentals","rentals"],["Packages","packages"],["Reviews","reviews"],["Journal","journal"]] as const;

export default function ExponairSectionPage({ section }: { section: string }) {
  const page = pages[section as keyof typeof pages];
  const [reviews,setReviews] = useState<Array<{id:string;customer_name:string;event_type:string;rating:number;review_text:string;created_at:string}>>([]);
  useEffect(() => {
    if(section !== "reviews") return;
    fetch("/api/exponair-reviews").then(r=>r.ok?r.json():Promise.reject()).then(data=>setReviews(data.reviews||[])).catch(()=>{});
  },[section]);
  if(!page) return null;
  return <main className="exponair">
    <div className="expo-grain" aria-hidden="true"/>
    <div className="expo-announcement">LAGOS, NIGERIA <span>·</span> THOUGHTFULLY PLANNED. BEAUTIFULLY CELEBRATED.</div>
    <header className="expo-header" id="top">
      <Link className="expo-brand expo-brand-logo" href="/exponair" aria-label="Exponair home"><ExponairWordmark compact/></Link>
      <nav className="expo-nav" aria-label="Exponair pages">{navigation.map(([label,path])=><Link key={path} className={path===section?"active":""} href={"/exponair/"+path}>{label}</Link>)}</nav>
      <Link className="expo-header-cta" href="/exponair#booking">Plan your event</Link>
    </header>
    <section className="expo-hero">
      <div className="expo-hero-copy">
        <div className="expo-eyebrow"><span/> {page.label}</div>
        <h1 className="expo-kinetic-title"><span className="expo-title-line">{page.title}</span><span className="expo-title-line"><em>{page.emphasis}</em></span></h1>
        <p className="expo-hero-lede">{page.intro}</p>
        <div className="expo-hero-actions"><Link className="expo-button expo-button-dark" href="/exponair#booking">Enquire with Exponair <ArrowRight size={15}/></Link><Link className="expo-text-link" href="/exponair">Back to homepage</Link></div>
        <div className="expo-hero-foot"><span>IMAGINE</span><i/><span>CREATE</span><i/><span>CELEBRATE</span></div>
      </div>
      <div className="expo-hero-visual"><div className="expo-image-frame"><div className="expo-hero-image" role="img" aria-label={page.label} style={{backgroundImage:"url('"+page.image+"')"}}/><div className="expo-image-caption"><span>MADE FOR YOUR MOMENT</span><span>LAGOS · NIGERIA</span></div></div><div className="expo-stamp"><span>PLAY</span><b>·</b><span>STYLE</span><b>·</b><span>CELEBRATE</span></div></div>
    </section>
    <section className="expo-intro">
      <div className="expo-section-label"><span>{page.number}</span> THE EXPONAIR APPROACH</div>
      <div className="expo-intro-content"><h2>Thoughtful from<br/><em>first idea to final detail.</em></h2><div className="expo-intro-bottom"><p>{page.intro}</p><div className="expo-subpage-points">{page.points.map((point,i)=><div key={point}><span>{String(i+1).padStart(2,"0")}</span><p>{point}</p><Check size={16}/></div>)}</div></div></div>
    </section>
    {section==="packages"&&<section className="expo-packages"><div className="expo-section-head"><div><div className="expo-section-label"><span>07</span> PACKAGES & PRICING</div><h2>Choose your<br/><em>kind of celebration.</em></h2></div><p>Every quotation is tailored to your event and brief.</p></div><div className="expo-package-grid"><article className="expo-package"><span className="expo-package-note">THE ESSENTIALS</span><h3>Basic Package</h3><p>Essential planning and coordination for intimate celebrations.</p></article><article className="expo-package featured"><span className="expo-package-note">THE SIGNATURE EXPERIENCE</span><h3>Premium Package</h3><p>Enhanced styling, activities and vendor coordination.</p></article><article className="expo-package"><span className="expo-package-note">THE FULL EXPERIENCE</span><h3>Luxury Package</h3><p>Full-service planning, bespoke styling and event-day management.</p></article></div></section>}
    {section==="reviews"&&<section className="expo-reviews"><div className="expo-reviews-heading"><div><div className="expo-section-label">CLIENT EXPERIENCES</div><h2>Kind words from<br/><em>celebration people.</em></h2></div></div>{reviews.length?reviews.map(review=><article className="expo-review-card" key={review.id}><span className="expo-review-stars">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span><p>“{review.review_text}”</p><strong>{review.customer_name}</strong><small>{review.event_type}</small></article>):<p className="expo-reviews-empty">New client stories will appear here as approved reviews are published.</p>}</section>}
    {section==="journal"&&<section className="expo-intro"><div className="expo-section-label">THE FIRST CHAPTER IS ON ITS WAY</div><div className="expo-intro-content"><h2>Good ideas are worth<br/><em>taking your time over.</em></h2><div className="expo-intro-bottom"><p>While we prepare the journal, speak with our team for inspiration and practical guidance for your event.</p></div></div></section>}
    <section className="expo-contact"><div className="expo-contact-copy"><div className="expo-section-label">HAVE A DATE IN MIND?</div><h2>Let's make it<br/><em>a moment.</em></h2><p>Tell us what you're imagining and let's begin with a conversation.</p><Link className="expo-button expo-button-dark" href="/exponair#booking">Start your enquiry <ArrowRight size={15}/></Link></div></section>
    <footer className="expo-footer"><div className="expo-footer-bottom"><span>© {new Date().getFullYear()} EXPONAIR EVENTS MANAGEMENT LIMITED · RC1517280.</span><Link href="/exponair">BACK TO HOMEPAGE</Link><span>LAGOS, NIGERIA</span></div></footer>
  </main>;
}
