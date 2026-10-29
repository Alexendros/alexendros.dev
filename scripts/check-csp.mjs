/**
 * Informe CSP de T0 (plan alexendrosdev-v2).
 * Lista 'unsafe-inline', style= y scripts inline sin hash, y sale 0.
 * El bloqueo llega cuando el árbol ya cumple; este bloque solo informa.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_ROOTS = ['src', 'packages', 'apps'];
const SOURCE_EXTENSIONS = new Set([
  '.astro',
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.html',
  '.vue',
  '.svelte',
  '.mdx'
]);
const HTML_ROOTS = ['.vercel/output/static', 'dist'];
const STYLE_PATTERN = /\sstyle=/;

export function inspectTree(root) {
  const findings = [];
  const policies = readPolicies(root);
  findings.push(...unsafeInlineFindings(policies));

  for (const sourceRoot of SOURCE_ROOTS) {
    const dir = join(root, sourceRoot);
    if (!existsSync(dir)) continue;
    for (const file of walk(dir, (name) => SOURCE_EXTENSIONS.has(extname(name)))) {
      const text = readFileSync(file, 'utf8');
      findings.push(...styleFindings(text, relative(root, file)));
      findings.push(...scriptFindings(text, relative(root, file), policies));
    }
  }

  for (const htmlRoot of HTML_ROOTS) {
    const dir = join(root, htmlRoot);
    if (!existsSync(dir)) continue;
    for (const file of walk(dir, (name) => extname(name) === '.html')) {
      const text = readFileSync(file, 'utf8');
      findings.push(...styleFindings(text, relative(root, file)));
      findings.push(...scriptFindings(text, relative(root, file), policies));
    }
  }

  return findings;
}

export function report(root) {
  const findings = inspectTree(root);
  const lines = ['check-csp: informe', ...findings, `hallazgos: ${findings.length}`];
  return { text: `${lines.join('\n')}\n`, exitCode: 0 };
}

function readPolicies(root) {
  const file = join(root, 'vercel.json');
  if (!existsSync(file)) return [];
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
  const groups = Array.isArray(data.headers) ? data.headers : [];
  const policies = [];
  for (const group of groups) {
    for (const header of group.headers ?? []) {
      const key = String(header.key ?? '').toLowerCase();
      if (key === 'content-security-policy' || key === 'content-security-policy-report-only') {
        policies.push(String(header.value ?? ''));
      }
    }
  }
  return policies;
}

function unsafeInlineFindings(policies) {
  const findings = [];
  for (const policy of policies) {
    for (const part of policy.split(';')) {
      if (!part.includes("'unsafe-inline'")) continue;
      const directive = part.trim().split(/\s+/)[0] ?? 'csp';
      findings.push(`unsafe-inline ${directive}`);
    }
  }
  return findings;
}

function styleFindings(text, file) {
  const findings = [];
  const lines = text.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (STYLE_PATTERN.test(lines[index])) findings.push(`style ${file}:${index + 1}`);
  }
  return findings;
}

function scriptFindings(text, file, policies) {
  const hashes = scriptSrcHashes(policies);
  const findings = [];
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  for (const match of text.matchAll(pattern)) {
    const attrs = match[1] ?? '';
    if (/\ssrc\s*=/i.test(attrs) || attrs.trim().startsWith('src=')) continue;
    const body = match[2] ?? '';
    const hash = `sha256-${createHash('sha256').update(body).digest('base64')}`;
    if (hashes.has(hash)) continue;
    const line = text.slice(0, match.index ?? 0).split('\n').length;
    findings.push(`script ${file}:${line} ${hash}`);
  }
  return findings;
}

function scriptSrcHashes(policies) {
  const hashes = new Set();
  for (const policy of policies) {
    for (const part of policy.split(';')) {
      const trimmed = part.trim();
      if (!trimmed.startsWith('script-src')) continue;
      for (const token of trimmed.split(/\s+/)) {
        if (token.startsWith("'sha256-") && token.endsWith("'")) {
          hashes.add(token.slice(1, -1));
        }
      }
    }
  }
  return hashes;
}

function walk(dir, includeFile) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue;
    const path = join(dir, entry);
    const info = statSync(path);
    if (info.isDirectory()) files.push(...walk(path, includeFile));
    else if (includeFile(entry)) files.push(path);
  }
  return files;
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(process.argv[1]).href;
}

function rootFromArgs(argv) {
  const index = argv.indexOf('--root');
  if (index === -1) return process.cwd();
  return argv[index + 1] ?? process.cwd();
}

if (isDirectRun()) {
  const result = report(rootFromArgs(process.argv.slice(2)));
  process.stdout.write(result.text);
  process.exit(result.exitCode);
}
