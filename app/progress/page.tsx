import type { Metadata } from 'next';
import ProgressClient from './ProgressClient';

export const metadata: Metadata = {
  title: 'XP Progress | SpotDiffs',
  description: 'Track your SpotDiffs level, XP history, achievements, badges, and streaks.',
  robots: { index: false, follow: false },
};

export default function ProgressPage() {
  return <ProgressClient />;
}
