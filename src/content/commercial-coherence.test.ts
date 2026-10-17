import { describe, expect, it } from 'vitest';
import { contact } from './contact';
import { formatEuro, portalBasePrice, provisionalPrices } from './pricing';
import { serviceProducts, services } from './services';

/**
 * COM-01: índice (tarjetas), fichas y configurador no se contradicen con el
 * copy/precios vigentes. No inventa fiscalidad ni cancelación.
 * COM-03 queda BLOCKED hasta firma del mantenedor (ver production-closeout).
 */
describe('COM-01 coherencia comercial vigente', () => {
  it('las tres fichas publicadas comparten importe y estado provisional con sus tarjetas', () => {
    for (const service of services) {
      const card = serviceProducts.find((item) => item.slug === service.slug);
      expect(card, service.slug).toBeDefined();
      expect(card?.priceEuros).toBe(service.commercial.priceEuros);
      expect(card?.priceStatus).toBe('provisional');
      expect(service.commercial.priceStatus).toBe('provisional');
      expect(formatEuro(card!.priceEuros)).toBe(formatEuro(service.commercial.priceEuros));
    }
  });

  it('contacto y catálogo alinean importes de informe y sesión; Cal.com se conserva', () => {
    const informe = contact.bookings.offers.find((o) => o.id === 'informe-comercial');
    const sesion = contact.bookings.offers.find((o) => o.id === 'sesion-profesional');
    expect(informe?.priceLabel).toBe(formatEuro(provisionalPrices.informeComercial));
    expect(sesion?.priceLabel).toBe(formatEuro(provisionalPrices.sesionProfesional));
    expect(sesion?.kind).toBe('cal');
    if (sesion?.kind === 'cal') {
      expect(sesion.url).toMatch(/^https:\/\/cal\.com\//);
    }
  });

  it('el configurador usa la base provisional del portal sin inventar condiciones', () => {
    expect(portalBasePrice).toBe(provisionalPrices.portalInicio);
    const joined = JSON.stringify({
      services,
      contactBookings: contact.bookings,
      prices: provisionalPrices
    });
    expect(joined).not.toMatch(/cancelaci[oó]n/i);
    expect(joined).not.toMatch(/\bfiscal\b/i);
    expect(joined).not.toMatch(/\bIVA\b/);
  });
});

describe('COM-03 aprobación jurídica', () => {
  it.todo('BLOCKED: firma del mantenedor — no acreditable por test verde');
});
