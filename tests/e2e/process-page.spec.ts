import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const route = '/proceso-y-entrega';

for (const width of [320, 390, 768, 1280]) {
  test(`proceso: contenido y reflow a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(/Un proceso claro\.\s*Una entrega comprobable\./);
    await expect(page.locator('main a[href="/contacto"]').first()).toBeVisible();
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(overflows).toBe(false);
  });
}

for (const scheme of ['light', 'dark'] as const) {
  test(`proceso: axe en ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('proceso: contenido esencial sin JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}${route}`);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#proceso')).toBeVisible();
  await expect(page.locator('main a[href="/contacto"]').first()).toBeVisible();
  await context.close();
});

test('proceso: ancla bajo la cabecera y sticky ausente', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(route);
  await expect(page.locator('#sticky-cta')).toHaveCount(0);

  await page.getByRole('link', { name: 'Ver el proceso' }).click();
  await expect(page.locator('#proceso')).toBeInViewport();

  const clearance = await page.evaluate(() => {
    const section = document.getElementById('proceso');
    const header = document.getElementById('site-header');
    if (!section || !header) return null;
    const sectionTop = section.getBoundingClientRect().top;
    const headerBottom = header.getBoundingClientRect().bottom;
    return { sectionTop, headerBottom };
  });
  expect(clearance).not.toBeNull();
  expect(clearance!.sectionTop).toBeGreaterThanOrEqual(clearance!.headerBottom - 1);
});

test('proceso: FAQ abre con teclado', async ({ page }) => {
  await page.goto(route);
  const firstSummary = page.locator('.delivery-details summary').first();
  await firstSummary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.delivery-details details').first()).toHaveAttribute('open', '');
});
