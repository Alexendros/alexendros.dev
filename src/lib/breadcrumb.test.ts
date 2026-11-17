import { describe, expect, it } from 'vitest';
import { site } from '../content/site';
import { breadcrumbFromHome, breadcrumbList } from './breadcrumb';

describe('breadcrumbList', () => {
  it('emite BreadcrumbList con posiciones 1..n y URLs absolutas del apex', () => {
    const node = breadcrumbList([
      { name: 'Inicio', path: '/' },
      { name: 'Servicios', path: '/servicios/' },
      { name: 'Colaboración', path: '/servicios/software-a-medida/' }
    ]);
    expect(node['@type']).toBe('BreadcrumbList');
    const items = node.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(items[0]?.item).toBe(`${site.url}/`);
    expect(items[1]?.item).toBe(`${site.url}/servicios/`);
    expect(items[2]?.item).toBe(`${site.url}/servicios/software-a-medida/`);
  });

  it('breadcrumbFromHome antepone Inicio', () => {
    const node = breadcrumbFromHome({ name: 'Contacto', path: '/contacto/' });
    const items = node.itemListElement as Array<Record<string, unknown>>;
    expect(items[0]?.name).toBe('Inicio');
    expect(items[1]?.name).toBe('Contacto');
  });

  it('rechaza rutas sin barra inicial', () => {
    expect(() => breadcrumbList([{ name: 'X', path: 'servicios/' }])).toThrow(/inválido/);
  });
});
