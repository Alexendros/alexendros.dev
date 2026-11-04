import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/accesibilidad/',
  '/articulos/presupuesto-web/',
  '/articulos/web-o-app-a-medida/',
  '/contacto/',
  '/cookies/',
  '/design-system/',
  '/experiencia/',
  '/identidad/',
  '/metodo/',
  '/privacidad/',
  '/referencias/',
  '/referencias/alexendros-me/',
  '/referencias/front-valencia/',
  '/referencias/graficas-nasve/',
  '/referencias/zedazo/',
  '/servicios/',
  '/servicios/software-a-medida/',
  '/sobre-mi/',
  '/404/'
] as const;

const themes = ['alexlight', 'alexdark'] as const;

for (const theme of themes) {
  for (const route of routes) {
    test(`a11y ${route} ${theme} - 0 violaciones`, async ({ page }) => {
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem('theme', selectedTheme);
      }, theme);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route);
      const results = await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new AxeBuilder({ page: page as any })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations,
        `Violaciones en ${route} (${theme}): ${JSON.stringify(results.violations, null, 2)}`
      ).toEqual([]);
    });
  }
}
