import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('tracking events', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('PUBLIC_COOKIE_CONSENT_VERSION', '1');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  function installDom() {
    const store = new Map<string, string>();
    const fbqCalls: unknown[][] = [];
    const vercelCalls: unknown[][] = [];
    const window = {
      localStorage: {
        getItem: (key: string) => (store.has(key) ? (store.get(key) ?? null) : null),
        setItem: (key: string, value: string) => {
          store.set(key, String(value));
        },
        removeItem: (key: string) => {
          store.delete(key);
        }
      },
      fbq: (...args: unknown[]) => {
        fbqCalls.push(args);
      }
    } as unknown as Window & typeof globalThis;
    vi.stubGlobal('window', window);
    vi.stubGlobal('document', { cookie: '' } as Document);
    vi.doMock('@vercel/analytics', () => ({
      track: (...args: unknown[]) => {
        vercelCalls.push(args);
      }
    }));
    return { store, fbqCalls, vercelCalls, window };
  }

  it('form_submit no emite Meta Lead; contact_form_success sí', async () => {
    const { fbqCalls } = installDom();
    const consent = await import('./consent');
    consent.writeConsent(['necessary', 'marketing', 'analytics']);
    const { track } = await import('./events');

    track('form_submit');
    expect(fbqCalls.some((c) => c[0] === 'track' && c[1] === 'Lead')).toBe(false);
    expect(fbqCalls.some((c) => c[0] === 'trackCustom' && c[1] === 'form_submit')).toBe(true);

    track('contact_form_success');
    expect(fbqCalls.some((c) => c[0] === 'track' && c[1] === 'Lead')).toBe(true);
  });

  it('trackVercel solo con consentimiento de analítica', async () => {
    const { vercelCalls } = installDom();
    const consent = await import('./consent');
    const { track } = await import('./events');

    track('page_view', { path: '/' });
    expect(vercelCalls).toHaveLength(0);

    consent.writeConsent(['necessary', 'analytics']);
    track('page_view', { path: '/' });
    expect(vercelCalls).toHaveLength(1);
    expect(vercelCalls[0]?.[0]).toBe('page_view');
  });
});
