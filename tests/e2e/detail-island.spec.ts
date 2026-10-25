import { test, expect } from '@playwright/test';

test('DI-01: /servicios abre ficha en dialog y actualiza la URL', async ({ page }) => {
  await page.goto('/servicios');
  const cardLink = page.locator('[data-services-grid] a[href^="/servicios/"]').first();
  const href = await cardLink.getAttribute('href');
  expect(href).toMatch(/^\/servicios\/.+/);

  await cardLink.click();
  const dialog = page.locator('dialog[data-detail-island][open]');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(href!);
  await dialog.getByRole('button', { name: 'Cerrar' }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/servicios\/?$/);
});

test('DI-02: /proyectos abre ficha en dialog', async ({ page }) => {
  await page.goto('/proyectos');
  const cardLink = page.locator('main a[href^="/proyectos/"]').first();
  await cardLink.click();
  const dialog = page.locator('dialog[data-detail-island][open]');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/proyectos\/.+/);
});
