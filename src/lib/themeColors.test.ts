import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { THEME_BG_LIGHT, THEME_BG_DARK } from './themeColors';

const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8');

function hexTokenValue(name: string): string | null {
  const re = new RegExp(`${name}:\\s*([#][0-9a-fA-F]{6})`);
  return re.exec(css)?.[1]?.toLowerCase() ?? null;
}

describe('themeColors sincronizado con los tokens de global.css', () => {
  it('claro coincide con --paper-50', () => {
    expect(hexTokenValue('--paper-50')).toBe('#f6f8fc');
    expect(THEME_BG_LIGHT.toLowerCase()).toBe(hexTokenValue('--paper-50'));
  });

  it('oscuro coincide con --bg del tema oscuro', () => {
    // --bg es var(--paper-50) en claro y un hex literal en oscuro.
    const darkBg = [...css.matchAll(/--bg:\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[1].toLowerCase());
    expect(darkBg.length).toBeGreaterThan(0);
    expect(darkBg).toContain('#0a1224');
    expect(THEME_BG_DARK.toLowerCase()).toBe('#0a1224');
  });

  it('theme-init.js (script previo a la pintura) usa los mismos colores', () => {
    // public/theme-init.js no puede importar TS: es una copia que debe seguir
    // sincronizada con themeColors.ts.
    const init = readFileSync(resolve(process.cwd(), 'public/theme-init.js'), 'utf8');
    const used = [...init.matchAll(/'(#[0-9a-fA-F]{6})'/g)].map((m) => m[1].toLowerCase());
    expect(used).toEqual(
      expect.arrayContaining([THEME_BG_DARK.toLowerCase(), THEME_BG_LIGHT.toLowerCase()])
    );
    expect([...new Set(used)].sort()).toEqual(
      [THEME_BG_DARK.toLowerCase(), THEME_BG_LIGHT.toLowerCase()].sort()
    );
  });
});
