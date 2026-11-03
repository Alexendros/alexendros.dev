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

  it('con paquetes ocultos, cualquier precio en el HTML es un hallazgo', () => {
    const root = tree();
    mkdirSync(join(root, 'src/content'), { recursive: true });
    writeFileSync(
      join(root, 'src/content/paquetes.ts'),
      "export const paquetesPublicados: boolean = false;\nconst t = '349 € + IVA';\n"
    );
    mkdirSync(join(root, '.vercel/output/static'), { recursive: true });
    writeFileSync(
      join(root, '.vercel/output/static/index.html'),
      '<p data-paquete-precio>349 € + IVA</p>\n'
    );

    const result = run(root, '--require-build');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('index.html:1 símbolo de euro');
    expect(result.stderr).not.toContain('src/content/paquetes.ts');
  });

  it('con paquetes publicados, solo admite cifras en sus huecos marcados', () => {
    const root = tree();
    mkdirSync(join(root, 'src/content'), { recursive: true });
    writeFileSync(
      join(root, 'src/content/paquetes.ts'),
      'export const paquetesPublicados: boolean = true;\n'
    );
    mkdirSync(join(root, '.vercel/output/static'), { recursive: true });
    writeFileSync(
      join(root, '.vercel/output/static/index.html'),
      '<p data-paquete-precio>349 € + IVA</p>\n<p data-paquete-letra>Después, 120 € al año.</p>\n<p>Oferta 99 €</p>\n'
    );

    const result = run(root, '--require-build');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('index.html:3 símbolo de euro');
    expect(result.stderr).not.toContain('index.html:1');
    expect(result.stderr).not.toContain('index.html:2');
  });

  it('la excepción «desde N» de paquetes.ts solo cubre la frase exacta de Grok Bot', () => {
    const root = tree();
    mkdirSync(join(root, 'src/content'), { recursive: true });
    writeFileSync(
      join(root, 'src/content/paquetes.ts'),
      [
        'export const paquetesPublicados: boolean = false;',
        "      'Después, 180 € al año. Suscripción Grok Bot a nombre del cliente: desde 300 $/año + impuestos (o 30 $/mes).',",
        "const otra = 'desde 99 al mes';"
      ].join('\n') + '\n'
    );
    writeFileSync(join(root, 'src/otro.ts'), "const t = 'desde 300 $/año';\n");

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).not.toContain('paquetes.ts:2');
    expect(result.stderr).toContain('src/content/paquetes.ts:3 importe inicial');
    expect(result.stderr).toContain('src/otro.ts:1 importe inicial');
  });
});
