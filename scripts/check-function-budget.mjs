/**
 * Falla si el tamaño de _render.func supera scripts/function-budget.json.
 * No arranca el runtime ni llama a la red. Mide con `du -sb` (mismo criterio
 * que la medición del presupuesto).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const budgetPath = join(root, 'scripts/function-budget.json');

function dirSizeBytes(dir) {
  const out = execFileSync('du', ['-sb', dir], { encoding: 'utf8' });
  const n = Number(out.trim().split(/\s+/)[0]);
  if (!Number.isFinite(n)) {
    throw new Error(`du -sb no parseable: ${out}`);
  }
  return n;
}

const budget = JSON.parse(readFileSync(budgetPath, 'utf8'));
const target = join(root, budget.path);
if (!existsSync(target)) {
  console.error(`[check-function-budget] falta ${budget.path}`);
  process.exit(1);
}

const size = dirSizeBytes(target);
const max = Number(budget.maxBytes);
if (!Number.isFinite(max) || max <= 0) {
  console.error('[check-function-budget] maxBytes inválido');
  process.exit(1);
}

console.log(
  `[check-function-budget] ${budget.path}: ${size} bytes (máx ${max}; medido ${budget.measuredBytes})`
);
if (size > max) {
  console.error(
    `[check-function-budget] presupuesto superado: ${size} > ${max} (+${size - max} bytes)`
  );
  process.exit(1);
}
