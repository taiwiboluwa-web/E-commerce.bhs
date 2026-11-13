import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function database() {
  if (!process.env.DATABASE_URL) throw new Error("Database connection is not configured.");
  return neon(process.env.DATABASE_URL);
}
function isAdmin(req: NextRequest) {
  const secret = process.env.BHS_MASTER_ADMIN_KEY;
  const provided = req.headers.get("x-bhs-admin-key") || "";
  if (!secret || !provided) return false;
  const a = Buffer.from(secret), b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET() {
  try {
    const sql = database();
    const rows = await sql`SELECT id, customer_name, event_type, rating, review_text, created_at
      FROM public.exponair_reviews WHERE status = 'approved'
      ORDER BY approved_at DESC NULLS LAST, created_at DESC LIMIT 30`;
    const stats = await sql`SELECT COUNT(*)::int AS count, COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average
      FROM public.exponair_reviews WHERE status = 'approved'`;
    return NextResponse.json({ reviews: rows, summary: stats[0] || { count: 0, average: 0 } });
  } catch (error) {
    console.error("Exponair reviews read failed", error);
    return NextResponse.json({ error: "Reviews are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
    const eventType = typeof body.eventType === "string" ? body.eventType.trim() : "";
    const review = typeof body.review === "string" ? body.review.trim() : "";
    const rating = Number(body.rating);
    if (name.length < 2 || name.length > 100 || eventType.length < 2 || eventType.length > 120 ||
        review.length < 15 || review.length > 2000 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Please provide your name, event type, a 1–5 star rating and a review of at least 15 characters." }, { status: 400 });
    }
    const sql = database();
    const rows = await sql`INSERT INTO public.exponair_reviews (customer_name, event_type, rating, review_text)
      VALUES (${name}, ${eventType}, ${rating}, ${review})
      RETURNING id, status`;
    return NextResponse.json({ ok: true, review: rows[0], message: "Thank you. Your review has been received and will appear after approval." }, { status: 201 });
  } catch (error) {
    console.error("Exponair review submission failed", error);
    return NextResponse.json({ error: "We couldn't submit your review right now. Please try again shortly." }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
        !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid review or status." }, { status: 400 });
    }
    const sql = database();
    const rows = await sql`UPDATE public.exponair_reviews SET status = ${status},
      approved_at = CASE WHEN ${status} = 'approved' THEN now() ELSE NULL END
      WHERE id = ${id}::uuid RETURNING id, status`;
    if (!rows.length) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    return NextResponse.json({ ok: true, review: rows[0] });
  } catch (error) {
    console.error("Exponair review moderation failed", error);
    return NextResponse.json({ error: "Unable to update review." }, { status: 503 });
  }
}
