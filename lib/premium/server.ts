import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { freePremiumStatus, type PremiumStatus } from './plans';

export async function getPremiumStatus(): Promise<PremiumStatus> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError && authError.name !== 'AuthSessionMissingError') throw authError;
  if (!user) return { ...freePremiumStatus };
  const { data, error } = await supabase.rpc('get_game_premium_status');
  if (error) throw error;
  return data as PremiumStatus;
}
export async function hasPremiumPackAccess(productId: string) {
  const status = await getPremiumStatus();
  return status.active && status.redeemedProductIds.includes(productId);
}
