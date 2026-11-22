'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Check, CheckCircle2, CircleSlash, Crown, Download, Gamepad2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { premiumPlans, type PremiumPlanId } from '@/lib/premium/plans';
import { trackPremium } from '@/lib/premium/analytics';
import { premiumAuthHeaders } from '@/lib/premium/clientAuth';
import PremiumRibbon from './PremiumRibbon';
import AuthModal from '@/components/auth/AuthModal';
import styles from './PremiumExperience.module.css';
import type { Level } from '@/types';
import type { PrintableProduct } from '@/data/printables';

const benefits = [
  { icon: Gamepad2, title: 'All Premium', detail: 'puzzles' },
  { icon: CircleSlash, title: 'Ad-free', detail: 'browsing' },
  { icon: Download, title: '10 printable', detail: 'packs / month' },
  { icon: Sparkles, title: 'New Premium', detail: 'puzzles' },
];
const faqs = [
  ['How does payment work?', 'Sign in, choose a plan, and complete payment securely with Waffo. Membership begins after the payment is verified. Subscriptions renew automatically at the selected interval until canceled.'],
  ['Can I cancel renewal?', 'Yes. Use Cancel renewal in your membership details below. You keep access until the end of your paid period.'],
  ['What counts as one printable pack?', 'One printable product counts as one pack, even if it contains several PDF files. Download any of its files again during the same subscription month without using another credit.'],
  ['When do my 10 credits refresh?', 'On your subscription’s monthly anniversary, including quarterly and annual plans. Unused credits don’t roll over. For a month without your signup date, we use its last day, then return to your original date in later months.'],
  ['Which printables can I choose?', 'Paid products marked Included with Premium. Free packs and packs you can already access through a separate purchase or an existing printable pass don’t use your credits.'],
  ['How is this different from the printable pass?', 'The existing PDF pass is a separate purchase with its own access period. This membership adds Premium online games, site-wide ad-free browsing, and 10 printable packs per month. Your existing purchases keep their original access.'],
  ['Can I keep playing for free?', 'Yes. Existing free puzzles and daily challenges remain free. Premium adds more puzzles and extra benefits. Monthly pack download access requires an active membership and a redemption in the current subscription month.'],
];

export default function PremiumExperience({ source, levelSlug, games, products, testMode }: {
  source: string; levelSlug: string; games: Level[]; products: PrintableProduct[]; testMode: boolean;
}) {
  const { user } = useAuth();
  const { status, loading, error: statusError, refresh } = usePremium();
  const [planId, setPlanId] = useState<PremiumPlanId>('monthly');
  const plan = premiumPlans.find(plan => plan.id === planId)!;
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [errorAction, setErrorAction] = useState<'checkout' | 'cancel'>('checkout');
  const [notice, setNotice] = useState('');
  const checkoutLock = useRef(false);
  const checkoutAlert = useRef<HTMLDivElement>(null);
  const cancellationDialog = useRef<HTMLDialogElement>(null);
  const fields = { source, level_slug: levelSlug, plan: plan.id, price_cents: plan.priceCents };
  useEffect(() => { trackPremium('premium_page_view', { source, level_slug: levelSlug }); }, [source, levelSlug]);
  useEffect(() => { if (error) checkoutAlert.current?.focus(); }, [error]);
  useEffect(() => {
    if (notice && !cancellationDialog.current?.open) cancellationDialog.current?.showModal();
  }, [notice]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('checkout') !== 'returned' || !user || status.active) return;
    // The return URL is only a cue to refresh; it never grants membership.
    let attempts = 0;
    const timer = setInterval(() => { void refresh(); if (++attempts >= 20) clearInterval(timer); }, 3000);
    return () => clearInterval(timer);
  }, [user, status.active, refresh]);
  async function subscribe() {
    if (!user) { setAuthOpen(true); return; }
    if (checkoutLock.current) return;
    checkoutLock.current = true;
    setBusy(true); setError(''); setNotice(''); setNeedsSignIn(false);
    setErrorAction('checkout');
    trackPremium('premium_subscribe_click', fields);
    try {
      const response = await fetch('/api/waffo/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...await premiumAuthHeaders() }, body: JSON.stringify({ plan: plan.id }),
      });
      const body = await response.json();
      if (!response.ok) { setNeedsSignIn(response.status === 401); throw new Error(body.error || 'Unable to start checkout.'); }
      window.location.href = body.checkoutUrl;
    } catch (error) { setError((error as Error).message); }
    finally { checkoutLock.current = false; setBusy(false); }
  }
  async function cancelRenewal() {
    setErrorAction('cancel');
    setBusy(true); setError(''); setNeedsSignIn(false);
    try {
      const response = await fetch('/api/waffo/subscription', { method: 'POST', headers: await premiumAuthHeaders() });
      const body = await response.json();
      if (!response.ok) { setNeedsSignIn(response.status === 401); throw new Error(body.error || 'Unable to cancel renewal.'); }
      setNotice('Renewal canceled. Your membership remains available until the end of your paid period.');
      await refresh();
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  const date = (value: string | null) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.introduction}>
          <span className={styles.eyebrow}><Crown aria-hidden="true" /> SpotDiffs Premium</span>
          <h1 className={styles.headline}>More Puzzles.<br /><span className={styles.headlineLine}>A Deeper <span className={styles.headlineAccent}>Experience.</span></span></h1>
          <p className={styles.description}>Unlock all Premium puzzles, enjoy an ad-free experience, and take the fun offline with 10 printable packs every month.</p>
          <div className={styles.benefits}>
            {benefits.map(({ icon: Icon, title, detail }) => (
              <div key={title} className={styles.benefit}>
                <span className={styles.benefitIcon}><Icon aria-hidden="true" /></span>
                <p>{title}<br />{detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.planCard}>
          <h2 className={styles.cardHeading}>Choose your plan</h2>
          <fieldset disabled={busy || status.active} className={styles.plans}>
            <legend className="sr-only">Choose a subscription plan</legend>
            {premiumPlans.map(option => (
              <label key={option.id} className={`${styles.plan} ${option.id === planId ? styles.selected : ''}`}>
                {option.id === 'annual' && <span className={styles.valueBadge}><Crown aria-hidden="true" /> Best Value</span>}
                <input type="radio" name="premium-plan" value={option.id} checked={option.id === planId}
                  onChange={() => { setPlanId(option.id); trackPremium('premium_plan_select', { source, level_slug: levelSlug, plan: option.id, price_cents: option.priceCents }); }} />
                <span className={styles.planDescription}>
                  <span className={styles.planName}>{option.name}</span>
                  {option.saving && <span className={styles.saving}>{option.saving}</span>}
                  <span className={styles.billing}>${option.priceCents / 100} billed {option.id === 'monthly' ? 'every month' : option.id === 'quarterly' ? 'every 3 months' : 'every year'}</span>
                </span>
                <span className={styles.planPrice}><strong>${(option.priceCents / option.months / 100).toFixed(2)}</strong><span>/ month</span></span>
              </label>
            ))}
          </fieldset>
          <button disabled={busy || loading || status.active} onClick={() => void subscribe()} className={styles.subscribe}>
            {busy ? 'Please wait…' : status.active ? 'Premium is active' : 'Subscribe to Premium'} <ArrowRight aria-hidden="true" />
          </button>
          {(error || statusError) && (
            <div ref={checkoutAlert} role="alert" tabIndex={-1} className={styles.checkoutAlert} aria-labelledby="premium-alert-title">
              <span className={styles.alertIcon}><AlertCircle aria-hidden="true" /></span>
              <div className={styles.alertContent}>
                <h3 id="premium-alert-title">{error ? needsSignIn ? 'Please sign in again' : errorAction === 'checkout' ? 'We couldn’t start checkout' : 'We couldn’t update your subscription' : 'Membership status unavailable'}</h3>
                <p>{error || 'We couldn’t check your Premium membership. Please retry before continuing.'}</p>
                <button disabled={busy || loading} className={styles.alertAction} onClick={() => {
                  if (error && needsSignIn) setAuthOpen(true);
                  else if (error) { void (errorAction === 'checkout' ? subscribe() : cancelRenewal()); }
                  else { void refresh(); }
                }}>{error ? needsSignIn ? 'Sign in again' : 'Try again' : 'Refresh membership'}<ArrowRight aria-hidden="true" /></button>
              </div>
            </div>
          )}
          <div className={styles.selectedBilling} aria-live="polite" aria-atomic="true">
            <p className={styles.billingAmount}>${plan.priceCents / 100} / {plan.period}</p>
            <p className={styles.billingBenefit}>10 printable packs each month</p>
          </div>
          <p className={styles.comingSoon}>{testMode ? 'Test checkout · No real charges' : 'Renews automatically · Cancel renewal anytime'}</p>
          <p className={styles.checkoutTerms}>
            By subscribing, you authorize recurring charges at the selected billing interval until you cancel renewal and agree to our <Link href="/terms">Terms of Service</Link>. Read our <Link href="/terms#refunds">subscription refund policy</Link> and <Link href="/privacy">Privacy Policy</Link> before checkout.
          </p>
          <div className={styles.reassurance}>
            <span><ShieldCheck aria-hidden="true" /> Secure checkout with Waffo</span>
          </div>
        </div>
      </section>
      {notice && <p role="status" className={styles.status}>{notice}</p>}
      <dialog ref={cancellationDialog} className={styles.dialog} aria-labelledby="renewal-canceled-title" aria-describedby="renewal-canceled-description">
        <button type="button" className={styles.close} aria-label="Close notification" onClick={() => cancellationDialog.current?.close()}><X aria-hidden="true" /></button>
        <span className={`${styles.dialogIcon} ${styles.cancellationIcon}`}><CheckCircle2 aria-hidden="true" /></span>
        <h2 id="renewal-canceled-title">Renewal canceled</h2>
        <p id="renewal-canceled-description" className={styles.dialogDescription}>{notice}</p>
        <form method="dialog"><button className={styles.subscribe}>Got it</button></form>
      </dialog>
      {!status.active && user && <PaymentReturnNotice refresh={refresh} />}
      {loading ? <p className={styles.status}>Checking your membership…</p> : status.active && (
        <div className={`${styles.status} ${styles.membership}`}>
          <Crown aria-hidden="true" /><div><p className={styles.planName}>Your {premiumPlans.find(plan => plan.id === status.plan)?.name} membership is active</p>
          <p>Valid through {date(status.expiresAt)} · {status.remaining} of 10 pack credits remaining · {status.resetsAt === status.expiresAt ? 'Access ends' : 'Next refresh'} {date(status.resetsAt)}</p>
          <Link href="/printables" className={styles.textLink}>Choose your printable packs →</Link>
          {status.billingStatus === 'canceling' && <p>Renewal canceled. Access ends {date(status.expiresAt)}.</p>}
          {status.billingStatus === 'past_due' && <p>Renewal payment failed. Update your payment method in Waffo to keep your membership.</p>}
          {status.canCancel && !notice && <p><button disabled={busy} onClick={() => void cancelRenewal()} className={styles.textLink}>Cancel renewal</button></p>}
          </div>
        </div>
      )}
      <section className={styles.comparisonSection}>
        <div className={styles.sectionHeading}><span className={styles.kicker}>A little more to look forward to</span><h2>Keep the free fun. Unlock more.</h2><p>All your favorites, with a few extra reasons to stay curious.</p></div>
        <div className={styles.tableWrapper}><table className={styles.table}>
          <thead><tr><th>What’s included</th><th>Free</th><th><Crown aria-hidden="true" /> Premium</th></tr></thead>
          <tbody>{[['Free puzzles & daily challenges', 'Yes', 'Yes'], ['All Premium online puzzles', '—', 'Yes'], ['Site-wide ad-free browsing', '—', 'Yes'], ['Premium printable pack credits', '—', '10 / month']].map(row => (
            <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={index} scope="row">{cell}</th> : <td key={index}>{cell === 'Yes' ? <span className={styles.included}><Check aria-hidden="true" /><span className="sr-only">Yes</span></span> : cell}</td>)}</tr>
          ))}</tbody>
        </table></div>
      </section>
      {games.length > 0 && (
        <section className={styles.collection}>
          <div className={styles.sectionHeading}><span className={styles.kicker}>Something worth a closer look</span><h2>Your next discoveries</h2><p>A peek at the Premium puzzle collection.</p></div>
          <div className={styles.gameGrid}>{games.map(game => (
            <Link key={game.id} href={`/game/${game.slug}`} className={styles.previewCard}>
              <div className={styles.previewImage}><Image src={game.imageUrl1} alt={game.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /><PremiumRibbon premium /></div>
              <div className={styles.previewCopy}><h3>{game.title}</h3><p>{game.difficulty} · {game.differences.length} differences</p></div>
            </Link>
          ))}</div>
        </section>
      )}
      {products.length > 0 && (
        <section className={styles.collection}>
          <div className={styles.sectionHeading}><span className={styles.kicker}>A little time offline</span><h2>Print. Unplug. Play.</h2><p>Choose 10 eligible packs per month. Every PDF in each pack is included.</p></div>
          <div className={styles.gameGrid}>{products.map(product => (
            <Link key={product.id} href={`/printables/${product.slug}`} className={styles.previewCard}>
              <div className={styles.previewImage}><Image src={product.previewImage} alt={product.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></div>
              <div className={styles.previewCopy}><h3>{product.title}</h3><p>Included with your monthly pack credits</p></div>
            </Link>
          ))}</div>
        </section>
      )}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeading}><span className={styles.kicker}>Before you join</span><h2>A few things to know</h2></div>
        <div className={styles.faqs}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        <p className={styles.pdfPass}>Looking for the PDF-only pass? <Link href="/printables/premium" className={styles.textLink}>Explore printable access</Link></p>
      </section>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); setError(''); setNeedsSignIn(false); void refresh(); }} />
    </div>
  );
}

function PaymentReturnNotice({ refresh }: { refresh: () => Promise<void> }) {
  const [returned, setReturned] = useState(false);
  useEffect(() => { queueMicrotask(() => setReturned(new URLSearchParams(window.location.search).get('checkout') === 'returned')); }, []);
  return returned ? <div role="status" className={styles.status}>Waiting for payment confirmation. Your membership will appear here once verified. If this takes longer than a minute, contact support before paying again. <button onClick={() => void refresh()} className={styles.textLink}>Refresh membership</button></div> : null;
}
