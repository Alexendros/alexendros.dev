import { test, expect } from '@playwright/test';

async function paintedBackground(page: import('@playwright/test').Page): Promise<string> {
  return page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--bg)';
    document.body.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
}

test('el selector de tema actualiza data-theme y theme-color', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const toggle = page.getByRole('button', { name: /^Tema:/ });
  const metas = page.locator('meta[name="theme-color"]');
  await expect(metas).toHaveCount(2);

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'alexlight');
  const lightMeta = await metas.nth(0).getAttribute('content');
  expect(lightMeta).toBeTruthy();
  await expect(metas.nth(1)).toHaveAttribute('content', lightMeta!);

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'alexdark');
  const darkMeta = await metas.nth(0).getAttribute('content');
  expect(darkMeta).toBeTruthy();
  expect(darkMeta).not.toBe(lightMeta);
  await expect(metas.nth(1)).toHaveAttribute('content', darkMeta!);

  await toggle.click();
  await expect(html).not.toHaveAttribute('data-theme', /.+/);
  await expect(metas.nth(0)).toHaveAttribute('content', lightMeta!);
  await expect(metas.nth(1)).toHaveAttribute('content', darkMeta!);
});

test('el tema guardado se aplica antes del paint', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'alexdark');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'alexdark');
  await expect(page.locator('meta[name="theme-color"]').nth(0)).not.toHaveAttribute('content', '');
});

test('el tema forzado aplica también las variables semánticas', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /^Tema:/ });
  await toggle.click();
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'alexdark');
  const darkBg = await paintedBackground(page);
  await toggle.click();
  const lightBg = await paintedBackground(page);
  expect(darkBg).not.toBe(lightBg);
});
