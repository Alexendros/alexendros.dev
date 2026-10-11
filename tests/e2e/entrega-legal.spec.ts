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

test('F09: /cookies ofrece Configuración informada y abre el modal', async ({ page }) => {
  await page.goto('/cookies');
  await expect(page.locator('#cc-main')).toBeAttached({ timeout: 10_000 });
  const essential = page.getByRole('button', { name: 'Sí a lo esencial' }).first();
  await expect(essential).toBeVisible();
  await essential.click();
  const trigger = page.locator('main').getByRole('button', { name: 'Configuración informada' });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByText('Preferencias de cookies')).toBeVisible({ timeout: 10_000 });
});

test('privacidad nombra AEPD y campos del formulario', async ({ page }) => {
  await page.goto('/privacidad');
  const main = page.locator('main');
  await expect(main).toContainText('AEPD');
  await expect(main).toContainText('nombre completo');
  await expect(main).toContainText('WhatsApp');
});
