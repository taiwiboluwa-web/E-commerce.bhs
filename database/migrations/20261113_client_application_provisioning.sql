-- Client application review and idempotent tenant provisioning
ALTER TABLE public.client_applications
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL;
ALTER TABLE public.client_applications
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.client_applications
  ADD COLUMN IF NOT EXISTS reviewed_by text;
CREATE UNIQUE INDEX IF NOT EXISTS client_applications_tenant_id_unique
  ON public.client_applications(tenant_id) WHERE tenant_id IS NOT NULL;

-- Provisioning is performed by public.approve_client_application() in the
-- production database. The function locks the application row, reuses a
-- matching tenant, creates storage and a trial subscription when missing,
-- and records the linked tenant on the application.
