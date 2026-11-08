-- Run after game_premium_schema.sql. Public catalog views remain unchanged.
BEGIN;
CREATE TABLE IF NOT EXISTS public.premium_level_content (
  slug text PRIMARY KEY REFERENCES public.levels(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  image_url_1 text NOT NULL,
  image_url_2 text,
  differences jsonb NOT NULL CHECK (jsonb_typeof(differences) = 'array')
);
-- Upgrade an already-installed UUID-keyed table without losing real content.
-- Any missing parent aborts the transaction instead of discarding a content row.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'premium_level_content' AND column_name = 'level_id'
  ) THEN
    ALTER TABLE public.premium_level_content ADD COLUMN slug text;
    UPDATE public.premium_level_content AS content SET slug = level.slug
      FROM public.levels AS level WHERE level.id = content.level_id;
    ALTER TABLE public.premium_level_content ALTER COLUMN slug SET NOT NULL;
    ALTER TABLE public.premium_level_content DROP COLUMN level_id;
    ALTER TABLE public.premium_level_content ADD PRIMARY KEY (slug);
    ALTER TABLE public.premium_level_content ADD FOREIGN KEY (slug)
      REFERENCES public.levels(slug) ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;
END $$;
ALTER TABLE public.premium_level_content ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.premium_level_content FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.premium_level_content TO service_role;
-- Explicit service policy also supports installations where service_role lacks BYPASSRLS.
DROP POLICY IF EXISTS premium_content_service ON public.premium_level_content;
CREATE POLICY premium_content_service ON public.premium_level_content
  FOR ALL TO service_role USING (true) WITH CHECK (true);
COMMIT;
