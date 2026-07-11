import { createClient } from '@/lib/supabase/client';
import { GameStats } from '@/components/game/GameCanvas';

export interface GameRecord {
  id?: string;
  user_id: string;
  level_id: string;
  level_slug: string;
  level_title: string;
  score: number;
  time_elapsed: number;
  accuracy: number;
  total_clicks: number;
  wrong_clicks: number;
  hints_used: number;
  max_combo: number;
  stars: number;
  badges_earned: string[];
  played_at?: string;
  created_at?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username?: string;
  avatar?: string;
  score: number;
  time_elapsed: number;
  accuracy: number;
  stars: number;
  rank: number;
  level_slug?: string;
  level_title?: string;
}

export interface UserRank {
  rank: number;
  total_score: number;
  games_played: number;
  average_stars: number;
}

export interface UserStats {
  total_score: number;
  games_played: number;
  total_time_played: number;
  average_accuracy: number;
  average_stars: number;
  total_stars: number;
  badges_earned: string[];
}

// Save game record to Supabase
export async function saveGameRecord(
  userId: string,
  levelId: string,
  levelSlug: string,
  levelTitle: string,
  stats: GameStats,
  stars: number,
  badges: string[]
): Promise<{ data: GameRecord | null; error: Error | null }> {
  const supabase = createClient();

  const record: Omit<GameRecord, 'id' | 'played_at' | 'created_at'> = {
    user_id: userId,
    level_id: levelId,
    level_slug: levelSlug,
    level_title: levelTitle,
    score: stats.score,
    time_elapsed: stats.timeElapsed,
    accuracy: stats.accuracy,
    total_clicks: stats.totalClicks,
    wrong_clicks: stats.wrongClicks,
    hints_used: stats.hintsUsed,
    max_combo: stats.maxCombo,
    stars: stars,
    badges_earned: badges,
  };

  const { data, error } = await supabase
    .from('game_records')
    .insert([record])
    .select()
    .single();

  return { data, error };
}

// Get user's game history
export async function getUserGameHistory(
  userId: string,
  limit: number = 10
): Promise<{ data: GameRecord[] | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('game_records')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

// Get user's best score for a specific level
export async function getUserBestScore(
  userId: string,
  levelSlug: string
): Promise<{ data: GameRecord | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('game_records')
    .select('*')
    .eq('user_id', userId)
    .eq('level_slug', levelSlug)
    .order('score', { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}

// Get level leaderboard
export async function getLevelLeaderboard(
  levelSlug: string,
  limit: number = 10
): Promise<{ data: LeaderboardEntry[] | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('level_leaderboard')
    .select('*')
    .eq('level_slug', levelSlug)
    .limit(limit);

  return { data, error };
}

// Get global leaderboard
export async function getGlobalLeaderboard(
  limit: number = 50
): Promise<{ data: LeaderboardEntry[] | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('global_leaderboard')
    .select('*')
    .gt('total_score', 0)
    .limit(limit);

  return { data, error };
}

// Get user's rank in global leaderboard
export async function getUserRank(userId: string): Promise<{ data: UserRank | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('global_leaderboard')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

// Get user's statistics
export async function getUserStats(userId: string): Promise<{ data: UserStats | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}
