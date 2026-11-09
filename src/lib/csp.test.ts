import { describe, expect, it } from 'vitest';
import { buildCsp, CSP_REPORT_URI } from './csp';

describe('buildCsp', () => {
  it('no emite unsafe-inline en la política endurecida', () => {
    const policy = buildCsp();
    expect(policy).not.toMatch(/unsafe-inline/);
    expect(policy).not.toMatch(/unsafe-eval/);
    expect(policy).toMatch(/script-src 'self'/);
    expect(policy).toMatch(/style-src 'self'/);
  });

  it('canonicaliza el endpoint para evitar el redirect de trailingSlash', () => {
    expect(CSP_REPORT_URI).toBe('/api/csp-report/');
    const policy = buildCsp({ reportUri: CSP_REPORT_URI });
    expect(policy).toContain(`report-uri ${CSP_REPORT_URI};`);
    expect(policy).not.toMatch(/unsafe-inline/);
  });
});
