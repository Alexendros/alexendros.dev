import { test, expect } from '@playwright/test';

test('tipografía: Source Sans para lectura y JetBrains Mono para el prompt', async ({ page }) => {
  await page.goto('/');

  const bodyFont = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily);
  const headingFont = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
  const promptFont = await page
    .locator('#top p')
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);

  expect(bodyFont).toContain('Source Sans 3 Variable');
  expect(headingFont).toContain('Source Sans 3 Variable');
  expect(promptFont).toContain('JetBrains Mono Variable');
});

test('tipografía: solo Source Sans latin variable tiene preload prioritario', async ({ page }) => {
  await page.goto('/');

  const preloads = page.locator('link[rel="preload"][as="font"]');
  await expect(preloads).toHaveCount(1);
  await expect(preloads.first()).toHaveAttribute(
    'href',
    /source-sans-3-latin-wght-normal.*\.woff2$/
  );
});

test('hero: firma terminal, gradiente y compromisos elevados', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#top .terminal-prompt')).toHaveCount(1);
  const heroBackground = await page
    .locator('#top')
    .evaluate((el) => getComputedStyle(el).backgroundImage);
  const commitment = page.locator('#top .commitment-item').first();
  await expect(commitment).toBeVisible();
  const commitmentShadow = await commitment.evaluate((el) => getComputedStyle(el).boxShadow);

  expect(heroBackground).toContain('radial-gradient');
  expect(commitmentShadow).not.toBe('none');
});

test('cards: superficie estática en home y elevación solo en cards enlazables', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const homeCard = page.locator('#servicios .card').first();
  await expect(homeCard.locator('.badge-accent')).toHaveClass(/badge-sm/);
  expect(await homeCard.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  await homeCard.hover();
  expect(await homeCard.evaluate((el) => getComputedStyle(el).transform)).toBe('none');

  await page.goto('/servicios/');
  const linkedCard = page.locator('[data-product-card]').first();
  expect(await linkedCard.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  await linkedCard.hover();
  await page.waitForTimeout(250);
  expect(await linkedCard.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
});

test('cards enlazables: reduced motion elimina la elevación por movimiento', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/servicios/');

  const card = page.locator('[data-product-card]').first();
  await card.hover();
  expect(await card.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  expect(await card.evaluate((el) => getComputedStyle(el).transitionProperty)).not.toContain(
    'transform'
  );
});

test('referencias: tipología visible y zoom sutil condicionado por movimiento', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/referencias/');

  const card = page.locator('#main .card-lift').first();
  await expect(card.locator('[data-project-type]')).toHaveClass(/badge-outline/);
  await expect(card.locator('[data-project-type]')).toHaveClass(/badge-sm/);
  await card.hover();
  await page.waitForTimeout(350);
  expect(await card.locator('img').evaluate((el) => getComputedStyle(el).transform)).not.toBe(
    'none'
  );

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await card.locator('img').evaluate((el) => getComputedStyle(el).transform)).toBe('none');
});

test('cabecera: glass con superficie semántica y foco con anillo', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('#site-header');
  await expect(header).toHaveClass(/site-header/);
  const styles = await header.evaluate((el) => {
    const computed = getComputedStyle(el);
    return { backdrop: computed.backdropFilter, background: computed.backgroundColor };
  });
  expect(styles.backdrop).toBe('blur(12px)');
  expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');

  await page.goto('/servicios/informe-comercial/');
  const summary = page.locator('summary.focus-ring').first();
  await summary.focus();
  expect(await summary.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
});

test('cierre de contacto: superficie propia y formulario con la sans elegida', async ({ page }) => {
  await page.goto('/');

  const panel = page.locator('#contacto .contact-cta-panel');
  await expect(panel).toBeVisible();
  const background = await panel.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(background).toContain('radial-gradient');
  expect(await panel.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');

  await page.goto('/contacto/');
  const inputFont = await page
    .locator('input[name="name"]')
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(inputFont).toContain('Source Sans 3 Variable');
});

for (const theme of ['alexlight', 'alexdark'] as const) {
  test(`proceso ${theme}: marcadores primarios sin estado de progreso`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('theme', selectedTheme);
    }, theme);
    await page.goto('/');

    const steps = page.locator('#steps .step');
    await expect(steps).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) {
      await expect(steps.nth(index)).toHaveClass(/step-primary/);
      await expect(steps.nth(index)).not.toHaveAttribute('aria-current');
    }

    const marker = await steps.first().evaluate((el) => {
      const styles = getComputedStyle(el, '::after');
      return { background: styles.backgroundColor, foreground: styles.color };
    });
    const primary = await page
      .locator('#top .btn-primary')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(marker.background).toBe(primary);
    expect(marker.foreground).not.toBe(marker.background);
  });
}

for (const theme of ['alexlight', 'alexdark'] as const) {
  test(`tokens visuales disponibles en ${theme}`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('theme', selectedTheme);
    }, theme);
    await page.goto('/');

    const tokens = await page.locator('html').evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        elevation: styles.getPropertyValue('--shadow-1').trim(),
        elevationHover: styles.getPropertyValue('--shadow-2').trim(),
        headerGlass: styles.getPropertyValue('--surface-header-glass').trim(),
        sectionGradient: styles.getPropertyValue('--gradient-section').trim()
      };
    });

    expect(tokens.elevation).toContain('color-mix');
    expect(tokens.elevationHover).toContain('color-mix');
    expect(tokens.headerGlass).toContain('color-mix');
    expect(tokens.sectionGradient).toContain('gradient');
  });
}
