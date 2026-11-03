import { test, expect } from '@playwright/test';

test('filtro de referencias con aria-pressed y sin saltos', async ({ page }) => {
  await page.goto('/referencias/');
  const group = page.getByRole('group', { name: 'Filtrar referencias por tipo' });
  await expect(group.getByRole('button', { name: 'Todos', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  const encargos = page.locator('[data-kind="encargo"]');
  const propios = page.locator('[data-kind="propio"]');
  await expect(encargos).toHaveCount(2);
  await expect(propios).toHaveCount(2);

  await group.getByRole('button', { name: 'Proyectos propios', exact: true }).click();
  await expect(
    group.getByRole('button', { name: 'Proyectos propios', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(encargos.first()).toBeHidden();
  await expect(propios.first()).toBeVisible();

  await group.getByRole('button', { name: 'Todos', exact: true }).click();
  await expect(encargos.first()).toBeVisible();
});

test('tarjetas de referencia con captura y dimensiones', async ({ page }) => {
  await page.goto('/referencias/');
  const images = page.locator('[data-ref-grid] img');
  await expect(images).toHaveCount(4);
  const count = await images.count();
  for (let i = 0; i < count; i += 1) {
    const image = images.nth(i);
    await expect(image).toHaveAttribute('width', /.+/);
    await expect(image).toHaveAttribute('height', /.+/);
    expect((await image.getAttribute('alt'))?.length ?? 0).toBeGreaterThan(0);
  }
});

test('FAQ en /servicios/ con details nativos', async ({ page }) => {
  await page.goto('/servicios/');
  await expect(page.getByRole('heading', { name: 'Preguntas frecuentes' })).toBeVisible();
  const details = page.locator('#faq details');
  await expect(details).toHaveCount(5);
  await expect(details.first()).toHaveAttribute('name', 'faq');
  await expect(details.first().locator('summary')).toBeVisible();
});
