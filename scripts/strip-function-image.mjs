/**
 * Retira la superficie on-demand /_image y restos de sharp/libvips de la
 * función serverless. Las imágenes de fichas ya se optimizan en el build.
 */
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = join(root, '.vercel/output/config.json');
const funcRoot = join(root, '.vercel/output/functions/_render.func');

const MATCH_RE = /(?:^|[/\\])(?:@img(?:[/\\]|$)|sharp(?:@|[/\\._-]|$)|libvips)/i;

function pathExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function listEntries(dir) {
  const out = [];
  if (!pathExists(dir)) return out;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    let names;
    try {
      names = readdirSync(current);
    } catch {
      continue;
    }
    for (const name of names) {
      const full = join(current, name);
      out.push(full);
      try {
        const st = lstatSync(full);
        if (st.isDirectory()) stack.push(full);
      } catch {
        /* ignore broken entries mid-walk */
      }
    }
  }
  return out;
}

function stripConfigRoutes() {
  if (!existsSync(configPath)) {
    console.error('[strip-function-image] falta .vercel/output/config.json');
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(configPath, 'utf8'));
  const before = Array.isArray(data.routes) ? data.routes.length : 0;
  if (Array.isArray(data.routes)) {
    data.routes = data.routes.filter((route) => !String(route?.src ?? '').includes('/_image'));
  }
  writeFileSync(configPath, `${JSON.stringify(data)}\n`);
  const after = Array.isArray(data.routes) ? data.routes.length : 0;
  console.log(`[strip-function-image] rutas /_image retiradas (${before - after} de ${before})`);
}

function stripSharpFromFunction() {
  if (!existsSync(funcRoot)) {
    console.error('[strip-function-image] falta _render.func');
    process.exit(1);
  }

  let removed = 0;
  // Varias pasadas: borrar coincidencias de más profundo a más superficial.
  for (let pass = 0; pass < 8; pass += 1) {
    const matches = listEntries(funcRoot)
      .filter((p) => MATCH_RE.test(p))
      .sort((a, b) => b.length - a.length);
    if (matches.length === 0) break;
    for (const full of matches) {
      if (!pathExists(full)) continue;
      rmSync(full, { recursive: true, force: true });
      removed += 1;
    }
  }
  console.log(`[strip-function-image] entradas sharp/libvips/@img retiradas: ${removed}`);
}

function assertClean() {
  const leftovers = listEntries(funcRoot).filter((p) => MATCH_RE.test(p));
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const imageRoutes = (config.routes ?? []).filter((r) => String(r?.src ?? '').includes('/_image'));
  if (leftovers.length > 0 || imageRoutes.length > 0) {
    console.error('[strip-function-image] quedan restos:');
    for (const p of leftovers.slice(0, 20)) console.error(`  ${p}`);
    console.error(`  routes=/_image: ${imageRoutes.length}`);
    process.exit(1);
  }
  console.log('[strip-function-image] ok: sin /_image ni sharp/@img en la función');
}

stripConfigRoutes();
stripSharpFromFunction();
assertClean();
