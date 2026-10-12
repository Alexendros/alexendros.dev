import { test, expect } from '@playwright/test';

test('F01: home es hero + nav; sin secciones en página', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /Aquí se crean productos digitales/
    })
  ).toBeVisible();
  await expect(page.getByText(/El dominio donde despliegue tu portal/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contactar' }).first()).toBeVisible();

  const banner = page.getByRole('banner');
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
