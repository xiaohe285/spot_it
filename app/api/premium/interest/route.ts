import { isSameOrigin } from '@/lib/premium/request';
import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { premiumPlans } from '@/lib/premium/plans';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  try {
    const body = await request.json();
    const plan = premiumPlans.find(plan => plan.id === body.plan);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null;
    if (!plan || !uuid.test(body.visitorId ?? '') || !uuid.test(body.requestId ?? '') ||
      (email !== null && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) ||
      (body.source !== undefined && (typeof body.source !== 'string' || body.source.length > 100)) ||
      (body.levelSlug !== undefined && (typeof body.levelSlug !== 'string' || body.levelSlug.length > 200))) {
      return NextResponse.json({ error: 'Please check your details.' }, { status: 400 });
    }
    const admin = createAdminClient();
    if (!admin) throw new Error('Not configured');
    const { error } = await admin.rpc('record_game_premium_interest', {
      p_visitor: body.visitorId, p_request: body.requestId, p_plan: plan.id,
      p_rate_key: createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!).update(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || body.visitorId).digest('hex'),
      p_source: body.source || 'direct', p_level: body.levelSlug || null, p_email: email,
    });
    if (error) {
      if (error.message.includes('Too many')) return NextResponse.json({ error: 'Too many requests. Please try again tomorrow.' }, { status: 429 });
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to save your interest. Please retry.' }, { status: 503 });
  }
}
