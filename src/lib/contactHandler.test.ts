import { describe, expect, it, vi } from 'vitest';
import {
  buildContactEmailHtml,
  clientIp,
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
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': '203.0.113.10',
      ...extraHeaders
    },
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

  it('escapa <script> en el HTML del correo', () => {
    const { html } = buildContactEmailHtml({
      name: 'Alex',
      email: 'alex@example.com',
      subject: 'Propuesta comercial',
      message: 'Hola <script>alert(1)</script> y condition = true.'
    });
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});

describe('clientIp', () => {
  it('usa x-real-ip y ignora x-forwarded-for', () => {
    const req = new Request('https://alexendros.dev/api/contact', {
      headers: {
        'x-forwarded-for': '1.2.3.4, 5.6.7.8',
        'x-real-ip': '9.8.7.6'
      }
    });
    expect(clientIp(req)).toBe('9.8.7.6');
  });

  it('sin x-real-ip devuelve cadena vacía', () => {
    expect(clientIp(new Request('https://alexendros.dev/api/contact'))).toBe('');
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
          'x-real-ip': '203.0.113.10',
          'Content-Length': String(CONTACT_MAX_BODY_BYTES + 1)
        },
        body: JSON.stringify({ ...validBody, modules: big })
      }),
      deps()
    );
    expect(res.status).toBe(413);
  });

  it('cuerpo fragmentado sin Content-Length que supera el tope → 413', async () => {
    const oversized = JSON.stringify({
      ...validBody,
      modules: 'x'.repeat(CONTACT_MAX_BODY_BYTES)
    });
    expect(new TextEncoder().encode(oversized).byteLength).toBeGreaterThan(CONTACT_MAX_BODY_BYTES);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const bytes = new TextEncoder().encode(oversized);
        const mid = Math.floor(bytes.byteLength / 2);
        controller.enqueue(bytes.slice(0, mid));
        controller.enqueue(bytes.slice(mid));
        controller.close();
      }
    });
    const rateLimit = vi.fn(async () => ({ success: true, reset: Date.now() + 60_000 }));
    const res = await handleContactPost(
      new Request('https://alexendros.dev/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-real-ip': '203.0.113.10'
        },
        // @ts-expect-error Node requiere duplex para body stream
        duplex: 'half',
        body: stream
      }),
      deps({ rateLimit })
    );
    expect(res.status).toBe(413);
    expect(rateLimit).not.toHaveBeenCalled();
  });

  it('sin x-real-ip → 503 y no llama rateLimit', async () => {
    const rateLimit = vi.fn(async () => ({ success: true, reset: Date.now() + 60_000 }));
    const res = await handleContactPost(
      new Request('https://alexendros.dev/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody)
      }),
      deps({ rateLimit })
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, status: 'retryable_failure' });
    expect(rateLimit).not.toHaveBeenCalled();
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

  it('SMTP pierde la respuesta → 503 unknown y un solo envío', async () => {
    const sendMail = vi.fn(async () => {
      throw Object.assign(new Error('smtp'), { code: 'ETIMEDOUT', command: 'DATA' });
    });
    const d = deps({ sendMail, idempotencyStore: createMemoryContactIdempotencyStore() });
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const res = await handleContactPost(
        postJson(validBody, { headers: { 'Idempotency-Key': 'smtp-unknown' } }),
        d
      );
      expect(res.status).toBe(503);
      expect(await res.json()).toMatchObject({ status: 'unknown' });
    }
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('timeout del limitador → 503 sin enviar correo', async () => {
    const sendMail = vi.fn(async () => undefined);
    const res = await handleContactPost(
      postJson(validBody),
      deps({
        sendMail,
        rateLimit: async () => ({ success: true, reason: 'timeout' })
      })
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ status: 'retryable_failure' });
    expect(sendMail).not.toHaveBeenCalled();
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
        if (attempts === 1)
          throw Object.assign(new Error('smtp'), { code: 'EDNS', command: 'CONN' });
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

  it('API-06: SMTP ok pero persistencia del resultado falla → 503 unknown', async () => {
    const inner = createMemoryContactIdempotencyStore();
    const store: ContactIdempotencyStore = {
      get: (k) => inner.get(k),
      tryCreate: (k, r, t) => inner.tryCreate(k, r, t),
      compareAndSet: async () => {
        throw new Error('Redis no disponible');
      }
    };
    const sendMail = vi.fn(async () => undefined);
    let now = 1_700_000_000_000;
    const d = deps({ sendMail, idempotencyStore: store, nowMs: () => now });
    const res = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-06-key' } }),
      d
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, status: 'unknown' });
    expect(sendMail).toHaveBeenCalledOnce();

    now += 120_000;
    const again = await handleContactPost(
      postJson(validBody, { headers: { 'Idempotency-Key': 'api-06-key' } }),
      d
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
