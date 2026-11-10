import { isSameOrigin } from '@/lib/premium/request';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPrintableProductBySlug, getStoredPrintableProductFiles, userHasPrintableAccess } from '@/lib/db/printables';
import { verifyDownloadAccessToken } from '@/lib/downloadTokens';
import { getPremiumStatus } from '@/lib/premium/server';

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to redeem a pack.' }, { status: 401 });
  try {
    const { slug } = await params;
    const product = await getPrintableProductBySlug(slug);
    if (!product) return NextResponse.json({ error: 'Pack not found.' }, { status: 404 });
    const body = await request.json().catch(() => ({}));
    let existingAccess = product.priceCents === 0 || await userHasPrintableAccess(product);
    if (!existingAccess && typeof body.token === 'string') {
      const token = verifyDownloadAccessToken(body.token, product.slug);
      existingAccess = Boolean(token && (token.accessType === 'product' || product.isPremiumIncluded));
    }
    if (existingAccess) return NextResponse.json({ existingAccess: true });
    if (!(await getPremiumStatus()).active) return NextResponse.json({ error: 'An active Premium subscription is required.' }, { status: 403 });
    if (!product.isPremiumIncluded) return NextResponse.json({ error: 'This pack is not included in Premium.' }, { status: 403 });
    const files = await getStoredPrintableProductFiles(product);
    if (!files.length || files.some(file => !file.storagePath || !file.fileName)) {
      return NextResponse.json({ error: 'This pack is temporarily unavailable.' }, { status: 503 });
    }
    const { data, error } = await supabase.rpc('redeem_game_premium_pack', { p_product_id: product.id });
    if (error) {
      const message = error.message.includes('exhausted') ? 'Your 10 monthly pack credits have been used.' : error.message.includes('active subscription') ? 'An active Premium subscription is required.' : 'Unable to redeem this pack. Please retry.';
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ status: data });
  } catch {
    return NextResponse.json({ error: 'This pack is temporarily unavailable. Please retry.' }, { status: 503 });
  }
}
