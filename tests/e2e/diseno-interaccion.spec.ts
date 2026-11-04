import { test, expect, type Page } from '@playwright/test';

const routes = [
  '/',
  '/accesibilidad/',
  '/articulos/presupuesto-web/',
  '/articulos/web-o-app-a-medida/',
  '/contacto/',
  '/cookies/',
  '/design-system/',
  '/experiencia/',
  '/identidad/',
  '/metodo/',
  '/privacidad/',
  '/referencias/',
  '/referencias/alexendros-me/',
  '/referencias/front-valencia/',
  '/referencias/graficas-nasve/',
  '/referencias/zedazo/',
  '/servicios/',
  '/servicios/software-a-medida/',
  '/sobre-mi/',
  '/404/'
] as const;

const serviceSlugs = ['software-a-medida'] as const;

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth;
  });
  expect(overflow, label).toBeLessThanOrEqual(1);
}

async function expectMinimumTargets(page: Page) {
  const failures = await page.evaluate(() => {
    const elements = [
      ...document.querySelectorAll<HTMLElement>(
        'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button]'
      )
    ];
    const visible = elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        !element.classList.contains('sr-only')
      );
    });
    return visible.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width >= 24 && rect.height >= 24) return [];
      const style = getComputedStyle(element);
      if (style.display === 'inline' && element.closest('p,li,dd,td')) return [];
      const target = {
        left: rect.left + rect.width / 2 - 12,
        right: rect.left + rect.width / 2 + 12,
        top: rect.top + rect.height / 2 - 12,
        bottom: rect.top + rect.height / 2 + 12
      };
      const overlaps = visible.some((other) => {
        if (other === element) return false;
        const otherRect = other.getBoundingClientRect();
        return (
          target.left < otherRect.right &&
          target.right > otherRect.left &&
          target.top < otherRect.bottom &&
          target.bottom > otherRect.top
        );
      });
      return overlaps
        ? [
            `${element.tagName.toLowerCase()}: ${(element.textContent || element.getAttribute('aria-label') || '').trim().slice(0, 60)}`
          ]
        : [];
    });
  });
  expect(failures).toEqual([]);
}

async function expectVisibleFocus(page: Page) {
  const state = await page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return { visible: false, obscured: true };
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      visible:
        (style.outlineStyle !== 'none' && style.outlineWidth !== '0px') ||
        style.boxShadow !== 'none',
      obscured: rect.bottom <= 0 || rect.top >= innerHeight
    };
  });
  expect(state.visible).toBe(true);
  expect(state.obscured).toBe(false);
}

for (const route of routes) {
  test(`${route}: landmarks, reflow 320, objetivos y foco`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page, `${route}@320`);
    await expectMinimumTargets(page);
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab');
      await expectVisibleFocus(page);
    }
  });
}

for (const route of routes.filter(
  (item) => !['/', '/design-system/', '/servicios/'].includes(item)
)) {
  test(`${route}: texto al 200 % sin desbordamiento`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await expectNoHorizontalOverflow(page, `${route} con texto al 200 %`);
  });
}

test('A11Y-01: portada con texto al 200 % sin desbordamiento', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expectNoHorizontalOverflow(page, 'A11Y-01');
});

test('A11Y-02: /design-system/ con texto al 200 % sin desbordamiento', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/design-system/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expectNoHorizontalOverflow(page, 'A11Y-02');
});

test('A11Y-03: /servicios/ con texto al 200 % sin desbordamiento', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/servicios/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expectNoHorizontalOverflow(page, 'A11Y-03');
});

test('D3: CTA principal de portada en la primera pantalla móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const cta = page.locator('main a[href^="/contacto/"]').first();
  await expect(cta).toBeInViewport();
  expect((await cta.boundingBox())?.height).toBeGreaterThanOrEqual(44);
});

test('DIS-01: CTA principal de /servicios/ en la primera pantalla móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/servicios/');
  const cta = page.locator('main a[href^="/contacto/"]').first();
  await expect(cta).toBeInViewport();
  expect((await cta.boundingBox())?.height).toBeGreaterThanOrEqual(44);
});

for (const slug of serviceSlugs) {
  test(`DIS-02: CTA principal de /servicios/${slug}/ en la primera pantalla móvil`, async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/servicios/${slug}/`);
    const cta = page.locator('[data-product-action="primary"]');
    await expect(cta).toBeInViewport();
    expect((await cta.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  });
}

test('menú móvil: teclado, Escape y foco de retorno', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const banner = page.locator('#cc-main .cm');
  if (await banner.isVisible().catch(() => false)) {
    await banner.getByRole('button', { name: 'Rechazar opcionales' }).click();
    await expect(banner).toBeHidden();
  }
  const button = page.locator('[data-menu-button]');
  await expect(page.locator('html[data-header-ready="true"]')).toBeAttached();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await expectVisibleFocus(page);
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();
});

test('formulario: errores anunciados y foco en el primer campo inválido', async ({ page }) => {
  await page.goto('/contacto/');
  await page.getByRole('button', { name: 'Solicitar propuesta', exact: true }).click();
  await expect(page.locator('[data-contact-errors]')).toHaveAttribute('role', 'alert');
  await expect(page.locator('[data-contact-errors]')).toBeVisible();
  await expect(page.locator('#contact-name-error')).toHaveAttribute('role', 'alert');
  await expect(page.getByLabel(/^Nombre( \*)?$/)).toBeFocused();
});

test('pie: foco visible alcanzable con teclado', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  for (let step = 0; step < 100; step += 1) {
    await page.keyboard.press('Tab');
    if (await footer.evaluate((node) => node.contains(document.activeElement))) {
      await expectVisibleFocus(page);
      return;
    }
  }
  throw new Error('El foco no alcanzó el pie después de 100 tabulaciones');
});

test('C-1: botón principal con radio Atlaps de 4 px', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.btn-primary').first()).toHaveCSS('border-radius', '4px');
});

test('C-2: campo con anillo de foco visible', async ({ page }) => {
  await page.goto('/contacto/');
  const field = page.getByLabel(/^Nombre( \*)?$/);
  await field.focus();
  const shadow = await field.evaluate((element) => getComputedStyle(element).boxShadow);
  expect(shadow).not.toBe('none');
});

test('C-3: plazo, entrega y garantía presentados como lista de datos', async ({ page }) => {
  await page.goto('/servicios/software-a-medida/');
  await expect(page.locator('[data-next-step-facts]')).toHaveCount(1);
  await expect(page.locator('[data-next-step-facts] dt')).toHaveText([
    'Plazo',
    'Entrega',
    'Garantía'
  ]);
});

test('C-4: sombra de tarjeta sin desenfoque', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.surface-raised').first();
  const shadow = await card.evaluate((element) => getComputedStyle(element).boxShadow);
  expect(shadow).not.toBe('none');
  expect(shadow).not.toContain('24px');
  expect(shadow).not.toContain('40px');
});

test('C-5: foco único en cabecera y formulario', async ({ page }) => {
  await page.goto('/contacto/');
  const expected = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--focus-color').trim()
  );
  expect(expected).not.toBe('');
  const header = page.locator('#site-header a[href^="/contacto"]');
  await header.focus();
  const headerColor = await header.evaluate((element) => getComputedStyle(element).outlineColor);
  const field = page.getByLabel(/^Nombre( \*)?$/);
  await field.focus();
  const fieldColor = await field.evaluate((element) => getComputedStyle(element).outlineColor);
  expect(fieldColor).toBe(headerColor);
});

test('C-6: confirmación de contacto como toast accesible', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
    });
  });
  await page.goto('/contacto/');
  await page.locator('input[name="via"][value="revisar"]').check();
  await page.getByLabel(/^Nombre( \*)?$/).fill('Test Cliente');
  await page.getByLabel(/^Correo electrónico( \*)?$/).fill('test@example.invalid');
  await page.getByLabel(/^Mensaje( \*)?$/).fill('Necesito información sobre el informe comercial.');
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: 'Solicitar propuesta', exact: true }).click();
  const toast = page.locator('[data-contact-success]');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('role', 'status');
  await expect(toast).toHaveCSS('border-left-width', '3px');
});
