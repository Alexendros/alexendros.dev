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
  sets: Map<string, Set<string>>;
  nx: Map<string, string>;
} {
  const counters = new Map<string, number>();
  const sets = new Map<string, Set<string>>();
  const nx = new Map<string, string>();
  return {
    counters,
    sets,
    nx,
    async scard(key) {
      return sets.get(key)?.size ?? 0;
    },
    async sismember(key, member) {
      return sets.get(key)?.has(member) ?? false;
    },
    async sadd(key, member) {
      const set = sets.get(key) ?? new Set();
      const wasNew = !set.has(member);
      set.add(member);
      sets.set(key, set);
      return wasNew;
    },
    async incrWithTtl(key) {
      const next = (counters.get(key) ?? 0) + 1;
      counters.set(key, next);
      return next;
    },
    async setNx(key, value) {
      if (nx.has(key)) return false;
      nx.set(key, value);
      return true;
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
  });

  it('tragan errores del store', async () => {
    const store: CspSignalStore = {
      scard: async () => {
        throw new Error('down');
      },
      sismember: async () => {
        throw new Error('down');
      },
      sadd: async () => {
        throw new Error('down');
      },
      incrWithTtl: async () => {
        throw new Error('down');
      },
      setNx: async () => {
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
