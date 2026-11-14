import { redirect, notFound } from "next/navigation";

const destinations: Record<string,string> = {
  "our-story":"#about",
  "kiddies-parties":"#kiddies",
  "celebrations":"#adult",
  "weddings":"#weddings",
  "corporate":"#corporate",
  "rentals":"#rentals",
  "packages":"#packages",
  "reviews":"#reviews",
  "journal":"#journal"
};

export default async function ExponairSectionRoute({params}:{params:Promise<{section:string}>}) {
  const {section}=await params;
  const anchor=destinations[section];
  if(!anchor) notFound();
  redirect("/exponair"+anchor);
}
