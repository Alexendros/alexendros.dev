/** Fuente única de los compromisos comerciales visibles. */
export const commitments = {
  responseTime: 'un día laborable',
  revisionCount: '2–3',
  items: [
    {
      id: 'alcance',
      title: 'Alcance',
      detail: 'Qué entra y qué queda fuera: por escrito, antes del primer día.'
    },
    {
      id: 'plazo',
      title: 'Plazo',
      detail: 'Calendario con revisiones a la vista; sin plazos inventados.'
    },
    {
      id: 'condiciones',
      title: 'Condiciones',
      detail: 'Condiciones legibles desde el primer correo; nada escondido al final.'
    }
  ]
} as const;
