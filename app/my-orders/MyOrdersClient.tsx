'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Crown, LockKeyhole, ReceiptText, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { premiumPlans } from '@/lib/premium/plans';
import { premiumAuthHeaders } from '@/lib/premium/clientAuth';
import type { OrdersPage, PremiumPayment } from '@/lib/orders/types';
import AuthModal from '@/components/auth/AuthModal';
import styles from './MyOrders.module.css';

function date(value: string | null) {
  return value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value)) : '—';
}
function amount(payment: PremiumPayment) {
  if (payment.amount === null) return 'Awaiting confirmation';
  // Keep the exact stored decimal; currency formatting uses no inferred price.
  return `${payment.currency} ${payment.amount}`;
}
interface State { identity: string; page: number; loading: boolean; data: OrdersPage | null; error: string; requiresLogin: boolean }
export default function MyOrdersClient() {
  const { user, session, loading: authLoading } = useAuth();
  const { status, loading: premiumLoading, error: premiumError, refresh } = usePremium();
  const identity = user?.id || '';
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const sequence = useRef(0);
  const [state, setState] = useState<State>({ identity: '', page: 1, loading: true, data: null, error: '', requiresLogin: false });
  useEffect(() => {
    const version = ++sequence.current;
    if (authLoading || !identity) return;
    const controller = new AbortController();
    const load = async () => {
      setState({ identity, page, loading: true, data: null, error: '', requiresLogin: false });
      try {
        const response = await fetch(`/api/orders?page=${page}`, { cache: 'no-store', signal: controller.signal, headers: await premiumAuthHeaders() });
        const data = await response.json();
        if (controller.signal.aborted || sequence.current !== version) return;
        if (!response.ok) {
          setState({ identity, page, loading: false, data: null, error: data.error || 'We couldn’t load your orders.', requiresLogin: response.status === 401 });
          return;
        }
        setState({ identity, page, loading: false, data, error: '', requiresLogin: false });
      } catch {
        if (controller.signal.aborted || sequence.current !== version) return;
        setState({ identity, page, loading: false, data: null, error: 'We couldn’t load your orders. Please try again.', requiresLogin: false });
      }
    };
    void load();
    return () => controller.abort();
  }, [authLoading, identity, session?.access_token, page, retry]);
  // Reset pagination on account change; mismatched identity never displays data.
  const previousIdentity = useRef(identity);
  useEffect(() => {
    if (previousIdentity.current !== identity) { previousIdentity.current = identity; queueMicrotask(() => setPage(1)); }
  }, [identity]);
  const tryAgain = useCallback(() => setRetry(value => value + 1), []);
  const current = state.identity === identity && state.page === page;
  const data = current ? state.data : null;
  const error = current ? state.error : '';
  const loading = authLoading || (Boolean(user) && (!current || state.loading));
  const plan = premiumPlans.find(plan => plan.id === status.plan);
  return <main className={styles.page}>
    <div className={styles.content}>
      <Link href="/games" className={styles.back}><ArrowLeft aria-hidden="true" /> Back to puzzles</Link>
      <header className={styles.heading}><span className={styles.eyebrow}><ReceiptText aria-hidden="true" /> YOUR ACCOUNT</span><h1>My Orders</h1><p>Your Premium membership and payment history, all in one place.</p></header>
      {authLoading ? <div role="status" className={styles.panel}>Loading your account…</div> : !user ? (
        <section className={styles.empty}><LockKeyhole aria-hidden="true" /><h2>Your orders are personal</h2><p>Sign in to view your Premium membership and payment history.</p><button className={styles.primary} onClick={() => setAuthOpen(true)}>Sign in to continue <ArrowRight aria-hidden="true" /></button></section>
      ) : <>
        <section className={styles.membership} aria-label="Your membership">
          <div className={styles.memberTitle}><span className={styles.crown}><Crown aria-hidden="true" /></span><div><span className={styles.eyebrow}>YOUR MEMBERSHIP</span><h2>{premiumLoading ? 'Checking membership…' : premiumError ? 'Membership status unavailable' : status.active ? `Premium ${plan?.name || ''}` : 'No active membership'}</h2></div>{status.waffoMode === 'test' && <span className={styles.test}>Test</span>}</div>
          {premiumError ? <div className={styles.memberError}><p>We couldn’t check your membership. Your payment history is still available below.</p><button onClick={() => void refresh()} className={styles.textButton}>Retry membership check</button></div> : !premiumLoading && (status.active ? <>
            <dl className={styles.stats}>
              <div><dt>Valid through</dt><dd>{date(status.expiresAt)}</dd></div>
              <div><dt>Renewal</dt><dd>{status.billingStatus === 'canceling' ? 'Canceled · access retained' : status.billingStatus === 'past_due' ? 'Payment needs attention' : status.billingStatus === 'active' ? 'Automatic renewal' : 'See membership details'}</dd></div>
              <div><dt>Printable packs</dt><dd>{status.remaining}<span> / 10 remaining</span></dd></div>
              <div><dt>Credits refresh</dt><dd>{status.resetsAt === status.expiresAt ? 'Ends with membership' : date(status.resetsAt)}</dd></div>
            </dl><Link className={styles.manage} href="/premium">Manage membership <ArrowRight aria-hidden="true" /></Link>
          </> : <div className={styles.inactive}><p>Explore Premium puzzles, ad-free play, and 10 printable packs each month. Previous payments remain in your history.</p><Link className={styles.manage} href="/premium">Explore Premium <ArrowRight aria-hidden="true" /></Link></div>)}
        </section>
        <section className={styles.history} aria-label="Payment history" aria-busy={loading}>
          <div className={styles.historyHeading}><div><h2>Payment history</h2><p>Successful Premium payments, including renewals.</p></div><button className={styles.refresh} onClick={tryAgain} disabled={loading}><RefreshCw aria-hidden="true" />Refresh</button></div>
          {loading ? <div role="status" className={styles.panel}>Loading your payments…</div> : error ? <div role="alert" className={styles.error}><h3>We couldn’t load your orders</h3><p>{error}</p><button onClick={() => state.requiresLogin ? setAuthOpen(true) : tryAgain()} className={styles.textButton}>{state.requiresLogin ? 'Sign in again' : 'Try again'} <ArrowRight aria-hidden="true" /></button></div> : data?.payments.length ? <>
            <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Payment</th><th>Date (UTC)</th><th>Amount paid</th><th>Reference</th></tr></thead><tbody>{data.payments.map(payment => <tr key={`${payment.mode}-${payment.paymentId}`}>
              <td data-label="Payment"><div className={styles.product}><span className={styles.paid}><Check aria-hidden="true" /></span><div><strong>{payment.productName}</strong><span>Payment received {payment.mode === 'test' && <span className={styles.test}>Test</span>}</span></div></div></td>
              <td data-label="Date (UTC)"><time dateTime={payment.paidAt}>{date(payment.paidAt)}</time></td>
              <td data-label="Amount paid" className={styles.amount}>{amount(payment)}</td>
              <td data-label="Reference"><dl className={styles.references}><div><dt>Order</dt><dd>{payment.orderId}</dd></div><div><dt>Transaction</dt><dd>{payment.paymentId}</dd></div></dl></td>
            </tr>)}</tbody></table></div>
          </> : <div className={styles.empty}><ReceiptText aria-hidden="true" /><h3>{page > 1 ? 'No more payments' : 'Your story starts here'}</h3><p>{page > 1 ? 'Return to the previous page to see your payments.' : 'Your first Premium payment and future renewals will appear here once confirmed.'}</p>{page === 1 && <Link className={styles.textButton} href="/premium">Explore Premium <ArrowRight aria-hidden="true" /></Link>}</div>}
          {!loading && !error && (page > 1 || data?.hasMore) && <nav aria-label="Payment history pages" className={styles.pagination}><button disabled={page === 1} onClick={() => setPage(value => value - 1)}><ArrowLeft aria-hidden="true" />Previous</button><span aria-live="polite">Page {page}</span><button disabled={!data?.hasMore} onClick={() => setPage(value => value + 1)}>Next<ArrowRight aria-hidden="true" /></button></nav>}
        </section>
        <p className={styles.help}>Only Premium subscription payments are shown here. Need help? <Link href="/contact">Contact us</Link>.</p>
      </>}
    </div>
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); tryAgain(); void refresh(); }} />
  </main>;
}
