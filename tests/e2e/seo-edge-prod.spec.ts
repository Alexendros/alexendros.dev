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

  const location = hop.location ? new URL(hop.location, APEX) : null;
  const served =
    location !== null &&
    PERMANENT_REDIRECT.has(hop.status) &&
    (dest.path.startsWith('http')
      ? `${location.origin}${pathnameOf(location.pathname)}` === dest.path
      : location.origin === APEX && pathnameOf(location.pathname) === dest.path) &&
    location.hash.slice(1) === dest.hash;

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
  expect(rule.permanent ?? true, `${rule.source}: debe ser permanente`).toBe(true);
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

  test('rutas retiradas no aparecen en sitemap ni nav de producción', async ({ request }) => {
    const index = await request.get(`${APEX}/sitemap-index.xml`);
    expect(index.status()).toBe(200);
    const sitemapUrls = [...(await index.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const locs: string[] = [];
    for (const sitemapUrl of sitemapUrls) {
      const body = await (await request.get(sitemapUrl!)).text();
      locs.push(...[...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!));
    }
    const paths = locs.map((loc) => new URL(loc).pathname);
    for (const retired of ['/metodologia/', '/valores/', '/como-trabajo/']) {
      expect(paths, `sitemap no debe incluir ${retired}`).not.toContain(retired);
    }

    const home = await request.get(`${APEX}/`);
    const html = await home.text();
    expect(html).not.toMatch(/href=["']\/metodologia\/?["']/);
    expect(html).not.toMatch(/href=["']\/valores\/?["']/);
  });
});
