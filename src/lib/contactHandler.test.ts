import { describe, expect, it, vi } from 'vitest';
import {
  CONTACT_MAX_BODY_BYTES,
  handleContactPost,
  isJsonContentType,
  methodNotAllowed,
  type ContactDeps
} from './contactHandler';

const validBody = {
  name: 'Alex Endros',
  entityType: 'particular',
  channel: 'correo',
  email: 'alex@example.com',
  reason: 'propuestaComercial',
  message: 'Quiero un informe comercial para mi dominio.',
  consent: true
};

function deps(overrides: Partial<ContactDeps> = {}): ContactDeps {
  return {
    getEnv: () => ({
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_USER: 'user@example.com',
      SMTP_PASS: 'secret',
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'token'
    }),
    rateLimit: async () => ({ success: true, reset: Date.now() + 60_000 }),
    sendMail: async () => undefined,
    createRequestId: () => 'req-test',
    nowMs: () => 1_700_000_000_000,
    ...overrides
  };
}

function postJson(body: unknown, init?: RequestInit): Request {
  return new Request('https://alexendros.dev/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    ...init
  });
}

describe('methodNotAllowed', () => {
  it('GET → 405 Allow POST', () => {
    const res = methodNotAllowed();
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST');
  });
});

describe('isJsonContentType', () => {
  it('acepta application/json con charset', () => {
    expect(
      isJsonContentType(
        new Request('https://x', { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      )
    ).toBe(true);
  });

  it('rechaza text/plain', () => {
    expect(
      isJsonContentType(new Request('https://x', { headers: { 'Content-Type': 'text/plain' } }))
    ).toBe(false);
  });
});

describe('handleContactPost', () => {
  it('POST válido → 200', async () => {
    const sendMail = vi.fn(async () => undefined);
    const res = await handleContactPost(postJson(validBody), deps({ sendMail }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('WhatsApp con teléfono → 200', async () => {
    const res = await handleContactPost(
      postJson({
        name: 'Alex Endros',
        entityType: 'empresa',
        channel: 'whatsapp',
        phone: '+34 600 000 000',
        reason: 'proyectoEspecial',
        message: 'Necesito una sesión para priorizar el siguiente paso.',
        consent: true
      }),
      deps()
    );
    expect(res.status).toBe(200);
  });

  it('falta name → 400 genérico', async () => {
    const { name: _n, ...rest } = validBody;
    const res = await handleContactPost(postJson(rest), deps());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid request' });
  });

  it('correo sin email → 400', async () => {
    const { email: _e, ...rest } = validBody;
    const res = await handleContactPost(postJson(rest), deps());
    expect(res.status).toBe(400);
  });

  it('WhatsApp sin teléfono → 400', async () => {
    const res = await handleContactPost(
      postJson({
        name: 'Alex Endros',
        entityType: 'particular',
        channel: 'whatsapp',
        reason: 'informacionCliente',
        consent: true
      }),
      deps()
    );
    expect(res.status).toBe(400);
  });

  it('Content-Type no JSON → 415', async () => {
    const res = await handleContactPost(
      new Request('https://alexendros.dev/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(validBody)
      }),
      deps()
    );
    expect(res.status).toBe(415);
  });

  it('payload excesivo → 413', async () => {
    const big = 'x'.repeat(CONTACT_MAX_BODY_BYTES + 1);
    const res = await handleContactPost(
      new Request('https://alexendros.dev/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(CONTACT_MAX_BODY_BYTES + 1)
        },
        body: JSON.stringify({ ...validBody, modules: big })
      }),
      deps()
    );
    expect(res.status).toBe(413);
  });

  it('SMTP no configurado → 503', async () => {
    const res = await handleContactPost(
      postJson(validBody),
      deps({
        getEnv: () => ({
          UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
          UPSTASH_REDIS_REST_TOKEN: 'token'
        })
      })
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'Service unavailable' });
  });

  it('Redis no configurado → 503 fail-closed', async () => {
    const res = await handleContactPost(
      postJson(validBody),
      deps({
        getEnv: () => ({
          SMTP_HOST: 'smtp.example.com',
          SMTP_USER: 'u',
          SMTP_PASS: 'p'
        })
      })
    );
    expect(res.status).toBe(503);
  });

  it('Redis error → 503', async () => {
    const res = await handleContactPost(
      postJson(validBody),
      deps({
        rateLimit: async () => {
          throw new Error('down');
        }
      })
    );
    expect(res.status).toBe(503);
  });

  it('rate limit → 429 + Retry-After', async () => {
    const res = await handleContactPost(
      postJson(validBody),
      deps({
        rateLimit: async () => ({ success: false, reset: 1_700_000_000_000 + 30_000 }),
        nowMs: () => 1_700_000_000_000
      })
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
  });

  it('SMTP send fail → 503', async () => {
    const res = await handleContactPost(
      postJson(validBody),
      deps({
        sendMail: async () => {
          throw new Error('smtp');
        }
      })
    );
    expect(res.status).toBe(503);
  });

  it('honeypot → 200 sin sendMail', async () => {
    const sendMail = vi.fn(async () => undefined);
    const res = await handleContactPost(
      postJson({ ...validBody, honeypot: 'bot' }),
      deps({ sendMail })
    );
    expect(res.status).toBe(200);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
