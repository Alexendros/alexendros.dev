import { describe, expect, it } from 'vitest';
import { contact } from './contact';
import { formatEuro, portalBasePrice, provisionalPrices } from './pricing';
import { isFixedCommercial, servicePriceLabel, serviceProducts, services } from './services';

/**
 * COM-01: índice (tarjetas), fichas y configurador no se contradicen con el
 * copy/precios vigentes. No inventa fiscalidad ni cancelación.
 * COM-03 queda BLOCKED hasta firma del mantenedor (ver production-closeout).
 */
describe('COM-01 coherencia comercial vigente', () => {
  it('las fichas publicadas alinean etiqueta de precio y estado con sus tarjetas', () => {
    for (const service of services) {
      const card = serviceProducts.find((item) => item.slug === service.slug);
      expect(card, service.slug).toBeDefined();
      expect(card?.priceLabel).toBe(servicePriceLabel(service.commercial));
      expect(card?.priceStatus).toBe('provisional');
      expect(service.commercial.priceStatus).toBe('provisional');
      if (isFixedCommercial(service.commercial)) {
        expect(card?.priceEuros).toBe(service.commercial.priceEuros);
        expect(card?.priceLabel).toContain('+ IVA');
      } else {
        expect(card?.priceEuros).toBeUndefined();
        expect(card?.priceLabel).toBe('Precio por fase en la propuesta');
      }
    }
  });

  it('contacto y catálogo alinean importes de las ofertas de formulario', () => {
    const byId = Object.fromEntries(contact.bookings.offers.map((o) => [o.id, o]));
    expect(byId['informe-comercial']?.priceLabel).toBe(
      formatEuro(provisionalPrices.informeComercial)
    );
    expect(byId['cumplimiento-normativo']?.priceLabel).toBe(
      formatEuro(provisionalPrices.cumplimiento)
    );
    expect(byId['ciberseguridad']?.priceLabel).toBe(formatEuro(provisionalPrices.ciberseguridad));
    expect(contact.bookings.offers.every((o) => o.kind === 'form')).toBe(true);
  });

  it('el configurador usa la base provisional del portal sin inventar cancelación', () => {
    expect(portalBasePrice).toBe(provisionalPrices.portalInicio);
    const joined = JSON.stringify({
      services,
      contactBookings: contact.bookings,
      prices: provisionalPrices
    });
    expect(joined).not.toMatch(/cancelaci[oó]n/i);
  });
});

describe('COM-03 aprobación jurídica', () => {
  it.todo('BLOCKED: firma del mantenedor — no acreditable por test verde');
});
