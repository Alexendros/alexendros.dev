import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function tree(): string {
  const root = mkdtempSync(join(tmpdir(), 'check-csp-'));
  roots.push(root);
  mkdirSync(join(root, 'src'));
  return root;
}

function run(root: string) {
  return spawnSync(
    process.execPath,
    [join(process.cwd(), 'scripts/check-csp.mjs'), '--root', root],
    {
      encoding: 'utf8'
    }
  );
}

describe('check-csp (T0, informe)', () => {
  it('informa style=, unsafe-inline y script sin hash, y sale 0', () => {
    const root = tree();
    writeFileSync(
      join(root, 'src/a.astro'),
      '<div style="color:red"></div>\n<script>alert(1)</script>\n'
    );
    writeFileSync(
      join(root, 'vercel.json'),
      JSON.stringify({
        headers: [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: "script-src 'unsafe-inline'; style-src 'self'"
              }
            ]
          }
        ]
      })
    );

    const result = run(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('unsafe-inline script-src');
    expect(result.stdout).toContain('style src/a.astro:1');
    expect(result.stdout).toContain('script src/a.astro:2');
    expect(result.stdout).toContain('hallazgos: 3');
  });

  it('no informa el script cuyo hash ya está en script-src', () => {
    const root = tree();
    const body = 'console.log(1)';
    const hash = createHash('sha256').update(body).digest('base64');
    writeFileSync(join(root, 'src/boot.html'), `<script>${body}</script >\n`);
    writeFileSync(
      join(root, 'vercel.json'),
      JSON.stringify({
        headers: [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: `script-src 'sha256-${hash}'`
              }
            ]
          }
        ]
      })
    );

    const result = run(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('hallazgos: 0');
    expect(result.stdout).not.toContain('script src/boot.html');
  });
});
