import { test, expect } from '@playwright/test';

/**
 * Subconjunto always-on en CI (job e2e-critical).
 * axe/LHCI completo sigue detrás del label `e2e`.
 */
test.describe('critical paths', () => {
  test('home responde y marca es visible', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.ok()).toBeTruthy();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('a[href="/contacto"]').first()).toBeVisible();
  });

  test('header sticky no es transparente', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#site-header');
    await expect(header).toHaveClass(/glass-bg/);
    const alpha = await page.evaluate(() => {
      const el = document.getElementById('site-header');
      if (!el) return 0;
      const raw = getComputedStyle(el).backgroundColor;
      if (!raw || raw === 'transparent' || raw === 'rgba(0, 0, 0, 0)') return 0;
      // rgb()/rgba() clásico
      const comma = raw.match(/^rgba?\(([^)]+)\)$/);
      if (comma) {
        const parts = comma[1].split(',').map((part) => Number.parseFloat(part.trim()));
        return parts.length === 4 ? (parts[3] ?? 0) : 1;
      }
      // color-mix → oklab()/color() con canal alfa tras «/»
      const slash = raw.match(/\/\s*([\d.]+)\s*\)\s*$/);
      if (slash) return Number.parseFloat(slash[1]);
      // Sin canal alfa explícito: superficie opaca
      return 1;
    });
    expect(alpha).toBeGreaterThan(0);
  });

  test('contacto muestra formulario usable', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.getByRole('heading', { name: 'Formulario de contacto' })).toBeVisible();
    await expect(page.getByLabel('Motivo*')).toBeVisible();
    await expect(page.getByRole('button', { name: /Enviar/ })).toBeVisible();
  });

  test('sin consentimiento no hay trackers data-tracker', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('script[data-tracker]')).toHaveCount(0);
    expect(await page.evaluate(() => 'gtag' in window)).toBe(false);
  });

  test('a 320px el CMP queda por encima del sticky CTA (sin solape de apilado)', async ({
    page
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    await expect(page.locator('#cc-main .cm')).toBeVisible();
    // Forzar sticky CTA visible para medir z-index relativo al CMP.
    await page.evaluate(() => {
      document.getElementById('sticky-cta')?.classList.remove('hidden');
    });
    const stack = await page.evaluate(() => {
      const cmp = document.querySelector('#cc-main');
      const sticky = document.getElementById('sticky-cta');
      const header = document.getElementById('site-header');
      if (!cmp || !sticky || !header) return null;
      const z = (el: Element) => {
        let node: Element | null = el;
        let max = 0;
        while (node && node !== document.documentElement) {
          const value = Number.parseFloat(getComputedStyle(node).zIndex);
          if (!Number.isNaN(value)) max = Math.max(max, value);
          node = node.parentElement;
        }
        return max;
      };
      return { cmp: z(cmp), sticky: z(sticky), header: z(header) };
    });
    expect(stack).not.toBeNull();
    expect(stack!.cmp).toBeGreaterThan(stack!.sticky);
    expect(stack!.cmp).toBeGreaterThan(stack!.header);
  });
});
