import type { Metadata } from "next";
import ExponairStorefront from "../store/[slug]/exponair-storefront";

export const metadata: Metadata = {
  title: "Exponair Events Management Ltd | Kiddies Parties & Events",
  description: "Plan a joyful kiddies party with Exponair Events Management Ltd.",
  alternates: { canonical: "/exponair" },
};

export default function ExponairPage() {
  return <ExponairStorefront />;
}
