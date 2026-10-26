import { describe, expect, it } from 'vitest';
import { resolveStickyCta } from './stickyCta';

const metodoClose = {
  heading: 'Solicitar presupuesto',
  body: 'La respuesta llega lo antes posible.',
  href: '/contacto?motivo=propuestaComercial&origen=proceso'
};

describe('resolveStickyCta', () => {
  it('oculta en contacto y gracias', () => {
    expect(resolveStickyCta('/contacto', metodoClose).show).toBe(false);
    expect(resolveStickyCta('/contacto/', metodoClose).show).toBe(false);
    expect(resolveStickyCta('/gracias', metodoClose).show).toBe(false);
  });

  it('en /metodo usa presupuesto, visible en todos los anchos', () => {
    const view = resolveStickyCta('/metodo', metodoClose);
    expect(view).toMatchObject({
      show: true,
      mode: 'metodo',
      label: 'Solicitar presupuesto',
      body: metodoClose.body,
      href: metodoClose.href,
      alwaysVisible: true,
      mobileOnly: false
    });
  });

  it('en el resto usa propuesta solo móvil', () => {
    const view = resolveStickyCta('/', metodoClose);
    expect(view).toMatchObject({
      show: true,
      mode: 'default',
      label: 'Solicitar propuesta',
      body: null,
      alwaysVisible: false,
      mobileOnly: true
    });
  });
});
