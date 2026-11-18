/**
 * Garantiza una sola lista de overrides: package.json#pnpm.overrides.
 * pnpm 9 (CI) lee esa clave; el YAML no debe declarar overrides.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const yaml = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8');

if (/^\s*overrides\s*:/m.test(yaml)) {
  console.error(
    '[check-pnpm-overrides] pnpm-workspace.yaml declara overrides:; ' +
      'la lista canónica es package.json#pnpm.overrides'
  );
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const overrides = pkg.pnpm?.overrides;
if (!overrides || typeof overrides !== 'object' || Object.keys(overrides).length === 0) {
  console.error('[check-pnpm-overrides] package.json#pnpm.overrides vacío o ausente');
  process.exit(1);
}

console.log(
  `[check-pnpm-overrides] ok (${Object.keys(overrides).length} overrides en package.json)`
);
