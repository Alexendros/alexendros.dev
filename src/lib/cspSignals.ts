/** Agregación operativa de violaciones CSP (contadores + alerta por umbral). */

export const CSP_SIGNAL_WINDOW_SECONDS = 3_600;
export const CSP_SIGNAL_ALERT_THRESHOLD = 25;
export const CSP_SIGNAL_MAX_KEYS = 50;
export const CSP_SIGNAL_PREFIX = 'alexendros:csp-signal';
export const CSP_REPORT_ANON_IP = 'anon:csp-report';
export const CSP_SIGNAL_OVERFLOW_KEY = `${CSP_SIGNAL_PREFIX}:v:overflow`;
export const CSP_SIGNAL_KEYS_SET = `${CSP_SIGNAL_PREFIX}:keys`;

export type CspSignalSummary = {
  'violated-directive'?: string;
  'blocked-uri'?: string;
  'document-uri'?: string;
};

export type CspSignalStore = {
  /** Cardinalidad del conjunto de claves activas. */
  scard: (key: string) => Promise<number>;
  /** true si el miembro ya está en el set. */
  sismember: (key: string, member: string) => Promise<boolean>;
  /** Añade miembro al set; true si era nuevo. */
  sadd: (key: string, member: string) => Promise<boolean>;
  /** INCR con TTL si la clave es nueva. */
  incrWithTtl: (key: string, ttlSeconds: number) => Promise<number>;
  /** SET NX con TTL; true si se creó. */
  setNx: (key: string, value: string, ttlSeconds: number) => Promise<boolean>;
};

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

export function signalAlertKey(directive: string, origin: string): string {
  return `${CSP_SIGNAL_PREFIX}:alert:${sanitizeSegment(directive)}:${sanitizeSegment(origin)}`;
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
    const candidate = signalCounterKey(directive, origin);
    let counterKey = candidate;
    const known = await deps.store.sismember(CSP_SIGNAL_KEYS_SET, candidate);
    if (!known) {
      const size = await deps.store.scard(CSP_SIGNAL_KEYS_SET);
      if (size >= CSP_SIGNAL_MAX_KEYS) {
        counterKey = CSP_SIGNAL_OVERFLOW_KEY;
      } else {
        await deps.store.sadd(CSP_SIGNAL_KEYS_SET, candidate);
      }
    }

    const count = await deps.store.incrWithTtl(counterKey, CSP_SIGNAL_WINDOW_SECONDS);
    if (count < CSP_SIGNAL_ALERT_THRESHOLD) {
      return { count, alerted: false };
    }

    const claimed = await deps.store.setNx(
      signalAlertKey(directive, origin),
      String(count),
      CSP_SIGNAL_WINDOW_SECONDS
    );
    if (!claimed) {
      return { count, alerted: false };
    }

    await deps.sendAlert({ directive, origin, count });
    return { count, alerted: true };
  } catch {
    return null;
  }
}
