/**
 * Valida sbom.cdx.json: CycloneDX, tipo application y dependencias de producción.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sbomPath = join(root, 'sbom.cdx.json');

function fail(message) {
  console.error(`[check-sbom] ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`no se pudo leer ${path}: ${err.message}`);
  }
}

/** Clave npm estable: `@scope/name` o `name` (CycloneDX usa group + name). */
function componentKey(component) {
  return component.group ? `${component.group}/${component.name}` : component.name;
}

const bom = readJson(sbomPath);

if (bom.bomFormat !== 'CycloneDX') {
  fail(`bomFormat esperado CycloneDX, recibido ${bom.bomFormat}`);
}

const rootType = bom.metadata?.component?.type;
if (rootType !== 'application') {
  fail(`metadata.component.type esperado application, recibido ${rootType}`);
}

const required = Object.keys(readJson(join(root, 'package.json')).dependencies ?? {});
const present = new Set((bom.components ?? []).map(componentKey));
const missing = required.filter((name) => !present.has(name));

if (missing.length > 0) {
  fail(`faltan dependencias de producción en el SBOM:\n${missing.join('\n')}`);
}

console.log(
  `[check-sbom] ok (CycloneDX, application, ${required.length} deps de producción, ${(bom.components ?? []).length} componentes)`
);
