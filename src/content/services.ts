import { z } from 'zod';

const nonEmptyTrimmed = z.string().trim().min(1);
const nonEmptyList = z.array(nonEmptyTrimmed).min(1);

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
  engagement: z.literal('proposal'),
  timeline: nonEmptyTrimmed,
  delivery: nonEmptyTrimmed,
  guarantee: nonEmptyTrimmed,
  exclusions: nonEmptyList
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
  href: z.string().min(1),
  ctaLabel: z.string().min(1)
});

export type ProductCard = z.infer<typeof productCardSchema>;

export const SERVICE_PRODUCT_CTA = 'Ver qué incluye →';

/** Slugs publicados como ficha `/servicios/[slug]` (decisión 0020; portal sin ficha). */
export const PUBLISHED_SERVICE_SLUGS = [
  'informe-comercial',
  'cumplimiento-normativo',
  'ciberseguridad',
  'software-a-medida'
] as const;

export const services: Service[] = [
  {
    slug: 'informe-comercial',
    kind: 'service',
    title: 'Posicionamiento comercial en buscadores',
    short:
      'Informe técnico SEO y plan de ajustes con métricas verificables para ganar visibilidad en buscadores.',
    description:
      'Revisión del sitio con foco en SEO técnico y señales de posicionamiento. El entregable es un informe con problemas medibles, un plan de ajustes priorizado y métricas de referencia para comprobar la mejora. No promete posiciones concretas ni implementa los cambios sin encargo aparte.',
    audience: [
      'Negocios y profesionales que quieren mejorar su visibilidad en buscadores con un plan accionable.'
    ],
    problems: [
      'La web no aparece o pierde posiciones en buscadores',
      'Falta criterio sobre qué corregir primero en SEO técnico',
      'Hacen falta métricas claras antes de invertir en mejoras'
    ],
    scope: [
      'SEO técnico: indexación, estructura, metadatos y señales on-page',
      'Rendimiento y uso en móvil ligados al posicionamiento',
      'Claridad del camino a contacto desde resultados de búsqueda',
      'Plan priorizado de ajustes con métricas de referencia',
      'Límites explícitos del análisis (sin garantía de ranking)'
    ],
    deliverables: [
      'Informe técnico con problemas, métricas de partida y límites del análisis',
      'Plan de ajustes y mejoras priorizado (sin implementación incluida)'
    ],
    process: [
      'Encargo y acceso al dominio',
      'Análisis SEO técnico y de señales comerciales',
      'Redacción del informe y del plan',
      'Entrega y ronda de aclaraciones'
    ],
    technicalDetails: [
      'Revisión de indexación, CWV orientados a SEO, metadatos, enlazado interno y contenido indexable.'
    ],
    commercial: {
      engagement: 'proposal',
      timeline: '5 días laborables',
      delivery:
        'Informe técnico SEO, métricas de partida y plan priorizado de ajustes (sin implementación)',
      guarantee: 'Una ronda de aclaraciones en 10 días naturales',
      exclusions: [
        'No incluye implementación de las mejoras',
        'No incluye campañas de publicidad ni link building',
        'No garantiza posiciones en buscadores'
      ]
    },
    action: {
      kind: 'contact',
      label: 'Pedir el informe',
      href: '/contacto?motivo=informacionCliente&servicio=informe-comercial',
      newTab: false
    }
  },
  {
    slug: 'cumplimiento-normativo',
    kind: 'service',
    title: 'Cumplimiento normativo',
    short:
      'Revisión de protección de datos, políticas de cookies y accesibilidad de la presencia web.',
    description:
      'Inspección orientada a protección de datos, políticas de cookies y accesibilidad del sitio. Cada problema lleva severidad y corrección recomendada. No incluye prueba de intrusión ni certificación oficial.',
    audience: [
      'Negocios que necesitan un informe accionable de datos, cookies y accesibilidad antes de endurecer su sitio.'
    ],
    problems: [
      'Dudas de protección de datos (RGPD) en la web',
      'Políticas de cookies poco claras o incompletas',
      'Accesibilidad insuficiente al navegar o al cumplir requisitos básicos'
    ],
    scope: [
      'Protección de datos en la superficie pública (RGPD y LSSI aplicables)',
      'Políticas de cookies y consentimiento',
      'Accesibilidad al navegarlo (revisión práctica, no certificación)',
      'Priorización por severidad'
    ],
    deliverables: [
      'Informe de protección de datos, cookies y accesibilidad',
      'Severidad y corrección recomendada por problema'
    ],
    process: ['Alcance del encargo', 'Análisis', 'Redacción del informe', 'Entrega'],
    technicalDetails: [
      'Revisión de avisos legales, cookies, formularios y barreras evidentes de accesibilidad.'
    ],
    commercial: {
      engagement: 'proposal',
      timeline: '10 días laborables',
      delivery:
        'Informe de protección de datos, cookies y accesibilidad; cada problema con severidad y corrección recomendada',
      guarantee: 'Corrección de desviaciones del alcance escrito en 15 días naturales',
      exclusions: [
        'No incluye certificación oficial ni auditoría legal completa',
        'No incluye prueba de intrusión ni análisis de vulnerabilidades técnicas',
        'No incluye implementación de remedios'
      ]
    },
    action: {
      kind: 'contact',
      label: 'Pedir la revisión',
      href: '/contacto?motivo=informacionCliente&servicio=cumplimiento-normativo',
      newTab: false
    }
  },
  {
    slug: 'ciberseguridad',
    kind: 'service',
    title: 'Ciberseguridad',
    short:
      'Revisión de vulnerabilidades básicas del sitio, con severidad y corrección recomendada por problema.',
    description:
      'Inspección de seguridad básica de la presencia web: cabeceras, secretos expuestos y superficies evidentes. Cada problema lleva severidad y corrección recomendada. No incluye prueba de intrusión ni certificación.',
    audience: [
      'Negocios que necesitan priorizar riesgos técnicos evidentes antes de endurecer el sitio.'
    ],
    problems: [
      'Superficie de seguridad sin priorizar',
      'Dudas sobre cabeceras, secretos o puntos de entrada evidentes',
      'Hace falta un informe técnico, no una prueba de intrusión'
    ],
    scope: [
      'Seguridad básica (cabeceras, secretos expuestos, superficies evidentes)',
      'Priorización por severidad',
      'Corrección recomendada por problema'
    ],
    deliverables: [
      'Informe de seguridad básica',
      'Severidad y corrección recomendada por problema'
    ],
    process: ['Alcance del encargo', 'Análisis', 'Redacción del informe', 'Entrega'],
    technicalDetails: [
      'Revisión proporcional OWASP ASVS L1, CSP y superficies públicas evidentes.'
    ],
    commercial: {
      engagement: 'proposal',
      timeline: '10 días laborables',
      delivery: 'Informe de seguridad básica; cada problema con severidad y corrección recomendada',
      guarantee: 'Corrección de desviaciones del alcance escrito en 15 días naturales',
      exclusions: [
        'No incluye prueba de intrusión',
        'No incluye certificación oficial',
        'No incluye implementación de remedios',
        'No incluye revisión legal de protección de datos ni cookies'
      ]
    },
    action: {
      kind: 'contact',
      label: 'Pedir la revisión',
      href: '/contacto?motivo=informacionCliente&servicio=ciberseguridad',
      newTab: false
    }
  },
  {
    slug: 'software-a-medida',
    kind: 'service',
    title: 'Colaboración en proyectos de software',
    short:
      'Integración en proyectos grandes con más compañeros: diseño y desarrollo por fases, con precio y plazo por escrito.',
    description:
      'Colaboración técnica en proyectos de software con equipo existente o ampliado. Se alinea al ritmo del proyecto, se entrega por fases y queda precio y plazo escritos antes de cada una. No es una web de escaparate ni un pack cerrado; es trabajo conjunto en un producto o herramienta mayor.',
    audience: [
      'Equipos que ya tienen un proyecto en marcha y necesitan refuerzo técnico fiable',
      'Negocios con un producto o herramienta grande donde hace falta construir por fases con más manos'
    ],
    problems: [
      'El proyecto es grande y hace falta alguien que entregue por fases con el equipo',
      'Las herramientas genéricas no encajan y el desarrollo se atasca',
      'Hace falta ampliar capacidad sin perder claridad de alcance y plazos'
    ],
    scope: [
      'Alineación con el equipo y el alcance de la fase',
      'Diseño y construcción de entregables acordados',
      'Mejoras por fases con precio y plazo escritos antes de cada una',
      'Entrega de código, documentación y accesos al terminar de pagar la fase'
    ],
    deliverables: [
      'Propuesta por fase con precio y plazo',
      'Entregable de la fase publicado o integrable según el acuerdo',
      'Código, documentación breve e instrucciones de uso',
      'Accesos al entorno acordado'
    ],
    process: [
      'Alineación con el equipo y propuesta de la primera fase',
      'Construcción del entregable de la fase',
      'Prueba conjunta y entrega',
      'Fases siguientes solo si las acordamos por escrito'
    ],
    technicalDetails: [
      'Stack según el problema y las convenciones del equipo (web, CLI u otra superficie acordada).',
      'Caso de referencia: Zedazo (herramienta de contactos de código abierto).'
    ],
    commercial: {
      engagement: 'proposal',
      timeline: 'Por fases; cada una con su plazo escrito',
      delivery: 'Código, documentación y accesos de la fase acordada',
      guarantee: 'Si algo no cumple lo acordado en esa fase, se corrige sin coste.',
      exclusions: [
        'No incluye mantenimiento continuo salvo acuerdo aparte',
        'No garantiza ventas ni adopción del producto'
      ]
    },
    action: {
      kind: 'contact',
      label: 'Pedir propuesta de colaboración',
      href: '/contacto?motivo=propuestaComercial&origen=servicios&servicio=software-a-medida',
      newTab: false
    }
  }
];

/** Alias del catálogo de fichas publicadas (mismo origen que `services`). */
export const products = services;

/** Fichas del índice: mismas claves, mismos CTA; datos desde el catálogo vivo. */
export const serviceProducts: ProductCard[] = services.map((service) => ({
  slug: service.slug,
  title: service.title,
  short: service.short,
  href: `/servicios/${service.slug}`,
  ctaLabel: SERVICE_PRODUCT_CTA
}));

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
  throw new Error('portal-inicio no debe publicarse como ficha de servicio (decisión 0019)');
}

serviceProducts.forEach((p, i) => {
  const r = productCardSchema.safeParse(p);
  if (!r.success) throw new Error(`ProductCard ${i} inválido: ${r.error.message}`);
});
