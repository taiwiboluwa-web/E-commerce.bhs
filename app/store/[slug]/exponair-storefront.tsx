"use client";

import { useMemo, useState } from "react";
import { Check, Menu, X } from "lucide-react";
import "./exponair.css";

const WHATSAPP = "2348023387671";
const services = [
  { n: "01", title: "Kiddies birthday parties", tag: "THE BIG DAY", copy: "A joyful, professionally organised birthday celebration designed around your child, their favourite things and the guests they love.", includes: "Party planning, event coordination, party flow and vendor coordination." },
  { n: "02", title: "Themed party experiences", tag: "A WORLD OF THEIR OWN", copy: "Bring a child’s imagination to life with a celebration shaped around favourite characters, colours and playful themes.", includes: "Creative theme concepts, customised decorations, styling and setup." },
  { n: "03", title: "Games & entertainment", tag: "LET THE FUN BEGIN", copy: "Keep children aged 1–10 smiling with age-appropriate games, activities and entertainment.", includes: "Activity planning, games schedule and entertainment coordination." },
  { n: "04", title: "Party rentals", tag: "READY FOR PLAY", copy: "Bring the party together with practical and playful rental options for your celebration.", includes: "Rental coordination for selected party equipment, furniture and event essentials." },
  { n: "05", title: "Decorations & party details", tag: "THE LITTLE THINGS", copy: "From the welcome area to the cake table, we bring the finishing touches together for a celebration that feels complete.", includes: "Customised decorations, styling, cake and treat-table coordination." },
];

const packages = [
  { name: "Little Moments", note: "A sweet, simple celebration", detail: "For intimate celebrations for little ones aged 1–10 and their families.", items: ["Planning consultation", "Basic event timeline", "On-the-day coordination"], price: "Request a quote" },
  { name: "Big Smiles", note: "A little more magic", detail: "For themed birthdays with customised decorations and extra activities.", items: ["Everything in Little Moments", "Theme and décor coordination", "Games and activity schedule", "Vendor coordination"], price: "Request a quote", featured: true },
  { name: "The Grand Celebration", note: "The full party experience", detail: "For bigger kiddies celebrations with coordinated rentals, entertainment and styling.", items: ["Full event planning support", "Themed styling direction", "Entertainment coordination", "Guest experience and event-day management"], price: "Request a quote" },
];

const faqs = [
  ["What ages do you cater for?", "We specialise in children’s parties and celebrations for little ones aged 1–10 years. Activities, themes and party details can be tailored to the age group."],
  ["How much does a party cost?", "Every celebration is different. The final quote depends on the date, venue, number of children and adults, theme and services you choose. Select a package above and message us for a tailored quote."],
  ["Does selecting a date confirm my booking?", "No. The calendar lets you share your preferred date with the team. Your date is only confirmed after Exponair checks availability and agrees the booking with you."],
];

const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function ExponairStorefront() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState("");
  const [form, setForm] = useState({ name: "", email: "", event: "Kiddies birthday party", guests: "", location: "", package: "Big Smiles", details: "" });
  const closeMenu = () => setMenuOpen(false);
  const today = new Date(); today.setHours(0,0,0,0);
  const calendarCells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const count = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({length:count},(_,i)=>i+1)];
  }, [month]);
  const chosenDate = selectedDate ? formatDate(new Date(selectedDate + "T12:00:00")) : "";
  const sendInquiry = () => {
    const message = [
      "Hello Exponair Events Management!",
      "I'd love to enquire about a kiddies event.",
      "Name: " + form.name,
      "Email: " + form.email,
      "Event: " + form.event,
      "Preferred date: " + (chosenDate || "Not selected"),
      "Package: " + form.package,
      "Guests: " + (form.guests || "To be discussed"),
      "Location: " + (form.location || "To be discussed"),
      "Details: " + (form.details || "Please contact me to discuss."),
    ].join("\n");
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  };

  return (
    <main className="exponair">
      <div className="expo-grain" aria-hidden="true" />
      <header className="expo-header">
        <a className="expo-brand" href="#top" aria-label="Exponair home"><span className="expo-monogram">E<span>.</span></span><span className="expo-brand-text"><strong>EXPONAIR</strong><small>KIDDIES PARTIES & CELEBRATIONS</small></span></a>
        <nav className={menuOpen ? "expo-nav is-open" : "expo-nav"} aria-label="Main navigation">
          <a href="#about" onClick={closeMenu}>Our world</a><a href="#services" onClick={closeMenu}>What we do</a><a href="#packages" onClick={closeMenu}>Packages</a><a href="#calendar" onClick={closeMenu}>Book a date</a>
        </nav>
        <a className="expo-header-cta" href="#calendar">Let's plan a party</a>
        <button className="expo-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="expo-hero" id="top">
        <div className="expo-hero-copy">
          <div className="expo-eyebrow"><span /> LAGOS KIDDIES PARTIES · AGES 1–10</div>
          <h1>Big joy for<br /><em>little people.</em></h1>
          <p className="expo-hero-lede">Exponair Events Management Ltd creates fun, beautiful and memorable celebrations for children aged 1–10, with creative themes, thoughtful planning, decorations, entertainment and party rentals.</p>
          <div className="expo-hero-actions"><a className="expo-button expo-button-dark" href="#calendar">Plan a kiddies party</a><a className="expo-text-link" href="#packages">Explore party packages</a></div>
          <div className="expo-hero-foot"><span>PLAY</span><i /><span>IMAGINE</span><i /><span>CELEBRATE</span></div>
        </div>
        <div className="expo-hero-visual"><div className="expo-image-frame"><div className="expo-hero-image" role="img" aria-label="Colourful children's birthday party table and decorations" /><div className="expo-image-caption"><span>MADE FOR LITTLE SMILES</span><span>EVERY DETAIL, A LITTLE MAGIC</span></div></div><div className="expo-stamp"><span>PLAY</span><b>·</b><span>LAUGH</span><b>·</b><span>CELEBRATE</span></div><div className="expo-hero-number">E / 01</div></div>
        <div className="expo-scroll-note"><span /> COME ON IN</div>
      </section>

      <section className="expo-intro" id="about">
        <div className="expo-section-label"><span>01</span> A LITTLE ABOUT US</div>
        <div className="expo-intro-content"><h2>Childhood is full of little milestones.<br /><em>Let's make the celebrations count.</em></h2><div className="expo-intro-bottom"><p>Exponair Events Management Ltd is a Lagos-based kiddies party planning and decoration company. We help parents and families create fun, beautiful and memorable celebrations for children aged 1–10 through creative themes, customised packages, entertainment, rentals and professional coordination.</p><a href="#calendar" className="expo-circle-link">Plan with us</a></div></div>
      </section>

      <section className="expo-services" id="services">
        <div className="expo-section-head"><div><div className="expo-section-label"><span>02</span> THE FUN STARTS HERE</div><h2>Little details.<br /><em>Big celebrations.</em></h2></div><p>Choose individual services or let us bring your child’s whole celebration together. We tailor the details to your child’s age, your ideas and your budget.</p></div>
        <div className="expo-service-list">{services.map((service) => <article className="expo-service" key={service.n}><span className="expo-service-n">{service.n}</span><div className="expo-service-main"><span>{service.tag}</span><h3>{service.title}</h3></div><p>{service.copy}</p><a href="#calendar">Enquire</a></article>)}</div>
      </section>

      <section className="expo-packages" id="packages">
        <div className="expo-section-head"><div><div className="expo-section-label"><span>03</span> PARTY PACKAGES</div><h2>Pick your kind<br /><em>of party magic.</em></h2></div><p>Our celebration packages are customised for each family. Tell us your budget, preferred date and guest count and we will recommend a suitable option.</p></div>
        <div className="expo-package-grid">{packages.map((p) => <article className={p.featured ? "expo-package featured" : "expo-package"} key={p.name}><span className="expo-package-note">{p.note}</span><h3>{p.name}</h3><p>{p.detail}</p><div className="expo-package-price">{p.price}</div><span className="expo-package-includes">PACKAGE HIGHLIGHTS</span><ul>{p.items.map(item=><li key={item}><Check size={14}/>{item}</li>)}</ul><a href="#calendar" onClick={()=>setForm({...form,package:p.name})}>Choose this package</a></article>)}</div>
        <p className="expo-pricing-note">No fixed prices have been published yet. Request a quote for accurate pricing before booking.</p>
      </section>

      <section className="expo-gallery" id="moments"><div className="expo-gallery-head"><div className="expo-section-label"><span>04</span> A WORLD OF WONDER</div><p>A little inspiration for the colourful, creative celebrations we love bringing to life.</p></div><div className="expo-gallery-grid"><article className="expo-moment moment-tall"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=85')"}}/><div className="expo-moment-meta"><span>01 / BIRTHDAY JOY</span><h3>Make a wish.<br />Make it wonderful.</h3></div></article><article className="expo-moment moment-wide"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=1400&q=85')"}}/><div className="expo-moment-meta"><span>02 / SWEET DETAILS</span><h3>All the little things<br />they'll remember.</h3></div></article><article className="expo-moment moment-small"><div className="expo-moment-image" style={{backgroundImage:"url('https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=85')"}}/><div className="expo-moment-meta"><span>03 / PARTY TIME</span><h3>More play.<br />More smiles.</h3></div></article></div><p className="expo-gallery-note">Sample inspiration imagery. Replace with Exponair-approved kiddies event photographs before launch.</p></section>

      <section className="expo-quote"><span className="expo-quote-mark">“</span><blockquote>Every child deserves<br /><em>a celebration to remember.</em></blockquote><span className="expo-quote-rule" /><span className="expo-quote-caption">THE EXPONAIR PROMISE</span></section>

      <section className="expo-faq"><div><div className="expo-section-label"><span>05</span> GOOD TO KNOW</div><h2>Before the<br /><em>party begins.</em></h2><p>A few helpful answers before we start planning your child's special day.</p></div><div className="expo-faq-list">{faqs.map(([q,a],i)=><article className={activeFaq===i?"expo-faq-item active":"expo-faq-item"} key={q}><button onClick={() => setActiveFaq(activeFaq===i?null:i)}><span>0{i+1}</span><b>{q}</b><i aria-hidden="true">{activeFaq===i?"−":"+"}</i></button>{activeFaq===i && <p>{a}</p>}</article>)}</div></section>

      <section className="expo-contact" id="calendar">
        <div className="expo-contact-copy"><div className="expo-section-label"><span>06</span> SAVE YOUR PARTY DATE</div><h2>Let's make<br />their day <em>shine.</em></h2><p>Planning a birthday or special kiddies celebration in Lagos? Choose your preferred date, share your ideas and budget, and send your enquiry directly to our WhatsApp.</p><div className="expo-contact-note"><span>WhatsApp enquiries: +234 802 338 7671</span></div></div>
        <div className="expo-booking-panel">
          <div className="expo-calendar"><div className="expo-calendar-head"><div><span>CHOOSE YOUR PREFERRED DATE</span><strong>{monthNames[month.getMonth()]} {month.getFullYear()}</strong></div><div className="expo-calendar-controls"><button type="button" aria-label="Previous month" disabled={month.getFullYear()===today.getFullYear()&&month.getMonth()===today.getMonth()} onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>Prev</button><button type="button" aria-label="Next month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>Next</button></div></div><div className="expo-calendar-grid">{weekdays.map(d=><span className="expo-calendar-weekday" key={d}>{d}</span>)}{calendarCells.map((day,i)=>{if(!day)return <span key={"blank-"+i}/>;const date=new Date(month.getFullYear(),month.getMonth(),day);const iso=[date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(day).padStart(2,"0")].join("-");const past=date<today;return <button type="button" key={iso} className={(selectedDate===iso?"selected ":"")+(past?"past":"")} disabled={past} onClick={()=>setSelectedDate(iso)} aria-pressed={selectedDate===iso}>{day}</button>})}</div><p className="expo-calendar-note">Select a date to tell us when you'd like to celebrate. This is a date request, not a live availability confirmation.</p><p className="expo-calendar-selected">{chosenDate ? <>Your preferred date: <strong>{chosenDate}</strong></> : "No date selected yet."}</p></div>
          <form className="expo-form" onSubmit={(e)=>{e.preventDefault();sendInquiry();}}>
            <div className="expo-form-top"><span>YOUR PARTY DETAILS</span><span>* REQUIRED</span></div>
            <label>Parent or guardian name *<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name"/></label>
            <label>Email address *<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
            <div className="expo-form-row"><label>Celebration type *<select value={form.event} onChange={e=>setForm({...form,event:e.target.value})}><option>Kiddies birthday party</option><option>Children's themed party</option><option>School or children's celebration</option><option>Other kiddies event</option></select></label><label>Package<select value={form.package} onChange={e=>setForm({...form,package:e.target.value})}>{packages.map(p=><option key={p.name}>{p.name}</option>)}</select></label></div>
            <div className="expo-form-row"><label>Expected guests<input value={form.guests} onChange={e=>setForm({...form,guests:e.target.value})} placeholder="Approximate number"/></label><label>Venue or area<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="City or venue"/></label></div>
            <label>Your budget and party ideas<textarea rows={3} value={form.details} onChange={e=>setForm({...form,details:e.target.value})} placeholder="Child’s age (1–10), theme, budget, rentals or entertainment you have in mind..."/></label>
            <button className="expo-button expo-button-dark expo-submit" type="submit">Send enquiry on WhatsApp</button>
            <p className="expo-form-disclaimer">Your details will be added to a WhatsApp message for you to review and send. Your booking is not confirmed until Exponair replies.</p>
          </form>
        </div>
      </section>

      <footer className="expo-footer"><div className="expo-footer-main"><a className="expo-brand" href="#top"><span className="expo-monogram">E<span>.</span></span><span className="expo-brand-text"><strong>EXPONAIR</strong><small>KIDDIES EVENTS & CELEBRATIONS</small></span></a><p>Little guests.<br/>Big memories.</p><a className="expo-back-top" href="#top">BACK TO TOP</a></div><div className="expo-footer-bottom"><span>© {new Date().getFullYear()} EXPONAIR EVENTS MANAGEMENT LTD</span><span>MADE FOR LITTLE MOMENTS</span><span>KIDDIES PARTIES · CELEBRATIONS</span></div></footer>
      <a className="expo-whatsapp-float" href="https://wa.me/2348023387671?text=Hello%20Exponair%2C%20I%27d%20like%20to%20enquire%20about%20a%20kiddies%20event." target="_blank" rel="noreferrer"><span className="expo-whatsapp-mark">W</span><span>Chat with us</span></a>
    </main>
  );
}
