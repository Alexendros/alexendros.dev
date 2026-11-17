import { describe, expect, it } from 'vitest';
import { nextThemeMode } from './themeToggle';

describe('nextThemeMode', () => {
  it('desde sistema salta al opuesto del esquema resuelto', () => {
    expect(nextThemeMode('system', false)).toBe('alexdark');
    expect(nextThemeMode('system', true)).toBe('alexlight');
  });

  it('cicla claro → oscuro → sistema', () => {
    expect(nextThemeMode('alexlight')).toBe('alexdark');
    expect(nextThemeMode('alexdark')).toBe('system');
  });
});
