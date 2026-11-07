// Next.js can normalize request.url to an internal hostname. Compare against the
// original Host header, with the protocol supplied by the deployment proxy.
export function isSameOrigin(request: Request): boolean {
  try {
    const origin = request.headers.get('origin');
    if (!origin) return false;
    const url = new URL(request.url);
    const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || url.protocol.replace(':', '');
    if (protocol !== 'http' && protocol !== 'https') return false;
    const host = request.headers.get('host') || url.host;
    return origin === new URL(`${protocol}://${host}`).origin;
  } catch { return false; }
}
