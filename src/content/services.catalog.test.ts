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
    mode: 'fixed' as const,
    priceEuros: provisionalPrices.informeComercial,
    payment: 'Pago único antes de empezar',
    timeline: '5 días laborables',
    delivery:
      'Informe técnico SEO, métricas de partida y plan priorizado de ajustes (sin implementación)',
    guarantee: 'Una ronda de aclaraciones en 10 días naturales',
    scope: [
      'SEO técnico: indexación, estructura, metadatos y señales on-page',
      'Rendimiento y uso en móvil ligados al posicionamiento',
      'Claridad del camino a contacto desde resultados de búsqueda',
      'Plan priorizado de ajustes con métricas de referencia',
      'Límites explícitos del análisis (sin garantía de ranking)'
    ]
  },
  'cumplimiento-normativo': {
    mode: 'fixed' as const,
    priceEuros: provisionalPrices.cumplimiento,
    payment: '50 % al encargo y 50 % a la entrega, sin recargo',
    timeline: '10 días laborables',
    delivery:
      'Informe de protección de datos, cookies y accesibilidad; cada problema con severidad y corrección recomendada',
    guarantee: 'Corrección de desviaciones del alcance escrito en 15 días naturales',
    scope: [
      'Protección de datos en la superficie pública (RGPD y LSSI aplicables)',
      'Políticas de cookies y consentimiento',
      'Accesibilidad al navegarlo (revisión práctica, no certificación)',
      'Priorización por severidad'
    ]
  },
  ciberseguridad: {
    mode: 'fixed' as const,
    priceEuros: provisionalPrices.ciberseguridad,
    payment: '50 % al encargo y 50 % a la entrega, sin recargo',
    timeline: '10 días laborables',
    delivery: 'Informe de seguridad básica; cada problema con severidad y corrección recomendada',
    guarantee: 'Corrección de desviaciones del alcance escrito en 15 días naturales',
    scope: [
      'Seguridad básica (cabeceras, secretos expuestos, superficies evidentes)',
      'Priorización por severidad',
      'Corrección recomendada por problema'
    ]
  },
  'software-a-medida': {
    mode: 'quote' as const,
    priceLabel: 'Precio por fase en la propuesta',
    payment: 'Se acuerda por fase en la propuesta (suele ser 50 % al empezar y 50 % a la entrega)',
    timeline: 'Por fases; cada una con su plazo escrito',
    delivery: 'Código, documentación y accesos de la fase acordada',
    guarantee: 'Si algo no cumple lo acordado en esa fase, se corrige sin coste.',
    scope: [
      'Alineación con el equipo y el alcance de la fase',
      'Diseño y construcción de entregables acordados',
      'Mejoras por fases con precio y plazo escritos antes de cada una',
      'Entrega de código, documentación y accesos al terminar de pagar la fase'
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

  it('CAT-04: tarjeta y condiciones derivan la misma etiqueta y estado', () => {
    for (const service of services) {
      const card = serviceProducts.find((p) => p.slug === service.slug);
      expect(card).toBeDefined();
      expect(card?.priceStatus).toBe(service.commercial.priceStatus);
      expect(card?.priceStatus).toBe('provisional');
      expect(card?.priceLabel.trim().length).toBeGreaterThan(0);
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
        href: 'https://cal.com/alexendros/diagnostico',
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
      expect(service.commercial.mode).toBe(expected.mode);
      expect(service.commercial.payment).toBe(expected.payment);
      expect(service.commercial.timeline).toBe(expected.timeline);
      expect(service.commercial.delivery).toBe(expected.delivery);
      expect(service.commercial.guarantee).toBe(expected.guarantee);
      expect(service.scope).toEqual([...expected.scope]);
      expect(service.commercial.priceStatus).toBe('provisional');
      if (expected.mode === 'fixed' && service.commercial.mode === 'fixed') {
        expect(service.commercial.priceEuros).toBe(expected.priceEuros);
      }
      if (expected.mode === 'quote' && service.commercial.mode === 'quote') {
        expect(service.commercial.priceLabel).toBe(expected.priceLabel);
      }
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
    expect(serviceProducts).toHaveLength(PUBLISHED_SERVICE_SLUGS.length);
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
