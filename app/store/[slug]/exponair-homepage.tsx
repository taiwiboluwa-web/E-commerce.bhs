"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExponairWordmark } from "./exponair-storefront";
import "./exponair.css";

const sections = [
  ["Our story","our-story","The people, passion and care behind every Exponair event."],
  ["Kiddies' parties","kiddies-parties","Joyful themes, playful details and treats for little guests."],
  ["Celebrations","celebrations","Birthdays, anniversaries, showers and meaningful gatherings."],
  ["Weddings","weddings","Beautifully considered moments for your special day."],
  ["Corporate","corporate","Purposeful experiences for teams, schools and organisations."],
  ["Rentals","rentals","Event essentials and styling details for your venue."],
  ["Packages","packages","Explore Basic, Premium and Luxury options."],
  ["Reviews","reviews","Read experiences shared by Exponair clients."],
  ["Journal","journal","Ideas, inspiration and practical celebration notes."]
] as const;

export default function ExponairHomePage() {
  return <main className="exponair">
    <div className="expo-grain" aria-hidden="true"/>
    <div className="expo-announcement">LAGOS, NIGERIA <span>·</span> THOUGHTFULLY PLANNED. BEAUTIFULLY CELEBRATED.</div>
    <header className="expo-header" id="top">
      <Link className="expo-brand expo-brand-logo" href="/exponair" aria-label="Exponair home"><ExponairWordmark compact/></Link>
      <nav className="expo-nav" aria-label="Main navigation">{sections.map(([label,path])=><Link key={path} href={"/exponair/"+path}>{label}</Link>)}</nav>
      <Link className="expo-header-cta" href="https://wa.me/2348023387671?text=Hello%20Exponair%2C%20I%20would%20like%20to%20plan%20an%20event.">Plan your event</Link>
    </header>
    <section className="expo-hero">
      <div className="expo-hero-copy">
        <div className="expo-eyebrow"><span/> THE ART OF A GOOD CELEBRATION</div>
        <h1 className="expo-kinetic-title"><span className="expo-title-line">Passionately</span><span className="expo-title-line"><em>bringing events</em></span><span className="expo-title-line">to life<span className="expo-period">.</span></span></h1>
        <p className="expo-hero-lede">From wonder-filled kiddies' parties to elegant celebrations and corporate experiences, Exponair turns your ideas into moments worth remembering.</p>
        <div className="expo-hero-actions"><Link className="expo-button expo-button-dark" href="https://wa.me/2348023387671?text=Hello%20Exponair%2C%20I%20would%20like%20to%20plan%20an%20event.">Let's plan something <ArrowRight size={15}/></Link><a className="expo-text-link" href="#explore">Explore Exponair</a></div>
        <div className="expo-hero-foot"><span>IMAGINE</span><i/><span>CREATE</span><i/><span>CELEBRATE</span></div>
      </div>
      <div className="expo-hero-visual"><div className="expo-image-frame"><div className="expo-hero-image" role="img" aria-label="An artfully styled celebration with colourful event décor"/><div className="expo-image-caption"><span>MADE FOR YOUR MOMENT</span><span>LAGOS · NIGERIA</span></div></div><div className="expo-stamp"><span>PLAY</span><b>·</b><span>STYLE</span><b>·</b><span>CELEBRATE</span></div></div>
    </section>
    <section className="expo-intro"><div className="expo-section-label"><span>01</span> A LITTLE ABOUT EXPONAIR</div><div className="expo-intro-content"><h2>Every occasion has a feeling.<br/><em>We make it unforgettable.</em></h2><div className="expo-intro-bottom"><p>Exponair Events Management Limited brings creative ideas, thoughtful details and professional coordination together for celebrations across Lagos.</p><Link href="/exponair/our-story" className="expo-circle-link">Discover our story <ArrowRight size={15}/></Link></div></div></section>
    <section className="expo-services" id="explore"><div className="expo-section-head"><div><div className="expo-section-label"><span>02</span> EXPLORE EXPONAIR</div><h2>One creative team.<br/><em>Many ways to celebrate.</em></h2></div><p>Explore each part of the Exponair experience on its own page.</p></div><div className="expo-service-feature-grid">{sections.map(([label,path,description],i)=><article className="expo-service-feature" key={path}><div className="expo-feature-content"><span className="expo-feature-index">{String(i+1).padStart(2,"0")} / EXPLORE</span><h3>{label}</h3><p>{description}</p><Link href={"/exponair/"+path}>Explore {label} <ArrowRight size={14}/></Link></div></article>)}</div></section>
    <section className="expo-contact"><div className="expo-contact-copy"><div className="expo-section-label">HAVE A DATE IN MIND?</div><h2>Let's make it<br/><em>a moment.</em></h2><p>Tell us what you're imagining and let's begin with a conversation.</p><Link className="expo-button expo-button-dark" href="https://wa.me/2348023387671?text=Hello%20Exponair%2C%20I%20would%20like%20to%20plan%20an%20event.">Start your enquiry <ArrowRight size={15}/></Link></div></section>
    <footer className="expo-footer"><div className="expo-footer-bottom"><span>© {new Date().getFullYear()} EXPONAIR EVENTS MANAGEMENT LIMITED · RC1517280.</span><span>LAGOS, NIGERIA</span></div></footer>
  </main>;
}
