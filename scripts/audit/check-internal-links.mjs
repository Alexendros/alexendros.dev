import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const DIST = process.argv[2] ?? 'dist',
  ORIGIN = 'https://alexendros.dev';
const norm = (s) => (s.length > 1 ? s.replace(/\/$/, '') : s);
const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
const route = (p) =>
  norm(
    '/' +
      p
        .slice(DIST.length + 1)
        .replace(/index\.html$/, '')
        .replace(/\.html$/, '')
  );
const ids = new Map(),
  links = [];
for (const p of walk(DIST)) {
  const h = readFileSync(p, 'utf8');
  ids.set(route(p), new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  for (const m of h.matchAll(/<a\s[^>]*href="([^"]+)"/g)) links.push([route(p), m[1]]);
}
let errors = 0,
  warns = 0;
for (const [from, href] of links) {
  if (
    /^(mailto:|tel:|javascript:)/.test(href) ||
    (/^https?:/.test(href) && !href.startsWith(ORIGIN))
  )
    continue;
  const u = new URL(href, ORIGIN + (from === '/' ? '/' : from + '/'));
  const path = norm(u.pathname);
  if (path.includes('.')) {
    const filePath = join(DIST, path.replace(/^\//, ''));
    if (!existsSync(filePath)) {
      console.error(`ERROR archivo inexistente  ${from} -> ${href}`);
      errors++;
    }
    continue;
  }
  if (!ids.has(path)) {
    console.error(`ERROR ruta inexistente  ${from} -> ${href}`);
    errors++;
    continue;
  }
  if (u.hash && !ids.get(path).has(u.hash.slice(1))) {
    console.error(`ERROR ancla inexistente ${from} -> ${href}`);
    errors++;
  }
  if (u.pathname.length > 1 && !u.pathname.endsWith('/') && !u.pathname.includes('.')) {
    console.warn(`WARN sin barra final   ${from} -> ${href}`);
    warns++;
  }
}
console.log({ pages: ids.size, links: links.length, errors, warns });
process.exitCode = errors ? 1 : 0;
