'use client';
import { createContext, useContext, useEffect, useCallback, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { freePremiumStatus, type PremiumStatus } from '@/lib/premium/plans';

type Value = { status: PremiumStatus; loading: boolean; error: string | null; refresh: () => Promise<void>; adsAllowed: boolean };
const Context = createContext<Value | null>(null);
export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const identity = user?.id ?? 'anonymous';
  const version = useRef(0);
  const [state, setState] = useState<{ identity: string; status: PremiumStatus; loading: boolean; error: string | null }>({ identity: '', status: freePremiumStatus, loading: true, error: null });
  const refresh = useCallback(async () => {
    if (authLoading) return;
    const requestVersion = ++version.current;
    setState(previous => ({ ...previous, identity, loading: previous.identity !== identity || previous.loading || Boolean(previous.error) || (previous.status.active && +new Date(previous.status.expiresAt!) <= Date.now()), error: null }));
    try {
      const response = await fetch('/api/premium/status', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to check Premium access.');
      const status: PremiumStatus = await response.json();
      if (version.current !== requestVersion) return;
      setState({ identity, status, loading: false, error: null });
    } catch {
      if (version.current !== requestVersion) return;
      setState({ identity, status: freePremiumStatus, loading: false, error: 'Unable to check Premium access.' });
    }
  }, [authLoading, identity]);
  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
  }, [refresh]);
  useEffect(() => {
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);
  useEffect(() => {
    if (!state.status.active) return;
    const deadlines = [state.status.expiresAt, state.status.resetsAt].filter(Boolean).map(value => +new Date(value!));
    const delay = Math.max(1, Math.min(...deadlines) - Date.now());
    const timer = setTimeout(() => { void refresh(); }, Math.min(delay, 2147483647));
    return () => clearTimeout(timer);
  }, [state.status, refresh]);
  const loading = authLoading || state.identity !== identity || state.loading;
  const status = loading ? freePremiumStatus : state.status;
  return <Context.Provider value={{ status, loading, error: state.error, refresh, adsAllowed: !loading && !state.error && !status.active }}>{children}</Context.Provider>;
}
export function usePremium() {
  const value = useContext(Context);
  if (!value) throw new Error('usePremium requires PremiumProvider');
  return value;
}
