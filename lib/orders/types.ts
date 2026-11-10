export interface PremiumPayment {
  paymentId: string;
  orderId: string;
  productName: string;
  amount: string | null;
  currency: string;
  paidAt: string;
  mode: 'test' | 'prod';
}
export interface OrdersPage { payments: PremiumPayment[]; page: number; hasMore: boolean }
