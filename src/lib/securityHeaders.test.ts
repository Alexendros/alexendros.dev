import { describe, expect, it } from 'vitest';
import { CSP_REPORT_URI } from './csp';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Regresión: si se relajan CSP / frame-ancestors / HSTS en vercel.json,
 * este test falla. Complementa el threat-model (ASVS L1 cabeceras).
 */
describe('security headers (vercel.json)', () => {
  const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
    headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
  };

  const headers = config.headers ?? [];
  const globalHeaders = headers.find((h) => h.source === '/(.*)')?.headers ?? [];
  const byKey = Object.fromEntries(globalHeaders.map((h) => [h.key.toLowerCase(), h.value]));

  it('deja Cache-Control immutable de /_astro y /_image después del catch-all', () => {
    const catchIdx = headers.findIndex((h) => h.source === '/(.*)');
    const astroIdx = headers.findIndex((h) => h.source === '/_astro/(.*)');
    const imageIdx = headers.findIndex((h) => h.source === '/_image(.*)');
    expect(catchIdx).toBeGreaterThanOrEqual(0);
    expect(astroIdx).toBeGreaterThan(catchIdx);
    expect(imageIdx).toBeGreaterThan(catchIdx);
    const astroCc = headers[astroIdx]?.headers.find(
      (h) => h.key.toLowerCase() === 'cache-control'
    )?.value;
    const imageCc = headers[imageIdx]?.headers.find(
      (h) => h.key.toLowerCase() === 'cache-control'
    )?.value;
    expect(astroCc).toBe('public, max-age=31536000, immutable');
    expect(imageCc).toBe('public, max-age=31536000, immutable');
  });

  it('exige CSP con frame-ancestors none, sin unsafe-eval ni unsafe-inline', () => {
    const csp = byKey['content-security-policy'] ?? '';
    expect(csp).toMatch(/frame-ancestors\s+'none'/);
    expect(csp).not.toMatch(/unsafe-eval/);
    expect(csp).not.toMatch(/unsafe-inline/);
    expect(csp).toMatch(/va\.vercel-scripts\.com/);
    expect(csp).not.toMatch(/googletagmanager|facebook|clarity|posthog|licdn/i);
  });

  it('exige X-Frame-Options DENY y HSTS con preload', () => {
    expect(byKey['x-frame-options']?.toUpperCase()).toBe('DENY');
    expect(byKey['strict-transport-security'] ?? '').toMatch(/max-age=\d+/);
    expect(byKey['strict-transport-security'] ?? '').toMatch(/preload/i);
  });

  it('exige Referrer-Policy y X-Content-Type-Options', () => {
    expect(byKey['x-content-type-options']?.toLowerCase()).toBe('nosniff');
    expect(byKey['referrer-policy']).toBeTruthy();
  });

  it('observa una CSP Report-Only sin unsafe-inline', () => {
    const reportOnly = byKey['content-security-policy-report-only'] ?? '';
    expect(reportOnly).toContain(`report-uri ${CSP_REPORT_URI}`);
    expect(reportOnly).toContain('report-uri /api/csp-report/');
    expect(reportOnly).not.toMatch(/unsafe-inline/);
    expect(reportOnly).not.toMatch(/unsafe-eval/);
    expect(reportOnly).toMatch(/frame-ancestors\s+'none'/);
  });
});
