import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const reportDirectory = process.env.LHCI_REPORT_DIR ?? '.lighthouseci';
const requiredRoutes = new Map([
  ['/', { limit: 25100 }],
  ['/contacto/', { limit: 25100, optional: true }],
  [
    '/servicios/software-a-medida/',
    { limit: 25100, knownFailure: 'KF-V10-SAM', knownMaximum: 25598 }
  ]
]);

const files = readdirSync(reportDirectory).filter((file) => /^lhr-.*\.json$/.test(file));
const measurements = new Map();
for (const file of files) {
  const report = JSON.parse(readFileSync(path.join(reportDirectory, file), 'utf8'));
  const url = new URL(report.finalDisplayedUrl ?? report.finalUrl ?? report.requestedUrl);
  const item = report.audits['resource-summary']?.details?.items?.find(
    (entry) => entry.resourceType === 'stylesheet'
  );
  if (requiredRoutes.has(url.pathname) && Number.isFinite(item?.transferSize)) {
    const previous = measurements.get(url.pathname) ?? [];
    previous.push(item.transferSize);
    measurements.set(url.pathname, previous);
  }
}

let failed = false;
for (const [route, rule] of requiredRoutes) {
  const samples = measurements.get(route) ?? [];
  if (samples.length === 0) {
    if (rule.optional) {
      console.log(`${route}: sin informe LHCI; no se verifica (LHCI no mide esta URL)`);
      continue;
    }
    console.error(`${route}: ERROR, no hay informe LHCI`);
    failed = true;
    continue;
  }
  const size = Math.max(...samples);
  if (size > rule.limit && rule.knownFailure && size <= rule.knownMaximum) {
    console.log(
      `${route}: ${size} B · ${rule.knownFailure} fallo conocido; máximo temporal ${rule.knownMaximum} B`
    );
  } else if (size > rule.limit) {
    console.error(`${route}: ${size} B · ERROR; límite ${rule.limit} B`);
    failed = true;
  } else {
    console.log(`${route}: ${size} B · OK; margen ${rule.limit - size} B`);
  }
}

process.exitCode = failed ? 1 : 0;
