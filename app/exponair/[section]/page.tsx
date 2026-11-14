import { notFound, redirect } from "next/navigation";
import ExponairStorefront from "../../store/[slug]/exponair-storefront";

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
  if (page) return <ExponairStorefront page={page} />;
  if (legacy[section]) redirect(legacy[section]);
  notFound();
}
