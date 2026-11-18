/**
 * Sincroniza las cabeceras CSP de vercel.json con la política mínima
 * (self + Vercel Analytics) y hashes de theme-init / @layer.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

const LAYER_ORDER_STYLE = '@layer properties, reset, theme, base, components, utilities;';

function sha256Csp(content) {
  return `'sha256-${createHash('sha256').update(content, 'utf8').digest('base64')}'`;
}

function themeInitFromDisk() {
  return readFileSync(join(root, 'src/scripts/theme-init.js'), 'utf8');
}

function buildPolicy({ withHashes, reportUri }) {
  const theme = themeInitFromDisk();
  const scriptSrc = ["'self'", 'https://va.vercel-scripts.com'];
  const styleSrc = ["'self'"];
  if (withHashes) {
    scriptSrc.push(sha256Csp(theme));
    styleSrc.push(sha256Csp(LAYER_ORDER_STYLE));
  }
  const directives = {
    'default-src': ["'self'"],
    'script-src': scriptSrc,
    'style-src': styleSrc,
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      'https://va.vercel-scripts.com',
      'https://vitals.vercel-insights.com'
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"]
  };
  const body = Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(' ')}`.trim())
    .join('; ');
  return reportUri ? `${body}; report-uri ${reportUri}; report-to csp-endpoint` : body;
}

function main() {
  const vercelPath = join(root, 'vercel.json');
  const data = JSON.parse(readFileSync(vercelPath, 'utf8'));
  const enforce = buildPolicy({ withHashes: true });
  const reportOnly = buildPolicy({ withHashes: true, reportUri: '/api/csp-report/' });

  let updated = 0;
  for (const group of data.headers ?? []) {
    for (const header of group.headers ?? []) {
      const key = String(header.key ?? '').toLowerCase();
      if (key === 'content-security-policy') {
        header.value = enforce;
        updated += 1;
      } else if (key === 'content-security-policy-report-only') {
        header.value = reportOnly;
        updated += 1;
      }
    }
  }
  if (updated < 2) {
    console.error('[inject-csp-hashes] no se encontraron ambas cabeceras CSP en vercel.json');
    process.exit(1);
  }
  writeFileSync(vercelPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log('[inject-csp-hashes] vercel.json CSP sincronizada (sin unsafe-inline)');
  void require;
}

main();
