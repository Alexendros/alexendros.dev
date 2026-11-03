import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/servicios/',
  '/referencias/',
  '/referencias/front-valencia/',
  '/metodo/',
  '/contacto/',
  '/experiencia/'
] as const;

for (const route of ROUTES) {
  test(`chrome común ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(route);

    await expect(page.locator('a[href="#main"]')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.locator('#contenido')).toHaveCount(0);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Tema:/ })).toHaveCount(1);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe(new URL(route, 'https://alexendros.dev').href);
  });
}

test('menú móvil: se oculta con la nav visible y funciona con teclado', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const open = page.getByRole('button', { name: 'Abrir menú' });
  await expect(open).toBeVisible();
  await open.click();
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
  await expect(page.locator('#mobile-nav')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
});
