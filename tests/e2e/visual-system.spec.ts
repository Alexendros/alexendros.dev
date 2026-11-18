import { test, expect } from '@playwright/test';

test('tipografía: Plus Jakarta para lectura, Space Grotesk en el titular y mono de sistema en la ceja', async ({
  page
}) => {
  await page.goto('/');

  const bodyFont = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily);
  const headingFont = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
  const eyebrowFont = await page
    .locator('#top .eyebrow')
    .evaluate((el) => getComputedStyle(el).fontFamily);

  expect(bodyFont).toContain('Plus Jakarta Sans Variable');
  expect(headingFont).toContain('Space Grotesk');
  expect(eyebrowFont).not.toContain('JetBrains');
  expect(eyebrowFont.toLowerCase()).toMatch(/monospace|menlo|consolas|cascadia/);
});

test('tipografía: preload de lectura y de titular (LCP)', async ({ page }) => {
  await page.goto('/');

  const preloads = page.locator('link[rel="preload"][as="font"]');
  await expect(preloads).toHaveCount(2);
  const hrefs = await preloads.evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute('href') ?? '')
  );
  expect(hrefs.some((h) => /plus-jakarta-sans-latin-wght-normal.*\.woff2$/.test(h))).toBe(true);
  expect(hrefs.some((h) => /space-grotesk-latin-700-normal.*\.woff2$/.test(h))).toBe(true);
});

test('hero: dos columnas, esquema del método y fondo liso', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#top [data-flow]')).toHaveCount(1);
  await expect(page.locator('#top [data-terminal-prompt]')).toHaveCount(0);
  const grid = await page.evaluate(
    () => getComputedStyle(document.body, '::before').backgroundImage
  );
  const processSurface = page.locator('#metodo .surface-raised');
  await expect(processSurface).toBeVisible();
  const processShadow = await processSurface.evaluate((el) => getComputedStyle(el).boxShadow);

  expect(grid).toBe('none');
  expect(processShadow).not.toBe('none');
});

test('vías estáticas en home y elevación solo en cards enlazables', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const homeRoute = page.locator('#servicios article').first();
  await expect(homeRoute.locator('.badge-brand')).toBeVisible();
  expect(await homeRoute.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  await homeRoute.hover();
  expect(await homeRoute.evaluate((el) => getComputedStyle(el).transform)).toBe('none');

  await page.goto('/servicios/');
  const linkedCard = page.locator('[data-catalogo-item]').first();
  expect(await linkedCard.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  await linkedCard.hover();
  await page.waitForTimeout(250);
  expect(await linkedCard.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
});

test('cards enlazables: reduced motion elimina la elevación por movimiento', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/servicios/');

  const card = page.locator('[data-catalogo-item]').first();
  await card.hover();
  expect(await card.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  expect(await card.evaluate((el) => getComputedStyle(el).transitionProperty)).not.toContain(
    'transform'
  );
  expect(await page.locator('html').evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe(
    'auto'
  );
});

test('referencias: tipología visible y zoom sutil condicionado por movimiento', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/referencias/');

  const card = page.locator('#main .surface-card').first();
  await expect(card.locator('[data-project-type]')).toHaveClass(/badge-outline/);
  await card.hover();
  expect(await card.locator('img').evaluate((el) => getComputedStyle(el).transform)).toBe('none');
});

test('cabecera: glass con superficie semántica y foco con anillo', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('#site-header');
  const styles = await header.evaluate((el) => {
    const computed = getComputedStyle(el);
    return { backdrop: computed.backdropFilter, background: computed.backgroundColor };
  });
  expect(styles.backdrop).toBe('blur(8px)');
  expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');

  const contactCta = page.locator('#site-header a.btn-primary');
  await contactCta.focus();
  expect(await contactCta.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('catálogo: tres vías conservan sus superficies', async ({ page }) => {
  await page.goto('/servicios/');

  const catalogItems = page.locator('[data-catalogo-item]');
  await expect(catalogItems).toHaveCount(3);
  await expect(page.locator('[data-product-card]')).toHaveCount(0);

  const surfaces = await catalogItems.evaluateAll((elements) =>
    elements.map((element) => {
      const styles = getComputedStyle(element);
      return { background: styles.backgroundColor, border: styles.borderTopColor };
    })
  );

  for (const surface of surfaces) {
    expect(surface.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(surface.border).not.toBe('rgba(0, 0, 0, 0)');
  }
});

test('badges: categoría sólida y atributos neutrales', async ({ page }) => {
  await page.goto('/');

  const card = page.locator('#servicios article').first();
  const category = card.locator('.badge-brand');
  const attribute = card.locator('ul[aria-label="Ámbitos"] .badge').first();
  await expect(category).toHaveClass(/badge-brand/);
  await expect(category).not.toHaveClass(/badge-outline/);
  await expect(attribute).toHaveClass(/badge-ghost/);
});

test('home: cuatro encabezados compartidos conservan su relación accesible', async ({ page }) => {
  await page.goto('/');

  const headers = page.locator('[data-section-header]');
  await expect(headers).toHaveCount(4);
  for (const id of ['servicios', 'referencias', 'metodo', 'contacto']) {
    const section = page.locator(`#${id}`);
    const headingId = await section.getAttribute('aria-labelledby');
    expect(headingId).toBe(`${id}-heading`);
    await expect(section.locator(`[data-section-header] h2#${headingId}`)).toBeVisible();
  }
});

for (const theme of ['alexlight', 'alexdark'] as const) {
  test(`color de borde separado del grosor en ${theme}`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('theme', selectedTheme);
    }, theme);
    await page.goto('/servicios/');

    const result = await page
      .locator('[data-catalogo-item]')
      .first()
      .evaluate((el) => {
        const root = getComputedStyle(document.documentElement);
        const probe = document.createElement('span');
        probe.style.color = 'var(--border-color)';
        document.body.append(probe);
        const expected = getComputedStyle(probe).color;
        probe.remove();
        return {
          widthToken: root.getPropertyValue('--border').trim(),
          colorToken: root.getPropertyValue('--border-color').trim(),
          expected,
          actual: getComputedStyle(el).borderColor
        };
      });

    expect(result.widthToken).toBe('1px');
    expect(result.colorToken).not.toBe('');
    expect(result.colorToken).not.toBe('1px');
    expect(result.actual).toBe(result.expected);

    const catalogBorder = await page
      .locator('[data-catalogo-item]')
      .first()
      .evaluate((el) => getComputedStyle(el).borderColor);
    expect(catalogBorder).toBe(result.expected);
  });
}

test('cierre de contacto: superficie propia y formulario con la sans elegida', async ({ page }) => {
  await page.goto('/');

  const panel = page.locator('#contacto [data-contact-panel]');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.glow')).toHaveCount(1);
  const background = await panel.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');

  await page.goto('/contacto/');
  const inputFont = await page
    .locator('input[name="name"]')
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(inputFont).toContain('Plus Jakarta Sans Variable');
});

for (const theme of ['alexlight', 'alexdark'] as const) {
  test(`proceso ${theme}: marcadores de marca sin estado de progreso`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('theme', selectedTheme);
    }, theme);
    await page.goto('/');

    const steps = page.locator('#steps .step');
    await expect(steps).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) {
      await expect(steps.nth(index)).toHaveAttribute('data-content', String(index + 1));
      await expect(steps.nth(index)).not.toHaveAttribute('aria-current');
    }

    const marker = await steps.first().evaluate((el) => {
      const styles = getComputedStyle(el, '::before');
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
