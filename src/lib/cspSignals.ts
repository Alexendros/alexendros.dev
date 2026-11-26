/** Agregación operativa de violaciones CSP (contadores + alerta por umbral). */

export const CSP_SIGNAL_WINDOW_SECONDS = 3_600;
export const CSP_SIGNAL_ALERT_THRESHOLD = 25;
export const CSP_SIGNAL_MAX_KEYS = 50;
export const CSP_SIGNAL_PREFIX = 'alexendros:csp-signal';
export const CSP_REPORT_ANON_IP = 'anon:csp-report';
export const CSP_SIGNAL_OVERFLOW_KEY = 'overflow';
export const CSP_SIGNAL_KEYS_SET = `${CSP_SIGNAL_PREFIX}:window:v2`;

export type CspSignalSummary = {
  'violated-directive'?: string;
  'blocked-uri'?: string;
  'document-uri'?: string;
};

export type CspSignalStore = {
  increment: (candidate: string) => Promise<{ count: number; overflow: boolean }>;
};

const INCREMENT_SIGNAL = `
local key = KEYS[1]
local seconds = tonumber(ARGV[2])
local now = tonumber(redis.call('TIME')[1])
local window = math.floor(now / seconds)
if redis.call('HGET', key, 'window') ~= tostring(window) then
  redis.call('DEL', key)
  redis.call('HSET', key, 'window', window)
  redis.call('EXPIREAT', key, (window + 1) * seconds)
end

local field = ARGV[1]
local overflow = 0
if redis.call('HEXISTS', key, field) == 0 then
  local size = tonumber(redis.call('HGET', key, 'size') or '0')
  if size >= tonumber(ARGV[3]) then
    field = ARGV[4]
    overflow = 1
  else
    redis.call('HINCRBY', key, 'size', 1)
  end
end
return {redis.call('HINCRBY', key, field, 1), overflow}
`;

export function createRedisCspSignalStore(
  evaluate: (script: string, keys: string[], args: string[]) => Promise<[number, number]>
): CspSignalStore {
  return {
    async increment(candidate) {
      const [count, overflow] = await evaluate(
        INCREMENT_SIGNAL,
        [CSP_SIGNAL_KEYS_SET],
        [
          candidate,
          String(CSP_SIGNAL_WINDOW_SECONDS),
          String(CSP_SIGNAL_MAX_KEYS),
          CSP_SIGNAL_OVERFLOW_KEY
        ]
      );
      return { count, overflow: overflow === 1 };
    }
  };
}

export type CspSignalAlert = {
  directive: string;
  origin: string;
  count: number;
};

export type CspSignalDeps = {
  store: CspSignalStore;
  sendAlert: (alert: CspSignalAlert) => Promise<void>;
};

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.:_/-]+/g, '_')
    .slice(0, 120);
}

/** Origen de blocked-uri sin path ni query; fallback acotado si no es URL. */
export function blockedOrigin(blockedUri: string | undefined): string {
  if (!blockedUri?.trim()) return 'unknown';
  const raw = blockedUri.trim();
  try {
    return new URL(raw).origin;
  } catch {
    return raw.slice(0, 64);
  }
}

export function signalCounterKey(directive: string, origin: string): string {
  return `${CSP_SIGNAL_PREFIX}:v:${sanitizeSegment(directive)}:${sanitizeSegment(origin)}`;
}

/**
 * Incrementa el contador de la violación. Al cruzar el umbral envía un aviso
 * (una vez por ventana). Fallos de store/correo se tragan: el colector sigue en 204.
 */
export async function recordCspViolation(
  summary: CspSignalSummary,
  deps: CspSignalDeps
): Promise<{ count: number; alerted: boolean } | null> {
  const directive = summary['violated-directive']?.trim();
  if (!directive) return null;
  const origin = blockedOrigin(summary['blocked-uri']);

  try {
    const { count, overflow } = await deps.store.increment(signalCounterKey(directive, origin));
    if (count !== CSP_SIGNAL_ALERT_THRESHOLD) return { count, alerted: false };

    await deps.sendAlert({
      directive: overflow ? 'overflow' : directive,
      origin: overflow ? 'agrupado' : origin,
      count
    });
    return { count, alerted: true };
  } catch {
    return null;
  }
}
