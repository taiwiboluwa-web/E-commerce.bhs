-- Exponair media gallery. Additive: preserves existing storefront and tenant data.
CREATE TABLE IF NOT EXISTS public.exponair_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  media_asset_id uuid NOT NULL REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Events',
  media_kind text NOT NULL CHECK (media_kind IN ('image','video','audio')),
  mime_type text NOT NULL,
  public_url text NOT NULL,
  poster_url text,
  object_key text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(media_asset_id)
);
CREATE INDEX IF NOT EXISTS exponair_gallery_public_idx
 ON public.exponair_gallery(tenant_id,published,created_at DESC);
ALTER TABLE public.exponair_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exponair_gallery FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS exponair_gallery_tenant_isolation ON public.exponair_gallery;
CREATE POLICY exponair_gallery_tenant_isolation ON public.exponair_gallery
 USING (tenant_id = nullif(current_setting('app.tenant_id',true),'')::uuid)
 WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id',true),'')::uuid);
