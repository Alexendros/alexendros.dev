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
  await page.goto('/contacto/');
  await expect44(page.locator('main input[type="checkbox"]:visible'));
});

test('A11Y-04: el enlace sin seleccionar módulos, si existe, mide 44×44 px', async ({ page }) => {
  await page.goto('/servicios/');
  const link = page.getByRole('link', {
    name: 'Solicitar información sin seleccionar módulos',
    exact: true
  });
  const count = await link.count();
  if (count > 0) await expect44(link);
});

test('A11Y-04: el logo de cabecera mide al menos 44×44 px', async ({ page }) => {
  await page.goto('/');
  await expect44(page.locator('#site-header a[href="/#top"]'));
});

test('A11Y-04: GitHub, LinkedIn y Correo tienen hit-area de al menos 44×44 px', async ({
  page
}) => {
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Enlaces', exact: true });
  for (const name of [/GitHub/, /LinkedIn/, /^Correo$/] as const) {
    const box = await links.getByRole('link', { name }).evaluate((node) => {
      const before = getComputedStyle(node, '::before');
      const height = parseFloat(before.height) || 0;
      const width = Math.max(parseFloat(before.width) || 0, node.getBoundingClientRect().width);
      return { width, height, hasPseudo: before.content !== 'none' && before.content !== '' };
    });
    expect(box.hasPseudo, `${name} ::before`).toBe(true);
    expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44);
    expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44);
  }
});

test('A11Y-04: los CTA de sección miden al menos 44 px de alto', async ({ page }) => {
  await page.goto('/');
  for (const name of [
    'Ver el catálogo de servicios',
    'Ver todas las referencias',
    'Ver el método completo'
  ]) {
    await expect44(page.getByRole('link', { name, exact: true }));
  }
});

test('A11Y-04: las tarjetas de referencias destacadas miden 44 px de alto', async ({ page }) => {
  await page.goto('/');
  const referencias = page.locator('#referencias');
  for (const name of ['Front Valencia', 'Gráficas Nasve']) {
    const card = referencias
      .locator('article')
      .filter({ has: page.getByRole('link', { name, exact: true }) });
    const box = await card.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
