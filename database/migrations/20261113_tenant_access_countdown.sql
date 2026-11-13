ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS access_duration_days integer NOT NULL DEFAULT 30
  CHECK (access_duration_days BETWEEN 1 AND 3650);

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS access_expires_at timestamptz;

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS access_suspended_at timestamptz;

-- Existing tenants remain unchanged and receive no expiry until the owner
-- explicitly starts an access period from Workspace > Storefronts.
