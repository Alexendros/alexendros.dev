import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const retiredPaths = [
  '/servicios/informe-comercial',
  '/servicios/cumplimiento-normativo',
  '/servicios/ciberseguridad'
];
const retiredSlugs = ['informe-comercial', 'cumplimiento-normativo', 'ciberseguridad'];

type Redirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
};

test('DIS-09: la configuración retira cada ficha con 301 y Location exacto', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as { redirects: Redirect[] };
  const redirects = new Map(config.redirects.map((redirect) => [redirect.source, redirect]));
  for (const route of retiredPaths) {
    for (const source of [route, `${route}/`]) {
      const redirect = redirects.get(source);
      expect(redirect, source).toBeDefined();
      expect(redirect?.destination, source).toBe('/servicios/');
      expect(redirect?.permanent, source).toBe(true);
    }
  }
});

test('DIS-09: el preview no conserva las fichas y aplica 301 si sirve redirecciones', async ({
  request
}) => {
  for (const route of retiredPaths.slice(0, 3)) {
    for (const source of [route, `${route}/`]) {
      const response = await request.get(source, { maxRedirects: 0 });
      if (response.status() === 301) {
        expect(response.headers().location, source).toBe('/servicios/');
      } else {
        expect(response.status(), `${source}: el preview estático no aplica vercel.json`).toBe(404);
      }
    }
  }
});

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
