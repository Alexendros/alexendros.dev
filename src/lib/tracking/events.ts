import { track as trackVercel } from '@vercel/analytics';
import { hasConsent } from './consent';

export type FunnelEvent =
  | 'page_view'
  | 'view_servicios'
  | 'cta_click'
  | 'form_start'
  | 'form_step'
  | 'form_submit'
  | 'contact_form_success'
  | 'form_abandon_step'
  | 'contact_click';

type Props = Record<string, string | number | boolean | null | undefined>;

/**
 * Emite un evento del embudo a Vercel Analytics cuando hay consentimiento
 * de analítica. form_submit = intento; contact_form_success = aceptación.
 */
export function track(event: FunnelEvent, props: Props = {}): void {
  if (!hasConsent('analytics')) return;
  trackVercel(event, props);
}

export type ContactChannel = 'phone' | 'whatsapp';

/** Clasifica un href de contacto directo (tel:, wa.me, api.whatsapp.com). */
export function contactChannelFromHref(href: string): ContactChannel | null {
  const value = href.trim().toLowerCase();
  if (value.startsWith('tel:')) return 'phone';
  if (value.startsWith('whatsapp:')) return 'whatsapp';
  try {
    const host = new URL(value).hostname;
    if (host === 'wa.me' || host === 'api.whatsapp.com') return 'whatsapp';
  } catch {
    return null;
  }
  return null;
}

/**
 * Instala la captura base del embudo: page_view, view_servicios y clicks de CTA.
 * Idempotente.
 */
export function setupFunnelTracking(): void {
  if (typeof window === 'undefined') return;
  const target = window as Window & { __funnelReady?: boolean };
  if (target.__funnelReady) return;
  target.__funnelReady = true;

  const emitPage = () => {
    const path = window.location.pathname;
    track('page_view', { path });
    if (path.startsWith('/servicios')) track('view_servicios', { path });
  };

  emitPage();
  document.addEventListener('astro:page-load', emitPage);
  document.addEventListener('click', (event) => {
    const element = event.target as Element | null;
    const anchor = element?.closest?.('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href') ?? '';
    const channel = contactChannelFromHref(href);
    if (channel) {
      track('contact_click', { channel, path: window.location.pathname });
      return;
    }
    if (href.startsWith('/contacto')) {
      track('cta_click', { href, label: anchor.textContent?.trim().slice(0, 80) ?? '' });
    }
  });
}
