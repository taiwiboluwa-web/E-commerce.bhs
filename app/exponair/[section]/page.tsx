import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ExponairSectionPage from "../../store/[slug]/exponair-section-page";

const sections = ["our-story","kiddies-parties","celebrations","weddings","corporate","rentals","packages","reviews","journal"];
const labels: Record<string,string> = {
  "our-story":"Our Story","kiddies-parties":"Kiddies' Parties","celebrations":"Celebrations","weddings":"Weddings & Special Occasions","corporate":"Corporate Events","rentals":"Event Rentals & Styling","packages":"Packages & Pricing","reviews":"Client Reviews","journal":"The Exponair Journal"
};
export function generateStaticParams(){ return sections.map(section=>({section})); }
export async function generateMetadata({params}:{params:Promise<{section:string}>}):Promise<Metadata>{
  const {section}=await params;
  if(!sections.includes(section)) return {title:"Page Not Found | Exponair"};
  return {title:labels[section]+" | Exponair Events Management Limited",description:"Explore "+labels[section].toLowerCase()+" from Exponair Events Management Limited in Lagos, Nigeria.",alternates:{canonical:"/exponair/"+section},openGraph:{title:labels[section]+" | Exponair Events",siteName:"Exponair Events Management Limited",type:"website",locale:"en_NG"}};
}
export default async function ExponairSectionRoute({params}:{params:Promise<{section:string}>}){
 const {section}=await params;
 if(!sections.includes(section)) notFound();
 return <ExponairSectionPage section={section}/>;
}
