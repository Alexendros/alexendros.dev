#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CDP_URL = process.env.CDP_URL ?? 'http://127.0.0.1:9222';
const ENV_FILE = resolve(process.cwd(), '.env.local');
const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const OPEN_ONLY = args.has('--open-only');

const CONSTANTS = {
  PUBLIC_COOKIE_CONSENT_VERSION: '3'
};

const TARGETS = [
  {
    keys: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    label: 'Upstash → base de datos → REST API',
    url: 'https://console.upstash.com/',
    patterns: [/https:\/\/[a-z0-9-]+\.upstash\.io/]
  },
  {
    keys: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
    label: 'Proton → Settings → IMAP/SMTP → token SMTP',
    url: 'https://account.proton.me/mail/imap-smtp',
    manual: true
  }
];

function writeEnvFile(found) {
  const lines = Object.entries({ ...CONSTANTS, ...found }).map(([k, v]) => `${k}=${v}`);
  writeFileSync(ENV_FILE, `${lines.join('\n')}\n`);
}

async function main() {
  if (OPEN_ONLY) {
    console.log('Abre manualmente:', TARGETS.map((t) => t.url).join('\n'));
    return;
  }
  if (existsSync(ENV_FILE) && !FORCE) {
    console.log(`.env.local ya existe (${ENV_FILE}). Usa --force para sobrescribir.`);
    return;
  }
  const browser = await chromium.connectOverCDP(CDP_URL);
  const found = {};
  console.log('Conectado a CDP. Completa Upstash/Proton en el navegador si hace falta.');
  for (const target of TARGETS) {
    console.log(`→ ${target.label}`);
    if (target.manual) continue;
  }
  writeEnvFile(found);
  console.log('Escrito', ENV_FILE);
  await browser.close();
  void readFileSync;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
