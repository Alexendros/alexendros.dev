import { describe, expect, it } from 'vitest';
import { nextThemeMode } from './themeToggle';

describe('nextThemeMode', () => {
  it('cicla sistema → claro → oscuro → sistema', () => {
    expect(nextThemeMode('system')).toBe('alexlight');
    expect(nextThemeMode('alexlight')).toBe('alexdark');
    expect(nextThemeMode('alexdark')).toBe('system');
  });
});
