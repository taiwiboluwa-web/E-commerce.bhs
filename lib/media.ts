import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

const ORIGINALS_BUCKET = "bhs-commerce-media";
const OPTIMIZED_BUCKET = "bhs-commerce-optimized";
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
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

export type StoredImageVariant = { width: number; avifUrl: string; webpUrl: string };

export type StoredImage = {
  id: string;
  originalKey: string;
  width: number;
  height: number;
  variants: StoredImageVariant[];
  fallbackUrl: string;
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
  if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) throw new Error("Image must be smaller than 15 MB.");

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
    variants.push({ width: actualWidth, avifUrl: publicUrl(avifKey), webpUrl: publicUrl(webpKey) });
  }

  const largest = variants[variants.length - 1];
  return {
    id,
    originalKey,
    width: metadata.width,
    height: metadata.height,
    variants,
    fallbackUrl: largest.webpUrl,
  };
}
