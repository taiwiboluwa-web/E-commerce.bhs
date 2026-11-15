-- SP Clothing Services product catalogue extensions.
-- Additive only: existing product records and storefront data are preserved.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
