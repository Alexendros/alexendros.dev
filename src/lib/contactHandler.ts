import {
  buildContactMessage,
  escapeHtml,
  isHoneypotFilled,
  parseContactBody,
  reasonLabels,
  type ContactInput
} from './contactSchema';
import { resolveSmtpConfig, type SmtpConfig } from './smtpConfig';

export const CONTACT_MAX_BODY_BYTES = 16_384;

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export type ContactEnv = {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
};

export type RateLimitResult = {
  success: boolean;
  reset?: number;
};

export type ContactMailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  replyTo?: string;
  smtp: SmtpConfig;
};

export type ContactDeps = {
  getEnv: () => ContactEnv;
  rateLimit: (ip: string) => Promise<RateLimitResult>;
  sendMail: (payload: ContactMailPayload) => Promise<void>;
  verifyTurnstile?: (token: string, ip: string) => Promise<boolean>;
  sendLeadEvent?: (input: ContactLeadEvent) => Promise<void>;
  saveLead?: (input: ContactLeadInput) => Promise<void>;
  createRequestId?: () => string;
  nowMs?: () => number;
};

export type ContactLeadEvent = {
  email: string;
  ip: string;
  userAgent: string | null;
  sourceUrl: string | null;
};

export type ContactLeadInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  consent: boolean;
};

function json(status: number, body: unknown, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}

function logEvent(
  level: 'info' | 'error',
  event: string,
  requestId: string,
  ok: boolean,
  extra?: Record<string, unknown>
): void {
  const line = JSON.stringify({ event, ok, requestId, ...extra });
  if (level === 'error') console.error(line);
  else console.info(line);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

export function isJsonContentType(request: Request): boolean {
  const ct = request.headers.get('content-type');
  if (!ct) return false;
  const media = ct.split(';')[0]?.trim().toLowerCase();
  return media === 'application/json';
}

export function methodNotAllowed(): Response {
  return json(405, { error: 'Method not allowed' }, { Allow: 'POST' });
}

function mailFields(data: ContactInput) {
  const subject = reasonLabels[data.reason];
  const message = buildContactMessage(data);
  const email =
    data.email ?? `whatsapp-${(data.phone ?? 'sin-tel').replace(/\D/g, '')}@alexendros.dev`;
  return {
    name: data.name,
    email,
    subject,
    message,
    replyTo: data.email
  };
}

/**
 * Handler de contrato para POST /api/contact.
 * Fail-closed si Upstash no está configurado o falla.
 */
export async function handleContactPost(request: Request, deps: ContactDeps): Promise<Response> {
  const requestId = deps.createRequestId?.() ?? crypto.randomUUID();
  const nowMs = deps.nowMs?.() ?? Date.now();

  if (!isJsonContentType(request)) {
    logEvent('info', 'contact_unsupported_media', requestId, false);
    return json(415, { error: 'Unsupported media type' });
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const len = Number(contentLength);
    if (Number.isFinite(len) && len > CONTACT_MAX_BODY_BYTES) {
      logEvent('info', 'contact_payload_too_large', requestId, false);
      return json(413, { error: 'Payload too large' });
    }
  }

  const raw = await request.text().catch(() => null);
  if (raw === null) {
    return json(400, { error: 'Invalid request' });
  }
  if (new TextEncoder().encode(raw).byteLength > CONTACT_MAX_BODY_BYTES) {
    logEvent('info', 'contact_payload_too_large', requestId, false);
    return json(413, { error: 'Payload too large' });
  }

  let data: unknown = null;
  try {
    data = raw.length === 0 ? null : JSON.parse(raw);
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  const parsed = parseContactBody(data);
  if (!parsed.success) {
    return json(400, { error: 'Invalid request' });
  }

  if (isHoneypotFilled(parsed.data.honeypot)) {
    logEvent('info', 'contact_honeypot', requestId, true);
    return json(200, { ok: true });
  }

  const env = deps.getEnv();
  const ip = clientIp(request);

  if (env.TURNSTILE_SECRET_KEY) {
    const token = parsed.data.turnstileToken;
    const verified =
      typeof token === 'string' && token.length > 0 && deps.verifyTurnstile
        ? await deps.verifyTurnstile(token, ip).catch(() => false)
        : false;
    if (!verified) {
      logEvent('info', 'contact_turnstile_failed', requestId, false);
      return json(400, { error: 'Captcha verification failed' });
    }
  }

  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    logEvent('error', 'contact_redis_misconfigured', requestId, false);
    return json(503, { error: 'Service unavailable' });
  }
  let limited: RateLimitResult;
  try {
    limited = await deps.rateLimit(ip);
  } catch {
    logEvent('error', 'contact_redis_error', requestId, false);
    return json(503, { error: 'Service unavailable' });
  }

  if (!limited.success) {
    const headers: Record<string, string> = {};
    if (typeof limited.reset === 'number' && Number.isFinite(limited.reset)) {
      const retryAfterSec = Math.max(1, Math.ceil((limited.reset - nowMs) / 1000));
      headers['Retry-After'] = String(retryAfterSec);
    }
    logEvent('info', 'contact_rate_limited', requestId, false);
    return json(429, { error: 'Too many requests' }, headers);
  }

  const smtp = resolveSmtpConfig(env);
  if (!smtp) {
    logEvent('error', 'contact_smtp_misconfigured', requestId, false);
    return json(503, { error: 'Service unavailable' });
  }

  const fields = mailFields(parsed.data);

  try {
    await deps.sendMail({ ...fields, smtp });
  } catch {
    logEvent('error', 'contact_smtp_error', requestId, false);
    return json(503, { error: 'Service unavailable' });
  }

  logEvent('info', 'contact_sent', requestId, true, {
    subjectLen: fields.subject.length,
    messageLen: fields.message.length
  });

  if (deps.sendLeadEvent && parsed.data.email) {
    void deps
      .sendLeadEvent({
        email: parsed.data.email,
        ip,
        userAgent: request.headers.get('user-agent'),
        sourceUrl: request.headers.get('referer')
      })
      .catch(() => {});
  }

  if (deps.saveLead) {
    void deps
      .saveLead({
        name: fields.name,
        email: fields.email,
        subject: fields.subject,
        message: fields.message,
        consent: parsed.data.consent
      })
      .catch(() => {});
  }

  return json(200, { ok: true });
}

export function buildContactEmailHtml(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): { html: string; text: string; mailSubject: string } {
  const safeName = escapeHtml(input.name);
  const safeEmail = escapeHtml(input.email);
  const safeSubject = escapeHtml(input.subject);
  const safeMessage = escapeHtml(input.message).replace(/\n/g, '<br/>');

  const html = `
    <h2>Nueva petición — alexendros.dev</h2>
    <p><strong>Nombre:</strong> ${safeName}</p>
    <p><strong>Email / canal:</strong> ${safeEmail}</p>
    <p><strong>Motivo:</strong> ${safeSubject}</p>
    <p><strong>Detalle:</strong></p>
    <p>${safeMessage}</p>
  `;

  const text = `Nombre: ${input.name}\nEmail: ${input.email}\nMotivo: ${input.subject}\n\n${input.message}`;
  const mailSubject = `[alexendros.dev] ${input.subject} - ${input.name}`;
  return { html, text, mailSubject };
}
