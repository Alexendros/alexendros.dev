import { test, expect, type Page } from '@playwright/test';

const CONSENT_KEY = 'consent_v1';

async function readConsentStorage(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  }, CONSENT_KEY);
}

/**
 * Hosts de terceros que solo deben recibir tráfico con consentimiento de su
 * categoría. La comprobación fuerte de PRIV-01/PRIV-02 es "cero peticiones a
 * cualquier host que no sea el preview", de modo que también detecta
 * proveedores nuevos que nadie haya dado de alta en esta lista.
 */
const ANALYTICS_HOSTS = [
  'googletagmanager.com',
  'google-analytics.com',
  'clarity.ms',
  'i.posthog.com',
  'posthog.com'
] as const;

const MARKETING_HOSTS = ['facebook.net', 'facebook.com', 'licdn.com', 'linkedin.com'] as const;

const LOCAL_HOSTS: readonly string[] = ['127.0.0.1', 'localhost'];

type SeenRequest = { hostname: string; pathname: string };

function matchesHost(hostname: string, domains: readonly string[]): boolean {
  return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function isTrackerHost(hostname: string): boolean {
  return matchesHost(hostname, ANALYTICS_HOSTS) || matchesHost(hostname, MARKETING_HOSTS);
}

/**
 * Registra cada petición de la página y responde a los hosts de trackers con
 * un stub local: se observa la intención de red sin alcanzar nunca la API
 * real (determinismo y cero tráfico a terceros desde las pruebas).
 */
async function instrumentNetwork(page: Page): Promise<SeenRequest[]> {
  const seen: SeenRequest[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    seen.push({ hostname: url.hostname, pathname: url.pathname });
  });
  await page.route(
    (url) => isTrackerHost(url.hostname),
    (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* e2e */' })
  );
  return seen;
}

function requestsOutsidePreview(seen: SeenRequest[]): string[] {
  return seen
    .filter((request) => !LOCAL_HOSTS.includes(request.hostname))
    .map((request) => `${request.hostname}${request.pathname}`);
}

function requestsForHosts(seen: SeenRequest[], domains: readonly string[]): string[] {
  return seen
    .filter((request) => matchesHost(request.hostname, domains))
    .map((request) => `${request.hostname}${request.pathname}`);
}

/**
 * vanilla-cookieconsent arranca con `hideFromBots` por defecto: si
 * `navigator.webdriver` es true (Playwright headless por defecto) no monta
 * ningún control. El init de beforeEach lo deja a false, que es lo que ve un
 * navegador real. Además hay que esperar a que el aviso esté montado (el
 * island del CMP hidrata en client:idle) antes de interactuar.
 */
async function waitForCmp(page: Page): Promise<void> {
  await expect(page.locator('#cc-main .cm')).toBeVisible();
}

function readConsentCookie(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate((key) => {
    const prefix = `${encodeURIComponent(key)}=`;
    const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix));
    if (!entry) return null;
    try {
      return JSON.parse(decodeURIComponent(entry.slice(prefix.length))) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, CONSENT_KEY);
}

function trackerGlobals(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    ['gtag', 'fbq', 'posthog', 'lintrk', '_linkedin_partner_id'].filter((key) => key in window)
  );
}

function trackerTags(page: Page): Promise<string[]> {
  return page
    .locator('script[data-tracker]')
    .evaluateAll((scripts) => scripts.map((script) => script.getAttribute('data-tracker') ?? ''));
}

/**
 * Con el preview instrumentado (ver playwright.config.ts) la analítica aceptada
 * debe cargarse de verdad: sin esa comprobación la granularidad se cumpliría
 * por vacío. Con el artefacto de CI sin IDs solo es demostrable la parte
 * negativa, así que se anota la limitación en el informe en lugar de fingir
 * que se ha cubierto.
 */
function expectAnalyticsLoaded(tags: string[]): void {
  if (tags.length === 0) {
    test.info().annotations.push({
      type: 'limitación',
      description:
        'el preview no trae IDs de tracker: la carga positiva de analítica no es observable'
    });
    return;
  }
  expect(tags).toEqual(expect.arrayContaining(['ga4', 'gtm', 'clarity', 'posthog']));
}

/** Flujo real de usuario: abre el panel desde /cookies y guarda solo analítica. */
async function acceptOnlyAnalytics(page: Page): Promise<void> {
  await page.goto('/cookies');
  await waitForCmp(page);
  await page.locator('main').getByRole('button', { name: 'Configuración informada' }).click();

  const panel = page.locator('#cc-main .pm');
  await expect(panel).toBeVisible();
  await panel
    .locator('label.section__toggle-wrapper:has(input.section__toggle[value="analytics"])')
    .click();
  await expect(panel.locator('input.section__toggle[value="analytics"]')).toBeChecked();
  await expect(panel.locator('input.section__toggle[value="marketing"]')).not.toBeChecked();
  await panel.getByRole('button', { name: 'Guardar esta elección' }).click();

  await expect.poll(async () => (await readConsentStorage(page))?.analytics).toBe(true);
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

test('F06: el banner resume, acepta todo o esencial, y Configuración informada va a /cookies', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.locator('.cc-normative')).toHaveCount(0);

  const accept = page.getByRole('button', { name: 'Aceptación desinformada' }).first();
  if (!(await accept.isVisible().catch(() => false))) {
    await page.goto('/cookies');
    await expect(page.getByRole('heading', { name: 'Cookies' })).toBeVisible();
    await expect(page.getByText(/Aceptación desinformada/).first()).toBeVisible();
    return;
  }

  await expect(page.getByRole('heading', { name: 'Valoramos tu privacidad' })).toBeVisible();
  await expect(page.getByText(/Guardamos un dato técnico/)).toBeVisible();

  const reject = page.getByRole('button', { name: 'Sí a lo esencial' }).first();
  const configure = page.getByRole('button', { name: /Configuración informada/ }).first();

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
  if (!(await reject.isVisible().catch(() => false))) {
    await expect(page.locator('script[data-tracker]')).toHaveCount(0);
    return;
  }
  await expect(reject).toBeVisible();
  await reject.click();

  const consent = await readConsentStorage(page);
  expect(consent).not.toBeNull();
  expect(consent?.analytics).toBe(false);
  expect(consent?.marketing).toBe(false);
  expect(consent?.necessary).toBe(true);
});

test('TEST-CMP-02c: Configuración informada lleva a /cookies y abre el panel', async ({ page }) => {
  await page.goto('/');

  const configure = page.getByRole('button', { name: /Configuración informada/ }).first();
  const fromBanner = await configure.isVisible().catch(() => false);
  if (fromBanner) {
    await configure.click();
  } else {
    await page.goto('/cookies');
  }
  await expect(page).toHaveURL(/\/cookies/);
  await expect(page.getByRole('heading', { name: 'Cookies' })).toBeVisible();

  const trigger = page.locator('main').getByRole('button', { name: 'Configuración informada' });
  await expect(trigger).toBeVisible();
  if (!fromBanner) return;
  await trigger.click();

  await expect(page.getByText('Elige qué se activa')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Aceptación desinformada' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sí a lo esencial' }).first()).toBeVisible();
  await expect(page.getByText('Técnicas (obligatorias)').first()).toBeVisible();
  await expect(page.getByText('Publicidad').first()).toBeVisible();
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
  for (const header of ['Nombre', 'Quién la emite', 'Para qué (en claro)', 'Cuánto dura', 'Tipo']) {
    await expect(table.getByRole('columnheader', { name: header })).toBeVisible();
  }
});

test('PRIV-01a: sin decisión no hay una sola petición no esencial', async ({ page }) => {
  const seen = await instrumentNetwork(page);

  await page.goto('/');
  await waitForCmp(page);
  // Estado de red en reposo (nada de esperas arbitrarias): si alguna etiqueta
  // se hubiera inyectado al cargar, su petición ya estaría en `seen`.
  await page.waitForLoadState('networkidle');

  expect(requestsOutsidePreview(seen)).toEqual([]);
  expect(seen.filter((request) => request.pathname.startsWith('/_vercel'))).toEqual([]);
  await expect(page.locator('script[data-tracker]')).toHaveCount(0);
  expect(await trackerGlobals(page)).toEqual([]);
  // Sin decisión tampoco se escribe nada: no hay cookie del CMP.
  expect(await page.evaluate(() => document.cookie)).not.toContain(CONSENT_KEY);
  expect(await readConsentStorage(page)).toBeNull();
});

test('PRIV-01b: rechazo expreso y la navegación sigue sin terceros', async ({ page }) => {
  const seen = await instrumentNetwork(page);

  await page.goto('/');
  await waitForCmp(page);
  await page.locator('#cc-main .cm').getByRole('button', { name: 'Sí a lo esencial' }).click();

  await expect.poll(async () => (await readConsentStorage(page))?.analytics).toBe(false);
  const consent = await readConsentStorage(page);
  expect(consent?.necessary).toBe(true);
  expect(consent?.marketing).toBe(false);

  await page.goto('/servicios');
  await page.waitForLoadState('networkidle');

  expect(requestsOutsidePreview(seen)).toEqual([]);
  expect(seen.filter((request) => request.pathname.startsWith('/_vercel'))).toEqual([]);
  await expect(page.locator('script[data-tracker]')).toHaveCount(0);
  expect(await trackerGlobals(page)).toEqual([]);
});

test('PRIV-01c: control positivo, con consentimiento total los trackers sí cargan', async ({
  page
}) => {
  const seen = await instrumentNetwork(page);

  await page.goto('/');
  await waitForCmp(page);
  await page
    .locator('#cc-main .cm')
    .getByRole('button', { name: 'Aceptación desinformada' })
    .click();
  await expect.poll(async () => (await readConsentStorage(page))?.marketing).toBe(true);

  const tags = await trackerTags(page);
  test.skip(
    tags.length === 0,
    'El preview se construyó sin IDs de tracker (artefacto de CI): el camino positivo no es observable. Ver playwright.config.ts.'
  );

  // Si las etiquetas cargan con consentimiento, PRIV-01a/PRIV-01b no pasan por
  // vacuidad cuando el build sí trae IDs.
  expect(requestsOutsidePreview(seen).length).toBeGreaterThan(0);
  expect(tags).toEqual(
    expect.arrayContaining(['ga4', 'gtm', 'meta-pixel', 'clarity', 'posthog', 'linkedin'])
  );
});

/**
 * Gap conocido y no cubrible con el preview local: en un build con `VERCEL=1`
 * (el que hace Vercel en producción) `__IS_VERCEL__` monta Analytics y Speed
 * Insights en cada página, y el navegador pide `/_vercel/insights/script.js` y
 * `/_vercel/speed-insights/script.js` sin consentimiento. El preview local se
 * construye sin `VERCEL`, así que `__IS_VERCEL__` es false y PRIV-01a no puede
 * observarlo. Reproducción: `VERCEL=1 pnpm build` + servir + mirar la red.
 * Decisión pendiente de producto: gatearlos por consentimiento o declararlos
 * exentos (cookieless) y relajar entonces esta comprobación.
 */
test.fixme('PRIV-01d: en un build tipo Vercel los scripts /_vercel/* tampoco deberían pedirse sin consentimiento', async ({
  page
}) => {
  const seen = await instrumentNetwork(page);

  await page.goto('/');
  await waitForCmp(page);
  await page.waitForLoadState('networkidle');

  expect(seen.filter((request) => request.pathname.startsWith('/_vercel'))).toEqual([]);
});

test('PRIV-02: aceptar solo analítica no enciende ningún proveedor de publicidad', async ({
  page
}) => {
  const seen = await instrumentNetwork(page);

  await acceptOnlyAnalytics(page);

  const consent = await readConsentStorage(page);
  expect(consent?.analytics).toBe(true);
  expect(consent?.marketing).toBe(false);
  expect(consent?.preferences).toBe(false);

  // Almacenamiento: la cookie del CMP (la que se relee al recargar) declara
  // analítica y nada de publicidad.
  const cookie = await readConsentCookie(page);
  expect(cookie?.categories).toEqual(['necessary', 'analytics']);

  // Red: ninguna petición a hosts de publicidad.
  expect(requestsForHosts(seen, MARKETING_HOSTS)).toEqual([]);

  // DOM y estado global: ni script de pixel ni API de publicidad.
  const tags = await trackerTags(page);
  expect(tags).not.toContain('meta-pixel');
  expect(tags).not.toContain('linkedin');
  expect(tags.every((tag) => ['ga4', 'gtm', 'clarity', 'posthog'].includes(tag))).toBe(true);
  const globals = await trackerGlobals(page);
  expect(globals).not.toContain('fbq');
  expect(globals).not.toContain('lintrk');
  expectAnalyticsLoaded(tags);
});

test('PRIV-02b: la elección de solo analítica persiste al recargar sin abrir publicidad', async ({
  page
}) => {
  const seen = await instrumentNetwork(page);
  await acceptOnlyAnalytics(page);
  await page.reload();
  await expect.poll(async () => (await readConsentStorage(page))?.analytics).toBe(true);
  await page.waitForLoadState('networkidle');

  expect(requestsForHosts(seen, MARKETING_HOSTS)).toEqual([]);
  const tags = await trackerTags(page);
  expect(tags).not.toContain('meta-pixel');
  expect(tags).not.toContain('linkedin');
  expect(await page.evaluate(() => 'fbq' in window)).toBe(false);
  expect(await page.evaluate(() => 'lintrk' in window)).toBe(false);
  expectAnalyticsLoaded(tags);
});

test('PRIV-05: en vista no-bot el aviso y el panel de preferencias son visibles y usables', async ({
  page
}) => {
  await page.goto('/');
  const banner = page.locator('#cc-main .cm');
  await waitForCmp(page);
  await expect(banner).toHaveAttribute('role', 'dialog');
  await expect(banner.getByRole('heading', { name: 'Valoramos tu privacidad' })).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Aceptación desinformada' })).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Sí a lo esencial' })).toBeVisible();
  // El botón de configuración se localiza por su rol de datos y su rótulo
  // visible: el CMP le reescribe el aria-label para explicar que lleva a
  // /cookies, así que su nombre accesible no es el texto del botón.
  const configure = banner.locator('button[data-role="show"]');
  await expect(configure).toBeVisible();
  await expect(configure).toHaveText('Configuración informada');
  await expect(configure).toHaveAttribute('aria-label', /cookies/i);

  await page.goto('/cookies');
  await waitForCmp(page);
  await page.locator('main').getByRole('button', { name: 'Configuración informada' }).click();

  const panel = page.locator('#cc-main .pm');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('heading', { name: 'Elige qué se activa' })).toBeVisible();
  await expect(panel.locator('input.section__toggle')).toHaveCount(4);
  await expect(panel.locator('input.section__toggle[value="necessary"]')).toBeDisabled();
  await expect(panel.locator('input.section__toggle[value="necessary"]')).toBeChecked();
  for (const category of ['preferences', 'analytics', 'marketing']) {
    const toggle = panel.locator(`input.section__toggle[value="${category}"]`);
    await expect(toggle).toBeEnabled();
    await expect(toggle).not.toBeChecked();
  }
  await expect(panel.getByRole('button', { name: 'Guardar esta elección' })).toBeEnabled();

  // Usable con teclado: Escape cierra sin decidir y no deja consentimiento.
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  expect(await readConsentStorage(page)).toBeNull();
});
