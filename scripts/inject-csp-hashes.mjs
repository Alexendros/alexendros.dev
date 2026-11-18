/**
 * Sincroniza las cabeceras CSP de vercel.json con buildCsp (SSOT en src/lib/csp.ts).
 * Requiere: node --import tsx scripts/inject-csp-hashes.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCsp, CSP_REPORT_URI } from '../src/lib/csp.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPORTING_ENDPOINTS = `csp-endpoint="${CSP_REPORT_URI}"`;

function main() {
  const vercelPath = join(root, 'vercel.json');
  const data = JSON.parse(readFileSync(vercelPath, 'utf8'));
  const enforce = buildCsp({ withHashes: true });
  const reportOnly = buildCsp({ withHashes: true, reportUri: CSP_REPORT_URI });

  let updated = 0;
  let reportingFound = false;
  for (const group of data.headers ?? []) {
    if (group.source !== '/(.*)') continue;
    for (const header of group.headers ?? []) {
      const key = String(header.key ?? '').toLowerCase();
      if (key === 'content-security-policy') {
        header.value = enforce;
        updated += 1;
      } else if (key === 'content-security-policy-report-only') {
        header.value = reportOnly;
        updated += 1;
      } else if (key === 'reporting-endpoints') {
        header.value = REPORTING_ENDPOINTS;
        reportingFound = true;
      }
    }
    if (!reportingFound) {
      group.headers = group.headers ?? [];
      group.headers.push({
        key: 'Reporting-Endpoints',
        value: REPORTING_ENDPOINTS
      });
      reportingFound = true;
    }
  }
  if (updated < 2) {
    console.error('[inject-csp-hashes] no se encontraron ambas cabeceras CSP en vercel.json');
    process.exit(1);
  }
  writeFileSync(vercelPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(
    '[inject-csp-hashes] vercel.json CSP sincronizada desde buildCsp (sin unsafe-inline)'
  );
}

main();
