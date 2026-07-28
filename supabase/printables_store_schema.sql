-- =====================================================
-- Printable PDF Store: catalog, filters, files, orders, Premium
-- =====================================================
-- Run in the Supabase SQL Editor.
-- Safe to run repeatedly: schema, policies, and seed rows are idempotent.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_printables_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------
-- 1. Market-driven filter taxonomy
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.printable_filter_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  url_order INTEGER NOT NULL DEFAULT 0,
  title_order INTEGER NOT NULL DEFAULT 0,
  selection_mode TEXT NOT NULL DEFAULT 'single'
    CHECK (selection_mode IN ('single', 'multiple', 'hierarchical')),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.printable_filter_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.printable_filter_groups(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  url_order INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES public.printable_filter_options(id) ON DELETE SET NULL,
  title_text TEXT NOT NULL DEFAULT '',
  title_slot TEXT NOT NULL DEFAULT 'core'
    CHECK (
      title_slot IN (
        'prefix', 'core', 'resource_noun', 'format_suffix',
        'context_suffix', 'price_suffix'
      )
    ),
  title_order INTEGER NOT NULL DEFAULT 0,
  include_parent_url BOOLEAN NOT NULL DEFAULT FALSE,
  is_indexable BOOLEAN NOT NULL DEFAULT TRUE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, slug)
);

-- Upgrade an already-created printable taxonomy without requiring a separate
-- migration file. These statements are safe to run repeatedly.
ALTER TABLE public.printable_filter_groups
  ADD COLUMN IF NOT EXISTS url_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.printable_filter_groups
  ADD COLUMN IF NOT EXISTS title_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.printable_filter_groups
  ADD COLUMN IF NOT EXISTS selection_mode TEXT NOT NULL DEFAULT 'single'
    CHECK (selection_mode IN ('single', 'multiple', 'hierarchical'));

ALTER TABLE public.printable_filter_options
  ADD COLUMN IF NOT EXISTS url_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.printable_filter_options
  ADD COLUMN IF NOT EXISTS parent_id UUID
    REFERENCES public.printable_filter_options(id) ON DELETE SET NULL;
ALTER TABLE public.printable_filter_options
  ADD COLUMN IF NOT EXISTS title_text TEXT NOT NULL DEFAULT '';
ALTER TABLE public.printable_filter_options
  ADD COLUMN IF NOT EXISTS title_slot TEXT NOT NULL DEFAULT 'core'
    CHECK (
      title_slot IN (
        'prefix', 'core', 'resource_noun', 'format_suffix',
        'context_suffix', 'price_suffix'
      )
    );
ALTER TABLE public.printable_filter_options
  ADD COLUMN IF NOT EXISTS title_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.printable_filter_options
  ADD COLUMN IF NOT EXISTS include_parent_url BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.printable_filter_options
  ADD COLUMN IF NOT EXISTS is_indexable BOOLEAN NOT NULL DEFAULT TRUE;

-- -----------------------------------------------------
-- 2. Public catalog and private file mapping
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.printable_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  audience TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  puzzle_count INTEGER NOT NULL CHECK (puzzle_count > 0),
  answer_key_count INTEGER NOT NULL CHECK (answer_key_count >= 0),
  total_pages INTEGER NOT NULL CHECK (total_pages > 0),
  differences_per_puzzle INTEGER NOT NULL CHECK (differences_per_puzzle > 0),
  preview_image_url TEXT NOT NULL,
  preview_images JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(preview_images) = 'array'),
  badge TEXT NOT NULL DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(features) = 'array'),
  keyword_signals JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(keyword_signals) = 'array'),
  is_premium_included BOOLEAN NOT NULL DEFAULT FALSE,
  sales_count INTEGER NOT NULL DEFAULT 0 CHECK (sales_count >= 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Remove the legacy presentation-only field from existing installations.
ALTER TABLE public.printable_products
  DROP COLUMN IF EXISTS accent;
ALTER TABLE public.printable_products
  ADD COLUMN IF NOT EXISTS preview_images JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(preview_images) = 'array');

-- Kept separate so the public catalog never returns a paid file path.
CREATE TABLE IF NOT EXISTS public.printable_product_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.printable_products(id) ON DELETE CASCADE,
  download_slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'local'
    CHECK (storage_provider IN ('local', 'supabase', 'r2')),
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  sha256 TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, download_slug)
);

-- Upgrade the original one-file-per-product table to support any number of
-- downloadable PDFs without exposing their private storage paths.
ALTER TABLE public.printable_product_files
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.printable_product_files
  ADD COLUMN IF NOT EXISTS download_slug TEXT NOT NULL DEFAULT 'main-pdf';
ALTER TABLE public.printable_product_files
  ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT 'Printable PDF';
ALTER TABLE public.printable_product_files
  ADD COLUMN IF NOT EXISTS file_name TEXT NOT NULL DEFAULT 'printable.pdf';
ALTER TABLE public.printable_product_files
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.printable_product_files
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.printable_product_files
  DROP CONSTRAINT IF EXISTS printable_product_files_storage_provider_check;
ALTER TABLE public.printable_product_files
  ADD CONSTRAINT printable_product_files_storage_provider_check
    CHECK (storage_provider IN ('local', 'supabase', 'r2'));
ALTER TABLE public.printable_product_files
  ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.printable_product_files
  DROP CONSTRAINT IF EXISTS printable_product_files_pkey;
ALTER TABLE public.printable_product_files
  ADD CONSTRAINT printable_product_files_pkey PRIMARY KEY (id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_printable_product_files_product_slug
  ON public.printable_product_files(product_id, download_slug);

UPDATE public.printable_product_files files
SET
  download_slug = 'puzzle-pack',
  display_name = 'Puzzle pack',
  file_name = products.slug || '-puzzles.pdf',
  is_primary = TRUE,
  sort_order = 10
FROM public.printable_products products
WHERE
  files.product_id = products.id
  AND files.download_slug = 'main-pdf';

CREATE TABLE IF NOT EXISTS public.printable_product_filters (
  product_id UUID NOT NULL REFERENCES public.printable_products(id) ON DELETE CASCADE,
  filter_option_id UUID NOT NULL REFERENCES public.printable_filter_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, filter_option_id)
);

-- -----------------------------------------------------
-- 3. Premium plans and completed purchases
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.printable_premium_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  access_days INTEGER NOT NULL DEFAULT 31 CHECK (access_days > 0),
  features JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(features) = 'array'),
  badge TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.printable_premium_plans
  ALTER COLUMN access_days SET DEFAULT 31;

CREATE TABLE IF NOT EXISTS public.printable_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.printable_products(id) ON DELETE SET NULL,
  premium_plan_id UUID REFERENCES public.printable_premium_plans(id) ON DELETE SET NULL,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('product', 'premium')),
  paypal_order_id TEXT UNIQUE NOT NULL,
  paypal_capture_id TEXT UNIQUE NOT NULL,
  payer_email TEXT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('created', 'completed', 'refunded', 'disputed', 'cancelled')),
  access_expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT printable_orders_target_check CHECK (
    (purchase_type = 'product' AND product_id IS NOT NULL AND premium_plan_id IS NULL)
    OR
    (purchase_type = 'premium' AND premium_plan_id IS NOT NULL AND product_id IS NULL)
  )
);

-- Filter option slugs are URL path segments and therefore must be globally
-- unique. Older seeds used "classroom" in both Theme and Use case. Rename the
-- Use case option before creating the canonical slug index. The merge branch
-- keeps this migration safe if a partially migrated installation already has
-- both use-case rows.
DO $$
DECLARE
  use_case_group_id UUID;
  legacy_option_id UUID;
  canonical_option_id UUID;
BEGIN
  SELECT id
  INTO use_case_group_id
  FROM public.printable_filter_groups
  WHERE slug = 'use-case';

  IF use_case_group_id IS NOT NULL THEN
    SELECT id
    INTO legacy_option_id
    FROM public.printable_filter_options
    WHERE group_id = use_case_group_id AND slug = 'classroom';

    SELECT id
    INTO canonical_option_id
    FROM public.printable_filter_options
    WHERE group_id = use_case_group_id AND slug = 'classroom-use';

    IF legacy_option_id IS NOT NULL AND canonical_option_id IS NULL THEN
      UPDATE public.printable_filter_options
      SET slug = 'classroom-use'
      WHERE id = legacy_option_id;
    ELSIF legacy_option_id IS NOT NULL AND canonical_option_id IS NOT NULL THEN
      INSERT INTO public.printable_product_filters (
        product_id,
        filter_option_id
      )
      SELECT product_id, canonical_option_id
      FROM public.printable_product_filters
      WHERE filter_option_id = legacy_option_id
      ON CONFLICT (product_id, filter_option_id) DO NOTHING;

      DELETE FROM public.printable_product_filters
      WHERE filter_option_id = legacy_option_id;

      UPDATE public.printable_filter_options
      SET parent_id = canonical_option_id
      WHERE parent_id = legacy_option_id;

      DELETE FROM public.printable_filter_options
      WHERE id = legacy_option_id;
    END IF;
  END IF;
END;
$$;

-- -----------------------------------------------------
-- 4. Indexes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_printable_products_published_order
  ON public.printable_products(published, display_order);
CREATE INDEX IF NOT EXISTS idx_printable_products_premium
  ON public.printable_products(is_premium_included) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_printable_filter_options_group_order
  ON public.printable_filter_options(group_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_printable_filter_options_canonical_slug
  ON public.printable_filter_options(slug);
CREATE INDEX IF NOT EXISTS idx_printable_filter_options_parent
  ON public.printable_filter_options(parent_id);
CREATE INDEX IF NOT EXISTS idx_printable_product_filters_option
  ON public.printable_product_filters(filter_option_id, product_id);
CREATE INDEX IF NOT EXISTS idx_printable_orders_user_status
  ON public.printable_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_printable_orders_product
  ON public.printable_orders(product_id, status);
CREATE INDEX IF NOT EXISTS idx_printable_orders_premium_expiry
  ON public.printable_orders(user_id, access_expires_at)
  WHERE purchase_type = 'premium' AND status = 'completed';

-- -----------------------------------------------------
-- 5. updated_at triggers
-- -----------------------------------------------------
DROP TRIGGER IF EXISTS set_updated_at_printable_filter_groups
  ON public.printable_filter_groups;
CREATE TRIGGER set_updated_at_printable_filter_groups
  BEFORE UPDATE ON public.printable_filter_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_printables_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_printable_filter_options
  ON public.printable_filter_options;
CREATE TRIGGER set_updated_at_printable_filter_options
  BEFORE UPDATE ON public.printable_filter_options
  FOR EACH ROW EXECUTE FUNCTION public.set_printables_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_printable_products
  ON public.printable_products;
CREATE TRIGGER set_updated_at_printable_products
  BEFORE UPDATE ON public.printable_products
  FOR EACH ROW EXECUTE FUNCTION public.set_printables_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_printable_product_files
  ON public.printable_product_files;
CREATE TRIGGER set_updated_at_printable_product_files
  BEFORE UPDATE ON public.printable_product_files
  FOR EACH ROW EXECUTE FUNCTION public.set_printables_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_printable_premium_plans
  ON public.printable_premium_plans;
CREATE TRIGGER set_updated_at_printable_premium_plans
  BEFORE UPDATE ON public.printable_premium_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_printables_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_printable_orders
  ON public.printable_orders;
CREATE TRIGGER set_updated_at_printable_orders
  BEFORE UPDATE ON public.printable_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_printables_updated_at();

-- -----------------------------------------------------
-- 6. RLS
-- -----------------------------------------------------
ALTER TABLE public.printable_filter_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printable_filter_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printable_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printable_product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printable_product_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printable_premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printable_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published printable filter groups are public"
  ON public.printable_filter_groups;
CREATE POLICY "Published printable filter groups are public"
  ON public.printable_filter_groups FOR SELECT
  USING (published = TRUE);

DROP POLICY IF EXISTS "Published printable filter options are public"
  ON public.printable_filter_options;
CREATE POLICY "Published printable filter options are public"
  ON public.printable_filter_options FOR SELECT
  USING (
    published = TRUE
    AND EXISTS (
      SELECT 1
      FROM public.printable_filter_groups group_row
      WHERE group_row.id = group_id AND group_row.published = TRUE
    )
  );

DROP POLICY IF EXISTS "Published printable products are public"
  ON public.printable_products;
CREATE POLICY "Published printable products are public"
  ON public.printable_products FOR SELECT
  USING (published = TRUE);

DROP POLICY IF EXISTS "Published printable product filters are public"
  ON public.printable_product_filters;
CREATE POLICY "Published printable product filters are public"
  ON public.printable_product_filters FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.printable_products product_row
      WHERE product_row.id = product_id AND product_row.published = TRUE
    )
  );

DROP POLICY IF EXISTS "Active printable Premium plans are public"
  ON public.printable_premium_plans;
CREATE POLICY "Active printable Premium plans are public"
  ON public.printable_premium_plans FOR SELECT
  USING (active = TRUE);

-- No public policy is created for printable_product_files. Only the service
-- role used by the protected download route can read it.

-- Public product pages need file labels and sizes, but must never receive
-- private local paths, Supabase object paths, or R2 object keys.
CREATE OR REPLACE FUNCTION public.get_printable_product_file_metadata(
  target_product_id UUID
)
RETURNS TABLE (
  download_slug TEXT,
  display_name TEXT,
  file_name TEXT,
  file_size_bytes BIGINT,
  is_primary BOOLEAN,
  sort_order INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    files.download_slug,
    files.display_name,
    files.file_name,
    files.file_size_bytes,
    files.is_primary,
    files.sort_order
  FROM public.printable_product_files files
  JOIN public.printable_products products
    ON products.id = files.product_id
  WHERE
    files.product_id = target_product_id
    AND products.published = TRUE
  ORDER BY files.sort_order ASC;
$$;

REVOKE ALL
  ON FUNCTION public.get_printable_product_file_metadata(UUID)
  FROM PUBLIC;
GRANT EXECUTE
  ON FUNCTION public.get_printable_product_file_metadata(UUID)
  TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

DROP POLICY IF EXISTS "Users can view their own printable orders"
  ON public.printable_orders;
CREATE POLICY "Users can view their own printable orders"
  ON public.printable_orders FOR SELECT
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- 7. Seed filter taxonomy
-- -----------------------------------------------------
INSERT INTO public.printable_filter_groups (
  slug, label, display_order, url_order, title_order, selection_mode
)
VALUES
  ('audience', 'Audience', 10, 10, 10, 'single'),
  ('theme', 'Theme', 20, 20, 20, 'single'),
  ('difficulty', 'Difficulty', 30, 30, 30, 'single'),
  ('price', 'Price', 40, 50, 50, 'single'),
  ('format', 'Format', 50, 40, 70, 'single'),
  ('use-case', 'Use case', 60, 60, 60, 'single')
ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  url_order = EXCLUDED.url_order,
  title_order = EXCLUDED.title_order,
  selection_mode = EXCLUDED.selection_mode,
  published = TRUE;

WITH option_seed(
  group_slug, slug, label, sort_order, url_order, title_text, title_slot,
  title_order, include_parent_url, is_indexable
) AS (
  VALUES
    ('audience', 'preschool', 'Preschool', 10, 10, 'Preschool', 'core', 10, FALSE, TRUE),
    ('audience', 'kids', 'Kids', 20, 20, 'Kids', 'core', 20, FALSE, TRUE),
    ('audience', 'adults-teens', 'Adults & Teens', 30, 30, 'Adult & Teen', 'core', 30, FALSE, TRUE),
    ('theme', 'animals', 'Animals', 10, 10, 'Animal', 'core', 10, FALSE, TRUE),
    ('theme', 'seasonal', 'Seasonal', 20, 20, 'Seasonal', 'core', 20, FALSE, TRUE),
    ('theme', 'classroom', 'Classroom', 30, 30, 'Classroom-Themed', 'core', 30, FALSE, TRUE),
    ('theme', 'geometric', 'Geometric', 40, 40, 'Geometric', 'core', 40, FALSE, TRUE),
    ('difficulty', 'easy', 'Easy', 10, 10, 'Easy', 'core', 10, FALSE, TRUE),
    ('difficulty', 'easy-medium', 'Easy to Medium', 20, 20, 'Easy to Medium', 'core', 20, FALSE, TRUE),
    ('difficulty', 'hard', 'Hard', 30, 30, 'Hard', 'core', 30, FALSE, TRUE),
    ('price', 'free', 'Free', 10, 10, 'Free', 'prefix', 0, FALSE, TRUE),
    ('price', 'under-5', 'Under $5', 20, 20, 'Under $5', 'price_suffix', 10, FALSE, TRUE),
    ('price', '5-to-10', '$5 to $10', 30, 30, 'From $5 to $10', 'price_suffix', 20, FALSE, TRUE),
    ('price', 'premium', 'Included with Premium', 40, 40, 'Included with Premium', 'price_suffix', 30, FALSE, TRUE),
    ('format', 'pdf', 'Printable PDF', 10, 10, 'in PDF Format', 'format_suffix', 10, FALSE, TRUE),
    ('format', 'answer-keys', 'Answer Keys Included', 20, 20, 'with Answer Keys', 'format_suffix', 20, FALSE, TRUE),
    ('use-case', 'worksheets', 'Worksheets', 10, 10, 'Spot the Difference Worksheets', 'resource_noun', 10, FALSE, TRUE),
    ('use-case', 'classroom-use', 'Classroom', 20, 20, 'for the Classroom', 'context_suffix', 20, FALSE, TRUE),
    ('use-case', 'homeschool', 'Homeschool', 30, 30, 'for Homeschool', 'context_suffix', 30, FALSE, TRUE),
    ('use-case', 'travel-quiet-time', 'Travel & Quiet Time', 40, 40, 'for Travel & Quiet Time', 'context_suffix', 40, FALSE, TRUE),
    ('use-case', 'senior-activities', 'Senior Activities', 50, 50, 'for Senior Activities', 'context_suffix', 50, FALSE, TRUE)
)
INSERT INTO public.printable_filter_options (
  group_id, slug, label, sort_order, url_order, title_text, title_slot,
  title_order, include_parent_url, is_indexable
)
SELECT
  groups.id,
  option_seed.slug,
  option_seed.label,
  option_seed.sort_order,
  option_seed.url_order,
  option_seed.title_text,
  option_seed.title_slot,
  option_seed.title_order,
  option_seed.include_parent_url,
  option_seed.is_indexable
FROM option_seed
JOIN public.printable_filter_groups groups
  ON groups.slug = option_seed.group_slug
ON CONFLICT (group_id, slug) DO UPDATE SET
  label = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  url_order = EXCLUDED.url_order,
  title_text = EXCLUDED.title_text,
  title_slot = EXCLUDED.title_slot,
  title_order = EXCLUDED.title_order,
  include_parent_url = EXCLUDED.include_parent_url,
  is_indexable = EXCLUDED.is_indexable,
  published = TRUE;

-- -----------------------------------------------------
-- 8. Seed catalog and file mappings
-- -----------------------------------------------------
INSERT INTO public.printable_products (
  id, slug, title, short_description, description, price_cents, currency,
  audience, difficulty, puzzle_count, answer_key_count, total_pages,
  differences_per_puzzle, preview_image_url, preview_images, badge, features,
  keyword_signals, is_premium_included, sales_count, display_order, published,
  published_at
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'free-printable-starter-pack',
    'Free Printable Starter Pack',
    'Three colorful spot-the-difference worksheets with complete answer keys.',
    'A no-cost sampler for families and teachers who want a quick, screen-free activity. Each page is printer-friendly and includes a matching answer key.',
    0, 'USD', 'Kids ages 4+', 'Easy', 3, 3, 7, 5,
    '/printables/previews/free-printable-starter-pack.png',
    '[{"url":"/printables/previews/free-printable-starter-pack.png","alt":"Sample Sunny Park spot the difference puzzle page"},{"url":"/printables/previews/free-printable-starter-pack-answer.png","alt":"Sample Sunny Park answer key page"},{"url":"/printables/previews/free-printable-starter-pack-cover.png","alt":"Cover of the Free Printable Starter Pack"}]'::jsonb,
    'Free',
    '["3 original full-page puzzles","3 clearly marked answer keys","US Letter and A4-friendly printing","Instant PDF download with a free account"]'::jsonb,
    '["\"free printable spot the difference\" - 140 US searches/month","\"spot the difference worksheets pdf free download\" - 70/month"]'::jsonb,
    FALSE, 860, 10, TRUE, '2026-07-25T00:00:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'preschool-animal-adventures',
    'Preschool Animal Adventures',
    'Twelve easy, colorful puzzles designed for preschool and kindergarten learners.',
    'Friendly visual puzzles with generous spacing and five changes per page. Designed for quiet time, early-finisher work, travel, and visual-discrimination practice.',
    349, 'USD', 'Ages 3-6', 'Easy', 12, 12, 25, 5,
    '/printables/previews/preschool-animal-adventures.png',
    '[{"url":"/printables/previews/preschool-animal-adventures.png","alt":"Cover of Preschool Animal Adventures"}]'::jsonb,
    'Best for little learners',
    '["12 original preschool-friendly puzzles","12 complete answer keys","Five differences on every puzzle","Personal and single-classroom license"]'::jsonb,
    '["\"spot the difference for kids\" - 390 US searches/month","\"preschool spot the difference\" keyword family - steady demand"]'::jsonb,
    TRUE, 342, 20, TRUE, '2026-07-25T00:00:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'classroom-seasons-bundle',
    'Classroom Seasons Bundle',
    'Twenty ready-to-print seasonal worksheets for class, homeschool, and parties.',
    'A year-round collection of spring, summer, autumn, winter, and school-themed challenges. Each worksheet works as a brain break, early-finisher activity, or party game.',
    599, 'USD', 'Ages 5-10', 'Easy to Medium', 20, 20, 41, 7,
    '/printables/previews/classroom-seasons-bundle.png',
    '[{"url":"/printables/previews/classroom-seasons-bundle.png","alt":"Cover of the Classroom Seasons Bundle"}]'::jsonb,
    'Best value',
    '["20 seasonal and classroom puzzles","20 complete answer keys","Seven differences on every puzzle","Print repeatedly for one household or classroom"]'::jsonb,
    '["\"spot the difference worksheets\" - 480 US searches/month","Seasonal and classroom bundles show strong Etsy review signals"]'::jsonb,
    TRUE, 514, 30, TRUE, '2026-07-25T00:00:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'adult-hard-visual-challenge',
    'Adult Hard Visual Challenge',
    'Thirty dense printable puzzles for adults, teens, and senior activity groups.',
    'A high-volume challenge pack with smaller details and ten differences per puzzle. Ideal for screen-free focus practice, activity groups, travel, and rainy afternoons.',
    499, 'USD', 'Teens and adults', 'Hard', 30, 30, 61, 10,
    '/printables/previews/adult-hard-visual-challenge.png',
    '[{"url":"/printables/previews/adult-hard-visual-challenge.png","alt":"Cover of the Adult Hard Visual Challenge"}]'::jsonb,
    'Most challenging',
    '["30 original high-density puzzles","30 complete answer keys","Ten subtle differences per puzzle","Great for adults, teens, and senior groups"]'::jsonb,
    '["\"adult spot the difference printable\" - 110 US searches/month","\"spot the difference hard printable\" - 140/month"]'::jsonb,
    TRUE, 268, 40, TRUE, '2026-07-25T00:00:00Z'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  audience = EXCLUDED.audience,
  difficulty = EXCLUDED.difficulty,
  puzzle_count = EXCLUDED.puzzle_count,
  answer_key_count = EXCLUDED.answer_key_count,
  total_pages = EXCLUDED.total_pages,
  differences_per_puzzle = EXCLUDED.differences_per_puzzle,
  preview_image_url = EXCLUDED.preview_image_url,
  preview_images = EXCLUDED.preview_images,
  badge = EXCLUDED.badge,
  features = EXCLUDED.features,
  keyword_signals = EXCLUDED.keyword_signals,
  is_premium_included = EXCLUDED.is_premium_included,
  sales_count = EXCLUDED.sales_count,
  display_order = EXCLUDED.display_order,
  published = TRUE,
  published_at = EXCLUDED.published_at;

INSERT INTO public.printable_product_files (
  product_id, download_slug, display_name, file_name, storage_provider,
  storage_path, file_size_bytes, is_primary, sort_order
)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'puzzle-pack', 'Puzzle pack', 'free-printable-starter-pack-puzzles.pdf', 'local', 'private/printables/free-printable-starter-pack-puzzles.pdf', 11525, TRUE, 10),
  ('10000000-0000-4000-8000-000000000001', 'answer-keys', 'Answer keys', 'free-printable-starter-pack-answer-keys.pdf', 'local', 'private/printables/free-printable-starter-pack-answer-keys.pdf', 13154, FALSE, 20),
  ('10000000-0000-4000-8000-000000000002', 'puzzle-pack', 'Puzzle pack', 'preschool-animal-adventures-puzzles.pdf', 'local', 'private/printables/preschool-animal-adventures-puzzles.pdf', 38891, TRUE, 10),
  ('10000000-0000-4000-8000-000000000002', 'answer-keys', 'Answer keys', 'preschool-animal-adventures-answer-keys.pdf', 'local', 'private/printables/preschool-animal-adventures-answer-keys.pdf', 45480, FALSE, 20),
  ('10000000-0000-4000-8000-000000000003', 'puzzle-pack', 'Puzzle pack', 'classroom-seasons-bundle-puzzles.pdf', 'local', 'private/printables/classroom-seasons-bundle-puzzles.pdf', 72780, TRUE, 10),
  ('10000000-0000-4000-8000-000000000003', 'answer-keys', 'Answer keys', 'classroom-seasons-bundle-answer-keys.pdf', 'local', 'private/printables/classroom-seasons-bundle-answer-keys.pdf', 87533, FALSE, 20),
  ('10000000-0000-4000-8000-000000000004', 'puzzle-pack', 'Puzzle pack', 'adult-hard-visual-challenge-puzzles.pdf', 'local', 'private/printables/adult-hard-visual-challenge-puzzles.pdf', 134939, TRUE, 10),
  ('10000000-0000-4000-8000-000000000004', 'answer-keys', 'Answer keys', 'adult-hard-visual-challenge-answer-keys.pdf', 'local', 'private/printables/adult-hard-visual-challenge-answer-keys.pdf', 165696, FALSE, 20)
ON CONFLICT (product_id, download_slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  file_name = EXCLUDED.file_name,
  storage_provider = EXCLUDED.storage_provider,
  storage_path = EXCLUDED.storage_path,
  file_size_bytes = EXCLUDED.file_size_bytes,
  is_primary = EXCLUDED.is_primary,
  sort_order = EXCLUDED.sort_order;

WITH product_filter_seed(product_slug, group_slug, option_slug) AS (
  VALUES
    ('free-printable-starter-pack', 'audience', 'kids'),
    ('free-printable-starter-pack', 'theme', 'classroom'),
    ('free-printable-starter-pack', 'difficulty', 'easy'),
    ('free-printable-starter-pack', 'price', 'free'),
    ('free-printable-starter-pack', 'format', 'pdf'),
    ('free-printable-starter-pack', 'format', 'answer-keys'),
    ('free-printable-starter-pack', 'use-case', 'worksheets'),
    ('free-printable-starter-pack', 'use-case', 'classroom-use'),
    ('free-printable-starter-pack', 'use-case', 'homeschool'),
    ('free-printable-starter-pack', 'use-case', 'travel-quiet-time'),
    ('preschool-animal-adventures', 'audience', 'preschool'),
    ('preschool-animal-adventures', 'audience', 'kids'),
    ('preschool-animal-adventures', 'theme', 'animals'),
    ('preschool-animal-adventures', 'difficulty', 'easy'),
    ('preschool-animal-adventures', 'price', 'under-5'),
    ('preschool-animal-adventures', 'price', 'premium'),
    ('preschool-animal-adventures', 'format', 'pdf'),
    ('preschool-animal-adventures', 'format', 'answer-keys'),
    ('preschool-animal-adventures', 'use-case', 'worksheets'),
    ('preschool-animal-adventures', 'use-case', 'classroom-use'),
    ('preschool-animal-adventures', 'use-case', 'homeschool'),
    ('preschool-animal-adventures', 'use-case', 'travel-quiet-time'),
    ('classroom-seasons-bundle', 'audience', 'kids'),
    ('classroom-seasons-bundle', 'theme', 'seasonal'),
    ('classroom-seasons-bundle', 'theme', 'classroom'),
    ('classroom-seasons-bundle', 'difficulty', 'easy-medium'),
    ('classroom-seasons-bundle', 'price', '5-to-10'),
    ('classroom-seasons-bundle', 'price', 'premium'),
    ('classroom-seasons-bundle', 'format', 'pdf'),
    ('classroom-seasons-bundle', 'format', 'answer-keys'),
    ('classroom-seasons-bundle', 'use-case', 'worksheets'),
    ('classroom-seasons-bundle', 'use-case', 'classroom-use'),
    ('classroom-seasons-bundle', 'use-case', 'homeschool'),
    ('adult-hard-visual-challenge', 'audience', 'adults-teens'),
    ('adult-hard-visual-challenge', 'theme', 'geometric'),
    ('adult-hard-visual-challenge', 'difficulty', 'hard'),
    ('adult-hard-visual-challenge', 'price', 'under-5'),
    ('adult-hard-visual-challenge', 'price', 'premium'),
    ('adult-hard-visual-challenge', 'format', 'pdf'),
    ('adult-hard-visual-challenge', 'format', 'answer-keys'),
    ('adult-hard-visual-challenge', 'use-case', 'travel-quiet-time'),
    ('adult-hard-visual-challenge', 'use-case', 'senior-activities')
)
INSERT INTO public.printable_product_filters (product_id, filter_option_id)
SELECT products.id, options.id
FROM product_filter_seed seed
JOIN public.printable_products products
  ON products.slug = seed.product_slug
JOIN public.printable_filter_groups groups
  ON groups.slug = seed.group_slug
JOIN public.printable_filter_options options
  ON options.group_id = groups.id AND options.slug = seed.option_slug
ON CONFLICT (product_id, filter_option_id) DO NOTHING;

-- -----------------------------------------------------
-- 9. Seed Premium plan
-- -----------------------------------------------------
INSERT INTO public.printable_premium_plans (
  id, slug, title, short_description, description, price_cents, currency,
  access_days, features, badge, display_order, active
)
VALUES (
  '20000000-0000-4000-8000-000000000001',
  'premium-annual',
  'SpotDiffs Premium',
  'One purchase unlocks every Premium printable for 31 days.',
  'Download every current Premium-included PDF and every new Premium printable published during your access period.',
  2999,
  'USD',
  31,
  '["All current Premium printable PDFs","New Premium releases during your access period","31 days of secure download access","Use in one household or one classroom"]'::jsonb,
  'Best for frequent users',
  10,
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  currency = EXCLUDED.currency,
  access_days = EXCLUDED.access_days,
  features = EXCLUDED.features,
  badge = EXCLUDED.badge,
  display_order = EXCLUDED.display_order,
  active = TRUE;

-- =====================================================
-- Complete
-- =====================================================
-- Required server environment variable:
-- SUPABASE_SERVICE_ROLE_KEY=<Project Settings > API > service_role key>
-- Never expose this key as NEXT_PUBLIC_*.
