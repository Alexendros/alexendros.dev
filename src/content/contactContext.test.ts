import { describe, expect, it } from 'vitest';
import {
  contactProjectOptions,
  normalizeProjectSlug,
  normalizeServiceSlug,
  PUBLISHED_PROJECT_SLUGS,
  contactServiceOptions
} from './contactContext';
import { projects } from './projects';
import { PUBLISHED_SERVICE_SLUGS } from './services';

describe('contactContext allowlists', () => {
  it('acepta solo slugs publicados', () => {
    expect(normalizeServiceSlug('informe-comercial')).toBe('informe-comercial');
    expect(normalizeServiceSlug('nope')).toBeUndefined();
    expect(normalizeProjectSlug('zedazo')).toBe('zedazo');
    expect(normalizeProjectSlug('')).toBeUndefined();
  });

  it('las opciones incluyen Portal web y el catálogo publicado', () => {
    expect(contactServiceOptions.map((o) => o.slug)).toEqual([
      'portal-web',
      ...PUBLISHED_SERVICE_SLUGS
    ]);
    expect(normalizeServiceSlug('portal-web')).toBe('portal-web');
    expect(PUBLISHED_PROJECT_SLUGS).toHaveLength(4);
  });

  it('los títulos de obra del formulario no se desalinean del catálogo', () => {
    const bySlug = Object.fromEntries(projects.map((project) => [project.slug, project.title]));
    for (const option of contactProjectOptions) {
      expect(option.title, option.slug).toBe(bySlug[option.slug]);
    }
    expect(contactProjectOptions.map((o) => o.slug)).toEqual([...PUBLISHED_PROJECT_SLUGS]);
  });
});
