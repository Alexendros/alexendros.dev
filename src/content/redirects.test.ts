import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Redirect = { source: string; destination: string; permanent?: boolean; has?: unknown[] };

describe('redirecciones permanentes', () => {
  it('R08: vercel.json redirige las rutas retiradas al destino canónico', () => {
    const raw = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
      redirects: Redirect[];
    };
    const unconditional = raw.redirects.filter((r) => !r.has);
    const bySource = new Map(unconditional.map((r) => [r.source, r]));

    const expected: Array<[string, string]> = [
      ['/metodologia', '/proceso-y-entrega'],
      ['/metodologia/', '/proceso-y-entrega'],
      ['/valores', '/proceso-y-entrega'],
      ['/valores/', '/proceso-y-entrega'],
      ['/como-trabajo', '/proceso-y-entrega'],
      ['/como-trabajo/', '/proceso-y-entrega'],
      ['/aviso-legal', '/identidad'],
      ['/afiliados', '/'],
      ['/servicios/produccion-sitios-web', '/servicios'],
      ['/servicios/auditorias', '/servicios/informe-comercial'],
      ['/servicios/consultoria-tecnologica', '/servicios'],
      ['/servicios/landing-10-dias', '/servicios'],
      ['/servicios/sesion-profesional', '/servicios'],
      ['/servicios/sesion-profesional/', '/servicios'],
      ['/servicios/auditoria-normativa-ciberseguridad', '/servicios/cumplimiento-normativo'],
      ['/servicios/auditoria-normativa-ciberseguridad/', '/servicios/cumplimiento-normativo']
    ];

    for (const [source, destination] of expected) {
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe(destination);
      expect(rule?.permanent).toBe(true);
    }

    expect(bySource.has('/sobre-mi')).toBe(false);
    expect(bySource.has('/sobre-mi/')).toBe(false);

    const retired = [
      '/metodologia',
      '/metodologia/',
      '/valores',
      '/valores/',
      '/como-trabajo',
      '/como-trabajo/'
    ];
    for (const source of retired) {
      const matches = unconditional.filter((r) => r.source === source);
      expect(matches, `una sola regla para ${source}`).toHaveLength(1);
      expect(matches[0]?.destination).toBe('/proceso-y-entrega');
      expect(retired).not.toContain(matches[0]?.destination);
    }

    const destinations = new Set(unconditional.map((r) => r.destination));
    for (const source of retired) {
      expect(destinations.has(source), `${source} no debe ser destino`).toBe(false);
    }
  });

  it('las páginas retiradas ya no existen; sobre-mi y proceso sí', () => {
    expect(existsSync(resolve(process.cwd(), 'src/pages/metodologia.astro'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/pages/valores.astro'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/pages/proceso-y-entrega.astro'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'src/pages/sobre-mi.astro'))).toBe(true);
  });
});
