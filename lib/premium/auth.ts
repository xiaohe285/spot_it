// A browser session token is optional; existing cookie-based requests still work.
// Tokens are always verified with Supabase getUser(), never decoded as proof.
export function requestAccessToken(request?: Request) {
  const authorization = request?.headers.get('authorization');
  return authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
}

export function authenticationFailure(error: { name?: string; status?: number; code?: string } | null) {
  if (!error) return null;
  if (error.name === 'AuthSessionMissingError' || error.status === 401 || error.status === 403
    || ['bad_jwt', 'session_not_found', 'session_expired', 'refresh_token_not_found', 'refresh_token_already_used'].includes(error.code || '')) {
    return { status: 401, code: 'SESSION_EXPIRED', error: 'Your session has expired. Please sign in again to continue.' };
  }
  return { status: 503, code: 'AUTH_UNAVAILABLE', error: 'We couldn’t verify your session right now. Please try again in a moment.' };
}
