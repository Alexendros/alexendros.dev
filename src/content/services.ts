import { z } from 'zod';
import { modulePrices, portalBasePrice, provisionalPrices } from './pricing';

const nonEmptyTrimmed = z.string().trim().min(1);
const nonEmptyList = z.array(nonEmptyTrimmed).min(1);

export const catalogEntrySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['service', 'portal', 'module']),
  title: z.string().min(1),
  priceEuros: z.number().positive(),
  payment: z.string().min(1),
  timeline: z.string().min(1),
  delivery: z.string().min(1),
  guarantee: z.string().min(1)
});

export type CatalogEntry = z.infer<typeof catalogEntrySchema>;

export const serviceActionSchema = z
  .object({
    kind: z.enum(['contact', 'booking', 'configure']),
    label: nonEmptyTrimmed,
    href: nonEmptyTrimmed,
    newTab: z.boolean()
  })
  .superRefine((action, ctx) => {
    if (action.kind === 'contact' || action.kind === 'configure') {
      if (!action.href.startsWith('/') || action.href.startsWith('//')) {
        ctx.addIssue({
          code: 'custom',
          message: `action.href interno inválido para kind=${action.kind}: ${action.href}`,
          path: ['href']
        });
      }
      if (action.newTab) {
        ctx.addIssue({
          code: 'custom',
          message: `action.newTab debe ser false para kind=${action.kind}`,
          path: ['newTab']
        });
      }
      return;
    }
    try {
      const url = new URL(action.href);
      if (url.protocol !== 'https:') {
        ctx.addIssue({
          code: 'custom',
          message: `action.href de booking debe ser https: ${action.href}`,
          path: ['href']
        });
      }
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: `action.href de booking no es URL válida: ${action.href}`,
        path: ['href']
      });
    }
    if (!action.newTab) {
      ctx.addIssue({
        code: 'custom',
        message: 'action.newTab debe ser true para kind=booking',
        path: ['newTab']
      });
    }
  });

export type ServiceAction = z.infer<typeof serviceActionSchema>;

export const serviceCommercialSchema = z.object({
  priceEuros: z.number().positive(),
  priceStatus: z.enum(['provisional', 'confirmed']),
  payment: nonEmptyTrimmed,
  timeline: nonEmptyTrimmed,
  delivery: nonEmptyTrimmed,
  guarantee: nonEmptyTrimmed
});

export type ServiceCommercial = z.infer<typeof serviceCommercialSchema>;

export const serviceSchema = z.object({
  slug: nonEmptyTrimmed,
  kind: z.literal('service'),
  title: nonEmptyTrimmed,
  short: nonEmptyTrimmed,
  description: nonEmptyTrimmed,
  audience: nonEmptyList,
  problems: nonEmptyList,
  scope: nonEmptyList,
  deliverables: nonEmptyList,
  process: nonEmptyList,
  exclusions: nonEmptyList,
  technicalDetails: nonEmptyList,
  commercial: serviceCommercialSchema,
  action: serviceActionSchema
});

export type Service = z.infer<typeof serviceSchema>;

/**
 * Objeto homogéneo de ficha en el índice `/servicios`.
 * Una sola forma para rellenar cada tarjeta; el detalle fino de cada producto
 * se define después en la ficha `/servicios/[slug]`.
 */
export const productCardSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
  priceEuros: z.number().positive(),
  priceStatus: z.enum(['provisional', 'confirmed']),
  href: z.string().min(1),
  ctaLabel: z.string().min(1)
});

export type ProductCard = z.infer<typeof productCardSchema>;

export const SERVICE_PRODUCT_CTA = 'Ver qué incluye →';

export const portalModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
  priceEuros: z.number().positive(),
  payment: z.string().min(1),
  timeline: z.string().min(1),
  delivery: z.string().min(1),
  guarantee: z.string().min(1),
  additive: z.boolean()
});

export type PortalModule = z.infer<typeof portalModuleSchema>;

/** Slugs publicados como ficha `/servicios/[slug]` (excepción D-01 / decisión 0017). */
export const PUBLISHED_SERVICE_SLUGS = [
  'informe-comercial',
  'sesion-profesional',
  'auditoria-normativa-ciberseguridad'
] as const;

export const services: Service[] = [
  {
    slug: 'informe-comercial',
    kind: 'service',
    title: 'Informe 360º',
    short:
      'Reviso tu web y te entrego los problemas detectados, sus límites y un plan priorizado de mejoras.',
    description:
      'Reviso tu website actual: SEO técnico básico, velocidad de carga, accesibilidad al navegarlo y claridad del camino a contacto. Te entrego un dossier con hallazgos, límites del análisis y un plan priorizado de mejoras. No promete posiciones en buscadores ni resolver cada problema sin encargo aparte.',
    audience: ['Negocios y profesionales que necesitan saber por dónde empezar antes de invertir.'],
    problems: [
      'La web no trae contactos',
      'No sabes qué corregir primero',
      'Has recibido propuestas difíciles de priorizar'
    ],
    scope: [
      'SEO técnico básico y señales de posicionamiento',
      'Velocidad de carga y uso en móvil',
      'Accesibilidad al navegarlo',
      'Claridad de mensaje y camino a contacto',
      'Priorización de hallazgos con límites explícitos'
    ],
    deliverables: [
      'Dossier con hallazgos, necesidades y límites del análisis',
      'Plan priorizado de mejoras (sin implementación incluida)'
    ],
    process: [
      'Encargo y acceso al dominio',
      'Inspección 360º',
      'Redacción del dossier y del plan',
      'Entrega y ronda de aclaraciones'
    ],
    technicalDetails: ['Análisis CWV, SEO técnico básico, revisión de contenidos y accesibilidad.'],
    exclusions: [
      'No incluye implementación de las mejoras',
      'No incluye pentest ni certificación oficial',
      'No garantiza posiciones en buscadores'
    ],
    commercial: {
      priceEuros: provisionalPrices.informeComercial,
      priceStatus: 'provisional',
      payment: 'Pago único antes de empezar',
      timeline: '5 días laborables',
      delivery:
        'Dossier con hallazgos, límites del análisis y plan priorizado de mejoras (sin implementación)',
      guarantee: 'Una ronda de aclaraciones en 10 días naturales'
    },
    action: {
      kind: 'contact',
      label: 'Pedir el informe',
      href: '/contacto?motivo=informacionCliente&servicio=informe-comercial',
      newTab: false
    }
  },
  {
    slug: 'sesion-profesional',
    kind: 'service',
    title: 'Sesión profesional',
    short:
      'Una sesión de 60 minutos para revisar un problema concreto de tu web y decidir los siguientes pasos.',
    description:
      'Sesión de 60 minutos orientada a un problema concreto de tu página actual. Orienta y entrega un resumen escrito; no incluye implementación salvo acuerdo aparte. 50 % de descuento si la sesión aplica el plan de una de mis inspecciones (Informe 360º o inspección de vulnerabilidades).',
    audience: ['Quien necesita desbloquear una decisión técnica o de producto con plazo corto.'],
    problems: [
      'Hay un bloqueo concreto',
      'Necesitas decidir el siguiente paso',
      'No quieres un proyecto completo todavía'
    ],
    scope: [
      'Conversación de 60 minutos',
      'Revisión orientada de un problema concreto',
      'Resumen de siguientes pasos por escrito'
    ],
    deliverables: ['Resumen de siguientes pasos por escrito (sin implementación incluida)'],
    process: ['Reserva en Cal.com', 'Sesión de 60 minutos', 'Entrega del resumen'],
    technicalDetails: ['Cal.com para reserva y pago del importe provisional publicado.'],
    exclusions: [
      'No incluye implementación',
      'No incluye auditoría completa',
      'La implementación solo entra con acuerdo aparte'
    ],
    commercial: {
      priceEuros: provisionalPrices.sesionProfesional,
      priceStatus: 'provisional',
      payment:
        'Pago al reservar en Cal.com (importe provisional). 50 % de descuento si aplicas el plan de una inspección (360º o vulnerabilidades)',
      timeline: '60 minutos',
      delivery: 'Siguientes pasos por escrito en 1 día laborable',
      guarantee: 'Resumen entregado en 1 día laborable tras la sesión'
    },
    action: {
      kind: 'booking',
      label: 'Reservar sesión',
      href: 'https://cal.com/alexendros/sesion-tecnica',
      newTab: true
    }
  },
  {
    slug: 'auditoria-normativa-ciberseguridad',
    kind: 'service',
    title: 'Inspección de cumplimiento normativo y vulnerabilidades',
    short:
      'Inspección de RGPD/LSSI y vulnerabilidades básicas, con severidad y corrección recomendada por hallazgo.',
    description:
      'Inspección de cumplimiento normativo y de vulnerabilidades de tu presencia web. Cada hallazgo lleva severidad y corrección recomendada. No incluye pentest ni certificación.',
    audience: ['Negocios que necesitan un informe accionable antes de endurecer su sitio.'],
    problems: [
      'Dudas de cumplimiento RGPD/LSSI',
      'Superficie de seguridad sin priorizar',
      'Necesitas un informe, no un pentest'
    ],
    scope: [
      'RGPD y LSSI en la superficie pública',
      'Seguridad básica (cabeceras, secretos expuestos, superficies evidentes)',
      'Priorización por severidad'
    ],
    deliverables: [
      'Informe con hallazgos de normativa y seguridad básica',
      'Severidad y corrección por hallazgo'
    ],
    process: ['Alcance del encargo', 'Análisis', 'Redacción del informe', 'Entrega'],
    technicalDetails: ['Revisión proporcional OWASP ASVS L1, CSP, cookies y formularios.'],
    exclusions: [
      'No incluye pentest',
      'No incluye certificación oficial',
      'No incluye implementación de remedios'
    ],
    commercial: {
      priceEuros: provisionalPrices.auditoria,
      priceStatus: 'provisional',
      payment: '50 % al encargo y 50 % a la entrega, sin recargo',
      timeline: '10 días laborables',
      delivery:
        'Informe RGPD/LSSI y seguridad básica; cada hallazgo con severidad y corrección recomendada',
      guarantee: 'Corrección de desviaciones del alcance escrito en 15 días naturales'
    },
    action: {
      kind: 'contact',
      label: 'Pedir la inspección',
      href: '/contacto?motivo=informacionCliente&servicio=auditoria-normativa-ciberseguridad',
      newTab: false
    }
  }
];

/** Alias del catálogo de fichas publicadas (mismo origen que `services`). */
export const products = services;

export const portalBase: PortalModule = {
  id: 'portal-inicio',
  title: 'Portal de inicio',
  short:
    'Base: landing, página de gracias, formulario y publicación. Pago fraccionado, plazo desde encargo, sin CMS ni terceros fuera del alcance escrito.',
  priceEuros: portalBasePrice,
  payment: '50 % al encargo y 50 % al publicar, sin recargo',
  timeline: '10 días laborables desde el encargo acordado',
  delivery: 'Landing, página de gracias, formulario y publicación',
  guarantee:
    '30 días naturales para corregir desviaciones del alcance escrito. Objetivos técnicos en rutas y entorno acordados: LCP ≤ 2,5 s (Lighthouse), axe 0 en esas rutas (no es conformidad WCAG completa) y contraste AA del tema. Mantenimiento y revisiones extra fuera de garantía se acuerdan aparte.',
  additive: false
};

export const portalModules: PortalModule[] = [
  {
    id: 'tienda',
    title: 'Catálogo y tienda online',
    short: 'Catálogo y pasarela de pagos.',
    priceEuros: modulePrices.tienda,
    payment: 'Incluido en el pago fraccionado del portal',
    timeline: '+15 días laborables',
    delivery: 'Catálogo y pasarela de pagos operativa',
    guarantee: 'Misma garantía del portal sobre el alcance de este módulo',
    additive: true
  },
  {
    id: 'mensajeria',
    title: 'Canal de mensajería',
    short: 'Canalización de clientes a través de aplicaciones de mensajería.',
    priceEuros: modulePrices.mensajeria,
    payment: 'Incluido en el pago fraccionado del portal',
    timeline: '+5 días laborables',
    delivery: 'Canal de mensajería conectado al portal',
    guarantee: 'Misma garantía del portal sobre el alcance de este módulo',
    additive: true
  },
  {
    id: 'usuarios',
    title: 'Registro de usuarios y gestión de clientes',
    short: 'Registro de usuarios y gestión interna de clientes.',
    priceEuros: modulePrices.usuarios,
    payment: 'Incluido en el pago fraccionado del portal',
    timeline: '+10 días laborables',
    delivery: 'Registro y panel interno de clientes',
    guarantee: 'Misma garantía del portal sobre el alcance de este módulo',
    additive: true
  },
  {
    id: 'contenidos',
    title: 'Panel de contenidos',
    short: 'Un panel para publicar y actualizar contenidos sin modificar el código.',
    priceEuros: modulePrices.contenidos,
    payment: 'Incluido en el pago fraccionado del portal',
    timeline: '+5 días laborables',
    delivery: 'Panel de contenidos y publicaciones',
    guarantee: 'Misma garantía del portal sobre el alcance de este módulo',
    additive: true
  }
];

/** Fichas del índice: mismas claves, mismos CTA; datos desde el catálogo vivo. */
export const serviceProducts: ProductCard[] = services.map((s) => ({
  slug: s.slug,
  title: s.title,
  short: s.short,
  priceEuros: s.commercial.priceEuros,
  priceStatus: s.commercial.priceStatus,
  href: `/servicios/${s.slug}`,
  ctaLabel: SERVICE_PRODUCT_CTA
}));

export const catalogEntries: CatalogEntry[] = [
  ...services.map((s) => ({
    id: s.slug,
    kind: 'service' as const,
    title: s.title,
    priceEuros: s.commercial.priceEuros,
    payment: s.commercial.payment,
    timeline: s.commercial.timeline,
    delivery: s.commercial.delivery,
    guarantee: s.commercial.guarantee
  })),
  {
    id: portalBase.id,
    kind: 'portal',
    title: portalBase.title,
    priceEuros: portalBase.priceEuros,
    payment: portalBase.payment,
    timeline: portalBase.timeline,
    delivery: portalBase.delivery,
    guarantee: portalBase.guarantee
  },
  ...portalModules.map((m) => ({
    id: m.id,
    kind: 'module' as const,
    title: m.title,
    priceEuros: m.priceEuros,
    payment: m.payment,
    timeline: m.timeline,
    delivery: m.delivery,
    guarantee: m.guarantee
  }))
];

export function assertUniqueServiceSlugs(items: readonly { slug: string }[]): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.slug)) {
      throw new Error(`Service slug duplicado: ${item.slug}`);
    }
    seen.add(item.slug);
  }
}

const slugs = new Set<string>();
services.forEach((s, i) => {
  const r = serviceSchema.safeParse(s);
  if (!r.success) throw new Error(`Service ${i} inválido: ${r.error.message}`);
  if (slugs.has(s.slug)) throw new Error(`Service slug duplicado: ${s.slug}`);
  slugs.add(s.slug);
});

if (services.length !== PUBLISHED_SERVICE_SLUGS.length) {
  throw new Error(
    `Catálogo de fichas: se esperaban ${PUBLISHED_SERVICE_SLUGS.length} servicios, hay ${services.length}`
  );
}
for (const slug of PUBLISHED_SERVICE_SLUGS) {
  if (!slugs.has(slug)) {
    throw new Error(`Falta servicio publicado: ${slug}`);
  }
}
if (slugs.has('portal-inicio')) {
  throw new Error('portal-inicio no debe publicarse como ficha de servicio (decisión 0017)');
}

serviceProducts.forEach((p, i) => {
  const r = productCardSchema.safeParse(p);
  if (!r.success) throw new Error(`ProductCard ${i} inválido: ${r.error.message}`);
});

catalogEntries.forEach((e, i) => {
  const r = catalogEntrySchema.safeParse(e);
  if (!r.success) throw new Error(`CatalogEntry ${i} inválido: ${r.error.message}`);
});

portalModules.forEach((m, i) => {
  const r = portalModuleSchema.safeParse(m);
  if (!r.success) throw new Error(`PortalModule ${i} inválido: ${r.error.message}`);
});
