import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/private/', '/my-orders'],
        },
        sitemap: 'https://spotdiffs.com/sitemap.xml',
    };
}
