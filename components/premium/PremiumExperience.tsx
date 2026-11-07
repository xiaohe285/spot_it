'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bell, Check, CircleSlash, Crown, Download, Gamepad2, Mail, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { premiumPlans, type PremiumPlanId } from '@/lib/premium/plans';
import { trackPremium, visitorId } from '@/lib/premium/analytics';
import PremiumRibbon from './PremiumRibbon';
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
  ['Can I subscribe today?', 'Not yet. We’re checking interest before opening subscriptions. Clicking Subscribe records your interest; it won’t charge you or activate a membership. Leaving an email is optional.'],
  ['What counts as one printable pack?', 'One printable product counts as one pack, even if it contains several PDF files. Download any of its files again during the same subscription month without using another credit.'],
  ['When do my 10 credits refresh?', 'On your subscription’s monthly anniversary, including quarterly and annual plans. Unused credits don’t roll over. For a month without your signup date, we use its last day, then return to your original date in later months.'],
  ['Which printables can I choose?', 'Paid products marked Included with Premium. Free packs and packs you can already access through a separate purchase or an existing printable pass don’t use your credits.'],
  ['How is this different from the printable pass?', 'The existing PDF pass is a separate purchase with its own access period. This membership adds Premium online games, site-wide ad-free browsing, and 10 printable packs per month. Your existing purchases keep their original access.'],
  ['Can I keep playing for free?', 'Yes. Existing free puzzles and daily challenges remain free. Premium adds more puzzles and extra benefits. Monthly pack download access requires an active membership and a redemption in the current subscription month.'],
];

export default function PremiumExperience({ source, levelSlug, games, products }: {
  source: string; levelSlug: string; games: Level[]; products: PrintableProduct[];
}) {
  const { user } = useAuth();
  const { status, loading, error: statusError, refresh } = usePremium();
  const [planId, setPlanId] = useState<PremiumPlanId>('monthly');
  const plan = premiumPlans.find(plan => plan.id === planId)!;
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [intentSaved, setIntentSaved] = useState(false);
  const requestId = useRef('');
  const visitor = useRef('');
  const dialog = useRef<HTMLDialogElement>(null);
  const fields = { source, level_slug: levelSlug, plan: plan.id, price_cents: plan.priceCents };
  useEffect(() => { trackPremium('premium_page_view', { source, level_slug: levelSlug }); }, [source, levelSlug]);
  useEffect(() => {
    if (open) dialog.current?.showModal(); else dialog.current?.close();
  }, [open]);
  async function record(email?: string) {
    const response = await fetch('/api/premium/interest', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitor.current, requestId: requestId.current, plan: plan.id, source, levelSlug, ...(email ? { email } : {}) }),
    });
    if (!response.ok) { const body = await response.json(); throw new Error(body.error || 'Unable to save your interest. Please retry.'); }
  }
  async function subscribe() {
    requestId.current = crypto.randomUUID(); visitor.current = visitorId();
    setEmail(user?.email || ''); setSaved(false); setError(''); setIntentSaved(false); setOpen(true); setBusy(true);
    trackPremium('premium_subscribe_click', fields);
    try { await record(); setIntentSaved(true); } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
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
          <fieldset className={styles.plans}>
            <legend className="sr-only">Choose a subscription plan</legend>
            {premiumPlans.map(option => (
              <label key={option.id} className={`${styles.plan} ${option.id === planId ? styles.selected : ''}`}>
                {option.id === 'quarterly' && <span className={styles.valueBadge}><Crown aria-hidden="true" /> Best Value</span>}
                <input type="radio" name="premium-plan" value={option.id} checked={option.id === planId}
                  onChange={() => { setPlanId(option.id); trackPremium('premium_plan_select', { source, level_slug: levelSlug, plan: option.id, price_cents: option.priceCents }); }} />
                <span className={styles.planDescription}>
                  <span className={styles.planName}>{option.name}</span>
                  {option.saving && <span className={styles.saving}>{option.id === 'quarterly' ? 'Save 11%' : 'Save 7%'}</span>}
                  <span className={styles.billing}>${option.priceCents / 100} billed {option.id === 'monthly' ? 'every month' : option.id === 'quarterly' ? 'every 3 months' : 'every year'}</span>
                </span>
                <span className={styles.planPrice}><strong>{option.id === 'monthly' ? '$9.00' : option.id === 'quarterly' ? '$8.00' : '$8.33'}</strong><span>/ month{option.id === 'annual' ? ' approx.' : ''}</span></span>
              </label>
            ))}
          </fieldset>
          <button disabled={busy} onClick={() => void subscribe()} className={styles.subscribe}>
            Subscribe to Premium <ArrowRight aria-hidden="true" />
          </button>
          <div className={styles.selectedBilling} aria-live="polite" aria-atomic="true">
            <p className={styles.billingAmount}>${plan.priceCents / 100} / {plan.period}</p>
            <p className={styles.billingBenefit}>10 printable packs each month</p>
          </div>
          <p className={styles.comingSoon}>Coming soon · No payment collected today</p>
          <div className={styles.reassurance}>
            <span><ShieldCheck aria-hidden="true" /> No charge today</span>
            <span><Mail aria-hidden="true" /> Optional email</span>
            <span><Bell aria-hidden="true" /> Launch updates</span>
          </div>
        </div>
      </section>
      {loading ? <p className={styles.status}>Checking your membership…</p> : statusError ? (
        <div className={styles.status}>{statusError} <button onClick={() => void refresh()} className={styles.textLink}>Retry</button></div>
      ) : status.active && (
        <div className={`${styles.status} ${styles.membership}`}>
          <Crown aria-hidden="true" /><div><p className={styles.planName}>Your {premiumPlans.find(plan => plan.id === status.plan)?.name} membership is active</p>
          <p>Valid through {date(status.expiresAt)} · {status.remaining} of 10 pack credits remaining · {status.resetsAt === status.expiresAt ? 'Access ends' : 'Next refresh'} {date(status.resetsAt)}</p>
          <Link href="/printables" className={styles.textLink}>Choose your printable packs →</Link></div>
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
      <dialog ref={dialog} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} aria-labelledby="premium-dialog-title" className={styles.dialog}>
        <button onClick={() => setOpen(false)} aria-label="Close" className={styles.close}><X aria-hidden="true" /></button>
        <span className={styles.dialogIcon}><Crown aria-hidden="true" /></span><h2 id="premium-dialog-title">Premium is coming soon</h2>
        <p className={styles.dialogDescription}>You won’t be charged today, and a membership won’t be activated. Your interest helps us decide what to build next.</p>
        <p className={styles.dialogPlan}>{plan.name} · ${plan.priceCents / 100}/{plan.period}</p>
        {saved ? <p role="status" className={styles.success}>You’re on the list. We’ll notify you when Premium launches.</p> : (
          <form className={styles.form} onSubmit={async event => {
            event.preventDefault(); setBusy(true); setError('');
            try { await record(email); setIntentSaved(true); setSaved(true); trackPremium('premium_notify_submit', fields); } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
          }}>
            <label htmlFor="premium-email">Email for launch updates (optional)</label>
            <input id="premium-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
            <p>Only used to notify you about the Premium launch. <Link href="/privacy" className={styles.textLink}>Privacy policy</Link></p>
            <button disabled={busy || !email.trim()} className={styles.subscribe}>{busy ? 'Saving…' : 'Notify me at launch'}</button>
          </form>
        )}
        {error && <div role="alert" className={styles.error}>{error}{!intentSaved && !email && <button disabled={busy} onClick={async () => { setBusy(true); try { await record(); setIntentSaved(true); setError(''); } catch (error) { setError((error as Error).message); } finally { setBusy(false); } }} className={styles.textLink}>Retry</button>}</div>}
        <button onClick={() => setOpen(false)} className={styles.continue}>Continue browsing</button>
        {levelSlug && <Link href={`/game/${encodeURIComponent(levelSlug)}`} className={`${styles.textLink} ${styles.backLink}`}>Back to your puzzle</Link>}
      </dialog>
    </div>
  );
}
