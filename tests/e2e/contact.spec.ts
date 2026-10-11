import { test, expect } from '@playwright/test';

test('F04: contacto valida canal y envía', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      expect(req.headers()['content-type'] ?? '').toMatch(/application\/json/i);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
      return;
    }
    await route.fulfill({
      status: 405,
      headers: { Allow: 'POST', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    });
  });

  await page.goto('/contacto');
  await expect(page.getByRole('button', { name: /Enviar/ })).toBeEnabled();

  await page.getByLabel('Nombre completo*').fill('A');
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByLabel('Nombre completo*').fill('Test Cliente');
  await page.getByRole('radio', { name: 'Correo electrónico' }).check();
  await page.getByLabel('Correo electrónico*').fill('test@example.com');
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('status')).toContainText(/Mensaje enviado/i, { timeout: 10000 });
});

test('F04: WhatsApp sin teléfono no envía', async ({ page }) => {
  let posted = false;
  await page.route('**/api/contact', async (route) => {
    if (route.request().method() === 'POST') posted = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true })
    });
  });

  await page.goto('/contacto');
  await page.getByLabel('Nombre completo*').fill('Test Cliente');
  await page.getByRole('radio', { name: 'WhatsApp' }).check();
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(posted).toBe(false);
});

test('contacto muestra informe por formulario y sesión en Cal', async ({ page }) => {
  await page.goto('/contacto');

  await expect(page.getByRole('heading', { name: 'Servicios de entrada' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Formulario' })).toBeVisible();
  await expect(page.getByLabel('Nombre completo*')).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Rellenar formulario', exact: true })
  ).toHaveAttribute('href', '#escribir');

  const sesion = page.getByRole('link', { name: 'Reservar sesión profesional', exact: true });
  await expect(sesion).toHaveAttribute('href', 'https://cal.com/alexendros/sesion-tecnica');
  await expect(sesion).toHaveAttribute('data-cal-link', 'alexendros/sesion-tecnica');

  await expect(
    page.getByRole('link', { name: /Código QR para reservar Sesión profesional/ })
  ).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/retainer/i);
  await expect(page.locator('body')).not.toContainText(/diagnóstico/i);
});
