-- =====================================================
-- Seed Data for Categories and Levels
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- IMPORTANT: Run this AFTER levels_schema.sql
-- https://supabase.com/dashboard/project/_/sql

-- =====================================================
-- 1. Insert Categories
-- =====================================================

INSERT INTO categories (slug, name, description, icon, display_order, seo_title, seo_description, published) VALUES
('adults', 'Adults', 'Challenging puzzles designed for adult players with complex patterns and subtle differences', '👔', 1,
 'Adult Spot the Difference Games - Challenging Puzzles',
 'Test your observation skills with our challenging spot the difference games for adults. Complex patterns and subtle differences await!',
 true),

('kids', 'Kids', 'Fun and colorful puzzles perfect for children with easy-to-spot differences', '🎨', 2,
 'Kids Spot the Difference Games - Fun & Educational',
 'Educational and entertaining spot the difference games for kids. Develop observation skills while having fun!',
 true),

('themes', 'Themes', 'Themed collections including nature, space, cities, and seasonal puzzles', '🎭', 3,
 'Themed Spot the Difference Games - Various Collections',
 'Explore our themed collections of spot the difference games. From nature to space, find your favorite theme!',
 true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

-- =====================================================
-- 2. Insert Levels
-- =====================================================

-- Get category IDs
DO $$
DECLARE
  adults_id UUID;
  kids_id UUID;
  themes_id UUID;
BEGIN
  SELECT id INTO adults_id FROM categories WHERE slug = 'adults';
  SELECT id INTO kids_id FROM categories WHERE slug = 'kids';
  SELECT id INTO themes_id FROM categories WHERE slug = 'themes';

  -- Level 1: Sunny Beach (Easy, Adults)
  INSERT INTO levels (slug, title, description, category_id, image_url_1, image_url_2, differences, difficulty, display_order, seo_title, seo_description, published, featured)
  VALUES (
    'sunny-beach',
    'Sunny Beach',
    'Find the subtle differences in this beautiful sunny beach scene. Perfect for beginners!',
    adults_id,
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    '[{"x": 20, "y": 30, "radius": 5}, {"x": 50, "y": 50, "radius": 5}, {"x": 80, "y": 70, "radius": 5}]'::jsonb,
    'Easy',
    1,
    'Sunny Beach - Easy Spot the Difference Game',
    'Enjoy this relaxing beach scene and find all the differences. Perfect for a quick brain exercise!',
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- Level 2: City Night (Hard, Themes)
  INSERT INTO levels (slug, title, description, category_id, image_url_1, image_url_2, differences, difficulty, display_order, seo_title, seo_description, published, featured)
  VALUES (
    'city-night',
    'City Night',
    'Explore the bustling city at night and spot the hidden differences among the lights and buildings.',
    themes_id,
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop',
    '[{"x": 10, "y": 20, "radius": 4}, {"x": 40, "y": 40, "radius": 4}, {"x": 70, "y": 60, "radius": 4}, {"x": 90, "y": 80, "radius": 4}, {"x": 30, "y": 90, "radius": 4}]'::jsonb,
    'Hard',
    2,
    'City Night - Challenging Urban Puzzle',
    'Challenge yourself with this complex city nightscape. Can you find all the differences in the urban jungle?',
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

  -- Level 3: Cute Animals (Easy, Kids)
  INSERT INTO levels (slug, title, description, category_id, image_url_1, image_url_2, differences, difficulty, display_order, seo_title, seo_description, published, featured)
  VALUES (
    'cute-animals',
    'Cute Animals',
    'Adorable animals are waiting for you! Find the differences in this fun and colorful scene.',
    kids_id,
    'https://images.unsplash.com/photo-1535268620699-00c645181d04?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535268620699-00c645181d04?q=80&w=1000&auto=format&fit=crop',
    '[{"x": 25, "y": 25, "radius": 6}, {"x": 75, "y": 75, "radius": 6}]'::jsonb,
    'Easy',
    3,
    'Cute Animals - Fun Game for Kids',
    'Perfect for children! Find the differences among adorable animals in this colorful puzzle.',
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- Level 4: Mountain Peaks (Hard, Adults)
  INSERT INTO levels (slug, title, description, category_id, image_url_1, image_url_2, differences, difficulty, display_order, seo_title, seo_description, published, featured)
  VALUES (
    'mountain-peaks',
    'Mountain Peaks',
    'Majestic mountain ranges hide subtle differences. Test your skills with this challenging nature scene.',
    adults_id,
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop',
    '[{"x": 15, "y": 25, "radius": 5}, {"x": 45, "y": 55, "radius": 5}, {"x": 75, "y": 35, "radius": 5}, {"x": 85, "y": 75, "radius": 5}]'::jsonb,
    'Hard',
    4,
    'Mountain Peaks - Challenging Nature Puzzle',
    'Find all differences in this breathtaking mountain landscape. A perfect challenge for nature lovers!',
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- Level 5: Tropical Forest (Expert, Adults)
  INSERT INTO levels (slug, title, description, category_id, image_url_1, image_url_2, differences, difficulty, display_order, seo_title, seo_description, published, featured)
  VALUES (
    'tropical-forest',
    'Tropical Forest',
    'Dense jungle foliage creates the ultimate challenge. Only expert observers will succeed!',
    adults_id,
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1000&auto=format&fit=crop',
    '[{"x": 30, "y": 40, "radius": 6}, {"x": 60, "y": 60, "radius": 6}, {"x": 20, "y": 80, "radius": 6}]'::jsonb,
    'Expert',
    5,
    'Tropical Forest - Expert Level Challenge',
    'Our most challenging puzzle yet! Navigate the dense tropical forest and find all hidden differences.',
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

  -- Level 6: Underwater World (Easy, Kids)
  INSERT INTO levels (slug, title, description, category_id, image_url_1, image_url_2, differences, difficulty, display_order, seo_title, seo_description, published, featured)
  VALUES (
    'underwater-world',
    'Underwater World',
    'Dive into the ocean and discover the differences among colorful fish and coral reefs!',
    kids_id,
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1000&auto=format&fit=crop',
    '[{"x": 25, "y": 30, "radius": 5}, {"x": 55, "y": 50, "radius": 5}, {"x": 80, "y": 70, "radius": 5}]'::jsonb,
    'Easy',
    6,
    'Underwater World - Ocean Adventure for Kids',
    'Explore the underwater world and find differences among beautiful sea creatures!',
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

  -- Level 7: Space Adventure (Hard, Themes)
  INSERT INTO levels (slug, title, description, category_id, image_url_1, image_url_2, differences, difficulty, display_order, seo_title, seo_description, published, featured)
  VALUES (
    'space-adventure',
    'Space Adventure',
    'Journey through the cosmos and spot differences among stars, planets, and galaxies.',
    themes_id,
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop',
    '[{"x": 20, "y": 25, "radius": 4}, {"x": 50, "y": 45, "radius": 4}, {"x": 70, "y": 65, "radius": 4}, {"x": 40, "y": 80, "radius": 4}]'::jsonb,
    'Hard',
    7,
    'Space Adventure - Cosmic Puzzle Challenge',
    'Blast off into space! Find all the differences in this stellar adventure among the stars.',
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- Level 8: Autumn Park (Easy, Themes)
  INSERT INTO levels (slug, title, description, category_id, image_url_1, image_url_2, differences, difficulty, display_order, seo_title, seo_description, published, featured)
  VALUES (
    'autumn-park',
    'Autumn Park',
    'Enjoy the beautiful fall colors and find the subtle differences in this peaceful park scene.',
    themes_id,
    'https://images.unsplash.com/photo-1604537529586-924b3f608a16?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1604537529586-924b3f608a16?q=80&w=1000&auto=format&fit=crop',
    '[{"x": 35, "y": 40, "radius": 5}, {"x": 65, "y": 55, "radius": 5}, {"x": 50, "y": 75, "radius": 5}]'::jsonb,
    'Easy',
    8,
    'Autumn Park - Relaxing Fall Scenery Puzzle',
    'Relax with this beautiful autumn scene. Perfect for a peaceful puzzle-solving experience!',
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- =====================================================
-- Done! 🎉
-- =====================================================
-- Categories and Levels have been seeded with example data
-- You can now query the levels and categories tables
-- =====================================================
