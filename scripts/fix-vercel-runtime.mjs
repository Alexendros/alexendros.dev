#!/usr/bin/env node
/**
 * Alinea el runtime Node emitido por @astrojs/vercel con el major de
 * package.json#engines.node (fuente de verdad; override del dashboard).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_PATH = fileURLToPath(new URL('../package.json', import.meta.url));

export function nodeRuntimeFromEngines(enginesNode) {
  const major = String(enginesNode ?? '').match(/^(\d+)/)?.[1];
  if (!major) {
    throw new Error(`[fix-vercel-runtime] engines.node no parseable: ${String(enginesNode)}`);
  }
  return `nodejs${major}.x`;
}

export function readTargetRuntime(pkgPath = PKG_PATH) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return nodeRuntimeFromEngines(pkg.engines?.node);
}

export function fixVercelRuntime(
  functionsRoot = path.resolve('.vercel/output/functions'),
  target = readTargetRuntime()
) {
  let scanned = 0;
  let rewritten = 0;

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry.name !== '.vc-config.json') continue;
      const config = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (
        typeof config.runtime === 'string' &&
        config.runtime !== 'edge' &&
        config.runtime.startsWith('nodejs')
      ) {
        scanned += 1;
        if (config.runtime !== target) {
          const prev = config.runtime;
          config.runtime = target;
          fs.writeFileSync(full, JSON.stringify(config));
          rewritten += 1;
          console.log(
            `[fix-vercel-runtime] ${path.relative(process.cwd(), full)}: ${prev} → ${target}`
          );
        }
      }
    }
  }

  walk(functionsRoot);
  return { scanned, rewritten, target };
}

function isExecutedDirectly() {
  const self = fileURLToPath(import.meta.url);
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return self === invoked;
}

if (isExecutedDirectly()) {
  const result = fixVercelRuntime();
  if (result.scanned === 0) {
    console.error(
      '[fix-vercel-runtime] no se encontró ningún .vc-config.json con runtime Node en .vercel/output/functions'
    );
    process.exit(1);
  }
}
