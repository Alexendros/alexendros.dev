import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function stubBrowser() {
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
  vi.stubGlobal('document', {
    cookie: '',
    head: { appendChild: vi.fn() },
    querySelector: vi.fn(() => null),
    documentElement: { dataset: {} as Record<string, string> }
  });
}

describe('loadVercelPlatform', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PUBLIC_COOKIE_CONSENT_VERSION', '3');
    vi.stubGlobal('__IS_VERCEL__', true);
    stubBrowser();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sin consentimiento de analítica no inyecta Vercel', async () => {
    const inject = vi.fn();
    const injectSpeed = vi.fn();
    vi.doMock('@vercel/analytics', () => ({ inject }));
    vi.doMock('@vercel/speed-insights', () => ({ injectSpeedInsights: injectSpeed }));
    const consent = await import('./consent');
    consent.clearConsent();
    consent.writeConsent(['necessary']);
    const { loadVercelPlatform } = await import('./loaders');
    loadVercelPlatform();
    expect(inject).not.toHaveBeenCalled();
    expect(injectSpeed).not.toHaveBeenCalled();
  });

  it('con analytics e __IS_VERCEL__ inyecta Analytics y Speed Insights', async () => {
    const inject = vi.fn();
    const injectSpeed = vi.fn();
    vi.doMock('@vercel/analytics', () => ({ inject }));
    vi.doMock('@vercel/speed-insights', () => ({ injectSpeedInsights: injectSpeed }));
    const consent = await import('./consent');
    consent.clearConsent();
    consent.writeConsent(['necessary', 'analytics']);
    const { loadVercelPlatform } = await import('./loaders');
    loadVercelPlatform();
    expect(inject).toHaveBeenCalledOnce();
    expect(injectSpeed).toHaveBeenCalledOnce();
  });
});
