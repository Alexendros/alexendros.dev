import { describe, expect, it, vi } from 'vitest';
import {
  handleCspReportPost,
  MAX_CSP_REPORT_BYTES,
  MAX_CSP_REPORTS_PER_REQUEST,
  summarizeCspReport
} from './cspReportHandler';

describe('summarizeCspReport', () => {
  it('extrae solo campos seguros del informe legacy', () => {
    expect(
      summarizeCspReport({
        'csp-report': {
          'violated-directive': 'script-src',
          'blocked-uri': 'https://evil.example/x.js?token=secret',
          'document-uri': 'https://alexendros.dev/contacto/?ref=secret#form',
          'script-sample': 'alert(1)',
          'original-policy': 'default-src self'
        }
      })
    ).toEqual({
      'violated-directive': 'script-src',
      'blocked-uri': 'https://evil.example',
      'document-uri': 'https://alexendros.dev'
    });
  });
});

describe('handleCspReportPost', () => {
  it('loguea solo campos seguros y responde 204', async () => {
    const log = vi.fn();
    const body = JSON.stringify({
      'csp-report': {
        'violated-directive': 'script-src',
        'blocked-uri': 'https://evil.example/x.js',
        'document-uri': 'https://alexendros.dev/',
        'script-sample': 'alert(1)'
      }
    });
    const res = await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report' },
        body
      }),
      log
    );
    expect(res.status).toBe(204);
    expect(log).toHaveBeenCalledOnce();
    const detail = log.mock.calls[0]?.[1] as string;
    expect(detail).toContain('script-src');
    expect(detail).not.toContain('script-sample');
    expect(detail).not.toContain('alert(1)');
  });

  const report = {
    type: 'csp-violation',
    body: { effectiveDirective: 'script-src', blockedURL: 'https://example.org/a?secret=x' }
  };

  it.each([
    [[report], 1],
    [[{ ...report, type: 'deprecation' }, report, null], 1],
    [Array(MAX_CSP_REPORTS_PER_REQUEST + 1).fill(report), 0]
  ])('procesa los informes CSP dentro del límite del lote', async (batch, count) => {
    const log = vi.fn();
    const increment = vi.fn(async () => ({ count: 1, overflow: false }));
    const res = await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/reports+json' },
        body: JSON.stringify(batch)
      }),
      log,
      { signals: { store: { increment }, sendAlert: vi.fn() } }
    );
    expect(res.status).toBe(204);
    expect(increment).toHaveBeenCalledTimes(count);
    expect(log).toHaveBeenCalledTimes(count);
    if (count)
      expect(log).toHaveBeenCalledWith(
        '[csp-report]',
        JSON.stringify({
          'violated-directive': 'script-src',
          'blocked-uri': 'https://example.org'
        })
      );
  });

  it('descarta el lote en silencio si el limitador agota el tiempo', async () => {
    const log = vi.fn();
    const increment = vi.fn();
    const res = await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/reports+json' },
        body: JSON.stringify([report])
      }),
      log,
      {
        rateLimit: async () => ({ success: true, reason: 'timeout' }),
        signals: { store: { increment }, sendAlert: vi.fn() }
      }
    );
    expect(res.status).toBe(204);
    expect(log).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
  });

  it('rechaza en silencio Content-Type incorrecto', async () => {
    const log = vi.fn();
    const res = await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'csp-report': { 'violated-directive': 'script-src' } })
      }),
      log
    );
    expect(res.status).toBe(204);
    expect(log).not.toHaveBeenCalled();
  });

  it('no loguea cuerpo oversized (Content-Length)', async () => {
    const log = vi.fn();
    const text = vi.fn(async () => 'should-not-read');
    const req = {
      headers: {
        get(name: string) {
          const key = name.toLowerCase();
          if (key === 'content-length') return String(MAX_CSP_REPORT_BYTES + 1);
          if (key === 'content-type') return 'application/csp-report';
          return null;
        }
      },
      text
    } as unknown as Request;
    const res = await handleCspReportPost(req, log);
    expect(res.status).toBe(204);
    expect(text).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      '[csp-report]',
      `oversized_content_length:${MAX_CSP_REPORT_BYTES + 1}`
    );
  });

  it('no loguea cuerpo oversized leído', async () => {
    const log = vi.fn();
    const big = 'á'.repeat(MAX_CSP_REPORT_BYTES / 2 + 1);
    const res = await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report' },
        body: big
      }),
      log
    );
    expect(res.status).toBe(204);
    expect(log).toHaveBeenCalledWith('[csp-report]', 'oversized_body');
  });

  it('ignora JSON inválido sin fallar', async () => {
    const log = vi.fn();
    const res = await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/reports+json' },
        body: 'not-json'
      }),
      log
    );
    expect(res.status).toBe(204);
    expect(log).not.toHaveBeenCalled();
  });

  it('respeta rate-limit sin loguear el cuerpo', async () => {
    const log = vi.fn();
    const rateLimit = vi.fn(async () => ({ success: false }));
    const res = await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report', 'x-real-ip': '1.1.1.1' },
        body: JSON.stringify({ 'csp-report': { 'violated-directive': 'script-src' } })
      }),
      log,
      { rateLimit }
    );
    expect(res.status).toBe(204);
    expect(rateLimit).toHaveBeenCalledWith('1.1.1.1');
    expect(log).toHaveBeenCalledWith('[csp-report]', 'rate_limited');
  });

  it('sin x-real-ip usa el cubo fijo anon:csp-report', async () => {
    const log = vi.fn();
    const rateLimit = vi.fn(async () => ({ success: true }));
    await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report' },
        body: JSON.stringify({ 'csp-report': { 'violated-directive': 'script-src' } })
      }),
      log,
      { rateLimit, clientIp: () => '' }
    );
    expect(rateLimit).toHaveBeenCalledWith('anon:csp-report');
  });
});
