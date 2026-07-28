-- Adds the public-safe PDF metadata RPC used by printable product pages.
-- This script is idempotent and can be run independently in Supabase SQL Editor.

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
