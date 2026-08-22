import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_SLUG_LENGTH = 120;
const MAX_SCORE = 100_000;
const MAX_COMPLETION_TIME = 86_400;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface CompletionPayload {
  slug?: unknown;
  score?: unknown;
  timeElapsed?: unknown;
}

function isValidInteger(value: unknown, maximum: number): value is number {
  return typeof value === 'number'
    && Number.isInteger(value)
    && value >= 0
    && value <= maximum;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompletionPayload = await request.json();
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';

    if (!slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
      return NextResponse.json({ error: 'Invalid puzzle slug' }, { status: 400 });
    }

    if (!isValidInteger(body.score, MAX_SCORE)) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    if (!isValidInteger(body.timeElapsed, MAX_COMPLETION_TIME)) {
      return NextResponse.json({ error: 'Invalid completion time' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc('record_tile_puzzle_completion', {
      p_slug: slug,
      p_score: body.score,
      p_time: body.timeElapsed,
    });

    if (error) {
      console.error('Tile puzzle completion update failed:', error);
      return NextResponse.json({ error: 'Failed to record puzzle completion' }, { status: 500 });
    }

    if (!data?.length) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, stats: data[0] });
  } catch (error) {
    console.error('Tile puzzle completion API error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
