import { describe, expect, it } from 'vitest';
import { splitTwoLineLabel } from './stackedLabel';

describe('splitTwoLineLabel', () => {
  it('separa la primera palabra del resto', () => {
    expect(splitTwoLineLabel('Servicios profesionales')).toEqual({
      primary: 'Servicios',
      secondary: 'profesionales'
    });
    expect(splitTwoLineLabel('Formulario de contacto')).toEqual({
      primary: 'Formulario',
      secondary: 'de contacto'
    });
    expect(splitTwoLineLabel('Solicitar presupuesto')).toEqual({
      primary: 'Solicitar',
      secondary: 'presupuesto'
    });
  });

  it('sin segunda línea si solo hay una palabra', () => {
    expect(splitTwoLineLabel('Contacto')).toEqual({ primary: 'Contacto', secondary: null });
  });
});
