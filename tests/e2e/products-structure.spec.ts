import { test, expect } from '@playwright/test';
import { products } from '../../src/content/services';
import { site } from '../../src/content/site';

const sectionsDefault = [
  'commercial',
  'audience',
  'problems',
  'scope',
  'deliverables',
  'process',
  'exclusions',
  'next-step',
  'technical'
] as const;

const sectionsSoftware = [
  'commercial',
  'audience',
  'process',
  'deliverables',
  'exclusions',
  'next-step',
  'technical'
] as const;

const listSectionsDefault = [
  'audience',
  'problems',
  'scope',
  'deliverables',
  'exclusions'
] as const;
const listSectionsSoftware = ['audience', 'deliverables', 'exclusions'] as const;

test.describe('DET estructura común de fichas', () => {
  test('catálogo publicado: cuatro slugs sin portal-inicio', () => {
    expect(products.map((p) => p.slug)).toEqual([
      'informe-comercial',
      'cumplimiento-normativo',
      'ciberseguridad',
      'software-a-medida'
    ]);
    expect(products.some((p) => p.slug === 'portal-inicio')).toBe(false);
  });

  for (const product of products) {
    test(`DET-01–06: ${product.slug}`, async ({ page }) => {
      await page.goto(`/servicios/${product.slug}`);
      const detail = page.locator('[data-product-detail]');
      await expect(detail).toHaveAttribute('data-product-detail', product.slug);
      const isSoftware = product.slug === 'software-a-medida';
      const sections = isSoftware ? sectionsSoftware : sectionsDefault;
      const listSections = isSoftware ? listSectionsSoftware : listSectionsDefault;

      // DET-02: un H1 y H2 comunes
      await expect(detail.getByRole('heading', { level: 1 })).toHaveText(product.title);
      await expect(detail.getByRole('heading', { level: 1 })).toHaveCount(1);

      // DET-01: secuencia exacta de secciones
      const rendered = await detail
        .locator('[data-product-section]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-product-section')));
      expect(rendered).toEqual([...sections]);

      // DET-02 + DET-04: listas ul íntegras
      for (const key of listSections) {
        const section = detail.locator(`[data-product-section="${key}"]`);
        await expect(section.getByRole('heading', { level: 2 })).toHaveCount(1);
        await expect(section.locator('ul > li')).toHaveText(product[key]);
      }

      // DET-02: proceso como ol
      await expect(detail.locator('[data-product-section="process"] ol > li')).toHaveText(
        product.process
      );

      // DET-03: condiciones en orden canónico
      await expect(detail.locator('[data-product-section="commercial"] dt')).toHaveText([
        'Precio',
        'Pago',
        'Plazo',
        'Entrega',
        'Garantía'
      ]);

      // DET-05: acción primaria
      const action = detail.locator('[data-product-action="primary"]');
      await expect(action).toHaveCount(1);
      await expect(action).toHaveText(product.action.label);
      await expect(action).toHaveAttribute('href', product.action.href);
      if (product.action.newTab) {
        await expect(action).toHaveAttribute('target', '_blank');
      }

      await expect(
        detail.locator('[data-product-section="technical"] details > summary')
      ).toHaveCount(1);

      // DET-06: metadatos
      await expect(page).toHaveTitle(new RegExp(product.title));
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        'href',
        new URL(`/servicios/${product.slug}/`, site.url).href
      );
      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveAttribute(
        'content',
        new URL(`/og/servicios/${product.slug}.png`, site.url).href
      );
      const ogRes = await page.request.get(`/og/servicios/${product.slug}.png`);
      expect(ogRes.ok()).toBe(true);
    });
  }

  test('índice: cuatro tarjetas con data-product-card y un solo enlace', async ({ page }) => {
    await page.goto('/servicios');
    for (const product of products) {
      const card = page.locator(`[data-product-card="${product.slug}"]`);
      await expect(card).toHaveCount(1);
      await expect(card.locator('a')).toHaveCount(1);
      await expect(card.locator('[data-product-card-price]')).toBeVisible();
    }
    await expect(page.locator('[data-services-price-note]')).toContainText(/orientativo/i);
    await expect(page.locator('[data-product-card="portal-inicio"]')).toHaveCount(0);
    await expect(page.getByText('Preparando el configurador')).toHaveCount(0);
  });
});
