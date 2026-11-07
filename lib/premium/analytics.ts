type Event = 'premium_page_view' | 'premium_plan_select' | 'premium_subscribe_click' | 'premium_notify_submit' | 'premium_locked_view';
export function trackPremium(event: Event, fields: Record<string, string | number> = {}) {
  const analytics = window as typeof window & { gtag?: (command: string, event: string, fields: Record<string, string | number>) => void };
  analytics.gtag?.('event', event, fields);
}
export function visitorId() {
  const key = 'spotdiffs:premium-visitor';
  try {
    const saved = localStorage.getItem(key);
    if (saved) return saved;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch { return crypto.randomUUID(); }
}
