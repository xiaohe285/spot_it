'use client';
import { useEffect } from 'react';
import { usePremium } from '@/contexts/PremiumContext';

export default function PremiumAwareAds() {
  const { adsAllowed, status } = usePremium();
  useEffect(() => {
    // AdSense auto ads cannot be reliably torn down after loading. A full document
    // refresh when becoming a member removes its script and injected frames.
    if (status.active && document.querySelector('script[data-spotdiffs-ads]')) {
      window.location.reload();
      return;
    }
    if (!adsAllowed || document.querySelector('script[data-spotdiffs-ads]')) return;
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3161682431818340';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.spotdiffsAds = 'true';
    document.head.appendChild(script);
  }, [adsAllowed, status.active]);
  return null;
}
