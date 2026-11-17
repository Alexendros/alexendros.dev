import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCsp, CSP_REPORT_URI, THEME_INIT_SOURCE } from './csp';

describe('buildCsp', () => {
  it('no emite unsafe-inline ni orígenes de trackers retirados', () => {
    const policy = buildCsp({ withHashes: true });
    expect(policy).not.toMatch(/unsafe-inline/);
    expect(policy).not.toMatch(/unsafe-eval/);
    expect(policy).not.toMatch(/googletagmanager|facebook|clarity|posthog|licdn/i);
    expect(policy).toMatch(/script-src 'self'/);
    expect(policy).toMatch(/va\.vercel-scripts\.com/);
    expect(policy).toMatch(/sha256-/);
  });

  it('THEME_INIT_SOURCE coincide con theme-init.js', () => {
    const disk = readFileSync(resolve(process.cwd(), 'src/scripts/theme-init.js'), 'utf8');
    expect(THEME_INIT_SOURCE).toBe(disk);
  });

  it('canonicaliza el endpoint para evitar el redirect de trailingSlash', () => {
    expect(CSP_REPORT_URI).toBe('/api/csp-report/');
    const policy = buildCsp({ reportUri: CSP_REPORT_URI });
    expect(policy).toContain(`report-uri ${CSP_REPORT_URI};`);
    expect(policy).not.toMatch(/unsafe-inline/);
  });
});
