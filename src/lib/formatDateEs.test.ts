import { describe, expect, it } from 'vitest';
import { formatDateEs } from './formatDateEs';

describe('formatDateEs', () => {
  it('formatea YYYY-MM-DD en español sin desplazar el día', () => {
    expect(formatDateEs('2026-11-17')).toBe('17 de noviembre de 2026');
  });

  it('rechaza fechas inválidas', () => {
    expect(() => formatDateEs('17/11/2026')).toThrow(/YYYY-MM-DD/);
  });
});
