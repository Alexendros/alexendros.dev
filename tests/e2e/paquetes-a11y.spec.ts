import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const theme of ['alexlight', 'alexdark'] as const) {
  for (const route of ['/', '/servicios/', '/contacto/'] as const) {
    test(`paquetes ${route} ${theme}: contenido y axe`, async ({ page }) => {
      test.fail(route === '/servicios/', 'DIS-05: contenido retirado con paquetes activados');
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem('theme', selectedTheme);
      }, theme);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route);

      if (route === '/contacto/') {
        await expect(page.locator('input[name="via"][value="web"]')).toHaveCount(1);
        await expect(page.locator('input[name="via"][value="tienda"]')).toHaveCount(1);
        await expect(page.locator('input[name="via"][value="asistente"]')).toHaveCount(1);
      } else {
        await expect(page.locator('[data-paquete]')).toHaveCount(3);
        await expect(page.locator('[data-pick-via]')).toHaveCount(3);
        if (route === '/servicios/') {
          await expect(page.locator('[data-product-card]')).toHaveCount(1);
          await expect(page.locator('[data-product-card="software-a-medida"]')).toHaveCount(1);
          await expect(page.locator('[data-detail-island]')).toHaveCount(0);
          await expect(page.locator('[data-needs-configurator]')).toHaveCount(0);
          await expect(page.locator('#faq')).toHaveCount(0);
        }
      }

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
