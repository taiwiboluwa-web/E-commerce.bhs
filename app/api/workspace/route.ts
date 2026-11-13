import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "bhs_master_session";
const tenantStatuses = ["setup","active","suspended"];
const orderStatuses = ["pending","paid","processing","fulfilled","cancelled","refunded"];

function matchesSecret(candidate: string) {
  const secret = process.env.BHS_MASTER_ADMIN_KEY || "";
  if (!secret || !candidate) return false;
  const a = Buffer.from(secret), b = Buffer.from(candidate);
  return a.length === b.length && timingSafeEqual(a, b);
}
function isAuthorized(req: NextRequest) {
  return matchesSecret(req.cookies.get(COOKIE)?.value || "");
}
function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  return neon(process.env.DATABASE_URL);
}
function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  if (!process.env.BHS_MASTER_ADMIN_KEY) return fail("Master workspace access is not configured. Add BHS_MASTER_ADMIN_KEY in Vercel.", 503);
  try {
    const body = await req.json();
    if (!matchesSecret(typeof body.key === "string" ? body.key : "")) return fail("Access key not accepted.", 401);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE, process.env.BHS_MASTER_ADMIN_KEY!, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
      path: "/api/workspace", maxAge: 60 * 60 * 8
    });
    return response;
  } catch {
    return fail("Unable to verify access.", 400);
  }
}
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/workspace", maxAge: 0 });
  return response;
}

export async function GET(req: NextRequest) {
  if (!process.env.BHS_MASTER_ADMIN_KEY) return fail("Master workspace access is not configured. Add BHS_MASTER_ADMIN_KEY in Vercel.", 503);
  if (!isAuthorized(req)) return fail("Please unlock the master workspace.", 401);
  try {
    const sql = db();
    await sql.query("UPDATE public.tenants SET status='suspended'::public.tenant_status,access_suspended_at=COALESCE(access_suspended_at,now()),updated_at=now() WHERE status='active'::public.tenant_status AND access_expires_at IS NOT NULL AND access_expires_at <= now()");
    const [tenants, products, orders, customers, subscriptions, payments, features, settings, activity, counts] = await Promise.all([
      sql.query("SELECT t.id,t.name,t.slug,t.category,t.status,t.storefront_url,t.created_at,t.access_duration_days,t.access_expires_at,t.access_suspended_at,(SELECT count(*)::int FROM public.products p WHERE p.tenant_id=t.id AND p.deleted_at IS NULL) AS product_count,(SELECT count(*)::int FROM public.orders o WHERE o.tenant_id=t.id AND o.deleted_at IS NULL) AS order_count,s.plan_code,s.status AS subscription_status,COALESCE(sa.capacity_bytes,2147483648)::bigint AS storage_capacity_bytes,COALESCE(sa.used_bytes,0)::bigint AS storage_used_bytes FROM public.tenants t LEFT JOIN public.subscriptions s ON s.tenant_id=t.id LEFT JOIN public.tenant_storage_accounts sa ON sa.tenant_id=t.id WHERE t.deleted_at IS NULL ORDER BY t.created_at DESC"),
      sql.query("SELECT p.id,p.tenant_id,t.name AS tenant_name,p.name,p.slug,p.description,p.price_minor,p.currency,p.sku,p.stock_quantity,p.is_published,p.created_at FROM public.products p JOIN public.tenants t ON t.id=p.tenant_id WHERE p.deleted_at IS NULL ORDER BY p.created_at DESC LIMIT 500"),
      sql.query("SELECT o.id,o.tenant_id,t.name AS tenant_name,o.order_number,o.customer_name,o.customer_email,o.customer_phone,o.status,o.total_minor,o.currency,o.created_at,(SELECT COALESCE(json_agg(json_build_object('name',oi.product_name,'quantity',oi.quantity,'unit_price_minor',oi.unit_price_minor)),'[]'::json) FROM public.order_items oi WHERE oi.order_id=o.id) AS items FROM public.orders o JOIN public.tenants t ON t.id=o.tenant_id WHERE o.deleted_at IS NULL ORDER BY o.created_at DESC LIMIT 500"),
      sql.query("SELECT customer_email AS email,max(customer_name) AS name,max(customer_phone) AS phone,count(*)::int AS order_count,sum(total_minor)::bigint AS lifetime_value,max(created_at) AS last_order_at,count(DISTINCT tenant_id)::int AS storefront_count FROM public.orders WHERE deleted_at IS NULL AND customer_email IS NOT NULL GROUP BY lower(customer_email),customer_email ORDER BY max(created_at) DESC LIMIT 500"),
      sql.query("SELECT s.id,s.tenant_id,t.name AS tenant_name,s.provider,s.provider_customer_id,s.provider_subscription_id,s.plan_code,s.status,s.current_period_start,s.current_period_end,s.cancel_at_period_end,s.last_payment_at,s.created_at FROM public.subscriptions s JOIN public.tenants t ON t.id=s.tenant_id ORDER BY s.created_at DESC"),
      sql.query("SELECT p.id,p.tenant_id,t.name AS tenant_name,p.provider,p.provider_reference,p.amount_minor,p.currency,p.status,p.paid_at,p.created_at FROM public.payment_transactions p JOIN public.tenants t ON t.id=p.tenant_id ORDER BY p.created_at DESC LIMIT 500"),
      sql.query("SELECT f.id,f.tenant_id,t.name AS tenant_name,f.feature_key,f.label,f.enabled,f.updated_at FROM public.platform_feature_controls f LEFT JOIN public.tenants t ON t.id=f.tenant_id ORDER BY f.tenant_id NULLS FIRST,f.label"),
      sql.query("SELECT setting_key,setting_value,updated_at FROM public.platform_settings ORDER BY setting_key"),
      sql.query("SELECT id,tenant_id,action,entity_type,entity_id,metadata,created_at FROM public.audit_events ORDER BY created_at DESC LIMIT 30"),
      sql.query("SELECT (SELECT count(*)::int FROM public.tenants WHERE deleted_at IS NULL) AS storefronts,(SELECT count(*)::int FROM public.products WHERE deleted_at IS NULL) AS products,(SELECT count(*)::int FROM public.orders WHERE deleted_at IS NULL) AS orders,(SELECT count(DISTINCT lower(customer_email))::int FROM public.orders WHERE deleted_at IS NULL AND customer_email IS NOT NULL) AS customers,(SELECT count(*)::int FROM public.subscriptions) AS subscriptions,(SELECT count(*)::int FROM public.payment_transactions) AS payments,(SELECT count(*)::int FROM public.client_applications) AS applications")
    ]);
    return NextResponse.json({ tenants, products, orders, customers, subscriptions, payments, features, settings, activity, counts: counts[0] || {} });
  } catch (error) {
    console.error("Master workspace read failed", error);
    return fail("The workspace could not read its database. Check DATABASE_URL and the latest migration.", 503);
  }
}

export async function PATCH(req: NextRequest) {
  if (!process.env.BHS_MASTER_ADMIN_KEY) return fail("Master workspace access is not configured.", 503);
  if (!isAuthorized(req)) return fail("Please unlock the master workspace.", 401);
  try {
    const body = await req.json();
    const sql = db();
    let result: any[] = [];
    const id = String(body.id || "");
    if (body.action === "tenant_access") {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("Invalid storefront.");
      if (body.mode === "set_duration") {
        const days = Number(body.days);
        if (!Number.isInteger(days) || days < 1 || days > 3650) return fail("Choose a duration between 1 and 3650 days.");
        result = await sql.query("UPDATE public.tenants SET access_duration_days=$1,updated_at=now() WHERE id=$2::uuid RETURNING id,status,access_duration_days,access_expires_at", [days,id]);
      } else if (body.mode === "enable_and_restart") {
        const requestedDays = body.days === undefined ? null : Number(body.days);
        if (requestedDays !== null && (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 3650)) return fail("Choose a duration between 1 and 3650 days.");
        result = await sql.query("UPDATE public.tenants SET access_duration_days=COALESCE($2,access_duration_days),status='active'::public.tenant_status,access_expires_at=now() + (COALESCE($2,access_duration_days) * interval '1 day'),access_suspended_at=NULL,updated_at=now() WHERE id=$1::uuid AND deleted_at IS NULL RETURNING id,status,access_duration_days,access_expires_at", [id,requestedDays]);
      } else if (body.mode === "suspend_now") {
        result = await sql.query("UPDATE public.tenants SET status='suspended'::public.tenant_status,access_suspended_at=now(),updated_at=now() WHERE id=$1::uuid AND deleted_at IS NULL RETURNING id,status,access_duration_days,access_expires_at", [id]);
      } else return fail("Unsupported access timer action.");
    } else if (body.action === "tenant") {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("Invalid storefront.");
      if (body.field === "status") {
        if (!tenantStatuses.includes(body.value)) return fail("Invalid storefront status.");
        result = body.value === "active" ? await sql.query("UPDATE public.tenants SET status='active'::public.tenant_status,access_expires_at=now() + (access_duration_days * interval '1 day'),access_suspended_at=NULL,updated_at=now() WHERE id=$1::uuid RETURNING id,status,access_duration_days,access_expires_at", [id]) : await sql.query("UPDATE public.tenants SET status=$1::public.tenant_status,access_suspended_at=CASE WHEN $1='suspended' THEN now() ELSE access_suspended_at END,updated_at=now() WHERE id=$2::uuid RETURNING id,status,access_duration_days,access_expires_at", [body.value,id]);
      } else if (body.field === "storefront_url") {
        const url = String(body.value || "").trim();
        if (url && !/^https:\/\/[a-z0-9.-]+(?::[0-9]+)?(?:\/[^\s]*)?$/i.test(url)) return fail("Storefront URL must be a valid HTTPS URL.");
        result = await sql.query("UPDATE public.tenants SET storefront_url=$1,updated_at=now() WHERE id=$2::uuid RETURNING id,storefront_url", [url || null,id]);
      } else return fail("Unsupported storefront update.");
    } else if (body.action === "product") {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("Invalid product.");
      if (body.field === "is_published" && typeof body.value === "boolean") {
        result = await sql.query("UPDATE public.products SET is_published=$1,updated_at=now() WHERE id=$2::uuid AND deleted_at IS NULL RETURNING id,is_published", [body.value,id]);
      } else if (body.field === "stock_quantity") {
        const stock = Number(body.value);
        if (!Number.isInteger(stock) || stock < 0 || stock > 10000000) return fail("Stock must be a non-negative whole number.");
        result = await sql.query("UPDATE public.products SET stock_quantity=$1,updated_at=now() WHERE id=$2::uuid AND deleted_at IS NULL RETURNING id,stock_quantity", [stock,id]);
      } else return fail("Unsupported product update.");
    } else if (body.action === "order") {
      if (!/^[0-9a-f-]{36}$/i.test(id) || !orderStatuses.includes(body.status)) return fail("Invalid order update.");
      result = await sql.query("UPDATE public.orders SET status=$1,updated_at=now() WHERE id=$2::uuid AND deleted_at IS NULL RETURNING id,status", [body.status,id]);
    } else if (body.action === "feature") {
      if (!/^[0-9a-f-]{36}$/i.test(id) || typeof body.enabled !== "boolean") return fail("Invalid feature control.");
      result = await sql.query("UPDATE public.platform_feature_controls SET enabled=$1,updated_at=now() WHERE id=$2::uuid RETURNING id,enabled", [body.enabled,id]);
    } else if (body.action === "setting") {
      const key = String(body.key || "");
      const allowed = ["platform_name","default_currency","support_email","maintenance_mode","included_storage_bytes"];
      if (!allowed.includes(key)) return fail("This setting is not editable here.");
      result = await sql.query("INSERT INTO public.platform_settings(setting_key,setting_value,updated_at) VALUES($1,$2::jsonb,now()) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=now() RETURNING setting_key,setting_value,updated_at", [key,JSON.stringify(body.value)]);
    } else if (body.action === "create_feature") {
      const key = String(body.feature_key || "").toLowerCase().trim();
      const label = String(body.label || "").trim().slice(0,100);
      if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(key) || !label) return fail("Enter a valid feature key and label.");
      result = await sql.query("INSERT INTO public.platform_feature_controls(feature_key,label,enabled) VALUES($1,$2,false) RETURNING id,feature_key,label,enabled", [key,label]);
    } else if (body.action === "create_tenant") {
      const name = String(body.name || "").trim().slice(0,160);
      const slug = String(body.slug || "").toLowerCase().trim();
      const category = String(body.category || "").trim().slice(0,100);
      const url = String(body.storefront_url || "").trim();
      if (!name || !/^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$/.test(slug)) return fail("Enter a business name and a valid unique storefront slug.");
      if (url && !/^https:\/\/[a-z0-9.-]+(?::[0-9]+)?(?:\/[^\s]*)?$/i.test(url)) return fail("Storefront URL must be a valid HTTPS URL.");
      result = await sql.query("INSERT INTO public.tenants(name,slug,category,storefront_url,status) VALUES($1,$2,$3,$4,'setup') RETURNING id,name,slug,status,storefront_url", [name,slug,category || null,url || null]);
      if (result[0]?.id) {
        await sql.query("UPDATE public.tenant_storage_accounts SET capacity_bytes=COALESCE((SELECT (setting_value #>> '{}')::bigint FROM public.platform_settings WHERE setting_key='included_storage_bytes'),capacity_bytes),updated_at=now() WHERE tenant_id=$1::uuid", [result[0].id]);
      }
    } else if (body.action === "create_product") {
      const tenantId = String(body.tenant_id || "");
      const name = String(body.name || "").trim().slice(0,180);
      const slug = String(body.slug || "").toLowerCase().trim();
      const price = Number(body.price_minor);
      const stock = Number(body.stock_quantity);
      const sku = String(body.sku || "").trim().slice(0,80);
      if (!/^[0-9a-f-]{36}$/i.test(tenantId) || !name || !/^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$/.test(slug) || !Number.isSafeInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return fail("Complete the product details with a valid storefront, slug, price and stock quantity.");
      result = await sql.query("INSERT INTO public.products(tenant_id,name,slug,price_minor,sku,stock_quantity,currency,is_published) SELECT id,$2,$3,$4,$5,$6,COALESCE((SELECT setting_value #>> '{}' FROM public.platform_settings WHERE setting_key='default_currency'),'NGN'),false FROM public.tenants WHERE id=$1::uuid AND status <> 'deleted' RETURNING id,name,slug,price_minor,stock_quantity,is_published", [tenantId,name,slug,price,sku || null,stock]);
    } else return fail("Unknown workspace action.");
    if (!result.length) return fail("The requested record was not found.",404);
    await sql.query("INSERT INTO public.audit_events(action,entity_type,entity_id,metadata) VALUES($1,'workspace',$2,$3::jsonb)", [String(body.action),String(body.id || body.key || body.feature_key || ""),JSON.stringify({field:body.field || null,actor:"platform_owner"})]);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Master workspace update failed", error);
    return fail("The update could not be saved. Review the record and database permissions.", 503);
  }
}
