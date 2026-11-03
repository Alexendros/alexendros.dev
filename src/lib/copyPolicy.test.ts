import { describe, expect, it } from 'vitest';

// Replican las reglas de scripts/check-copy.mjs (D3 + segunda persona).
const D3_TERMS = [
  { label: 'email', re: /\bemail\b/i },
  { label: 'binario', re: /\bbinario\b/i },
  { label: 'trackers', re: /\btrackers\b/i },
  { label: 'Git', re: /\bgit\b/i },
  { label: 'CWV', re: /\bcwv\b/i },
  { label: 'link building', re: /link\s+building/i }
];

const SECOND_PERSON_RE = /\b(puedes|puedas|tienes|tu|tus|te|contigo|tú)\b/i;

describe('check:copy política D3', () => {
  it('detecta los términos prohibidos fuera de «Ficha técnica»', () => {
    for (const { label, re } of D3_TERMS) {
      expect(re.test(`presupuestos por ${label}`)).toBe(true);
    }
  });

  it('no marca compuestos donde el término no es palabra completa', () => {
    expect(/\bgit\b/i.test('github.com')).toBe(false);
    expect(/\bemail\b/i.test('emails')).toBe(false);
  });

  it('no marca el texto ya corregido', () => {
    expect(/\bemail\b/i.test('presupuestos solo por correo')).toBe(false);
    expect(/\bbinario\b/i.test('programa ligero de unos 3 MB')).toBe(false);
    expect(/\btrackers\b/i.test('sin rastreo publicitario')).toBe(false);
    expect(/\bgit\b/i.test('historial de cambios')).toBe(false);
    expect(/\bcwv\b/i.test('velocidad de carga orientada')).toBe(false);
    expect(/link\s+building/i.test('compra de enlaces')).toBe(false);
  });
});

describe('check:copy segunda persona', () => {
  it('detecta segunda persona', () => {
    expect(SECOND_PERSON_RE.test('puedes escribir aquí')).toBe(true);
    expect(SECOND_PERSON_RE.test('tienes dudas')).toBe(true);
    expect(SECOND_PERSON_RE.test('tu sitio web')).toBe(true);
  });

  it('acepta tercera persona e impersonal', () => {
    expect(SECOND_PERSON_RE.test('se puede escribir aquí')).toBe(false);
    expect(SECOND_PERSON_RE.test('la persona responsable')).toBe(false);
    expect(SECOND_PERSON_RE.test('técnica y contenido')).toBe(false);
  });
});
