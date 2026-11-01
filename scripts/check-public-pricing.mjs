import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_ENTRIES = ['src', 'public', 'README.md', 'docs/standards'];
const BUILD_ENTRY = '.vercel/output/static';
const TEXT_EXTENSIONS = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.svg',
  '.ts',
  '.tsx',
  '.txt',
  '.webmanifest',
  '.xml'
]);

const PATTERNS = [
  { id: 'euro-symbol', label: 'símbolo de euro', regex: /€/u },
  { id: 'currency-code', label: 'código de divisa', regex: /\bEUR\b/u },
  { id: 'tax', label: 'referencia fiscal pública', regex: /\+\s*IVA\b|\bIVA incluido\b/iu },
  {
    id: 'starting-amount',
    label: 'importe inicial',
    regex: /\bdesde\s+(?:\d{1,3}(?:[.\s]\d{3})+|\d+(?:[.,]\d+)?)/iu
  },
  { id: 'provisional-copy', label: 'importe provisional', regex: /precio provisional/iu },
  { id: 'price-euros', label: 'campo priceEuros', regex: /\bpriceEuros\b/u },
  { id: 'price-label', label: 'campo priceLabel', regex: /\bpriceLabel\b/u },
  { id: 'price-status', label: 'campo priceStatus', regex: /\bpriceStatus\b/u },
  { id: 'provisional-prices', label: 'tabla provisionalPrices', regex: /\bprovisionalPrices\b/u },
  { id: 'format-euro', label: 'formateador formatEuro', regex: /\bformatEuro\b/u },
  { id: 'portal-base-price', label: 'base portalBasePrice', regex: /\bportalBasePrice\b/u },
  { id: 'module-prices', label: 'tabla modulePrices', regex: /\bmodulePrices\b/u },
  {
    id: 'portal-total',
    label: 'total portalTotalWithModules',
    regex: /\bportalTotalWithModules\b/u
  },
  { id: 'sum-portal', label: 'cálculo sumPortal', regex: /\bsumPortal\b/u },
  { id: 'discounted', label: 'cálculo discounted', regex: /\bdiscounted\b/u },
  {
    id: 'pricing-configurator',
    label: 'componente PricingConfigurator',
    regex: /\bPricingConfigurator\b/u
  },
  { id: 'price-range', label: 'dato estructurado priceRange', regex: /\bpriceRange["']?\s*:/u }
];

// Excepciones mínimas: archivo + regla. Nunca se excluye HTML generado.
const ALLOWLIST = [
  {
    file: 'src/lib/tracking/capi.test.ts',
    rule: 'currency-code',
    reason: 'Contrato ISO 4217 de CAPI en una prueba; no se publica en el sitio.'
  },
  // Plan de captación 2026-11: los tres paquetes cerrados publican «desde X €».
  // La cifra solo puede vivir en este fichero de datos y, en el HTML, dentro
  // del elemento marcado con `data-paquete-precio` (ver PAQUETE_PRECIO_SLOT).
  {
    file: 'src/content/paquetes.ts',
    rule: 'euro-symbol',
    reason: 'Fichero único de precios de los paquetes cerrados (plan de captación).'
  },
  {
    file: 'src/content/paquetes.ts',
    rule: 'starting-amount',
    reason: 'Fichero único de precios de los paquetes cerrados (plan de captación).'
  }
];

/** Único hueco del HTML donde se admite el precio de un paquete cerrado. */
const PAQUETE_PRECIO_SLOT = /(<[a-z]+\b[^>]*\bdata-paquete-precio\b[^>]*>)[^<]*</giu;

export function scanPublicPricing(root, { requireBuild = false } = {}) {
  const entries = [...SOURCE_ENTRIES, BUILD_ENTRY];
  const findings = [];
  let scannedFiles = 0;

  for (const entry of entries) {
    const absolute = join(root, entry);
    if (!existsSync(absolute)) {
      if (entry === BUILD_ENTRY && requireBuild) {
        throw new Error(`No existe ${BUILD_ENTRY}; ejecuta el build antes del gate.`);
      }
      continue;
    }
    for (const file of walkTextFiles(absolute)) {
      scannedFiles += 1;
      const path = relative(root, file).replaceAll('\\', '/');
      const raw = readFileSync(file, 'utf8');
      const content = path.endsWith('.html') ? raw.replace(PAQUETE_PRECIO_SLOT, '$1<') : raw;
      const lines = content.split('\n');
      lines.forEach((text, index) => {
        for (const pattern of PATTERNS) {
          if (!pattern.regex.test(text)) continue;
          if (isAllowlisted(path, pattern.id)) continue;
          findings.push(`${path}:${index + 1} ${pattern.label}: ${text.trim()}`);
        }
      });
    }
  }

  return { findings, scannedFiles };
}

function walkTextFiles(entry) {
  const files = [];
  const visit = (path) => {
    const entries = readdirSync(path, { withFileTypes: true });
    for (const child of entries) {
      const absolute = join(path, child.name);
      if (child.isDirectory()) visit(absolute);
      else if (child.isFile() && TEXT_EXTENSIONS.has(extname(child.name))) files.push(absolute);
    }
  };

  if (statSync(entry).isFile()) return TEXT_EXTENSIONS.has(extname(entry)) ? [entry] : [];
  visit(entry);
  return files;
}

function isAllowlisted(file, rule) {
  return ALLOWLIST.some((entry) => entry.file === file && entry.rule === rule);
}

function isDirectRun() {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}

function optionsFromArgs(argv) {
  const rootIndex = argv.indexOf('--root');
  return {
    root: rootIndex === -1 ? process.cwd() : (argv[rootIndex + 1] ?? process.cwd()),
    requireBuild: argv.includes('--require-build')
  };
}

if (isDirectRun()) {
  const options = optionsFromArgs(process.argv.slice(2));
  try {
    const { findings, scannedFiles } = scanPublicPricing(options.root, options);
    if (findings.length > 0) {
      console.error(`check-public-pricing: ${findings.length} hallazgos\n${findings.join('\n')}`);
      process.exit(1);
    }
    console.log(`check-public-pricing: OK (${scannedFiles} archivos)`);
  } catch (error) {
    console.error(
      `check-public-pricing: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
