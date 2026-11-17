import { describe, expect, it, vi } from 'vitest';
import { handleCspReportPost, MAX_CSP_REPORT_BYTES, summarizeCspReport } from './cspReportHandler';

describe('summarizeCspReport', () => {
  it('extrae solo campos seguros del informe legacy', () => {
    expect(
      summarizeCspReport({
        'csp-report': {
          'violated-directive': 'script-src',
          'blocked-uri': 'https://evil.example/x.js',
          'document-uri': 'https://alexendros.dev/',
          'script-sample': 'alert(1)',
          'original-policy': 'default-src self'
        }
      })
    ).toEqual({
      'violated-directive': 'script-src',
      'blocked-uri': 'https://evil.example/x.js',
      'document-uri': 'https://alexendros.dev/'
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
    const big = 'a'.repeat(MAX_CSP_REPORT_BYTES + 10);
    const res = await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report' },
        body: big
      }),
      log
    );
    expect(res.status).toBe(204);
    expect(log).toHaveBeenCalledWith('[csp-report]', `oversized_body:${big.length}`);
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
});
