import { test, expect, type Page } from '@playwright/test';

const CONSENT_KEY = 'consent_v1';
const LOCAL_HOSTS: readonly string[] = ['127.0.0.1', 'localhost'];
const FORBIDDEN_TRACKER_HOSTS = [
  'googletagmanager.com',
  'google-analytics.com',
  'clarity.ms',
  'posthog.com',
  'facebook.net',
  'facebook.com',
  'licdn.com',
  'linkedin.com'
] as const;

type SeenRequest = { hostname: string; pathname: string };

async function readConsentStorage(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  }, CONSENT_KEY);
}

function matchesHost(hostname: string, domains: readonly string[]): boolean {
  return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

async function instrumentNetwork(page: Page): Promise<SeenRequest[]> {
  const seen: SeenRequest[] = [];
  const context = page.context();
  page.on('request', (request) => {
    const url = new URL(request.url());
    seen.push({ hostname: url.hostname, pathname: url.pathname });
  });
  await context.route(
    (url) =>
      matchesHost(url.hostname, FORBIDDEN_TRACKER_HOSTS) || url.pathname.startsWith('/_vercel'),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: '/* e2e */'
      });
    }
  );
  return seen;
}

async function waitForCmp(page: Page): Promise<void> {
  await expect(page.locator('#cc-main .cm')).toBeVisible();
}

async function waitForCmpReady(page: Page): Promise<void> {
  await expect(page.locator('html[data-cmp-ready="true"]')).toBeAttached({ timeout: 30_000 });
}

async function openPreferencesFromCookies(page: Page) {
  await waitForCmpReady(page);
  const trigger = page.locator('main').getByRole('button', { name: 'Configurar' });
  await expect(trigger).toBeVisible();
  const panel = page.locator('#cc-main .pm');
  await trigger.click();
  await expect(panel).toBeVisible({ timeout: 10_000 });
  return panel;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
});

test('TEST-CMP-01: sin consentimiento no hay scripts de Vercel Analytics', async ({ page }) => {
  const seen = await instrumentNetwork(page);
  await page.goto('/');
  await waitForCmp(page);
  const vercelHits = seen.filter((r) => r.pathname.startsWith('/_vercel'));
  expect(vercelHits).toHaveLength(0);
  expect(seen.filter((r) => matchesHost(r.hostname, FORBIDDEN_TRACKER_HOSTS))).toHaveLength(0);
});

test('F06: el banner resume, acepta y Configurar abre el modal', async ({ page }) => {
  await page.goto('/');
  await waitForCmp(page);

  await expect(page.getByRole('heading', { name: 'Valoramos tu privacidad' })).toBeVisible();
  await expect(page.getByText(/Vercel Analytics/)).toBeVisible();

  const accept = page.getByRole('button', { name: 'Aceptar todas' }).first();
  const reject = page.getByRole('button', { name: 'Rechazar opcionales' }).first();
  const configure = page.getByRole('button', { name: /Configurar/ }).first();
  await expect(accept).toBeVisible();
  await expect(reject).toBeVisible();
  await expect(configure).toBeVisible();

  await configure.click();
  await expect(page.locator('#cc-main .pm')).toBeVisible();
  await page
    .locator('#cc-main .pm')
    .getByRole('button', { name: 'Cerrar panel de cookies' })
    .click();

  await accept.click();
  const consent = await readConsentStorage(page);
  expect(consent).not.toBeNull();
  expect(Object.keys(consent ?? {}).sort()).toEqual(
    ['analytics', 'necessary', 'timestamp', 'version'].sort()
  );
  expect(consent?.necessary).toBe(true);
  expect(consent?.analytics).toBe(true);
  expect(consent?.version).toBe(3);
});

test('TEST-CMP-02b: al elegir lo esencial analytics queda a false', async ({ page }) => {
  await page.goto('/');
  await waitForCmp(page);
  await page.getByRole('button', { name: 'Rechazar opcionales' }).first().click();
  await expect.poll(async () => (await readConsentStorage(page))?.analytics).toBe(false);
  await expect.poll(async () => (await readConsentStorage(page))?.necessary).toBe(true);
});

test('TEST-CMP-03: aceptar analítica carga /_vercel y no loaders de terceros', async ({ page }) => {
  const seen = await instrumentNetwork(page);
  await page.goto('/');
  await waitForCmp(page);
  await page.getByRole('button', { name: 'Aceptar todas' }).first().click();
  await expect.poll(async () => (await readConsentStorage(page))?.analytics).toBe(true);

  await expect
    .poll(() => seen.some((r) => r.pathname.startsWith('/_vercel')), { timeout: 15_000 })
    .toBe(true);
  expect(seen.filter((r) => matchesHost(r.hostname, FORBIDDEN_TRACKER_HOSTS))).toHaveLength(0);
  expect(
    seen.filter((r) => !LOCAL_HOSTS.includes(r.hostname) && !r.pathname.startsWith('/_vercel'))
  ).toEqual(
    expect.not.arrayContaining(FORBIDDEN_TRACKER_HOSTS.map((h) => expect.stringContaining(h)))
  );
});

test('TEST-CMP-04: panel desde /cookies/ solo tiene necessary y analytics', async ({ page }) => {
  await page.goto('/cookies/');
  const panel = await openPreferencesFromCookies(page);
  await expect(panel.locator('input.section__toggle[value="analytics"]')).toHaveCount(1);
  await expect(panel.locator('input.section__toggle[value="marketing"]')).toHaveCount(0);
  await expect(panel.locator('input.section__toggle[value="preferences"]')).toHaveCount(0);
});
