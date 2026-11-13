ALTER TABLE public.client_applications
 ADD COLUMN IF NOT EXISTS plan_code text NOT NULL DEFAULT 'starter-10k',
 ADD COLUMN IF NOT EXISTS plan_price_minor bigint NOT NULL DEFAULT 1000000,
 ADD COLUMN IF NOT EXISTS included_storage_bytes bigint NOT NULL DEFAULT 2147483648,
 ADD COLUMN IF NOT EXISTS storage_addon_request text,
 ADD COLUMN IF NOT EXISTS onboarding_details jsonb NOT NULL DEFAULT '{}'::jsonb,
 ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false,
 ADD COLUMN IF NOT EXISTS privacy_notice_version text NOT NULL DEFAULT 'bhs-onboarding-2026-11';
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='client_applications_plan_price_nonnegative') THEN
  ALTER TABLE public.client_applications ADD CONSTRAINT client_applications_plan_price_nonnegative CHECK (plan_price_minor >= 0);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='client_applications_storage_nonnegative') THEN
  ALTER TABLE public.client_applications ADD CONSTRAINT client_applications_storage_nonnegative CHECK (included_storage_bytes >= 0);
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS client_applications_plan_created_idx ON public.client_applications(plan_code,created_at DESC);
CREATE TABLE IF NOT EXISTS public.commerce_plans (
 plan_code text PRIMARY KEY, display_name text NOT NULL, monthly_price_minor bigint NOT NULL CHECK(monthly_price_minor>=0),
 currency char(3) NOT NULL DEFAULT 'NGN', included_storage_bytes bigint NOT NULL CHECK(included_storage_bytes>=0),
 storefront_limit integer NOT NULL DEFAULT 1 CHECK(storefront_limit>0), billing_interval text NOT NULL DEFAULT 'month' CHECK(billing_interval IN ('month','year')),
 is_available boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.commerce_plans(plan_code,display_name,monthly_price_minor,currency,included_storage_bytes,storefront_limit,billing_interval,is_available)
VALUES('starter-10k','Starter Storefront',1000000,'NGN',2147483648,1,'month',true) ON CONFLICT(plan_code) DO NOTHING;
