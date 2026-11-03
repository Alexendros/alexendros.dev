import { test, expect } from '@playwright/test';

test('el selector de tema actualiza data-theme y theme-color', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const toggle = page.getByRole('button', { name: /^Tema:/ });
  const metas = page.locator('meta[name="theme-color"]');
  await expect(metas).toHaveCount(2);

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'alexlight');
  await expect(metas.nth(0)).toHaveAttribute('content', '#f6f8fc');
  await expect(metas.nth(1)).toHaveAttribute('content', '#f6f8fc');

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'alexdark');
  await expect(metas.nth(0)).toHaveAttribute('content', '#0a1224');
  await expect(metas.nth(1)).toHaveAttribute('content', '#0a1224');

  await toggle.click();
  await expect(html).not.toHaveAttribute('data-theme', /.+/);
  await expect(metas.nth(0)).toHaveAttribute('content', '#f6f8fc');
  await expect(metas.nth(1)).toHaveAttribute('content', '#0a1224');
});

test('el tema guardado se aplica antes del paint', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'alexdark');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'alexdark');
  await expect(page.locator('meta[name="theme-color"]').nth(0)).toHaveAttribute(
    'content',
    '#0a1224'
  );
});

test('el tema forzado aplica también los tokens semánticos', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /^Tema:/ });
  await toggle.click();
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'alexdark');
  const darkBg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  );
  expect(darkBg).toBe('#0a1224');
  await toggle.click();
  const lightBg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  );
  expect(lightBg).toBe('#f6f8fc');
});
