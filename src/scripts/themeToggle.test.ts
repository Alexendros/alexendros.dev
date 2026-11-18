import { describe, expect, it } from 'vitest';
import { labelFor, nextThemeMode, resolvesDark } from './themeToggle';

describe('resolvesDark', () => {
  it('respeta forzados y el esquema del sistema', () => {
    expect(resolvesDark('alexdark', false)).toBe(true);
    expect(resolvesDark('alexlight', true)).toBe(false);
    expect(resolvesDark('system', true)).toBe(true);
    expect(resolvesDark('system', false)).toBe(false);
  });
});

describe('nextThemeMode', () => {
  it('con OS claro: sistema → oscuro → sistema (salta claro idéntico)', () => {
    expect(nextThemeMode('system', false)).toBe('alexdark');
    expect(nextThemeMode('alexdark', false)).toBe('system');
    expect(nextThemeMode('alexlight', false)).toBe('alexdark');
  });

  it('con OS oscuro: sistema → claro → oscuro → claro (salta sistema idéntico a oscuro)', () => {
    expect(nextThemeMode('system', true)).toBe('alexlight');
    expect(nextThemeMode('alexlight', true)).toBe('alexdark');
    expect(nextThemeMode('alexdark', true)).toBe('alexlight');
  });

  it('cada paso cambia el aspecto resuelto', () => {
    for (const prefersDark of [false, true]) {
      for (const mode of ['system', 'alexlight', 'alexdark'] as const) {
        const next = nextThemeMode(mode, prefersDark);
        expect(resolvesDark(next, prefersDark)).not.toBe(resolvesDark(mode, prefersDark));
      }
    }
  });
});

describe('labelFor', () => {
  it('anuncia el destino real del siguiente clic', () => {
    expect(labelFor('system', false)).toBe('Tema: sistema. Pulsar para oscuro');
    expect(labelFor('system', true)).toBe('Tema: sistema. Pulsar para claro');
    expect(labelFor('alexdark', true)).toBe('Tema: oscuro. Pulsar para claro');
  });
});
