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

test('hero: firma terminal, hero transparente y rejilla en el fondo del cuerpo', async ({
  page
}) => {
  await page.goto('/');

  await expect(page.locator('#top [data-terminal-prompt]')).toHaveCount(1);
  const heroBackground = await page
    .locator('#top')
    .evaluate((el) => getComputedStyle(el).backgroundImage);
  const grid = await page.evaluate(() => {
    const style = getComputedStyle(document.body, '::before');
    return { image: style.backgroundImage, mask: style.maskImage };
  });
  const processSurface = page.locator('#metodo .surface-raised');
  await expect(processSurface).toBeVisible();
  const processShadow = await processSurface.evaluate((el) => getComputedStyle(el).boxShadow);

  expect(heroBackground).toBe('none');
  expect(grid.image).toContain('linear-gradient');
  expect(grid.mask).toBe('none');
  expect(processShadow).not.toBe('none');
});

test('vías estáticas en home y elevación solo en cards enlazables', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const homeRoute = page.locator('#servicios article').first();
  await expect(homeRoute.locator('.badge-accent')).toHaveClass(/badge-sm/);
  expect(await homeRoute.evaluate((el) => getComputedStyle(el).boxShadow)).toBe('none');
  await homeRoute.hover();
  expect(await homeRoute.evaluate((el) => getComputedStyle(el).transform)).toBe('none');

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
  expect(await page.locator('html').evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe(
    'auto'
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
  const styles = await header.evaluate((el) => {
    const computed = getComputedStyle(el);
    return { backdrop: computed.backdropFilter, background: computed.backgroundColor };
  });
  expect(styles.backdrop).toBe('blur(8px)');
  expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');

  const contactCta = page.locator('#site-header a.btn-primary');
  await contactCta.focus();
  expect(await contactCta.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
});

test('catálogo: tres vías y ficha única conservan sus superficies', async ({ page }) => {
  await page.goto('/servicios/');

  const catalogItems = page.locator('[data-catalogo-item]');
  const productCard = page.locator('[data-product-card]');
  await expect(catalogItems).toHaveCount(3);
  await expect(productCard).toHaveCount(1);
  await expect(productCard).toBeVisible();

  const surfaces = await page
    .locator('[data-catalogo-item], [data-product-card]')
    .evaluateAll((elements) =>
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
  const category = card.locator('.badge-accent');
  const attribute = card.locator('ul[aria-label="Ámbitos"] .badge').first();
  await expect(category).toHaveClass(/badge-accent/);
  await expect(category).not.toHaveClass(/badge-outline/);
  await expect(attribute).toHaveClass(/badge-ghost/);
  await expect(attribute).toHaveClass(/badge-sm/);
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
  test(`color de borde separado del grosor DaisyUI en ${theme}`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('theme', selectedTheme);
    }, theme);
    await page.goto('/servicios/');

    const result = await page
      .locator('[data-product-card]')
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
