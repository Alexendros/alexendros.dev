import { expect, test, type Page } from '@playwright/test';

const retiredSlugs = ['informe-comercial', 'cumplimiento-normativo', 'ciberseguridad'];

test('DIS-05: /servicios/ solo contiene paquetes opcionales, Colaboración y su acción', async ({
  page
}) => {
  test.fail(true, 'DIS-05: oferta reducida pendiente');
  await page.goto('/servicios/');
  await expect(page.locator('[data-paquete]')).toHaveCount(0);
  await expect(page.locator('[data-product-card]')).toHaveCount(1);
  await expect(page.locator('[data-product-card="software-a-medida"]')).toHaveCount(1);
  for (const slug of retiredSlugs) {
    await expect(page.locator(`[data-product-card="${slug}"]`)).toHaveCount(0);
  }
  await expect(page.locator('[data-services-primary-action]')).toHaveCount(1);
  await expect(page.locator('[data-detail-island]')).toHaveCount(0);
  await expect(page.locator('[data-needs-configurator]')).toHaveCount(0);
  await expect(page.locator('#faq')).toHaveCount(0);
});

async function mainText(page: Page, route: string) {
  await page.goto(route);
  return page
    .locator('main h2, main h3, main p')
    .evaluateAll((nodes) =>
      nodes.map((node) => (node.textContent ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean)
    );
}

test('DIS-05: /servicios/ no repite encabezados ni párrafos principales de portada', async ({
  page
}) => {
  const homeText = new Set(await mainText(page, '/'));
  const duplicated = (await mainText(page, '/servicios/')).filter((text) => homeText.has(text));
  expect(duplicated).toEqual([]);
});
