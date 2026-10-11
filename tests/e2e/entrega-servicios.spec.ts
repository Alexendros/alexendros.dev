import { test, expect } from '@playwright/test';
import { formatEuro, portalTotalWithModules, provisionalPrices } from '../../src/content/pricing';

test.describe('F02 F03 F10 servicios y configurador', () => {
  test('F02: /servicios muestra las tres fichas y cada importe del módulo', async ({ page }) => {
    await page.goto('/servicios');
    await expect(page.getByRole('heading', { name: 'Informe comercial' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sesión profesional' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Auditoría de normativa y ciberseguridad' })
    ).toBeVisible();
    const body = await page.locator('main').innerText();
    expect(body).toContain(formatEuro(provisionalPrices.informeComercial));
    expect(body).toContain(formatEuro(provisionalPrices.sesionProfesional));
    expect(body).toContain(formatEuro(provisionalPrices.auditoria));
    expect(body).toContain(formatEuro(provisionalPrices.portalInicio));
    expect(body).toContain(formatEuro(provisionalPrices.tienda));
    expect(body).toContain(formatEuro(provisionalPrices.mensajeria));
    expect(body).toContain(formatEuro(provisionalPrices.usuarios));
    expect(body).toContain(formatEuro(provisionalPrices.contenidos));
  });

  test('F03: marcar los cuatro módulos deja el total igual a la suma', async ({ page }) => {
    await page.goto('/servicios');
    const configurator = page.locator('[data-pricing-configurator]');
    await expect(configurator).toBeVisible();
    await configurator.scrollIntoViewIfNeeded();
    await expect(configurator.locator('input[data-module="tienda"]')).toBeEnabled({
      timeout: 10_000
    });
    for (const id of ['tienda', 'mensajeria', 'usuarios', 'contenidos']) {
      const box = configurator.locator(`input[data-module="${id}"]`);
      await box.check();
      await expect(box).toBeChecked();
    }
    await expect(configurator.locator('[data-pricing-total]')).toHaveText(
      formatEuro(portalTotalWithModules)
    );
  });

  test('F10: la barra móvil no dice gratis', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('alexendros.sticky-cta.v1');
      } catch {
        /* ignore */
      }
    });
    await page.goto('/servicios');
    const sticky = page.locator('#sticky-cta');
    await expect(sticky).toBeAttached();
    await expect(sticky).not.toContainText(/gratis/i);
    await expect(sticky).toContainText(formatEuro(provisionalPrices.informeComercial));
    await page.evaluate(() => {
      window.scrollTo(0, 1200);
      document.getElementById('sticky-cta')?.classList.remove('hidden');
    });
    await expect(sticky).toBeVisible();
  });
});
