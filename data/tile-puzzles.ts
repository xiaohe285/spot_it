import { TilePuzzle } from '@/types';

/**
 * Sample tile puzzle data
 * This data serves as a reference for the database structure
 * Actual data will be fetched from Supabase
 */
export const tilePuzzles: TilePuzzle[] = [
  {
    id: '1',
    slug: 'mountain-landscape',
    title: 'Mountain Landscape',
    description: 'Beautiful mountain scenery with snow-capped peaks',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop',
    seoTitle: 'Mountain Landscape Tile Puzzle - Challenge Your Mind',
    seoDescription: 'Solve this beautiful mountain landscape tile puzzle. Test your skills with our interactive grid puzzle game.',
    published: true,
    featured: true,
  },
  {
    id: '2',
    slug: 'ocean-sunset',
    title: 'Ocean Sunset',
    description: 'Stunning sunset over the ocean waves',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    seoTitle: 'Ocean Sunset Tile Puzzle Game',
    seoDescription: 'Enjoy solving this relaxing ocean sunset tile puzzle. Perfect for puzzle enthusiasts.',
    published: true,
    featured: true,
  },
  {
    id: '3',
    slug: 'forest-path',
    title: 'Forest Path',
    description: 'Peaceful forest trail surrounded by nature',
    imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1000&auto=format&fit=crop',
    seoTitle: 'Forest Path Tile Puzzle - Nature Puzzle Game',
    seoDescription: 'Challenge yourself with this serene forest path tile puzzle. Great for relaxation and mental exercise.',
    published: true,
    featured: false,
  },
  {
    id: '4',
    slug: 'city-skyline',
    title: 'City Skyline',
    description: 'Modern city skyline at night',
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop',
    seoTitle: 'City Skyline Tile Puzzle - Urban Challenge',
    seoDescription: 'Solve this dynamic city skyline tile puzzle. Perfect for architecture and city lovers.',
    published: true,
    featured: false,
  },
];
