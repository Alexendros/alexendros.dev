import { describe, expect, it } from 'vitest';
import { allowedThirdPartyHosts, cspOrigins, privacyProcessors } from './processors';

describe('processors', () => {
  it('incluye Proton, Upstash, Vercel hosting y medición', () => {
    const ids = privacyProcessors()
      .map((p) => p.id)
      .sort();
    expect(ids).toEqual([
      'proton',
      'upstash',
      'vercel-analytics',
      'vercel-hosting',
      'vercel-speed-insights'
    ]);
  });

  it('solo autoriza hosts de Vercel Analytics', () => {
    expect(cspOrigins('scriptSrc')).toEqual(['https://va.vercel-scripts.com']);
    expect(allowedThirdPartyHosts()).toEqual([
      'va.vercel-scripts.com',
      'vitals.vercel-insights.com'
    ]);
  });
});
