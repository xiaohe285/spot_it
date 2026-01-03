import { createClient } from '@/lib/supabase/server';
import { Level } from '@/types';

// Theme type matching themes_with_stats view
export interface Theme {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover: string;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  level_count: number;
  easy_levels: number;
  hard_levels: number;
  expert_levels: number;
  total_plays: number;
}

// Database type with snake_case fields for levels_with_theme
interface LevelWithThemeDB {
  id: string;
  slug: string;
  title: string;
  image_url_1: string;
  image_url_2: string;
  differences: { x: number; y: number; radius: number }[];
  difficulty: 'Easy' | 'Hard' | 'Expert';
  category: 'Adults' | 'Kids' | 'Themes';
  theme_id: string | null;
}

// Convert database format to application format
function convertDBToLevel(dbLevel: LevelWithThemeDB): Level {
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
 * Fetch paginated themes from themes_with_stats view
 */
export async function getThemes(page: number = 1, pageSize: number = 12): Promise<{
  themes: Theme[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = await createClient();

  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch total count of published themes
  const { count, error: countError } = await supabase
    .from('themes_with_stats')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)
    .gt('level_count', 0);

  if (countError) {
    console.error('Error fetching themes count:', countError);
    throw new Error(`Failed to fetch themes count: ${countError.message}`);
  }

  const total = count || 0;

  // Fetch paginated data
  const { data, error } = await supabase
    .from('themes_with_stats')
    .select('*')
    .eq('published', true)
    .gt('level_count', 0)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching themes:', error);
    throw new Error(`Failed to fetch themes: ${error.message}`);
  }

  const themes = data || [];
  const totalPages = Math.ceil(total / pageSize);

  return {
    themes,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Fetch a single theme by slug
 */
export async function getThemeBySlug(slug: string): Promise<Theme | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('themes_with_stats')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching theme:', error);
    return null;
  }

  return data;
}

/**
 * Fetch levels by theme ID
 */
export async function getLevelsByThemeId(themeId: string, page: number = 1, pageSize: number = 24): Promise<{
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
    .select('*', { count: 'exact', head: true })
    .eq('theme_id', themeId)
    .eq('published', true);

  if (countError) {
    console.error('Error fetching levels count:', countError);
    throw new Error(`Failed to fetch levels count: ${countError.message}`);
  }

  const total = count || 0;

  // Fetch paginated data
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .eq('theme_id', themeId)
    .eq('published', true)
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