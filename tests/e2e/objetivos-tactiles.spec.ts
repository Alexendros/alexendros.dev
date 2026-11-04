import { expect, test, type Locator } from '@playwright/test';

async function expect44(locator: Locator) {
  const boxes = await locator.evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    })
  );
  expect(boxes.length).toBeGreaterThan(0);
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
}

test('A11Y-04: las casillas tienen un objetivo mínimo de 44×44 px', async ({ page }) => {
  test.fail(true, 'A11Y-04: casillas de 24 px');
  for (const route of ['/contacto/', '/servicios/']) {
    await page.goto(route);
    await expect44(page.locator('main input[type="checkbox"]:visible'));
  }
});

test('A11Y-04: el enlace sin seleccionar módulos, si existe, mide 44×44 px', async ({ page }) => {
  await page.goto('/servicios/');
  const link = page.getByRole('link', {
    name: 'Solicitar información sin seleccionar módulos',
    exact: true
  });
  const count = await link.count();
  test.fail(count > 0, 'A11Y-04: enlace de 24 px mientras exista');
  if (count > 0) await expect44(link);
});

test('A11Y-04: el logo de cabecera mide al menos 44×44 px', async ({ page }) => {
  test.fail(true, 'A11Y-04: logo de 40 px');
  await page.goto('/');
  await expect44(page.locator('#site-header a[href="/#top"]'));
});

test('A11Y-04: GitHub y Correo tienen objetivos de al menos 44×44 px', async ({ page }) => {
  test.fail(true, 'A11Y-04: enlaces GitHub y Correo por debajo de 44 px');
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Enlaces', exact: true });
  await expect44(links.getByRole('link', { name: 'GitHub', exact: true }));
  await expect44(links.getByRole('link', { name: 'Correo', exact: true }));
});
