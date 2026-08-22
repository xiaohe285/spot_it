import { createClient } from '@/lib/supabase/server';
import { TilePuzzle } from '@/types';

// Database type with snake_case fields
interface TilePuzzleDB {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image_url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  seo_title?: string;
  seo_description?: string;
  total_plays?: number;
  average_score?: number;
  average_time?: number;
  published?: boolean;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Convert database format to application format
function convertDBToTilePuzzle(dbPuzzle: TilePuzzleDB): TilePuzzle {
  return {
    id: dbPuzzle.id,
    slug: dbPuzzle.slug,
    title: dbPuzzle.title,
    description: dbPuzzle.description,
    imageUrl: dbPuzzle.image_url,
    difficulty: dbPuzzle.difficulty,
    seoTitle: dbPuzzle.seo_title,
    seoDescription: dbPuzzle.seo_description,
    totalPlays: dbPuzzle.total_plays,
    averageScore: dbPuzzle.average_score,
    averageTime: dbPuzzle.average_time,
    published: dbPuzzle.published,
    featured: dbPuzzle.featured,
    createdAt: dbPuzzle.created_at,
    updatedAt: dbPuzzle.updated_at,
  };
}

/**
 * Fetch all tile puzzles from the database (without pagination)
 */
export async function getAllTilePuzzles(): Promise<TilePuzzle[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tile_puzzles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tile puzzles:', error);
    throw new Error(`Failed to fetch tile puzzles: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map(convertDBToTilePuzzle);
}

/**
 * Fetch paginated tile puzzles from the database
 */
export async function getTilePuzzles(page: number = 1, pageSize: number = 24): Promise<{
  puzzles: TilePuzzle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = await createClient();

  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch total count (only published puzzles)
  const { count, error: countError } = await supabase
    .from('tile_puzzles')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  if (countError) {
    console.error('Error fetching tile puzzles count:', countError);
    throw new Error(`Failed to fetch tile puzzles count: ${countError.message}`);
  }

  const total = count || 0;

  // Fetch paginated data
  const { data, error } = await supabase
    .from('tile_puzzles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching tile puzzles:', error);
    throw new Error(`Failed to fetch tile puzzles: ${error.message}`);
  }

  const puzzles = data ? data.map(convertDBToTilePuzzle) : [];
  const totalPages = Math.ceil(total / pageSize);

  return {
    puzzles,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Fetch a single tile puzzle by slug
 */
export async function getTilePuzzleBySlug(slug: string): Promise<TilePuzzle | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tile_puzzles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching tile puzzle:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return convertDBToTilePuzzle(data);
}

/**
 * Fetch featured tile puzzles
 */
export async function getFeaturedTilePuzzles(limit: number = 6): Promise<TilePuzzle[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tile_puzzles')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured tile puzzles:', error);
    throw new Error(`Failed to fetch featured tile puzzles: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map(convertDBToTilePuzzle);
}
