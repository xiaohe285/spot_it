import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_FEEDBACK_LENGTH = 2000;
const ALLOWED_TYPES = ['new_game'] as const;
type FeedbackType = (typeof ALLOWED_TYPES)[number];

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]!.trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const feedbackTypeRaw = body?.feedback_type;
    const feedbackRaw = body?.feedback;

    // Validate type
    if (typeof feedbackTypeRaw !== 'string' || !ALLOWED_TYPES.includes(feedbackTypeRaw as FeedbackType)) {
      return NextResponse.json(
        { error: 'Invalid feedback_type' },
        { status: 400 }
      );
    }

    if (typeof feedbackRaw !== 'string') {
      return NextResponse.json(
        { error: 'Feedback content is required' },
        { status: 400 }
      );
    }

    const feedback = feedbackRaw.trim();
    if (feedback.length === 0) {
      return NextResponse.json(
        { error: 'Feedback content cannot be empty' },
        { status: 400 }
      );
    }
    if (feedback.length > MAX_FEEDBACK_LENGTH) {
      return NextResponse.json(
        { error: `Feedback too long (max ${MAX_FEEDBACK_LENGTH} characters)` },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const supabase = await createClient();

    // Get logged-in user (if any)
    const { data: { user } } = await supabase.auth.getUser();

    // Rate limit: one submission per IP per calendar day (UTC)
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from('user_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', startOfToday.toISOString());

    if (countError) {
      console.error('Feedback rate-limit query failed:', countError);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        { error: 'You can only submit one feedback per day. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    const { error: insertError } = await supabase
      .from('user_feedback')
      .insert({
        ip_address: ip,
        user_id: user?.id ?? null,
        feedback_type: feedbackTypeRaw,
        feedback,
      });

    if (insertError) {
      console.error('Feedback insert failed:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Feedback API error:', err);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
