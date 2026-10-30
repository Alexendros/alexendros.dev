import { describe, expect, it } from 'vitest';
import { site } from './site';

describe('navegación y pie públicos', () => {
  it('R06: site.nav es Servicios profesionales, Proyectos realizados, Metodología clara', () => {
    expect(site.nav.map((i) => i.label)).toEqual([
      'Servicios profesionales',
      'Proyectos realizados',
      'Metodología clara'
    ]);
    expect(site.nav.map((i) => i.href)).toEqual(['/servicios', '/proyectos', '/metodo']);
    expect(site.nav.map((i) => i.href)).not.toContain('/metodologia');
    expect(site.nav.map((i) => i.href)).not.toContain('/valores');
    expect(site.nav.map((i) => i.href)).not.toContain('/proceso-y-entrega');
  });

  it('R07: el pie usa contratacion@ y no incluye Afiliados ni Sobre mí', () => {
    expect(site.social.email).toBe('mailto:contratacion@alexendros.dev');
    expect(site.footerNav.map((i) => i.label)).not.toContain('Afiliados');
    expect(site.footerNav.some((i) => i.href.includes('afiliados'))).toBe(false);
    expect(site.footerNav.map((i) => i.label)).toEqual([
      'Identidad',
      'Privacidad',
      'Cookies',
      'Accesibilidad'
    ]);
    expect(site.footerExtraNav.map((i) => i.label)).toEqual(['Contacto']);
    expect(site.footerExtraNav.map((i) => i.href)).not.toContain('/sobre-mi');
  });
});
