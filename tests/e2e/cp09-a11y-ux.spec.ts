import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * CP-09 — UX / teclado / a11y bloqueante (recorridos A–I, muestreo).
 * No declara conformidad WCAG completa ni lector de pantalla real.
 */

async function axeZero(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations, `${label}: ${JSON.stringify(results.violations, null, 2)}`).toEqual(
    []
  );
}

async function assertSingleH1AndMain(page: Page) {
  await expect(page.locator('main#contenido, main')).toHaveCount(1);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toBeVisible();
}

test.describe('CP-09 landmarks y jerarquía', () => {
  for (const path of ['/', '/servicios', '/contacto', '/metodo', '/proyectos'] as const) {
    test(`${path}: banner, main y un solo H1`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await expect(page.getByRole('banner')).toBeVisible();
      await assertSingleH1AndMain(page);
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });
  }
});

test.describe('CP-09 teclado — menú móvil', () => {
  test('Abrir, Escape cierra y devuelve el foco al botón', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    await page.setViewportSize({ width: 390, height: 720 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    // Quitar CMP para no capturar Enter/foco del menú.
    const banner = page.locator('#cc-main .cm');
    if (await banner.isVisible().catch(() => false)) {
      await banner.getByRole('button', { name: 'Rechazar opcionales' }).click();
      await expect(banner).toBeHidden({ timeout: 10_000 });
    }

    const menuBtn = page.locator('[data-menu-button]');
    await expect(menuBtn).toBeVisible();
    // Abrir con teclado (Enter en <button type="button">).
    await menuBtn.focus();
    await page.keyboard.press('Enter');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(menuBtn).toHaveAttribute('aria-label', 'Cerrar menú');
    const mobileNav = page.locator('#mobile-nav');
    await expect(mobileNav).toBeVisible();
    // Tras Enter el foco puede estabilizarse un frame después (CMP / rAF).
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const nav = document.getElementById('mobile-nav');
            const first = nav?.querySelector('a');
            return first != null && document.activeElement === first;
          }),
        { timeout: 10_000 }
      )
      .toBe(true);

    await page.keyboard.press('Escape');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(menuBtn).toHaveAttribute('aria-label', 'Abrir menú');
    await expect(mobileNav).toBeHidden();
    // El CMP u otros handlers pueden mover el foco tras ocultar el nav.
    await expect
      .poll(
        async () =>
          page.evaluate(() => document.activeElement?.hasAttribute('data-menu-button') ?? false),
        { timeout: 10_000 }
      )
      .toBe(true);
  });
});

test.describe('CP-09 teclado — CMP', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
  });

  test('Rechazar opcionales con teclado deja el sitio usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 720 });
    await page.goto('/');
    const banner = page.locator('#cc-main .cm');
    await expect(banner).toBeVisible({ timeout: 15_000 });
    const reject = banner.getByRole('button', { name: 'Rechazar opcionales' });
    await reject.focus();
    await page.keyboard.press('Enter');
    await expect(banner).toBeHidden({ timeout: 10_000 });
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('script[data-tracker]')).toHaveCount(0);
  });
});

test.describe('CP-09 contacto — foco, errores y axe', () => {
  test('Enviar sin datos marca aria-invalid y axe sin violaciones', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/contacto');
    await expect(page.getByRole('button', { name: /Enviar/ })).toBeEnabled({ timeout: 10_000 });

    const name = page.getByLabel('Nombre*');
    await expect(name).toBeVisible();
    await page.getByRole('button', { name: /Enviar/ }).click();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toBeFocused();

    await axeZero(page, '/contacto error nombre');
  });

  test('contexto allowlisted llega oculto', async ({ page }) => {
    await page.goto('/contacto?servicio=informe-comercial&proyecto=front-valencia');
    await expect(page.locator('#contact-service')).toHaveValue('informe-comercial', {
      timeout: 10_000
    });
    await expect(page.locator('#contact-project')).toHaveValue('front-valencia');
    await expect(page.locator('#contact-service')).toHaveAttribute('type', 'hidden');
    await expect(page.locator('#contact-project')).toHaveAttribute('type', 'hidden');
  });
});

test.describe('CP-09 recorridos A–E (muestreo)', () => {
  test('A/B: servicios → ficha informe → Pedir el informe', async ({ page }) => {
    await page.goto('/servicios');
    await assertSingleH1AndMain(page);
    await page.getByRole('link', { name: 'Posicionamiento comercial en buscadores' }).click();
    await expect(page).toHaveURL(/\/servicios\/informe-comercial/);
    await assertSingleH1AndMain(page);
    const cta = page.getByRole('link', { name: /Pedir el informe/i });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/contacto/);
    await expect(page.locator('#contact-service')).toHaveValue('informe-comercial');
  });

  test('C: proyecto → CTA disponibilidad → contacto con proyecto', async ({ page }) => {
    await page.goto('/proyectos/front-valencia');
    await assertSingleH1AndMain(page);
    const cta = page.getByRole('link', { name: 'Consultar sobre esta obra' });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/contacto/);
    await expect(page.locator('#contact-project')).toHaveValue('front-valencia');
  });

  test('D: proceso → contacto', async ({ page }) => {
    await page.goto('/metodo');
    await assertSingleH1AndMain(page);
    await page
      .getByRole('link', { name: /Formulario de contacto|Contactar|contacto/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/contacto/);
  });
});

test.describe('CP-09 reflow 320 y zoom 200%', () => {
  test('320px: home y contacto sin overflow-x y H1 visible', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    for (const path of ['/', '/contacto'] as const) {
      await page.goto(path);
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      });
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return Math.max(doc.scrollWidth, document.body.scrollWidth) - doc.clientWidth;
      });
      expect(overflow, `${path}@320`).toBeLessThanOrEqual(1);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });

  test('zoom 200%: contacto mantiene H1 y Enviar usable', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/contacto');
    await page.evaluate(() => {
      document.documentElement.style.zoom = '2';
    });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const sendBtn = page.getByRole('button', { name: /Enviar/ });
    await expect(sendBtn).toBeVisible();
    const box = await sendBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(24);
    await sendBtn.click({ force: false });
  });
});

test.describe('CP-09 axe estados', () => {
  test('axe home tras rechazar opcionales', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const banner = page.locator('#cc-main .cm');
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await banner.getByRole('button', { name: 'Rechazar opcionales' }).click();
    await expect(banner).toBeHidden({ timeout: 10_000 });
    await axeZero(page, 'home post-rechazo');
  });
});
