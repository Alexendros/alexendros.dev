import { describe, expect, it } from 'vitest';

const BAD_LINE = /[,;][a-záéíóúñü]/;

function wouldFailSameLine(text: string): boolean {
  return text.split('\n').some((line) => BAD_LINE.test(line));
}

describe('check:copy tipografía', () => {
  it('detecta clientes,no en la misma línea', () => {
    expect(wouldFailSameLine('clientes,no folletos')).toBe(true);
  });

  it('acepta coma con espacio', () => {
    expect(wouldFailSameLine('clientes, no folletos')).toBe(false);
  });

  it('no marca el salto de línea tras coma (prosa envuelta)', () => {
    expect(
      wouldFailSameLine('Webs que convierten visitas en clientes,\nno folletos que nadie lee.')
    ).toBe(false);
  });

  it('acepta el titular nuevo', () => {
    expect(
      wouldFailSameLine(
        'Un sitio empresarial es más que una página publicada en Internet, es un reflejo de tu identidad virtual que merece atenciones y respeto.'
      )
    ).toBe(false);
  });
});
