import { describe, expect, it } from 'vitest';
import { provisionalPrices } from './pricing';
import {
  PUBLISHED_SERVICE_SLUGS,
  assertUniqueServiceSlugs,
  productCardSchema,
  serviceActionSchema,
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
  'exclusions',
  'technicalDetails'
] as const;

/** Fixture comercial revisada: precios y condiciones vigentes (CAT-06). */
const commercialFixture = {
  'informe-comercial': {
    priceEuros: provisionalPrices.informeComercial,
    payment: 'Pago único antes de empezar',
    timeline: '5 días laborables',
    delivery: 'Dossier con hallazgos priorizados y recomendaciones',
    guarantee: 'Una ronda de aclaraciones en 10 días naturales',
    scope: [
      'Dominio web y presencia pública',
      'Claridad de mensaje y camino a contacto',
      'Velocidad y uso en móvil',
      'Priorización de hallazgos'
    ]
  },
  'sesion-profesional': {
    priceEuros: provisionalPrices.sesionProfesional,
    payment: 'Pago al reservar en Cal.com',
    timeline: '60 minutos',
    delivery: 'Siguientes pasos por escrito en 1 día laborable',
    guarantee: 'Resumen entregado en 1 día laborable tras la sesión',
    scope: ['Conversación de 60 minutos', 'Priorización del problema', 'Siguientes pasos escritos']
  },
  'auditoria-normativa-ciberseguridad': {
    priceEuros: provisionalPrices.auditoria,
    payment: '50 % al encargo y 50 % a la entrega, sin recargo',
    timeline: '10 días laborables',
    delivery:
      'Informe RGPD/LSSI y seguridad básica; cada hallazgo con severidad y corrección recomendada',
    guarantee: 'Corrección de desviaciones del alcance escrito en 15 días naturales',
    scope: [
      'RGPD y LSSI en la superficie pública',
      'Seguridad básica (cabeceras, secretos expuestos, superficies evidentes)',
      'Priorización por severidad'
    ]
  }
} as const;

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
        commercial: { ...base.commercial, payment: '' }
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

  it('CAT-04: tarjeta y condiciones derivan el mismo importe y estado', () => {
    for (const service of services) {
      const card = serviceProducts.find((p) => p.slug === service.slug);
      expect(card).toBeDefined();
      expect(card?.priceEuros).toBe(service.commercial.priceEuros);
      expect(card?.priceStatus).toBe(service.commercial.priceStatus);
      expect(card?.priceStatus).toBe('provisional');
      expect(productCardSchema.safeParse(card).success).toBe(true);
    }
  });

  it('CAT-05: acciones admiten destinos permitidos y rechazan inválidos', () => {
    expect(
      serviceActionSchema.safeParse({
        kind: 'contact',
        label: 'Contactar',
        href: '/contacto',
        newTab: false
      }).success
    ).toBe(true);
    expect(
      serviceActionSchema.safeParse({
        kind: 'booking',
        label: 'Reservar',
        href: 'https://cal.com/alexendros/sesion-tecnica',
        newTab: true
      }).success
    ).toBe(true);
    expect(
      serviceActionSchema.safeParse({
        kind: 'configure',
        label: 'Configurar',
        href: '/servicios',
        newTab: false
      }).success
    ).toBe(true);

    expect(
      serviceActionSchema.safeParse({
        kind: 'contact',
        label: 'X',
        href: 'javascript:alert(1)',
        newTab: false
      }).success
    ).toBe(false);
    expect(
      serviceActionSchema.safeParse({
        kind: 'booking',
        label: 'X',
        href: 'http://cal.com/x',
        newTab: true
      }).success
    ).toBe(false);
    expect(
      serviceActionSchema.safeParse({
        kind: 'contact',
        label: 'X',
        href: '//evil.example',
        newTab: false
      }).success
    ).toBe(false);
  });

  it('CAT-06: integridad comercial contra fixture revisada', () => {
    for (const service of services) {
      const expected = commercialFixture[service.slug as keyof typeof commercialFixture];
      expect(expected).toBeDefined();
      expect(service.commercial.priceEuros).toBe(expected.priceEuros);
      expect(service.commercial.payment).toBe(expected.payment);
      expect(service.commercial.timeline).toBe(expected.timeline);
      expect(service.commercial.delivery).toBe(expected.delivery);
      expect(service.commercial.guarantee).toBe(expected.guarantee);
      expect(service.scope).toEqual([...expected.scope]);
      expect(service.commercial.priceStatus).toBe('provisional');
    }
  });

  it('CAT-07: listas completas sin truncamiento editorial oculto', () => {
    const long = {
      ...services[0],
      scope: Array.from({ length: 8 }, (_, i) => `Alcance ${i + 1}`),
      exclusions: Array.from({ length: 5 }, (_, i) => `Exclusión ${i + 1}`)
    };
    const parsed = serviceSchema.parse(long);
    expect(parsed.scope).toHaveLength(8);
    expect(parsed.exclusions).toHaveLength(5);
    for (const service of services) {
      for (const field of listFields) {
        expect(service[field].length).toBeGreaterThan(0);
      }
    }
  });

  it('CAT-08: tarjetas y fichas uno a uno según alcance aprobado', () => {
    expect(services.map((s) => s.slug)).toEqual([...PUBLISHED_SERVICE_SLUGS]);
    expect(serviceProducts).toHaveLength(3);
    expect(serviceProducts.map((p) => p.slug)).toEqual([...PUBLISHED_SERVICE_SLUGS]);
    expect(services.some((s) => s.slug === 'portal-inicio')).toBe(false);
    for (const service of services) {
      const card = serviceProducts.find((p) => p.slug === service.slug);
      expect(card?.href).toBe(`/servicios/${service.slug}`);
      expect(card?.title).toBe(service.title);
      expect(card?.short).toBe(service.short);
    }
  });
});
