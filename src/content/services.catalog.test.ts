import { describe, expect, it } from 'vitest';
import {
  PUBLISHED_SERVICE_SLUGS,
  assertUniqueServiceSlugs,
  productCardSchema,
  serviceActionSchema,
  serviceCommercialSchema,
  serviceProducts,
  serviceSchema,
  services
} from './services';

const listFields = [
  'audience',
  'problems',
  'scope',
  'deliverables',
  'process',
  'technicalDetails'
] as const;

describe('CAT catálogo de servicios', () => {
  it('CAT-01: schema rechaza incompleto o solo espacios; válido pasa', () => {
    const base = structuredClone(services[0]);
    expect(serviceSchema.safeParse(base).success).toBe(true);
    expect(serviceSchema.safeParse({ ...base, title: '' }).success).toBe(false);
    expect(serviceSchema.safeParse({ ...base, title: '   ' }).success).toBe(false);
    expect(serviceSchema.safeParse({ ...base, audience: [] }).success).toBe(false);
    expect(serviceSchema.safeParse({ ...base, audience: ['  '] }).success).toBe(false);
    expect(
      serviceSchema.safeParse({
        ...base,
        commercial: { ...base.commercial, delivery: '' }
      }).success
    ).toBe(false);
  });

  it('CAT-02: dos productos con mismo slug fallan con mensaje identificable', () => {
    expect(() =>
      assertUniqueServiceSlugs([{ slug: 'informe-comercial' }, { slug: 'informe-comercial' }])
    ).toThrow(/slug duplicado/i);
  });

  it('CAT-03: audience es siempre string[] no vacío sin separadores implícitos', () => {
    for (const service of services) {
      expect(Array.isArray(service.audience)).toBe(true);
      expect(service.audience.length).toBeGreaterThan(0);
      for (const item of service.audience) {
        expect(item.includes('·')).toBe(false);
        expect(item.trim()).toBe(item);
        expect(item.length).toBeGreaterThan(0);
      }
    }
    const multi = serviceSchema.parse({
      ...services[0],
      audience: ['Negocios locales', 'Equipos de producto']
    });
    expect(multi.audience).toEqual(['Negocios locales', 'Equipos de producto']);
  });

  it('CAT-04: todas las tarjetas cumplen el esquema común', () => {
    for (const service of services) {
      const card = serviceProducts.find((product) => product.slug === service.slug);
      expect(card).toBeDefined();
      expect(productCardSchema.safeParse(card).success).toBe(true);
      expect(service.commercial.engagement).toBe('proposal');
    }
  });

  it('CAT-05: acciones admiten destinos permitidos y rechazan inválidos', () => {
    for (const action of [
      { kind: 'contact', label: 'Contactar', href: '/contacto', newTab: false },
      {
        kind: 'booking',
        label: 'Reservar',
        href: 'https://cal.com/alexendros/diagnostico',
        newTab: true
      },
      { kind: 'configure', label: 'Configurar', href: '/servicios', newTab: false }
    ]) {
      expect(serviceActionSchema.safeParse(action).success).toBe(true);
    }

    for (const action of [
      { kind: 'contact', label: 'X', href: 'javascript:alert(1)', newTab: false },
      { kind: 'booking', label: 'X', href: 'http://cal.com/x', newTab: true },
      { kind: 'contact', label: 'X', href: '//evil.example', newTab: false }
    ]) {
      expect(serviceActionSchema.safeParse(action).success).toBe(false);
    }
  });

  it('CAT-06: el modelo comercial no serializa importes ni condiciones de pago', () => {
    for (const service of services) {
      const commercial = serviceCommercialSchema.parse(service.commercial);
      expect(commercial.engagement).toBe('proposal');
      expect(commercial.timeline.trim().length).toBeGreaterThan(0);
      expect(commercial.delivery.trim().length).toBeGreaterThan(0);
      expect(commercial.guarantee.trim().length).toBeGreaterThan(0);
      expect(commercial.exclusions.length).toBeGreaterThan(0);
      expect(commercial).not.toHaveProperty('payment');
    }
  });

  it('CAT-07: listas completas sin truncamiento editorial oculto', () => {
    const long = {
      ...services[0],
      scope: Array.from({ length: 8 }, (_, index) => `Alcance ${index + 1}`),
      commercial: {
        ...services[0].commercial,
        exclusions: Array.from({ length: 5 }, (_, index) => `Exclusión ${index + 1}`)
      }
    };
    const parsed = serviceSchema.parse(long);
    expect(parsed.scope).toHaveLength(8);
    expect(parsed.commercial.exclusions).toHaveLength(5);
    for (const service of services) {
      for (const field of listFields) {
        expect(service[field].length).toBeGreaterThan(0);
      }
      expect(service.commercial.exclusions.length).toBeGreaterThan(0);
    }
  });

  it('CAT-08: tarjetas y fichas uno a uno según alcance aprobado', () => {
    expect(services.map((service) => service.slug)).toEqual([...PUBLISHED_SERVICE_SLUGS]);
    expect(serviceProducts).toHaveLength(PUBLISHED_SERVICE_SLUGS.length);
    expect(serviceProducts.map((product) => product.slug)).toEqual([...PUBLISHED_SERVICE_SLUGS]);
    expect(services.some((service) => service.slug === 'portal-inicio')).toBe(false);
    for (const service of services) {
      const card = serviceProducts.find((product) => product.slug === service.slug);
      expect(card?.href).toBe(`/servicios/${service.slug}`);
      expect(card?.title).toBe(service.title);
      expect(card?.short).toBe(service.short);
    }
  });
});
