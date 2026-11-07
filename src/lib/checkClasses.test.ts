import { describe, expect, it } from 'vitest';
import {
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

  it('no falla por HTML generado típico de Button.astro (fuera de superficies)', () => {
    const generated = '<a class="btn btn-primary min-h-11" href="/x"><span>CTA</span></a>';
    expect(scanProtectedBtnSurfaces(generated, 'src/components/Button.astro')).toEqual([]);
    expect(scanProtectedBtnSurfaces(generated, 'src/pages/design-system.astro')).toEqual([]);
  });

  it('no aplica a Header ni otras excepciones', () => {
    const raw = '<a class="btn btn-primary" href="/contacto">Contacto</a>';
    expect(scanProtectedBtnSurfaces(raw, 'src/components/Header.astro')).toEqual([]);
  });
});
