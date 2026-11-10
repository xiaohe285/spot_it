import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { freePremiumStatus, type PremiumStatus } from './plans';
import { waffoEnvironment } from '@/lib/waffo/server';
import { requestAccessToken } from './auth';

export async function getPremiumStatus(request?: Request): Promise<PremiumStatus> {
  const accessToken = requestAccessToken(request);
  const supabase = await createClient(accessToken);
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError && authError.name !== 'AuthSessionMissingError') throw authError;
  if (!user) return { ...freePremiumStatus };
  const { data, error } = await supabase.rpc('get_game_premium_status');
  if (error) throw error;
  if (data?.waffoMode && data.waffoMode !== waffoEnvironment()) return { ...freePremiumStatus };
  return data as PremiumStatus;
}
export async function hasPremiumPackAccess(productId: string) {
  const status = await getPremiumStatus();
  return status.active && status.redeemedProductIds.includes(productId);
}
