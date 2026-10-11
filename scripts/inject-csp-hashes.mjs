// Fase ② PROTECCIÓN — andamio del cómputo de hashes CSP.
// Hermano de scripts/fix-vercel-runtime.mjs. El cómputo real es fase ③.
//
// Contrato pendiente:
//   1) Tras `astro build`, escanear dist/**/*.html.
//   2) Calcular sha256 de cada <script> y <style> inline.
//   3) Inyectar los 'sha256-…' en INLINE_SCRIPT_HASHES y en vercel.json.
//   4) Salir 1 si aparece un inline sin hash registrado.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const sha256 = (s) => "'sha256-" + createHash('sha256').update(s, 'utf8').digest('base64') + "'";

async function main() {
  const sample = await readFile(new URL('./inject-csp-hashes.mjs', import.meta.url), 'utf8').catch(
    () => 'base'
  );
  console.log(
    '[inject-csp-hashes] andamio fase ② ok. hash de muestra =',
    sha256(sample).slice(0, 24) + '…'
  );
  process.exit(0);
}

main();
