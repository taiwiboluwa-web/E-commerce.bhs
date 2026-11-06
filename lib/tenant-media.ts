import { randomUUID } from "node:crypto";
import { deleteStoredImageObjects, storeOptimizedImage, type StoredImageVariant } from "./media";
import { neon } from "@neondatabase/serverless";
import {
  finalizeMediaCapacity,
  releaseMediaCapacity,
  reserveMediaCapacity,
} from "./storage-quota";

/**
 * Orchestrates quota reservation and image optimisation.
 * tenantId MUST be taken from a server-verified session, never form data or headers.
 * If processing fails, the reservation is released exactly once.
 */
export async function storeTenantImage(input: {
  tenantId: string;
  buffer: Buffer;
  contentType: string;
  idempotencyKey?: string;
}) {
  const idempotencyKey = input.idempotencyKey ?? randomUUID();
  const assetId = await reserveMediaCapacity({
    tenantId: input.tenantId,
    mediaType: "image",
    originalBytes: input.buffer.byteLength,
    idempotencyKey,
  });

  try {
    const stored = await storeOptimizedImage({
      buffer: input.buffer,
      contentType: input.contentType,
      tenantId: input.tenantId,
    });
    const optimizedBytes = stored.variants.reduce(
      (total, variant) => total + variant.avifBytes + variant.webpBytes,
      0,
    );
    const physicalFootprintBytes = input.buffer.byteLength + optimizedBytes;
    const finalized = await finalizeMediaCapacity({
      tenantId: input.tenantId,
      assetId,
      originalObjectKey: stored.originalKey,
      optimizedManifest: stored.variants,
      optimizedBytes,
      physicalFootprintBytes,
    });
    if (!finalized) throw new Error("The media upload could not be finalized.");
    return { ...stored, assetId, quotaBytes: input.buffer.byteLength, physicalFootprintBytes };
  } catch (error) {
    await releaseMediaCapacity({ tenantId: input.tenantId, assetId, status: "failed" });
    throw error;
  }
}


/**
 * Permanently removes a tenant image and releases its original-upload quota.
 * tenantId must come from a server-verified session. Never accept it from the browser.
 */
export async function deleteTenantImage(input: {
  tenantId: string;
  assetId: string;
}): Promise<number> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    WITH tenant_context AS MATERIALIZED (
      SELECT set_config('app.tenant_id', ${input.tenantId}, true)
    )
    SELECT a.original_object_key, a.optimized_manifest, a.status
    FROM tenant_context
    CROSS JOIN public.media_assets a
    WHERE a.id = ${input.assetId}::uuid AND a.tenant_id = ${input.tenantId}::uuid
      AND a.media_type = 'image'
  `;
  const asset = rows[0];
  if (!asset) throw new Error("Media asset not found.");
  if (asset.status === "deleted" || asset.status === "failed") return 0;
  if (!asset.original_object_key) throw new Error("Media asset has no stored original object key.");

  const manifest = asset.optimized_manifest as { variants?: StoredImageVariant[] } | StoredImageVariant[];
  const variants = Array.isArray(manifest) ? manifest : (manifest?.variants ?? []);
  await deleteStoredImageObjects({ originalKey: String(asset.original_object_key), variants });
  return releaseMediaCapacity({ tenantId: input.tenantId, assetId: input.assetId, status: "deleted" });
}
