-- Remove the retired printable keyword research field from an existing database.
ALTER TABLE public.printable_products
  DROP COLUMN IF EXISTS keyword_signals;
