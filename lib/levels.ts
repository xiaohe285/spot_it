import { createClient } from '@/lib/supabase/client';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category_id: string | null;
  image_url_1: string;
  image_url_2: string;
  differences: { x: number; y: number; radius: number }[];
  difficulty: 'Easy' | 'Hard' | 'Expert';
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  total_plays: number;
  average_score: number;
  average_time: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface LevelWithCategory extends Level {
  category_slug: string | null;
  category_name: string | null;
  category_icon: string | null;
}

// =====================================================
// Categories
// =====================================================

export async function getAllCategories(): Promise<{ data: Category[] | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true });

  return { data, error };
}

export async function getCategoryBySlug(
  slug: string
): Promise<{ data: Category | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  return { data, error };
}

// =====================================================
// Levels
// =====================================================

export async function getAllLevels(): Promise<{ data: LevelWithCategory[] | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true });

  return { data, error };
}

export async function getLevelBySlug(
  slug: string
): Promise<{ data: LevelWithCategory | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  return { data, error };
}

export async function getLevelsByCategory(
  categorySlug: string
): Promise<{ data: LevelWithCategory[] | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('category_slug', categorySlug)
    .eq('published', true)
    .order('display_order', { ascending: true });

  return { data, error };
}

export async function getLevelsByDifficulty(
  difficulty: 'Easy' | 'Hard' | 'Expert'
): Promise<{ data: LevelWithCategory[] | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('difficulty', difficulty)
    .eq('published', true)
    .order('display_order', { ascending: true });

  return { data, error };
}

export async function getFeaturedLevels(
  limit: number = 4
): Promise<{ data: LevelWithCategory[] | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('featured_levels')
    .select('*')
    .limit(limit);

  return { data, error };
}

export async function getPopularLevels(
  limit: number = 4
): Promise<{ data: LevelWithCategory[] | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('popular_levels')
    .select('*')
    .limit(limit);

  return { data, error };
}

// =====================================================
// Search and Filters
// =====================================================

export async function searchLevels(
  query: string
): Promise<{ data: LevelWithCategory[] | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('published', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('total_plays', { ascending: false });

  return { data, error };
}

// =====================================================
// Statistics
// =====================================================

export async function getLevelStats(
  slug: string
): Promise<{ data: any | null; error: any }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('levels')
    .select('total_plays, average_score, average_time')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  return { data, error };
}
