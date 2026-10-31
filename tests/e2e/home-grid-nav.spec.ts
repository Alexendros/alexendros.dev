import { test, expect } from '@playwright/test';
import { homeHero } from '../../src/content/home';

test('F02: home sin scroll horizontal a 320, 390 y 768px', async ({ page }) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('#top')).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, `scrollWidth ${scrollWidth} > viewport ${width}`).toBeLessThanOrEqual(
      width
    );
  }
});

test('F01: home de página única con hero y secciones', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: homeHero.title })).toBeVisible();
  const banner = page.getByRole('banner');
  for (const name of ['Servicios', 'Referencias', 'Metodología']) {
    await expect(banner.getByRole('link', { name, exact: true })).toBeVisible();
  }
  for (const name of [
    'Cómo trabajo',
    'Servicios profesionales',
    'Proyectos realizados',
    'Valores'
  ]) {
    await expect(banner.getByRole('link', { name, exact: true })).toHaveCount(0);
  }
  await expect(
    page.locator('#top').getByRole('link', { name: 'Solicitar propuesta' })
  ).toHaveAttribute('href', /origen=home#contacto$/);
  for (const id of ['servicios', 'referencias', 'metodo', 'contacto']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});
