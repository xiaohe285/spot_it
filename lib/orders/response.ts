import type { PremiumPayment } from './types';

interface Dependencies {
  getUser: () => Promise<{ id: string } | null>;
  listPayments: (userId: string, offset: number, limit: number) => Promise<PremiumPayment[]>;
}
export async function ordersResponse(request: Request, deps: Dependencies) {
  const reply = (body: object, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
  const value = new URL(request.url).searchParams.get('page') || '1';
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 100000) return reply({ error: 'Invalid page.' }, 400);
  try {
    const user = await deps.getUser();
    if (!user) return reply({ error: 'Please sign in to view your orders.', code: 'SESSION_EXPIRED' }, 401);
    const page = Number(value);
    const payments = await deps.listPayments(user.id, (page - 1) * 20, 21);
    return reply({ payments: payments.slice(0, 20), page, hasMore: payments.length > 20 });
  } catch { return reply({ error: 'We couldn’t load your orders. Please try again in a moment.' }, 503); }
}
