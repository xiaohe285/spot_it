import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticationFailure, requestAccessToken } from '@/lib/premium/auth';
import { waffoEnvironment, waffoStoreId } from '@/lib/waffo/server';
import { ordersResponse } from '@/lib/orders/response';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return ordersResponse(request, {
    async getUser() {
      const token = requestAccessToken(request);
      const client = await createClient(token);
      const { data: { user }, error } = await client.auth.getUser(token);
      const failure = authenticationFailure(error);
      if (failure?.status === 401) return null;
      if (failure) throw new Error('Authentication service unavailable');
      return user;
    },
    async listPayments(userId, offset, limit) {
      const admin = createAdminClient();
      if (!admin) throw new Error('Database unavailable');
      const { data, error } = await admin.from('waffo_premium_payments')
        .select('payment_id,order_id,product_name,amount,currency,paid_at,mode')
        .eq('user_id', userId).eq('store_id', waffoStoreId()).eq('mode', waffoEnvironment())
        .order('paid_at', { ascending: false }).order('payment_id', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return (data || []).map(row => ({ paymentId: row.payment_id, orderId: row.order_id, productName: row.product_name,
        amount: row.amount, currency: row.currency, paidAt: row.paid_at, mode: row.mode }));
    },
  });
}
