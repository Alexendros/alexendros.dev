import { describe, expect, it } from 'vitest';
import {
  normalizeProjectSlug,
  normalizeServiceSlug,
  PUBLISHED_PROJECT_SLUGS,
  contactServiceOptions
} from './contactContext';
import { PUBLISHED_SERVICE_SLUGS } from './services';

describe('contactContext allowlists', () => {
  it('acepta solo slugs publicados', () => {
    expect(normalizeServiceSlug('informe-comercial')).toBe('informe-comercial');
    expect(normalizeServiceSlug('nope')).toBeUndefined();
    expect(normalizeProjectSlug('zedazo')).toBe('zedazo');
    expect(normalizeProjectSlug('')).toBeUndefined();
  });

  it('las opciones de servicio coinciden con el catálogo publicado', () => {
    expect(contactServiceOptions.map((o) => o.slug)).toEqual([...PUBLISHED_SERVICE_SLUGS]);
    expect(PUBLISHED_PROJECT_SLUGS).toHaveLength(4);
  });
});
