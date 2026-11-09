import { isAllowedReferralCode } from '../content/referralCodes';

export const REFERRAL_COOKIE = 'alexendros_ref';
export const REFERRAL_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
export const REFERRAL_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,31}$/;

export function normalizeReferralCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  if (!REFERRAL_PATTERN.test(code)) return null;
  return code;
}

/** Cookie solo desde el servidor: HttpOnly + Secure + SameSite=Lax. */
export function referralCookieHeader(code: string): string {
  return `${REFERRAL_COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${REFERRAL_MAX_AGE_SECONDS}; SameSite=Lax; HttpOnly; Secure`;
}

/**
 * Si la URL trae `?ref=`, limpia el parámetro del historial.
 * Ya no escribe la cookie en el cliente (solo `/r/[code]` en el servidor).
 */
export function captureReferralFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('ref');
    if (!raw) return null;
    const code = normalizeReferralCode(raw);
    params.delete('ref');
    const query = params.toString();
    const url = window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
    window.history.replaceState(null, '', url);
    return code && isAllowedReferralCode(code) ? code : null;
  } catch {
    return null;
  }
}
