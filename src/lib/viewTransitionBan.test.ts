import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const TARGETS = ['src', '.stylelintrc.json'] as const;
const FORBIDDEN = /view-transition/i;

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(css|astro|ts|tsx|mjs|cjs|json|md)$/.test(name)) files.push(p);
  }
  return files;
}

function collectFiles(): string[] {
  const files: string[] = [];
  for (const t of TARGETS) {
    const abs = join(ROOT, t);
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, files);
    else files.push(abs);
  }
  return files;
}

describe('View Transitions prohibidas (C-01, ADR 0004/0022)', () => {
  it('cero coincidencias de view-transition en src/ y .stylelintrc.json', () => {
    const hits: string[] = [];
    for (const file of collectFiles()) {
      // Este propio test nombra la regla; se excluye del barrido.
      if (file.endsWith('viewTransitionBan.test.ts')) continue;
      const src = readFileSync(file, 'utf8');
      if (FORBIDDEN.test(src)) hits.push(file.replace(ROOT + '/', ''));
    }
    expect(hits, `view-transition presente en: ${hits.join(', ')}`).toEqual([]);
  });
});
