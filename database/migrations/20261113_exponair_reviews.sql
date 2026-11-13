CREATE TABLE IF NOT EXISTS public.exponair_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name varchar(100) NOT NULL,
  event_type varchar(120) NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text varchar(2000) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  source varchar(40) NOT NULL DEFAULT 'exponair_storefront'
);

CREATE INDEX IF NOT EXISTS exponair_reviews_public_idx
  ON public.exponair_reviews (approved_at DESC, created_at DESC)
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS exponair_reviews_moderation_idx
  ON public.exponair_reviews (created_at DESC)
  WHERE status = 'pending';
