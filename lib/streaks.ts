import { createClient } from '@/lib/supabase/client';

export interface StreakStats {
  current_streak: number;
  longest_streak: number;
  total_days: number;
  last_play_date: string | null;
}

export interface DayActivity {
  activity_date: string;
  played: boolean;
}

// Get user's complete streak statistics
export async function getUserStreakStats(
  userId: string
): Promise<{ data: StreakStats | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_user_streak_stats', {
    p_user_id: userId,
  });

  if (error) {
    return { data: null, error };
  }

  // The function returns an array with one row, extract it
  return { data: data?.[0] || null, error: null };
}

// Get last 30 days activity
export async function getLast30DaysActivity(
  userId: string
): Promise<{ data: DayActivity[] | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_last_30_days_activity', {
    p_user_id: userId,
  });

  return { data, error };
}

// Get streak milestones (client-side calculation based on stats)
export function getStreakMilestones(longestStreak: number) {
  const milestones = [
    { days: 7, label: '7 Day Streak', icon: '🏅' },
    { days: 14, label: '14 Day Streak', icon: '🏅' },
    { days: 30, label: '30 Day Streak', icon: '🏆' },
    { days: 60, label: '60 Day Streak', icon: '🏆' },
    { days: 100, label: '100 Day Streak', icon: '💯' },
    { days: 365, label: '365 Day Streak', icon: '👑' },
  ];

  return milestones.map((milestone) => ({
    ...milestone,
    achieved: longestStreak >= milestone.days,
  }));
}
