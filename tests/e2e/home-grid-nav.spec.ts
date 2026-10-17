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

test('F01: home es hero estable + nav; sin secciones en página', async ({ page }) => {
  await page.goto('/');

  const h1 = page.getByRole('heading', {
    level: 1,
    name: /Diseño y desarrollo de productos web/
  });
  await expect(h1).toBeVisible();
  await expect(page.getByText(/alcance acordado y trato directo/)).toBeVisible();
  await expect(page.locator('.hero-slot-item')).toHaveCount(0);
  await expect(page.getByText(/Pare las rotativas/)).toHaveCount(0);
  await expect(page.getByText(/SI TIENES UN NEGOCIO/i)).toHaveCount(0);

  const banner = page.getByRole('banner');
  await expect(banner.getByRole('link', { name: 'Contactar' })).toBeVisible();
  await expect(
    page.locator('[data-hero]').getByRole('link', { name: 'Cuéntame qué necesitas' })
  ).toBeVisible();
  await expect(
    page.locator('[data-hero]').getByRole('link', { name: 'Explorar servicios' })
  ).toBeVisible();
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Contactar' })).toHaveCount(
    0
  );

  await expect(banner.getByRole('link', { name: 'Servicios', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Publicaciones', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Metodología', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Valores', exact: true })).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Servicios', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Publicaciones', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Metodología', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Valores', exact: true })).toHaveCount(0);
  await expect(page.getByText('DISEÑO WEB · VALENCIA')).toHaveCount(0);
  await expect(page.getByText('Disponible para nuevos proyectos')).toHaveCount(0);
});
