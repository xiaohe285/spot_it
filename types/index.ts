export interface Level {
  id: string;
  slug: string;
  title: string;
  imageUrl1: string;
  imageUrl2: string;
  differences: { x: number; y: number; radius: number }[];
  difficulty: 'Easy' | 'Hard' | 'Expert';
  category: 'Adults' | 'Kids' | 'Themes';
}

export interface User {
  id: string;
  name: string;
  score: number;
  completedLevels: string[];
}
