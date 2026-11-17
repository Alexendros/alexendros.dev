import { inject as injectVercelAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { hasConsent, onConsentUpdate } from './consent';

const loaded = new Set<string>();

function once(name: string, action: () => void): void {
  if (loaded.has(name)) return;
  loaded.add(name);
  action();
}

/**
 * Analytics y Speed Insights de Vercel: solo builds con `__IS_VERCEL__` y
 * consentimiento de analítica. No se montan en el HTML inicial.
 */
export function loadVercelPlatform(): void {
  if (typeof window === 'undefined') return;
  if (typeof __IS_VERCEL__ === 'undefined' || !__IS_VERCEL__) return;
  if (!hasConsent('analytics')) return;
  once('vercel-platform', () => {
    injectVercelAnalytics();
    injectSpeedInsights();
  });
}

export function initTracking(): void {
  if (typeof window === 'undefined') return;
  loadVercelPlatform();
  onConsentUpdate(() => loadVercelPlatform());
}
