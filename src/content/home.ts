/** Textos de portada y del selector de necesidades. */
import { commitments } from './commitments';

export const homeHero = {
  prompt: '~/alexendros $',
  command: 'nuevo-encargo',
  title: 'Auditoría, diseño y construcción de páginas web, tiendas y herramientas para negocios.',
  lead: 'Desde Valencia y en remoto. Cada encargo empieza con alcance, plazo y condiciones por escrito.',
  primaryCta: {
    label: 'Solicitar propuesta',
    href: '/contacto/?origen=home&motivo=propuestaComercial'
  },
  secondaryCta: { label: 'Ver servicios', href: '/servicios/' }
} as const;

export const homeVias = [
  {
    id: 'revisar',
    badge: 'Revisión',
    title: 'Revisar lo que ya existe',
    short:
      'Informe claro sobre la web actual, con los problemas ordenados por impacto y plan de mejoras.',
    tags: ['Posicionamiento en buscadores', 'Cumplimiento normativo', 'Ciberseguridad'],
    delivery: 'Entrega: informe por escrito',
    formLabel: 'Revisar lo que ya existe',
    formHint: 'Informe sobre la web actual'
  },
  {
    id: 'crear',
    badge: 'Construcción',
    title: 'Crear una web o una tienda',
    short:
      'Páginas profesionales y tiendas con catálogo y pagos, diseñadas para entenderse a la primera.',
    tags: ['Sitio web', 'Catálogo y pagos', 'Mensajería', 'Panel de contenidos'],
    delivery: 'Entrega: sitio publicado y documentado',
    formLabel: 'Crear una web o una tienda',
    formHint: 'Sitio nuevo, con catálogo y pagos si hace falta'
  },
  {
    id: 'colaborar',
    badge: 'Colaboración',
    title: 'Sumar un programador al equipo',
    short: 'Trabajo por fases en herramientas internas, automatismos o integraciones ya en marcha.',
    tags: ['Diseño y desarrollo', 'Por fases', 'Integración en equipos'],
    delivery: 'Entrega: código y documentación',
    formLabel: 'Sumar un programador al equipo',
    formHint: 'Colaboración por fases'
  }
] as const;

export const homeServiciosIntro = {
  eyebrow: '// 01',
  title: 'Tres maneras de empezar un encargo',
  lead: 'La situación actual decide por dónde empezar. El detalle de cada vía está en el catálogo de servicios.'
} as const;

export const homeReferenciasIntro = {
  eyebrow: '// 02',
  title: 'Proyectos realizados'
} as const;

export const homeFaq = [
  {
    q: '¿Cuándo llega la propuesta?',
    a: `En ${commitments.responseTime} desde la solicitud, con alcance, plazo y condiciones por escrito.`
  },
  {
    q: '¿Hace falta tener ya una web para empezar?',
    a: 'No. Para una web nueva bastan una idea y algunas referencias; para una revisión, el sitio actual.'
  },
  {
    q: '¿Qué ocurre tras enviar la solicitud?',
    a: `Llega una confirmación por correo y, en ${commitments.responseTime}, la propuesta con alcance, plazo y condiciones.`
  },
  {
    q: '¿Qué pasa si el alcance cambia a mitad del proyecto?',
    a: 'Cualquier cambio se acuerda por escrito antes de continuar, para que plazo y condiciones sigan siendo claros.'
  },
  {
    q: '¿Qué incluye la entrega?',
    a: 'El trabajo publicado, su documentación y una explicación de cómo mantenerlo.'
  }
] as const;

export const homeContactoIntro = {
  eyebrow: '// 04',
  title: 'Contacto',
  lead: 'Se indica por dónde empezar y qué necesita el proyecto. La propuesta llega por escrito.',
  badges: ['Valencia', 'Remoto', 'Propuesta por escrito']
} as const;
