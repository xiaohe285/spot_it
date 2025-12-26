// Share functionality for game results
import { GameStats } from '@/components/game/GameCanvas';

export interface ShareData {
  levelTitle: string;
  stars: number;
  stats: GameStats;
}

// Generate formatted share text
export function generateShareText(data: ShareData): string {
  const { levelTitle, stars, stats } = data;
  const starEmoji = '⭐'.repeat(Math.floor(stars));

  return `I just completed "${levelTitle}" in Spot Diffs! ${starEmoji}

🎯 Score: ${stats.score.toLocaleString()}
⏱️ Time: ${Math.floor(stats.timeElapsed / 60)}:${(stats.timeElapsed % 60).toString().padStart(2, '0')}
🎯 Accuracy: ${stats.accuracy.toFixed(1)}%
🔥 Max Combo: ${stats.maxCombo}x

Can you beat my score? 🎮`;
}

// Share to Twitter/X
export function shareToTwitter(text: string, url?: string): void {
  const twitterUrl = new URL('https://twitter.com/intent/tweet');
  twitterUrl.searchParams.set('text', text);

  if (url) {
    twitterUrl.searchParams.set('url', url);
  }

  window.open(twitterUrl.toString(), '_blank', 'width=550,height=420');
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy text:', fallbackError);
      return false;
    }
  }
}
