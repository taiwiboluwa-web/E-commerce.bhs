"use client";
import { useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Bell, Box, ChevronDown, CircleHelp, Command, CreditCard, ExternalLink, Eye, LayoutDashboard, LifeBuoy, LogOut, MoreHorizontal, Package, Plus, Search, Settings2, ShieldCheck, ShoppingBag, ShoppingCart, Store, Users, Wallet, Zap } from "lucide-react";

const stores = [
  { name: "Northstar Goods", slug: "northstar", category: "Lifestyle & home", status: "Active", revenue: "₦4,820,500", orders: 284, products: 48, growth: "+18.6%", initials: "NG", tone: "lavender" },
  { name: "The Daily Edit", slug: "daily-edit", category: "Fashion & apparel", status: "Active", revenue: "₦3,140,000", orders: 196, products: 72, growth: "+12.4%", initials: "DE", tone: "peach" },
  { name: "Morrow Skin", slug: "morrow-skin", category: "Beauty & wellness", status: "Active", revenue: "₦2,760,800", orders: 173, products: 36, growth: "+9.2%", initials: "MS", tone: "mint" },
  { name: "Form & Function", slug: "form-function", category: "Furniture", status: "Trial", revenue: "₦1,240,000", orders: 82, products: 24, growth: "+6.8%", initials: "FF", tone: "blue" },
  { name: "Sunday Supply", slug: "sunday-supply", category: "Food & provisions", status: "Active", revenue: "₦980,500", orders: 61, products: 31, growth: "+4.1%", initials: "SS", tone: "yellow" }
];
const activity = [
  { title: "New order received", detail: "Northstar Goods · Order #NS-0284", time: "4 min ago", amount: "₦84,500", icon: ShoppingBag },
  { title: "Subscription renewed", detail: "The Daily Edit · Growth plan", time: "38 min ago", amount: "₦25,000", icon: CreditCard },
  { title: "New storefront created", detail: "Sunday Supply · Added by you", time: "2 hrs ago", amount: "", icon: Store },
  { title: "Product inventory updated", detail: "Morrow Skin · 8 products", time: "3 hrs ago", amount: "", icon: Package }
];
const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Storefronts", icon: Store, count: "10" },
  { label: "Orders", icon: ShoppingCart },
  { label: "Products", icon: Package },
  { label: "Customers", icon: Users },
  { label: "Subscriptions", icon: Wallet },
];
export default function Home() {
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("Last 30 days");
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => stores.filter(s => (s.name + s.category + s.slug).toLowerCase().includes(query.toLowerCase())), [query]);
  const choose = (label: string) => { setActive(label); if (label !== "Overview" && label !== "Storefronts") setNotice(label + " workspace is being prepared for the next build phase."); else setNotice(""); };
  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">b<span>.</span></div><div><strong>bluehaven</strong><small>COMMERCE PLATFORM</small></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className="workspace-switch"><div className="workspace-icon"><Command size={16}/></div><span><b>BlueHaven Commerce</b><small>Master workspace</small></span><ChevronDown size={15}/></button>
      <div className="nav-label">PLATFORM</div>
      <nav>{nav.map(item => <button key={item.label} onClick={() => choose(item.label)} className={active === item.label ? "nav-item selected" : "nav-item"}><item.icon size={17}/><span>{item.label}</span>{item.count && <em>{item.count}</em>}</button>)}</nav>
      <div className="nav-label manage-label">MANAGE</div>
      <nav>
        <button className={active === "Analytics" ? "nav-item selected" : "nav-item"} onClick={() => choose("Analytics")}><Activity size={17}/><span>Analytics</span></button>
        <button className={active === "Settings" ? "nav-item selected" : "nav-item"} onClick={() => choose("Settings")}><Settings2 size={17}/><span>Platform settings</span></button>
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><LifeBuoy size={17}/></div><b>Need a hand?</b><p>Our team is here to help you build better commerce.</p><button onClick={() => setNotice("Support centre will be connected in a later phase.")}>Visit support <ExternalLink size={12}/></button></div><div className="profile"><div className="avatar">TP</div><div><b>Taiwo Boluwatife</b><small>Platform owner</small></div><MoreHorizontal size={17}/></div></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>BlueHaven Commerce</span><b>/</b><strong>{active}</strong></div><div className="top-actions"><div className="system-status"><i/> All systems operational</div><button className="icon-btn" aria-label="Help"><CircleHelp size={18}/></button><button className="icon-btn notification" aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">TP</div></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">FRIDAY, 06 NOVEMBER 2026 <span>·</span> MASTER CONTROL</div><h1>{active === "Overview" ? "Good morning, Taiwo." : active}</h1><p>{active === "Overview" ? "Here’s what’s happening across your commerce network." : "Manage and monitor your BlueHaven Commerce network."}</p></div><div className="heading-actions"><button className="secondary-btn" onClick={() => setNotice("Your storefront preview will be available when a tenant storefront is configured.")}><Eye size={15}/> Preview network</button><button className="primary-btn" onClick={() => setNotice("Store creation flow is next on the build roadmap.")}><Plus size={16}/> Create storefront</button></div></div>
        {notice && <div className="notice"><ShieldCheck size={16}/><span>{notice}</span><button onClick={() => setNotice("")}>Dismiss</button></div>}
        <div className="metric-grid">
          <div className="metric-card"><div className="metric-top"><span>Total gross sales</span><span className="metric-icon violet"><Wallet size={17}/></span></div><strong>₦12.94m</strong><div className="metric-foot"><span className="positive"><ArrowUpRight size={14}/> 14.8%</span><span>vs previous 30 days</span></div><div className="sparkline"><svg viewBox="0 0 120 30"><path d="M1 24 C12 20 13 24 23 17 S39 21 49 13 S61 17 71 10 S86 15 96 7 S108 10 119 2" /></svg></div></div>
          <div className="metric-card"><div className="metric-top"><span>Orders processed</span><span className="metric-icon orange"><ShoppingCart size={17}/></span></div><strong>796</strong><div className="metric-foot"><span className="positive"><ArrowUpRight size={14}/> 8.2%</span><span>vs previous 30 days</span></div><div className="sparkline orange-line"><svg viewBox="0 0 120 30"><path d="M1 23 C12 18 17 25 27 17 S42 18 51 15 S66 18 77 8 S91 16 101 5 S112 9 119 3" /></svg></div></div>
          <div className="metric-card"><div className="metric-top"><span>Active storefronts</span><span className="metric-icon green"><Store size={17}/></span></div><strong>8 <small>/ 10</small></strong><div className="metric-foot"><span className="neutral">2 in setup</span><span>network capacity</span></div><div className="progress"><i style={{width:"80%"}}/></div></div>
          <div className="metric-card"><div className="metric-top"><span>Subscription revenue</span><span className="metric-icon blue"><CreditCard size={17}/></span></div><strong>₦185k</strong><div className="metric-foot"><span className="positive"><ArrowUpRight size={14}/> 6.4%</span><span>monthly recurring</span></div><div className="sparkline blue-line"><svg viewBox="0 0 120 30"><path d="M1 24 C15 21 17 16 28 20 S42 15 52 17 S69 8 79 13 S98 8 119 2" /></svg></div></div>
        </div>
        <div className="section-grid">
          <section className="panel storefront-panel"><div className="panel-heading"><div><h2>Storefront network</h2><p>Your connected businesses at a glance</p></div><button className="text-link" onClick={() => choose("Storefronts")}>View all <ArrowUpRight size={14}/></button></div><div className="table-toolbar"><div className="searchbox"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search storefronts..." /></div><button className="filter-btn" onClick={() => setPeriod(period === "All stores" ? "Active stores" : "All stores")}>{period === "Last 30 days" ? "All stores" : period} <ChevronDown size={14}/></button></div>
            <div className="store-table"><div className="table-head"><span>STOREFRONT</span><span>STATUS</span><span>GROSS SALES</span><span>ORDERS</span><span>GROWTH</span><span/></div>{filtered.map(s => <div className="store-row" key={s.slug}><div className="store-name"><div className={"store-avatar " + s.tone}>{s.initials}</div><div><b>{s.name}</b><small>{s.category}</small></div></div><div><span className={s.status === "Active" ? "status active" : "status trial"}><i/>{s.status}</span></div><b className="sales">{s.revenue}</b><span className="orders">{s.orders}</span><span className="growth">{s.growth}</span><button className="row-more" onClick={() => setNotice(s.name + " workspace selected. Tenant-level controls will be enabled in the next phase.")}><MoreHorizontal size={17}/></button></div>)}</div>
            <div className="panel-footer"><span>Showing <b>{filtered.length}</b> of 10 storefronts</span><button onClick={() => choose("Storefronts")}>Manage storefronts <ArrowUpRight size={13}/></button></div>
          </section>
          <section className="panel activity-panel"><div className="panel-heading"><div><h2>Live activity</h2><p>Latest events across your network</p></div><span className="live-tag"><i/> LIVE</span></div><div className="activity-list">{activity.map((a, i) => <div className="activity-item" key={i}><div className="activity-icon"><a.icon size={16}/></div><div className="activity-copy"><b>{a.title}</b><small>{a.detail}</small><span>{a.time}</span></div>{a.amount && <strong>{a.amount}</strong>}</div>)}</div><button className="activity-link" onClick={() => setNotice("The full audit and activity log will be available in the next phase.")}>View activity log <ArrowUpRight size={14}/></button></section>
        </div>
        <section className="bottom-grid"><div className="panel revenue-panel"><div className="panel-heading"><div><h2>Revenue overview</h2><p>Sales performance across all storefronts</p></div><button className="filter-btn" onClick={() => setPeriod(period === "Last 30 days" ? "Last 7 days" : "Last 30 days")}>{period} <ChevronDown size={14}/></button></div><div className="chart-summary"><strong>₦12,940,800</strong><span className="positive"><ArrowUpRight size={14}/> 14.8%</span><small>compared to previous period</small></div><div className="chart"><div className="chart-y"><span>₦4m</span><span>₦3m</span><span>₦2m</span><span>₦1m</span><span>₦0</span></div><div className="chart-main"><div className="gridlines"><i/><i/><i/><i/><i/></div><svg viewBox="0 0 720 170" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8066d8" stopOpacity=".22"/><stop offset="100%" stopColor="#8066d8" stopOpacity="0"/></linearGradient></defs><path className="chart-fill" d="M0 132 C35 125 48 110 80 116 S135 102 160 108 S205 80 240 93 S285 83 320 86 S365 54 400 67 S445 46 480 58 S525 42 560 48 S610 18 640 30 S690 8 720 15 L720 170 L0 170Z"/><path className="chart-line" d="M0 132 C35 125 48 110 80 116 S135 102 160 108 S205 80 240 93 S285 83 320 86 S365 54 400 67 S445 46 480 58 S525 42 560 48 S610 18 640 30 S690 8 720 15"/></svg><div className="chart-x"><span>Oct 08</span><span>Oct 13</span><span>Oct 18</span><span>Oct 23</span><span>Oct 28</span><span>Nov 02</span><span>Nov 06</span></div></div></div></div><div className="panel plan-panel"><div className="panel-heading"><div><h2>Platform health</h2><p>Infrastructure & subscription status</p></div><span className="health-icon"><Zap size={16}/></span></div><div className="health-row"><span><i className="health-dot good"/> Storefront availability</span><b>100%</b></div><div className="health-row"><span><i className="health-dot good"/> Payment processing</span><b>Operational</b></div><div className="health-row"><span><i className="health-dot warn"/> Subscription renewals</span><b>2 pending</b></div><div className="plan-callout"><div className="plan-symbol"><ShieldCheck size={19}/></div><div><b>Master control enabled</b><small>Tenant governance is ready for configuration.</small></div></div><button className="settings-link" onClick={() => choose("Settings")}>Configure platform <ArrowUpRight size={14}/></button></div></section>
        <footer className="footer"><span>© 2026 BlueHaven Studios</span><span>Commerce infrastructure, thoughtfully built.</span><span>v0.1.0 · Preview</span></footer>
      </div>
    </section>
  </main>;
}