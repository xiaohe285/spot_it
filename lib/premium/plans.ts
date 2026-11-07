export const premiumPlans = [
  { id: 'monthly', name: 'Monthly', priceCents: 900, months: 1, period: 'month', monthlyPrice: '$9', saving: '' },
  { id: 'quarterly', name: 'Quarterly', priceCents: 2400, months: 3, period: 'quarter', monthlyPrice: '$8', saving: 'Save 11% · Lowest monthly price' },
  { id: 'annual', name: 'Annual', priceCents: 10000, months: 12, period: 'year', monthlyPrice: '$8.33', saving: 'Save 7%' },
] as const;
export type PremiumPlanId = typeof premiumPlans[number]['id'];
export interface PremiumStatus {
  active: boolean;
  plan: PremiumPlanId | null;
  expiresAt: string | null;
  periodStart: string | null;
  resetsAt: string | null;
  remaining: number;
  redeemedProductIds: string[];
}
export const freePremiumStatus: PremiumStatus = {
  active: false, plan: null, expiresAt: null, periodStart: null,
  resetsAt: null, remaining: 0, redeemedProductIds: [],
};
