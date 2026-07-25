# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a "Spot the Difference" puzzle game built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4. Players compare two images side-by-side to find and click on differences.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Application Structure

- **App Router (Next.js 16)**: File-based routing in `app/` directory
  - `/` - Home page with hero section and category navigation
  - `/games` - Game browser with difficulty filtering
  - `/games/[slug]` - Individual game level pages
  - `/game/[slug]` - Active gameplay interface
  - `/daily/*` - Daily challenge system (today, archive, date-specific)
  - `/leaderboard` - Player rankings
  - `/streak` - User streak tracking

### Core Data Flow

1. **Level Data** (`data/levels.ts`): Central source of all game levels
   - Contains `Level` objects with image URLs, difference coordinates, difficulty, and category
   - Differences stored as percentage-based coordinates `{ x, y, radius }` for responsive positioning

2. **Game Canvas Component** (`components/game/GameCanvas.tsx`):
   - Client-side interactive game logic
   - Handles click detection using percentage-based coordinate system
   - Converts pixel clicks to percentages, compares against difference coordinates
   - Manages state: `foundDifferences`, `wrongClicks`, `imageSize`
   - Scoring: Base 1000 points minus 50 per wrong click

3. **Type Definitions** (`types/index.ts`):
   - `Level`: Game level structure
   - `User`: Player profile (currently unused, placeholder for future features)

### Coordinate System

The game uses a percentage-based coordinate system (0-100 on both axes) to handle responsive image sizing:
- Click positions converted to percentages relative to image container
- Differences defined in percentages in level data
- Hit detection uses Euclidean distance: `(dx² + dy²) < radius²`

### Styling

- Tailwind CSS 4 with PostCSS configuration
- Custom fonts: Geist Sans and Geist Mono via `next/font`
- Dark mode support with `dark:` variants
- Responsive design with mobile-first approach

### Path Alias

- `@/*` maps to project root (configured in `tsconfig.json`)
- Use `@/components/...`, `@/types/...`, `@/data/...` for imports

## Key Implementation Details

### Adding New Levels

To add a new game level:

1. Add level object to `data/levels.ts` array
2. Provide unique `id` and `slug`
3. Set `imageUrl1` and `imageUrl2` (currently using same URLs; in production, second image should be modified)
4. Define `differences` array with percentage coordinates
5. Specify `difficulty` ('Easy', 'Hard', 'Expert') and `category` ('Adults', 'Kids', 'Themes')

### Game Completion Flow

1. Player clicks on image in `GameCanvas`
2. Click coordinates converted to percentages
3. System checks if click hits any unfound difference
4. On hit: Difference marked as found with green circle animation
5. On miss: Red X animation displayed for 1 second
6. When all differences found: `onComplete` callback fired with final score
7. Game page (`app/game/[slug]/page.tsx`) displays completion modal

### Next.js 16 Specific Patterns

- **Dynamic Routes**: Use `params` as a Promise in page components
  ```typescript
  export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
  }
  ```
- **Client Components**: Game interactivity requires `'use client'` directive
- **Image Optimization**: Use `next/image` with `fill` prop for responsive images

## Known Limitations

- Currently uses same image URL for both sides (placeholder implementation)
- No actual backend or database (client-side only)
- Leaderboard shows mock data
- User profiles and streak tracking not yet implemented
- No external remote image domains configured in `next.config.ts` yet (relying on Unsplash URLs)
