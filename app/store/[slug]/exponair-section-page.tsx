"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import "./exponair.css";

const pages = {
  "our-story": { number:"01", label:"THE EXPONAIR STORY", title:"Every occasion has a feeling.", emphasis:"Get to know the team behind it.", intro:"Exponair Events Management Limited is a Lagos-based event planning, decoration, styling and rental company. We bring creative ideas, thoughtful details and professional coordination together to create celebrations that feel personal, beautiful and effortless.", image:"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1500&q=85", points:["A personal approach to every brief","Creative styling shaped around your vision","Thoughtful planning and clear communication","Professional coordination from first conversation to event day"], cta:"Start planning with us", href:"/exponair#booking" },
  "kiddies-parties": { number:"02", label:"A LITTLE MAGIC, A LOT OF JOY", title:"Big wonder for", emphasis:"little celebrations.", intro:"From first birthdays to milestone parties, we create joyful experiences for children aged 1–10. Think thoughtful themes, colourful details, playful activities and treats that make little guests feel special.", image:"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1500&q=85", points:["Themed birthday celebrations","Customised décor and treat tables","Games and age-appropriate entertainment","Popcorn, candyfloss, ice cream and kiddies' treats","Planning and event-day coordination"], cta:"Plan a kiddies' party", href:"/exponair#booking" },
  "celebrations": { number:"03", label:"YOUR MOMENT, BEAUTIFULLY DONE", title:"Make room for", emphasis:"a reason to celebrate.", intro:"Birthdays, anniversaries, bridal showers and intimate gatherings deserve more than a date on the calendar. Exponair brings styling, thoughtful details and seamless coordination together around your people and your story.", image:"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1500&q=85", points:["Milestone birthdays","Anniversaries and private dinners","Bridal and baby showers","Surprise celebrations","Personalised styling and coordination"], cta:"Discuss your celebration", href:"/exponair#booking" },
  "weddings": { number:"04", label:"THE DETAILS THAT MAKE IT YOURS", title:"A beautiful beginning,", emphasis:"thoughtfully celebrated.", intro:"From proposals and engagements to wedding celebrations, we help bring the atmosphere, details and coordination together so you can stay close to the moments that matter.", image:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1500&q=85", points:["Proposal setups and romantic surprises","Engagement celebrations","Wedding styling and décor direction","Coordination for special occasions","Personalised event details"], cta:"Tell us about your day", href:"/exponair#booking" },
  "corporate": { number:"05", label:"BRING PEOPLE TOGETHER", title:"Purposeful events,", emphasis:"memorable experiences.", intro:"Exponair creates considered event experiences for organisations, schools and teams. From company celebrations to family fun days, we plan with purpose and deliver with care.", image:"https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1500&q=85", points:["Company celebrations and staff events","School events and end-of-year parties","Family fun days","Brand activations and experiences","Event planning and on-the-day management"], cta:"Plan a corporate event", href:"/exponair#booking" },
  "rentals": { number:"06", label:"THE FINISHING TOUCHES", title:"The right details", emphasis:"make the whole room.", intro:"Bring your event space together with considered rental essentials and styling support. Tell us what you have in mind and our team can help you plan the finishing touches.", image:"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1500&q=85", points:["Children's tables and chairs","Party furniture and event essentials","Décor elements and styling details","Setup and collection coordination","Standalone rentals or a wider event package"], cta:"Ask about rentals", href:"/exponair#booking" },
  "packages": { number:"07", label:"PACKAGES & PRICING", title:"Your vision.", emphasis:"Your kind of magic.", intro:"Choose a starting point that feels right. Every quotation is tailored to your event date, venue, guest count, selected services and budget. No two celebrations need to be exactly alike.", image:"https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1500&q=85", points:["Basic Package — essential planning and coordination","Premium Package — enhanced styling, activities and vendor coordination","Luxury Package — full-service planning and event-day management","Custom quotations shaped around your brief"], cta:"Enquire about a package", href:"/exponair#packages" },
  "reviews": { number:"08", label:"KIND WORDS, REAL EXPERIENCES", title:"Celebrations worth", emphasis:"talking about.", intro:"The best way to understand an event experience is to hear from the people who have lived it. Explore approved client feedback or share your own experience with the Exponair team.", image:"https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1500&q=85", points:["Feedback from clients who have celebrated with Exponair","Reviews are checked before they are published","Honest feedback helps future clients plan with confidence"], cta:"Share your experience", href:"/exponair#reviews" },
  "journal": { number:"09", label:"THE EXPONAIR JOURNAL", title:"Ideas, inspiration", emphasis:"and little details.", intro:"A growing collection of celebration inspiration, planning notes and thoughtful ideas to help you make the most of your next occasion. The journal is being prepared for its first stories.", image:"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1500&q=85", points:["Celebration inspiration and theme ideas","Helpful event planning checklists","Styling details and seasonal ideas","Behind-the-scenes stories from Exponair events"], cta:"Ask us for ideas", href:"/exponair#booking" }
} as const;

const navigation = [
  ["Our story","our-story"],["Kiddies' parties","kiddies-parties"],["Celebrations","celebrations"],["Weddings","weddings"],["Corporate","corporate"],["Rentals","rentals"],["Packages","packages"],["Reviews","reviews"],["Journal","journal"]
] as const;

export default function ExponairSectionPage({ section }: { section: string }) {
  const page = pages[section as keyof typeof pages];
  const [reviews,setReviews] = useState<Array<{id:string;customer_name:string;event_type:string;rating:number;review_text:string;created_at:string}>>([]);
  useEffect(() => {
    if(section !== "reviews") return;
    fetch("/api/exponair-reviews").then(r=>r.ok?r.json():Promise.reject()).then(data=>setReviews(data.reviews||[])).catch(()=>{});
  },[section]);
  if(!page) return null;
  return <main className="exponair expo-subpage">
    <div className="expo-grain" aria-hidden="true"/>
    <div className="expo-announcement">LAGOS, NIGERIA <span>·</span> THOUGHTFULLY PLANNED. BEAUTIFULLY CELEBRATED.</div>
    <header className="expo-header">
      <Link className="expo-brand expo-subpage-brand" href="/exponair"><span className="expo-subpage-mark">E</span><span className="expo-wordmark-copy"><strong>Exponair</strong><small>EVENTS MANAGEMENT LTD</small><em>Passionately bringing your events alive</em></span></Link>
      <nav className="expo-nav" aria-label="Exponair pages">{navigation.map(([label,path])=><Link key={path} className={path===section?"active":""} href={"/exponair/"+path}>{label}</Link>)}</nav>
      <Link className="expo-header-cta" href="/exponair#booking">Plan your event</Link>
    </header>
    <section className="expo-subpage-hero">
      <div className="expo-subpage-copy">
        <div className="expo-section-label"><span>{page.number}</span> {page.label}</div>
        <h1>{page.title}<br/><em>{page.emphasis}</em></h1>
        <p>{page.intro}</p>
        <Link className="expo-button expo-button-dark" href={page.href}>{page.cta} <ArrowRight size={15}/></Link>
      </div>
      <div className="expo-subpage-image" style={{backgroundImage:"url('"+page.image+"')"}}/>
    </section>
    <section className="expo-subpage-details">
      <div><span className="expo-section-label">THE EXPONAIR APPROACH</span><h2>Thoughtful from<br/><em>first idea to final detail.</em></h2></div>
      <div className="expo-subpage-points">{page.points.map((point,i)=><div key={point}><span>0{i+1}</span><p>{point}</p><Check size={16}/></div>)}</div>
    </section>
    {section==="packages"&&<section className="expo-subpage-packages"><article><span>01 · STARTER TIER</span><h3>Basic Package</h3><p>Essential planning and coordination for intimate celebrations.</p></article><article><span>02 · SIGNATURE EXPERIENCE</span><h3>Premium Package</h3><p>Enhanced styling, activities and vendor coordination.</p></article><article><span>03 · TOP TIER</span><h3>Luxury Package</h3><p>Full-service planning, bespoke styling and event-day management.</p></article></section>}
    {section==="reviews"&&<section className="expo-subpage-reviews"><div className="expo-section-label">CLIENT EXPERIENCES</div>{reviews.length?reviews.map(review=><article key={review.id}><span>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span><p>“{review.review_text}”</p><strong>{review.customer_name}</strong><small>{review.event_type}</small></article>):<p className="expo-subpage-empty">New client stories will appear here as approved reviews are published.</p>}<Link className="expo-text-link" href="/exponair#reviews">Leave a review <ArrowRight size={14}/></Link></section>}
    {section==="journal"&&<section className="expo-journal-coming"><span>THE FIRST CHAPTER IS ON ITS WAY</span><h2>Good ideas are worth<br/><em>taking your time over.</em></h2><p>While we prepare the journal, speak with our team for inspiration and practical guidance for your event.</p><Link className="expo-button expo-button-dark" href="/exponair#booking">Ask Exponair for ideas <ArrowRight size={15}/></Link></section>}
    <section className="expo-subpage-cta"><div><span>HAVE A DATE IN MIND?</span><h2>Let's make it a moment.</h2></div><Link href="/exponair#booking">Start your enquiry <ArrowRight size={15}/></Link></section>
    <footer className="expo-footer"><div className="expo-footer-bottom"><span>© {new Date().getFullYear()} EXPONAIR EVENTS MANAGEMENT LIMITED · RC1517280.</span><Link href="/exponair">BACK TO HOMEPAGE</Link><span>LAGOS, NIGERIA</span></div></footer>
  </main>;
}
