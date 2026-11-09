import { test, expect } from '@playwright/test';
import { catalogoPromocional } from '../../src/content/catalogo';
import { products } from '../../src/content/services';

test.describe('F02 F03 F10 servicios y selector de necesidades', () => {
  test('F02: /servicios muestra el catálogo vigente sin importes', async ({ page }) => {
    await page.goto('/servicios');
    await expect(
      page.getByRole('heading', {
        name: 'Catálogo de servicios profesionales en respuesta a necesidades reales'
      })
    ).toBeVisible();
    await expect(page.locator('[data-catalogo-item]')).toHaveCount(catalogoPromocional.length);
    for (const item of catalogoPromocional) {
      await expect(page.getByRole('heading', { name: item.titulo })).toBeVisible();
    }
    for (const product of products) {
      await expect(page.getByRole('heading', { name: product.title })).toBeVisible();
    }
    const body = await page.locator('main').innerText();
    expect(body).not.toMatch(/€|\bEUR\b|\+\s*IVA\b/i);
    await expect(page.locator('[data-services-proposal-note]')).toContainText(/propuesta/i);
  });

  test('F03/CFG-01: el CTA del catálogo conserva motivo y origen', async ({ page }) => {
    const first = catalogoPromocional[0];
    if (!first?.ctaOpcional) throw new Error('El catálogo necesita un primer CTA');

    await page.goto('/servicios');
    const item = page.locator(`[data-catalogo-item="${first.id}"]`);
    await item.getByRole('link', { name: first.ctaOpcional.label }).click();

    const target = new URL(first.ctaOpcional.href, 'https://alexendros.dev');
    expect(new URL(page.url()).pathname).toBe(target.pathname);
    expect(new URL(page.url()).searchParams.toString()).toBe(target.searchParams.toString());
    await expect(page.locator('#contact-reason')).toHaveValue('propuestaComercial');
    await expect(page.locator('input[name="origin"]')).toHaveValue('catalogo-revision');
  });

  test('CFG-03: la acción principal abre contacto sin módulos retirados', async ({ page }) => {
    await page.goto('/servicios');
    const link = page.locator('[data-services-primary-action]').getByRole('link', {
      name: 'Solicitar propuesta'
    });
    await expect(link).toHaveAttribute(
      'href',
      '/contacto/?motivo=propuestaComercial&origen=servicios'
    );
    await link.click();
    await expect(page).toHaveURL(/\/contacto\/\?motivo=propuestaComercial&origen=servicios/);
    await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible();
    await expect(page.locator('[data-contact-modules]')).toBeHidden();
  });

  test('F10: no hay banner sticky de propuesta', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/servicios');
    await expect(page.locator('#sticky-cta')).toHaveCount(0);
  });
});
