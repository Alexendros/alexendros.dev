import { readBodyWithLimit } from './readBodyWithLimit';
/** Colector CSP Report-Only: límite de cuerpo y logging acotado (OWASP A09). */

import { CSP_REPORT_ANON_IP, type CspSignalDeps, recordCspViolation } from './cspSignals';

export const MAX_CSP_REPORT_BYTES = 16 * 1024;
export const MAX_CSP_REPORT_FIELD_CHARS = 200;
export const MAX_CSP_REPORTS_PER_REQUEST = 20;

const ALLOWED_TYPES = new Set(['application/csp-report', 'application/reports+json']);

export type CspReportLog = (label: string, detail?: string) => void;

export type CspReportDeps = {
  /** Rate-limit por IP; si falla, se responde 204 sin loguear el cuerpo. */
  rateLimit?: (ip: string) => Promise<{ success: boolean; reason?: string }>;
  /** Resuelve IP del cliente (cadena vacía → cubo anon:csp-report). */
  clientIp?: (request: Request) => string;
  /** Contadores + alerta por umbral; los fallos no cambian el 204. */
  signals?: CspSignalDeps;
};

function mediaType(request: Request): string | null {
  const ct = request.headers.get('content-type');
  if (!ct) return null;
  return ct.split(';')[0]?.trim().toLowerCase() ?? null;
}

function clip(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_CSP_REPORT_FIELD_CHARS);
}

function reportOrigin(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') return clip(url.origin);
    return clip(url.protocol);
  } catch {
    return ['inline', 'eval', 'wasm-eval', 'self'].includes(value) ? value : undefined;
  }
}

/** Extrae solo campos seguros del informe CSP (legacy o Reporting API). */
export function summarizeCspReport(report: unknown): Record<string, string> | null {
  if (!report || typeof report !== 'object') return null;

  const root = report as Record<string, unknown>;
  const legacy =
    root['csp-report'] && typeof root['csp-report'] === 'object'
      ? (root['csp-report'] as Record<string, unknown>)
      : null;

  if (legacy) {
    const out: Record<string, string> = {};
    const violated = clip(legacy['violated-directive']);
    const blocked = reportOrigin(legacy['blocked-uri']);
    const document = reportOrigin(legacy['document-uri']);
    if (violated) out['violated-directive'] = violated;
    if (blocked) out['blocked-uri'] = blocked;
    if (document) out['document-uri'] = document;
    return Object.keys(out).length > 0 ? out : null;
  }

  // Reporting API: { type, body: { effectiveDirective|violatedDirective, blockedURL, documentURL } }
  const body =
    root.body && typeof root.body === 'object' ? (root.body as Record<string, unknown>) : null;
  if (body) {
    const out: Record<string, string> = {};
    const violated = clip(
      body.effectiveDirective ?? body.violatedDirective ?? body['violated-directive']
    );
    const blocked = reportOrigin(body.blockedURL ?? body['blocked-uri']);
    const document = reportOrigin(body.documentURL ?? body['document-uri']);
    if (violated) out['violated-directive'] = violated;
    if (blocked) out['blocked-uri'] = blocked;
    if (document) out['document-uri'] = document;
    return Object.keys(out).length > 0 ? out : null;
  }

  return null;
}

/**
 * Lee el cuerpo del informe CSP con tope de bytes. Siempre responde 204;
 * no propaga el cuerpo si es oversized, tipo incorrecto o no-JSON.
 */
export async function handleCspReportPost(
  request: Request,
  log: CspReportLog = (label, detail) => {
    if (detail !== undefined) console.warn(label, detail);
    else console.warn(label);
  },
  deps: CspReportDeps = {}
): Promise<Response> {
  const type = mediaType(request);
  if (!type || !ALLOWED_TYPES.has(type)) {
    return new Response(null, { status: 204 });
  }

  if (deps.rateLimit) {
    const resolved = deps.clientIp?.(request) ?? request.headers.get('x-real-ip')?.trim() ?? '';
    const ip = resolved || CSP_REPORT_ANON_IP;
    try {
      const limited = await deps.rateLimit(ip);
      if (limited.reason === 'timeout') return new Response(null, { status: 204 });
      if (!limited.success) {
        log('[csp-report]', 'rate_limited');
        return new Response(null, { status: 204 });
      }
    } catch {
      return new Response(null, { status: 204 });
    }
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const n = Number(contentLength);
    if (Number.isFinite(n) && n > MAX_CSP_REPORT_BYTES) {
      log('[csp-report]', `oversized_content_length:${n}`);
      return new Response(null, { status: 204 });
    }
  }

  const body = await readBodyWithLimit(request, MAX_CSP_REPORT_BYTES);
  if (!body.ok) {
    if (body.reason === 'too_large') log('[csp-report]', 'oversized_body');
    return new Response(null, { status: 204 });
  }
  const raw = body.text;

  if (!raw.trim()) {
    return new Response(null, { status: 204 });
  }

  try {
    const report: unknown = JSON.parse(raw);
    const reports = Array.isArray(report) ? report : [report];
    if (reports.length > MAX_CSP_REPORTS_PER_REQUEST) return new Response(null, { status: 204 });
    for (const item of reports) {
      if (
        type === 'application/reports+json' &&
        (!item || typeof item !== 'object' || item.type !== 'csp-violation')
      )
        continue;
      const summary = summarizeCspReport(item);
      if (!summary) continue;
      log('[csp-report]', JSON.stringify(summary));
      if (deps.signals) await recordCspViolation(summary, deps.signals);
    }
  } catch {
    // cuerpos no-JSON: ignorar
  }

  return new Response(null, { status: 204 });
}
