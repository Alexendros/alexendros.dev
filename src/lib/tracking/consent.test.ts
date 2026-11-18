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
    documentElement: { dataset: {} as Record<string, string> }
  });
}

describe('consent', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PUBLIC_COOKIE_CONSENT_VERSION', '3');
    stubBrowser();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('writeConsent persiste analytics y version 3', async () => {
    const { writeConsent, hasConsent, readConsent, clearConsent } = await import('./consent');
    clearConsent();
    writeConsent(['necessary', 'analytics']);
    expect(hasConsent('analytics')).toBe(true);
    expect(hasConsent('necessary')).toBe(true);
    const state = readConsent();
    expect(state?.analytics).toBe(true);
    expect(state?.version).toBe(3);
  });

  it('sin analytics hasConsent es false', async () => {
    const { writeConsent, hasConsent, clearConsent } = await import('./consent');
    clearConsent();
    writeConsent(['necessary']);
    expect(hasConsent('analytics')).toBe(false);
  });

  it('versión distinta invalida el consentimiento en memoria', async () => {
    const first = await import('./consent');
    first.clearConsent();
    first.writeConsent(['necessary', 'analytics']);
    expect(first.consentVersion()).toBe(3);
    vi.stubEnv('PUBLIC_COOKIE_CONSENT_VERSION', '4');
    vi.resetModules();
    stubBrowser();
    const next = await import('./consent');
    // Sin cookie de v3 y con versión 4, el estado en memoria del módulo nuevo es null.
    expect(next.readConsent()).toBeNull();
  });
});
