import { test, expect, type APIRequestContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * CP-10 — redirects de vercel.json contra apex de producción (solo GET).
 * El preview estático local no aplica reglas de edge; esta suite habla con
 * https://alexendros.dev. Incluida en e2e-critical (rojo si apex cae).
 *
 * Importante: los samples de `:path*` deben resolver a una ruta que exista
 * tras el redirect. Un segmento ficticio pasa el PR (pending/200) y rompe
 * `main` en cuanto Production aplica el 308.
 *
 * Si producción aún no sirve la regla de la rama (Location distinto o 200),
 * se anota `pendiente-despliegue` y se valida el destino contra el build
 * local (ruta 200; si hay ancla, el id existe). Así el PR no espera a que
 * apex ya tenga los redirects con ancla SPA. redirects.test.ts cubre el mapa.
 */

const APEX = 'https://alexendros.dev';
const WWW = 'https://www.alexendros.dev';

/** Slug real de /referencias (y cualquier destino que conserve `:path*`). */
const SAMPLE_PATH_SEGMENT = 'zedazo';

const PERMANENT_REDIRECT = new Set([301, 308]);

type VercelRedirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
  has?: unknown[];
};

function expandPathPattern(pattern: string): string {
  return pattern.includes(':path*') ? pattern.replace(':path*', SAMPLE_PATH_SEGMENT) : pattern;
}

function pathnameOf(urlOrPath: string): string {
  const path = urlOrPath.startsWith('http') ? new URL(urlOrPath).pathname : urlOrPath;
  return path.replace(/\/$/, '') || '/';
}

function loadPathRedirects(): VercelRedirect[] {
  const raw = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
    redirects: VercelRedirect[];
  };
  // Excluir redirect por host (www): se prueba aparte.
  return raw.redirects.filter((r) => !r.has?.length);
}

function sampleSourceUrl(source: string): string {
  return `${APEX}${expandPathPattern(source)}`;
}

async function firstHop(
  request: APIRequestContext,
  url: string
): Promise<{ status: number; location: string | null }> {
  const response = await request.get(url, { maxRedirects: 0 });
  return {
    status: response.status(),
    location: response.headers()['location'] ?? null
  };
}

async function finalUrl(request: APIRequestContext, url: string): Promise<string> {
  const response = await request.get(url, { maxRedirects: 5 });
  expect(response.status(), `${url} debe acabar en 200`).toBe(200);
  return response.url();
}

async function sitemapPaths(request: APIRequestContext, base: string): Promise<string[]> {
  const index = await request.get(`${base}/sitemap-index.xml`);
  expect(index.status()).toBe(200);
  const sitemapUrls = [...(await index.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1]!
  );
  const locs: string[] = [];
  for (const sitemapUrl of sitemapUrls) {
    const response = await request.get(`${base}${new URL(sitemapUrl).pathname}`);
    expect(response.status()).toBe(200);
    locs.push(...[...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!));
  }
  return locs.map((loc) => new URL(loc).pathname);
}

function splitDestination(destination: string): { path: string; hash: string } {
  const expanded = expandPathPattern(destination);
  if (expanded.startsWith('http')) {
    const u = new URL(expanded);
    return { path: `${u.origin}${pathnameOf(u.pathname)}`, hash: u.hash.slice(1) };
  }
  const [path, hash = ''] = expanded.split('#');
  return { path: pathnameOf(path!), hash };
}

/**
 * Comprueba una regla del vercel.json de la rama. Si producción ya la sirve
 * (Location coincide), valida el salto real sin bucle. Si aún no está
 * desplegada (la PR la añade o la cambia), valida el destino contra el build
 * local: la ruta responde 200 y, si hay ancla, el id existe en la página.
 */
async function assertPathRedirect(request: APIRequestContext, rule: VercelRedirect): Promise<void> {
  const from = sampleSourceUrl(rule.source);
  const dest = splitDestination(rule.destination);
  const hop = await firstHop(request, from);
  // 308 por defecto (permanent), 307 si no; 301/302 vienen de statusCode.
  const expectedStatus = rule.statusCode ?? (rule.permanent === false ? 307 : 308);

  const pointsToDestination = (location: URL): boolean =>
    (dest.path.startsWith('http')
      ? `${location.origin}${pathnameOf(location.pathname)}` === dest.path
      : location.origin === APEX && pathnameOf(location.pathname) === dest.path) &&
    location.hash.slice(1) === dest.hash;

  const firstLocation = hop.location ? new URL(hop.location, APEX) : null;
  let served =
    firstLocation !== null &&
    hop.status === expectedStatus &&
    PERMANENT_REDIRECT.has(hop.status) &&
    pointsToDestination(firstLocation);

  // Vercel aplica `trailingSlash` antes que `redirects`: una regla declarada
  // sin barra recibe primero un 308 de normalización hacia la variante con
  // barra. Se acepta ese salto de plataforma y se exige el 301 final.
  if (!served && firstLocation !== null && hop.status === 308) {
    const normalized = `${pathnameOf(rule.source)}/`;
    if (firstLocation.origin === APEX && firstLocation.pathname === normalized) {
      const second = await firstHop(request, firstLocation.href);
      const secondLocation = second.location ? new URL(second.location, APEX) : null;
      served =
        secondLocation !== null &&
        second.status === expectedStatus &&
        PERMANENT_REDIRECT.has(second.status) &&
        pointsToDestination(secondLocation);
    }
  }

  if (served) {
    if (dest.path.startsWith('http')) return;
    const final = await finalUrl(request, from);
    expect(pathnameOf(final), `${rule.source} → ${dest.path}`).toBe(dest.path);
    expect(new URL(final).origin).toBe(APEX);
    return;
  }

  test.info().annotations.push({
    type: 'pendiente-despliegue',
    description: `${rule.source} → ${rule.destination} (producción: ${hop.status} ${hop.location ?? '-'})`
  });
  expect(
    rule.permanent === true || rule.statusCode === 301,
    `${rule.source}: debe ser permanente (301 o 308)`
  ).toBe(true);
  if (dest.path.startsWith('http')) return;
  const local = await request.get(dest.path, { maxRedirects: 0 });
  expect(local.status(), `${rule.source}: destino local ${dest.path} debe dar 200`).toBe(200);
  if (dest.hash) {
    expect(await local.text(), `${rule.source}: falta id="${dest.hash}" en ${dest.path}`).toMatch(
      new RegExp(`id=["']?${dest.hash}["'\\s>]`)
    );
  }
}

test.describe('CP-10 edge producción', () => {
  test('www redirige a apex sin bucle', async ({ request }) => {
    const hop = await firstHop(request, `${WWW}/`);
    expect(PERMANENT_REDIRECT.has(hop.status)).toBe(true);
    expect(hop.location).toBeTruthy();
    expect(hop.location!).toMatch(/^https:\/\/alexendros\.dev\/?$/);

    // Ruta estable (no ancla SPA): /servicios → /#servicios tras promote.
    const final = await finalUrl(request, `${WWW}/privacidad`);
    expect(final).toMatch(/^https:\/\/alexendros\.dev\/privacidad\/?$/);
  });

  test('cada redirect de path en vercel.json llega al destino sin bucle', async ({ request }) => {
    const redirects = loadPathRedirects();
    expect(redirects.length, 'vercel.json debe declarar redirects de path').toBeGreaterThan(5);

    for (const rule of redirects) {
      await assertPathRedirect(request, rule);
    }
  });

  test('las seis direcciones retiradas acaban en /servicios/ (sin barra: 308 + 301)', async ({
    request
  }) => {
    const retired = loadPathRedirects().filter((rule) =>
      ['informe-comercial', 'cumplimiento-normativo', 'ciberseguridad'].includes(
        rule.source.split('/').filter(Boolean).pop() ?? ''
      )
    );
    expect(retired, 'seis direcciones con y sin barra').toHaveLength(6);
    for (const rule of retired) {
      expect(rule.destination).toBe('/servicios/');
      expect(rule.statusCode, `${rule.source}: 301 explícito`).toBe(301);
      await assertPathRedirect(request, rule);
    }
  });

  test('rutas retiradas no aparecen en sitemap ni nav', async ({ request }) => {
    let base = APEX;
    let paths = await sitemapPaths(request, base);

    // Antes del promote, producción todavía sirve la canónica anterior. Como
    // en assertPathRedirect, se anota el estado y se exige el contrato al build
    // local; una producción ya migrada debe cumplir también las exclusiones.
    if (!paths.includes('/metodologia/')) {
      test.info().annotations.push({
        type: 'pendiente-despliegue',
        description:
          'La sitemap de producción aún no incluye /metodologia/; se valida el build local'
      });
      base = '';
      paths = await sitemapPaths(request, base);
    }

    expect(paths).toContain('/metodologia/');
    for (const retired of ['/metodo/', '/valores/', '/como-trabajo/']) {
      expect(paths, `sitemap no debe incluir ${retired}`).not.toContain(retired);
    }

    const home = await request.get(`${base}/`);
    const html = await home.text();
    expect(html).not.toMatch(/href=["']\/metodo\/?["']/);
    expect(html).not.toMatch(/href=["']\/valores\/?["']/);
  });
});
