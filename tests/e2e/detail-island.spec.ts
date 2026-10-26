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

test('DI-03: Esc cierra el dialog y restaura el índice', async ({ page }) => {
  await page.goto('/servicios');
  const cardLink = page.locator('[data-services-grid] a[href^="/servicios/"]').first();
  await cardLink.click();
  const dialog = page.locator('dialog[data-detail-island][open]');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/servicios\/?$/);
});

test('DI-04: tras cerrar, Atrás no reabre la ficha', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Catálogo de servicios' }).click();
  await expect(page).toHaveURL(/\/servicios/);

  const cardLink = page.locator('[data-services-grid] a[href^="/servicios/"]').first();
  await cardLink.click();
  const dialog = page.locator('dialog[data-detail-island][open]');
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Cerrar' }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/servicios\/?(?:\?.*)?$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/(?:\?.*)?$/);
  await expect(page.locator('dialog[data-detail-island][open]')).toHaveCount(0);
});

test('DI-05: al cerrar el foco vuelve al enlace de la tarjeta', async ({ page }) => {
  await page.goto('/servicios');
  const cardLink = page.locator('[data-services-grid] a[href^="/servicios/"]').first();
  await cardLink.click();
  const dialog = page.locator('dialog[data-detail-island][open]');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cerrar' }).click();
  await expect(dialog).toBeHidden();
  await expect(cardLink).toBeFocused();
});

test('DI-06: clic en el backdrop cierra el dialog', async ({ page }) => {
  await page.goto('/servicios');
  const cardLink = page.locator('[data-services-grid] a[href^="/servicios/"]').first();
  await cardLink.click();
  const dialog = page.locator('dialog[data-detail-island][open]');
  await expect(dialog).toBeVisible();
  // Simula clic en el backdrop: event.target === dialog (no un hijo).
  await dialog.evaluate((el) => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/servicios\/?(?:\?.*)?$/);
});
