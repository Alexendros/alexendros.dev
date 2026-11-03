import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractThemes } from './contrast-lib.mjs';

describe('extractThemes', () => {
  it('extrae y compara las variantes alexdark reales del sistema', () => {
    const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
    const { dark, darkConsistent, darkPartial } = extractThemes(css);

    expect(darkPartial).toBe(false);
    expect(darkConsistent).toBe(true);
    expect(dark).toMatchObject({ bg: '#0a1224', card: '#101c38' });
  });
});
