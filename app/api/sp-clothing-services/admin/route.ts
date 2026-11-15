import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { hasSPAdminSession } from "@/lib/sp-admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const TENANT_SLUG = "sp-clothing-services";
function fail(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }
function database() { if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured."); return neon(process.env.DATABASE_URL); }
async function tenantId(sql: any) {
  const rows = await sql.query("SELECT id FROM public.tenants WHERE slug=$1 AND deleted_at IS NULL LIMIT 1", [TENANT_SLUG]) as any[];
  return rows[0]?.id as string | undefined;
}
function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80); }

export async function GET(req: NextRequest) {
  if (!hasSPAdminSession(req)) return fail("Please sign in to manage this storefront.", 401);
  try {
    const sql = database(); const tenant = await tenantId(sql);
    if (!tenant) return fail("Storefront not found.", 404);
    const products = await sql.query("SELECT id,name,slug,description,price_minor,image_url,category,stock_quantity,is_published,created_at FROM public.products WHERE tenant_id=$1::uuid AND deleted_at IS NULL ORDER BY created_at DESC", [tenant]) as any[];
    return NextResponse.json({ products });
  } catch (error) { console.error("SP admin catalogue read failed", error); return fail("Could not load the product catalogue.", 503); }
}
export async function POST(req: NextRequest) {
  if (!hasSPAdminSession(req)) return fail("Please sign in to manage this storefront.", 401);
  try {
    const b = await req.json(); const name = String(b.name || "").trim(); const description = String(b.description || "").trim();
    const category = String(b.category || "Ready to wear").trim(); const price = Number(b.price); const stock = Number(b.stock); const image = String(b.image_url || "").trim();
    if (name.length < 2 || name.length > 140) return fail("Enter a product name between 2 and 140 characters.");
    if (!Number.isFinite(price) || price < 0 || price > 100000000) return fail("Enter a valid product price.");
    if (!Number.isInteger(stock) || stock < 0 || stock > 10000000) return fail("Enter a valid stock quantity.");
    if (image && !/^https:\/\//i.test(image)) return fail("Product image URL must begin with https://.");
    const sql = database(); const tenant = await tenantId(sql); if (!tenant) return fail("Storefront not found.", 404);
    const slug = (slugify(name) || "product") + "-" + Date.now().toString(36);
    const rows = await sql.query("INSERT INTO public.products(tenant_id,name,slug,description,price_minor,currency,stock_quantity,is_published,image_url,category) VALUES($1::uuid,$2,$3,$4,$5,'NGN',$6,true,$7,$8) RETURNING id,name,slug,description,price_minor,image_url,category,stock_quantity,is_published", [tenant, name, slug, description, Math.round(price * 100), stock, image || null, category]) as any[];
    return NextResponse.json({ product: rows[0] }, { status: 201 });
  } catch (error) { console.error("SP product create failed", error); return fail("Could not add this product. Please try again.", 503); }
}
export async function PATCH(req: NextRequest) {
  if (!hasSPAdminSession(req)) return fail("Please sign in to manage this storefront.", 401);
  try {
    const b = await req.json(); const id = String(b.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("Invalid product.");
    const sql = database(); const tenant = await tenantId(sql); if (!tenant) return fail("Storefront not found.", 404);
    if (typeof b.is_published === "boolean") {
      const rows = await sql.query("UPDATE public.products SET is_published=$1,updated_at=now() WHERE id=$2::uuid AND tenant_id=$3::uuid AND deleted_at IS NULL RETURNING id,is_published", [b.is_published, id, tenant]) as any[];
      if (!rows.length) return fail("Product not found.", 404);
      return NextResponse.json({ product: rows[0] });
    }
    const name = String(b.name || "").trim(); const price = Number(b.price); const stock = Number(b.stock); const image = String(b.image_url || "").trim();
    if (name.length < 2 || name.length > 140 || !Number.isFinite(price) || price < 0 || price > 100000000 || !Number.isInteger(stock) || stock < 0 || stock > 10000000) return fail("Check the product name, price and stock quantity.");
    if (image && !/^https:\/\//i.test(image)) return fail("Product image URL must begin with https://.");
    const rows = await sql.query("UPDATE public.products SET name=$1,description=$2,price_minor=$3,category=$4,stock_quantity=$5,image_url=$6,updated_at=now() WHERE id=$7::uuid AND tenant_id=$8::uuid AND deleted_at IS NULL RETURNING id,name,slug,description,price_minor,image_url,category,stock_quantity,is_published", [name, String(b.description || "").trim(), Math.round(price * 100), String(b.category || "Ready to wear"), stock, image || null, id, tenant]) as any[];
    if (!rows.length) return fail("Product not found.", 404);
    return NextResponse.json({ product: rows[0] });
  } catch (error) { console.error("SP product update failed", error); return fail("Could not update this product.", 503); }
}
export async function DELETE(req: NextRequest) {
  if (!hasSPAdminSession(req)) return fail("Please sign in to manage this storefront.", 401);
  try {
    const b = await req.json(); const id = String(b.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("Invalid product.");
    const sql = database(); const tenant = await tenantId(sql); if (!tenant) return fail("Storefront not found.", 404);
    const rows = await sql.query("UPDATE public.products SET deleted_at=now(),recover_until=now()+interval '30 days',updated_at=now() WHERE id=$1::uuid AND tenant_id=$2::uuid AND deleted_at IS NULL RETURNING id", [id, tenant]) as any[];
    if (!rows.length) return fail("Product not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("SP product delete failed", error); return fail("Could not remove this product.", 503); }
}
