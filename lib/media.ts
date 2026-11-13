import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

const ORIGINALS_BUCKET = "bhs-commerce-media";
const OPTIMIZED_BUCKET = "bhs-commerce-optimized";
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const WIDTHS = [480, 960, 1600] as const;

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function getStorageClient() {
  const { AWS_ENDPOINT_URL_S3, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
  if (!AWS_ENDPOINT_URL_S3 || !AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error("Neon Object Storage is not configured.");
  }
  return new S3Client({
    region: AWS_REGION,
    endpoint: AWS_ENDPOINT_URL_S3,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}

export type StoredImageVariant = { width: number; avifUrl: string; webpUrl: string; avifKey: string; webpKey: string; avifBytes: number; webpBytes: number };

export type StoredImage = {
  id: string;
  originalKey: string;
  width: number;
  height: number;
  variants: StoredImageVariant[];
  fallbackUrl: string;
  originalBytes: number;
  optimizedBytes: number;
};

/**
 * Store the untouched upload privately and create responsive AVIF/WebP derivatives.
 * IMPORTANT: tenantId must come from a server-verified session, never request input.
 */
export async function storeOptimizedImage(input: {
  buffer: Buffer;
  contentType: string;
  tenantId: string;
}): Promise<StoredImage> {
  const { buffer, contentType, tenantId } = input;
  if (!allowedTypes.has(contentType)) throw new Error("Unsupported image format.");
  if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) throw new Error("Image must be 100 MB or smaller.");

  const id = randomUUID();
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as const)[contentType as "image/jpeg" | "image/png" | "image/webp" | "image/avif"];
  const prefix = `${tenantId}/${id}`;
  const originalKey = `${prefix}/original.${extension}`;
  const client = getStorageClient();
  const metadata = await sharp(buffer, { failOn: "error", limitInputPixels: 80_000_000 }).rotate().metadata();
  if (!metadata.width || !metadata.height) throw new Error("The uploaded image could not be decoded.");

  await client.send(new PutObjectCommand({
    Bucket: ORIGINALS_BUCKET,
    Key: originalKey,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "private, no-store",
  }));

  const endpoint = process.env.AWS_ENDPOINT_URL_S3!.replace(/\/$/, "");
  const publicUrl = (key: string) => `${endpoint}/${OPTIMIZED_BUCKET}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const variants: StoredImageVariant[] = [];

  const targetWidths = [...new Set(WIDTHS.map((width) => Math.min(width, metadata.width!)))];
  for (const width of targetWidths) {
    const pipeline = sharp(buffer, { failOn: "error", limitInputPixels: 80_000_000 })
      .rotate()
      .resize({ width, withoutEnlargement: true });
    const [avif, webp] = await Promise.all([
      pipeline.clone().avif({ quality: 58, effort: 5 }).toBuffer(),
      pipeline.clone().webp({ quality: 84, effort: 5 }).toBuffer(),
    ]);
    const actualWidth = width;
    const avifKey = `${prefix}/w${actualWidth}.avif`;
    const webpKey = `${prefix}/w${actualWidth}.webp`;
    await Promise.all([
      client.send(new PutObjectCommand({ Bucket: OPTIMIZED_BUCKET, Key: avifKey, Body: avif, ContentType: "image/avif", CacheControl: "public, max-age=31536000, immutable" })),
      client.send(new PutObjectCommand({ Bucket: OPTIMIZED_BUCKET, Key: webpKey, Body: webp, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" })),
    ]);
    variants.push({ width: actualWidth, avifUrl: publicUrl(avifKey), webpUrl: publicUrl(webpKey), avifKey, webpKey, avifBytes: avif.length, webpBytes: webp.length });
  }

  const largest = variants[variants.length - 1];
  return {
    id,
    originalKey,
    width: metadata.width,
    height: metadata.height,
    variants,
    fallbackUrl: largest.webpUrl,
    originalBytes: buffer.byteLength,
    optimizedBytes: variants.reduce((total, variant) => total + variant.avifBytes + variant.webpBytes, 0),
  };
}


/** Remove the private original and every generated derivative. Safe to retry. */
export async function deleteStoredImageObjects(input: {
  originalKey: string;
  variants: StoredImageVariant[];
}): Promise<void> {
  const client = getStorageClient();
  await Promise.all([
    client.send(new DeleteObjectCommand({ Bucket: ORIGINALS_BUCKET, Key: input.originalKey })),
    ...input.variants.flatMap((variant) => [
      client.send(new DeleteObjectCommand({ Bucket: OPTIMIZED_BUCKET, Key: variant.avifKey })),
      client.send(new DeleteObjectCommand({ Bucket: OPTIMIZED_BUCKET, Key: variant.webpKey })),
    ]),
  ]);
}


/** Remove private originals after derivatives exist; client quota remains based on original upload size. */
export async function compactTenantOriginalImages(tenantId: string): Promise<{ processed: number; physicalBytesBefore: number; physicalBytesAfter: number; savedBytes: number }> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!/^[0-9a-f-]{36}$/i.test(tenantId)) throw new Error("Invalid storefront.");
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);
  const assets = await sql.query("WITH tenant_context AS MATERIALIZED (SELECT set_config('app.tenant_id',$1,true)) SELECT a.id,a.original_object_key,a.optimized_size_bytes,a.storage_footprint_bytes FROM tenant_context CROSS JOIN public.media_assets a WHERE a.tenant_id=$1::uuid AND a.media_type='image' AND a.status='active' AND a.original_object_key IS NOT NULL ORDER BY a.created_at ASC", [tenantId]);
  const client = getStorageClient();
  let processed = 0, before = 0, after = 0;
  for (const asset of assets) {
    const key = String(asset.original_object_key || '');
    if (!key) continue;
    await client.send(new DeleteObjectCommand({ Bucket: ORIGINALS_BUCKET, Key: key }));
    const optimized = Math.max(0, Number(asset.optimized_size_bytes || 0));
    const footprint = Math.max(0, Number(asset.storage_footprint_bytes || 0));
    await sql.query("WITH tenant_context AS MATERIALIZED (SELECT set_config('app.tenant_id',$1,true)) UPDATE public.media_assets a SET storage_footprint_bytes=$2,updated_at=now() FROM tenant_context WHERE a.id=$3::uuid AND a.tenant_id=$1::uuid AND a.status='active'", [tenantId, optimized, asset.id]);
    processed++; before += footprint; after += optimized;
  }
  return { processed, physicalBytesBefore: before, physicalBytesAfter: after, savedBytes: Math.max(0, before-after) };
}
