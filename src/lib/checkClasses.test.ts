import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BTN_WHITELIST_EXCEPTIONS,
  PROTECTED_BTN_SURFACES,
  scanProtectedBtnSurfaces,
  scanSource
} from '../../scripts/check-classes.mjs';

describe('check:classes (C-08)', () => {
  it('falla con shadow-lg, /alpha, hex, bg-black y text-white', () => {
    // Concatenar evita que Tailwind escanee literales de clase en el fixture.
    const bad = [
      '<div class="',
      'shadow-' + 'lg',
      ' bg-primary' + '/50',
      ' text-[#' + 'ff0000]',
      ' bg-' + 'black',
      ' text-' + 'white',
      '"></div>'
    ].join('');
    const hits = scanSource(bad, 'fixture.astro');
    const ids = new Set(hits.map((h) => h.id));
    expect(ids.has('shadow-default')).toBe(true);
    expect(ids.has('theme-alpha')).toBe(true);
    expect(ids.has('arbitrary-hex')).toBe(true);
    expect(ids.has('bg-black')).toBe(true);
    expect(ids.has('text-white')).toBe(true);
  });

  it('acepta clases semánticas del design system', () => {
    const ok = `<div class="bg-card text-fg border-border shadow-none"></div>`;
    expect(scanSource(ok)).toEqual([]);
  });

  it('falla con style=, is:inline e innerHTML', () => {
    expect(
      scanSource('<p style="color:red">x</p>', 's.astro').some((h) => h.id === 'style-attr')
    ).toBe(true);
    expect(
      scanSource('<script is:inline></script>', 'i.astro').some((h) => h.id === 'is-inline')
    ).toBe(true);
    expect(scanSource('el.innerHTML = "x"', 'x.ts').some((h) => h.id === 'inner-html')).toBe(true);
  });
});

describe('check:classes — btn en superficies protegidas', () => {
  it('lista cerrada: Hero y ContactCta', () => {
    expect(PROTECTED_BTN_SURFACES).toEqual([
      'src/components/sections/Hero.astro',
      'src/components/sections/ContactCta.astro'
    ]);
  });

  it('lista blanca de excepciones alineada con diseno.md', () => {
    expect(BTN_WHITELIST_EXCEPTIONS).toEqual([
      'Header.astro',
      'SkipLink.astro',
      'ContactForm.astro',
      'Paquetes.astro',
      'Servicios.astro',
      'Referencias.astro',
      'Metodo.astro'
    ]);
  });

  it('falla si Hero reintroduce btn btn-primary en markup fuente', () => {
    const bad = '<a class="btn btn-primary btn-lg" href="/x">CTA</a>';
    const hits = scanProtectedBtnSurfaces(bad, 'src/components/sections/Hero.astro');
    expect(hits.some((h) => h.id === 'btn-direct')).toBe(true);
    expect(hits[0]?.message).toMatch(/Button\.astro/);
  });

  it('acepta Hero que usa el componente Button sin literales btn', () => {
    const ok = `<Button href="/x" variant="primary" size="lg">CTA</Button>`;
    expect(scanProtectedBtnSurfaces(ok, 'src/components/sections/Hero.astro')).toEqual([]);
  });

  it('no dispara por comentario HTML que mencione btn-primary', () => {
    const withComment = `<!-- legacy: class="btn btn-primary" -->\n<Button href="/x">CTA</Button>`;
    expect(scanProtectedBtnSurfaces(withComment, 'src/components/sections/Hero.astro')).toEqual([]);
  });

  it('no dispara por texto fuera de atributos class', () => {
    const prose = `<p>No usar btn-primary a mano; usa Button.</p><Button href="/x">OK</Button>`;
    expect(scanProtectedBtnSurfaces(prose, 'src/components/sections/Hero.astro')).toEqual([]);
  });

  it('Button.astro real queda fuera del gate aunque emita btn*', () => {
    const src = readFileSync(resolve('src/components/Button.astro'), 'utf8');
    expect(scanProtectedBtnSurfaces(src, 'src/components/Button.astro')).toEqual([]);
  });

  it('design-system.astro queda fuera del gate', () => {
    const src = readFileSync(resolve('src/pages/design-system.astro'), 'utf8');
    expect(scanProtectedBtnSurfaces(src, 'src/pages/design-system.astro')).toEqual([]);
  });

  it('no aplica a Header ni otras excepciones', () => {
    const raw = '<a class="btn btn-primary" href="/contacto">Contacto</a>';
    expect(scanProtectedBtnSurfaces(raw, 'src/components/Header.astro')).toEqual([]);
  });
});
