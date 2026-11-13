-- Master workspace registry, controls and verified payment ledger.
-- Safe additive migration: no existing tenant or commerce records are removed.
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS storefront_url text;

CREATE TABLE IF NOT EXISTS public.platform_feature_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platform_feature_key_format CHECK (feature_key ~ '^[a-z0-9][a-z0-9_-]{1,63}$')
);
CREATE UNIQUE INDEX IF NOT EXISTS platform_feature_controls_global_key_uq
  ON public.platform_feature_controls(feature_key) WHERE tenant_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS platform_feature_controls_tenant_key_uq
  ON public.platform_feature_controls(tenant_id,feature_key) WHERE tenant_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.platform_settings (
  setting_key text PRIMARY KEY,
  setting_value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_reference text NOT NULL UNIQUE,
  amount_minor bigint NOT NULL CHECK (amount_minor >= 0),
  currency char(3) NOT NULL DEFAULT 'NGN',
  status text NOT NULL CHECK (status IN ('pending','succeeded','failed','refunded')),
  paid_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payment_transactions_tenant_created_idx
  ON public.payment_transactions(tenant_id,created_at DESC);
