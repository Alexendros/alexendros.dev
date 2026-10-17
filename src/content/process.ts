export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  output: string;
};

export type QualityCriterion = {
  id: string;
  title: string;
  benefit: string;
  verification: string;
};

export type WorkingTerm = {
  id: string;
  title: string;
  description: string;
};

export type ProcessFaq = { question: string; answer: string };

export type ProcessCta = { label: string; href: string };

export const processPage = {
  seo: {
    title: 'Cómo trabajo: proceso y entrega — Alexendros',
    description:
      'Alcance y presupuesto por escrito, revisiones durante el trabajo y una entrega contrastada con lo acordado. Así trabajo en cada servicio.'
  },
  hero: {
    h1Lead: 'Un proceso claro.',
    h1Accent: 'Una entrega comprobable.',
    lead: 'Antes de empezar, sabes qué incluye el proyecto. Antes de cerrar, revisamos lo acordado. Trabajo contigo de forma directa, desde el primer encargo hasta la entrega.',
    primaryCta: { label: 'Cuéntame qué necesitas', href: '/contacto' } satisfies ProcessCta,
    secondaryCta: { label: 'Ver el proceso', href: '#proceso' } satisfies ProcessCta,
    summaryTitle: 'Qué queda por escrito',
    agreementPoints: [
      'Qué incluye y qué queda fuera.',
      'Presupuesto y forma de pago.',
      'Calendario y momentos de revisión.',
      'Entregables y condiciones de seguimiento.'
    ]
  },
  processSection: {
    heading: 'Del encargo a la entrega',
    intro:
      'Un recorrido común, adaptado al servicio. Desarrollar un producto, revisar una web y resolver una consulta tienen entregables distintos.'
  },
  steps: [
    {
      id: 'definir',
      title: 'Definimos el encargo',
      description: 'Revisamos qué necesitas y qué debe resolver el trabajo.',
      output: 'Alcance, presupuesto y plazos por escrito.'
    },
    {
      id: 'desarrollar-o-analizar',
      title: 'Desarrollo o analizo',
      description:
        'Ejecuto el servicio contratado. Las decisiones que cambian el alcance se acuerdan antes.',
      output: 'Avance revisable o hallazgos documentados.'
    },
    {
      id: 'revisar',
      title: 'Revisamos lo acordado',
      description: 'Compruebo los recorridos o hallazgos incluidos y te presento el resultado.',
      output: 'Revisión de entrega y pendientes identificados.'
    },
    {
      id: 'entregar',
      title: 'Entrego y dejamos el siguiente paso claro',
      description:
        'Recibes los entregables del servicio y las condiciones de cualquier seguimiento.',
      output: 'Trabajo entregado y continuidad definida.'
    }
  ] satisfies ProcessStep[],
  qualitySection: {
    heading: 'La calidad se concreta en comprobaciones',
    intro:
      'Los controles se definen según el servicio y el alcance. Si detecto límites o pendientes, deben quedar identificados, no escondidos tras una puntuación.'
  },
  criteria: [
    {
      id: 'claridad',
      title: 'Claridad y coherencia',
      benefit:
        'El contenido y la interfaz deben explicar la oferta y permitir encontrar el siguiente paso.',
      verification: 'Revisión de mensajes y recorridos incluidos.'
    },
    {
      id: 'funcionamiento',
      title: 'Funcionamiento y uso',
      benefit: 'Reviso las funciones incluidas, el uso en móvil y la navegación con teclado.',
      verification: 'Pruebas de los recorridos acordados y controles automáticos y manuales.'
    },
    {
      id: 'seguridad',
      title: 'Seguridad y privacidad proporcionales',
      benefit:
        'El alcance puede incluir controles sobre formularios, permisos, cabeceras y exposición de datos.',
      verification:
        'Controles aplicados y hallazgos pendientes, sin presentar la revisión básica como un pentest.'
    },
    {
      id: 'continuidad',
      title: 'Continuidad y mantenimiento',
      benefit:
        'La entrega identifica qué recibes y qué necesita mantenimiento o contratación adicional.',
      verification: 'Documentación y condiciones de seguimiento aplicables al servicio.'
    }
  ] satisfies QualityCriterion[],
  evidence: {
    heading: 'Trabajo que puedes consultar',
    body: 'Puedes revisar proyectos reales y su alcance publicado. Si hay un caso autorizado y documentado, se muestra con lo encargado, lo entregado y cómo se revisó.',
    linkLabel: 'Trabajo que puedes consultar',
    linkHref: '/proyectos'
  },
  termsSection: {
    heading: 'Lo que acordamos antes de empezar',
    intro: 'Condiciones claras para decidir con información y evitar expectativas distintas.'
  },
  terms: [
    {
      id: 'alcance',
      title: 'Alcance y presupuesto por escrito',
      description:
        'Antes de empezar se acuerdan entregables, exclusiones y calendario. Si aparece una necesidad nueva, revisamos su coste y plazo antes de incorporarla.'
    },
    {
      id: 'condiciones-servicio',
      title: 'Condiciones según el servicio',
      description:
        'El pago, las revisiones y los plazos de corrección se indican en la ficha y la propuesta. No todos los servicios incluyen lo mismo.'
    },
    {
      id: 'publicacion-seguimiento',
      title: 'Publicación y seguimiento definidos',
      description:
        'En proyectos de desarrollo se concreta quién gestiona dominio, alojamiento y accesos. El mantenimiento, su duración y sus límites deben figurar expresamente en la propuesta.'
    }
  ] satisfies WorkingTerm[],
  faqs: [
    {
      question: '¿Este proceso se aplica igual a todos los servicios?',
      answer:
        'El acuerdo y la revisión de entrega son comunes. En desarrollo recibes una implementación; en una inspección, un informe; en una sesión, un resumen de próximos pasos. Solo se implementan cambios cuando están incluidos.'
    },
    {
      question: '¿Qué pasa si necesito añadir algo?',
      answer:
        'El cambio se valora antes de ejecutarlo. Si modifica entregables, coste o plazo, se incorpora al acuerdo. No se considera incluido por aparecer durante el trabajo.'
    },
    {
      question: '¿Qué significa una entrega comprobable?',
      answer:
        'Que los entregables se contrastan con el alcance acordado y se identifican los pendientes. Si se utilizan métricas, se indica qué se midió, con qué herramienta y en qué condiciones.'
    },
    {
      question: '¿Incluye mantenimiento?',
      answer:
        'Solo cuando el servicio o la propuesta lo incluyan expresamente. Publicar una web, renovar un dominio, corregir incidencias y cambiar contenidos son tareas distintas.'
    },
    {
      question: '¿Garantizas ventas, cumplimiento o seguridad total?',
      answer:
        'No. El trabajo se compromete a un alcance y unos controles definidos. No se prometen ventas, posiciones en buscadores, ausencia absoluta de vulnerabilidades ni certificaciones no contratadas.'
    }
  ] satisfies ProcessFaq[],
  close: {
    heading: 'Empecemos por lo que necesitas resolver',
    body: 'Cuéntame qué tienes y qué quieres mejorar. Con esa información podemos concretar el servicio y su alcance.',
    cta: { label: 'Cuéntame qué necesitas', href: '/contacto' } satisfies ProcessCta
  }
} as const;
