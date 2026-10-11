import { test, expect, type Page } from '@playwright/test';

const CONSENT_KEY = 'consent_v1';

async function readConsentStorage(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  }, CONSENT_KEY);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
});

test('TEST-CMP-01: sin consentimiento no hay trackers activos', async ({ page }) => {
  await page.goto('/');

  expect(await page.evaluate(() => 'gtag' in window)).toBe(false);
  expect(await page.evaluate(() => 'fbq' in window)).toBe(false);
  await expect(page.locator('script[data-tracker]')).toHaveCount(0);
  await expect(
    page.locator('script[data-tracker="ga4"], script[data-tracker="meta-pixel"]')
  ).toHaveCount(0);
});

test('F06: el banner muestra cursiva y los tres rótulos nuevos', async ({ page }) => {
  await page.goto('/');

  await expect(
    page
      .locator('.cc-normative')
      .getByText('La normativa dice que tienes que leer esto y clicar en lo que consideres.')
  ).toBeVisible();

  const accept = page.getByRole('button', { name: 'Sí a todo' }).first();
  const reject = page.getByRole('button', { name: 'Sí a lo esencial' }).first();
  const configure = page.getByRole('button', { name: 'Configuración informada' }).first();

  await expect(accept).toBeVisible();
  await expect(reject).toBeVisible();
  await expect(configure).toBeVisible();

  const acceptClass = await accept.getAttribute('class');
  const rejectClass = await reject.getAttribute('class');
  expect(acceptClass).toContain('cm__btn');
  expect(acceptClass).toBe(rejectClass);

  await accept.click();

  const consent = await readConsentStorage(page);
  expect(consent).not.toBeNull();
  expect(Object.keys(consent ?? {}).sort()).toEqual(
    ['analytics', 'marketing', 'necessary', 'preferences', 'timestamp', 'version'].sort()
  );
  expect(consent?.necessary).toBe(true);
  expect(consent?.analytics).toBe(true);
});

test('TEST-CMP-02b: al elegir lo esencial analytics y marketing quedan a false', async ({
  page
}) => {
  await page.goto('/');

  const reject = page.getByRole('button', { name: 'Sí a lo esencial' }).first();
  await expect(reject).toBeVisible();
  await reject.click();

  const consent = await readConsentStorage(page);
  expect(consent).not.toBeNull();
  expect(consent?.analytics).toBe(false);
  expect(consent?.marketing).toBe(false);
  expect(consent?.necessary).toBe(true);
});

test('TEST-CMP-02c: configuración informada abre preferencias con técnica bloqueada', async ({
  page
}) => {
  await page.goto('/');

  const configure = page.locator('#cc-main .cm__btn--secondary');
  await expect(configure).toBeVisible();
  await configure.click();

  await expect(page.getByText('Preferencias de cookies')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sí a todo' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sí a lo esencial' }).first()).toBeVisible();
  await expect(page.getByText('Cookies técnicas').first()).toBeVisible();
  await expect(page.locator('.pm input[type="checkbox"][disabled]')).toHaveCount(1);
});

test('TEST-LEGAL-02: el pie enlaza a Identidad, Privacidad y Cookies', async ({ page }) => {
  await page.goto('/');

  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: /Identidad/i }).first()).toHaveAttribute(
    'href',
    '/identidad'
  );
  await expect(footer.getByRole('link', { name: /Privacidad/i }).first()).toHaveAttribute(
    'href',
    '/privacidad'
  );
  await expect(footer.getByRole('link', { name: /Cookies/i }).first()).toHaveAttribute(
    'href',
    '/cookies'
  );

  await page.goto('/cookies');
  const table = page.getByRole('table').first();
  await expect(table).toBeVisible();
  for (const header of ['Nombre', 'Titular', 'Finalidad', 'Duración', 'Tipo']) {
    await expect(table.getByRole('columnheader', { name: header })).toBeVisible();
  }
});
