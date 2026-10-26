#!/usr/bin/env node
/**
 * Guardrail de clases en .astro/.tsx: prohíbe sombras Tailwind por defecto,
 * /alpha sobre colores de tema, hex arbitrarios y bg-black/text-white.
 * Uso: pnpm check:classes
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const TARGET_DIRS = ['src'];
const EXT = /\.(astro|tsx)$/;

const RULES = [
  {
    id: 'shadow-default',
    re: /\bshadow-(?:sm|md|lg|xl|2xl)\b/,
    message: 'usa var(--shadow-*) / clase propia, no shadow-(sm|md|lg|xl|2xl)'
  },
  {
    id: 'theme-alpha',
    re: /\b(?:bg|text|border)-(?:bg|fg|primary|primaryHover|primarySoft|primaryGhost|muted|border|card|ink|danger|subtle|scrim)\/\d+\b/,
    message: 'Tailwind v3 no aplica /N sobre var(); usa color-mix o token'
  },
  {
    id: 'arbitrary-hex',
    re: /\[[^\]]*?#[0-9a-fA-F]{3,8}[^\]]*?\]/,
    message: 'hex arbitrario en clase; usa tokens semánticos'
  },
  {
    id: 'bg-black',
    re: /\bbg-black\b/,
    message: 'bg-black prohibido; usa tokens'
  },
  {
    id: 'text-white',
    re: /\btext-white\b/,
    message: 'text-white prohibido; usa text-ink / tokens'
  }
];

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

export function scanSource(source, fileLabel = 'input') {
  const hits = [];
  const markup = source
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\b[^>]*>/gi, ' ');
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    if (!rule.re.test(markup)) continue;
    rule.re.lastIndex = 0;
    const m = markup.match(rule.re);
    hits.push({ file: fileLabel, id: rule.id, snippet: m?.[0] ?? '', message: rule.message });
  }
  return hits;
}

export function scanRepo(root = ROOT) {
  const files = [];
  for (const d of TARGET_DIRS) walk(join(root, d), files);
  const hits = [];
  for (const file of files) {
    hits.push(...scanSource(readFileSync(file, 'utf8'), relative(root, file)));
  }
  return hits;
}

const invokedAsCli =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (invokedAsCli) {
  const hits = scanRepo();
  if (hits.length) {
    console.error('check:classes — clases prohibidas:');
    for (const h of hits) {
      console.error(`  ${h.file}: ${h.id} «${h.snippet}» — ${h.message}`);
    }
    process.exit(1);
  }
  console.log('check:classes OK');
}
