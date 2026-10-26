import { describe, expect, it } from 'vitest';
import { normalizePathname, pathMatches } from './pathMatch';

describe('normalizePathname', () => {
  it('recorta la barra final salvo en la raíz', () => {
    expect(normalizePathname('/')).toBe('/');
    expect(normalizePathname('/metodo/')).toBe('/metodo');
    expect(normalizePathname('/metodo')).toBe('/metodo');
  });
});

describe('pathMatches', () => {
  it('acepta exacto y descendiente con o sin barra final', () => {
    expect(pathMatches('/metodo', '/metodo')).toBe(true);
    expect(pathMatches('/metodo/', '/metodo')).toBe(true);
    expect(pathMatches('/metodo/extra', '/metodo')).toBe(true);
    expect(pathMatches('/metodologia', '/metodo')).toBe(false);
    expect(pathMatches('/contacto', '/contacto/')).toBe(true);
  });
});
