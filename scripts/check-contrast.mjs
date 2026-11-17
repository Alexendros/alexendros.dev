// Valida el contraste WCAG de los tokens de producto (global.css).
// Uso: pnpm check:contrast.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractThemes, resolveValue, toRgb, ratio } from './contrast-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');

const SEMANTIC = [
  'bg',
  'bg-subtle',
  'fg',
  'fg-muted',
  'brand',
  'brand-hover',
  'brand-fg',
  'brand-soft',
  'accent-fg',
  'border-color',
  'border-strong',
  'card',
  'danger',
  'success',
  'link',
  'primary-ghost'
];

const PAIRS = [
  ['fg/bg (texto principal)', 'fg', 'bg', 4.5],
  ['fg-muted/bg (texto secundario)', 'fg-muted', 'bg', 4.5],
  ['brand-fg/brand (texto de CTAs)', 'brand-fg', 'brand', 4.5],
  ['brand/bg (acento como texto)', 'brand', 'bg', 4.5],
  ['fg/card (texto en tarjetas)', 'fg', 'card', 4.5],
  ['fg-muted/card (secundario en tarjetas)', 'fg-muted', 'card', 4.5],
  ['danger/card (errores en tarjetas)', 'danger', 'card', 4.5],
  ['danger/bg (errores sobre fondo)', 'danger', 'bg', 4.5],
  ['link/bg (enlaces)', 'link', 'bg', 4.5],
  ['link/card (enlaces en tarjetas)', 'link', 'card', 4.5],
  ['link/bg-subtle (enlaces sobre fondo sutil)', 'link', 'bg-subtle', 4.5],
  ['brand-fg/brand-hover (CTAs en hover)', 'brand-fg', 'brand-hover', 4.5],
  ['brand/card (acento como texto en tarjetas)', 'brand', 'card', 4.5],
  ['fg/bg-subtle (texto sobre fondo sutil)', 'fg', 'bg-subtle', 4.5],
  ['fg-muted/bg-subtle (secundario sobre gradiente)', 'fg-muted', 'bg-subtle', 4.5],
  ['brand/bg-subtle (acento sobre gradiente)', 'brand', 'bg-subtle', 4.5],
  ['fg/primary-ghost (texto sobre superficie ghost)', 'fg', 'primary-ghost', 4.5],
  ['accent-fg/brand-soft (insignia)', 'accent-fg', 'brand-soft', 4.5],
  ['success/bg (confirmación)', 'success', 'bg', 4.5],
  ['success/card (confirmación en tarjetas)', 'success', 'card', 4.5],
  ['border-strong/card (frontera de inputs)', 'border-strong', 'card', 3.0],
  ['border-strong/bg (frontera de inputs)', 'border-strong', 'bg', 3.0]
];

let failed = 0;
/** @type {string[]} */
const softWarnings = [];

function validateTheme(label, props) {
  const resolved = {};
  for (const name of SEMANTIC) {
    if (!(name in props)) {
      failed += 1;
      console.log(`FAIL  ${label}: falta --${name}`);
      continue;
    }
    try {
      resolved[name] = resolveValue(props[name], props);
    } catch (err) {
      failed += 1;
      console.log(`FAIL  ${label}: no se pudo resolver --${name}: ${err.message}`);
    }
  }
  const bg = toRgb(resolved.bg, [255, 255, 255]);
  const card = toRgb(resolved.card, bg);

  for (const [name, fgName, bgName, min] of PAIRS) {
    if (!resolved[fgName] || !resolved[bgName]) continue;
    const fgRgb = toRgb(resolved[fgName], bg);
    const backdrop = toRgb(resolved[bgName], bg);
    const r = ratio(fgRgb, backdrop);
    const ok = r >= min;
    if (!ok) failed += 1;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} ${name}: ${r.toFixed(2)}:1 (mínimo ${min}:1)`);
  }

  if (resolved.brand) {
    const ringRaw = props['focus-ring'] ?? '';
    const ringMatch =
      ringRaw.match(/color-mix\(in srgb, var\([^)]+\)\s+[\d.]+%\s*,\s*transparent\)/) ??
      ringRaw.match(/var\(\s*--[\w-]+\s*\)/);
    if (!ringMatch) {
      failed += 1;
      console.log(`FAIL  ${label}: --focus-ring sin referencia cromática reconocible`);
    } else {
      const ring = resolveValue(ringMatch[0], props);
      const ringRgb = toRgb(ring, bg);
      const rBg = ratio(ringRgb, bg);
      const rCard = ratio(ringRgb, card);
      const ok = Math.min(rBg, rCard) >= 3.0;
      if (!ok) failed += 1;
      console.log(
        `${ok ? 'PASS' : 'FAIL'}  ${label} focus-ring sobre bg/card: ${Math.min(rBg, rCard).toFixed(2)}:1 (mínimo 3:1)`
      );
    }
  }
}

const { light, dark, darkConsistent, darkPartial } = extractThemes(css);
validateTheme('claro', light);
if (darkPartial) {
  failed += 1;
  console.log('FAIL  tema oscuro: falta una de las dos variantes (@media o data-theme)');
} else if (dark && Object.keys(dark).length > 0) {
  if (!darkConsistent) {
    failed += 1;
    console.log('FAIL  tema oscuro: las variantes @media y data-theme no coinciden');
  }
  validateTheme('oscuro', dark);
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

const textAccentUsage = sourceFiles(join(root, 'src')).filter(
  (file) => /\.(?:astro|css|ts)$/.test(file) && readFileSync(file, 'utf8').includes('text-accent')
);
if (textAccentUsage.length > 0) {
  failed += 1;
  console.log(`FAIL  text-accent prohibido por contraste: ${textAccentUsage.join(', ')}`);
} else {
  console.log('PASS  text-accent sin consumidores');
}

const strayOklch = sourceFiles(join(root, 'src')).filter((file) => {
  if (!/\.(?:astro|css|ts)$/.test(file) || file.endsWith('src/styles/global.css')) return false;
  return readFileSync(file, 'utf8').includes('oklch(');
});
if (strayOklch.length > 0) {
  failed += 1;
  console.log(`FAIL  oklch fuera de global.css: ${strayOklch.join(', ')}`);
} else {
  console.log('PASS  los colores literales viven solo en global.css');
}

const themeColorFiles = [
  'src/lib/themeColors.ts',
  'src/layouts/Layout.astro',
  'src/scripts/themeToggle.ts',
  'src/scripts/theme-init.js'
];
const colorLiterals = themeColorFiles.flatMap((file) => {
  const matches = readFileSync(join(root, file), 'utf8').match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  return matches.map((value) => `${file}: ${value}`);
});
if (colorLiterals.length > 0) {
  failed += 1;
  console.log(`FAIL  theme-color con literales: ${colorLiterals.join(', ')}`);
} else {
  console.log('PASS  theme-color sale de --bg-day y --bg-night');
}

if (softWarnings.length) {
  console.log(`\nINFO  ${softWarnings.length} aviso(s).`);
}

if (failed > 0) {
  console.error(`\n${failed} comprobación(es) fallida(s).`);
  process.exit(1);
}
console.log('\nContraste y fuente única: OK.');
