import { MetadataRoute } from 'next';
import { getAllLevels, getAllCategories, getDifferenceCountStats } from '@/lib/levels';
import { getPrintableCatalog } from '@/lib/db/printables';
import {
    buildPrintableBrowsePath,
    parsePrintableFilterSegments,
} from '@/lib/printableFilters';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://spotdiffs.com';
    const printableCatalog = await getPrintableCatalog();
    const printableProducts = printableCatalog.products;

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
            url: `${baseUrl}/games/differences`,
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
        {
            url: `${baseUrl}/printables`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/printables/premium`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/refund-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.4,
        },
    ];

    const printableRoutes: MetadataRoute.Sitemap = printableProducts.map((product) => ({
        url: `${baseUrl}/printables/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: product.priceCents === 0 ? 0.85 : 0.8,
    }));

    // Curated, keyword-backed filter landing pages. Do not enumerate every
    // possible combination; canonical routes still work for all valid filters.
    const printableFilterRoutes: MetadataRoute.Sitemap = [
        ['free'],
        ['kids'],
        ['preschool'],
        ['adults-teens'],
        ['hard'],
        ['kids', 'animals'],
        ['kids', 'seasonal'],
        ['worksheets'],
        ['senior-activities'],
    ].map((segments) => {
        const { selected } = parsePrintableFilterSegments(
            segments,
            printableCatalog.filterGroups,
        );
        return {
            url: `${baseUrl}${buildPrintableBrowsePath(
                selected,
                printableCatalog.filterGroups,
            )}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        };
    });

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

    // Difference-count browse pages
    const { data: differenceGroups } = await getDifferenceCountStats();
    const differenceRoutes: MetadataRoute.Sitemap = differenceGroups?.map((group) => ({
        url: `${baseUrl}/games/differences/${group.count}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
    })) || [];

    return [
        ...staticRoutes,
        ...printableRoutes,
        ...printableFilterRoutes,
        ...levelRoutes,
        ...categoryRoutes,
        ...differenceRoutes,
    ];
}
