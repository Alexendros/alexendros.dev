import { test, expect } from '@playwright/test';

test('DI-02: /referencias navega a la ficha completa', async ({ page }) => {
  await page.goto('/referencias/');
  const cardLink = page.locator('main a[href^="/referencias/"]').first();
  const href = await cardLink.getAttribute('href');
  expect(href).toMatch(/^\/referencias\/.+\//);
  await cardLink.click();
  await expect(page).toHaveURL(new RegExp(`${href?.replace(/\//g, '\\/')}?$`));
  await expect(page.locator('dialog[data-detail-island]')).toHaveCount(0);
  await expect(page.locator('main h1')).toBeVisible();
});
