import { test, expect } from '@playwright/test';

test('DI-02: /referencias abre ficha en dialog', async ({ page }) => {
  await page.goto('/referencias');
  const cardLink = page.locator('main a[href^="/referencias/"]').first();
  await cardLink.click();
  const dialog = page.locator('dialog[data-detail-island][open]');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/referencias\/.+/);
});
