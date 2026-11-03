import { readFileSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

const sourcePath = 'src/content/paquetes.ts';
const original = readFileSync(sourcePath, 'utf8');
const flag = 'export const paquetesPublicados: boolean = false;';
let preview;

function restore() {
  writeFileSync(sourcePath, original);
}

function run(args) {
  const result = spawnSync('pnpm', args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function stop(signal) {
  restore();
  if (preview) preview.kill(signal);
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
process.on('exit', restore);

try {
  if (!original.includes(flag)) throw new Error('No se encontró la bandera de paquetes ocultos');
  writeFileSync(sourcePath, original.replace(flag, flag.replace('false', 'true')));
  run(['exec', 'astro', 'check']);
  run(['exec', 'astro', 'build']);
  run(['exec', 'node', 'scripts/fix-vercel-runtime.mjs']);
  restore();
  preview = spawn('pnpm', ['preview'], { stdio: 'inherit' });
  preview.on('exit', (code) => process.exit(code ?? 0));
} catch (error) {
  restore();
  throw error;
}
