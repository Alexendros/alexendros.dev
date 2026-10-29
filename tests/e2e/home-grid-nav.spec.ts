import { test, expect } from '@playwright/test';

test('F02: home sin scroll horizontal a 320, 390 y 768px', async ({ page }) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-hero]')).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, `scrollWidth ${scrollWidth} > viewport ${width}`).toBeLessThanOrEqual(
      width
    );
  }
});

test('F01: home es hero estable + caminos (sin proceso ni caso)', async ({ page }) => {
  await page.goto('/');

  const h1 = page.getByRole('heading', {
    level: 1,
    name: /Servicios informáticos y tecnologías para empresas y particulares\./
  });
  await expect(h1).toBeVisible();
  await expect(
    page.getByText(
      /Atención a distancia o presencialmente en Valencia\. Alcance, plazo y condiciones acordados por escrito\./
    )
  ).toBeVisible();
  await expect(page.locator('.hero-slot-item')).toHaveCount(0);
  await expect(page.getByText(/Pare las rotativas/)).toHaveCount(0);

  const banner = page.getByRole('banner');
  await expect(banner.getByRole('link', { name: 'Formulario de contacto' })).toBeVisible();
  await expect(
    page.locator('[data-hero]').getByRole('link', { name: 'Solicitar propuesta' })
  ).toBeVisible();
  await expect(
    page.locator('[data-hero]').getByRole('link', { name: 'Catálogo de servicios' })
  ).toBeVisible();

  await expect(
    banner.getByRole('link', { name: 'Servicios profesionales', exact: true })
  ).toBeVisible();
  await expect(
    banner.getByRole('link', { name: 'Proyectos realizados', exact: true })
  ).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Metodología clara', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Cómo trabajo', exact: true })).toHaveCount(0);
  await expect(banner.getByRole('link', { name: 'Servicios', exact: true })).toHaveCount(0);
  await expect(banner.getByRole('link', { name: 'Metodología', exact: true })).toHaveCount(0);
  await expect(banner.getByRole('link', { name: 'Valores', exact: true })).toHaveCount(0);

  await expect(
    page.getByRole('heading', { name: 'Encargos habituales', exact: true })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cómo trabajo', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Un caso', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ver el proceso completo' })).toHaveCount(0);

  await expect(
    page.getByRole('heading', {
      name: 'Sitio web profesional',
      exact: true
    })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Integración de Inteligencia Artificial en procesos empresariales y oficios',
      exact: true
    })
  ).toBeVisible();
});
