import { Metadata } from 'next';
import DailyChallengeClient from './DailyChallengeClient';
import { getDailyChallengeByDate } from '@/lib/levels';

const siteUrl = 'https://spotdiffs.com';

export async function generateMetadata({ params }: { params: Promise<{ year: string; month: string; day: string }> }): Promise<Metadata> {
  const { year, month, day } = await params;
  
  // Parse and validate date
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  
  const date = new Date(yearNum, monthNum - 1, dayNum);
  const dateString = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Try to get actual daily challenge data
  const { data: challenge } = await getDailyChallengeByDate(yearNum, monthNum, dayNum);
  
  let title: string;
  let description: string;
  
  if (challenge) {
    // Use real challenge data
    const challengeTitle = challenge.special_title || challenge.level.title;
    const diffCount = challenge.level.differences.length;
    const difficulty = challenge.level.difficulty;
    
    title = `${dateString} Daily Challenge - ${challengeTitle}`;
    description = `Play the ${dateString} daily spot the difference challenge! Find ${diffCount} differences in this ${difficulty.toLowerCase()} puzzle "${challengeTitle}". Earn bonus points and exclusive badges.`;
  } else {
    // Fallback for dates without specific challenges
    title = `${dateString} Daily Challenge Puzzle - Spot the Difference Challenge`;
    description = `Experience the daily spot the difference puzzle for ${dateString}. Challenge yourself with our carefully selected puzzle of the day and test your observation skills.`;
  }

  const pageUrl = `${siteUrl}/daily/${year}/${month}/${day}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      images: challenge ? [
        {
          url: challenge.level.image_url_1,
          width: 1200,
          height: 600,
          alt: `${challenge.special_title || challenge.level.title} - Daily Challenge`,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: challenge ? [challenge.level.image_url_1] : [],
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      'article:published_time': `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`,
    },
  };
}

export default async function DailyChallengeDetailPage({ params }: { params: Promise<{ year: string; month: string; day: string }> }) {
  const resolvedParams = await params;
  return <DailyChallengeClient params={resolvedParams} />;
}
