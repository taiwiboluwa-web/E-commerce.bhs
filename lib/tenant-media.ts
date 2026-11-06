import { randomUUID } from "node:crypto";
import { storeOptimizedImage } from "./media";
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
