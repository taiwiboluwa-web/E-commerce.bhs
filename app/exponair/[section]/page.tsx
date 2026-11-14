import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import ExponairStorefront from "../../store/[slug]/exponair-storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://e-commerce-bhs.vercel.app"),
  title: "Exponair Events | Thoughtfully Planned. Beautifully Celebrated.",
  description: "Explore Exponair's event services, packages, gallery, reviews and booking information in Lagos, Nigeria.",
  alternates: { canonical: "https://e-commerce-bhs.vercel.app/exponair" },
  openGraph: {
    siteName: "Exponair Events Management Limited",
    title: "Exponair Events | Passionately Bringing Events to Life",
    description: "Kiddies' parties, social celebrations, weddings, corporate events and event rentals in Lagos.",
    url: "https://e-commerce-bhs.vercel.app/exponair",
    type: "website",
    locale: "en_NG",
    images: [{
      url: "https://e-commerce-bhs.vercel.app/exponair/opengraph-image?v=20261114-2",
      width: 1200,
      height: 630,
      type: "image/png",
      alt: "Exponair Events Management Limited logo and brand identity",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Exponair Events | Passionately Bringing Events to Life",
    images: ["https://e-commerce-bhs.vercel.app/exponair/opengraph-image?v=20261114-2"],
  },
};

const pages: Record<string, "services" | "packages" | "gallery" | "faqs" | "booking" | "terms" | "reviews"> = {
  services: "services",
  packages: "packages",
  gallery: "gallery",
  faqs: "faqs",
  booking: "booking",
  terms: "terms",
  reviews: "reviews",
};

const legacy: Record<string, string> = {
  "our-story": "/exponair",
  "kiddies-parties": "/exponair/services",
  celebrations: "/exponair/services",
  weddings: "/exponair/services",
  corporate: "/exponair/services",
  rentals: "/exponair/services",
  journal: "/exponair/faqs",
};

export default async function ExponairSectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const page = pages[section];
  if (!page) {
    if (legacy[section]) redirect(legacy[section]);
    notFound();
  }

  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    const records = await sql.query("SELECT id,status,access_expires_at FROM public.tenants WHERE slug='exponair-events-management' AND deleted_at IS NULL LIMIT 1");
    const tenant = records[0] as { id: string; status: string; access_expires_at: string | null } | undefined;
    if (tenant) {
      const expired = Boolean(tenant.access_expires_at && new Date(tenant.access_expires_at).getTime() <= Date.now());
      if (expired && tenant.status === "active") {
        await sql.query("UPDATE public.tenants SET status='suspended'::public.tenant_status,access_suspended_at=COALESCE(access_suspended_at,now()),updated_at=now() WHERE id=$1::uuid", [tenant.id]);
      }
      if (expired || tenant.status !== "active") {
        return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#09090b", color: "#f5f3ef", fontFamily: "Arial,sans-serif", textAlign: "center" }}><section style={{ maxWidth: 520 }}><p style={{ letterSpacing: ".22em", fontSize: 11, color: "#d4b15b" }}>STOREFRONT TEMPORARILY UNAVAILABLE</p><h1 style={{ fontSize: "clamp(30px,6vw,52px)", fontWeight: 500 }}>This storefront is taking a short pause.</h1><p style={{ color: "#aaa", lineHeight: 1.7 }}>The store owner is arranging access renewal. Please check back shortly.</p></section></main>;
      }
    }
  }

  return <ExponairStorefront page={page} />;
}
