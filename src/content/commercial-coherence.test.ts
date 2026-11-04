import { describe, expect, it } from 'vitest';
import { contact } from './contact';
import { portalBase, portalModules } from './portalModules';
import { serviceProducts, services } from './services';

describe('coherencia comercial vigente', () => {
  it('tarjetas y fichas comparten título, resumen y destino', () => {
    for (const service of services) {
      const card = serviceProducts.find((item) => item.slug === service.slug);
      expect(card, service.slug).toBeDefined();
      expect(card?.title).toBe(service.title);
      expect(card?.short).toBe(service.short);
      expect(card?.href).toBe(`/servicios/${service.slug}/`);
      expect(service.commercial.engagement).toBe('proposal');
    }
  });

  it('no quedan ofertas de formulario para las fichas retiradas', () => {
    expect(contact.bookings.offers).toEqual([]);
  });

  it('base y módulos no incorporan campos económicos', () => {
    for (const entry of [portalBase, ...portalModules]) {
      expect(entry).not.toHaveProperty('payment');
      expect(entry.scope.trim().length).toBeGreaterThan(0);
    }
  });
});
