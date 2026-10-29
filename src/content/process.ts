export type ProcessStep = {
  id: string;
  title: string;
  duration: string;
  description: string;
  receive: string;
};

const ORIGIN = 'origen=proceso';

export const processPage = {
  seo: {
    title: 'Metodología clara e integral — Alexendros',
    description:
      'Metodología clara e integral. Desde la idea hasta el producto entregado. Método de trabajo para webs y productos digitales.',
    ogTitle: 'Metodología clara e integral'
  },
  hero: {
    h1Lead: 'Metodología clara e integral.',
    h1Accent: ' Desde la idea hasta el producto entregado.'
  },
  /** Pendiente (evt-metodo-steps-review): revisar copy de pasos con datos reales. */
  steps: [
    {
      id: 'hablamos',
      title: 'Conversación inicial',
      duration: '30 min',
      description: 'El cliente explica el objetivo, el alcance y el resultado que busca.',
      receive: 'Propuesta con alcance y plazo en un día laborable.'
    },
    {
      id: 'escrito',
      title: 'Acuerdo por escrito',
      duration: '1–2 días',
      description: 'Queda definido qué incluye, qué no, el importe y la fecha de entrega.',
      receive: 'un acuerdo por escrito.'
    },
    {
      id: 'construyo',
      title: 'Desarrollo y construcción',
      duration: 'Orientativo: 10 días laborables en una web sencilla',
      description:
        'Se muestran avances en 2–3 momentos. Si el alcance crece, se comunica el cambio antes de seguir.',
      receive: 'Versiones para revisar y comentar.'
    },
    {
      id: 'publico',
      title: 'Previsualización y entrega',
      duration: '2–3 días',
      description:
        'Se comprueba el funcionamiento con el cliente y se entrega la formación de uso.',
      receive: 'Producto acordado con instrucciones de uso y soporte para incidencias.'
    }
  ] satisfies ProcessStep[],
  close: {
    heading: 'Solicitar presupuesto',
    body: 'La respuesta llega en un día laborable.',
    href: `/contacto?motivo=propuestaComercial&${ORIGIN}`
  }
} as const;
