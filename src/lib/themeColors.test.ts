import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { THEME_BG_LIGHT, THEME_BG_DARK } from './themeColors';

const palette = readFileSync(resolve(process.cwd(), 'src/styles/design-references.css'), 'utf8');

describe('theme-color derivado de la paleta Atlaps', () => {
  it('usa las propiedades de fondo aprobadas', () => {
    expect(THEME_BG_LIGHT).toBe('--ds-atlaps-paper-bone');
    expect(THEME_BG_DARK).toBe('--ds-atlaps-blueprint-deep');
    expect(palette).toContain(`${THEME_BG_LIGHT}:`);
    expect(palette).toContain(`${THEME_BG_DARK}:`);
  });

  it('no duplica literales cromáticos en la sincronización', () => {
    for (const file of [
      'src/lib/themeColors.ts',
      'src/layouts/Layout.astro',
      'src/scripts/themeToggle.ts',
      'public/theme-init.js'
    ]) {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');
      expect(source.match(/#[0-9a-fA-F]{3,8}\b/g), file).toBeNull();
    }
  });

  it('Layout extrae los valores de la paleta en el build', () => {
    const layout = readFileSync(resolve(process.cwd(), 'src/layouts/Layout.astro'), 'utf8');
    expect(layout).toContain('paletteColor(THEME_BG_LIGHT)');
    expect(layout).toContain('paletteColor(THEME_BG_DARK)');
    expect(layout).toContain('design-references.css?raw');
  });
});
