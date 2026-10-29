import { test, expect, type Page } from '@playwright/test';

/**
 * CP-08 — matriz visual mínima bloqueante (defectos objetivos).
 * No sustituye revisión humana de estética; detecta desbordes y colisiones
 * medibles en viewports × temas × motion.
 */

const URLS = [
  '/',
  '/servicios',
  '/servicios/informe-comercial',
  '/servicios/cumplimiento-normativo',
  '/servicios/ciberseguridad',
  '/proyectos',
  '/proyectos/front-valencia',
  '/metodo',
  '/contacto',
  '/cookies',
  '/privacidad',
  '/identidad',
  '/404'
] as const;

const WIDTHS = [320, 390, 768, 1280] as const;
const VIEWPORT_HEIGHT = 720;

async function setVisualPrefs(
  page: Page,
  opts: { theme: 'light' | 'dark'; reducedMotion: boolean }
) {
  await page.emulateMedia({
    colorScheme: opts.theme === 'dark' ? 'dark' : 'light',
    reducedMotion: opts.reducedMotion ? 'reduce' : 'no-preference'
  });
  await page.addInitScript((t) => {
    document.documentElement.dataset.theme = t;
  }, opts.theme);
  await page.evaluate((t) => {
    document.documentElement.dataset.theme = t;
  }, opts.theme);
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
    const clientW = doc.clientWidth;
    return scrollW - clientW;
  });
}

/** Espera layout estable (fuentes + un frame) para no medir desbordes transitorios de img/CMP. */
async function settleLayout(page: Page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  });
}

async function assertNoOverflow(page: Page, label: string) {
  await settleLayout(page);
  const overflow = await horizontalOverflow(page);
  expect(overflow, `${label}: overflow-x ${overflow}px`).toBeLessThanOrEqual(1);
}

test.describe('CP-08 matriz UI — overflow y apilado', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
  });

  for (const width of WIDTHS) {
    test(`sin desborde horizontal a ${width}px (claro + motion normal)`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await setVisualPrefs(page, { theme: 'light', reducedMotion: false });

      for (const path of URLS) {
        await page.goto(path);
        await page.waitForLoadState('domcontentloaded');
        await assertNoOverflow(page, `${path}@${width}/light`);
      }
    });

    test(`sin desborde horizontal a ${width}px (oscuro + reduced-motion)`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await setVisualPrefs(page, { theme: 'dark', reducedMotion: true });

      // Muestreo representativo (no 13×4×2×2 = 208; bloqueante por ancho/tema).
      for (const path of ['/', '/servicios', '/contacto', '/proyectos/front-valencia'] as const) {
        await page.goto(path);
        await page.waitForLoadState('domcontentloaded');
        await assertNoOverflow(page, `${path}@${width}/dark/rm`);
      }
    });
  }

  test('320px: CMP por encima del sticky; controles clicables sin force', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: VIEWPORT_HEIGHT });
    await setVisualPrefs(page, { theme: 'light', reducedMotion: false });
    await page.goto('/');
    await expect(page.locator('#cc-main .cm')).toBeVisible();
    await page.evaluate(() => {
      document.getElementById('sticky-cta')?.classList.add('is-visible');
    });

    const stack = await page.evaluate(() => {
      const z = (el: Element | null) => {
        if (!el) return 0;
        let node: Element | null = el;
        let max = 0;
        while (node && node !== document.documentElement) {
          const value = Number.parseFloat(getComputedStyle(node).zIndex);
          if (!Number.isNaN(value)) max = Math.max(max, value);
          node = node.parentElement;
        }
        return max;
      };
      return {
        cmp: z(document.querySelector('#cc-main')),
        sticky: z(document.getElementById('sticky-cta')),
        header: z(document.getElementById('site-header'))
      };
    });
    expect(stack.cmp).toBeGreaterThan(stack.sticky);
    expect(stack.cmp).toBeGreaterThan(stack.header);

    const accept = page.locator('#cc-main .cm').getByRole('button', { name: 'Aceptar todas' });
    await expect(accept).toBeVisible();
    await accept.click({ force: false });
    await expect(page.locator('#cc-main .cm')).toBeHidden({ timeout: 10_000 });
  });

  test('320px contacto: contexto y mailto no desbordan; Enviar usable', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: VIEWPORT_HEIGHT });
    await page.goto('/contacto');
    await expect(page.getByRole('button', { name: /Enviar/ })).toBeEnabled({ timeout: 10_000 });
    await assertNoOverflow(page, '/contacto@320');
    const sendBtn = page.getByRole('button', { name: /Enviar/ });
    await expect(sendBtn).toBeEnabled();
    const box = await sendBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(40);
    expect(box!.height).toBeGreaterThanOrEqual(36);
    await sendBtn.click({ force: false });
    await expect(page.getByLabel('Nombre*')).toBeVisible();
  });

  test('servicios 320: selector y CTA Solicitar propuesta sin overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: VIEWPORT_HEIGHT });
    await page.goto('/servicios');
    await expect(page.locator('[data-needs-configurator]')).toBeVisible({ timeout: 10_000 });
    await assertNoOverflow(page, '/servicios@320');
    const ask = page.getByRole('link', { name: 'Solicitar propuesta' });
    await expect(ask).toBeVisible();
    await ask.click({ force: false });
    await expect(page).toHaveURL(/\/contacto/);
  });
});
