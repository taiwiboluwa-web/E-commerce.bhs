import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

const clean = (value: unknown, max = 2000) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Quietly accept bot traps without storing spam.
    if (clean(body.website, 200)) return NextResponse.json({ ok: true });
    const businessName = clean(body.businessName, 120);
    const contactName = clean(body.contactName, 120);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone, 40);
    const category = clean(body.category, 100);
    const storefrontName = clean(body.storefrontName, 100);
    const features = Array.isArray(body.features) ? body.features.filter((x: unknown) => typeof x === "string").slice(0, 20) : [];
    const consent = body.contactConsent === true;
    if (!businessName || !contactName || !email || !phone || !category || !storefrontName || !features.length || !consent) {
      return NextResponse.json({ error: "Please complete the required fields and confirm contact consent." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "The application service is not configured yet. Please try again later or contact BlueHaven Studios." }, { status: 503 });
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`INSERT INTO public.client_applications
      (business_name, contact_name, email, phone, whatsapp, business_category, business_description,
       storefront_name, preferred_slug, current_sales_channel, product_count, requested_features,
       design_preference, storage_need, launch_timeline, budget_range, special_requirements, contact_consent)
      VALUES (${businessName}, ${contactName}, ${email}, ${phone}, ${clean(body.whatsapp,40)},
       ${category}, ${clean(body.description,1200)}, ${storefrontName}, ${clean(body.preferredSlug,80)},
       ${clean(body.currentSalesChannel,120)}, ${clean(body.productCount,40)}, ${JSON.stringify(features)}::jsonb,
       ${clean(body.designPreference,120)}, ${clean(body.storageNeed,80)}, ${clean(body.launchTimeline,80)},
       ${clean(body.budgetRange,80)}, ${clean(body.specialRequirements,2000)}, true)
      RETURNING id`;
    return NextResponse.json({ ok: true, applicationId: result[0]?.id }, { status: 201 });
  } catch (error) {
    console.error("Client onboarding submission failed", error);
    return NextResponse.json({ error: "We couldn't submit your application right now. Please try again shortly." }, { status: 500 });
  }
}
