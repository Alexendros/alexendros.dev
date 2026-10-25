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
    title: 'Metodología clara desde el primer día — Alexendros',
    description:
      'El cliente explica qué busca y recibe un proyecto adecuado a sus necesidades con un presupuesto a medida. Método de trabajo para webs y productos digitales.',
    ogTitle: 'Metodología clara desde el primer día'
  },
  hero: {
    h1Lead: 'Metodología clara',
    h1Accent: 'desde el primer día',
    lead: 'El cliente explica qué busca y recibe un proyecto adecuado a sus necesidades con un presupuesto a medida.'
  },
  processSection: {
    heading: 'De la idea al proyecto publicado'
  },
  steps: [
    {
      id: 'hablamos',
      title: 'Conversación inicial',
      duration: '30 min, sin coste',
      description: 'El cliente explica el objetivo, el alcance y el resultado que busca.',
      receive: 'Propuesta con precio y plazo en un día laborable.'
    },
    {
      id: 'escrito',
      title: 'Acuerdo por escrito',
      duration: '1–2 días',
      description: 'Queda definido qué incluye, qué no, el importe y la fecha de entrega.',
      receive: 'Un acuerdo claro.',
      payment: 'Web: 50 % al empezar; software por fase.'
    },
    {
      id: 'construyo',
      title: 'Construcción',
      duration: 'Desde 10 días laborables en una web sencilla',
      description:
        'Se muestran avances en 2–3 momentos. Si el alcance crece, se comunica el cambio de precio y plazo antes de seguir.',
      receive: 'Versiones para revisar y comentar.'
    },
    {
      id: 'publico',
      title: 'Prueba y publicación',
      duration: '2–3 días',
      description:
        'Se comprueba el funcionamiento con el cliente y se entrega la formación de uso.',
      receive: 'Proyecto online, instrucciones y accesos.',
      payment: 'Web: 50 % al publicar; software por fase.'
    }
  ] satisfies ProcessStep[],
  close: {
    heading: 'Solicitar una propuesta',
    body: 'La respuesta llega lo antes posible.',
    primaryCta: {
      label: 'Pedir presupuesto',
      href: `/contacto?motivo=propuestaComercial&${ORIGIN}`
    } satisfies ProcessCta
  }
} as const;
