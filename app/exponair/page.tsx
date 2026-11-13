import type { Metadata } from "next";
import ExponairStorefront from "../store/[slug]/exponair-storefront";

export const metadata: Metadata = {
  title: "Exponair Events Management Ltd | Kiddies Parties & Events",
  description: "Creative kiddies party planning, customised decorations, entertainment and rentals for children aged 1–10 in Lagos.",
  alternates: { canonical: "/exponair" },
};

export default function ExponairPage() {
  return <ExponairStorefront />;
}
