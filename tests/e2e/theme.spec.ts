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
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('theme');
    } catch {
      /* private mode */
    }
  });
  await page.goto('/');
  const html = page.locator('html');
  const toggle = page.getByRole('button', { name: /^Tema:/ });
  const metas = page.locator('meta[name="theme-color"]');
  await expect(metas).toHaveCount(2);

  // Con esquema claro, el primer clic salta a oscuro para que el cambio se note.
  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'alexdark');
  const darkMeta = await metas.nth(0).getAttribute('content');
  expect(darkMeta).toBeTruthy();
  await expect(metas.nth(1)).toHaveAttribute('content', darkMeta!);

  await toggle.click();
  await expect(html).not.toHaveAttribute('data-theme', /.+/);
  const systemLight = await metas.nth(0).getAttribute('content');
  expect(systemLight).toBeTruthy();
  expect(systemLight).not.toBe(darkMeta);

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'alexdark');
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
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('theme');
    } catch {
      /* private mode */
    }
  });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /^Tema:/ });
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'alexdark');
  const darkBg = await paintedBackground(page);
  await toggle.click();
  const lightBg = await paintedBackground(page);
  expect(darkBg).not.toBe(lightBg);
});
