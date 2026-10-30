import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/servicios',
  '/servicios/informe-comercial',
  '/servicios/cumplimiento-normativo',
  '/servicios/ciberseguridad',
  '/referencias',
  '/referencias/front-valencia',
  '/metodo',
  '/identidad',
  '/contacto',
  '/cookies',
  '/privacidad'
];

for (const route of routes) {
  test(`a11y ${route} - 0 violaciones`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations,
      `Violaciones en ${route}: ${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([]);
  });
}
