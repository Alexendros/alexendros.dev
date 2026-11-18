/**
 * Gate post-build: ningún HTML del output puede llevar <script type="module">
 * inline. La CSP solo permite 'self' + el hash del theme-init clásico; un
 * módulo inlined (Header, filtros…) queda bloqueado en Vercel
 * y rompe menú y tema.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const HTML_ROOTS = ['.vercel/output/static', 'dist/client', 'dist'];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue;
    const path = join(dir, entry);
    const info = statSync(path);
    if (info.isDirectory()) files.push(...walk(path));
    else if (extname(entry) === '.html') files.push(path);
  }
  return files;
}

function findInlineModules(html) {
  const hits = [];
  // \s* antes de > para no perder cierres como </script > (CodeQL js/bad-tag-filter).
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  for (const match of html.matchAll(pattern)) {
    const attrs = match[1] ?? '';
    if (!/\btype\s*=\s*["']module["']/i.test(attrs)) continue;
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const body = (match[2] ?? '').trim();
    if (!body) continue;
    hits.push(body.slice(0, 80).replace(/\s+/g, ' '));
  }
  return hits;
}

export function inspect(root = process.cwd()) {
  const findings = [];
  for (const name of HTML_ROOTS) {
    const dir = join(root, name);
    if (!existsSync(dir)) continue;
    for (const file of walk(dir)) {
      const hits = findInlineModules(readFileSync(file, 'utf8'));
      for (const preview of hits) {
        findings.push(`${relative(root, file)} :: ${preview}`);
      }
    }
    // Preferir el primer árbol de output presente (Vercel o dist).
    return findings;
  }
  return findings;
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isDirectRun()) {
  const findings = inspect();
  if (findings.length === 0) {
    console.log('[check-no-inline-modules] ok: sin módulos JS inline en HTML');
    process.exit(0);
  }
  console.error('[check-no-inline-modules] módulos inline incompatibles con CSP:');
  for (const line of findings) console.error(`  - ${line}`);
  process.exit(1);
}
