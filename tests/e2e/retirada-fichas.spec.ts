import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const retiredPaths = [
  '/servicios/informe-comercial',
  '/servicios/cumplimiento-normativo',
  '/servicios/ciberseguridad'
];
const retiredSlugs = ['informe-comercial', 'cumplimiento-normativo', 'ciberseguridad'];
const SOURCES = retiredPaths.flatMap((route) => [route, `${route}/`]);
const DESTINATION = '/servicios/';

type Redirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
  has?: unknown[];
};

function loadRedirects(): Redirect[] {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as { redirects: Redirect[] };
  return config.redirects;
}

function redirectFor(redirects: Redirect[], source: string): Redirect | undefined {
  return redirects.find((redirect) => redirect.source === source);
}

test('DIS-09: las seis direcciones se retiran con 301 y destino exacto', () => {
  const redirects = loadRedirects();
  for (const source of SOURCES) {
    const redirect = redirectFor(redirects, source);
    expect(redirect, source).toBeDefined();
    expect(redirect?.destination, source).toBe(DESTINATION);
    expect(redirect?.statusCode, source).toBe(301);
    expect(redirect?.permanent, `${source}: 301 explícito, no 308`).toBeUndefined();
  }
});

// Una prueba por dirección (6). Comprueba la regla y el primer salto del
// preview; el edge de producción lo cubre seo-edge-prod.spec.ts.
for (const source of SOURCES) {
  test(`DIS-09: ${source} sale en un solo salto 301 a ${DESTINATION}`, async ({ request }) => {
    const redirects = loadRedirects();
    const redirect = redirectFor(redirects, source);
    expect(redirect, source).toBeDefined();
    expect(redirect?.destination, source).toBe(DESTINATION);
    expect(redirect?.statusCode, source).toBe(301);
    expect(redirect?.has, `${source}: sin condiciones de host`).toBeUndefined();

    // Un solo salto: el destino no vuelve a estar en la tabla de redirects.
    expect(redirectFor(redirects, DESTINATION), `${source}: cadena de redirects`).toBeUndefined();

    const response = await request.get(source, { maxRedirects: 0 });
    if (response.status() === 301) {
      expect(response.headers().location, source).toBe(DESTINATION);
    } else {
      // El preview estático no aplica vercel.json; producción sí (301 verificado en e2e-critical).
      expect(response.status(), `${source}: el preview estático no aplica vercel.json`).toBe(404);
    }
  });
}

function htmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(file);
    return entry.name.endsWith('.html') ? [file] : [];
  });
}

test('DIS-09: las fichas salen del sitemap, JSON-LD y enlaces del HTML construido', async ({
  request
}) => {
  const indexResponse = await request.get('/sitemap-index.xml');
  expect(indexResponse.status()).toBe(200);
  const index = await indexResponse.text();
  const sitemapUrls = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!);
  const sitemaps = [index];
  for (const url of sitemapUrls) {
    const response = await request.get(new URL(url).pathname);
    expect(response.status()).toBe(200);
    sitemaps.push(await response.text());
  }
  for (const slug of retiredSlugs) {
    expect(sitemaps.join('\n')).not.toContain(`/servicios/${slug}/`);
  }

  const files = htmlFiles('.vercel/output/static');
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const scripts = [
      ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)
    ].map((match) => match[1]!);
    const links = [...html.matchAll(/<a[^>]*href="([^"]+)"/g)].map((match) => match[1]!);
    for (const slug of retiredSlugs) {
      expect(scripts.join('\n'), `${file}: JSON-LD de ${slug}`).not.toContain(
        `/servicios/${slug}/`
      );
      expect(links, `${file}: enlace a ${slug}`).not.toContain(`/servicios/${slug}/`);
      expect(links, `${file}: enlace a ${slug} sin barra`).not.toContain(`/servicios/${slug}`);
    }
  }
});
