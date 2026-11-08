import { describe, expect, it } from 'vitest';
import { catalogoPromocional } from './catalogo';

describe('catálogo promocional', () => {
  it('publica al menos tres ítems con ids únicos y sin precio', () => {
    expect(catalogoPromocional.length).toBeGreaterThanOrEqual(3);
    const ids = catalogoPromocional.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(catalogoPromocional.every((item) => item.precioOpcional === undefined)).toBe(true);
  });
});
