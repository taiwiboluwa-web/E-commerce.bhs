import {NextRequest,NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  if(!process.env.DATABASE_URL)return NextResponse.json({error:"Plan information is temporarily unavailable."},{status:503});
  const sql=neon(process.env.DATABASE_URL);
  const plans=await sql.query("SELECT plan_code,display_name,monthly_price_minor,currency,included_storage_bytes,storefront_limit,billing_interval FROM public.commerce_plans WHERE plan_code='starter-10k' AND is_available=true LIMIT 1",[]);
  if(!plans.length)return NextResponse.json({error:"The Starter Storefront plan is currently unavailable."},{status:503});
  const addons=await sql.query("SELECT name,added_bytes,monthly_price_minor,currency FROM public.storage_addon_plans WHERE is_available=true ORDER BY sort_order,name",[]);
  const p=plans[0];
  return NextResponse.json({plan:{planCode:p.plan_code,displayName:p.display_name,monthlyPriceMinor:Number(p.monthly_price_minor),currency:String(p.currency||"NGN").trim(),includedStorageBytes:Number(p.included_storage_bytes),storefrontLimit:Number(p.storefront_limit),billingInterval:p.billing_interval},storageAddons:addons.map(a=>({name:a.name,addedBytes:Number(a.added_bytes),monthlyPriceMinor:Number(a.monthly_price_minor),currency:String(a.currency||"NGN").trim()}))});
 }catch(error){console.error("Public storefront plan lookup failed",error);return NextResponse.json({error:"Unable to load the current storefront plan."},{status:503});}
}

const clean=(v:unknown,max=2000)=>typeof v==="string"?v.trim().slice(0,max):"";
const list=(v:unknown,max=30)=>Array.isArray(v)?v.filter((x):x is string=>typeof x==="string").slice(0,max).map(x=>x.slice(0,120)):[];
const detailKeys=["legalName","registrationStatus","businessRegistrationNumber","contactRole","businessAddress","city","state","country","website","instagram","facebook","tiktok","supportEmail","supportPhone","businessHours","preferredLanguage","domainPreference","domainName","storeTagline","brandColours","brandAssets","designStyle","referenceLinks","seoKeywords","productType","productVariants","catalogueSource","averageOrderValue","currency","productImages","productPriceRange","skuManagement","paymentMethods","paymentAccountStatus","deliveryMethods","serviceAreas","deliveryPricing","orderProcess","stockManagement","shippingPartners","fulfilmentTime","customerSupportChannel","orderNotifications","contentPages","launchSupport","taxRequirements","policies","integrations","staffAccounts","storageAddon","assetLinks","marketingConsent"];
export async function POST(req:NextRequest){
 try{
  const body=await req.json();if(clean(body.websiteTrap,200))return NextResponse.json({ok:true});
  const businessName=clean(body.businessName,160),contactName=clean(body.contactName,120),email=clean(body.email,180).toLowerCase(),phone=clean(body.phone,50),category=clean(body.category,100),storefrontName=clean(body.storefrontName,120),slug=clean(body.preferredSlug,80).toLowerCase().replace(/[^a-z0-9-]/g,""),features=list(body.features,30);
  if(!businessName||!contactName||!email||!phone||!category||!storefrontName||!slug||!clean(body.contactRole,80)||!clean(body.city,100)||!clean(body.state,100)||!clean(body.productType,80)||!clean(body.productCount,80)||!clean(body.currentSalesChannel,120)||!features.length||!clean(body.launchTimeline,80)||body.contactConsent!==true)return NextResponse.json({error:"Please complete the required fields and confirm the privacy notice."},{status:400});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$/.test(slug))return NextResponse.json({error:"Check your email address and preferred storefront address."},{status:400});
  if(!process.env.DATABASE_URL)return NextResponse.json({error:"The application service is not configured. Please try again later."},{status:503});
  const details:Record<string,unknown>={};for(const key of detailKeys){const value=body[key];details[key]=Array.isArray(value)?list(value):typeof value==="boolean"?value:clean(value,2000);}
  const sql=neon(process.env.DATABASE_URL);
  const existingSlug=await sql.query("SELECT id FROM public.tenants WHERE slug=$1 AND deleted_at IS NULL LIMIT 1",[slug]);
  if(existingSlug.length)return NextResponse.json({error:"That storefront address is already in use. Please choose another preferred address."},{status:409});
  const result=await sql.query("INSERT INTO public.client_applications (business_name,contact_name,email,phone,whatsapp,business_category,business_description,storefront_name,preferred_slug,current_sales_channel,product_count,requested_features,design_preference,storage_need,launch_timeline,budget_range,special_requirements,contact_consent,plan_code,plan_price_minor,included_storage_bytes,storage_addon_request,onboarding_details,marketing_consent,privacy_notice_version) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17,true,p.plan_code,p.monthly_price_minor,p.included_storage_bytes,$18,$19::jsonb,$20,$21 FROM public.commerce_plans p WHERE p.plan_code='starter-10k' AND p.is_available RETURNING id",[businessName,contactName,email,phone,clean(body.whatsapp,50)||null,category,clean(body.description,2000)||null,storefrontName,slug,clean(body.currentSalesChannel,120),clean(body.productCount,80),JSON.stringify(features),clean(body.brandAssets,120)||null,clean(body.storageNeed,80)||"2 GB included",clean(body.launchTimeline,80),clean(body.budgetRange,80)||"₦10,000 starter plan",clean(body.specialRequirements,3000)||null,clean(body.storageAddon,100)||null,JSON.stringify(details),body.marketingConsent===true,"bhs-onboarding-2026-11"]);
  if(!result.length)return NextResponse.json({error:"The selected storefront plan is currently unavailable. Please contact BlueHaven Studios."},{status:503});
  return NextResponse.json({ok:true,applicationId:result[0]?.id},{status:201});
 }catch(e){console.error("Client onboarding submission failed",e);return NextResponse.json({error:"We couldn't submit your application right now. Please try again shortly."},{status:500});}
}