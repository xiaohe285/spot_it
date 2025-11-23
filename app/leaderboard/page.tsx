import { Metadata } from 'next';
import LeaderboardClient from './LeaderboardClient';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Global Leaderboard - Top Players',
  description: 'Check out the global leaderboard and see how you rank against other spot the difference players. Compete for the top spots!',
  openGraph: {
    title: 'Global Leaderboard - Spot the Difference',
    description: 'Check out the global leaderboard and see how you rank against other players. Compete for the top spots!',
    url: `${siteUrl}/leaderboard`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Global Leaderboard - Spot the Difference',
    description: 'See the top spot the difference players and compete for the top spots!',
  },
  alternates: {
    canonical: `${siteUrl}/leaderboard`,
  },
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
