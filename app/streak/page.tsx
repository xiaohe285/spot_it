import { Metadata } from 'next';
import StreakClient from './StreakClient';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Your Streak - Track Your Daily Progress',
  description: 'Track your daily playing streak, earn milestones, and maintain your momentum. See your current streak and unlock achievements!',
  openGraph: {
    title: 'Your Streak - Spot the Difference',
    description: 'Track your daily playing streak and unlock achievements. Maintain your momentum!',
    url: `${siteUrl}/streak`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Your Streak - Spot the Difference',
    description: 'Track your daily playing streak and unlock achievements!',
  },
  alternates: {
    canonical: `${siteUrl}/streak`,
  },
};

export default function StreakPage() {
  return <StreakClient />;
}
