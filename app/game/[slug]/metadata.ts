import { Metadata } from 'next';
import { getLevelBySlug } from '@/lib/levels';

const siteUrl = "https://spotdiffs.com";

export async function generateGameMetadata(slug: string): Promise<Metadata> {
  const { data: level, error } = await getLevelBySlug(slug);

  if (error || !level) {
    return {
      title: 'Game Not Found',
      description: 'The requested game could not be found.',
    };
  }

  const title = level.seo_title || `${level.title} - ${level.difficulty} Difficulty`;
  const description = level.seo_description ||
    `Play ${level.title}, a ${level.difficulty.toLowerCase()} difficulty spot the difference game. Find ${level.differences.length} differences and test your observation skills!`;

  const gameUrl = `${siteUrl}/game/${level.slug}`;
  const imageUrl = level.image_url_1;

  return {
    title,
    description,
    keywords: [
      'spot the difference',
      level.title,
      level.difficulty,
      level.category_name || '',
      'puzzle game',
      'find differences',
    ].filter(Boolean),

    // Open Graph
    openGraph: {
      type: 'article',
      url: gameUrl,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: level.title,
        },
      ],
      siteName: 'Spot the Difference',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },

    // Canonical
    alternates: {
      canonical: gameUrl,
    },

    // Additional
    other: {
      'game:difficulty': level.difficulty,
      'game:differences': level.differences.length.toString(),
    },
  };
}
