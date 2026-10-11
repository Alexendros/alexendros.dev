import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Redirect = { source: string; destination: string; permanent?: boolean };

describe('redirecciones permanentes', () => {
  it('R08: vercel.json redirige las rutas retiradas', () => {
    const raw = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
      redirects: Redirect[];
    };
    const bySource = new Map(raw.redirects.map((r) => [r.source, r]));

    const expected: Array<[string, string]> = [
      ['/como-trabajo', '/metodologia'],
      ['/sobre-mi', '/valores'],
      ['/aviso-legal', '/identidad'],
      ['/afiliados', '/']
    ];

    for (const [source, destination] of expected) {
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe(destination);
      expect(rule?.permanent).toBe(true);
    }
  });
});
