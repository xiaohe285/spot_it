import type { LevelWithCategory } from '@/lib/levels';

export type PremiumLevelContent = {
  slug: string;
  image_url_1: string;
  image_url_2: string | null;
  differences: { x: number; y: number; radius: number }[];
};

function isImageUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password;
  } catch { return false; }
}

export function isPremiumLevelContent(
  value: unknown,
  level: Pick<LevelWithCategory, 'slug' | 'mode' | 'differences'>,
): value is PremiumLevelContent {
  if (!value || typeof value !== 'object') return false;
  const content = value as Partial<PremiumLevelContent>;
  return content.slug === level.slug
    && isImageUrl(content.image_url_1)
    && (content.image_url_2 === null || isImageUrl(content.image_url_2))
    && (level.mode === 'single' || isImageUrl(content.image_url_2))
    && Array.isArray(content.differences)
    && content.differences.length > 0
    && content.differences.length === level.differences.length
    && content.differences.every(diff => diff && typeof diff === 'object'
      && Number.isFinite(diff.x) && diff.x >= 0 && diff.x <= 100
      && Number.isFinite(diff.y) && diff.y >= 0 && diff.y <= 100
      && Number.isFinite(diff.radius) && diff.radius > 0);
}
