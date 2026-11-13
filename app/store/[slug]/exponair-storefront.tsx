"use client";

import { useState } from "react";
import { Check, ChevronDown, Menu, Sparkles, X } from "lucide-react";
import "./exponair.css";

const services = [
  { n: "01", title: "Event planning & coordination", tag: "THE FULL PICTURE", copy: "A clear plan, trusted coordination and thoughtful management from the first brief to the final guest departure." },
  { n: "02", title: "Corporate events", tag: "MADE TO CONNECT", copy: "Conferences, launches, brand activations, team experiences and company celebrations with purpose." },
  { n: "03", title: "Weddings & celebrations", tag: "YOUR MOMENT", copy: "Personal celebrations shaped around your story, your people and the atmosphere you want to create." },
  { n: "04", title: "Event production & styling", tag: "THE DETAILS MATTER", copy: "Décor, staging, ambience and finishing touches that bring the whole experience together." },
];

const faqs = [
  ["What types of events do you manage?", "We support weddings, private celebrations, corporate gatherings, conferences, launches and other special occasions. Tell us what you are planning and we can discuss the right approach."],
  ["Can you work with my budget?", "Yes. Share your estimated budget and priorities during the first conversation so the scope can be shaped around what matters most."],
  ["How do we get started?", "Start with an inquiry. Share the occasion, preferred date, location and a little about your vision. The team can then follow up to discuss the next steps."],
];

export default function ExponairStorefront() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState("");
  const whatsappNumber = "2348023387671";
  const whatsappMessage = encodeURIComponent("Hello Exponair Events Management Ltd, I would like to enquire about planning an event. Preferred date: " + (selectedDate || "To be discussed") + ". My name is " + (form.name || "not provided") + ". Event type: " + form.event + ".");
  const whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + whatsappMessage;
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const calendarOffset = monthStart.getDay();
  const calendarDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  const dateKey = (day: number) => String(calendarMonth.getFullYear()) + "-" + String(calendarMonth.getMonth()+1).padStart(2,"0") + "-" + String(day).padStart(2,"0");
  const monthLabel = calendarMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  const [form, setForm] = useState({ name: "", email: "", event: "Wedding or private celebration", date: "", location: "", details: "" });
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="exponair">
      <div className="expo-grain" aria-hidden="true" />
      <header className="expo-header">
        <a className="expo-brand" href="#top" aria-label="Exponair home">
          <span className="expo-monogram">E<span>.</span></span>
          <span className="expo-brand-text"><strong>EXPONAIR</strong><small>EVENTS MANAGEMENT LTD</small></span>
        </a>
        <nav className={menuOpen ? "expo-nav is-open" : "expo-nav"} aria-label="Main navigation">
          <a href="#approach" onClick={closeMenu}>About</a>
          <a href="#services" onClick={closeMenu}>Our services</a>
          <a href="#moments" onClick={closeMenu}>Our work</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </nav>
        <a className="expo-header-cta" href="https://wa.me/2348023387671?text=Hello%20Exponair%2C%20I%27d%20like%20to%20make%20an%20event%20enquiry." target="_blank" rel="noreferrer">Chat on WhatsApp</a>
        <button className="expo-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="expo-hero" id="top">
        <div className="expo-hero-copy">
          <div className="expo-eyebrow"><span /> EXPONAIR EVENTS MANAGEMENT LTD</div>
          <h1>Make room<br />for <em>remarkable.</em></h1>
          <p className="expo-hero-lede">We bring people together through thoughtfully planned events, beautifully coordinated details and experiences worth remembering.</p>
          <div className="expo-hero-actions">
            <a className="expo-button expo-button-dark" href="#contact">Start planning</a>
            <a className="expo-text-link" href="#services">Explore our services</a>
          </div>
          <div className="expo-hero-foot"><span>01 / 04</span><i /><span>PLAN · CREATE · CELEBRATE</span></div>
        </div>
        <div className="expo-hero-visual">
          <div className="expo-image-frame">
            <div className="expo-hero-image" role="img" aria-label="Elegant event reception with warm lighting and floral styling" />
            <div className="expo-image-caption"><span>THE MOMENT IS YOURS</span><span>MADE WITH INTENTION</span></div>
          </div>
          <div className="expo-stamp"><span>PLAN</span><b>·</b><span>CREATE</span><b>·</b><span>CELEBRATE</span></div>
          <div className="expo-hero-number">E / 01</div>
        </div>
        <div className="expo-scroll-note"><span /> SCROLL TO EXPLORE</div>
      </section>

      <section className="expo-intro" id="approach">
        <div className="expo-section-label"><span>01</span> YOUR EVENT, OUR ATTENTION</div>
        <div className="expo-intro-content">
          <h2>Good events bring people together.<br /><em>Great ones make them feel something.</em></h2>
          <div className="expo-intro-bottom">
            <p>At Exponair, we believe every gathering deserves a clear vision and thoughtful execution. We bring the moving parts together, so you can be fully present for the moments that matter.</p>
            <a href="https://wa.me/2348023387671?text=Hello%20Exponair%2C%20I%27d%20like%20to%20discuss%20an%20event." target="_blank" rel="noreferrer" className="expo-circle-link">Talk to us</a>
          </div>
        </div>
      </section>

      <section className="expo-services" id="services">
        <div className="expo-section-head">
          <div><div className="expo-section-label"><span>02</span> WHAT WE DO</div><h2>One vision.<br /><em>Every detail considered.</em></h2></div>
          <p>From the first idea to the final finishing touch, we make the planning process feel clear, considered and connected.</p>
        </div>
        <div className="expo-service-list">
          {services.map((service) => <article className="expo-service" key={service.n}>
            <span className="expo-service-n">{service.n}</span>
            <div className="expo-service-main"><span>{service.tag}</span><h3>{service.title}</h3></div>
            <p>{service.copy}</p>
            <a href={"https://wa.me/2348023387671?text=" + encodeURIComponent("Hello Exponair, I would like to enquire about " + service.title + ".")} target="_blank" rel="noreferrer" aria-label={"Enquire about " + service.title}>Enquire</a>
          </article>)}
        </div>
      </section>

      <section className="expo-gallery" id="moments">
        <div className="expo-gallery-head"><div className="expo-section-label"><span>03</span> MOMENTS THAT STAY</div><p>Every occasion has its own energy. We make space for it to shine.</p></div>
        <div className="expo-gallery-grid">
          <article className="expo-moment moment-tall"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85')"}}/><div className="expo-moment-meta"><span>01 / CELEBRATIONS</span><h3>A beautiful reason<br />to gather.</h3></div></article>
          <article className="expo-moment moment-wide"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=85')"}}/><div className="expo-moment-meta"><span>02 / EXPERIENCES</span><h3>Spaces that make<br />a statement.</h3></div></article>
          <article className="expo-moment moment-small"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1507504031003-b417219a0b?auto=format&fit=crop&w=1200&q=85')"}}/><div className="expo-moment-meta"><span>03 / THE FINISHING TOUCH</span><h3>Considered down to<br />the last detail.</h3></div></article>
        </div>
        <p className="expo-gallery-note">Portfolio imagery is illustrative and should be replaced with Exponair-approved event photographs.</p>
      </section>

      <section className="expo-quote">
        <span className="expo-quote-mark">“</span>
        <blockquote>The details are not the details.<br /><em>They make the experience.</em></blockquote>
        <span className="expo-quote-rule" />
        <span className="expo-quote-caption">THE EXPONAIR APPROACH</span>
      </section>

      <section className="expo-faq">
        <div><div className="expo-section-label"><span>04</span> GOOD TO KNOW</div><h2>Before the<br /><em>first hello.</em></h2><p>Every event begins with a conversation. Here are a few helpful starting points.</p></div>
        <div className="expo-faq-list">
          {faqs.map(([q,a],i)=><article className={activeFaq===i?"expo-faq-item active":"expo-faq-item"} key={q}>
            <button onClick={() => setActiveFaq(activeFaq===i?null:i)}><span>0{i+1}</span><b>{q}</b><i aria-hidden="true">{activeFaq===i?"−":"+"}</i></button>
            {activeFaq===i && <p>{a}</p>}
          </article>)}
        </div>
      </section>

      <section className="expo-contact" id="contact">
        <div className="expo-contact-copy"><div className="expo-section-label"><span>05</span> LET'S MAKE IT HAPPEN</div><h2>Have a date<br />in <em>mind?</em></h2><p>Tell us a little about what you are imagining. We will use your note as the starting point for a proper conversation.</p><div className="expo-contact-note"><Sparkles size={16}/><span>A thoughtful first conversation. No pressure.</span></div></div>
        <form className="expo-form" onSubmit={(e)=>{e.preventDefault();setSubmitted(true);}}>
          {submitted ? <div className="expo-form-success"><span><Check size={22}/></span><h3>Thank you for reaching out.</h3><p>This storefront preview is not yet connected to Exponair's inbox. Your inquiry has not been sent. Connect the approved email or CRM endpoint before launch.</p><button type="button" onClick={() => setSubmitted(false)}>Edit inquiry</button></div> : <>
            <div className="expo-form-top"><span>EVENT ENQUIRY</span><span>* REQUIRED</span></div>
            <div className="expo-calendar"><div className="expo-calendar-head"><div><span>CHOOSE A PREFERRED DATE</span><strong>{monthLabel}</strong></div><div className="expo-calendar-controls"><button type="button" aria-label="Previous month" disabled={calendarMonth.getFullYear()===today.getFullYear() && calendarMonth.getMonth()===today.getMonth()} onClick={()=>setCalendarMonth(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1))}>‹</button><button type="button" aria-label="Next month" onClick={()=>setCalendarMonth(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1))}>›</button></div></div><div className="expo-calendar-grid">{["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d=><span className="expo-calendar-weekday" key={d}>{d}</span>)}{Array.from({length:calendarOffset},(_,i)=><span key={"blank"+i}/>)}{Array.from({length:calendarDays},(_,i)=>{const day=i+1;const key=dateKey(day);const date=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),day);const past=date<today;return <button type="button" key={key} disabled={past} className={(selectedDate===key?"selected ":"")+(past?"past":"")} onClick={()=>{setSelectedDate(key);setForm({...form,date:key});}}>{day}</button>;})}</div><p className="expo-calendar-note">Choose a future date to request. Exponair will confirm availability before your booking is accepted.</p>{selectedDate && <p className="expo-calendar-selected">Preferred date: <strong>{new Date(selectedDate+"T12:00:00").toLocaleDateString("en",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</strong></p>}</div>
            <label>Your name *<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name" /></label>
            <label>Email address *<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" /></label>
            <div className="expo-form-row"><label>Event type *<select value={form.event} onChange={e=>setForm({...form,event:e.target.value})}><option>Wedding or private celebration</option><option>Corporate event</option><option>Brand launch or activation</option><option>Conference or seminar</option><option>Other occasion</option></select></label><label>Preferred event date<input type="date" min={today.toISOString().slice(0,10)} value={form.date} onChange={e=>{setForm({...form,date:e.target.value});setSelectedDate(e.target.value);}}/></label></div>
            <label>Event location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="City or venue (if known)" /></label>
            <label>Tell us about your plans<textarea rows={3} value={form.details} onChange={e=>setForm({...form,details:e.target.value})} placeholder="The occasion, guest count, ideas and the feeling you have in mind..." /></label>
            <button className="expo-button expo-button-dark expo-submit" type="submit">Prepare my enquiry</button>
            <p className="expo-form-disclaimer">This enquiry preview does not reserve a date. Contact Exponair on WhatsApp to confirm availability and booking details.</p><a className="expo-whatsapp-form" href={whatsappUrl} target="_blank" rel="noreferrer">Continue on WhatsApp · +234 802 338 7671</a>
          </>}
        </form>
      </section>

      <a className="expo-whatsapp-float" href="https://wa.me/2348023387671?text=Hello%20Exponair%2C%20I%27d%20like%20to%20make%20an%20enquiry." target="_blank" rel="noreferrer" aria-label="Chat with Exponair on WhatsApp"><span className="expo-whatsapp-mark">W</span><span>Enquire on WhatsApp</span></a>
      <a className="expo-whatsapp-float" href={whatsappUrl} target="_blank" rel="noreferrer"><span className="expo-whatsapp-mark">W</span> Chat on WhatsApp · +234 802 338 7671</a>
      <footer className="expo-footer">
        <div className="expo-footer-main"><a className="expo-brand" href="#top"><span className="expo-monogram">E<span>.</span></span><span className="expo-brand-text"><strong>EXPONAIR</strong><small>EVENTS MANAGEMENT LTD</small></span></a><p>Thoughtful planning.<br />Remarkable experiences.</p><a className="expo-back-top" href="#top">BACK TO TOP</a></div>
        <div className="expo-footer-bottom"><span>WhatsApp: +234 802 338 7671</span><span>© {new Date().getFullYear()} EXPONAIR EVENTS MANAGEMENT LTD</span><span>MADE FOR MOMENTS THAT MATTER</span><span>EVENTS · EXPERIENCES · CELEBRATIONS</span></div>
      </footer>
    </main>
  );
}
