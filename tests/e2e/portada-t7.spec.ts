import { expect, test, type Page } from '@playwright/test';

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

/** Rejilla del hero tal como queda en el navegador. */
async function heroGrid(page: Page) {
  return page.locator('main #top').evaluate((node) => {
    const grid = getComputedStyle(node, '::before');
    const surface = getComputedStyle(node);
    return {
      backgroundImage: grid.backgroundImage,
      backgroundSize: grid.backgroundSize,
      maskImage: grid.maskImage,
      surfaceImage: surface.backgroundImage,
      surfaceColor: surface.backgroundColor
    };
  });
}

async function openWithTheme(page: Page, theme: 'alexlight' | 'alexdark') {
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem('theme', selectedTheme);
  }, theme);
  await page.goto('/');
}

for (const theme of ['alexlight', 'alexdark'] as const) {
  test(`DIS-08: rejilla histórica en ${theme} y retirada con contraste forzado`, async ({
    page
  }) => {
    await openWithTheme(page, theme);
    const grid = await heroGrid(page);

    // Dos capas: celda fina de 22 px y mayor de 120 px.
    expect(grid.backgroundSize).toContain('22px 22px');
    expect(grid.backgroundSize).toContain('120px 120px');
    expect(grid.backgroundImage.split('linear-gradient').length - 1).toBe(4);
    // Desvanecido arriba y abajo: nunca acaba en línea dura.
    expect(grid.maskImage).toContain('linear-gradient');
    expect(grid.maskImage).not.toBe('none');
    // Fondo plano bajo la rejilla.
    expect(grid.surfaceImage).toBe('none');
    expect(grid.surfaceColor).not.toBe('rgba(0, 0, 0, 0)');

    const hero = page.locator('main #top');
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

test('DIS-08: las líneas siguen el tema del sitio, no prefers-color-scheme', async ({ page }) => {
  await openWithTheme(page, 'alexlight');
  const light = await heroGrid(page);
  await openWithTheme(page, 'alexdark');
  const dark = await heroGrid(page);
  expect(dark.backgroundImage).not.toBe(light.backgroundImage);

  // Sin data-theme (modo sistema), el tema oscuro del sitio da las mismas
  // líneas que alexdark: el color sale de tokens, no de una media query.
  const system = await page.context().newPage();
  await system.emulateMedia({ colorScheme: 'dark' });
  await system.goto('/');
  expect((await heroGrid(system)).backgroundImage).toBe(dark.backgroundImage);
  await system.close();
});
