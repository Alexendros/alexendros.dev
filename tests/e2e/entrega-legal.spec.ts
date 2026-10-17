import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
});

test('F07: el pie no tiene tagline, hola@ ni párrafo de cookies', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).not.toContainText(/Webs claras y útiles/i);
  await expect(footer).not.toContainText('hola@alexendros.dev');
  await expect(footer).not.toContainText(/Usamos cookies propias/i);
  await expect(footer).not.toContainText(/Afiliados/i);
  await expect(footer.getByRole('link', { name: /contratacion@alexendros\.dev/i })).toHaveAttribute(
    'href',
    'mailto:contratacion@alexendros.dev'
  );
  await expect(footer.getByRole('link', { name: 'GitHub' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
});

test('F08: Identidad muestra NIF y CP sin calle', async ({ page }) => {
  await page.goto('/identidad');
  const main = page.locator('main');
  await expect(main).toContainText('21002968N');
  await expect(main).toContainText('46023');
  await expect(main).toContainText('Valencia');
  await expect(main).toContainText('España');
  await expect(main).not.toContainText(/Higinio/i);
  await expect(main).toContainText('contratacion@alexendros.dev');
});

test('F09: /cookies explica en claro y ofrece Configurar', async ({ page }) => {
  await page.goto('/cookies');
  const main = page.locator('main');
  await expect(main.getByRole('heading', { name: 'Cookies' })).toBeVisible();
  await expect(main.getByRole('heading', { name: 'En claro, sin jerga' })).toBeVisible();
  await expect(main.getByText(/Aceptar todas/).first()).toBeVisible();
  const trigger = main.getByRole('button', { name: 'Configurar' });
  await expect(trigger).toBeVisible();
});

test('privacidad nombra AEPD y campos del formulario', async ({ page }) => {
  await page.goto('/privacidad');
  const main = page.locator('main');
  await expect(main).toContainText('AEPD');
  await expect(main).toContainText('nombre');
  await expect(main).toContainText('WhatsApp');
});
