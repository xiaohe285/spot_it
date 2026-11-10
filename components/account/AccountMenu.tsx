'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Crown, Flame, LogOut, ReceiptText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import styles from './AccountMenu.module.css';

export default function AccountMenu() {
  const { user, signOut } = useAuth();
  const { status, loading, error } = usePremium();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  if (!user) return null;
  const name = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player';
  const premium = !loading && !error && status.active;
  return <div ref={root} className={styles.root}
    onMouseEnter={() => setOpen(true)} onMouseLeave={() => { if (!root.current?.contains(document.activeElement)) setOpen(false); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} type="button" className={styles.trigger} aria-expanded={open} aria-controls="account-navigation" aria-label={`Account for ${name}${premium ? ', Premium member' : ''}`}
      onClick={() => setOpen(value => !value)} onKeyDown={event => {
        if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); queueMicrotask(() => firstLink.current?.focus()); }
      }}>
      <span className={styles.avatar} aria-hidden="true">{premium && <Crown className={styles.crown} />}<span>{name[0]?.toUpperCase()}</span></span>
      <span className={styles.identity}><span className={styles.name}>{name}</span>{premium && <span className={styles.badge}><Crown aria-hidden="true" /> Premium</span>}</span>
      <ChevronDown aria-hidden="true" className={`${styles.chevron} ${open ? styles.expanded : ''}`} />
    </button>
    <div className={styles.dropdownBridge} hidden={!open}>
      <nav id="account-navigation" aria-label="Account" className={styles.dropdown}>
        <div className={styles.details}><strong>{name}</strong><span>{user.email}</span>{premium && <span className={styles.memberNote}>Premium member</span>}</div>
        <Link ref={firstLink} href="/my-orders" onClick={() => setOpen(false)}><ReceiptText aria-hidden="true" />My Orders</Link>
        <Link href="/streak" onClick={() => setOpen(false)}><Flame aria-hidden="true" />Streak</Link>
        <button type="button" onClick={() => { setOpen(false); void signOut(); }}><LogOut aria-hidden="true" />Logout</button>
      </nav>
    </div>
  </div>;
}
