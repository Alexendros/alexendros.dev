import { describe, expect, it, vi } from 'vitest';
import {
  buildContactEmailHtml,
  CONTACT_MAX_BODY_BYTES,
  handleContactPost,
  isJsonContentType,
  methodNotAllowed,
  type ContactDeps
} from './contactHandler';
import {
  createMemoryContactIdempotencyStore,
  type ContactIdempotencyStore
} from './contactIdempotency';

const validBody = {
  name: 'Alex Endros',
  entityType: 'particular',
  channel: 'correo',
  email: 'alex@example.com',
  reason: 'propuestaComercial',
  message: 'Quiero un informe comercial para mi dominio.',
  vias: ['revisar'],
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
  const extraHeaders =
    init?.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : ((init?.headers as Record<string, string> | undefined) ?? {});
  const { headers: _h, ...rest } = init ?? {};
  return new Request('https://alexendros.dev/api/contact', {
    method: 'POST',
    ...rest,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}

describe('buildContactEmailHtml', () => {
  it('sanitiza CRLF del asunto SMTP', () => {
    const { mailSubject } = buildContactEmailHtml({
      name: 'Alex\r\nBcc: evil@example.com',
      email: 'alex@example.com',
      subject: 'Propuesta comercial',
      message: 'Detalle suficiente para el cuerpo.'
    });
    expect(mailSubject).not.toMatch(/[\r\n]/);
    expect(mailSubject).toContain('Propuesta comercial');
  });
});

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
  it('POST válido → 200 accepted', async () => {
    const sendMail = vi.fn(async () => undefined);
    const res = await handleContactPost(postJson(validBody), deps({ sendMail }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      status: 'accepted',
      requestId: 'req-test',
      replay: false
    });
    expect(sendMail).toHaveBeenCalledOnce();
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

  it('canal no admitido → 400', async () => {
    const res = await handleContactPost(
      postJson({
        name: 'Alex Endros',
        entityType: 'particular',
        channel: 'whatsapp',
        email: 'alex@example.com',
        reason: 'informacionCliente',
        message: 'Petición de prueba con un canal retirado.',
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

  it('SMTP no configurado → 503 retryable_failure', async () => {
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
    expect(await res.json()).toMatchObject({ ok: false, status: 'retryable_failure' });
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

  it('SMTP send fail → 503 retryable_failure', async () => {
    const res = await handleContactPost(
      postJson(validBody),
      deps({
        sendMail: async () => {
          throw new Error('smtp');
        }
      })
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ status: 'retryable_failure' });
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

  function consentCookie(categories: string[]): string {
    vi.stubEnv('PUBLIC_COOKIE_CONSENT_VERSION', '2');
    return `consent_v1=${encodeURIComponent(
      JSON.stringify({
        categories,
        consentTimestamp: new Date(1_700_000_000_000).toISOString(),
        revision: 2
      })
    )}`;
  }

  it('CAPI: sin cookie de publicidad → no sendLeadEvent', async () => {
    const sendLeadEvent = vi.fn(async () => undefined);
    const res = await handleContactPost(
      postJson({ ...validBody, eventId: 'evt-no-mkt' }),
      deps({ sendLeadEvent })
    );
    expect(res.status).toBe(200);
    expect(sendLeadEvent).not.toHaveBeenCalled();
  });

  it('CAPI: solo analítica → no sendLeadEvent', async () => {
    const sendLeadEvent = vi.fn(async () => undefined);
    const res = await handleContactPost(
      postJson(
        { ...validBody, eventId: 'evt-analytics' },
        { headers: { Cookie: consentCookie(['necessary', 'analytics']) } }
      ),
      deps({ sendLeadEvent })
    );
    expect(res.status).toBe(200);
    expect(sendLeadEvent).not.toHaveBeenCalled();
  });

  it('CAPI: publicidad → sendLeadEvent con eventId', async () => {
    const sendLeadEvent = vi.fn(async (_input: unknown) => undefined);
    const res = await handleContactPost(
      postJson(
        { ...validBody, eventId: 'evt-lead-12345' },
        {
          headers: {
            Cookie: `${consentCookie(['necessary', 'analytics', 'marketing'])}; _fbp=fb.1.x`
          }
        }
      ),
      deps({ sendLeadEvent })
    );
    expect(res.status).toBe(200);
    expect(sendLeadEvent).toHaveBeenCalledOnce();
    expect(sendLeadEvent.mock.calls[0]?.[0]).toMatchObject({
      email: validBody.email,
      eventId: 'evt-lead-12345',
      fbp: 'fb.1.x'
    });
  });

  it('API-01: envío válido con store → un sendMail y accepted', async () => {
    const store = createMemoryContactIdempotencyStore();
    const sendMail = vi.fn(async () => undefined);
    const res = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-01-key' } }),
      deps({ sendMail, idempotencyStore: store })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, status: 'accepted', replay: false });
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('API-02: claim ocupado → 202 processing (no 200 duplicate)', async () => {
    const store = createMemoryContactIdempotencyStore();
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    const sendMail = vi.fn(async () => {
      await gate;
    });
    const d = deps({ sendMail, idempotencyStore: store, nowMs: () => 1_700_000_000_000 });

    const firstPromise = handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-02-key' } }),
      d
    );
    // Esperar a que el primer claim esté en processing (sendMail retenido)
    await vi.waitFor(() => expect(sendMail).toHaveBeenCalled());

    const second = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-02-key' } }),
      d
    );
    expect(second.status).toBe(202);
    expect(await second.json()).toMatchObject({ ok: false, status: 'processing' });
    expect(second.headers.get('Retry-After')).toBeTruthy();
    expect(sendMail).toHaveBeenCalledOnce();

    release();
    const first = await firstPromise;
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({ status: 'accepted', replay: false });
  });

  it('API-03: replay accepted → 200 sin segundo envío', async () => {
    const store = createMemoryContactIdempotencyStore();
    const sendMail = vi.fn(async () => undefined);
    const d = deps({ sendMail, idempotencyStore: store });
    const first = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-03-key' } }),
      d
    );
    const second = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-03-key' } }),
      d
    );
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({
      ok: true,
      status: 'accepted',
      replay: true
    });
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('API-04: misma clave otro payload → 409', async () => {
    const store = createMemoryContactIdempotencyStore();
    const sendMail = vi.fn(async () => undefined);
    const d = deps({ sendMail, idempotencyStore: store });
    await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-04-key' } }),
      d
    );
    const conflict = await handleContactPost(
      postJson(
        { ...validBody, message: 'Mensaje distinto que cambia la huella lógica.' },
        { headers: { 'Idempotency-Key': 'api-04-key' } }
      ),
      d
    );
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toEqual({ ok: false, status: 'conflict' });
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('API-05: SMTP falla → retryable_failure y permite reintento', async () => {
    const store = createMemoryContactIdempotencyStore();
    let attempts = 0;
    const d = deps({
      idempotencyStore: store,
      sendMail: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error('smtp');
      }
    });
    const fail = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-05-key' } }),
      d
    );
    const ok = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-05-key' } }),
      d
    );
    expect(fail.status).toBe(503);
    expect(await fail.json()).toMatchObject({ status: 'retryable_failure' });
    expect(ok.status).toBe(200);
    expect(attempts).toBe(2);
  });

  it('API-06: SMTP ok pero persistencia accepted falla → 503 unknown', async () => {
    const inner = createMemoryContactIdempotencyStore();
    const store: ContactIdempotencyStore = {
      get: (k) => inner.get(k),
      tryCreate: (k, r, t) => inner.tryCreate(k, r, t),
      compareAndSet: async (k, owner, record, ttl) => {
        if (record.status === 'accepted') return false;
        return inner.compareAndSet(k, owner, record, ttl);
      }
    };
    const sendMail = vi.fn(async () => undefined);
    const res = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-06-key' } }),
      deps({ sendMail, idempotencyStore: store })
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, status: 'unknown' });
    expect(sendMail).toHaveBeenCalledOnce();

    // Reintento no reenvía (unknown bloquea)
    const again = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-06-key' } }),
      deps({ sendMail, idempotencyStore: store })
    );
    expect(again.status).toBe(503);
    expect(await again.json()).toMatchObject({ status: 'unknown' });
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('API-08: eventId distinto no cambia la huella de claim', async () => {
    const store = createMemoryContactIdempotencyStore();
    const sendMail = vi.fn(async () => undefined);
    const d = deps({ sendMail, idempotencyStore: store });
    const first = await handleContactPost(
      postJson(
        { ...validBody, eventId: 'evt-old-12345' },
        { headers: { 'Idempotency-Key': 'api-08-key' } }
      ),
      d
    );
    const second = await handleContactPost(
      postJson(
        { ...validBody, eventId: 'evt-new-67890' },
        { headers: { 'Idempotency-Key': 'api-08-key' } }
      ),
      d
    );
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ replay: true });
    expect(sendMail).toHaveBeenCalledOnce();
  });
});
