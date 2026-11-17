import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contactChannelFromHref } from './events';

describe('contactChannelFromHref', () => {
  it('clasifica tel y whatsapp', () => {
    expect(contactChannelFromHref('tel:+34600000000')).toBe('phone');
    expect(contactChannelFromHref('https://wa.me/34600000000')).toBe('whatsapp');
    expect(contactChannelFromHref('/contacto/')).toBeNull();
  });
});

describe('track', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PUBLIC_COOKIE_CONSENT_VERSION', '3');
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      removeItem(key: string) {
        delete store[key];
      }
    });
    vi.stubGlobal('window', { localStorage: globalThis.localStorage });
    vi.stubGlobal('document', { cookie: '' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sin consentimiento no llama a Vercel Analytics', async () => {
    const trackVercel = vi.fn();
    vi.doMock('@vercel/analytics', () => ({ track: trackVercel }));
    const consent = await import('./consent');
    consent.clearConsent();
    const { track } = await import('./events');
    track('page_view', { path: '/' });
    expect(trackVercel).not.toHaveBeenCalled();
  });

  it('con analytics llama a Vercel Analytics', async () => {
    const trackVercel = vi.fn();
    vi.doMock('@vercel/analytics', () => ({ track: trackVercel }));
    const consent = await import('./consent');
    consent.clearConsent();
    consent.writeConsent(['necessary', 'analytics']);
    const { track } = await import('./events');
    track('form_submit', { path: '/contacto/' });
    expect(trackVercel).toHaveBeenCalledWith('form_submit', { path: '/contacto/' });
  });
});
