/**
 * Genera sbom.cdx.json (CycloneDX) con el subcomando nativo `pnpm sbom`.
 * packageManager del repo es 9.15.9 (sin sbom); se invoca pnpm 12.16.1 vía
 * npm exec sobre un manifiesto temporal sin pin packageManager.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PNPM_SBOM_VERSION = '12.16.1';
const SBOM_FILE = 'sbom.cdx.json';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, SBOM_FILE);

function fail(message, code = 1) {
  console.error(`[gen-sbom] ${message}`);
  process.exit(code);
}

function productionManifest(pkg) {
  return {
    name: pkg.name,
    version: pkg.version,
    private: true,
    dependencies: pkg.dependencies ?? {}
  };
}

function prepareTempWorkspace(pkg) {
  const tmp = mkdtempSync(join(tmpdir(), 'alex-sbom-'));
  writeFileSync(join(tmp, 'package.json'), `${JSON.stringify(productionManifest(pkg), null, 2)}\n`);
  copyFileSync(join(root, 'pnpm-lock.yaml'), join(tmp, 'pnpm-lock.yaml'));
  return tmp;
}

function runPnpmSbom(cwd) {
  const result = spawnSync(
    'npm',
    [
      'exec',
      '--yes',
      `--package=pnpm@${PNPM_SBOM_VERSION}`,
      '--',
      'pnpm',
      'sbom',
      '--sbom-format',
      'cyclonedx',
      '--sbom-type',
      'application',
      '--prod',
      '--lockfile-only',
      '--out',
      outFile
    ],
    { cwd, stdio: 'inherit', env: process.env }
  );

  if (result.error) {
    fail(`npm exec falló: ${result.error.message}`);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const tmp = prepareTempWorkspace(pkg);
try {
  runPnpmSbom(tmp);
  console.log(`[gen-sbom] escrito ${outFile} (pnpm@${PNPM_SBOM_VERSION})`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
