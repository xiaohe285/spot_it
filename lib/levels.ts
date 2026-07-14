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
  image_url_2?: string; // 单图模式时可选
  differences: { x: number; y: number; radius: number }[];
  difficulty: 'Easy' | 'Hard' | 'Expert';
  mode?: 'compare' | 'single'; // 游戏模式，默认为compare
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

export async function getAllCategories(): Promise<{ data: Category[] | null; error: Error | null }> {
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
): Promise<{ data: Category | null; error: Error | null }> {
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

export async function getAllLevels(): Promise<{ data: LevelWithCategory[] | null; error: Error | null }> {
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
): Promise<{ data: LevelWithCategory | null; error: Error | null }> {
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
): Promise<{ data: LevelWithCategory[] | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('category_slug', categorySlug)
    .eq('published', true)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getLevelsByCategoryPaginated(
  categorySlug: string,
  page: number = 1,
  pageSize: number = 24
): Promise<{ 
  data: LevelWithCategory[] | null; 
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createClient();

  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch total count for this category
  const { count, error: countError } = await supabase
    .from('levels_with_category')
    .select('*', { count: 'exact', head: true })
    .eq('category_slug', categorySlug)
    .eq('published', true);

  if (countError) {
    return { data: null, error: countError, total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Fetch paginated data
  const { data, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('category_slug', categorySlug)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { 
    data, 
    error, 
    total, 
    page, 
    pageSize, 
    totalPages 
  };
}

export async function getLevelsByDifficulty(
  difficulty: 'Easy' | 'Hard' | 'Expert'
): Promise<{ data: LevelWithCategory[] | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('difficulty', difficulty)
    .eq('published', true)
    .order('display_order', { ascending: true });

  return { data, error };
}

export async function getLevelsByDifficultyPaginated(
  difficulty: 'Easy' | 'Hard' | 'Expert',
  page: number = 1,
  pageSize: number = 24
): Promise<{
  data: LevelWithCategory[] | null;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createClient();

  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch total count
  const { count, error: countError } = await supabase
    .from('levels_with_category')
    .select('*', { count: 'exact', head: true })
    .eq('difficulty', difficulty)
    .eq('published', true);

  if (countError) {
    return {
      data: null,
      error: countError,
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const total = count || 0;

  // Fetch paginated data
  const { data, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('difficulty', difficulty)
    .eq('published', true)
    .order('display_order', { ascending: true })
    .range(from, to);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    error,
    total,
    page,
    pageSize,
    totalPages,
  };
}

// =====================================================
// Difference Count Browsing
// =====================================================

export interface DifferenceCountGroup {
  count: number;
  gameCount: number;
  coverImage: string;
  difficulty: 'Easy' | 'Hard' | 'Expert';
}

function getDominantDifficulty(
  levels: LevelWithCategory[]
): 'Easy' | 'Hard' | 'Expert' {
  const tallies: Record<'Easy' | 'Hard' | 'Expert', number> = {
    Easy: 0,
    Hard: 0,
    Expert: 0,
  };
  for (const level of levels) {
    tallies[level.difficulty] += 1;
  }
  return (Object.entries(tallies) as ['Easy' | 'Hard' | 'Expert', number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

/** Group published levels by number of differences (for hub page cards). */
export async function getDifferenceCountStats(): Promise<{
  data: DifferenceCountGroup[] | null;
  error: Error | null;
}> {
  const { data: levels, error } = await getAllLevels();

  if (error || !levels) {
    return { data: null, error };
  }

  const groups = new Map<number, LevelWithCategory[]>();
  for (const level of levels) {
    const n = level.differences?.length ?? 0;
    if (n < 1) continue;
    const list = groups.get(n) || [];
    list.push(level);
    groups.set(n, list);
  }

  const data: DifferenceCountGroup[] = Array.from(groups.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([count, groupLevels]) => ({
      count,
      gameCount: groupLevels.length,
      coverImage: groupLevels[0].image_url_1,
      difficulty: getDominantDifficulty(groupLevels),
    }));

  return { data, error: null };
}

/** Paginated levels that have exactly `differenceCount` differences. */
export async function getLevelsByDifferenceCountPaginated(
  differenceCount: number,
  page: number = 1,
  pageSize: number = 24
): Promise<{
  data: LevelWithCategory[] | null;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const { data: levels, error } = await getAllLevels();

  if (error || !levels) {
    return {
      data: null,
      error,
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const filtered = levels.filter(
    (level) => (level.differences?.length ?? 0) === differenceCount
  );
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 0;
  const from = (page - 1) * pageSize;
  const data = filtered.slice(from, from + pageSize);

  return {
    data,
    error: null,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getFeaturedLevels(
  limit: number = 4
): Promise<{ data: LevelWithCategory[] | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('featured_levels')
    .select('*')
    .limit(limit);

  return { data, error };
}

export async function getPopularLevels(
  limit: number = 4
): Promise<{ data: LevelWithCategory[] | null; error: Error | null }> {
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
): Promise<{ data: LevelWithCategory[] | null; error: Error | null }> {
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
// Daily Challenges
// =====================================================

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  level_id: string;
  bonus_multiplier: number;
  special_badge: string | null;
  special_title: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyChallengeWithLevel extends DailyChallenge {
  level: LevelWithCategory;
}

export async function getDailyChallenge(
  date?: string
): Promise<{ data: DailyChallengeWithLevel | null; error: Error | null }> {
  const supabase = createClient();
  
  // Use provided date or today's date
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_challenges')
    .select(`
      *,
      level:levels_with_category!inner(*)
    `)
    .eq('challenge_date', targetDate)
    .eq('is_active', true)
    .limit(1);

  if (error) {
    console.error('Error fetching daily challenge:', error);
    // If database error, fallback to algorithm-based selection
    return await getFallbackDailyChallenge(targetDate);
  }

  // If no data found (empty array), fallback to algorithm-based selection
  if (!data || data.length === 0) {
    console.log(`No daily challenge found for ${targetDate}, using fallback`);
    return await getFallbackDailyChallenge(targetDate);
  }

  const dailyChallenge = data[0];
  return {
    data: dailyChallenge ? {
      ...dailyChallenge,
      level: Array.isArray(dailyChallenge.level) ? dailyChallenge.level[0] : dailyChallenge.level
    } : null,
    error: null
  };
}

// Fallback: Generate daily challenge based on date algorithm
async function getFallbackDailyChallenge(
  date: string
): Promise<{ data: DailyChallengeWithLevel | null; error: Error | null }> {
  const supabase = createClient();

  // Create a simple seed from the date
  const dateObj = new Date(date + 'T00:00:00Z');
  const daysSinceEpoch = Math.floor(dateObj.getTime() / (1000 * 60 * 60 * 24));
  
  // Get all published levels
  const { data: levels, error } = await supabase
    .from('levels_with_category')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true });

  if (error || !levels || levels.length === 0) {
    return { data: null, error: error || new Error('No levels found') };
  }

  // Use modulo to select a level deterministically based on date
  const selectedLevel = levels[daysSinceEpoch % levels.length];

  // Create a synthetic daily challenge object
  const dailyChallenge: DailyChallengeWithLevel = {
    id: `fallback-${date}`,
    challenge_date: date,
    level_id: selectedLevel.id,
    bonus_multiplier: 2.0,
    special_badge: 'Daily Champion',
    special_title: `${date} Daily Challenge`,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    level: selectedLevel
  };

  return { data: dailyChallenge, error: null };
}

export async function getTodaysChallenge(): Promise<{ data: DailyChallengeWithLevel | null; error: Error | null }> {
  return getDailyChallenge();
}

export async function getDailyChallengeByDate(
  year: number,
  month: number,
  day: number
): Promise<{ data: DailyChallengeWithLevel | null; error: Error | null }> {
  const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return getDailyChallenge(date);
}

// =====================================================
// Daily Challenge Archive
// =====================================================

export interface DailyChallengeArchiveItem {
  date: string;
  challenge: DailyChallengeWithLevel;
  userRecord?: {
    completed: boolean;
    score: number;
    completion_time?: number;
    completed_at?: string;
  } | null;
}

// Optimized batch query for daily challenges in date range
async function getDailyChallengesBatch(
  startDate: string, 
  endDate: string
): Promise<{ data: DailyChallengeWithLevel[] | null; error: Error | null }> {
  const supabase = createClient();
  
  // Batch query for all challenges in date range
  const { data, error } = await supabase
    .from('daily_challenges')
    .select(`
      *,
      level:levels_with_category!inner(*)
    `)
    .gte('challenge_date', startDate)
    .lte('challenge_date', endDate)
    .eq('is_active', true)
    .order('challenge_date', { ascending: false });

  if (error) {
    console.error('Error fetching daily challenges batch:', error);
    return { data: null, error };
  }

  // Process the results to ensure proper level structure
  const processedData = data?.map(item => ({
    ...item,
    level: Array.isArray(item.level) ? item.level[0] : item.level
  })) || [];

  return { data: processedData, error: null };
}

export async function getDailyChallengeArchive(
  userId?: string,
  limit: number = 30
): Promise<{ data: DailyChallengeArchiveItem[] | null; error: Error | null }> {
  const supabase = createClient();
  
  try {
    // Get the date range for the archive (last 'limit' days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - limit);
    
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    
    // Batch query all challenges in date range (1 query instead of 30)
    const { data: challenges, error: batchError } = await getDailyChallengesBatch(
      startDateString, 
      endDateString
    );
    
    if (batchError) {
      console.error('Failed to fetch challenges batch:', batchError);
      // Continue with fallback approach instead of failing completely
    }
    
    // Create a map of challenges by date for quick lookup
    const challengeMap = new Map<string, DailyChallengeWithLevel>();
    challenges?.forEach(challenge => {
      challengeMap.set(challenge.challenge_date, challenge);
    });
    
    // Pre-load all levels once for fallback generation (避免重复查询)
    let allLevels: LevelWithCategory[] = [];
    const missingDates: string[] = [];
    
    // Check which dates need fallback
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      if (!challengeMap.has(dateString)) {
        missingDates.push(dateString);
      }
    }
    
    // Load all levels once if we need fallback challenges
    if (missingDates.length > 0) {
      const { data: levels, error: levelsError } = await supabase
        .from('levels_with_category')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true });
      
      if (!levelsError && levels) {
        allLevels = levels;
        
        // Generate fallback challenges for missing dates
        missingDates.forEach(dateString => {
          const dateObj = new Date(dateString + 'T00:00:00Z');
          const daysSinceEpoch = Math.floor(dateObj.getTime() / (1000 * 60 * 60 * 24));
          const selectedLevel = allLevels[daysSinceEpoch % allLevels.length];
          
          const fallbackChallenge: DailyChallengeWithLevel = {
            id: `fallback-${dateString}`,
            challenge_date: dateString,
            level_id: selectedLevel.id,
            bonus_multiplier: 2.0,
            special_badge: 'Daily Champion',
            special_title: `${dateString} Daily Challenge`,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            level: selectedLevel
          };
          
          challengeMap.set(dateString, fallbackChallenge);
        });
      }
    }
    
    // Batch query user records if userId is provided
    const userRecordsMap = new Map<string, {
      completed: boolean;
      score: number;
      completion_time: number;
      completed_at: string;
    }>();
    if (userId && challengeMap.size > 0) {
      const challengeIds = Array.from(challengeMap.values()).map(c => c.id);
      
      const { data: userRecords, error: recordsError } = await supabase
        .from('daily_challenge_records')
        .select('challenge_id, completion_time, score, completed_at')
        .eq('user_id', userId)
        .in('challenge_id', challengeIds);
      
      if (!recordsError && userRecords) {
        userRecords.forEach(record => {
          userRecordsMap.set(record.challenge_id, {
            completed: true,
            score: record.score,
            completion_time: record.completion_time,
            completed_at: record.completed_at
          });
        });
      }
    }
    
    const archiveItems: DailyChallengeArchiveItem[] = [];
    
    // Generate archive items for all dates
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      
      const challenge = challengeMap.get(dateString);
      if (!challenge) {
        continue; // Skip if no challenge available
      }
      
      // Get user record for this challenge (if available)
      let userRecord = userRecordsMap.get(challenge.id) || null;
      
      // If user is provided but no record found, mark as not completed
      if (userId && !userRecord) {
        userRecord = {
          completed: false,
          score: 0,
          completion_time: 0,
          completed_at: ''
        };
      }
      
      archiveItems.push({
        date: dateString,
        challenge,
        userRecord
      });
    }
    
    // Sort by date descending (most recent first)
    archiveItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { data: archiveItems, error: null };
    
  } catch (error) {
    console.error('Error in getDailyChallengeArchive:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

export async function getUserDailyChallengeHistory(
  userId: string,
  limit: number = 50
): Promise<{ data: DailyChallengeArchiveItem[] | null; error: Error | null }> {
  const supabase = createClient();
  
  try {
    // Get user's daily challenge records with challenge details
    const { data: records, error } = await supabase
      .from('daily_challenge_records')
      .select(`
        *,
        daily_challenges!inner(*)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      return { data: null, error };
    }
    
    const historyItems: DailyChallengeArchiveItem[] = [];
    
    // Process each record
    for (const record of records || []) {
      const challengeData = Array.isArray(record.daily_challenges) 
        ? record.daily_challenges[0] 
        : record.daily_challenges;
      
      // Get full challenge details with level information
      const { data: fullChallenge, error: challengeError } = await getDailyChallenge(challengeData.challenge_date);
      
      if (!challengeError && fullChallenge) {
        historyItems.push({
          date: challengeData.challenge_date,
          challenge: fullChallenge,
          userRecord: {
            completed: true,
            score: record.score,
            completion_time: record.completion_time,
            completed_at: record.completed_at
          }
        });
      }
    }
    
    return { data: historyItems, error: null };
    
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

// =====================================================
// Statistics
// =====================================================

export interface LevelStats {
  total_plays: number;
  average_score: number;
  average_time: number;
}

export async function getLevelStats(
  slug: string
): Promise<{ data: LevelStats | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('levels')
    .select('total_plays, average_score, average_time')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  return { data, error };
}
