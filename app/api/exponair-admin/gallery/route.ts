import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { hasExponairSession } from "../../../../lib/exponair-admin-auth";
import { randomUUID, createHash, createHmac } from "node:crypto";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ORIGINALS="bhs-commerce-media";
const OPTIMIZED="bhs-commerce-optimized";
const MAX_BYTES=500*1024*1024;
const ALLOWED:Record<string,"image"|"video"|"audio">={
 "image/jpeg":"image","image/png":"image","video/mp4":"video","video/x-matroska":"video",
 "application/x-matroska":"video","audio/mpeg":"audio"
};
function sql(){if(!process.env.DATABASE_URL)throw new Error("Database is not configured.");return neon(process.env.DATABASE_URL);}
function storage(){const e=process.env;if(!e.AWS_ENDPOINT_URL_S3||!e.AWS_REGION||!e.AWS_ACCESS_KEY_ID||!e.AWS_SECRET_ACCESS_KEY)throw new Error("Object storage is not configured.");return new S3Client({region:e.AWS_REGION,endpoint:e.AWS_ENDPOINT_URL_S3,credentials:{accessKeyId:e.AWS_ACCESS_KEY_ID,secretAccessKey:e.AWS_SECRET_ACCESS_KEY},forcePathStyle:true,requestChecksumCalculation:"WHEN_REQUIRED"});}
function hmac(key:Buffer|string,value:string){return createHmac("sha256",key).update(value).digest();}
function encodePath(path:string){return path.split("/").map(encodeURIComponent).join("/");}
function signedPutUrl(bucket:string,key:string,type:string){
 const endpoint=new URL(process.env.AWS_ENDPOINT_URL_S3!);const region=process.env.AWS_REGION!;
 const now=new Date();const amz=now.toISOString().replace(/[:-]|\.\d{3}/g,"");const day=amz.slice(0,8);
 const path=(endpoint.pathname.replace(/\/$/,"")+"/"+bucket+"/"+encodePath(key)).replace(/\/+/g,"/");
 const scope=day+"/"+region+"/s3/aws4_request";
 const params=new URLSearchParams({ "X-Amz-Algorithm":"AWS4-HMAC-SHA256","X-Amz-Credential":process.env.AWS_ACCESS_KEY_ID!+"/"+scope,"X-Amz-Date":amz,"X-Amz-Expires":"900","X-Amz-SignedHeaders":"host" });
 const query=[...params.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>encodeURIComponent(k)+"="+encodeURIComponent(v)).join("&");
 const canonical="PUT\n"+path+"\n"+query+"\nhost:"+endpoint.host+"\n\nhost\nUNSIGNED-PAYLOAD";
 const toSign="AWS4-HMAC-SHA256\n"+amz+"\n"+scope+"\n"+createHash("sha256").update(canonical).digest("hex");
 const kDate=hmac("AWS4"+process.env.AWS_SECRET_ACCESS_KEY!,day);
 const kRegion=hmac(kDate,region),kService=hmac(kRegion,"s3"),kSigning=hmac(kService,"aws4_request");
 const signature=createHmac("sha256",kSigning).update(toSign).digest("hex");
 return endpoint.origin+path+"?"+query+"&X-Amz-Signature="+signature;
}
async function exponairTenant(){
 const rows=await sql().query("SELECT id FROM public.tenants WHERE slug='exponair-events-management' AND deleted_at IS NULL LIMIT 1");
 if(!rows[0])throw new Error("Exponair storefront tenant was not found.");
 return String(rows[0].id);
}
function denied(){return NextResponse.json({error:"Please sign in to the Exponair media control room."},{status:401});}

export async function GET(req:NextRequest){
 const admin=req.nextUrl.searchParams.get("admin")==="1";
 if(admin&&!hasExponairSession(req))return denied();
 try{
  const tenantId=await exponairTenant();
  const rows=await sql().query("WITH tenant_context AS MATERIALIZED (SELECT set_config('app.tenant_id',$1,true)) SELECT g.id,g.title,g.category,g.media_kind,g.mime_type,g.public_url,g.poster_url,g.created_at,g.published FROM tenant_context CROSS JOIN public.exponair_gallery g WHERE g.tenant_id=$1::uuid "+(admin?"":"AND g.published=true")+" ORDER BY g.created_at DESC",[tenantId]);
  const capacity=await sql().query("SELECT * FROM public.get_tenant_storage_capacity($1::uuid)",[tenantId]);
  return NextResponse.json({items:rows,storage:capacity[0]||{capacity_bytes:2147483648,used_bytes:0,available_bytes:2147483648}});
 }catch(e){console.error("Exponair gallery read failed",e);return NextResponse.json({error:"Gallery data is temporarily unavailable."},{status:503});}
}

export async function POST(req:NextRequest){
 if(!hasExponairSession(req))return denied();
 try{
  const body=await req.json();
  const action=String(body.action||"");
  const tenantId=await exponairTenant();
  if(action==="prepare"){
   const mime=String(body.mimeType||"").toLowerCase(),size=Number(body.size);
   const kind=ALLOWED[mime];
   if(!kind||!Number.isSafeInteger(size)||size<1||size>MAX_BYTES)return NextResponse.json({error:"Use JPEG/PNG images or MP4/MKV videos or MP3 audio, up to 500 MB per file."},{status:400});
   const key=randomUUID()+"-"+String(body.fileName||"upload").replace(/[^a-zA-Z0-9._-]/g,"_").slice(-100);
   const assetRows=await sql().query("SELECT public.reserve_media_upload($1::uuid,$2,$3,$4) AS asset_id",[tenantId,kind==="image"?"image":"video",size,randomUUID()]);
   const assetId=String(assetRows[0].asset_id);
   const objectKey=tenantId+"/exponair/"+key;
   const uploadUrl=signedPutUrl(ORIGINALS,objectKey,mime);
   return NextResponse.json({assetId,objectKey,uploadUrl,kind,mimeType:mime});
  }
  if(action==="complete"){
   const assetId=String(body.assetId||""),objectKey=String(body.objectKey||""),mime=String(body.mimeType||"");
   if(!/^[0-9a-f-]{36}$/i.test(assetId)||!objectKey.startsWith(tenantId+"/exponair/")||!ALLOWED[mime])return NextResponse.json({error:"Invalid upload completion."},{status:400});
   const client=storage();
   const head=await client.send(new HeadObjectCommand({Bucket:ORIGINALS,Key:objectKey}));
   const size=Number(head.ContentLength||0);
   if(!size||size>MAX_BYTES)throw new Error("Uploaded object size is invalid.");
   const kind=ALLOWED[mime],publicKey="exponair/"+objectKey.split("/").slice(-1)[0];
   await client.send(new (await import("@aws-sdk/client-s3")).CopyObjectCommand({Bucket:OPTIMIZED,Key:publicKey,CopySource:encodeURIComponent(ORIGINALS+"/"+objectKey).replace(/%2F/g,"/"),ContentType:mime,MetadataDirective:"REPLACE",CacheControl:"public, max-age=31536000, immutable"}));
   const endpoint=process.env.AWS_ENDPOINT_URL_S3!.replace(/\/$/,"");
   const publicUrl=endpoint+"/"+OPTIMIZED+"/"+publicKey.split("/").map(encodeURIComponent).join("/");
   const title=String(body.title||"").trim().slice(0,120),category=String(body.category||"Events").trim().slice(0,80);
   await sql().query("SELECT public.finalize_media_upload($1::uuid,$2::uuid,$3,'{}'::jsonb,0,$4)",[assetId,tenantId,objectKey,size]);
   const inserted=await sql().query("INSERT INTO public.exponair_gallery(tenant_id,media_asset_id,title,category,media_kind,mime_type,public_url,object_key) VALUES($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8) RETURNING id,title,category,media_kind,mime_type,public_url,created_at,published",[tenantId,assetId,title,category,kind,mime,publicUrl,publicKey]);
   return NextResponse.json({ok:true,item:inserted[0]});
  }
  if(action==="publish"||action==="delete"){
   const id=String(body.id||"");if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Invalid media item."},{status:400});
   if(action==="publish"){
    const rows=await sql().query("WITH tenant_context AS MATERIALIZED (SELECT set_config('app.tenant_id',$1,true)) UPDATE public.exponair_gallery g SET published=$2,updated_at=now() FROM tenant_context WHERE g.id=$3::uuid AND g.tenant_id=$1::uuid RETURNING g.id,g.published",[tenantId,Boolean(body.published),id]);
    return NextResponse.json({ok:true,item:rows[0]});
   }
   const rows=await sql().query("WITH tenant_context AS MATERIALIZED (SELECT set_config('app.tenant_id',$1,true)) SELECT g.media_asset_id,g.object_key FROM tenant_context CROSS JOIN public.exponair_gallery g WHERE g.id=$2::uuid AND g.tenant_id=$1::uuid",[tenantId,id]);
   if(!rows[0])return NextResponse.json({error:"Media item not found."},{status:404});
   const item=rows[0];
   await clientDelete(item.object_key);
   await sql().query("DELETE FROM public.exponair_gallery WHERE id=$1::uuid AND tenant_id=$2::uuid",[id,tenantId]);
   await sql().query("SELECT public.release_media_upload($1::uuid,$2::uuid,'deleted')",[item.media_asset_id,tenantId]);
   return NextResponse.json({ok:true});
  }
  return NextResponse.json({error:"Unsupported action."},{status:400});
 }catch(e){
  console.error("Exponair media operation failed",e);
  const message=e instanceof Error?e.message:"Unable to process media.";
  const status=message.includes("STORAGE_CAPACITY_EXCEEDED")?413:503;
  return NextResponse.json({error:status===413?"Storage limit reached. Delete an existing file or increase storage capacity before uploading.":message},{status});
 }
}
async function clientDelete(key:string){const {DeleteObjectCommand}=await import("@aws-sdk/client-s3");await storage().send(new DeleteObjectCommand({Bucket:OPTIMIZED,Key:key}));}
