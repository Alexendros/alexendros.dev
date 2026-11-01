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
  const root = mkdtempSync(join(tmpdir(), 'check-public-pricing-'));
  roots.push(root);
  mkdirSync(join(root, 'src/lib/tracking'), { recursive: true });
  mkdirSync(join(root, 'docs/standards'), { recursive: true });
  return root;
}

function run(root: string, ...args: string[]) {
  return spawnSync(
    process.execPath,
    [join(process.cwd(), 'scripts/check-public-pricing.mjs'), '--root', root, ...args],
    { encoding: 'utf8' }
  );
}

describe('check-public-pricing', () => {
  it('detecta importes, IVA, campos económicos y metadatos generados', () => {
    const root = tree();
    writeFileSync(join(root, 'src/service.ts'), 'export const priceEuros = 120;\n');
    writeFileSync(join(root, 'docs/standards/oferta.md'), 'Desde 120 € + IVA\n');
    mkdirSync(join(root, '.vercel/output/static'), { recursive: true });
    writeFileSync(
      join(root, '.vercel/output/static/index.html'),
      '<script type="application/ld+json">{"priceRange":"€€"}</script>\n'
    );

    const result = run(root, '--require-build');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('src/service.ts:1 campo priceEuros');
    expect(result.stderr).toContain('docs/standards/oferta.md:1 símbolo de euro');
    expect(result.stderr).toContain('docs/standards/oferta.md:1 referencia fiscal pública');
    expect(result.stderr).toContain('docs/standards/oferta.md:1 importe inicial');
    expect(result.stderr).toContain('index.html:1 dato estructurado priceRange');
  });

  it('permite contenido de propuesta sin importes y la excepción ISO acotada', () => {
    const root = tree();
    writeFileSync(
      join(root, 'src/lib/tracking/capi.test.ts'),
      "expect(body.custom_data.currency).toBe('EUR');\n"
    );
    writeFileSync(join(root, 'src/service.ts'), "export const engagement = 'proposal';\n");
    writeFileSync(join(root, 'docs/standards/oferta.md'), 'Condiciones en la propuesta.\n');

    const result = run(root);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('check-public-pricing: OK');
  });

  it('exige la salida generada cuando se solicita', () => {
    const root = tree();
    const result = run(root, '--require-build');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('No existe .vercel/output/static');
  });

  it('solo admite el precio de paquetes en su fichero de datos y en su hueco del HTML', () => {
    const root = tree();
    mkdirSync(join(root, 'src/content'), { recursive: true });
    writeFileSync(join(root, 'src/content/paquetes.ts'), "export const t = 'desde 900 €';\n");
    mkdirSync(join(root, '.vercel/output/static'), { recursive: true });
    writeFileSync(
      join(root, '.vercel/output/static/index.html'),
      '<p class="x" data-paquete-precio>desde 900 €</p><p>otro desde 50 €</p>\n'
    );
    const result = run(root, '--require-build');
    expect(result.status).toBe(1);
    expect(result.stderr).not.toContain('paquetes.ts');
    expect(result.stderr).toContain('index.html:1 símbolo de euro');

    writeFileSync(
      join(root, '.vercel/output/static/index.html'),
      '<p class="x" data-paquete-precio>desde 900 €</p>\n'
    );
    expect(run(root, '--require-build').status).toBe(0);
  });
});
