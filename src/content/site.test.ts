import { describe, expect, it } from 'vitest';
import { site } from './site';

describe('navegación y pie públicos', () => {
  it('R06: site.nav es Servicios, Proyectos realizados, Cómo trabajo', () => {
    expect(site.nav.map((i) => i.label)).toEqual([
      'Servicios',
      'Proyectos realizados',
      'Cómo trabajo'
    ]);
    expect(site.nav.map((i) => i.href)).toEqual(['/servicios', '/proyectos', '/proceso-y-entrega']);
    expect(site.nav.map((i) => i.href)).not.toContain('/metodologia');
    expect(site.nav.map((i) => i.href)).not.toContain('/valores');
  });

  it('R07: el pie usa contratacion@ y no incluye Afiliados', () => {
    expect(site.social.email).toBe('mailto:contratacion@alexendros.dev');
    expect(site.footerNav.map((i) => i.label)).not.toContain('Afiliados');
    expect(site.footerNav.some((i) => i.href.includes('afiliados'))).toBe(false);
  });
});
