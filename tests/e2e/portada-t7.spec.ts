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
    const expected = width >= 1024 ? 60 : width >= 640 ? 48 : 36;
    expect(fontSize).toBeCloseTo(expected, 0);
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
  test(`DIS-08: fondo liso en ${theme}`, async ({ page }) => {
    await openWithTheme(page, theme);
    const grid = await bodyGrid(page);
    expect(grid.backgroundImage).toBe('none');
    const pageColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(pageColor).not.toBe('rgba(0, 0, 0, 0)');
  });
}

test('DIS-08: el fondo liso cubre portada, índice y ficha', async ({ page }) => {
  await openWithTheme(page, 'alexlight');
  for (const route of GRID_ROUTES) {
    await page.goto(route);
    const grid = await bodyGrid(page);
    expect(grid.backgroundImage, route).toBe('none');
  }
});

test('DIS-08: el fondo sigue el tema del sitio', async ({ page }) => {
  await openWithTheme(page, 'alexlight');
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await openWithTheme(page, 'alexdark');
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(dark).not.toBe(light);
});
