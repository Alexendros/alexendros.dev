import { test, expect } from '@playwright/test';

test('F01: home muestra las cuatro secciones y Contactar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Servicios', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Publicaciones', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Metodología', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Valores', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contactar' }).first()).toBeVisible();
  await expect(page.getByText('Servicios · Referencias · Metodología · Valores')).toHaveCount(0);
  await expect(page.getByText(/^FIG\./)).toHaveCount(0);
});
