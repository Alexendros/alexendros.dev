import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/servicios/',
  '/referencias/',
  '/referencias/front-valencia/',
  '/metodologia/',
  '/contacto/',
  '/experiencia/'
] as const;

for (const route of ROUTES) {
  test(`chrome común ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(route);

    await expect(page.locator('a[href="#main"]')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.locator('#contenido')).toHaveCount(0);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Tema:/ })).toHaveCount(1);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe(new URL(route, 'https://alexendros.dev').href);
  });
}

for (const route of ['/', '/metodologia/'] as const) {
  test(`footer: superficie a todo el ancho y contenido alineado con el header ${route}`, async ({
    page
  }) => {
    await page.goto(route);

    for (const width of [1920, 1440, 1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const geometry = await page.evaluate(() => {
        const footer = document.querySelector('footer');
        const inner = document.querySelector('.footer-inner');
        const headerInner = document.querySelector('.navbar-inner');
        if (!footer || !inner || !headerInner) return null;
        const footerRect = footer.getBoundingClientRect();
        const innerRect = inner.getBoundingClientRect();
        const headerRect = headerInner.getBoundingClientRect();
        return {
          viewport: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          footerLeft: footerRect.left,
          footerRight: footerRect.right,
          innerLeft: innerRect.left,
          innerRight: innerRect.right,
          innerWidth: innerRect.width,
          headerLeft: headerRect.left,
          headerRight: headerRect.right
        };
      });

      expect(geometry, `footer con contenedor interior a ${width}px`).not.toBeNull();
      expect(geometry!.footerLeft, `borde izquierdo a ${width}px`).toBeCloseTo(0, 0);
      expect(geometry!.footerRight, `borde derecho a ${width}px`).toBeCloseTo(
        geometry!.viewport,
        0
      );
      expect(
        Math.abs(geometry!.innerLeft - (geometry!.viewport - geometry!.innerRight)),
        `contenido centrado a ${width}px`
      ).toBeLessThanOrEqual(1);
      expect(geometry!.innerWidth).toBeLessThanOrEqual(1152);
      expect(geometry!.scrollWidth).toBeLessThanOrEqual(geometry!.viewport + 1);

      if (width >= 1280) {
        expect(geometry!.innerLeft, `eje izquierdo con header a ${width}px`).toBeCloseTo(
          geometry!.headerLeft,
          0
        );
        expect(geometry!.innerRight, `eje derecho con header a ${width}px`).toBeCloseTo(
          geometry!.headerRight,
          0
        );
      }
    }
  });
}

test('menú móvil: se oculta con la nav visible y funciona con teclado', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const open = page.getByRole('button', { name: 'Abrir menú' });
  await expect(open).toBeVisible();
  await open.click();
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
  await expect(page.locator('#mobile-nav')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
});
