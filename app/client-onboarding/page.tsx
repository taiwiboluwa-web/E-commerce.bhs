"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, ShieldCheck, Sparkles, Store } from "lucide-react";

const featureOptions = ["Online product catalogue", "Shopping cart & checkout", "Online payments", "Order management", "Customer accounts", "Delivery & shipping setup", "Discounts & promo codes", "Inventory management", "Analytics & reports", "WhatsApp ordering", "Blog / content pages", "Multiple staff accounts"];
const steps = ["Your business", "Your storefront", "What you need", "Review"];

export default function ClientOnboardingPage() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    businessName:"", contactName:"", email:"", phone:"", whatsapp:"", category:"", description:"",
    storefrontName:"", preferredSlug:"", currentSalesChannel:"", productCount:"", features:[] as string[],
    designPreference:"", storageNeed:"", launchTimeline:"", budgetRange:"", specialRequirements:"",
    contactConsent:false, website:""
  });
  const update = (key:string, value:string|boolean) => setForm(current => ({...current,[key]:value}));
  const toggleFeature = (feature:string) => setForm(current => ({...current,features:current.features.includes(feature)?current.features.filter(x=>x!==feature):[...current.features,feature]}));
  const canContinue = useMemo(() => {
    if (step===0) return !!(form.businessName.trim() && form.contactName.trim() && form.email.trim() && form.phone.trim() && form.category);
    if (step===1) return !!(form.storefrontName.trim() && form.currentSalesChannel && form.productCount);
    if (step===2) return form.features.length>0 && !!form.launchTimeline;
    return form.contactConsent;
  },[form,step]);
  const submit = async (event:FormEvent) => {
    event.preventDefault(); setError("");
    if (!form.contactConsent) { setError("Please confirm that BlueHaven Studios may contact you about this application."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/client-onboarding",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn't submit your application. Please try again.");
      setDone(true);
    } catch (e) { setError(e instanceof Error?e.message:"Submission failed. Please try again."); }
    finally { setBusy(false); }
  };
  const Field = ({label,children,required=false,hint}:{label:string;children:React.ReactNode;required?:boolean;hint?:string}) => <label className="onboard-field"><span>{label}{required&&<i> *</i>}</span>{children}{hint&&<small>{hint}</small>}</label>;
  if (done) return <main className="onboard-shell"><div className="onboard-glow"/><section className="onboard-success"><div className="onboard-success-icon"><CheckCircle2 size={34}/></div><span className="onboard-eyebrow">APPLICATION RECEIVED</span><h1>We’ve got the details.</h1><p>Thank you for considering BlueHaven Studios. Your onboarding response has been submitted for review. Our team will contact you using the details you provided.</p><div className="onboard-reassurance"><ShieldCheck size={17}/> Your submission is private and will only be used to review your storefront request.</div><a href="/" className="onboard-home-link">Return to BlueHaven Commerce</a></section><footer className="onboard-footer">BLUEHAVEN STUDIOS <span>·</span> CREATIVITY BEYOND LIMITS</footer></main>;
  return <main className="onboard-shell"><div className="onboard-glow"/><header className="onboard-header"><a href="/" className="onboard-brand"><span className="onboard-brand-mark">b<span>.</span></span><span><b>BLUEHAVEN</b><small>STUDIOS</small></span></a><div className="onboard-header-note"><ShieldCheck size={15}/> SECURE CLIENT INTAKE</div></header>
    <div className="onboard-wrap"><section className="onboard-intro"><span className="onboard-eyebrow"><Sparkles size={13}/> LET’S BUILD YOUR STORE</span><h1>Your business deserves<br/><em>a beautiful storefront.</em></h1><p>Tell us a little about your business and what you want to achieve. We’ll use your answers to shape the right commerce experience for you.</p><div className="onboard-trust"><span><Check size={14}/> Takes about 4–6 minutes</span><span><Check size={14}/> Human review before approval</span></div></section>
    <section className="onboard-form-card"><div className="onboard-form-top"><div><span className="onboard-form-kicker">CLIENT ONBOARDING</span><h2>{steps[step]}</h2></div><span className="onboard-step-count">0{step+1} <i>/ 04</i></span></div>
      <div className="onboard-progress">{steps.map((name,index)=><div key={name} className={index<=step?"onboard-progress-segment active": "onboard-progress-segment"}/>)}</div><div className="onboard-step-labels">{steps.map((name,index)=><span key={name} className={index===step?"current":""}>{name}</span>)}</div>
      <form onSubmit={submit} onKeyDown={e=>{if(e.key==="Enter" && step<3 && (e.target as HTMLElement).tagName!=="TEXTAREA") e.preventDefault();}}>
        {step===0&&<div className="onboard-fields"><p className="onboard-section-help">First, help us understand who we’ll be working with.</p>
          <Field label="Business / brand name" required><input value={form.businessName} onChange={e=>update("businessName",e.target.value)} placeholder="e.g. The Everyday Store" required maxLength={120}/></Field>
          <Field label="Your full name" required><input value={form.contactName} onChange={e=>update("contactName",e.target.value)} placeholder="Name of the primary contact" required maxLength={120}/></Field>
          <div className="onboard-two-col"><Field label="Business email address" required><input type="email" value={form.email} onChange={e=>update("email",e.target.value)} placeholder="you@yourbusiness.com" required maxLength={180}/></Field><Field label="Phone number" required><input type="tel" value={form.phone} onChange={e=>update("phone",e.target.value)} placeholder="+234 800 000 0000" required maxLength={40}/></Field></div>
          <Field label="WhatsApp number" hint="If different from your phone number."><input type="tel" value={form.whatsapp} onChange={e=>update("whatsapp",e.target.value)} placeholder="+234 800 000 0000" maxLength={40}/></Field>
          <Field label="What industry or category best describes your business?" required><select value={form.category} onChange={e=>update("category",e.target.value)} required><option value="">Choose a category</option>{["Fashion & clothing","Beauty & personal care","Food, groceries & beverages","Electronics & gadgets","Home, furniture & lifestyle","Health & wellness","Books, learning & stationery","Toys, games & baby products","Events & services","Automotive","Arts, crafts & handmade","General retail","Other"].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Tell us briefly about your business" hint="What do you sell or offer, and who are your customers?"><textarea value={form.description} onChange={e=>update("description",e.target.value)} placeholder="A short introduction to your business..." rows={3} maxLength={1200}/></Field>
        </div>}
        {step===1&&<div className="onboard-fields"><p className="onboard-section-help">Let’s give your online shop its identity.</p>
          <Field label="What name should appear on your storefront?" required><input value={form.storefrontName} onChange={e=>update("storefrontName",e.target.value)} placeholder="Your preferred online store name" required maxLength={100}/></Field>
          <Field label="Do you have a preferred storefront web address?" hint="Optional. Example: yourbrand. We’ll confirm availability before setup."><div className="onboard-slug-input"><input value={form.preferredSlug} onChange={e=>update("preferredSlug",e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} placeholder="yourbrand"/><span>.bluehaven.store</span></div></Field>
          <Field label="Where do you currently sell?" required><select value={form.currentSalesChannel} onChange={e=>update("currentSalesChannel",e.target.value)} required><option value="">Choose one</option>{["Physical shop / walk-in customers","Instagram, Facebook or TikTok","WhatsApp / direct messages","Jumia, Konga or another marketplace","My own website","I’m just starting / not selling yet","A combination of these"].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Approximately how many products or services will you list?" required><select value={form.productCount} onChange={e=>update("productCount",e.target.value)} required><option value="">Choose an estimate</option>{["1–10","11–50","51–100","101–500","501–1,000","More than 1,000","Not sure yet"].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Do you already have a logo, brand colours or product photos?"><select value={form.designPreference} onChange={e=>update("designPreference",e.target.value)}><option value="">Choose an option</option>{["Yes, I have all brand assets ready","I have a logo and some product photos","I have photos but need help with branding","I need help creating the visual identity","I’m not sure yet"].map(x=><option key={x}>{x}</option>)}</select></Field>
        </div>}
        {step===2&&<div className="onboard-fields"><p className="onboard-section-help">Choose the tools that would make running your business easier. You can select more than one.</p>
          <div className="onboard-feature-grid">{featureOptions.map(feature=><button type="button" key={feature} onClick={()=>toggleFeature(feature)} className={form.features.includes(feature)?"onboard-feature selected":"onboard-feature"}><span className="onboard-feature-check">{form.features.includes(feature)&&<Check size={12}/>}</span>{feature}</button>)}</div>
          <Field label="How much media storage do you think you’ll need?" hint="This helps us recommend an appropriate plan."><select value={form.storageNeed} onChange={e=>update("storageNeed",e.target.value)}><option value="">Not sure yet</option>{["Up to 2 GB","2–5 GB","5–20 GB","20–50 GB","More than 50 GB","I need guidance"].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="When would you like your storefront to go live?" required><select value={form.launchTimeline} onChange={e=>update("launchTimeline",e.target.value)} required><option value="">Choose a timeline</option>{["As soon as possible","Within 1–2 weeks","Within 1 month","Within 2–3 months","Just researching for now"].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Do you have an estimated monthly budget for your online store?"><select value={form.budgetRange} onChange={e=>update("budgetRange",e.target.value)}><option value="">Prefer to discuss</option>{["Below ₦10,000","₦10,000–₦25,000","₦25,000–₦50,000","₦50,000–₦100,000","Above ₦100,000","I need help choosing a plan"].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Anything else we should know?" hint="Special integrations, delivery arrangements, design references or other requirements."><textarea value={form.specialRequirements} onChange={e=>update("specialRequirements",e.target.value)} placeholder="Share any extra details that will help us plan..." rows={4} maxLength={2000}/></Field>
        </div>}
        {step===3&&<div className="onboard-fields"><p className="onboard-section-help">Please review your details before sending your application.</p>
          <div className="onboard-review-group"><span>BUSINESS & CONTACT</span><div><b>{form.businessName}</b><small>{form.contactName} · {form.email} · {form.phone}</small><small>{form.category}</small></div></div>
          <div className="onboard-review-group"><span>STOREFRONT</span><div><b>{form.storefrontName}</b><small>{form.preferredSlug?form.preferredSlug+".bluehaven.store":"No preferred address"} · {form.currentSalesChannel}</small><small>{form.productCount} products / services</small></div></div>
          <div className="onboard-review-group"><span>REQUESTED CAPABILITIES</span><div className="onboard-review-tags">{form.features.map(x=><i key={x}>{x}</i>)}</div></div>
          <div className="onboard-review-group"><span>LAUNCH & PLAN</span><div><b>{form.launchTimeline}</b><small>Storage: {form.storageNeed||"To be discussed"} · Budget: {form.budgetRange||"To be discussed"}</small></div></div>
          <label className="onboard-consent"><input type="checkbox" checked={form.contactConsent} onChange={e=>update("contactConsent",e.target.checked)}/><span>I confirm that the information above is accurate and agree that BlueHaven Studios may contact me about this storefront application. <b>Required.</b></span></label>
          <div className="onboard-privacy"><ShieldCheck size={16}/> Your information is submitted privately for human review. Submitting this form does not automatically create a store or activate a paid plan.</div>
          <div className="onboard-honeypot" aria-hidden="true"><label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>update("website",e.target.value)}/></label></div>
        </div>}
        {error&&<div className="onboard-error" role="alert">{error}</div>}
        <div className="onboard-form-actions">{step>0?<button type="button" className="onboard-back" onClick={()=>setStep(s=>s-1)}><ArrowLeft size={15}/> Back</button>:<span className="onboard-required-note">* Required fields</span>}
          {step<3?<button type="button" className="onboard-next" disabled={!canContinue} onClick={()=>{setError("");setStep(s=>s+1)}}>Continue <ArrowRight size={16}/></button>:<button type="submit" className="onboard-next" disabled={!canContinue||busy}>{busy?"Submitting…":"Submit application"} <ArrowRight size={16}/></button>}
        </div>
      </form>
    </section><div className="onboard-bottom-note"><ShieldCheck size={15}/> Human approval before every storefront setup <span>·</span> Your details stay private</div></div><footer className="onboard-footer">© {new Date().getFullYear()} BLUEHAVEN STUDIOS <span>·</span> CREATIVITY BEYOND LIMITS</footer></main>;
}
