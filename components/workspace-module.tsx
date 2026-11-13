"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Check, ChevronDown, CircleAlert, KeyRound, LockKeyhole, Plus, RefreshCw, Save, ShieldCheck, Store, X } from "lucide-react";

type Row = Record<string, any>;
type Data = {tenants:Row[];products:Row[];orders:Row[];customers:Row[];subscriptions:Row[];payments:Row[];features:Row[];settings:Row[];activity:Row[];admins:Row[];counts:Row};
const empty:Data={tenants:[],products:[],orders:[],customers:[],subscriptions:[],payments:[],features:[],settings:[],activity:[],admins:[],counts:{}};
const money=(minor:any,currency="NGN")=>new Intl.NumberFormat("en-NG",{style:"currency",currency:String(currency||"NGN").trim(),maximumFractionDigits:2}).format(Number(minor||0)/100);
const date=(value:any)=>value?new Intl.DateTimeFormat("en-NG",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"—";
const bytes=(n:any)=>{const v=Number(n||0);if(v<1024)return v+" B";if(v<1048576)return (v/1024).toFixed(1)+" KB";if(v<1073741824)return (v/1048576).toFixed(1)+" MB";return (v/1073741824).toFixed(2)+" GB";};
const daysLeft=(value:any)=>value?Math.max(0,Math.ceil((new Date(value).getTime()-Date.now())/86400000)):null;

export default function WorkspaceModule({section}:{section:string}) {
 const [data,setData]=useState<Data>(empty),[unlocked,setUnlocked]=useState(false),[key,setKey]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState(""),[query,setQuery]=useState(""),[showCreate,setShowCreate]=useState(false);
 const [form,setForm]=useState({name:"",slug:"",category:"",storefront_url:"",product_name:"",product_slug:"",tenant_id:"",price:"",sku:"",stock:"0",feature_key:"",label:""});
 const [timerDays,setTimerDays]=useState<Record<string,number>>({});
 const [storageGb,setStorageGb]=useState<Record<string,number>>({});
 const settingMap=useMemo(()=>Object.fromEntries(data.settings.map(x=>[x.setting_key,x.setting_value])),[data.settings]);
 const refresh=async()=>{setLoading(true);setError("");try{const r=await fetch("/api/workspace",{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error||"Unable to load workspace.");setData(j);setUnlocked(true);}catch(e){setUnlocked(false);setError(e instanceof Error?e.message:"Workspace request failed.");}finally{setLoading(false);}};
 useEffect(()=>{refresh();},[]);
 async function unlock(e:FormEvent){e.preventDefault();setLoading(true);setError("");try{const r=await fetch("/api/workspace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Access denied.");setKey("");await refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to unlock.");setLoading(false);}}
 async function update(payload:Row){setLoading(true);setError("");setNotice("");try{const r=await fetch("/api/workspace",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw new Error(j.error||"Update failed.");setNotice(payload.action==="tenant_storage_compress" ? `Platform originals compressed. ${Number(j.result?.processed||0)} image(s) processed; ${bytes(j.result?.savedBytes||0)} physical storage saved. Client quota usage was not changed.` : "Saved successfully.");await refresh();}catch(e){setError(e instanceof Error?e.message:"Update failed.");}finally{setLoading(false);}}
 async function logout(){await fetch("/api/workspace",{method:"DELETE"});setUnlocked(false);setData(empty);}
 const filtered=(rows:Row[],keys:string[])=>rows.filter(row=>keys.some(k=>String(row[k]??"").toLowerCase().includes(query.toLowerCase())));
 const addTenant=async(e:FormEvent)=>{e.preventDefault();await update({action:"create_tenant",name:form.name,slug:form.slug,category:form.category,storefront_url:form.storefront_url});setShowCreate(false);setForm({...form,name:"",slug:"",category:"",storefront_url:""});};
 const addProduct=async(e:FormEvent)=>{e.preventDefault();await update({action:"create_product",tenant_id:form.tenant_id,name:form.product_name,slug:form.product_slug,price_minor:Math.round(Number(form.price)*100),sku:form.sku,stock_quantity:Number(form.stock)});setShowCreate(false);setForm({...form,product_name:"",product_slug:"",price:"",sku:"",stock:"0"});};
 const addFeature=async(e:FormEvent)=>{e.preventDefault();await update({action:"create_feature",feature_key:form.feature_key,label:form.label});setShowCreate(false);setForm({...form,feature_key:"",label:""});};
 const title=section;
 if(!unlocked)return <section className="wm-lock"><div className="wm-lock-icon"><KeyRound size={24}/></div><span className="wm-kicker">MASTER WORKSPACE / PRIVATE ACCESS</span><h2>Unlock platform control.</h2><p>{error||"Sign in with the private master workspace key to access tenant and commerce records."}</p><form onSubmit={unlock}><label htmlFor="wm-key">Master access key</label><input id="wm-key" type="password" value={key} onChange={e=>setKey(e.target.value)} autoComplete="current-password" placeholder="Enter your private key" required/><button disabled={loading||!key.trim()}>{loading?"Verifying…":"Unlock workspace"}</button></form><small><LockKeyhole size={13}/> Access is protected by a server-side session cookie.</small></section>;

 const table=(headers:string[],rows:Row[],render:(r:Row)=>any,emptyText:string)=> <div className="wm-table-wrap">{rows.length?<table className="wm-table"><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r.id||r.email||i}>{render(r)}</tr>)}</tbody></table>:<div className="wm-empty"><Store size={22}/><b>{emptyText}</b><span>When genuine platform records exist, they will appear here.</span></div>}</div>;
 const td=(value:any)=> <td>{value??"—"}</td>;
 const badge=(value:string)=><span className={"wm-badge "+String(value||"").toLowerCase()}>{value||"—"}</span>;

 return <section className="wm-module">
  <div className="wm-toolbar"><div><span className="wm-kicker">LIVE PLATFORM RECORDS</span><h2>{title}</h2><p>Connected to the BlueHaven Commerce database. No sample records.</p></div><div className="wm-actions"><input aria-label="Search records" value={query} onChange={e=>setQuery(e.target.value)} placeholder={"Search "+title.toLowerCase()+"…"}/><button onClick={refresh} disabled={loading}><RefreshCw size={14}/> Refresh</button><button onClick={logout}><LockKeyhole size={14}/> Lock</button></div></div>
  {error&&<div className="wm-alert"><CircleAlert size={15}/>{error}</div>}{notice&&<div className="wm-notice"><Check size={15}/>{notice}</div>}
  {section==="Overview"&&<><div className="wm-summary"><div><small>STOREFRONTS</small><b>{data.counts.storefronts||0}</b></div><div><small>PRODUCTS</small><b>{data.counts.products||0}</b></div><div><small>ORDERS</small><b>{data.counts.orders||0}</b></div><div><small>CUSTOMERS</small><b>{data.counts.customers||0}</b></div><div><small>SUBSCRIPTIONS</small><b>{data.counts.subscriptions||0}</b></div><div><small>VERIFIED PAYMENTS</small><b>{data.counts.payments||0}</b></div></div><div className="wm-section-head"><h3>Recent platform activity</h3><span className="wm-live">DATABASE CONNECTED</span></div>{table(["ACTION","ENTITY","RECORD","WHEN"],data.activity,r=><>{td(r.action)}{td(r.entity_type)}{td(r.entity_id||"—")}{td(date(r.created_at))}</>,"No platform activity has been recorded yet.")}</>}
  {section==="Storefronts"&&<><div className="wm-summary"><div><small>CONNECTED STOREFRONTS</small><b>{data.tenants.length}</b></div><div><small>ACTIVE</small><b>{data.tenants.filter(x=>x.status==="active").length}</b></div><div><small>SETUP / SUSPENDED</small><b>{data.tenants.filter(x=>x.status!=="active").length}</b></div></div><div className="wm-section-head"><h3>Tenant registry</h3><button onClick={()=>setShowCreate(!showCreate)}><Plus size={14}/> Add storefront</button></div>{showCreate&&<form className="wm-create" onSubmit={addTenant}><input required placeholder="Business / tenant name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required placeholder="storefront-slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-")})}/><input placeholder="Business category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><input placeholder="HTTPS storefront URL (optional)" value={form.storefront_url} onChange={e=>setForm({...form,storefront_url:e.target.value})}/><button disabled={loading}>Create tenant</button></form>}{table(["BUSINESS","SLUG","STATUS","STOREFRONT URL","ACCESS TIMER","PRODUCTS","ORDERS","STORAGE"],filtered(data.tenants,["name","slug","storefront_url"]),r=><>{td(<><b>{r.name}</b><small>{r.category||"Uncategorised"}</small></>)}{td(r.slug)}<td><select value={r.status} onChange={e=>update({action:"tenant",id:r.id,field:"status",value:e.target.value})}>{["setup","active","suspended"].map(s=><option key={s}>{s}</option>)}</select></td><td><input className="wm-inline-input" defaultValue={r.storefront_url||""} placeholder="https://…" onBlur={e=>{if(e.target.value!==(r.storefront_url||""))update({action:"tenant",id:r.id,field:"storefront_url",value:e.target.value});}}/></td><td><div className="wm-access-timer"><label><span>Duration (days)</span><input type="number" min="1" max="3650" value={timerDays[r.id]??Number(r.access_duration_days||30)} onChange={e=>setTimerDays(current=>({...current,[r.id]:Number(e.target.value)}))}/></label><b>{r.access_expires_at?(daysLeft(r.access_expires_at)===0?"Expired":daysLeft(r.access_expires_at)+" days left"):"Not started"}</b><small>{r.access_expires_at?"Expires "+date(r.access_expires_at):"No expiry scheduled"}</small><div className="wm-access-actions"><button type="button" onClick={()=>update({action:"tenant_access",mode:"enable_and_restart",id:r.id,days:timerDays[r.id]??Number(r.access_duration_days||30)})}>{r.status==="active"&&r.access_expires_at?"Renew & restart":"Enable & start"}</button><button type="button" className="wm-access-stop" onClick={()=>update({action:"tenant_access",mode:"suspend_now",id:r.id})}>Disable now</button></div></div></td>{td(r.product_count)}{td(r.order_count)}{td(<div className="wm-storage-control"><b>{bytes(r.storage_used_bytes)} used</b><small>of {bytes(r.storage_capacity_bytes)} allocated</small><label>Client capacity (GB)<input type="number" min="0.1" max="10240" step="0.1" value={storageGb[r.id]??(Number(r.storage_capacity_bytes||0)/1073741824).toFixed(2)} onChange={e=>setStorageGb(current=>({...current,[r.id]:e.target.value}))}/></label><button type="button" disabled={loading} onClick={()=>update({action:"tenant_storage",id:r.id,capacity_gb:Number(storageGb[r.id]??(Number(r.storage_capacity_bytes||0)/1073741824).toFixed(2))})}>Save allocation</button></div>)}</>}, "No storefronts have been provisioned yet.")}</>}
  {section==="Products"&&<><div className="wm-section-head"><h3>Product catalogue</h3><button onClick={()=>setShowCreate(!showCreate)} disabled={!data.tenants.length}><Plus size={14}/> Add product</button></div>{showCreate&&<form className="wm-create" onSubmit={addProduct}><select required value={form.tenant_id} onChange={e=>setForm({...form,tenant_id:e.target.value})}><option value="">Choose storefront</option>{data.tenants.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select><input required placeholder="Product name" value={form.product_name} onChange={e=>setForm({...form,product_name:e.target.value})}/><input required placeholder="product-slug" value={form.product_slug} onChange={e=>setForm({...form,product_slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-")})}/><input required type="number" min="0" step="0.01" placeholder="Price (NGN)" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/><input placeholder="SKU" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/><input type="number" min="0" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/><button disabled={loading}>Create product</button></form>}{table(["PRODUCT","STOREFRONT","PRICE","SKU","STOCK","PUBLISHED"],filtered(data.products,["name","slug","tenant_name","sku"]),r=><>{td(<><b>{r.name}</b><small>{r.slug}</small></>)}{td(r.tenant_name)}{td(money(r.price_minor,r.currency))}{td(r.sku)}<td><input className="wm-stock" type="number" min="0" defaultValue={r.stock_quantity} onBlur={e=>{if(Number(e.target.value)!==r.stock_quantity)update({action:"product",id:r.id,field:"stock_quantity",value:Number(e.target.value)});}}/></td><td><label className="wm-switch"><input type="checkbox" checked={r.is_published} onChange={e=>update({action:"product",id:r.id,field:"is_published",value:e.target.checked})}/><span/></label></td></>, "No products have been added yet.")}</>}
  {section==="Orders"&&<>{table(["ORDER","CUSTOMER","STOREFRONT","TOTAL","STATUS","PLACED"],filtered(data.orders,["order_number","customer_name","customer_email","tenant_name"]),r=><>{td(<><b>{r.order_number}</b><small>{Array.isArray(r.items)?r.items.length+" line items":"Order"}</small></>)}{td(<><b>{r.customer_name}</b><small>{r.customer_email||r.customer_phone||"No contact"}</small></>)}{td(r.tenant_name)}{td(money(r.total_minor,r.currency))}<td><select value={r.status} onChange={e=>update({action:"order",id:r.id,status:e.target.value})}>{["pending","paid","processing","fulfilled","cancelled","refunded"].map(s=><option key={s}>{s}</option>)}</select></td>{td(date(r.created_at))}</>, "No orders have been received yet.")}</>}
  {section==="Customers"&&<>{table(["CUSTOMER","EMAIL","PHONE","ORDERS","LIFETIME VALUE","LAST ORDER"],filtered(data.customers,["name","email","phone"]),r=><>{td(r.name)}{td(r.email)}{td(r.phone)}{td(r.order_count)}{td(money(r.lifetime_value,"NGN"))}{td(date(r.last_order_at))}</>, "Customer records will be created from completed storefront activity.")}</>}
  {section==="Subscriptions"&&<>{table(["TENANT","PLAN","PROVIDER","STATUS","PERIOD ENDS","LAST PAYMENT"],filtered(data.subscriptions,["tenant_name","plan_code","provider","status"]),r=><>{td(r.tenant_name)}{td(r.plan_code)}{td(r.provider)}<td>{badge(r.status)}</td>{td(date(r.current_period_end))}{td(date(r.last_payment_at))}</>, "No subscriptions have been created. Billing activation requires a verified payment-provider connection.")}<div className="wm-footnote">Subscription status is displayed from the billing database. This workspace does not manually mark invoices paid or override provider verification.</div></>}
  {section==="Payments"&&<>{table(["REFERENCE","TENANT","PROVIDER","AMOUNT","STATUS","PAID AT"],filtered(data.payments,["provider_reference","tenant_name","provider","status"]),r=><>{td(r.provider_reference)}{td(r.tenant_name)}{td(r.provider)}{td(money(r.amount_minor,r.currency))}<td>{badge(r.status)}</td>{td(date(r.paid_at))}</>, "No verified payment events have been recorded.")}<div className="wm-footnote">This ledger is read-only. Payment records must be written by a verified provider webhook; manual entries are intentionally disabled.</div></>}
  {section==="Feature controls"&&(
    <>
      <div className="wm-section-head">
        <h3>Storage allocation</h3>
        <span className="wm-live">PLATFORM OWNER ONLY</span>
      </div>
      <p className="wm-footnote">
        Only your master workspace can change a client's storage quota. Client usage is measured using original upload sizes. Platform compression removes private originals after optimized versions are ready, reducing physical storage without changing the client's displayed usage. Only deleting media from the client profile releases quota.
      </p>
      {table(
        ["CLIENT","USAGE","TOTAL ALLOCATION","ACTIVE ADD-ON"],
        filtered(data.tenants,["name","slug"]),
        r => (
          <>
            {td(<><b>{r.name}</b><small>{r.slug}</small></>)}
            {td(<div className="wm-storage-control"><b>{bytes(r.storage_used_bytes)}</b><small>Original upload quota</small></div>)}
            {td(
              <div className="wm-storage-control">
                <b>{bytes(r.storage_capacity_bytes)}</b>
                <label>New total capacity (GB)
                  <input type="number" min="0.1" max="10240" step="0.1"
                    value={storageGb[r.id] ?? (Number(r.storage_capacity_bytes || 0) / 1073741824)}
                    onChange={e => setStorageGb(current => ({...current,[r.id]:Number(e.target.value)}))}
                  />
                </label>
                <button type="button" disabled={loading}
                  onClick={() => update({action:"tenant_storage",id:r.id,capacity_gb:storageGb[r.id] ?? (Number(r.storage_capacity_bytes || 0) / 1073741824)})}>
                  Save allocation
                </button>
                <button type="button" disabled={loading}
                  onClick={() => update({action:"tenant_storage_compress",id:r.id})}>
                  Compress platform originals
                </button>
              </div>
            )}
            {td(bytes(r.storage_addon_bytes || 0))}
          </>
        ),
        "No client storefronts are available for storage allocation."
      )}
      <div className="wm-section-head">
        <h3>Client admin accounts</h3>
        <span className="wm-live">{data.admins.length} PROVISIONED</span>
      </div>
      {table(
        ["CLIENT","ADMIN EMAIL","ACCESS","LAST SIGN-IN","CREATED"],
        filtered(data.admins,["tenant_name","email"]),
        r => (
          <>
            {td(r.tenant_name)}
            {td(r.email)}
            <td>{badge(r.is_active ? "active" : "disabled")}</td>
            {td(date(r.last_login_at))}
            {td(date(r.created_at))}
          </>
        ),
        "No client admin accounts have been provisioned yet."
      )}
      <div className="wm-footnote">
        Admin accounts are listed from the secure users table. Password creation and reset will be enabled with the tenant sign-in flow so credentials are issued and verified safely.
      </div>
      <div className="wm-section-head">
        <h3>Platform feature catalogue</h3>
        <button onClick={() => setShowCreate(!showCreate)}><Plus size={14}/> Add feature</button>
      </div>
      {showCreate && (
        <form className="wm-create" onSubmit={addFeature}>
          <input required placeholder="Feature key (e.g. custom_domain)" value={form.feature_key}
            onChange={e => setForm({...form,feature_key:e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,"")})}/>
          <input required placeholder="Display label" value={form.label}
            onChange={e => setForm({...form,label:e.target.value})}/>
          <button disabled={loading}>Create feature</button>
        </form>
      )}
      {table(
        ["FEATURE","SCOPE","STATE","LAST UPDATED"],
        filtered(data.features,["feature_key","label","tenant_name"]),
        r => (
          <>
            {td(<><b>{r.label}</b><small>{r.feature_key}</small></>)}
            {td(r.tenant_name || "Global")}
            <td><label className="wm-switch"><input type="checkbox" checked={r.enabled} onChange={e=>update({action:"feature",id:r.id,enabled:e.target.checked})}/><span/></label></td>
            {td(date(r.updated_at))}
          </>
        ),
        "No feature controls have been configured yet."
      )}
      <div className="wm-footnote">
        Feature switches are saved as platform entitlements. Each tenant-facing feature must check its entitlement before release; unconnected enforcement is not represented as active.
      </div>
    </>
  )}{section==="Settings"&&<><div className="wm-settings"><div><h3>Platform identity</h3><label>Platform name<input defaultValue={settingMap.platform_name||"BLUEHAVEN STUDIOS"} onBlur={e=>update({action:"setting",key:"platform_name",value:e.target.value})}/></label><label>Default currency<select defaultValue={settingMap.default_currency||"NGN"} onChange={e=>update({action:"setting",key:"default_currency",value:e.target.value})}><option>NGN</option><option>USD</option><option>GBP</option><option>EUR</option></select></label><label>Support email<input type="email" defaultValue={settingMap.support_email||""} placeholder="support@bluehaven…" onBlur={e=>update({action:"setting",key:"support_email",value:e.target.value})}/></label></div><div><h3>Platform operations</h3><label>Included storage capacity (bytes)<input type="number" min="0" defaultValue={settingMap.included_storage_bytes||2147483648} onBlur={e=>update({action:"setting",key:"included_storage_bytes",value:Number(e.target.value)})}/></label><p className="wm-footnote">Changing this setting stores the platform default for future provisioning. Existing tenant capacity is not retroactively changed.</p><label className="wm-setting-switch">Maintenance mode <input type="checkbox" checked={settingMap.maintenance_mode===true} onChange={e=>update({action:"setting",key:"maintenance_mode",value:e.target.checked})}/></label><p className="wm-footnote">Maintenance mode is recorded as a platform setting. It does not yet block public storefront traffic.</p></div></div></>}
  <div className="wm-data-foot"><span><ShieldCheck size={14}/> Protected master session</span><span>Last refreshed on demand</span></div>
 </section>;
}
