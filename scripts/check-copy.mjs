#!/usr/bin/env node
/**
 * Detecta coma/punto y coma pegados a una letra minúscula en la misma línea
 * de literales de copy (p. ej. «clientes,no»). No colapsa saltos de línea:
 * el salto tras coma es válido en prosa envuelta; el fallo tipográfico es
 * la ausencia de espacio en la misma línea.
 *
 * Origen: Prettier/ESLint no validan ortotipografía española; un H1 partido
 * en dos líneas ocultaba el patrón al grep literal.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const TARGETS = [
  'src/content',
  'src/components/Hero.astro',
  'src/components/StickyCta.astro',
  'src/components/ExitIntent.tsx',
  'src/components/ContactForm.tsx',
  'src/components/consent/CookieBanner.tsx',
  'src/pages/index.astro',
  'src/pages/contacto.astro',
  'src/pages/cookies.astro',
  'src/pages/privacidad.astro',
  'src/pages/identidad.astro'
];
const EXT = /\.(astro|tsx|ts)$/;
const BAD_LINE = /[,;][a-záéíóúñü]/;

function stringLiterals(source) {
  const out = [];
  const re = /(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g;
  let m;
  while ((m = re.exec(source))) {
    // Evitar template vacíos / imports de path
    const body = m[0].slice(1, -1);
    if (body.length < 4) continue;
    if (!/[a-záéíóúñü]/i.test(body)) continue;
    out.push(body);
  }
  return out;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (EXT.test(name)) files.push(p);
  }
  return files;
}

function collectFiles() {
  const files = [];
  for (const t of TARGETS) {
    const abs = join(ROOT, t);
    try {
      const st = statSync(abs);
      if (st.isDirectory()) walk(abs, files);
      else files.push(abs);
    } catch {
      /* ruta opcional */
    }
  }
  return files;
}

const hits = [];
for (const file of collectFiles()) {
  const src = readFileSync(file, 'utf8');
  for (const lit of stringLiterals(src)) {
    for (const line of lit.split('\n')) {
      if (!BAD_LINE.test(line)) continue;
      const m = line.match(BAD_LINE);
      hits.push({
        file: relative(ROOT, file),
        snippet: line.trim().slice(Math.max(0, (m?.index ?? 0) - 16), (m?.index ?? 0) + 20)
      });
    }
  }
}

if (hits.length) {
  console.error('check:copy — coma/punto y coma sin espacio antes de letra minúscula:');
  for (const h of hits) {
    console.error(`  ${h.file}: …${h.snippet}…`);
  }
  process.exit(1);
}

console.log('check:copy OK');
