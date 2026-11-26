import { describe, expect, it, vi } from 'vitest';
import {
  blockedOrigin,
  CSP_SIGNAL_ALERT_THRESHOLD,
  CSP_SIGNAL_MAX_KEYS,
  CSP_SIGNAL_OVERFLOW_KEY,
  recordCspViolation,
  signalCounterKey,
  type CspSignalStore
} from './cspSignals';

function memoryStore(): CspSignalStore & {
  counters: Map<string, number>;
} {
  const counters = new Map<string, number>();
  return {
    counters,
    async increment(candidate) {
      const overflow =
        !counters.has(candidate) &&
        counters.size - Number(counters.has(CSP_SIGNAL_OVERFLOW_KEY)) >= CSP_SIGNAL_MAX_KEYS;
      const key = overflow ? CSP_SIGNAL_OVERFLOW_KEY : candidate;
      const count = (counters.get(key) ?? 0) + 1;
      counters.set(key, count);
      return { count, overflow };
    }
  };
}

describe('blockedOrigin', () => {
  it('quita path y query', () => {
    expect(blockedOrigin('https://evil.example/path?q=1')).toBe('https://evil.example');
  });

  it('fallback si no es URL', () => {
    expect(blockedOrigin('inline')).toBe('inline');
    expect(blockedOrigin(undefined)).toBe('unknown');
  });
});

describe('recordCspViolation', () => {
  it('incrementa y alerta una sola vez al cruzar el umbral', async () => {
    const store = memoryStore();
    const sendAlert = vi.fn(async () => undefined);
    const summary = {
      'violated-directive': 'script-src',
      'blocked-uri': 'https://evil.example/x.js'
    };

    for (let i = 1; i < CSP_SIGNAL_ALERT_THRESHOLD; i += 1) {
      const r = await recordCspViolation(summary, { store, sendAlert });
      expect(r?.alerted).toBe(false);
      expect(r?.count).toBe(i);
    }
    const crossed = await recordCspViolation(summary, { store, sendAlert });
    expect(crossed).toEqual({ count: CSP_SIGNAL_ALERT_THRESHOLD, alerted: true });
    expect(sendAlert).toHaveBeenCalledOnce();
    expect(sendAlert).toHaveBeenCalledWith({
      directive: 'script-src',
      origin: 'https://evil.example',
      count: CSP_SIGNAL_ALERT_THRESHOLD
    });

    const again = await recordCspViolation(summary, { store, sendAlert });
    expect(again?.alerted).toBe(false);
    expect(sendAlert).toHaveBeenCalledOnce();
  });

  it('desborda a overflow cuando hay más de 50 claves', async () => {
    const store = memoryStore();
    const sendAlert = vi.fn(async () => undefined);
    for (let i = 0; i < CSP_SIGNAL_MAX_KEYS; i += 1) {
      await recordCspViolation(
        {
          'violated-directive': `dir-${i}`,
          'blocked-uri': `https://o${i}.example/`
        },
        { store, sendAlert }
      );
    }
    const overflow = await recordCspViolation(
      {
        'violated-directive': 'script-src',
        'blocked-uri': 'https://new.example/x'
      },
      { store, sendAlert }
    );
    expect(overflow?.count).toBe(1);
    expect(store.counters.get(CSP_SIGNAL_OVERFLOW_KEY)).toBe(1);
    expect(store.counters.has(signalCounterKey('script-src', 'https://new.example'))).toBe(false);
    await Promise.all(
      Array.from({ length: CSP_SIGNAL_ALERT_THRESHOLD }, (_, index) =>
        recordCspViolation(
          { 'violated-directive': `extra-${index}`, 'blocked-uri': 'https://new.example/' },
          { store, sendAlert }
        )
      )
    );
    expect(store.counters.size).toBe(CSP_SIGNAL_MAX_KEYS + 1);
    expect(sendAlert).toHaveBeenCalledExactlyOnceWith({
      directive: 'overflow',
      origin: 'agrupado',
      count: CSP_SIGNAL_ALERT_THRESHOLD
    });
  });

  it('tragan errores del store', async () => {
    const store: CspSignalStore = {
      increment: async () => {
        throw new Error('down');
      }
    };
    const result = await recordCspViolation(
      { 'violated-directive': 'script-src', 'blocked-uri': 'https://x.example/' },
      { store, sendAlert: async () => undefined }
    );
    expect(result).toBeNull();
  });
});
