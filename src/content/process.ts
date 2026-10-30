export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  receive: string;
};

const ORIGIN = 'origen=proceso';

export const processPage = {
  seo: {
    title: 'Metodología clara — Alexendros',
    description:
      'Metodología clara. Desde la idea hasta el producto entregado. Método de trabajo para sitios web y productos digitales.',
    ogTitle: 'Metodología clara'
  },
  hero: {
    h1Lead: 'Metodología clara.',
    h1Accent: ' Desde la idea hasta el producto entregado.'
  },
  /** Pendiente (evt-metodo-steps-review): revisar copy de pasos con datos reales. */
  steps: [
    {
      id: 'hablamos',
      title: 'Conversación inicial',
      description: 'El cliente explica el objetivo, el alcance y el resultado que busca.',
      receive: 'Propuesta con alcance y plazo en un día laborable.'
    },
    {
      id: 'escrito',
      title: 'Acuerdo por escrito',
      description:
        'Queda definido qué incluye, qué no, el alcance económico y la fecha de entrega.',
      receive: 'un acuerdo por escrito.'
    },
    {
      id: 'construyo',
      title: 'Desarrollo y construcción',
      description:
        'Se muestran avances en 2–3 momentos. Si el alcance crece, se comunica el cambio antes de seguir.',
      receive: 'Versiones para revisar y comentar.'
    },
    {
      id: 'publico',
      title: 'Previsualización y entrega',
      description:
        'Se comprueba el funcionamiento con el cliente y se entrega la formación de uso.',
      receive: 'Producto acordado con instrucciones de uso y soporte para incidencias.'
    }
  ] satisfies ProcessStep[],
  close: {
    heading: 'Solicitar propuesta',
    body: 'La respuesta llega en un día laborable.',
    href: `/contacto?motivo=propuestaComercial&${ORIGIN}`
  }
} as const;
