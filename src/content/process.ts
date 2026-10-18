import { formatEuro, provisionalPrices } from './pricing';
import { calEventUrl } from '../lib/calBooking';

export type ProcessStep = {
  id: string;
  title: string;
  duration: string;
  description: string;
  receive: string;
  payment?: string;
};

export type ProcessFaq = { question: string; answer: string };

export type ProcessCta = { label: string; href: string };

export type ProcessPathCard = {
  id: string;
  title: string;
  body: string;
  priceLabel: string;
  href: string;
  linkLabel: string;
};

export type ProcessCase = {
  title: string;
  before: string;
  did: string;
  after: string;
  href: string;
  linkLabel: string;
};

const ORIGIN = 'origen=proceso';

export const processPage = {
  seo: {
    title: 'Cómo trabajo: de la idea a tu proyecto publicado — Alexendros',
    description:
      'Precio y plazo por escrito, avances que puedes ver y entrega probada contigo. Así trabajo en webs y software a medida.',
    ogTitle: 'Así trabajo: claro desde el primer día'
  },
  hero: {
    h1Lead: 'Así trabajamos:',
    h1Accent: 'claro desde el primer día',
    lead: 'Sabrás qué recibes, cuánto cuesta y cuándo, antes de pagar. Hablas conmigo de principio a fin.',
    primaryCta: {
      label: 'Pedir presupuesto',
      href: `/contacto?motivo=propuestaComercial&${ORIGIN}`
    } satisfies ProcessCta,
    secondaryCta: {
      label: 'Ver precios',
      href: `/servicios?${ORIGIN}`
    } satisfies ProcessCta,
    guarantees: [
      'Precio y plazo por escrito, antes de empezar.',
      'Ves avances y das tu opinión durante el trabajo.',
      'Lo probamos juntos antes de dar por terminado.'
    ]
  },
  processSection: {
    heading: 'De la idea a tu proyecto publicado',
    intro: 'Cuatro pasos: qué pasa, cuánto tarda, qué recibes y cuándo pagas.'
  },
  steps: [
    {
      id: 'hablamos',
      title: 'Hablamos',
      duration: '30 min, sin coste',
      description: 'Me cuentas qué necesitas y qué quieres conseguir.',
      receive: 'Propuesta con precio y plazo en 1 día laborable.'
    },
    {
      id: 'escrito',
      title: 'Lo dejamos por escrito',
      duration: '1–2 días',
      description: 'Qué incluye, qué no, cuánto cuesta y cuándo se entrega.',
      receive: 'Un acuerdo claro.',
      payment: 'Web: 50 % al empezar; software por fase.'
    },
    {
      id: 'construyo',
      title: 'Lo construyo',
      duration: 'Desde 10 días laborables en una web sencilla',
      description:
        'Te enseño avances en 2–3 momentos. Si añades algo, te digo el cambio de precio y plazo.',
      receive: 'Versiones para ver y comentar.'
    },
    {
      id: 'publico',
      title: 'Lo probamos y lo publico',
      duration: '2–3 días',
      description: 'Revisamos juntos que funciona. Te enseño a usarlo.',
      receive: 'Proyecto online, instrucciones y accesos.',
      payment: 'Web: 50 % al publicar; software por fase.'
    }
  ] satisfies ProcessStep[],
  alwaysIncludes: {
    heading: 'En toda web que construyo',
    items: [
      'Funciona en móvil',
      'Teclado y lector de pantalla',
      'Carga rápido',
      'Formulario de contacto',
      'Instrucciones de uso'
    ]
  },
  pathsSection: {
    heading: '¿Qué necesitas?',
    intro: 'Importes orientativos; el final va en la propuesta.'
  },
  paths: [
    {
      id: 'web',
      title: 'Una web o landing',
      body: 'Para que te encuentren y te escriban.',
      priceLabel: `Desde ${formatEuro(provisionalPrices.portalInicio)} + IVA`,
      href: `/servicios?${ORIGIN}#portal-heading`,
      linkLabel: 'Ver portal por módulos'
    },
    {
      id: 'software',
      title: 'Software a medida',
      body: 'Una herramienta por fases, empezando por una versión pequeña.',
      priceLabel: 'Precio por fase en la propuesta',
      href: `/servicios/software-a-medida?${ORIGIN}`,
      linkLabel: 'Ver cómo se plantea'
    },
    {
      id: 'revision',
      title: 'Revisar tu web',
      body: 'Te digo qué falla y por dónde empezar.',
      priceLabel: `Desde ${formatEuro(provisionalPrices.informeComercial)} + IVA`,
      href: `/servicios/informe-comercial?${ORIGIN}`,
      linkLabel: 'Ver Informe 360º'
    }
  ] satisfies ProcessPathCard[],
  featuredCase: {
    title: 'Zedazo — Herramienta de contactos',
    before: 'Tenía agendas con duplicados y formatos rotos.',
    did: 'Hice una herramienta que limpia y exporta contactos.',
    after: 'Ahora puedes migrar agendas sin el trabajo manual de siempre.',
    href: '/proyectos/zedazo',
    linkLabel: 'Ver el caso'
  } satisfies ProcessCase,
  faqsSection: {
    heading: 'Dudas rápidas'
  },
  faqs: [
    {
      question: '¿Cuánto tarda?',
      answer: 'Web sencilla: desde 10 días laborables. Software: por fases con plazo cada una.'
    },
    {
      question: '¿Y si quiero cambiar algo a mitad?',
      answer: 'Dímelo. Te cuento coste y retraso, y tú decides.'
    },
    {
      question: '¿Incluye mantenimiento?',
      answer: 'Solo si lo acordamos. Publicar, dominio e incidencias son cosas distintas.'
    },
    {
      question: '¿Quién es el dueño del resultado?',
      answer: 'Tú. Recibes código, contenidos y accesos al terminar de pagar.'
    }
  ] satisfies ProcessFaq[],
  limits: {
    heading: 'Límites',
    body: 'No prometo ventas ni posiciones en Google. Una revisión básica no es una auditoría completa. Una certificación se ve aparte.'
  },
  close: {
    heading: 'Cuéntame qué necesitas',
    body: 'Te respondo en 1 día laborable.',
    primaryCta: {
      label: 'Pedir presupuesto',
      href: `/contacto?motivo=propuestaComercial&${ORIGIN}`
    } satisfies ProcessCta,
    secondaryCta: {
      label: 'Reservar una llamada',
      href: calEventUrl('alexendros/diagnostico')
    } satisfies ProcessCta
  }
} as const;
