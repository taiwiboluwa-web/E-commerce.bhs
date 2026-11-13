"use client";

import { useState } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check,
  ChevronDown, Instagram, Mail, Menu, Phone, Sparkles, X
} from "lucide-react";
import "./exponair.css";

const services = [
  { n: "01", title: "Event planning", copy: "From the first conversation to the final guest departure, every detail has a place.", tag: "THE FULL PICTURE" },
  { n: "02", title: "Corporate experiences", copy: "Conferences, launches, brand activations and company celebrations with purpose.", tag: "MADE TO CONNECT" },
  { n: "03", title: "Weddings & celebrations", copy: "Personal celebrations shaped around your story, your people and your kind of magic.", tag: "YOUR MOMENT" },
  { n: "04", title: "Production & styling", copy: "Atmosphere, staging, décor and thoughtful finishing touches that bring a vision to life.", tag: "THE DETAILS MATTER" },
];

const moments = [
  { label: "THE CELEBRATION", title: "A beautiful reason to gather", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85", cls: "moment-tall" },
  { label: "THE EXPERIENCE", title: "Spaces that make a statement", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85", cls: "moment-wide" },
  { label: "THE FINISHING TOUCH", title: "Considered down to the last detail", image: "https://images.unsplash.com/photo-1507504031003-b417219a0'adresse?auto=format&fit=crop&w=1200&q=85", cls: "moment-small" },
];

export default function ExponairHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", event: "Wedding or celebration", date: "", details: "" });

  const closeMenu = () => setMenuOpen(false);
  const submitInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="exponair">
      <div className="expo-grain" aria-hidden="true" />
      <header className="expo-header">
        <a className="expo-brand" href="#top" aria-label="Exponair home">
          <span className="expo-monogram">E<span>.</span></span>
          <span className="expo-brand-text"><strong>EXPONAIR</strong><small>EVENTS MANAGEMENT LTD</small></span>
        </a>
        <nav className={menuOpen ? "expo-nav is-open" : "expo-nav"} aria-label="Main navigation">
          <a href="#approach" onClick={closeMenu}>Our approach</a>
          <a href="#services" onClick={closeMenu}>What we do</a>
          <a href="#moments" onClick={closeMenu}>The experience</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </nav>
        <a className="expo-header-cta" href="#contact">Plan an event <ArrowUpRight size={15} /></a>
        <button className="expo-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="expo-hero" id="top">
        <div className="expo-hero-copy">
          <div className="expo-eyebrow"><span /> EVENTS, THOUGHTFULLY BROUGHT TO LIFE</div>
          <h1>Make room<br />for <em>remarkable.</em></h1>
          <p className="expo-hero-lede">The best events don't just happen. They're imagined with intention, brought together with care, and remembered long after the last guest leaves.</p>
          <div className="expo-hero-actions">
            <a className="expo-button expo-button-dark" href="#contact">Let's plan something <ArrowUpRight size={16} /></a>
            <a className="expo-text-link" href="#services">Discover what we do <ArrowDownRight size={16} /></a>
          </div>
          <div className="expo-hero-foot"><span>01 / 04</span><i /><span>THE ART OF A WELL-PLANNED MOMENT</span></div>
        </div>
        <div className="expo-hero-visual">
          <div className="expo-image-frame">
            <div className="expo-hero-image" role="img" aria-label="Elegant event reception with warm lighting and floral styling" />
            <div className="expo-image-caption"><span>THE MOMENT IS YOURS</span><span>EST. WITH INTENTION</span></div>
          </div>
          <div className="expo-stamp"><span>PLAN</span><b>·</b><span>CREATE</span><b>·</b><span>CELEBRATE</span></div>
          <div className="expo-hero-number">E / 01</div>
        </div>
        <div className="expo-scroll-note"><span /> SCROLL TO EXPLORE</div>
      </section>

      <section className="expo-intro" id="approach">
        <div className="expo-section-label"><span>01</span> A DIFFERENT KIND OF EVENT PARTNER</div>
        <div className="expo-intro-content">
          <h2>Good events bring people together.<br /><em>Great ones make them feel something.</em></h2>
          <div className="expo-intro-bottom">
            <p>At Exponair, we believe every gathering deserves a clear vision and thoughtful execution. We bring the moving parts together, so you can be fully present for the moments that matter.</p>
            <a href="#contact" className="expo-circle-link" aria-label="Talk to Exponair"><ArrowUpRight size={22} /></a>
          </div>
        </div>
      </section>

      <section className="expo-services" id="services">
        <div className="expo-section-head">
          <div><div className="expo-section-label"><span>02</span> WHAT WE BRING TO THE TABLE</div><h2>One vision.<br /><em>Every detail considered.</em></h2></div>
          <p>From the big picture to the smallest finishing touch, we help make the experience feel effortless.</p>
        </div>
        <div className="expo-service-list">
          {services.map((service) => <article className="expo-service" key={service.n}>
            <span className="expo-service-n">{service.n}</span>
            <div className="expo-service-main"><span>{service.tag}</span><h3>{service.title}</h3></div>
            <p>{service.copy}</p>
            <a href="#contact" aria-label={"Enquire about " + service.title}><ArrowUpRight size={20} /></a>
          </article>)}
        </div>
      </section>

      <section className="expo-gallery" id="moments">
        <div className="expo-gallery-head"><div className="expo-section-label"><span>03</span> THE FEELING STAYS WITH YOU</div><p>Every occasion has its own energy. We make space for it to shine.</p></div>
        <div className="expo-gallery-grid">
          <article className="expo-moment moment-tall"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85')"}}/><div className="expo-moment-meta"><span>01 / THE CELEBRATION</span><h3>A beautiful reason<br />to gather.</h3></div></article>
          <article className="expo-moment moment-wide"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=85')"}}/><div className="expo-moment-meta"><span>02 / THE EXPERIENCE</span><h3>Spaces that make<br />a statement.</h3></div></article>
          <article className="expo-moment moment-small"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1507504031003-b417219a0b?auto=format&fit=crop&w=1200&q=85')"}}/><div className="expo-moment-meta"><span>03 / THE FINISHING TOUCH</span><h3>Considered down to<br />the last detail.</h3></div></article>
        </div>
        <p className="expo-gallery-note">Visual direction preview · Replace with Exponair's approved event portfolio.</p>
      </section>

      <section className="expo-quote">
        <span className="expo-quote-mark">“</span>
        <blockquote>The details are not the details.<br /><em>They make the experience.</em></blockquote>
        <span className="expo-quote-rule" />
        <span className="expo-quote-caption">THE EXPONAIR APPROACH</span>
      </section>

      <section className="expo-faq">
        <div><div className="expo-section-label"><span>04</span> A FEW THINGS TO KNOW</div><h2>Before the<br /><em>first hello.</em></h2><p>Every event begins with a conversation. Here are a few helpful starting points.</p></div>
        <div className="expo-faq-list">
          {[
            ["What kinds of events do you manage?", "We can shape this around private celebrations, weddings, corporate gatherings, launches and other special occasions. Share what you have in mind and we'll take it from there."],
            ["How early should I get in touch?", "As early as you can. A little breathing room gives us more space to plan thoughtfully, coordinate suppliers and make the right decisions together."],
            ["Can you work with an existing budget?", "Absolutely. Tell us your priorities and your working budget during the first conversation so the plan can be shaped around what matters most."],
          ].map(([q,a],i)=><article className={activeFaq===i?"expo-faq-item active":"expo-faq-item"} key={q}>
            <button onClick={() => setActiveFaq(activeFaq===i?null:i)}><span>0{i+1}</span><b>{q}</b><ChevronDown size={18}/></button>
            {activeFaq===i && <p>{a}</p>}
          </article>)}
        </div>
      </section>

      <section className="expo-contact" id="contact">
        <div className="expo-contact-copy"><div className="expo-section-label"><span>05</span> YOUR MOMENT STARTS HERE</div><h2>Have a date<br />in <em>mind?</em></h2><p>Tell us a little about what you're imagining. We'll use your note as the starting point for a proper conversation.</p><div className="expo-contact-note"><Sparkles size={16}/><span>No pressure. Just a thoughtful first conversation.</span></div></div>
        <form className="expo-form" onSubmit={submitInquiry}>
          {submitted ? <div className="expo-form-success"><span><Check size={22}/></span><h3>Thank you for the introduction.</h3><p>Your inquiry has been captured in this preview. Connect the form to Exponair's preferred email or CRM before launch so the team can receive submissions.</p><button type="button" onClick={() => setSubmitted(false)}>Send another inquiry</button></div> : <>
            <div className="expo-form-top"><span>LET'S START WITH THE BASICS</span><span>* REQUIRED</span></div>
            <label>Your name *<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="How should we address you?" /></label>
            <label>Email address *<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" /></label>
            <div className="expo-form-row"><label>What are we planning? *<select value={form.event} onChange={e=>setForm({...form,event:e.target.value})}><option>Wedding or celebration</option><option>Corporate event</option><option>Brand launch or activation</option><option>Conference or seminar</option><option>Other occasion</option></select></label><label>Event date<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div>
            <label>Tell us a little more<textarea rows={3} value={form.details} onChange={e=>setForm({...form,details:e.target.value})} placeholder="The occasion, the location, the feeling you're going for..." /></label>
            <button className="expo-button expo-button-dark expo-submit" type="submit">Send your inquiry <ArrowUpRight size={16}/></button>
            <p className="expo-form-disclaimer">Preview form only — connect a secure submission endpoint before publishing.</p>
          </>}
        </form>
      </section>

      <footer className="expo-footer">
        <div className="expo-footer-main"><a className="expo-brand" href="#top"><span className="expo-monogram">E<span>.</span></span><span className="expo-brand-text"><strong>EXPONAIR</strong><small>EVENTS MANAGEMENT LTD</small></span></a><p>Thoughtful planning.<br />Remarkable experiences.</p><a className="expo-back-top" href="#top">BACK TO TOP <ArrowUpRight size={15}/></a></div>
        <div className="expo-footer-bottom"><span>© {new Date().getFullYear()} EXPONAIR EVENTS MANAGEMENT LTD</span><span>MADE FOR MOMENTS THAT MATTER</span><span>CONTACT DETAILS TO BE CONFIRMED</span></div>
      </footer>
    </main>
  );
}
