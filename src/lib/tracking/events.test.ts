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

  it('contact_form_success → generate_lead en GA4 solo con consentimiento', async () => {
    const { window } = installDom();
    const gtagCalls: unknown[][] = [];
    (window as unknown as { gtag: unknown }).gtag = (...a: unknown[]) => gtagCalls.push(a);
    const consent = await import('./consent');
    const { track } = await import('./events');

    track('contact_form_success');
    expect(gtagCalls).toHaveLength(0);

    consent.writeConsent(['necessary', 'analytics']);
    track('contact_form_success');
    expect(gtagCalls.some((c) => c[0] === 'event' && c[1] === 'generate_lead')).toBe(true);
    track('form_submit');
    expect(gtagCalls.filter((c) => c[1] === 'generate_lead')).toHaveLength(1);
  });

  it('contactChannelFromHref clasifica tel y WhatsApp', async () => {
    const { contactChannelFromHref } = await import('./events');
    expect(contactChannelFromHref('tel:+34600000000')).toBe('phone');
    expect(contactChannelFromHref('https://wa.me/34600000000?text=hola')).toBe('whatsapp');
    expect(contactChannelFromHref('https://api.whatsapp.com/send?phone=34600000000')).toBe(
      'whatsapp'
    );
    expect(contactChannelFromHref('https://evil.example/wa.me')).toBeNull();
    expect(contactChannelFromHref('/contacto')).toBeNull();
    expect(contactChannelFromHref('mailto:a@b.c')).toBeNull();
  });

  it('listener delegado mide clics en tel/WhatsApp sin el número y respeta consentimiento', async () => {
    const { window, vercelCalls } = installDom();
    const handlers: Record<string, (e: unknown) => void> = {};
    vi.stubGlobal('document', {
      cookie: '',
      addEventListener: (type: string, fn: (e: unknown) => void) => {
        handlers[type] = fn;
      }
    } as unknown as Document);
    (window as unknown as { location: unknown }).location = { pathname: '/servicios/' };
    const consent = await import('./consent');
    const { setupFunnelTracking } = await import('./events');
    setupFunnelTracking();

    const anchor = (href: string) => ({
      closest: () => ({ getAttribute: () => href, textContent: 'x' })
    });

    handlers.click?.({ target: anchor('tel:+34600000000') });
    expect(vercelCalls.filter((c) => c[0] === 'contact_click')).toHaveLength(0);

    consent.writeConsent(['necessary', 'analytics']);
    handlers.click?.({ target: anchor('tel:+34600000000') });
    handlers.click?.({ target: anchor('https://wa.me/34600000000') });
    const clicks = vercelCalls.filter((c) => c[0] === 'contact_click');
    expect(clicks.map((c) => (c[1] as { channel: string }).channel)).toEqual(['phone', 'whatsapp']);
    expect(JSON.stringify(clicks)).not.toContain('600000000');
  });
});
