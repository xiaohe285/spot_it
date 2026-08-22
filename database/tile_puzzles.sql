-- Tile Puzzles Table
-- Execute this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS tile_puzzles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Medium' CONSTRAINT tile_puzzles_difficulty_check CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    seo_title TEXT,
    seo_description TEXT,
    total_plays INTEGER DEFAULT 0,
    average_score NUMERIC(10, 2),
    average_time INTEGER, -- in seconds
    published BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add difficulty to databases created before this field existed.
-- Existing and invalid values are normalized to the default before the constraint is applied.
ALTER TABLE tile_puzzles
    ADD COLUMN IF NOT EXISTS difficulty TEXT;

UPDATE tile_puzzles
SET difficulty = 'Medium'
WHERE difficulty IS NULL
   OR difficulty NOT IN ('Easy', 'Medium', 'Hard');

ALTER TABLE tile_puzzles
    ALTER COLUMN difficulty SET DEFAULT 'Medium',
    ALTER COLUMN difficulty SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.tile_puzzles'::regclass
          AND conname = 'tile_puzzles_difficulty_check'
    ) THEN
        ALTER TABLE tile_puzzles
            ADD CONSTRAINT tile_puzzles_difficulty_check
            CHECK (difficulty IN ('Easy', 'Medium', 'Hard'));
    END IF;
END;
$$;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_tile_puzzles_slug ON tile_puzzles(slug);

-- Create index on published for filtering
CREATE INDEX IF NOT EXISTS idx_tile_puzzles_published ON tile_puzzles(published);

-- Create index on featured for filtering
CREATE INDEX IF NOT EXISTS idx_tile_puzzles_featured ON tile_puzzles(featured);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_tile_puzzles_created_at ON tile_puzzles(created_at DESC);

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_tile_puzzles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tile_puzzles_updated_at
    BEFORE UPDATE ON tile_puzzles
    FOR EACH ROW
    EXECUTE FUNCTION update_tile_puzzles_updated_at();

-- Records a completed game and updates aggregate statistics atomically.
p

-- Insert sample data
INSERT INTO tile_puzzles (slug, title, description, image_url, seo_title, seo_description, published, featured) VALUES
    ('mountain-landscape', 'Mountain Landscape', 'Beautiful mountain scenery with snow-capped peaks', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop', 'Mountain Landscape Tile Puzzle - Challenge Your Mind', 'Solve this beautiful mountain landscape tile puzzle. Test your skills with our interactive grid puzzle game.', true, true),
    ('ocean-sunset', 'Ocean Sunset', 'Stunning sunset over the ocean waves', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop', 'Ocean Sunset Tile Puzzle Game', 'Enjoy solving this relaxing ocean sunset tile puzzle. Perfect for puzzle enthusiasts.', true, true),
    ('forest-path', 'Forest Path', 'Peaceful forest trail surrounded by nature', 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1000&auto=format&fit=crop', 'Forest Path Tile Puzzle - Nature Puzzle Game', 'Challenge yourself with this serene forest path tile puzzle. Great for relaxation and mental exercise.', true, false),
    ('city-skyline', 'City Skyline', 'Modern city skyline at night', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop', 'City Skyline Tile Puzzle - Urban Challenge', 'Solve this dynamic city skyline tile puzzle. Perfect for architecture and city lovers.', true, false);

-- Enable Row Level Security (RLS)
ALTER TABLE tile_puzzles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to published puzzles for everyone
CREATE POLICY "Allow public read access to published puzzles"
    ON tile_puzzles
    FOR SELECT
    USING (published = true);

-- Create policy to allow all operations for authenticated users (admins)
-- Adjust this based on your auth setup
CREATE POLICY "Allow full access for authenticated users"
    ON tile_puzzles
    FOR ALL
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE tile_puzzles IS 'Stores tile puzzle game data';
COMMENT ON COLUMN tile_puzzles.slug IS 'URL-friendly identifier';
COMMENT ON COLUMN tile_puzzles.image_url IS 'URL of the puzzle image';
COMMENT ON COLUMN tile_puzzles.difficulty IS 'Puzzle difficulty: Easy, Medium, or Hard';
COMMENT ON COLUMN tile_puzzles.total_plays IS 'Total number of times this puzzle has been played';
COMMENT ON COLUMN tile_puzzles.average_score IS 'Average score across all completions';
COMMENT ON COLUMN tile_puzzles.average_time IS 'Average completion time in seconds';
COMMENT ON COLUMN tile_puzzles.published IS 'Whether the puzzle is visible to users';
COMMENT ON COLUMN tile_puzzles.featured IS 'Whether the puzzle should be featured on the homepage';
