import { test, expect } from '@playwright/test';
import { catalogoPromocional } from '../../src/content/catalogo';
import { products } from '../../src/content/services';

test.describe('F02 F03 F10 servicios y selector de necesidades', () => {
  test('F02: /servicios muestra el catálogo vigente sin importes', async ({ page }) => {
    await page.goto('/servicios/');
    await expect(
      page.getByRole('heading', {
        name: 'Soluciones tecnológicas de calidad en respuesta a necesidades empresariales.'
      })
    ).toBeVisible();
    await expect(page.locator('[data-catalogo-item]')).toHaveCount(catalogoPromocional.length);
    for (const item of catalogoPromocional) {
      await expect(page.getByRole('heading', { name: item.titulo })).toBeVisible();
    }
    for (const product of products) {
      await expect(page.getByRole('heading', { name: product.title })).toHaveCount(0);
    }
    const body = await page.locator('main').innerText();
    expect(body).not.toMatch(/€|\bEUR\b|\+\s*IVA\b/i);
    await expect(page.locator('[data-services-proposal-note]')).toContainText(/propuesta/i);
  });

  test('F03/CFG-01: el CTA del catálogo conserva motivo, origen y vía', async ({ page }) => {
    const first = catalogoPromocional[0];
    if (!first?.ctaOpcional) throw new Error('El catálogo necesita un primer CTA');

    await page.goto('/servicios/');
    const item = page.locator(`[data-catalogo-item="${first.id}"]`);
    const cta = item.getByRole('link', { name: first.ctaOpcional.label });
    await expect(cta).toHaveClass(/btn-primary/);
    await cta.click();

    const target = new URL(first.ctaOpcional.href, 'https://alexendros.dev');
    expect(new URL(page.url()).pathname).toBe(target.pathname);
    expect(new URL(page.url()).searchParams.toString()).toBe(target.searchParams.toString());
    await expect(page.locator('#contact-reason')).toHaveValue('propuestaComercial');
    await expect(page.locator('input[name="origin"]')).toHaveValue('catalogo-revision');
    await expect(page.locator('input[name="via"][value="revisar"]')).toBeChecked();
    await expect(page.locator('[data-contact-modules]')).toBeHidden();
  });

  test('CFG-03: cada CTA del catálogo preselecciona su vía', async ({ page }) => {
    const expected = [
      { id: 'revision', via: 'revisar' },
      { id: 'construccion', via: 'crear' },
      { id: 'colaboracion', via: 'colaborar' }
    ] as const;
    for (const row of expected) {
      const item = catalogoPromocional.find((entry) => entry.id === row.id);
      if (!item?.ctaOpcional) throw new Error(`Falta CTA de ${row.id}`);
      await page.goto('/servicios/');
      await page
        .locator(`[data-catalogo-item="${row.id}"]`)
        .getByRole('link', { name: item.ctaOpcional.label })
        .click();
      await expect(page).toHaveURL(new RegExp(`via=${row.via}`));
      await expect(page.locator(`input[name="via"][value="${row.via}"]`)).toBeChecked();
    }
  });

  test('F10: no hay banner sticky de propuesta', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/servicios/');
    await expect(page.locator('#sticky-cta')).toHaveCount(0);
  });
});
