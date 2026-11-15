"use client";

import { useMemo, useState } from "react";

type Piece = {
  id: string;
  name: string;
  description?: string | null;
  price_minor: number | string;
  image_url?: string | null;
  category?: string | null;
};

const money = (value: number | string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value) / 100);

export default function SPStyleStudio({ products }: { products: Piece[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [category, setCategory] = useState("All pieces");

  const categories = useMemo(() => ["All pieces", ...Array.from(new Set(products.map((p) => (p.category || "Other").trim()).filter(Boolean)))], [products]);
  const visible = useMemo(() => category === "All pieces" ? products : products.filter((p) => (p.category || "Other").trim() === category), [products, category]);
  const chosen = selected.map((id) => products.find((p) => p.id === id)).filter((p): p is Piece => Boolean(p));
  const total = chosen.reduce((sum, p) => sum + Number(p.price_minor || 0), 0);

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current);
  }

  const enquiry = encodeURIComponent("Hello SP Clothing Services, I'd like to enquire about this outfit combination: " + chosen.map((p) => p.name).join(", ") + ". Please let me know about availability and sizing.");

  return (
    <section className="sp-style-studio" id="style-studio">
      <div className="sp-style-heading">
        <span className="sp-section-index">04 / YOUR PERSONAL STYLE ROOM</span>
        <h2>Style it <em>your way.</em></h2>
        <p>Mix pieces from the SP collection, try different combinations and build a look that feels like you.</p>
      </div>
      <div className="sp-style-workspace">
        <div className="sp-style-picker">
          <div className="sp-style-picker-head">
            <div><span>THE WARDROBE</span><h3>Choose your pieces</h3></div>
            <small>{products.length} ITEMS</small>
          </div>
          <div className="sp-style-categories" aria-label="Filter catalogue by category">
            {categories.map((item) => <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="sp-style-products">
            {visible.map((piece) => {
              const active = selected.includes(piece.id);
              return <button type="button" key={piece.id} className={`sp-style-piece ${active ? "selected" : ""}`} onClick={() => toggle(piece.id)} aria-pressed={active}>
                <span className="sp-style-piece-image">{piece.image_url ? <img src={piece.image_url} alt={piece.name} loading="lazy"/> : <span>SP</span>}</span>
                <span className="sp-style-piece-copy"><b>{piece.name}</b><small>{piece.category || "The SP edit"}</small><strong>{money(piece.price_minor)}</strong></span>
                <span className="sp-style-add">{active ? "ADDED" : "ADD"}</span>
              </button>;
            })}
            {!visible.length && <p className="sp-style-empty">No pieces in this category yet. Check back as the collection grows.</p>}
          </div>
          <p className="sp-style-limit">Choose up to four pieces for one look.</p>
        </div>
        <div className="sp-style-preview">
          <div className="sp-style-preview-top"><span>YOUR LOOKBOARD</span><button type="button" onClick={() => setSelected([])} disabled={!selected.length}>CLEAR LOOK</button></div>
          <div className={`sp-style-canvas ${chosen.length ? "has-pieces" : ""}`}>
            {chosen.length ? chosen.map((piece, index) => <div className="sp-style-look-piece" key={piece.id} style={{ zIndex: index + 1 }}>
              {piece.image_url ? <img src={piece.image_url} alt={piece.name}/> : <span>SP</span>}
              <button type="button" onClick={() => toggle(piece.id)} aria-label={`Remove ${piece.name}`}>×</button>
              <small>{piece.name}</small>
            </div>) : <div className="sp-style-empty-state"><span className="sp-style-monogram">SP</span><b>Your look starts here.</b><p>Select pieces from the wardrobe to see your combination.</p></div>}
          </div>
          <div className="sp-style-summary">
            <div><span>PIECES SELECTED</span><b>{String(chosen.length).padStart(2, "0")} / 04</b></div>
            <div><span>COMBINED PRICE</span><b>{money(total)}</b></div>
          </div>
          <a className={`sp-style-enquire ${chosen.length ? "ready" : ""}`} href={chosen.length ? `mailto:Sampraiserock@gmail.com?subject=My%20SP%20outfit%20combination&body=${enquiry}` : undefined} aria-disabled={!chosen.length} onClick={(event) => { if (!chosen.length) event.preventDefault(); }}>ENQUIRE ABOUT THIS LOOK</a>
          <p className="sp-style-note">A styling preview to help you explore combinations. Final fit, availability and pricing are confirmed by SP Clothing Services.</p>
        </div>
      </div>
    </section>
  );
}
