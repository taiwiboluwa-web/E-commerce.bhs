import { notFound } from "next/navigation";
import Home from "@/app/page";

const sections: Record<string,string> = {
  overview: "Overview",
  storefronts: "Storefronts",
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  subscriptions: "Subscriptions",
  payments: "Payments",
  "feature-controls": "Feature controls",
  settings: "Settings",
};

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export default async function WorkspaceSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const initialSection = sections[section];
  if (!initialSection) notFound();
  return <Home initialSection={initialSection} />;
}
