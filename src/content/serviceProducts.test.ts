import { describe, expect, it } from 'vitest';
import { productCardSchema, SERVICE_PRODUCT_CTA, serviceProducts, services } from './services';

describe('fichas homogéneas de servicios', () => {
  it('hay una ficha por servicio del catálogo', () => {
    expect(serviceProducts).toHaveLength(services.length);
  });

  it('todas las fichas cumplen el mismo esquema y el mismo CTA', () => {
    for (const product of serviceProducts) {
      expect(productCardSchema.safeParse(product).success).toBe(true);
      expect(product.ctaLabel).toBe(SERVICE_PRODUCT_CTA);
      expect(product.href).toBe(`/servicios/${product.slug}`);
      expect(product.short.trim().length).toBeGreaterThan(0);
      expect(product.priceEuros).toBeGreaterThan(0);
      expect(product.priceStatus).toBe('provisional');
    }
  });

  it('los campos de ficha coinciden con el servicio fuente', () => {
    for (const service of services) {
      const card = serviceProducts.find((p) => p.slug === service.slug);
      expect(card).toBeDefined();
      expect(card?.title).toBe(service.title);
      expect(card?.short).toBe(service.short);
      expect(card?.priceEuros).toBe(service.commercial.priceEuros);
      expect(card?.priceStatus).toBe(service.commercial.priceStatus);
    }
  });
});
