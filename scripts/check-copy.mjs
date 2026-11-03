#!/usr/bin/env node
/**
 * Gate de copy:
 * 1. Tipografía: coma/punto y coma pegados a una letra minúscula en la misma línea.
 * 2. D3: términos prohibidos fuera de «Ficha técnica» (email, binario, trackers, Git, CWV, link building).
 * 3. Segunda persona en copy comercial (debe ser tercera persona/impersonal).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const TARGETS = ['src/content', 'src/components', 'src/scripts', 'src/pages'];
// Alcance del gate D3 + segunda persona: copy comercial visible. Las páginas
// legales de src/pages (cookies, privacidad, accesibilidad) sí pueden usar
// 2.ª persona, y src/scripts es código de cliente.
const COPY_TARGETS = ['src/content', 'src/components'];
const EXT = /\.(astro|tsx|ts)$/;
const BAD_LINE = /[,;][a-záéíóúñü]/;

// D3: términos prohibidos fuera de «Ficha técnica».
const D3_TERMS = [
  { label: 'email', re: /\bemail\b/i },
  { label: 'binario', re: /\bbinario\b/i },
  { label: 'trackers', re: /\btrackers\b/i },
  { label: 'Git', re: /\bgit\b/i },
  { label: 'CWV', re: /\bcwv\b/i },
  { label: 'link building', re: /link\s+building/i }
];

// Segunda persona (el copy comercial se redacta en tercera persona/impersonal).
const SECOND_PERSON_RE = /\b(puedes|puedas|tienes|tu|tus|te|contigo|tú)\b/i;

// Usos técnicos legítimos del término fuera de copy (claves, ids). Solo se
// exime el término indicado en el archivo indicado.
const D3_FILE_EXCEPTIONS = new Map([['src/content/contact.ts', new Set(['email'])]]);

function stringLiterals(source) {
  const out = [];
  const re = /(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g;
  let m;
  while ((m = re.exec(source))) {
    const body = m[0].slice(1, -1);
    if (body.length < 4) continue;
    if (!/[a-záéíóúñü]/i.test(body)) continue;
    out.push(body);
  }
  return out;
}

/** Texto entre tags tras quitar frontmatter, script y style. */
function markupTextChunks(source) {
  let s = source.replace(/^---[\s\S]*?---\s*/, '');
  // Cierre con [^>]* (CodeQL js/bad-tag-filter: admite atributos/whitespace raros).
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi, ' ');
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style\b[^>]*>/gi, ' ');
  const out = [];
  const re = />([^<]+)</g;
  let m;
  while ((m = re.exec(s))) {
    const t = m[1].replace(/\{[^}]*\}/g, ' ').trim();
    if (t.length > 2 && /[a-záéíóúñü]/i.test(t)) out.push(t);
  }
  return out;
}

/**
 * Literales dentro de los campos `technologies` y `responsibilities`: son el
 * contenido de «Ficha técnica» de las referencias, donde D3 permite jerga.
 */
function fichaTecnicaLiterals(source) {
  const out = new Set();
  const re = /(?:technologies|responsibilities):\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = re.exec(source))) {
    for (const lit of m[1].matchAll(/(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g)) {
      out.add(lit[0].slice(1, -1));
    }
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

function collectFiles(targets) {
  const files = [];
  for (const target of targets) {
    const abs = join(ROOT, target);
    let stats;
    try {
      stats = statSync(abs);
    } catch {
      console.error(`check:copy — target inexistente: ${target}`);
      process.exit(1);
    }
    if (stats.isDirectory()) walk(abs, files);
    else files.push(abs);
  }
  return files;
}

function scanChunks(file, chunks, hits) {
  for (const lit of chunks) {
    for (const line of lit.split('\n')) {
      if (!BAD_LINE.test(line)) continue;
      const m = line.match(BAD_LINE);
      hits.push({
        file: relative(ROOT, file),
        rule: 'tipografía',
        snippet: line.trim().slice(Math.max(0, (m?.index ?? 0) - 16), (m?.index ?? 0) + 20)
      });
    }
  }
}

function pushCopyHit(file, rule, text, hits) {
  hits.push({ file: relative(ROOT, file), rule, snippet: text.trim().slice(0, 80) });
}

/** Nombres comerciales decididos con 2ª persona: literal exacto, solo en su archivo. */
const SECOND_PERSON_EXCEPTIONS = new Map([
  ['src/content/paquetes.ts', new Set(['Asistente IA para tu negocio'])]
]);

/** Gate D3 + segunda persona sobre literales de contenido (.ts, no test). */
function checkTsPolicy(file, source, hits) {
  if (/\.test\.ts$/.test(file)) return;
  const rel = relative(ROOT, file);
  const allowed = D3_FILE_EXCEPTIONS.get(rel) ?? new Set();
  const ficha = fichaTecnicaLiterals(source);
  for (const lit of stringLiterals(source)) {
    if (ficha.has(lit)) continue;
    for (const { label, re } of D3_TERMS) {
      if (allowed.has(label)) continue;
      if (re.test(lit)) {
        pushCopyHit(file, `D3: ${label}`, lit, hits);
        break;
      }
    }
    if (SECOND_PERSON_RE.test(lit) && !SECOND_PERSON_EXCEPTIONS.get(rel)?.has(lit))
      pushCopyHit(file, '2ª persona', lit, hits);
  }
}

/** Gate D3 + segunda persona sobre copy visible de markup (.astro/.tsx). */
function checkMarkupPolicy(file, source, hits) {
  for (const text of markupTextChunks(source)) {
    for (const { label, re } of D3_TERMS) {
      if (re.test(text)) {
        pushCopyHit(file, `D3: ${label}`, text, hits);
        break;
      }
    }
    if (SECOND_PERSON_RE.test(text)) pushCopyHit(file, '2ª persona', text, hits);
  }
}

const hits = [];
for (const file of collectFiles(TARGETS)) {
  const src = readFileSync(file, 'utf8');
  scanChunks(file, stringLiterals(src), hits);
  if (/\.(astro|tsx)$/.test(file)) {
    scanChunks(file, markupTextChunks(src), hits);
  }
}

for (const file of collectFiles(COPY_TARGETS)) {
  const src = readFileSync(file, 'utf8');
  if (/\.(astro|tsx)$/.test(file)) checkMarkupPolicy(file, src, hits);
  else checkTsPolicy(file, src, hits);
}

if (hits.length) {
  console.error('check:copy — problemas de copy:');
  for (const h of hits) {
    console.error(`  ${h.file}: ${h.rule} …${h.snippet}…`);
  }
  process.exit(1);
}

console.log('check:copy OK');
