export interface Level {
  id: string;
  slug: string;
  title: string;
  imageUrl1: string;
  imageUrl2?: string; // 单图模式时可选
  differences: { x: number; y: number; radius: number }[];
  difficulty: 'Easy' | 'Hard' | 'Expert';
  category: 'Adults' | 'Kids' | 'Themes';
  mode?: 'compare' | 'single'; // 游戏模式，默认为compare
  description?: string; // 游戏介绍
  average_time?: number; // 平均完成时间（秒）
  average_score?: number; // 平均得分
}

export interface User {
  id: string;
  name: string;
  score: number;
  completedLevels: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: number;
}

export interface TilePuzzle {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl: string;
  seoTitle?: string;
  seoDescription?: string;
  totalPlays?: number;
  averageScore?: number;
  averageTime?: number;
  published?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TilePuzzleStats {
  stars: number; // 1-3 stars
  timeElapsed: number;
  moves: number;
  gridSize: number;
}
