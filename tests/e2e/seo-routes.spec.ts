import { test, expect, type Page } from '@playwright/test';
import { services } from '../../src/content/services';

/** Semillas del rastreo: las dos portadas desde las que se navega al resto. */
const CRAWL_SEEDS = ['/', '/servicios'];

/** Rutas públicas que el sitemap debe anunciar (con la barra final que emite Astro). */
const SITEMAP_PUBLIC_PATHS = [
  '/',
  '/contacto/',
  '/cookies/',
  '/identidad/',
  '/privacidad/',
  '/proceso-y-entrega/',
  '/proyectos/',
  '/servicios/',
  '/servicios/informe-comercial/',
  '/servicios/sesion-profesional/',
  '/servicios/auditoria-normativa-ciberseguridad/'
];

const SITEMAP_RETIRED_PATHS = ['/metodologia/', '/valores/'];

const NOINDEX_PATH = '/design-system';

/**
 * Normaliza un href a una ruta interna rastreable. Descarta enlaces externos,
 * anclas, correo/teléfono, ficheros y las rutas que no forman parte del build
 * estático (`/api/*` y las redirecciones `/r/<code>`, que son SSR).
 */
function internalPath(href: string, origin: string): string | null {
  if (!href || href.startsWith('#') || /^(mailto|tel|javascript|data):/i.test(href)) return null;

  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;

  const { pathname } = url;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/r/')
  ) {
    return null;
  }
  if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return null;

  return pathname;
}

/** Rutas internas enlazadas desde una página, sin duplicados. */
async function internalLinksOf(page: Page, path: string): Promise<string[]> {
  const response = await page.goto(path);
  expect(response?.status(), `${path} debe responder 200`).toBe(200);

  const origin = new URL(page.url()).origin;
  const hrefs = await page
    .locator('a[href]')
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''));

  const paths = hrefs
    .map((href) => internalPath(href, origin))
    .filter((candidate): candidate is string => candidate !== null);

  return [...new Set(paths)];
}

test('ROUTE-01: ningún enlace interno de / y /servicios está roto', async ({ page, request }) => {
  const collected = new Map<string, string[]>();
  for (const seed of CRAWL_SEEDS) {
    for (const path of await internalLinksOf(page, seed)) {
      collected.set(path, [...(collected.get(path) ?? []), seed]);
    }
  }

  const paths = [...collected.keys()].sort();
  // Guarda anti-falso-verde: si el extractor de enlaces se rompe, este test
  // falla en lugar de pasar sin haber comprobado nada.
  expect(paths.length, 'el rastreo debe encontrar enlaces internos').toBeGreaterThanOrEqual(10);

  const broken: string[] = [];
  for (const path of paths) {
    const response = await request.get(path);
    if (response.status() !== 200) {
      broken.push(`${path} → HTTP ${response.status()} (desde ${collected.get(path)?.join(', ')})`);
    }
  }

  expect(broken, 'ninguna ruta interna enlazada puede estar rota').toEqual([]);
});

test('ROUTE-02: el sitemap anuncia las páginas públicas y excluye /design-system', async ({
  page,
  request
}) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);
  const sitemaps = [...(await index.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1]
  );
  expect(sitemaps.length, 'sitemap-index.xml debe apuntar a algún sitemap').toBeGreaterThan(0);

  const entries: string[] = [];
  for (const sitemapUrl of sitemaps) {
    const response = await request.get(new URL(sitemapUrl).pathname);
    expect(response.status(), `${sitemapUrl} debe existir en el build`).toBe(200);
    entries.push(
      ...[...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
    );
  }

  const paths = entries.map((entry) => new URL(entry).pathname);
  for (const publicPath of SITEMAP_PUBLIC_PATHS) {
    expect(paths, `el sitemap debe incluir ${publicPath}`).toContain(publicPath);
  }
  for (const retiredPath of SITEMAP_RETIRED_PATHS) {
    expect(paths, `el sitemap no debe incluir ${retiredPath}`).not.toContain(retiredPath);
  }
  expect(paths.filter((path) => path.startsWith(NOINDEX_PATH))).toEqual([]);

  const missing: string[] = [];
  for (const path of paths) {
    const response = await request.get(path);
    if (response.status() !== 200) missing.push(`${path} → HTTP ${response.status()}`);
  }
  expect(missing, 'toda entrada del sitemap debe resolverse').toEqual([]);

  // /design-system existe como vitrina interna, pero no debe ser indexable.
  const designSystem = await page.goto(NOINDEX_PATH);
  expect(designSystem?.status(), `${NOINDEX_PATH} debe existir (noindex, no 404)`).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('ROUTE-02b: /proceso-y-entrega emite canonical alineado con el HTML construido', async ({
  page
}) => {
  await page.goto('/proceso-y-entrega');
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', /proceso-y-entrega\/?$/);
  const href = await canonical.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href!).toMatch(/^https:\/\/alexendros\.dev\/proceso-y-entrega\/?$/);
});

test('ROUTE-03: un slug inexistente en /servicios responde 404 real, no un 200 de fallback', async ({
  page,
  request
}) => {
  // Control: las fichas comerciales reales sí responden 200.
  for (const service of services) {
    const response = await request.get(`/servicios/${service.slug}`);
    expect(response.status(), `/servicios/${service.slug} debe existir`).toBe(200);
  }

  const missingPath = '/servicios/no-existe-esta-ruta';
  const missing = await request.get(missingPath);
  expect(missing.status()).toBe(404);
  expect(await missing.text(), 'debe servirse la página 404 del sitio').toContain(
    'Esta página no existe'
  );

  const navigation = await page.goto(missingPath);
  expect(navigation?.status()).toBe(404);
  await expect(page.locator('main').getByRole('heading', { level: 1 })).toHaveText(
    'Esta página no existe'
  );
  await expect(page.locator('main')).not.toContainText(services[0].title);
});

test('ROUTE-04: embudo retirado no anuncia lead-magnet ni newsletter', async ({ request }) => {
  for (const path of [
    '/api/lead-magnet',
    '/api/newsletter/confirm',
    '/api/newsletter/unsubscribe'
  ]) {
    const response = await request.fetch(path, { method: 'GET' });
    expect(
      [404, 405].includes(response.status()),
      `${path} no debe servir un 200 de producto (HTTP ${response.status()})`
    ).toBe(true);
  }

  // `/servicios/web-para` solo redirige en Vercel (`vercel.json`); el preview
  // estático de Astro no aplica esas reglas. Aquí basta con que no haya ficha.
  // La permanencia del redirect se cubre en `redirects-web-para.test.ts`.
  const webPara = await request.get('/servicios/web-para');
  expect(webPara.status(), 'web-para no debe ser una ficha 200').not.toBe(200);
});

/** Semilla CP-10: títulos/descripciones deben ser específicos (no vacíos ni clonados). */
const TITLE_SEED_PATHS = [
  '/',
  '/servicios',
  '/servicios/informe-comercial',
  '/servicios/sesion-profesional',
  '/servicios/auditoria-normativa-ciberseguridad',
  '/proyectos',
  '/proceso-y-entrega',
  '/contacto',
  '/identidad',
  '/privacidad',
  '/cookies'
] as const;

test('ROUTE-05: canonical y og:url ignoran query de contacto', async ({ page }) => {
  await page.goto('/contacto?servicio=informe-comercial&proyecto=front-valencia&utm_source=test');
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  const href = await canonical.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href!).toMatch(/^https:\/\/alexendros\.dev\/contacto\/?$/);
  expect(href!).not.toMatch(/[?&]/);

  const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
  expect(ogUrl).toBeTruthy();
  expect(ogUrl!).toMatch(/^https:\/\/alexendros\.dev\/contacto\/?$/);
  expect(ogUrl!).not.toMatch(/[?&]/);
});

test('ROUTE-06: titles únicos y meta description en la semilla pública', async ({ page }) => {
  const titles: string[] = [];
  for (const path of TITLE_SEED_PATHS) {
    await page.goto(path);
    const title = (await page.title()).trim();
    expect(title.length, `${path}: title vacío`).toBeGreaterThan(8);
    titles.push(title);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.trim().length ?? 0, `${path}: description vacía`).toBeGreaterThan(20);

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1, `${path}: falta H1`).toHaveCount(1);
  }
  expect(new Set(titles).size, `titles duplicados: ${titles.join(' | ')}`).toBe(titles.length);
});

test('ROUTE-07: robots.txt permite indexación y apunta al sitemap apex', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toMatch(/User-agent:\s*\*/i);
  expect(body).toMatch(/Allow:\s*\//i);
  expect(body).toContain('Sitemap: https://alexendros.dev/sitemap-index.xml');
  expect(body, 'no debe bloquear todo el sitio').not.toMatch(/Disallow:\s*\/\s*$/m);
});
