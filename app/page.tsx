"use client";

import { useState } from "react";
import {
  Activity, ArrowUpRight, Bell, Blocks, ChevronDown, CircleHelp,
  Command, CreditCard, ExternalLink, Gauge, Globe2, LayoutDashboard,
  LifeBuoy, LockKeyhole, Package, Plus, Settings2, ShieldCheck,
  ShoppingBag, Store, Users, Wallet, X
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, href: "#overview" },
  { label: "Storefronts", icon: Store, href: "#storefronts" },
  { label: "Products", icon: Package, href: "#products" },
  { label: "Orders", icon: ShoppingBag, href: "#orders" },
  { label: "Customers", icon: Users, href: "#customers" },
];
const management = [
  { label: "Subscriptions", icon: Wallet, href: "#subscriptions" },
  { label: "Payments", icon: CreditCard, href: "#payments" },
  { label: "Feature controls", icon: Blocks, href: "#features" },
  { label: "Platform settings", icon: Settings2, href: "#settings" },
];

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const jump = (label: string, href: string) => {
    setActive(label);
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!target) setNotice(label + " controls will appear here when that module is connected.");
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <aside className="sidebar glass">
        <a className="brand" href="#overview" aria-label="BlueHaven Studios home">
          <span className="brand-symbol">b<span>.</span></span>
          <span className="brand-copy"><strong>BLUEHAVEN</strong><small>STUDIOS</small></span>
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <div className="workspace glass-inset">
          <span className="workspace-icon"><Command size={16}/></span>
          <span><b>Master workspace</b><small>Platform control</small></span>
          <ChevronDown size={15}/>
        </div>
        <div className="nav-caption">PLATFORM</div>
        <nav className="nav-list">
          {navigation.map(({label, icon: Icon, href}) => (
            <button key={label} className={active === label ? "nav-link active" : "nav-link"} onClick={() => jump(label, href)}>
              <Icon size={17}/><span>{label}</span>{label === "Storefronts" && <span className="nav-count">0</span>}
            </button>
          ))}
        </nav>
        <div className="nav-caption manage-caption">MANAGEMENT</div>
        <nav className="nav-list">
          {management.map(({label, icon: Icon, href}) => (
            <button key={label} className={active === label ? "nav-link active" : "nav-link"} onClick={() => jump(label, href)}>
              <Icon size={17}/><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer"/>
        <button className="support-card" onClick={() => setShowHelp(true)}>
          <span className="support-icon"><LifeBuoy size={17}/></span>
          <span><b>Need a hand?</b><small>Get help with your workspace</small></span>
          <ArrowUpRight size={15}/>
        </button>
        <div className="profile-row">
          <div className="profile-avatar">BH</div>
          <span><b>Platform owner</b><small>BlueHaven Studios</small></span>
          <span className="profile-menu"><Settings2 size={16}/></span>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar glass">
          <div className="crumb"><span>Workspace</span><i>/</i><b>{active}</b></div>
          <div className="topbar-actions">
            <span className="secure-indicator"><LockKeyhole size={13}/> Private workspace</span>
            <button className="top-icon" aria-label="Help" onClick={() => setShowHelp(true)}><CircleHelp size={18}/></button>
            <button className="top-icon notification" aria-label="Notifications" onClick={() => setNotice("There are no new platform notifications.")}><Bell size={18}/></button>
            <div className="mini-avatar">BH</div>
          </div>
        </header>

        <div className="page-content" id="overview">
          <section className="welcome-row">
            <div>
              <div className="overline"><span className="overline-line"/> MASTER CONTROL CENTRE</div>
              <h1>Commerce, <em>beautifully</em> in control.</h1>
              <p>One calm place to manage every storefront, subscription and platform setting.</p>
            </div>
            <div className="welcome-mark"><div className="mark-orbit orbit-a"/><div className="mark-orbit orbit-b"/><span>BH<span>.</span></span></div>
          </section>

          {notice && <div className="notice"><ShieldCheck size={16}/><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}

          <section className="overview-strip" aria-label="Platform overview">
            <article className="overview-card glass">
              <div className="overview-icon purple"><Store size={18}/></div>
              <div className="overview-label">STOREFRONTS</div>
              <strong>—</strong>
              <small>No connected stores yet</small>
            </article>
            <article className="overview-card glass">
              <div className="overview-icon gold"><Activity size={18}/></div>
              <div className="overview-label">LIVE ACTIVITY</div>
              <strong>—</strong>
              <small>Waiting for your first event</small>
            </article>
            <article className="overview-card glass">
              <div className="overview-icon blue"><Wallet size={18}/></div>
              <div className="overview-label">SUBSCRIPTIONS</div>
              <strong>—</strong>
              <small>No billing records yet</small>
            </article>
            <article className="overview-card glass">
              <div className="overview-icon green"><Gauge size={18}/></div>
              <div className="overview-label">PLATFORM STATUS</div>
              <strong className="status-word">Ready</strong>
              <small>Awaiting configuration</small>
            </article>
          </section>

          <section className="workspace-grid">
            <article className="section-card glass" id="storefronts">
              <div className="section-heading">
                <div><span className="section-kicker">YOUR COMMERCE NETWORK</span><h2>Storefronts</h2><p>Your tenants, their stores, all in one view.</p></div>
                <span className="section-count">0 STORES</span>
              </div>
              <div className="empty-state">
                <div className="empty-art">
                  <div className="art-back"><Globe2 size={29}/></div>
                  <div className="art-front"><Store size={25}/></div>
                  <span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span>
                </div>
                <h3>Your network starts here.</h3>
                <p>No storefronts have been connected. Add a real tenant storefront URL when you are ready. No sample stores or placeholder businesses are shown here.</p>
                <button className="outline-action" onClick={() => setNotice("Storefront creation is not connected yet. The next step is wiring the secure tenant-creation workflow.")}><Plus size={16}/> Add your first storefront</button>
              </div>
              <div className="section-bottom"><span><ShieldCheck size={14}/> Tenant data is kept separate</span><span>Live records only</span></div>
            </article>

            <article className="section-card glass activity-card" id="orders">
              <div className="section-heading">
                <div><span className="section-kicker">WHAT'S HAPPENING</span><h2>Recent activity</h2><p>Events from across your platform.</p></div>
                <span className="live-indicator"><i/> LIVE</span>
              </div>
              <div className="activity-empty">
                <div className="activity-empty-icon"><Activity size={21}/></div>
                <b>Nothing to report. Yet.</b>
                <p>Real orders, renewals and account events will appear here as they happen.</p>
              </div>
              <div className="activity-foot"><span>Activity feed</span><span>Connected to live events when enabled</span></div>
            </article>
          </section>

          <section className="lower-grid">
            <article className="lower-card glass" id="subscriptions">
              <div className="lower-icon"><CreditCard size={18}/></div>
              <div><span className="section-kicker">RECURRING BILLING</span><h3>Subscriptions & plans</h3><p>Configure plans, renewals, grace periods and tenant access.</p></div>
              <button onClick={() => jump("Subscriptions", "#subscriptions")} aria-label="Open subscriptions"><ArrowUpRight size={17}/></button>
            </article>
            <article className="lower-card glass" id="features">
              <div className="lower-icon gold"><Blocks size={18}/></div>
              <div><span className="section-kicker">PLATFORM GOVERNANCE</span><h3>Feature control centre</h3><p>Decide which modules are available globally and per tenant.</p></div>
              <button onClick={() => jump("Feature controls", "#features")} aria-label="Open feature controls"><ArrowUpRight size={17}/></button>
            </article>
            <article className="lower-card glass" id="settings">
              <div className="lower-icon blue"><Settings2 size={18}/></div>
              <div><span className="section-kicker">CONFIGURATION</span><h3>Platform settings</h3><p>Manage the rules and defaults for your commerce network.</p></div>
              <button onClick={() => jump("Platform settings", "#settings")} aria-label="Open platform settings"><ArrowUpRight size={17}/></button>
            </article>
          </section>
          <footer className="footer"><span>© {new Date().getFullYear()} BLUEHAVEN STUDIOS</span><span>CREATIVITY BEYOND LIMITS</span><span><span className="footer-dot"/> Master workspace</span></footer>
        </div>
      </section>
      {showHelp && <div className="modal-backdrop" onClick={() => setShowHelp(false)}><div className="help-modal glass" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowHelp(false)} aria-label="Close"><X size={17}/></button><div className="overview-icon purple"><LifeBuoy size={19}/></div><span className="section-kicker">BLUEHAVEN STUDIOS</span><h2>We're building your control room.</h2><p>Support and guided setup will be connected as the platform modules are completed. Your workspace is currently showing live records only—no demo activity.</p><button className="outline-action" onClick={() => setShowHelp(false)}>Back to workspace</button></div></div>}
    </main>
  );
}
