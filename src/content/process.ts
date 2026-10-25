import { calEventUrl } from '../lib/calBooking';

export type ProcessStep = {
  id: string;
  title: string;
  duration: string;
  description: string;
  receive: string;
  payment?: string;
};

export type ProcessCta = { label: string; href: string };

const ORIGIN = 'origen=proceso';

export const processPage = {
  seo: {
    title: 'Metodología clara: de la idea al proyecto publicado — Alexendros',
    description:
      'Sabrás qué recibes, cuánto cuesta y cuándo, antes de pagar. Método de trabajo para webs y productos digitales.',
    ogTitle: 'Metodología clara desde el primer día'
  },
  hero: {
    h1Lead: 'Metodología clara:',
    h1Accent: 'desde el primer día',
    lead: 'Sabrás qué recibes, cuánto cuesta y cuándo, antes de pagar. Hablas conmigo de principio a fin.',
    primaryCta: {
      label: 'Pedir presupuesto',
      href: `/contacto?motivo=propuestaComercial&${ORIGIN}`
    } satisfies ProcessCta,
    secondaryCta: {
      label: 'Ver precios',
      href: `/servicios?${ORIGIN}`
    } satisfies ProcessCta
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
