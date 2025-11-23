import { MetadataRoute } from 'next';
import { getAllLevels, getAllCategories } from '@/lib/levels';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://spotdiffs.com';

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/games`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/games/difficulty`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/daily/today`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/daily/archive`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/leaderboard`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/streak`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
    ];

    // Fetch all published levels from database
    const { data: levels } = await getAllLevels();
    const levelRoutes: MetadataRoute.Sitemap = levels?.map((level) => ({
        url: `${baseUrl}/game/${level.slug}`,
        lastModified: new Date(level.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
    })) || [];

    // Fetch all published categories from database
    const { data: categories } = await getAllCategories();
    const categoryRoutes: MetadataRoute.Sitemap = categories?.map((category) => ({
        url: `${baseUrl}/games/${category.slug}`,
        lastModified: new Date(category.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
    })) || [];

    return [...staticRoutes, ...levelRoutes, ...categoryRoutes];
}
