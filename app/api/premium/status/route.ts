import { NextResponse } from 'next/server';
import { getPremiumStatus } from '@/lib/premium/server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    return NextResponse.json(await getPremiumStatus(request), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to check Premium access. Please retry.' }, { status: 503 });
  }
}
