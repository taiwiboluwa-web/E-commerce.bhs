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
    const products = await sql.query("SELECT id,name,slug,description,price_minor,sale_price_minor,sale_starts_at,sale_ends_at,sale_label,image_url,category,stock_quantity,is_published,created_at FROM public.products WHERE tenant_id=$1::uuid AND deleted_at IS NULL ORDER BY created_at DESC", [tenant]) as any[];
    const settingsRows = await sql.query("SELECT content FROM public.storefront_settings WHERE tenant_id=$1::uuid LIMIT 1", [tenant]) as any[];
    return NextResponse.json({ products, settings: settingsRows[0]?.content || {} });
  } catch (error) { console.error("SP admin catalogue read failed", error); return fail("Could not load the product catalogue.", 503); }
}
export async function POST(req: NextRequest) {
  if (!hasSPAdminSession(req)) return fail("Please sign in to manage this storefront.", 401);
  try {
    const b = await req.json(); const name = String(b.name || "").trim(); const description = String(b.description || "").trim();
    const category = String(b.category || "Ready to wear").trim(); const price = Number(b.price); const stock = Number(b.stock); const image = String(b.image_url || "").trim();
    const salePrice = b.sale_price === "" || b.sale_price == null ? null : Number(b.sale_price);
    const saleLabel = String(b.sale_label || "").trim().slice(0, 60);
    const saleStarts = b.sale_starts_at ? new Date(b.sale_starts_at) : null;
    const saleEnds = b.sale_ends_at ? new Date(b.sale_ends_at) : null;
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= price)) return fail("Sale price must be lower than the regular price.");
    if (saleStarts && !Number.isFinite(saleStarts.getTime())) return fail("Enter a valid sale start date.");
    if (saleEnds && !Number.isFinite(saleEnds.getTime())) return fail("Enter a valid sale end date.");
    if (saleStarts && saleEnds && saleEnds <= saleStarts) return fail("Sale end must be after its start.");
    if (name.length < 2 || name.length > 140) return fail("Enter a product name between 2 and 140 characters.");
    if (!Number.isFinite(price) || price < 0 || price > 100000000) return fail("Enter a valid product price.");
    if (!Number.isInteger(stock) || stock < 0 || stock > 10000000) return fail("Enter a valid stock quantity.");
    if (image && !/^https:\/\//i.test(image)) return fail("Product image URL must begin with https://.");
    const sql = database(); const tenant = await tenantId(sql); if (!tenant) return fail("Storefront not found.", 404);
    const slug = (slugify(name) || "product") + "-" + Date.now().toString(36);
    const rows = await sql.query("INSERT INTO public.products(tenant_id,name,slug,description,price_minor,currency,stock_quantity,is_published,image_url,category,sale_price_minor,sale_starts_at,sale_ends_at,sale_label) VALUES($1::uuid,$2,$3,$4,$5,'NGN',$6,true,$7,$8,$9,$10,$11,$12) RETURNING id,name,slug,description,price_minor,sale_price_minor,sale_starts_at,sale_ends_at,sale_label,image_url,category,stock_quantity,is_published", [tenant, name, slug, description, Math.round(price * 100), stock, image || null, category, salePrice === null ? null : Math.round(salePrice * 100), saleStarts, saleEnds, saleLabel || null]) as any[];
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
    const salePrice = b.sale_price === "" || b.sale_price == null ? null : Number(b.sale_price);
    const saleLabel = String(b.sale_label || "").trim().slice(0, 60);
    const saleStarts = b.sale_starts_at ? new Date(b.sale_starts_at) : null;
    const saleEnds = b.sale_ends_at ? new Date(b.sale_ends_at) : null;
    if (name.length < 2 || name.length > 140 || !Number.isFinite(price) || price < 0 || price > 100000000 || !Number.isInteger(stock) || stock < 0 || stock > 10000000) return fail("Check the product name, price and stock quantity.");
    if (image && !/^https:\/\//i.test(image)) return fail("Product image URL must begin with https://.");
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= price)) return fail("Sale price must be lower than the regular price.");
    if (saleStarts && !Number.isFinite(saleStarts.getTime())) return fail("Enter a valid sale start date.");
    if (saleEnds && !Number.isFinite(saleEnds.getTime())) return fail("Enter a valid sale end date.");
    if (saleStarts && saleEnds && saleEnds <= saleStarts) return fail("Sale end must be after its start.");
    const rows = await sql.query("UPDATE public.products SET name=$1,description=$2,price_minor=$3,category=$4,stock_quantity=$5,image_url=$6,sale_price_minor=$7,sale_starts_at=$8,sale_ends_at=$9,sale_label=$10,updated_at=now() WHERE id=$11::uuid AND tenant_id=$12::uuid AND deleted_at IS NULL RETURNING id,name,slug,description,price_minor,sale_price_minor,sale_starts_at,sale_ends_at,sale_label,image_url,category,stock_quantity,is_published", [name, String(b.description || "").trim(), Math.round(price * 100), String(b.category || "Ready to wear"), stock, image || null, salePrice === null ? null : Math.round(salePrice * 100), saleStarts, saleEnds, saleLabel || null, id, tenant]) as any[];
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

export async function PUT(req: NextRequest) {
  if (!hasSPAdminSession(req)) return fail("Please sign in to manage this storefront.", 401);
  try {
    const body = await req.json();
    const allowed = ["ribbon_message","hero_eyebrow","hero_title","hero_emphasis","hero_description","hero_cta_label","story_title","story_emphasis","story_body","collection_title","collection_emphasis","services_title","services_emphasis","service_1_title","service_1_body","service_2_title","service_2_body","service_3_title","service_3_body","contact_kicker","contact_title","contact_emphasis","contact_cta_label","footer_description","footer_location","footer_hours","footer_tagline","contact_email","instagram_url","facebook_url","tiktok_url","whatsapp_url"];
    const content: Record<string,string> = {};
    for (const key of allowed) {
      const value = body?.[key];
      if (value !== undefined) {
        if (typeof value !== "string" || value.length > 500) return fail("Check the storefront content fields.");
        content[key] = value.trim();
      }
    }
    const sql = database(); const tenant = await tenantId(sql);
    if (!tenant) return fail("Storefront not found.", 404);
    await sql.query(
      "INSERT INTO public.storefront_settings(tenant_id,content) VALUES($1::uuid,$2::jsonb) ON CONFLICT(tenant_id) DO UPDATE SET content=public.storefront_settings.content || EXCLUDED.content,updated_at=now()",
      [tenant, JSON.stringify(content)]
    );
    const rows = await sql.query("SELECT content FROM public.storefront_settings WHERE tenant_id=$1::uuid", [tenant]) as any[];
    return NextResponse.json({ settings: rows[0]?.content || {} });
  } catch (error) {
    console.error("SP storefront content update failed", error);
    return fail("Could not save storefront content.", 503);
  }
}
