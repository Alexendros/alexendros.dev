import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { processPage } from '../../src/content/process';

/** Snippet de metodología en la home (#metodo). */
const route = '/';
const SECTION = '#metodo';
const TITLE = processPage.title;

test('proceso: página /metodologia con H1, pasos y CTA', async ({ page }) => {
  await page.goto('/metodologia/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#proceso')).toHaveAttribute('aria-labelledby', 'proceso-heading');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Pasos del encargo', exact: true })
  ).toBeAttached();
  await expect(
    page.getByRole('heading', { level: 2, name: processPage.close.heading })
  ).toBeVisible();
  for (const step of processPage.steps) {
    await expect(page.getByRole('heading', { level: 3, name: step.title })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Enviar solicitud', exact: true })).toBeVisible();
});

test('proceso: la página conserva el orden de headings', async ({ page }) => {
  await page.goto('/metodologia/');
  const results = await // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new AxeBuilder({ page: page as any }).include('main').withRules(['heading-order']).analyze();
  expect(results.violations).toEqual([]);
});

test('proceso: ritmo de secciones, grids y cierre centrado', async ({ page }) => {
  await page.goto('/metodologia/');

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const layout = await page.evaluate(() => {
      const shell = document.querySelector('main > .page-shell');
      const process = document.getElementById('proceso');
      if (!shell || !process || shell.children.length !== 3) return null;

      const [heroAndSteps, commitments, close] = [...shell.children];
      const pageHead = heroAndSteps.firstElementChild;
      if (!pageHead) return null;
      const tokenSize = (name: string): number => {
        const probe = document.createElement('div');
        probe.style.position = 'absolute';
        probe.style.visibility = 'hidden';
        probe.style.height = `var(${name})`;
        document.body.append(probe);
        const size = Number.parseFloat(getComputedStyle(probe).height);
        probe.remove();
        return size;
      };
      const shellRect = shell.getBoundingClientRect();
      const heroRect = heroAndSteps.getBoundingClientRect();
      const processRect = process.getBoundingClientRect();
      const commitmentsRect = commitments.getBoundingClientRect();
      const closeRect = close.getBoundingClientRect();
      const stepsGrid = process.querySelector('ol');
      const commitmentsGrid = commitments.querySelector('ul');
      if (!stepsGrid || !commitmentsGrid) return null;

      return {
        sectionSpace: tokenSize('--space-section-y'),
        blockSpace: tokenSize('--space-block'),
        gridSpace: tokenSize('--space-gap'),
        heroToSteps: processRect.top - pageHead.getBoundingClientRect().bottom,
        stepsToCommitments: commitmentsRect.top - heroRect.bottom,
        commitmentsToClose: closeRect.top - commitmentsRect.bottom,
        stepsGap: Number.parseFloat(getComputedStyle(stepsGrid).rowGap),
        commitmentsGap: Number.parseFloat(getComputedStyle(commitmentsGrid).rowGap),
        closeLeftInset: closeRect.left - shellRect.left,
        closeRightInset: shellRect.right - closeRect.right
      };
    });

    expect(layout, `estructura medible a ${width}px`).not.toBeNull();
    expect(layout!.heroToSteps, `hero→pasos a ${width}px`).toBeCloseTo(layout!.blockSpace, 0);
    expect(layout!.stepsToCommitments, `pasos→compromisos a ${width}px`).toBeCloseTo(
      layout!.sectionSpace,
      0
    );
    expect(layout!.commitmentsToClose, `compromisos→cierre a ${width}px`).toBeCloseTo(
      layout!.sectionSpace,
      0
    );
    expect(layout!.stepsGap).toBeCloseTo(layout!.gridSpace, 0);
    expect(layout!.commitmentsGap, `gap de compromisos a ${width}px`).toBeCloseTo(
      layout!.gridSpace,
      0
    );
    expect(
      Math.abs(layout!.closeLeftInset - layout!.closeRightInset),
      `cierre centrado a ${width}px`
    ).toBeLessThanOrEqual(1);
  }
});

for (const width of [320, 390, 768, 1280]) {
  test(`proceso: contenido y reflow a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const metodo = page.locator(SECTION);
    await expect(metodo).toBeVisible();
    await expect(metodo.getByRole('heading', { level: 2, name: TITLE, exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'De la idea al proyecto publicado', exact: true })
    ).toHaveCount(0);
    await expect(page.locator('#sticky-cta')).toHaveCount(0);
    await expect(page.locator('.delivery-page')).toHaveCount(0);
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
    await page.locator(SECTION).scrollIntoViewIfNeeded();
    const results = await // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new AxeBuilder({ page: page as any })
      .include(SECTION)
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
  await expect(page.locator(SECTION)).toBeVisible();
  await expect(page.locator('#steps')).toBeVisible();
  await expect(page.locator('#sticky-cta')).toHaveCount(0);
  await expect(page.locator('.delivery-page')).toHaveCount(0);
  await context.close();
});

test('proceso: ancla bajo la cabecera', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(route);
  await expect(page.locator('#sticky-cta')).toHaveCount(0);

  await page.locator(SECTION).scrollIntoViewIfNeeded();
  await expect(page.locator(SECTION)).toBeInViewport();

  const clearance = await page.evaluate(() => {
    const section = document.getElementById('metodo');
    const header = document.getElementById('site-header');
    if (!section || !header) return null;
    const sectionTop = section.getBoundingClientRect().top;
    const headerBottom = header.getBoundingClientRect().bottom;
    return { sectionTop, headerBottom };
  });
  expect(clearance).not.toBeNull();
  expect(clearance!.sectionTop).toBeGreaterThanOrEqual(clearance!.headerBottom - 1);
});

test('proceso: pasos visibles y sin duraciones comerciales', async ({ page }) => {
  await page.goto(route);
  const metodo = page.locator(SECTION);
  await expect(metodo.getByRole('heading', { name: 'Un caso', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Pedir presupuesto' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ver precios' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Reservar una llamada' })).toHaveCount(0);
  for (const step of processPage.steps) {
    await expect(metodo.getByRole('heading', { level: 3, name: step.title })).toBeVisible();
  }
  await expect(page.getByText('30 min')).toHaveCount(0);
  await expect(page.getByText('1–2 días')).toHaveCount(0);
  await expect(page.getByText(/Orientativo:\s*10 días/)).toHaveCount(0);
  await expect(page.getByText('2–3 días')).toHaveCount(0);
});
