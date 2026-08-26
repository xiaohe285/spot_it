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
  target_time: number;
  found: number;
  total_differences: number;
  completion: number;
  t_score: number;
  a_score: number;
  h_score: number;
  c_score: number;
  performance: number;
  rating: GameStats['rating'];
  is_new_pb: boolean;
  is_first_attempt?: boolean;
  score_contribution: number;
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

export interface FirstAttemptLeaderboardEntry {
  level_slug: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  score: number;
  time_elapsed: number;
  accuracy: number;
  rating: GameStats['rating'];
  first_attempt_at: string;
  rank: number;
}

export interface FirstAttemptStats {
  level_slug: string;
  participant_count: number;
  average_first_score: number;
  average_first_time: number;
}

export interface FirstAttemptLeaderboardData {
  topTen: FirstAttemptLeaderboardEntry[];
  currentUser: FirstAttemptLeaderboardEntry | null;
  stats: FirstAttemptStats;
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
    target_time: stats.targetTime,
    found: stats.found,
    total_differences: stats.totalDifferences,
    completion: stats.completion,
    t_score: stats.timeScore,
    a_score: stats.accuracyScore,
    h_score: stats.hintScore,
    c_score: stats.completionScore,
    performance: stats.performance,
    rating: stats.rating,
    is_new_pb: false,
    score_contribution: 0,
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

// Get the per-level leaderboard using only each user's first completed attempt.
export async function getLevelFirstAttemptLeaderboard(
  levelSlug: string,
  currentUserId?: string | null
): Promise<{ data: FirstAttemptLeaderboardData | null; error: Error | null }> {
  const supabase = createClient();

  const topTenRequest = supabase
    .from('level_first_attempt_leaderboard')
    .select('*')
    .eq('level_slug', levelSlug)
    .order('rank', { ascending: true })
    .limit(10);

  const statsRequest = supabase
    .from('level_first_attempt_stats')
    .select('*')
    .eq('level_slug', levelSlug)
    .maybeSingle();

  const currentUserRequest = currentUserId
    ? supabase
        .from('level_first_attempt_leaderboard')
        .select('*')
        .eq('level_slug', levelSlug)
        .eq('user_id', currentUserId)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const [topTenResult, statsResult, currentUserResult] = await Promise.all([
    topTenRequest,
    statsRequest,
    currentUserRequest,
  ]);

  const queryError = topTenResult.error || statsResult.error || currentUserResult.error;
  if (queryError) {
    return { data: null, error: new Error(queryError.message) };
  }

  const topTen = (topTenResult.data || []) as FirstAttemptLeaderboardEntry[];
  const currentUser = currentUserResult.data as FirstAttemptLeaderboardEntry | null;
  const rawStats = statsResult.data as FirstAttemptStats | null;

  return {
    data: {
      topTen,
      currentUser,
      stats: rawStats || {
        level_slug: levelSlug,
        participant_count: 0,
        average_first_score: 0,
        average_first_time: 0,
      },
    },
    error: null,
  };
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
