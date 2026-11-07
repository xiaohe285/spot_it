'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePremium } from '@/contexts/PremiumContext';
import PrintableFileLinks from '@/components/printables/PrintableFileLinks';
import type { PrintableProductFile } from '@/data/printables';

export default function PremiumPackDownload({ productId, productSlug, files, hasExistingAccess }: {
  productId: string; productSlug: string; files: PrintableProductFile[]; hasExistingAccess: boolean;
}) {
  const { status, loading, error: statusError, refresh } = usePremium();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [existingAccess, setExistingAccess] = useState(hasExistingAccess);
  const redeemed = status.active && status.redeemedProductIds.includes(productId);
  async function redeem() {
    setBusy(true); setError('');
    try {
      // Browser receipts are checked server-side before consuming a credit.
      let token: string | undefined;
      for (const key of ['spotdiffs:premium-access', `spotdiffs:printable-access:${productSlug}`]) {
        try { const receipt = JSON.parse(localStorage.getItem(key) || 'null'); if (receipt?.downloadToken && +new Date(receipt.expiresAt) > Date.now()) token = receipt.downloadToken; } catch { /* invalid saved receipt */ }
      }
      const response = await fetch(`/api/premium/printables/${encodeURIComponent(productSlug)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to redeem this pack.');
      if (body.existingAccess) setExistingAccess(true);
      await refresh();
    } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  if (existingAccess) return null; // Existing purchase UI supplies the download links.
  return <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
    <p className="text-sm font-extrabold text-amber-950 dark:text-amber-100">Included in Premium’s 10 monthly printable packs</p>
    {loading ? <p className="mt-3 text-sm">Checking membership…</p> : statusError ? <button onClick={() => void refresh()} className="mt-3 text-sm underline">Unable to check membership. Retry</button> : !status.active ? <Link href="/premium?source=printable" className="mt-3 inline-block text-sm font-bold text-orange-700 underline dark:text-orange-300">Explore Premium →</Link> : redeemed ? <div className="mt-3"><p className="mb-3 text-sm">Unlocked for this subscription month. Repeat downloads use no extra credits.</p><PrintableFileLinks productSlug={productSlug} files={files} tone="emerald" /></div> : <>
      <p className="mt-2 text-sm">{status.remaining} of 10 credits remaining. {status.resetsAt === status.expiresAt ? 'Access ends' : 'Refreshes'} {new Date(status.resetsAt!).toLocaleDateString('en-US')}.</p>
      <button disabled={busy || status.remaining === 0} onClick={() => void redeem()} className="mt-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-amber-200 dark:text-amber-950">{busy ? 'Unlocking…' : status.remaining === 0 ? 'Monthly credits used' : 'Use 1 pack credit'}</button>
    </>}
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
  </div>;
}
