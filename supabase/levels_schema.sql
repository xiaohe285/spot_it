-- =====================================================
-- Game Categories and Levels Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- IMPORTANT: Run this AFTER the main schema.sql
-- https://supabase.com/dashboard/project/_/sql

-- =====================================================
-- 1. Categories Table
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Emoji or icon identifier
  display_order INTEGER DEFAULT 0,

  -- SEO Fields
  seo_title TEXT,
  seo_description TEXT,

  -- Status
  published BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_published ON categories(published);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);

-- =====================================================
-- 2. Levels Table
-- =====================================================
CREATE TABLE IF NOT EXISTS levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Category
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Images
  image_url_1 TEXT NOT NULL,
  image_url_2 TEXT NOT NULL,

  -- Differences (stored as JSONB array)
  -- Format: [{"x": 20.5, "y": 30.2, "radius": 5}, ...]
  differences JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Game Settings
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Hard', 'Expert')),
  display_order INTEGER DEFAULT 0,

  -- SEO Fields
  seo_title TEXT,
  seo_description TEXT,

  -- Statistics (updated by triggers)
  total_plays INTEGER DEFAULT 0,
  average_score DECIMAL(10, 2) DEFAULT 0,
  average_time INTEGER DEFAULT 0, -- in seconds

  -- Status
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false, -- For featured games section

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for levels
CREATE INDEX IF NOT EXISTS idx_levels_slug ON levels(slug);
CREATE INDEX IF NOT EXISTS idx_levels_category ON levels(category_id);
CREATE INDEX IF NOT EXISTS idx_levels_difficulty ON levels(difficulty);
CREATE INDEX IF NOT EXISTS idx_levels_published ON levels(published);
CREATE INDEX IF NOT EXISTS idx_levels_featured ON levels(featured);
CREATE INDEX IF NOT EXISTS idx_levels_order ON levels(display_order);

-- =====================================================
-- 3. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

-- Categories Policies (Public Read, Admin Write)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- Levels Policies (Public Read Published, Admin Write)
CREATE POLICY "Published levels are viewable by everyone"
  ON levels FOR SELECT
  USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert levels"
  ON levels FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update levels"
  ON levels FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete levels"
  ON levels FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. Triggers for updated_at
-- =====================================================

-- Trigger for categories
CREATE OR REPLACE TRIGGER set_updated_at_categories
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for levels
CREATE OR REPLACE TRIGGER set_updated_at_levels
  BEFORE UPDATE ON levels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. Function to update level statistics
-- =====================================================

CREATE OR REPLACE FUNCTION update_level_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE levels
  SET
    total_plays = (
      SELECT COUNT(*) FROM game_records WHERE level_slug = NEW.level_slug
    ),
    average_score = (
      SELECT COALESCE(AVG(score), 0) FROM game_records WHERE level_slug = NEW.level_slug
    ),
    average_time = (
      SELECT COALESCE(AVG(time_elapsed), 0)::INTEGER FROM game_records WHERE level_slug = NEW.level_slug
    )
  WHERE slug = NEW.level_slug;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats when game record is created
CREATE OR REPLACE TRIGGER on_game_record_created_update_level_stats
  AFTER INSERT ON game_records
  FOR EACH ROW EXECUTE FUNCTION update_level_stats();

-- =====================================================
-- 6. Useful Views
-- =====================================================

-- View for levels with category info
CREATE OR REPLACE VIEW levels_with_category AS
SELECT
  l.id,
  l.slug,
  l.title,
  l.description,
  l.image_url_1,
  l.image_url_2,
  l.differences,
  l.difficulty,
  l.display_order,
  l.seo_title,
  l.seo_description,
  l.total_plays,
  l.average_score,
  l.average_time,
  l.published,
  l.featured,
  l.created_at,
  l.updated_at,
  c.id as category_id,
  c.slug as category_slug,
  c.name as category_name,
  c.icon as category_icon
FROM levels l
LEFT JOIN categories c ON l.category_id = c.id;

-- View for popular levels (most played)
CREATE OR REPLACE VIEW popular_levels AS
SELECT *
FROM levels_with_category
WHERE published = true
ORDER BY total_plays DESC, average_score DESC
LIMIT 20;

-- View for featured levels
CREATE OR REPLACE VIEW featured_levels AS
SELECT *
FROM levels_with_category
WHERE published = true AND featured = true
ORDER BY display_order, created_at DESC
LIMIT 20;

-- =====================================================
-- Done! 🎉
-- =====================================================
-- Next: Run the seed data SQL to populate the tables
-- =====================================================
