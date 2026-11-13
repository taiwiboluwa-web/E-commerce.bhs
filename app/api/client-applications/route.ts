import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function authorized(req:NextRequest){const secret=(process.env.BHS_MASTER_ADMIN_KEY || process.env.BHS_APPLICATIONS_ADMIN_KEY);const provided=req.headers.get("x-bhs-admin-key")||"";if(!secret||!provided)return false;const a=Buffer.from(secret),b=Buffer.from(provided);return a.length===b.length&&timingSafeEqual(a,b);}
function database(){if(!process.env.DATABASE_URL)throw new Error("Database connection is not configured.");return neon(process.env.DATABASE_URL);}
export async function GET(req:NextRequest){
 if(!(process.env.BHS_MASTER_ADMIN_KEY || process.env.BHS_APPLICATIONS_ADMIN_KEY))return NextResponse.json({error:"Dashboard access is not configured. Add BHS_APPLICATIONS_ADMIN_KEY to the Vercel project environment."},{status:503});
 if(!authorized(req))return NextResponse.json({error:"Access key not accepted."},{status:401});
 try{const sql=database();const applications=await sql`SELECT id,business_name,contact_name,email,phone,whatsapp,business_category,business_description,storefront_name,preferred_slug,current_sales_channel,product_count,requested_features,design_preference,storage_need,launch_timeline,budget_range,special_requirements,contact_consent,status,created_at,plan_code,plan_price_minor,included_storage_bytes,storage_addon_request,onboarding_details,marketing_consent,tenant_id,reviewed_at,reviewed_by FROM public.client_applications ORDER BY created_at DESC LIMIT 500`;return NextResponse.json({applications});}
 catch(e){console.error("Applications read failed",e);return NextResponse.json({error:"Unable to retrieve applications. Check the database connection and onboarding table."},{status:503});}
}
export async function PATCH(req:NextRequest){
 if(!(process.env.BHS_MASTER_ADMIN_KEY || process.env.BHS_APPLICATIONS_ADMIN_KEY))return NextResponse.json({error:"Dashboard access is not configured."},{status:503});
 if(!authorized(req))return NextResponse.json({error:"Access key not accepted."},{status:401});
 try{
  const body=await req.json();
  const id=typeof body.id==="string"?body.id:"";
  const status=typeof body.status==="string"?body.status:"";
  const storefrontUrl=typeof body.storefront_url==="string"?body.storefront_url.trim():"";
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||!["new","reviewing","approved","declined","converted"].includes(status))return NextResponse.json({error:"Invalid application or status."},{status:400});
  if(storefrontUrl && !/^https:\/\/[a-z0-9.-]+(?::[0-9]+)?(?:\/[^\s]*)?$/i.test(storefrontUrl))return NextResponse.json({error:"Storefront URL must be a valid HTTPS URL."},{status:400});
  const sql=database();
  if(status==="approved"){
    const provisioned=await sql`SELECT * FROM public.approve_client_application(${id}::uuid,${storefrontUrl||null})`;
    if(!provisioned.length)return NextResponse.json({error:"Application could not be provisioned."},{status:500});
    return NextResponse.json({ok:true,application:{id,status:"approved",tenant_id:provisioned[0].tenant_id,storefront_url:provisioned[0].storefront_url,tenant_slug:provisioned[0].tenant_slug,tenant_status:provisioned[0].tenant_status},provisioned:true});
  }
  const rows=await sql`UPDATE public.client_applications SET status=${status},updated_at=now() WHERE id=${id}::uuid AND tenant_id IS NULL RETURNING id,status,tenant_id`;
  if(!rows.length)return NextResponse.json({error:"Application not found, or already provisioned. Refresh to see its linked storefront."},{status:409});
  return NextResponse.json({ok:true,application:rows[0],provisioned:false});
 }catch(e){console.error("Application status update failed",e);return NextResponse.json({error:"Unable to update application or provision its tenant. Check the database function and tenant storage/subscription tables."},{status:503});}
}
