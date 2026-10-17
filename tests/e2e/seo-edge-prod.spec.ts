import { test, expect, type APIRequestContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * CP-10 — redirects de vercel.json contra apex de producción (solo GET).
 * El preview estático local no aplica reglas de edge; esta suite habla con
 * https://alexendros.dev. Incluida en e2e-critical (rojo si apex cae).
 */

const APEX = 'https://alexendros.dev';
const WWW = 'https://www.alexendros.dev';

type VercelRedirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: unknown[];
};

function loadPathRedirects(): VercelRedirect[] {
  const raw = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
    redirects: VercelRedirect[];
  };
  // Excluir redirect por host (www): se prueba aparte.
  return raw.redirects.filter((r) => !r.has?.length);
}

/** Convierte un patrón Vercel `:path*` en una URL de muestra absoluta. */
function sampleSourceUrl(source: string): string {
  if (source.includes(':path*')) {
    return `${APEX}${source.replace(':path*', 'muestra-cp10')}`;
  }
  return `${APEX}${source}`;
}

function expectedFinalPath(destination: string): string {
  if (destination.startsWith('http')) {
    return new URL(destination).pathname.replace(/\/$/, '') || '/';
  }
  return destination.replace(/\/$/, '') || '/';
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

test.describe('CP-10 edge producción', () => {
  test('www redirige a apex sin bucle', async ({ request }) => {
    const hop = await firstHop(request, `${WWW}/`);
    expect([301, 308]).toContain(hop.status);
    expect(hop.location).toBeTruthy();
    expect(hop.location!).toMatch(/^https:\/\/alexendros\.dev\/?$/);

    const final = await finalUrl(request, `${WWW}/servicios`);
    expect(final).toMatch(/^https:\/\/alexendros\.dev\/servicios\/?$/);
  });

  test('cada redirect de path en vercel.json llega al destino sin bucle', async ({ request }) => {
    const redirects = loadPathRedirects();
    expect(redirects.length, 'vercel.json debe declarar redirects de path').toBeGreaterThan(5);

    for (const rule of redirects) {
      const from = sampleSourceUrl(rule.source);
      const hop = await firstHop(request, from);
      expect(
        [301, 308].includes(hop.status),
        `${rule.source}: primer salto debe ser permanente (got ${hop.status})`
      ).toBe(true);
      expect(hop.location, `${rule.source}: Location ausente`).toBeTruthy();

      const final = await finalUrl(request, from);
      const finalPath = new URL(final).pathname.replace(/\/$/, '') || '/';
      const expected = expectedFinalPath(rule.destination);
      expect(
        finalPath,
        `${rule.source} → esperado ${expected}, final ${finalPath} (${final})`
      ).toBe(expected);
      expect(new URL(final).origin).toBe(APEX);
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
    for (const retired of ['/metodologia/', '/valores/', '/como-trabajo/', '/sobre-mi/']) {
      expect(paths, `sitemap no debe incluir ${retired}`).not.toContain(retired);
    }

    const home = await request.get(`${APEX}/`);
    const html = await home.text();
    expect(html).not.toMatch(/href=["']\/metodologia\/?["']/);
    expect(html).not.toMatch(/href=["']\/valores\/?["']/);
  });
});
