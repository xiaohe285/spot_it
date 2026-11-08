import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { premiumLevelContentResponse } from '@/lib/premium/levelContentResponse';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Client creation is lazy so configuration/network failures use the same private error response.
  const client = () => createClient();
  return premiumLevelContentResponse(slug, {
    async getUser() {
      const supabase = await client();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error?.status === 401 || error?.status === 403) return null;
      if (error && error.name !== 'AuthSessionMissingError') throw error;
      return user;
    },
    async isActive() {
      const supabase = await client();
      const { data, error } = await supabase.rpc('get_game_premium_status');
      if (error) throw error;
      return data?.active === true;
    },
    async getLevel(slug) {
      const supabase = await client();
      const { data, error } = await supabase.from('levels')
        .select('slug, mode, differences, published, is_premium')
        .eq('slug', slug).eq('published', true).eq('is_premium', true).maybeSingle();
      if (error) throw error;
      return data;
    },
    async getContent(slug) {
      const admin = createAdminClient();
      if (!admin) throw new Error('Premium content server is not configured.');
      const { data, error } = await admin.from('premium_level_content')
        .select('slug, image_url_1, image_url_2, differences')
        .eq('slug', slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
