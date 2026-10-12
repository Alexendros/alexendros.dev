import { describe, expect, it } from 'vitest';
import { projects } from './projects';

describe('disponibilidad de publicaciones', () => {
  it('asigna sí|no|reservado a cada obra', () => {
    const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p.availability]));
    expect(bySlug['front-valencia']).toBe('si');
    expect(bySlug['graficas-nasve']).toBe('si');
    expect(bySlug['zedazo']).toBe('reservado');
    expect(bySlug['alexendros-me']).toBe('no');
  });
});
