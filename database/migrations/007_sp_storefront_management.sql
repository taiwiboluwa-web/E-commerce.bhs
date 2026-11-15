-- SP Clothing Services catalogue promotions and editable storefront content.
-- Additive migration; preserves all existing products and tenant records.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sale_price_minor bigint,
  ADD COLUMN IF NOT EXISTS sale_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS sale_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS sale_label text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_sale_price_valid'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_sale_price_valid
      CHECK (sale_price_minor IS NULL OR (sale_price_minor >= 0 AND sale_price_minor < price_minor));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.storefront_settings (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE RESTRICT,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.storefront_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_settings FORCE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='storefront_settings' AND policyname='storefront_settings_tenant_isolation') THEN
    CREATE POLICY storefront_settings_tenant_isolation ON public.storefront_settings
      USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
      WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
  END IF;
END $$;
