-- Monthly, expiring storage add-ons. Included capacity remains 2 GiB.
-- Add-ons are effective only while active and within their paid billing window.
ALTER TABLE public.tenant_storage_accounts
  DROP CONSTRAINT IF EXISTS storage_usage_within_capacity;

CREATE TABLE IF NOT EXISTS public.storage_addon_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  added_bytes bigint NOT NULL CHECK (added_bytes > 0),
  monthly_price_minor bigint NOT NULL CHECK (monthly_price_minor >= 0),
  currency text NOT NULL DEFAULT 'NGN',
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_storage_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  plan_id uuid REFERENCES public.storage_addon_plans(id) ON DELETE SET NULL,
  plan_name_snapshot text NOT NULL,
  added_bytes bigint NOT NULL CHECK (added_bytes > 0),
  monthly_price_minor bigint NOT NULL CHECK (monthly_price_minor >= 0),
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired','suspended')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  payment_reference text,
  auto_renew boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (current_period_end > current_period_start)
);
CREATE INDEX IF NOT EXISTS tenant_storage_addons_active_idx
  ON public.tenant_storage_addons(tenant_id, current_period_end)
  WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS tenant_storage_addons_payment_ref_uq
  ON public.tenant_storage_addons(payment_reference)
  WHERE payment_reference IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_tenant_storage_capacity(p_tenant_id uuid)
RETURNS TABLE(capacity_bytes bigint, used_bytes bigint, available_bytes bigint, addon_bytes bigint, over_capacity boolean)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS 'WITH tenant_context AS MATERIALIZED (SELECT set_config(''app.tenant_id'', $1::text, true)),
base AS (
 SELECT a.capacity_bytes AS base_bytes, a.used_bytes
 FROM tenant_context CROSS JOIN public.tenant_storage_accounts a
 WHERE a.tenant_id = $1
),
addons AS (
 SELECT COALESCE(sum(x.added_bytes),0)::bigint AS addon_bytes
 FROM public.tenant_storage_addons x
 WHERE x.tenant_id = $1 AND x.status = ''active''
   AND x.current_period_start <= now() AND x.current_period_end > now()
)
SELECT (base.base_bytes + addons.addon_bytes)::bigint,
       base.used_bytes,
       greatest(base.base_bytes + addons.addon_bytes - base.used_bytes,0)::bigint,
       addons.addon_bytes,
       (base.used_bytes > base.base_bytes + addons.addon_bytes)
FROM base CROSS JOIN addons';

CREATE OR REPLACE FUNCTION public.reserve_media_upload(
 p_tenant_id uuid,p_media_type text,p_original_size_bytes bigint,p_idempotency_key text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE v_asset_id uuid; v_effective_capacity bigint;
BEGIN
 PERFORM set_config('app.tenant_id',p_tenant_id::text,true);
 IF p_media_type NOT IN ('image','video') OR p_original_size_bytes<=0
    OR p_idempotency_key IS NULL OR length(trim(p_idempotency_key))=0 THEN
   RAISE EXCEPTION 'INVALID_STORAGE_RESERVATION';
 END IF;
 SELECT id INTO v_asset_id FROM public.media_assets
 WHERE tenant_id=p_tenant_id AND idempotency_key=p_idempotency_key;
 IF FOUND THEN RETURN v_asset_id; END IF;

 INSERT INTO public.tenant_storage_accounts(tenant_id) VALUES(p_tenant_id)
 ON CONFLICT(tenant_id) DO NOTHING;

 SELECT a.capacity_bytes + COALESCE((
   SELECT sum(x.added_bytes) FROM public.tenant_storage_addons x
   WHERE x.tenant_id=p_tenant_id AND x.status='active'
     AND x.current_period_start<=now() AND x.current_period_end>now()
 ),0)
 INTO v_effective_capacity
 FROM public.tenant_storage_accounts a WHERE a.tenant_id=p_tenant_id;

 UPDATE public.tenant_storage_accounts
 SET used_bytes=used_bytes+p_original_size_bytes,updated_at=now()
 WHERE tenant_id=p_tenant_id
   AND used_bytes+p_original_size_bytes<=v_effective_capacity;
 IF NOT FOUND THEN
   RAISE EXCEPTION USING ERRCODE='P0001',MESSAGE='STORAGE_CAPACITY_EXCEEDED';
 END IF;

 INSERT INTO public.media_assets(tenant_id,media_type,idempotency_key,original_size_bytes)
 VALUES(p_tenant_id,p_media_type,p_idempotency_key,p_original_size_bytes)
 RETURNING id INTO v_asset_id;

 INSERT INTO public.tenant_storage_events(tenant_id,media_asset_id,event_type,delta_bytes,idempotency_key,metadata)
 VALUES(p_tenant_id,v_asset_id,'upload_reserved',p_original_size_bytes,
   'reserve:'||p_tenant_id::text||':'||p_idempotency_key,
   jsonb_build_object('capacity_at_reservation',v_effective_capacity));
 RETURN v_asset_id;
END;
$fn$;

ALTER TABLE public.storage_addon_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_addon_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS storage_addon_plans_read ON public.storage_addon_plans;
CREATE POLICY storage_addon_plans_read ON public.storage_addon_plans FOR SELECT USING (is_available = true);

ALTER TABLE public.tenant_storage_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_storage_addons FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_storage_addons_isolation ON public.tenant_storage_addons;
CREATE POLICY tenant_storage_addons_isolation ON public.tenant_storage_addons
 USING (tenant_id = nullif(current_setting('app.tenant_id',true),'')::uuid)
 WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id',true),'')::uuid);

REVOKE ALL ON FUNCTION public.get_tenant_storage_capacity(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reserve_media_upload(uuid,text,bigint,text) FROM PUBLIC;
