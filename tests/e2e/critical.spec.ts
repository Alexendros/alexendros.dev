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
    await expect(page.getByRole('combobox', { name: 'Motivo de la consulta' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continuar/ })).toBeVisible();
  });

  test('sin consentimiento no hay trackers data-tracker', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('script[data-tracker]')).toHaveCount(0);
    expect(await page.evaluate(() => 'gtag' in window)).toBe(false);
  });
});
