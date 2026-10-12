import { test, expect } from '@playwright/test';

test('F05: no hay modal de salida ni oferta de informe al abandonar', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.dispatchEvent(new Event('alexendros:exit-intent'));
  });
  await page.waitForTimeout(400);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText(/SI TIENES UN NEGOCIO/i)).toHaveCount(0);
  await expect(page.getByText(/Rellenar formulario/)).toHaveCount(0);
});
