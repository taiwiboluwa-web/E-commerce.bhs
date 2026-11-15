import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { hasSPAdminSession } from "@/lib/sp-admin-auth";
import { storeTenantImage } from "@/lib/tenant-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  if (!hasSPAdminSession(req)) return NextResponse.json({ error: "Please sign in to upload product images." }, { status: 401 });
  try {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
    const form = await req.formData(); const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: "Image must be 100 MB or smaller." }, { status: 413 });
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql.query("SELECT id FROM public.tenants WHERE slug='sp-clothing-services' AND deleted_at IS NULL LIMIT 1") as any[];
    if (!rows.length) return NextResponse.json({ error: "Storefront not found." }, { status: 404 });
    const result = await storeTenantImage({ tenantId: String(rows[0].id), buffer: Buffer.from(await file.arrayBuffer()), contentType: file.type });
    return NextResponse.json({ url: result.fallbackUrl, assetId: result.assetId, originalBytes: result.quotaBytes });
  } catch (error) {
    console.error("SP product image upload failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed. Please try again." }, { status: 503 });
  }
}
