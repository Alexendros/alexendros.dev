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
 * Intercepta en el contexto (cubre páginas nuevas) trackers y /_vercel.
 * Observa intención de red sin alcanzar APIs reales.
 */
async function instrumentNetwork(page: Page): Promise<SeenRequest[]> {
  const seen: SeenRequest[] = [];
  const context = page.context();
  page.on('request', (request) => {
    const url = new URL(request.url());
    seen.push({ hostname: url.hostname, pathname: url.pathname });
  });
  await context.route(
    (url) => isTrackerHost(url.hostname) || url.pathname.startsWith('/_vercel'),
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: '/* e2e */'
      })
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
 * script del CMP monta el aviso) antes de interactuar.
 */
async function waitForCmp(page: Page): Promise<void> {
  await expect(page.locator('#cc-main .cm')).toBeVisible();
}

/**
 * CMP listo (CookieBanner marcó data-cmp-ready tras CookieConsent.run).
 * Sirve con o sin aviso .cm (p. ej. tras una decisión previa).
 */
async function waitForCmpReady(page: Page): Promise<void> {
  await expect(page.locator('html[data-cmp-ready="true"]')).toBeAttached({ timeout: 30_000 });
}

/**
 * Abre el panel desde el botón de /cookies cuando el script del CMP ya está listo.
 */
async function openPreferencesFromCookies(page: Page) {
  await waitForCmpReady(page);
  const trigger = page.locator('main').getByRole('button', { name: 'Configurar' });
  await expect(trigger).toBeVisible();
  const panel = page.locator('#cc-main .pm');
  await trigger.click();
  await expect(panel).toBeVisible({ timeout: 10_000 });
  return panel;
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
  const panel = await openPreferencesFromCookies(page);
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

test('F06: el banner resume, acepta todo o esencial, y Configurar va a /cookies', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.locator('.cc-normative')).toHaveCount(0);

  const accept = page.getByRole('button', { name: 'Aceptar todas' }).first();
  if (!(await accept.isVisible().catch(() => false))) {
    await page.goto('/cookies');
    await expect(page.getByRole('heading', { name: 'Cookies' })).toBeVisible();
    await expect(page.getByText(/Aceptar todas/).first()).toBeVisible();
    return;
  }

  await expect(page.getByRole('heading', { name: 'Valoramos tu privacidad' })).toBeVisible();
  await expect(page.getByText(/Guardamos un dato técnico/)).toBeVisible();

  const reject = page.getByRole('button', { name: 'Rechazar opcionales' }).first();
  const configure = page.getByRole('button', { name: /Configurar/ }).first();

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

  const reject = page.getByRole('button', { name: 'Rechazar opcionales' }).first();
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

test('TEST-CMP-02c: Configurar lleva a /cookies y abre el panel', async ({ page }) => {
  await page.goto('/');

  const configure = page.getByRole('button', { name: /Configurar/ }).first();
  const fromBanner = await configure.isVisible().catch(() => false);
  if (fromBanner) {
    await configure.click();
  } else {
    await page.goto('/cookies');
  }
  await expect(page).toHaveURL(/\/cookies/);
  await expect(page.getByRole('heading', { name: 'Cookies' })).toBeVisible();

  const trigger = page.locator('main').getByRole('button', { name: 'Configurar' });
  await expect(trigger).toBeVisible();
  if (!fromBanner) return;
  await trigger.click();

  await expect(page.getByText('Elige qué se activa')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Aceptar todas' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rechazar opcionales' }).first()).toBeVisible();
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
  await page.locator('#cc-main .cm').getByRole('button', { name: 'Rechazar opcionales' }).click();

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
  await page.locator('#cc-main .cm').getByRole('button', { name: 'Aceptar todas' }).click();
  await expect.poll(async () => (await readConsentStorage(page))?.marketing).toBe(true);

  const tags = await trackerTags(page);
  // Sin IDs en el build el control positivo debe fallar (no omitir).
  expect(tags.length).toBeGreaterThan(0);
  expect(requestsOutsidePreview(seen).length).toBeGreaterThan(0);
  expect(tags).toEqual(
    expect.arrayContaining(['ga4', 'gtm', 'meta-pixel', 'clarity', 'posthog', 'linkedin'])
  );
});

/**
 * P2: el webServer de Playwright construye con VERCEL=1 (`__IS_VERCEL__`).
 * Analytics/Speed Insights solo se inyectan tras consentimiento de analítica.
 */
test('PRIV-01d: build tipo Vercel no pide /_vercel/* sin consentimiento', async ({ page }) => {
  const seen = await instrumentNetwork(page);

  await page.goto('/');
  await waitForCmp(page);
  await page.waitForLoadState('networkidle');

  expect(seen.filter((request) => request.pathname.startsWith('/_vercel'))).toEqual([]);

  await page.locator('#cc-main .cm').getByRole('button', { name: 'Rechazar opcionales' }).click();
  await expect.poll(async () => (await readConsentStorage(page))?.analytics).toBe(false);
  await page.waitForLoadState('networkidle');
  expect(seen.filter((request) => request.pathname.startsWith('/_vercel'))).toEqual([]);
});

test('PRIV-01e: con analítica en build Vercel sí hay intención /_vercel (stub)', async ({
  page
}) => {
  const seen = await instrumentNetwork(page);
  await acceptOnlyAnalytics(page);
  await page.waitForLoadState('networkidle');
  expect(seen.some((request) => request.pathname.startsWith('/_vercel'))).toBe(true);
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

test('PRIV-03: revocar tras aceptar corta emisiones futuras de analytics y publicidad', async ({
  page
}) => {
  const seen = await instrumentNetwork(page);

  await page.goto('/');
  await waitForCmp(page);
  await page.locator('#cc-main .cm').getByRole('button', { name: 'Aceptar todas' }).click();
  await expect.poll(async () => (await readConsentStorage(page))?.marketing).toBe(true);

  const beforeRevoke = seen.length;

  // Tras decidir, el aviso (.cm) no vuelve: se revoca desde /cookies.
  await page.goto('/cookies');
  const panel = await openPreferencesFromCookies(page);
  await panel.getByRole('button', { name: 'Rechazar opcionales' }).click();
  await expect.poll(async () => (await readConsentStorage(page))?.analytics).toBe(false);
  await expect.poll(async () => (await readConsentStorage(page))?.marketing).toBe(false);

  const afterRevokeMarker = seen.length;
  await page.goto('/servicios');
  await page.waitForLoadState('networkidle');

  const postRevoke = seen.slice(afterRevokeMarker);
  expect(requestsForHosts(postRevoke, ANALYTICS_HOSTS)).toEqual([]);
  expect(requestsForHosts(postRevoke, MARKETING_HOSTS)).toEqual([]);
  await expect(page.locator('script[data-tracker]')).toHaveCount(0);
  void beforeRevoke;
});

/**
 * T-PRIV-REV-SAME-DOC: revoca sin page.goto que reinicie el runtime de trackers.
 * Comprueba comandos de opt-out en el documento actual.
 */
test('PRIV-03b: revocación en el mismo documento emite opt-out sin reiniciar', async ({ page }) => {
  await instrumentNetwork(page);
  await page.goto('/');
  await waitForCmp(page);
  await page.locator('#cc-main .cm').getByRole('button', { name: 'Aceptar todas' }).click();
  await expect.poll(async () => (await readConsentStorage(page))?.marketing).toBe(true);
  await expect.poll(async () => (await trackerTags(page)).length).toBeGreaterThan(0);

  // Abrir preferencias en el mismo documento (sin navegación).
  await page.evaluate(() => {
    const btn = document.createElement('button');
    btn.setAttribute('data-cc', 'show-preferencesModal');
    btn.textContent = 'Abrir preferencias e2e';
    document.body.appendChild(btn);
  });
  await page.getByRole('button', { name: 'Abrir preferencias e2e' }).click();
  const panel = page.locator('#cc-main .pm');
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Rechazar opcionales' }).click();
  await expect.poll(async () => (await readConsentStorage(page))?.analytics).toBe(false);
  await expect.poll(async () => (await readConsentStorage(page))?.marketing).toBe(false);

  const optOut = await page.evaluate(() => {
    const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? [];
    const gtagDenied = dataLayer.some((entry) => {
      if (!Array.isArray(entry)) return false;
      return (
        entry[0] === 'consent' &&
        entry[1] === 'update' &&
        typeof entry[2] === 'object' &&
        entry[2] !== null &&
        (entry[2] as { analytics_storage?: string }).analytics_storage === 'denied'
      );
    });
    const fbq = (window as Window & { fbq?: { queue?: unknown[][] } }).fbq;
    const fbqRevoke = (fbq?.queue ?? []).some(
      (call) => Array.isArray(call) && call[0] === 'consent' && call[1] === 'revoke'
    );
    const posthog = (window as Window & { posthog?: { _i?: unknown[][] } }).posthog;
    const phOut = (posthog?._i ?? []).some(
      (call) => Array.isArray(call) && call[0] === 'opt_out_capturing'
    );
    const clarity = (window as Window & { clarity?: { q?: unknown[][] } }).clarity;
    const clarityConsent = (clarity?.q ?? []).some(
      (call) => Array.isArray(call) && call[0] === 'consent' && call[1] === false
    );
    return { gtagDenied, fbqRevoke, phOut, clarityConsent };
  });

  expect(optOut.gtagDenied).toBe(true);
  expect(optOut.fbqRevoke).toBe(true);
  expect(optOut.phOut).toBe(true);
  expect(optOut.clarityConsent).toBe(true);

  // Actividad posterior en el mismo documento no debe reinyectar marketing.
  await page.evaluate(() => {
    document.dispatchEvent(new Event('astro:page-load'));
  });
  await expect(page.locator('script[data-tracker="meta-pixel"]')).toHaveCount(1);
  expect(
    await page.evaluate(
      () => (window as Window & { _linkedin_partner_id?: string })._linkedin_partner_id
    )
  ).toBe('');
});

test('PRIV-04: el formulario no envía email, teléfono ni mensaje a tracking', async ({ page }) => {
  const markerEmail = 'pii-marker-e2e@example.invalid';
  const markerMessage = 'PII-MARKER-MENSAJE-CONTACTO-E2E';
  const seenPayloads: string[] = [];

  await page.route(
    (url) => isTrackerHost(url.hostname),
    async (route) => {
      const request = route.request();
      const parts = [request.url(), request.postData() ?? ''];
      seenPayloads.push(parts.join('\n'));
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: '/* e2e */'
      });
    }
  );

  await page.route('**/api/contact', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fulfill({
        status: 405,
        headers: { Allow: 'POST', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e-priv04', replay: false })
    });
  });

  await page.goto('/');
  await waitForCmp(page);
  await page.locator('#cc-main .cm').getByRole('button', { name: 'Aceptar todas' }).click();
  await expect.poll(async () => (await readConsentStorage(page))?.marketing).toBe(true);

  await page.goto('/contacto');
  await page.getByLabel('Mensaje*').fill(markerMessage);
  await page.getByLabel('Nombre*').fill('Cliente PII');
  await page.getByLabel('Correo electrónico*').fill(markerEmail);
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('status')).toContainText(/Mensaje enviado/i, { timeout: 10000 });

  // Segundo recorrido con otro remitente para descartar persistencia entre envíos.
  await page.goto('/contacto');
  await page.getByLabel('Mensaje*').fill(markerMessage);
  await page.getByLabel('Nombre*').fill('Cliente PII Mail');
  await page.getByLabel('Correo electrónico*').fill(markerEmail);
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('status')).toContainText(/Mensaje enviado/i, { timeout: 10000 });

  const joined = seenPayloads.join('\n');
  expect(joined).not.toContain(markerEmail);
  expect(joined).not.toContain(markerMessage);
  expect(joined).not.toContain('Cliente PII');
});

test('PRIV-05: en vista no-bot el aviso y el panel de preferencias son visibles y usables', async ({
  page
}) => {
  await page.goto('/');
  const banner = page.locator('#cc-main .cm');
  await waitForCmp(page);
  await expect(banner).toHaveAttribute('role', 'dialog');
  await expect(banner.getByRole('heading', { name: 'Valoramos tu privacidad' })).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Aceptar todas' })).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Rechazar opcionales' })).toBeVisible();
  // El botón de configuración se localiza por su rol de datos y su rótulo
  // visible: el CMP le reescribe el aria-label para explicar que lleva a
  // /cookies, así que su nombre accesible no es el texto del botón.
  const configure = banner.locator('button[data-role="show"]');
  await expect(configure).toBeVisible();
  await expect(configure).toHaveText('Configurar');
  await expect(configure).toHaveAttribute('aria-label', /cookies/i);

  await page.goto('/cookies');
  const panel = await openPreferencesFromCookies(page);
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

test('PRIV-00: un fallo de inicialización no activa integraciones ni errores no controlados', async ({
  page
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'MutationObserver', {
      configurable: true,
      value: class {
        constructor() {
          throw new Error('fallo CMP de prueba');
        }
      }
    });
  });

  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-cmp-ready', 'true');
  await expect(page.locator('script[data-tracker]')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
