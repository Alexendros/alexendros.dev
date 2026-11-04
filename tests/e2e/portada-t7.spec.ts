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

/** Rejilla del plano en el fondo del cuerpo, tal como queda en el navegador. */
async function bodyGrid(page: Page) {
  return page.evaluate(() => {
    const grid = getComputedStyle(document.body, '::before');
    return {
      backgroundImage: grid.backgroundImage,
      backgroundSize: grid.backgroundSize,
      maskImage: grid.maskImage,
      position: grid.position,
      zIndex: grid.zIndex,
      pointerEvents: grid.pointerEvents,
      inset: [grid.top, grid.right, grid.bottom, grid.left].join(' ')
    };
  });
}

async function openWithTheme(page: Page, theme: 'alexlight' | 'alexdark', route = '/') {
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem('theme', selectedTheme);
  }, theme);
  await page.goto(route);
}

const GRID_ROUTES = ['/', '/servicios/', '/servicios/software-a-medida/'];

for (const theme of ['alexlight', 'alexdark'] as const) {
  test(`DIS-08: rejilla del plano en ${theme} y retirada con contraste forzado`, async ({
    page
  }) => {
    await openWithTheme(page, theme);
    const grid = await bodyGrid(page);

    // Dos capas: celda fina de 22 px y mayor de 120 px, fijas tras el contenido.
    expect(grid.backgroundSize).toContain('22px 22px');
    expect(grid.backgroundSize).toContain('120px 120px');
    expect(grid.backgroundImage.split('linear-gradient').length - 1).toBe(4);
    expect(grid.position).toBe('fixed');
    expect(grid.zIndex).toBe('-1');
    expect(grid.pointerEvents).toBe('none');
    expect(grid.inset).toBe('0px 0px 0px 0px');
    // Sin desvanecido: la rejilla es el fondo de toda la página.
    expect(grid.maskImage).toBe('none');

    await page.emulateMedia({ contrast: 'more' });
    await expect.poll(() => bodyGrid(page).then((g) => g.backgroundImage)).toBe('none');
    await page.emulateMedia({ contrast: 'no-preference', forcedColors: 'active' });
    await expect.poll(() => bodyGrid(page).then((g) => g.backgroundImage)).toBe('none');
  });
}

test('DIS-08: la rejilla cubre portada, índice y ficha; el hero queda transparente', async ({
  page
}) => {
  await openWithTheme(page, 'alexlight');
  for (const route of GRID_ROUTES) {
    await page.goto(route);
    const grid = await bodyGrid(page);
    expect(grid.backgroundImage, route).toContain('linear-gradient');
    expect(grid.backgroundSize, route).toContain('120px 120px');
  }

  await page.goto('/');
  const hero = await page.locator('main #top').evaluate((node) => {
    const surface = getComputedStyle(node);
    const own = getComputedStyle(node, '::before');
    return {
      image: surface.backgroundImage,
      color: surface.backgroundColor,
      own: own.backgroundImage
    };
  });
  expect(hero.image).toBe('none');
  expect(hero.color).toBe('rgba(0, 0, 0, 0)');
  expect(hero.own).toBe('none');
});

test('DIS-08: las líneas siguen el tema del sitio, no prefers-color-scheme', async ({ page }) => {
  await openWithTheme(page, 'alexlight');
  const light = await bodyGrid(page);
  await openWithTheme(page, 'alexdark');
  const dark = await bodyGrid(page);
  expect(dark.backgroundImage).not.toBe(light.backgroundImage);

  // Sin data-theme (modo sistema), el tema oscuro del sitio da las mismas
  // líneas que alexdark: el color sale de tokens, no de una media query.
  const system = await page.context().newPage();
  await system.emulateMedia({ colorScheme: 'dark' });
  await system.goto('/');
  expect((await bodyGrid(system)).backgroundImage).toBe(dark.backgroundImage);
  await system.close();
});
