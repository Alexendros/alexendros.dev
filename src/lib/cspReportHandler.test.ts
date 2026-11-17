import { describe, expect, it, vi } from 'vitest';
import { handleCspReportPost, MAX_CSP_REPORT_BYTES } from './cspReportHandler';

describe('handleCspReportPost', () => {
  it('loguea JSON válido y responde 204', async () => {
    const log = vi.fn();
    const body = JSON.stringify({ 'csp-report': { 'violated-directive': 'script-src' } });
    const res = await handleCspReportPost(
      new Request('https://alexendros.dev/api/csp-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      }),
      log
    );
    expect(res.status).toBe(204);
    expect(log).toHaveBeenCalledWith('[csp-report]', body);
  });

  it('no loguea cuerpo oversized (Content-Length)', async () => {
    const log = vi.fn();
    const text = vi.fn(async () => 'should-not-read');
    const req = {
      headers: {
        get(name: string) {
          return name.toLowerCase() === 'content-length' ? String(MAX_CSP_REPORT_BYTES + 1) : null;
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
        body: 'not-json'
      }),
      log
    );
    expect(res.status).toBe(204);
    expect(log).not.toHaveBeenCalled();
  });
});
