import { LevelWithCategory } from './levels';

const siteUrl = 'https://spotdiffs.com';

// Website Schema
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Spot the Difference',
    url: siteUrl,
    description: 'Play the best Spot the Difference games online. Challenge your brain with daily puzzles for adults and kids.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/games?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Organization Schema
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Spot the Difference',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [],
  };
}

// Game Schema for individual game pages
export function getGameSchema(level: LevelWithCategory) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: level.title,
    description: level.description || `Find ${level.differences.length} differences in this ${level.difficulty.toLowerCase()} difficulty puzzle game.`,
    url: `${siteUrl}/game/${level.slug}`,
    image: level.image_url_1,
    genre: 'Puzzle',
    gamePlatform: 'Web Browser',
    numberOfPlayers: '1',
    publisher: {
      '@type': 'Organization',
      name: 'Spot the Difference',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: level.average_score ? {
      '@type': 'AggregateRating',
      ratingValue: (level.average_score / 1000).toFixed(1), // Convert score to 0-5 scale
      bestRating: '5',
      worstRating: '0',
      ratingCount: level.total_plays || 1,
    } : undefined,
  };
}

// BreadcrumbList Schema
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// FAQPage Schema (can be used on help/FAQ pages)
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
