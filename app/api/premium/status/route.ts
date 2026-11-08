import { NextResponse } from 'next/server';
import { getPremiumStatus } from '@/lib/premium/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return NextResponse.json(await getPremiumStatus(), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to check Premium access. Please retry.' }, { status: 503 });
  }
}
