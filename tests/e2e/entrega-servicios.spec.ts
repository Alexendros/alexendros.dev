import { test, expect } from '@playwright/test';
import { formatEuro, portalTotalWithModules, provisionalPrices } from '../../src/content/pricing';

test.describe('F02 F03 F10 servicios y configurador', () => {
  test('F02: /servicios muestra las cuatro fichas y cada importe del módulo', async ({ page }) => {
    await page.goto('/servicios');
    await expect(page.getByRole('heading', { name: 'Servicios profesionales' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Posicionamiento comercial en buscadores' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cumplimiento normativo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ciberseguridad' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Colaboración en proyectos de software' })
    ).toBeVisible();
    const body = await page.locator('main').innerText();
    expect(body).toContain(formatEuro(provisionalPrices.informeComercial));
    expect(body).toContain(formatEuro(provisionalPrices.cumplimiento));
    expect(body).toContain(formatEuro(provisionalPrices.ciberseguridad));
    expect(body).toContain(formatEuro(provisionalPrices.portalInicio));
    expect(body).toContain(formatEuro(provisionalPrices.tienda));
    expect(body).toContain(formatEuro(provisionalPrices.mensajeria));
    expect(body).toContain(formatEuro(provisionalPrices.usuarios));
    expect(body).toContain(formatEuro(provisionalPrices.contenidos));
    expect(body).toContain('+ IVA');
    expect(body).toContain('Precio por fase en la propuesta');
  });

  test('F03/CFG-01: marcar los cuatro módulos deja el total igual a la suma', async ({ page }) => {
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
    await expect(configurator.locator('[data-pricing-total]')).toContainText(
      formatEuro(portalTotalWithModules)
    );
    await expect(page.locator('[data-services-price-note]')).toContainText(/orientativo/i);
    await expect(configurator).toContainText(/plazos.*no se suman/i);
  });

  test('CFG-03: contacto sin configurar está disponible', async ({ page }) => {
    await page.goto('/servicios');
    const configurator = page.locator('[data-pricing-configurator]');
    await expect(
      configurator.getByRole('link', { name: /Solicitar información sin configurar/i })
    ).toHaveAttribute('href', '/contacto?motivo=informacionCliente');
    await configurator.getByRole('link', { name: /Solicitar información sin configurar/i }).click();
    await expect(page).toHaveURL(/\/contacto\?motivo=informacionCliente/);
    await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible();
    await expect(page.locator('[data-contact-modules]')).toHaveCount(0);
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
