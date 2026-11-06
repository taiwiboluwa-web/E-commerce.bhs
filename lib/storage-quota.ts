import "server-only";
import { neon } from "@neondatabase/serverless";

const DEFAULT_INCLUDED_CAPACITY_BYTES = 2 * 1024 * 1024 * 1024;

function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  return neon(process.env.DATABASE_URL);
}

export type MediaKind = "image" | "video";
export type MediaReleaseStatus = "deleted" | "failed";

/**
 * Call only after resolving the tenant from a server-verified session.
 * The browser must never choose tenantId or call these functions directly.
 */
export async function reserveMediaCapacity(input: {
  tenantId: string;
  mediaType: MediaKind;
  originalBytes: number;
  idempotencyKey: string;
}): Promise<string> {
  if (!Number.isSafeInteger(input.originalBytes) || input.originalBytes <= 0) {
    throw new Error("Invalid original upload size.");
  }
  const rows = await db()`
    select public.reserve_media_upload(
      ${input.tenantId}::uuid, ${input.mediaType}, ${input.originalBytes}, ${input.idempotencyKey}
    ) as asset_id
  `;
  if (!rows[0]?.asset_id) throw new Error("Storage capacity exceeded or reservation failed.");
  return String(rows[0].asset_id);
}

export async function finalizeMediaCapacity(input: {
  tenantId: string;
  assetId: string;
  originalObjectKey: string;
  optimizedManifest: unknown;
  optimizedBytes: number;
  physicalFootprintBytes: number;
}): Promise<boolean> {
  const manifest = JSON.stringify(input.optimizedManifest ?? {});
  const rows = await db()`
    select public.finalize_media_upload(
      ${input.assetId}::uuid, ${input.tenantId}::uuid, ${input.originalObjectKey},
      ${manifest}::jsonb, ${input.optimizedBytes}, ${input.physicalFootprintBytes}
    ) as finalized
  `;
  return Boolean(rows[0]?.finalized);
}

export async function releaseMediaCapacity(input: {
  tenantId: string;
  assetId: string;
  status: MediaReleaseStatus;
}): Promise<number> {
  const rows = await db()`
    select public.release_media_upload(
      ${input.assetId}::uuid, ${input.tenantId}::uuid, ${input.status}
    ) as released_bytes
  `;
  return Number(rows[0]?.released_bytes ?? 0);
}

/** Purchases add permanent capacity; the payment reference makes retries idempotent. */
export async function addPurchasedCapacity(input: {
  tenantId: string;
  addedBytes: number;
  paymentReference: string;
}): Promise<number> {
  if (!Number.isSafeInteger(input.addedBytes) || input.addedBytes <= 0) {
    throw new Error("Invalid storage purchase size.");
  }
  const rows = await db()`
    select public.purchase_storage_capacity(
      ${input.tenantId}::uuid, ${input.addedBytes}, ${input.paymentReference}
    ) as capacity_bytes
  `;
  return Number(rows[0]?.capacity_bytes ?? DEFAULT_INCLUDED_CAPACITY_BYTES);
}

export async function getTenantStorageCapacity(tenantId: string) {
  const rows = await db()`
    select * from public.get_tenant_storage_capacity(${tenantId}::uuid)
  `;
  return rows[0] ?? {
    capacity_bytes: DEFAULT_INCLUDED_CAPACITY_BYTES,
    used_bytes: 0,
    available_bytes: DEFAULT_INCLUDED_CAPACITY_BYTES,
  };
}
