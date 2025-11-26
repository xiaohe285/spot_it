import { createClient } from '@/lib/supabase/server';
import { Level } from '@/types';

// Database type with snake_case fields
interface LevelDB {
  id: string;
  slug: string;
  title: string;
  image_url_1: string;
  image_url_2: string;
  differences: { x: number; y: number; radius: number }[];
  difficulty: 'Easy' | 'Hard' | 'Expert';
  category: 'Adults' | 'Kids' | 'Themes';
  created_at?: string;
  updated_at?: string;
}

// Convert database format to application format
function convertDBToLevel(dbLevel: LevelDB): Level {
  return {
    id: dbLevel.id,
    slug: dbLevel.slug,
    title: dbLevel.title,
    imageUrl1: dbLevel.image_url_1,
    imageUrl2: dbLevel.image_url_2,
    differences: dbLevel.differences,
    difficulty: dbLevel.difficulty,
    category: dbLevel.category,
  };
}

/**
 * Fetch all game levels from the database (without pagination)
 */
export async function getAllLevels(): Promise<Level[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching levels:', error);
    throw new Error(`Failed to fetch levels: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map(convertDBToLevel);
}

/**
 * Fetch paginated game levels from the database
 */
export async function getLevels(page: number = 1, pageSize: number = 24): Promise<{
  levels: Level[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = await createClient();

  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch total count
  const { count, error: countError } = await supabase
    .from('levels')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error fetching levels count:', countError);
    throw new Error(`Failed to fetch levels count: ${countError.message}`);
  }

  const total = count || 0;

  // Fetch paginated data
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching levels:', error);
    throw new Error(`Failed to fetch levels: ${error.message}`);
  }

  const levels = data ? data.map(convertDBToLevel) : [];
  const totalPages = Math.ceil(total / pageSize);

  return {
    levels,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Fetch a single level by slug
 */
export async function getLevelBySlug(slug: string): Promise<Level | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching level:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return convertDBToLevel(data);
}

/**
 * Fetch levels by category
 */
export async function getLevelsByCategory(category: 'Adults' | 'Kids' | 'Themes'): Promise<Level[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching levels by category:', error);
    throw new Error(`Failed to fetch levels by category: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map(convertDBToLevel);
}

/**
 * Fetch levels by difficulty
 */
export async function getLevelsByDifficulty(difficulty: 'Easy' | 'Hard' | 'Expert'): Promise<Level[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('difficulty', difficulty)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching levels by difficulty:', error);
    throw new Error(`Failed to fetch levels by difficulty: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map(convertDBToLevel);
}
