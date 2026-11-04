import { expect, test } from '@playwright/test';

test('DIS-04: la portada no muestra el bloque de compromisos', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main .commitment-item')).toHaveCount(0);
  await expect(
    page.locator('main').getByRole('heading', { name: 'Compromisos antes de empezar' })
  ).toHaveCount(0);
});

for (const width of [390, 1280]) {
  test(`DIS-07: titular dentro del clamp a ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const fontSize = await page
      .locator('main h1')
      .evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
    const expected = Math.min(60, Math.max(36, 25.6 + width * 0.026));
    expect(fontSize).toBeCloseTo(expected, 1);
  });
}

for (const theme of ['alexlight', 'alexdark'] as const) {
  test(`DIS-08: rejilla blueprint en ${theme} y retirada con contraste forzado`, async ({
    page
  }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('theme', selectedTheme);
    }, theme);
    await page.goto('/');
    const hero = page.locator('main #top');
    const background = await hero.evaluate(
      (node) => getComputedStyle(node, '::before').backgroundImage
    );
    expect(background).toContain('linear-gradient');

    await page.emulateMedia({ contrast: 'more' });
    await expect
      .poll(() => hero.evaluate((node) => getComputedStyle(node, '::before').backgroundImage))
      .toBe('none');
    await page.emulateMedia({ contrast: 'no-preference', forcedColors: 'active' });
    await expect
      .poll(() => hero.evaluate((node) => getComputedStyle(node, '::before').backgroundImage))
      .toBe('none');
  });
}
