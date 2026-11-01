import { test, expect } from '@playwright/test';

test.describe('F02 F03 F10 servicios y selector de necesidades', () => {
  test('F02: /servicios muestra las cuatro fichas y la base sin importes', async ({ page }) => {
    await page.goto('/servicios');
    await expect(
      page.getByRole('heading', {
        name: 'Catálogo de servicios profesionales en respuesta a necesidades reales'
      })
    ).toBeVisible();
    for (const title of [
      'Revisión técnica para aparecer en buscadores',
      'Revisión técnica de privacidad, cookies y accesibilidad',
      'Revisión básica de seguridad web',
      'Colaboración en proyectos de programación'
    ]) {
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
    }
    const body = await page.locator('main').innerText();
    expect(body).toContain('Sitio web profesional');
    expect(body).not.toMatch(/€|\bEUR\b|\+\s*IVA\b/i);
    await expect(page.locator('[data-services-proposal-note]')).toContainText(/propuesta/i);
  });

  test('F03/CFG-01: marcar los cuatro módulos actualiza el resumen y conserva el contexto', async ({
    page
  }) => {
    await page.goto('/servicios');
    const configurator = page.locator('[data-needs-configurator]');
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
    const summary = configurator.locator('[data-selected-modules]');
    await expect(summary.locator('li')).toHaveCount(4);
    await expect(configurator.getByRole('link', { name: 'Solicitar propuesta' })).toHaveAttribute(
      'href',
      '/contacto/?motivo=propuestaComercial&origen=servicios&modulos=tienda%2Cmensajeria%2Cusuarios%2Ccontenidos'
    );
    await expect(configurator).not.toContainText(/€|\bEUR\b|\+\s*IVA\b/i);
  });

  test('CFG-03: contacto sin seleccionar módulos está disponible', async ({ page }) => {
    await page.goto('/servicios');
    const configurator = page.locator('[data-needs-configurator]');
    const link = configurator.getByRole('link', {
      name: /Solicitar información sin seleccionar módulos/i
    });
    await expect(link).toHaveAttribute('href', '/contacto/?motivo=informacionCliente');
    await link.click();
    await expect(page).toHaveURL(/\/contacto\/\?motivo=informacionCliente/);
    await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible();
    await expect(page.locator('[data-contact-modules]')).toBeHidden();
  });

  test('F10: no hay banner sticky de propuesta', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/servicios');
    await expect(page.locator('#sticky-cta')).toHaveCount(0);
  });
});
