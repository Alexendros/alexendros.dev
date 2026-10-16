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
  await expect(page.getByRole('heading', { name: 'Formulario de contacto' })).toBeVisible();

  await page.getByRole('button', { name: /Continuar/ }).click(); // Motivo
  await page.getByRole('textbox', { name: 'Tu nombre' }).fill('A');
  await page.getByRole('button', { name: /Continuar/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByRole('textbox', { name: 'Tu nombre' }).fill('Test Cliente');
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.getByRole('button', { name: /Continuar/ }).click(); // Categoría
  await page.getByRole('radio', { name: 'Correo electrónico' }).check();
  await page.getByLabel('Correo electrónico*').fill('test@example.com');
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page
    .getByRole('textbox', { name: 'Tu petición' })
    .fill('Necesito información sobre el informe comercial.');
  await page.getByRole('button', { name: /Continuar/ }).click();
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
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.getByRole('textbox', { name: 'Tu nombre' }).fill('Test Cliente');
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.getByRole('radio', { name: 'WhatsApp' }).check();
  await page.getByRole('button', { name: /Continuar/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(posted).toBe(false);
});

test('contacto muestra canales horizontales y sin servicios de entrada', async ({ page }) => {
  await page.goto('/contacto');

  await expect(page.getByRole('heading', { name: 'Formulario de contacto' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Servicios de entrada' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Perfiles y correo' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Formulario', exact: true })).toHaveCount(0);

  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: /contratacion@alexendros\.dev/i })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'GitHub' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
  await expect(page.locator('main').getByRole('link', { name: 'GitHub' })).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/retainer/i);
  await expect(page.locator('body')).not.toContainText(/diagnóstico/i);
});
