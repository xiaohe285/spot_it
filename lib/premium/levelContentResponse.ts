import { isPremiumLevelContent } from './levelContent';
import type { LevelWithCategory } from '@/lib/levels';

type CatalogLevel = Pick<LevelWithCategory, 'slug' | 'mode' | 'differences' | 'published' | 'is_premium'>;
type Dependencies = {
  getUser: () => Promise<{ id: string } | null>;
  isActive: () => Promise<boolean>;
  getLevel: (slug: string) => Promise<CatalogLevel | null>;
  getContent: (slug: string) => Promise<unknown>;
};

// Keep authorization and response construction together so every response is private.
export async function premiumLevelContentResponse(slug: string, deps: Dependencies): Promise<Response> {
  const json = (body: unknown, status = 200) => Response.json(body, {
    status, headers: { 'Cache-Control': 'private, no-store' },
  });
  try {
    if (!await deps.getUser()) return json({ error: 'Sign in to play Premium puzzles.' }, 401);
    if (!await deps.isActive()) return json({ error: 'An active Premium membership is required.' }, 403);
    const level = await deps.getLevel(slug);
    if (!level?.published || !level.is_premium) return json({ error: 'Premium puzzle not found.' }, 404);
    const content = await deps.getContent(level.slug);
    if (!isPremiumLevelContent(content, level)) {
      return json({ error: 'This puzzle is not ready. Please retry later.' }, 503);
    }
    return json({
      slug: content.slug,
      image_url_1: content.image_url_1,
      image_url_2: content.image_url_2,
      differences: content.differences,
    });
  } catch {
    return json({ error: 'Unable to load this Premium puzzle. Please retry.' }, 503);
  }
}
