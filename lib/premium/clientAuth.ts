import { createClient } from '@/lib/supabase/client';

export async function premiumAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session }, error } = await createClient().auth.getSession();
  if (error) throw new Error('We couldn’t refresh your session. Please try again in a moment.');
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}
