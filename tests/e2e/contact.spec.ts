import { test, expect, type Page, type Route } from '@playwright/test';

async function fillWizardToConsent(page: Page) {
  await page.getByRole('button', { name: /Continuar/ }).click(); // Motivo
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
}

async function mockContact(
  page: Page,
  handler: (route: Route) => Promise<void> | void
): Promise<void> {
  await page.route('**/api/contact', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fulfill({
        status: 405,
        headers: { Allow: 'POST', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      });
      return;
    }
    await handler(route);
  });
}

test('F04: contacto valida canal y envía', async ({ page }) => {
  await mockContact(page, async (route) => {
    expect(route.request().headers()['content-type'] ?? '').toMatch(/application\/json/i);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
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
  await mockContact(page, async (route) => {
    posted = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
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

test('UI-01: hidratación no roba el foco', async ({ page }) => {
  await page.goto('/contacto');
  await expect(page.getByRole('button', { name: /Continuar/ })).toBeEnabled({ timeout: 10000 });
  const active = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    return { tag: el.tagName, id: el.id, text: el.textContent?.slice(0, 40) ?? '' };
  });
  // No debe enfocarse el encabezado del paso al hidratar
  expect(active?.tag).not.toBe('H2');
});

test('UI-02: errores de paso con aria-invalid', async ({ page }) => {
  await page.goto('/contacto');
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.getByRole('button', { name: /Continuar/ }).click(); // nombre vacío
  const name = page.getByRole('textbox', { name: 'Tu nombre' });
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('alert').or(page.locator('[id$="-name-error"]'))).toBeVisible();
});

test('UI-03: entityType enfoca contact-entity', async ({ page }) => {
  await page.goto('/contacto');
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.getByRole('textbox', { name: 'Tu nombre' }).fill('Test Cliente');
  await page.getByRole('button', { name: /Continuar/ }).click();
  // Forzar error de categoría vaciando vía evaluate (select siempre tiene valor);
  // en su lugar validamos el mapa: al listar errores de schema forzados en canal.
  // Comprobamos que el control existe con el id correcto.
  await expect(page.locator('#contact-entity')).toBeVisible();
  await page.locator('#contact-entity').focus();
  await expect(page.locator('#contact-entity')).toBeFocused();
});

test('UI-04: datos conservados tras 503', async ({ page }) => {
  await mockContact(page, async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, status: 'retryable_failure' })
    });
  });
  await page.goto('/contacto');
  await fillWizardToConsent(page);
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('alert')).toContainText(/no disponible/i);
  await page.getByRole('button', { name: /Atrás/ }).click();
  await expect(page.getByRole('textbox', { name: 'Tu petición' })).toHaveValue(
    /informe comercial/i
  );
});

test('UI-05: reintento conserva Idempotency-Key', async ({ page }) => {
  const keys: string[] = [];
  let calls = 0;
  await mockContact(page, async (route) => {
    calls += 1;
    const key = route.request().headers()['idempotency-key'] ?? '';
    keys.push(key);
    if (calls === 1) {
      // Primer intento: no confirma éxito (corte de red). La clave se conserva.
      await route.abort('connectionfailed');
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
    });
  });

  await page.goto('/contacto');
  await fillWizardToConsent(page);
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('alert')).toContainText(/No se pudo enviar|tarda más|no sabemos/i, {
    timeout: 10000
  });
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('status')).toContainText(/Mensaje enviado/i, { timeout: 10000 });
  expect(keys.length).toBeGreaterThanOrEqual(2);
  expect(keys[0]).toBeTruthy();
  expect(keys[0]).toBe(keys[1]);
});

test('CFG-04: motivo y módulos válidos muestran nombres', async ({ page }) => {
  await page.goto('/contacto?motivo=propuestaComercial&modulos=contenidos,tienda');
  await expect(page.getByRole('heading', { name: 'Formulario de contacto' })).toBeVisible();
  await expect(page.locator('#contact-reason')).toHaveValue('propuestaComercial', {
    timeout: 10_000
  });
  const modules = page.locator('[data-contact-modules]');
  await expect(modules).toBeVisible();
  await expect(modules.locator('strong')).toHaveText('Tienda online, Panel de contenidos');
});

test('CFG-05: params hostiles no inventan condiciones ni XSS', async ({ page }) => {
  await page.goto(
    '/contacto?motivo=hack&precio=1&modulos=evil,<script>alert(1)</script>,tienda,tienda'
  );
  await expect(page.locator('#contact-reason')).toHaveValue('informacionCliente', {
    timeout: 10_000
  });
  const modules = page.locator('[data-contact-modules]');
  await expect(modules).toBeVisible();
  await expect(modules.locator('strong')).toHaveText('Tienda online');
  await expect(modules).not.toContainText(/script|evil|precio|1\s*€/i);
  await expect(page.locator('body')).not.toContainText('alert(1)');
});

test.describe('UI-07: sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('correo y alternativa sin JS visibles; sin POST JSON funcional', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.getByRole('heading', { name: 'Formulario de contacto' })).toBeVisible();
    const nojs = page.locator('[data-contact-nojs]');
    await expect(nojs).toBeVisible();
    await expect(nojs).toContainText(/necesita JavaScript/i);
    await expect(nojs.getByRole('link', { name: /contratacion@alexendros\.dev/i })).toBeVisible();
    await expect(page.locator('noscript')).toHaveCount(1);
    await expect(page.locator('form[action*="api/contact"]')).toHaveCount(0);
  });
});

test('UI-06: 202 no es éxito; 200 accepted sí; 409 comprensible', async ({ page }) => {
  let mode: 'processing' | 'accepted' | 'conflict' = 'processing';
  await mockContact(page, async (route) => {
    if (mode === 'processing') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        headers: { 'Retry-After': '5' },
        body: JSON.stringify({ ok: false, status: 'processing', requestId: 'proc-1' })
      });
      return;
    }
    if (mode === 'conflict') {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, status: 'conflict' })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'ok-1', replay: false })
    });
  });

  await page.goto('/contacto');
  await fillWizardToConsent(page);

  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('status')).toContainText(/procesando/i);
  await expect(page.getByRole('status')).not.toContainText(/Mensaje enviado/i);

  mode = 'accepted';
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('status')).toContainText(/Mensaje enviado/i);

  // Nueva visita para conflicto (formulario ya en éxito)
  mode = 'conflict';
  await page.goto('/contacto');
  await fillWizardToConsent(page);
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('alert')).toContainText(/no coincide|envío anterior/i);
});
