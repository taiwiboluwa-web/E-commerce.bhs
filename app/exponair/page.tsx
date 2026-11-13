import type { Metadata } from "next";
import ExponairStorefront from "../store/[slug]/exponair-storefront";

export const metadata: Metadata = {
  title: "Exponair Events Management Limited | Event Planners, Kiddies' Parties & Styling in Lagos",
  description: "Passionately bringing events to life. Exponair plans kiddies' parties, adult celebrations, weddings, corporate events, event styling and rentals across Lagos, Nigeria.",
  keywords: [
    "kiddies party planners in Lagos",
    "children's birthday decoration Lagos",
    "luxury kiddies birthday celebrations",
    "adult birthday event planners Lagos",
    "wedding and proposal decoration Lagos",
    "corporate event planners Lagos",
    "event rentals Lagos",
    "event styling and coordination Nigeria",
  ],
  alternates: { canonical: "/exponair" },
  openGraph: {
    siteName: "Exponair Events Management Limited",
    title: "Exponair Events | Passionately Bringing Events to Life",
    description: "Kiddies' parties, social celebrations, weddings, corporate events and event rentals in Lagos.",
    type: "website",
    locale: "en_NG",
    images: [{ url: "/exponair-logo.svg", alt: "Exponair Events Management Limited logo" }],
  },
};

export default function ExponairPage() {
  return <ExponairStorefront />;
}
