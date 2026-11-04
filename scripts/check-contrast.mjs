// Valida el contraste WCAG de los tokens de producto (global.css) y de los
// temas daisyUI alexlight/alexdark (theme.css). Uso: pnpm check:contrast.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractThemes,
  extractDaisyThemes,
  parseDeclarations,
  resolveValue,
  toRgb,
  ratio,
  mix
} from './contrast-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
const themeCss = readFileSync(join(root, 'src/styles/theme.css'), 'utf8');
const atlapsCss = readFileSync(join(root, 'src/styles/design-references.css'), 'utf8');
const atlaps = parseDeclarations(atlapsCss);

const SEMANTIC = [
  'bg',
  'bg-subtle',
  'fg',
  'fg-muted',
  'brand',
  'brand-hover',
  'brand-fg',
  'border-color',
  'border-strong',
  'card',
  'danger',
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
  ['border-strong/card (frontera de inputs)', 'border-strong', 'card', 3.0],
  ['border-strong/bg (frontera de inputs)', 'border-strong', 'bg', 3.0]
];

const DAISY_ROLES = [
  'base-100',
  'base-200',
  'base-300',
  'base-content',
  'primary',
  'primary-content',
  'secondary',
  'secondary-content',
  'accent',
  'accent-content',
  'neutral',
  'neutral-content',
  'info',
  'info-content',
  'success',
  'success-content',
  'warning',
  'warning-content',
  'error',
  'error-content'
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

function daisyKey(role) {
  return `color-${role}`;
}

function validateDaisyTheme(label, props) {
  const resolved = {};
  for (const role of DAISY_ROLES) {
    const key = daisyKey(role);
    if (!(key in props)) {
      failed += 1;
      console.log(`FAIL  ${label}: falta --${key}`);
      continue;
    }
    try {
      resolved[role] = resolveValue(props[key], props);
    } catch (err) {
      failed += 1;
      console.log(`FAIL  ${label}: no se pudo resolver --${key}: ${err.message}`);
    }
  }

  const contentPairs = [
    ['primary', 'primary-content', 4.5],
    ['secondary', 'secondary-content', 4.5],
    ['accent', 'accent-content', 4.5],
    ['neutral', 'neutral-content', 4.5],
    // La OT limita información y éxito a texto grande/componentes.
    ['info', 'info-content', 3],
    ['success', 'success-content', 3],
    ['warning', 'warning-content', 4.5],
    ['error', 'error-content', 4.5]
  ];

  for (const [bgRole, fgRole, minimum] of contentPairs) {
    if (!resolved[bgRole] || !resolved[fgRole]) continue;
    const r = ratio(toRgb(resolved[fgRole]), toRgb(resolved[bgRole]));
    const ok = r >= minimum;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${label} ${fgRole}/${bgRole}: ${r.toFixed(2)}:1 (mínimo ${minimum}:1)`
    );
  }

  // base-300 es borde/separación, no una superficie de lectura. Su par
  // no textual está cubierto por border-dark/blueprint-deep en Atlaps.
  for (const base of ['base-100', 'base-200']) {
    if (!resolved['base-content'] || !resolved[base]) continue;
    const r = ratio(toRgb(resolved['base-content']), toRgb(resolved[base]));
    const ok = r >= 4.5;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${label} base-content/${base}: ${r.toFixed(2)}:1 (mínimo 4.5:1)`
    );
  }

  // Marcadores y conectores de steps sobre la superficie del proceso.
  for (const base of ['base-100', 'base-200']) {
    if (!resolved.primary || !resolved[base]) continue;
    const r = ratio(toRgb(resolved.primary), toRgb(resolved[base]));
    const ok = r >= 3.0;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${label} steps primary/${base}: ${r.toFixed(2)}:1 (mínimo 3:1)`
    );
  }

  // El texto de acento permitido usa primary; text-accent queda prohibido abajo.
  for (const base of ['base-100', 'base-200']) {
    if (!resolved.primary || !resolved[base]) continue;
    const r = ratio(toRgb(resolved.primary), toRgb(resolved[base]));
    const ok = r >= 4.5;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${label} text-primary/${base}: ${r.toFixed(2)}:1 (mínimo 4.5:1)`
    );
  }

  if (resolved['accent-content'] && resolved.accent) {
    const r = ratio(toRgb(resolved['accent-content']), toRgb(resolved.accent));
    const ok = r >= 4.5;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${label} badge-accent (accent-content/accent): ${r.toFixed(2)}:1 (mínimo 4.5:1)`
    );
  }

  // badge-soft ≈ texto accent sobre mezcla 20% accent + base.
  for (const base of ['base-100', 'base-200']) {
    if (!resolved.accent || !resolved[base]) continue;
    const softBg = mix(toRgb(resolved.accent), toRgb(resolved[base]), 0.2);
    const r = ratio(toRgb(resolved.accent), softBg);
    const ok = r >= 4.5;
    if (!ok) {
      softWarnings.push(`${label} badge-soft/accent sobre ${base}: ${r.toFixed(2)}:1`);
      console.log(
        `WARN  ${label} badge-soft accent/${base}: ${r.toFixed(2)}:1 (<4.5; fase 2 usa badge-outline)`
      );
    } else {
      console.log(`PASS  ${label} badge-soft accent/${base}: ${r.toFixed(2)}:1 (mínimo 4.5:1)`);
    }
  }
}

const { light, dark, darkConsistent, darkPartial } = extractThemes(css);
validateTheme('claro', { ...atlaps, ...light });
if (darkPartial) {
  failed += 1;
  console.log(
    'FAIL  tema oscuro: existe @tema-oscuro pero falta una de las dos variantes (@media o data-theme)'
  );
} else if (dark && Object.keys(dark).length > 0) {
  if (!darkConsistent) {
    failed += 1;
    console.log('FAIL  tema oscuro: las variantes @media y data-theme no coinciden');
  }
  validateTheme('oscuro', { ...atlaps, ...dark });
} else {
  console.log('INFO  tema oscuro de producto no publicado (sin bloque @tema-oscuro)');
}

const daisyThemes = extractDaisyThemes(themeCss);
for (const name of ['alexlight', 'alexdark']) {
  if (!daisyThemes[name]) {
    failed += 1;
    console.log(`FAIL  falta tema daisyUI ${name} en theme.css`);
    continue;
  }
  validateDaisyTheme(name, { ...atlaps, ...daisyThemes[name] });
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
  console.log('PASS  text-accent sin consumidores; el acento ámbar no se usa como texto');
}

const literalsInDaisy = themeCss.match(/#[0-9a-fA-F]{3,8}\b|oklch\(/g) ?? [];
if (literalsInDaisy.length > 0) {
  failed += 1;
  console.log(`FAIL  theme.css contiene ${literalsInDaisy.length} colores literales`);
} else {
  console.log('PASS  theme.css deriva todos sus colores de --ds-atlaps-*');
}

/* Ningún color literal fuera de design-references.css. */
const oklchInGlobal = (css.match(/oklch\(/g) ?? []).length;
if (oklchInGlobal > 0) {
  failed += 1;
  console.log(
    `FAIL  global.css contiene ${oklchInGlobal} literal(es) oklch (deben vivir en design-references.css)`
  );
} else {
  console.log('PASS  global.css sin literales oklch (paleta única en design-references.css)');
}

const themeColorFiles = [
  'src/lib/themeColors.ts',
  'src/layouts/Layout.astro',
  'src/scripts/themeToggle.ts',
  'public/theme-init.js'
];
const colorLiterals = themeColorFiles.flatMap((file) => {
  const matches = readFileSync(join(root, file), 'utf8').match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  return matches.map((value) => `${file}: ${value}`);
});
if (colorLiterals.length > 0) {
  failed += 1;
  console.log(`FAIL  theme-color con literales fuera de Atlaps: ${colorLiterals.join(', ')}`);
} else {
  console.log('PASS  theme-color deriva de --ds-atlaps-paper-bone / --ds-atlaps-blueprint-deep');
}

// Referencia Atlaps de T2: comprueba todos los pares aprobados y sus usos.
const atlapsNames = [
  'blueprint-deep',
  'blueprint-mid',
  'blueprint-soft',
  'paper-bone',
  'paper-grid',
  'amber-signal',
  'amber-glow',
  'ink-graphite',
  'ink-pencil',
  'success',
  'danger',
  'border-dark',
  'danger-dark',
  'link-dark'
];
for (const name of atlapsNames) {
  if (!(`ds-atlaps-${name}` in atlaps)) {
    failed += 1;
    console.log(`FAIL  falta --ds-atlaps-${name}`);
  }
}

const ATLAPS_PAIRS = [
  ['claro', 'texto', 'ink-graphite', 'paper-bone', 14.56, 4.5],
  ['claro', 'texto secundario', 'ink-pencil', 'paper-bone', 4.82, 4.5],
  ['claro', 'texto sobre fondo sutil', 'ink-graphite', 'paper-grid', 12.48, 4.5],
  ['claro', 'secundario sobre sutil (solo grande/UI)', 'ink-pencil', 'paper-grid', 4.13, 3],
  ['claro', 'texto de botón principal', 'paper-bone', 'blueprint-deep', 12.84, 4.5],
  ['claro', 'botón hover', 'paper-bone', 'blueprint-mid', 7.77, 4.5],
  ['claro', 'enlaces', 'blueprint-mid', 'paper-bone', 7.77, 4.5],
  ['claro', 'ámbar como texto (prohibido)', 'amber-signal', 'paper-bone', 2.91, null],
  ['claro', 'texto sobre ámbar', 'ink-graphite', 'amber-signal', 5.0, 4.5],
  ['claro', 'error', 'danger', 'paper-bone', 5.19, 4.5],
  ['claro', 'éxito (solo grande/UI)', 'success', 'paper-bone', 3.58, 3],
  ['claro', 'información (solo grande/UI)', 'blueprint-soft', 'paper-bone', 3.96, 3],
  ['claro', 'borde de campo', 'ink-pencil', 'paper-bone', 4.82, 3],
  ['oscuro', 'texto', 'paper-bone', 'blueprint-deep', 12.84, 4.5],
  ['oscuro', 'texto secundario', 'paper-grid', 'blueprint-deep', 11.01, 4.5],
  ['oscuro', 'acento/CTA', 'amber-glow', 'blueprint-deep', 6.12, 4.5],
  ['oscuro', 'texto de botón ámbar', 'blueprint-deep', 'amber-glow', 6.12, 4.5],
  ['oscuro', 'enlace azul original (solo grande/UI)', 'blueprint-soft', 'blueprint-deep', 3.24, 3],
  ['oscuro', 'ámbar señal (solo grande/UI)', 'amber-signal', 'blueprint-deep', 4.41, 3],
  ['oscuro', 'borde original (prohibido)', 'blueprint-mid', 'blueprint-deep', 1.65, null],
  ['oscuro', 'texto sobre superficie mid', 'paper-bone', 'blueprint-mid', 7.77, 4.5],
  ['oscuro', 'error original (prohibido)', 'danger', 'blueprint-deep', 2.48, null],
  ['oscuro', 'borde ajustado', 'border-dark', 'blueprint-deep', 3.08, 3],
  ['oscuro', 'error ajustado', 'danger-dark', 'blueprint-deep', 4.57, 4.5],
  ['oscuro', 'enlace ajustado', 'link-dark', 'blueprint-deep', 4.57, 4.5]
];

for (const [theme, use, fgName, bgName, expected, minimum] of ATLAPS_PAIRS) {
  const fgRaw = atlaps[`ds-atlaps-${fgName}`];
  const bgRaw = atlaps[`ds-atlaps-${bgName}`];
  if (!fgRaw || !bgRaw) continue;
  const measured = ratio(resolveValue(fgRaw, atlaps), resolveValue(bgRaw, atlaps));
  const referenceMatches = measured.toFixed(2) === expected.toFixed(2);
  const usable = minimum === null || measured >= minimum;
  if (!referenceMatches || !usable) failed += 1;
  console.log(
    `${referenceMatches && usable ? 'PASS' : 'FAIL'}  Atlaps ${theme} ${use}: ${measured.toFixed(2)}:1 (referencia ${expected.toFixed(2)}:1)`
  );
}

if (softWarnings.length) {
  console.log(
    `\nINFO  badge-soft por debajo de AA en ${softWarnings.length} par(es); la fase 2 usará badge-outline.`
  );
}

if (failed > 0) {
  console.error(`\n${failed} comprobación(es) fallida(s).`);
  process.exit(1);
}
console.log('\nContraste y fuente única: OK.');
