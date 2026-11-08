// Always calculate from the original UTC anchor so Jan 31 -> Feb 28 -> Mar 31.
export function addAnchoredMonths(anchor: Date, months: number): Date {
  const result = new Date(anchor);
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const last = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(anchor.getUTCDate(), last));
  return result;
}
export function subscriptionPeriod(start: string, end: string, now = new Date()) {
  const anchor = new Date(start);
  const expires = new Date(end);
  if (!Number.isFinite(+anchor) || !Number.isFinite(+expires) || now < anchor || now >= expires) return null;
  let months = (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + now.getUTCMonth() - anchor.getUTCMonth();
  if (addAnchoredMonths(anchor, months) > now) months--;
  return {
    start: addAnchoredMonths(anchor, months).toISOString(),
    end: new Date(Math.min(+addAnchoredMonths(anchor, months + 1), +expires)).toISOString(),
  };
}
