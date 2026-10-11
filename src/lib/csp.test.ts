import { describe, expect, it } from 'vitest';
import { buildCsp } from './csp';

describe('buildCsp', () => {
  it('no emite unsafe-inline en la política endurecida', () => {
    const policy = buildCsp();
    expect(policy).not.toMatch(/unsafe-inline/);
    expect(policy).not.toMatch(/unsafe-eval/);
    expect(policy).toMatch(/script-src 'self'/);
    expect(policy).toMatch(/style-src 'self'/);
  });

  it('añade report-uri cuando se pide el colector', () => {
    const policy = buildCsp({ reportUri: '/api/csp-report' });
    expect(policy).toMatch(/report-uri \/api\/csp-report/);
    expect(policy).not.toMatch(/unsafe-inline/);
  });
});
