"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price_minor: number | string;
  sale_price_minor?: number | string | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  image_url?: string | null;
  category?: string | null;
  stock_quantity?: number | string | null;
};

type CartLine = { id: string; quantity: number };
const STORAGE_KEY = "sp-clothing-services-cart-v1";
const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value / 100);

function currentPrice(product: Product) {
  const now = Date.now();
  const starts = product.sale_starts_at ? new Date(product.sale_starts_at).getTime() : 0;
  const ends = product.sale_ends_at ? new Date(product.sale_ends_at).getTime() : Number.POSITIVE_INFINITY;
  const sale = Number(product.sale_price_minor);
  return product.sale_price_minor != null && sale > 0 && sale < Number(product.price_minor) && now >= starts && now <= ends ? sale : Number(product.price_minor);
}

export default function SPCart({ products, contactEmail }: { products: Product[]; contactEmail: string }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed.filter((line) => line && typeof line.id === "string" && Number.isInteger(line.quantity) && line.quantity > 0));
      }
    } catch { /* Ignore invalid local cart data. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  const lines = useMemo(() => cart.map((line) => {
    const product = products.find((item) => item.id === line.id);
    return product ? { ...line, product, unitPrice: currentPrice(product) } : null;
  }).filter((line): line is NonNullable<typeof line> => Boolean(line)), [cart, products]);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  function add(product: Product) {
    const stock = Math.max(0, Number(product.stock_quantity ?? 0));
    if (!stock) return;
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (!existing) return [...current, { id: product.id, quantity: 1 }];
      return current.map((line) => line.id === product.id ? { ...line, quantity: Math.min(stock, line.quantity + 1) } : line);
    });
    setOpen(true);
  }

  function changeQuantity(id: string, quantity: number) {
    const product = products.find((item) => item.id === id);
    const stock = Math.max(0, Number(product?.stock_quantity ?? 0));
    setCart((current) => quantity <= 0 ? current.filter((line) => line.id !== id) : current.map((line) => line.id === id ? { ...line, quantity: Math.min(stock, quantity) } : line));
  }

  const orderBody = [
    "Hello SP Clothing Services, I would like to place an order:",
    "",
    ...lines.map((line) => `${line.quantity} × ${line.product.name} — ${money(line.unitPrice * line.quantity)}`),
    "",
    `Order total: ${money(total)}`,
    "",
    "Please confirm availability, delivery fees and payment instructions. My name and delivery details are:",
  ].join("\n");
  const checkoutHref = `mailto:${contactEmail}?subject=${encodeURIComponent("SP Clothing Services order request")}&body=${encodeURIComponent(orderBody)}`;

  return <>
    <div className="sp-products">
      {products.map((product) => {
        const stock = Math.max(0, Number(product.stock_quantity ?? 0));
        const saleActive = currentPrice(product) < Number(product.price_minor);
        return <article className="sp-product" key={product.id}>
          <div className="sp-product-image" style={{ backgroundImage: "url('" + (product.image_url || "") + "')" }}>
            <span>{(product.category || "THE SP EDIT").toUpperCase()}</span>
            {stock <= 0 && <strong className="sp-out-of-stock">SOLD OUT</strong>}
          </div>
          <div className="sp-product-meta">
            <h3>{product.name}</h3>
            <b>{saleActive ? <><span className="sp-sale-price">{money(currentPrice(product))}</span><del>{money(Number(product.price_minor))}</del></> : money(Number(product.price_minor))}</b>
          </div>
          <p>{product.description || "A considered piece from the SP Clothing Services collection."}</p>
          <button className="sp-add-to-cart" type="button" disabled={stock <= 0} onClick={() => add(product)}>{stock <= 0 ? "Currently unavailable" : "ADD TO CART"}</button>
        </article>;
      })}
    </div>
    <button className="sp-cart-trigger" type="button" onClick={() => setOpen(true)} aria-label={`Open shopping cart, ${count} items`}>
      <span className="sp-cart-icon" aria-hidden="true">▢</span><span>YOUR BAG</span><b>{count}</b>
    </button>
    {open && <div className="sp-cart-backdrop" onClick={() => setOpen(false)}>
      <aside className="sp-cart-drawer" role="dialog" aria-modal="true" aria-label="Your shopping bag" onClick={(event) => event.stopPropagation()}>
        <div className="sp-cart-head"><div><span>SP CLOTHING SERVICES</span><h2>Your shopping bag</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close cart">×</button></div>
        {!lines.length ? <div className="sp-cart-empty"><span>SP</span><h3>Your bag is waiting.</h3><p>Add pieces from the collection and they will appear here.</p><button type="button" onClick={() => setOpen(false)}>CONTINUE SHOPPING</button></div> : <>
          <div className="sp-cart-lines">{lines.map((line) => <article className="sp-cart-line" key={line.id}>
            <div className="sp-cart-thumb">{line.product.image_url && <img src={line.product.image_url} alt={line.product.name}/>}</div>
            <div className="sp-cart-line-copy"><b>{line.product.name}</b><small>{money(line.unitPrice)} each</small><div className="sp-cart-quantity"><button type="button" onClick={() => changeQuantity(line.id, line.quantity - 1)} aria-label={`Decrease ${line.product.name} quantity`}>−</button><span>{line.quantity}</span><button type="button" onClick={() => changeQuantity(line.id, line.quantity + 1)} aria-label={`Increase ${line.product.name} quantity`} disabled={line.quantity >= Number(line.product.stock_quantity ?? 0)}>+</button><button className="sp-cart-remove" type="button" onClick={() => changeQuantity(line.id, 0)}>REMOVE</button></div></div>
            <strong>{money(line.unitPrice * line.quantity)}</strong>
          </article>)}</div>
          <div className="sp-cart-checkout"><div><span>SUBTOTAL</span><b>{money(total)}</b></div><p>Delivery fees and final availability will be confirmed before payment.</p><a href={checkoutHref}>CONTINUE TO ORDER</a><button type="button" onClick={() => setCart([])}>EMPTY BAG</button></div>
        </>}
      </aside>
    </div>}
  </>;
}
