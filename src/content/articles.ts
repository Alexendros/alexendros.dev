export type Article = {
  slug: string;
  title: string;
  description: string;
  published: string;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: 'presupuesto-web',
    title: 'Qué debe incluir un presupuesto de web',
    description:
      'Alcance, plazos, pago, qué queda fuera y cómo se prueba la entrega. Una lista clara antes de firmar.',
    published: '2026-10-18',
    body: [
      'Un presupuesto útil indica qué se entrega, cuánto tarda y cuándo se paga. Si solo aparece un total, conviene pedir el desglose.',
      'Debe listar páginas o pantallas, formularios, idiomas y quién aporta los textos y las fotos. También el alojamiento y el dominio, si entran en el precio.',
      'El plazo va con unidad (días laborables) y los momentos de revisión de avances. El pago suele repartirse: una parte al empezar y otra al publicar.',
      'Incluye qué no entra: mantenimiento, campañas, posiciones en Google o cambios de alcance a mitad. Si algo aparece después, se valora antes de hacerlo.',
      'Antes de cerrar, se acuerda cómo se prueba la entrega. El cliente debe poder usar el resultado y recibir accesos e instrucciones.'
    ]
  },
  {
    slug: 'web-o-app-a-medida',
    title: 'Web o app a medida: cómo decidir',
    description:
      'Cuándo basta una web clara y cuándo hace falta un producto de software por fases.',
    published: '2026-10-18',
    body: [
      'Si el objetivo es captar consultas, una web o landing suele bastar. El sitio web profesional cubre ese caso con alcance y plazo definidos en la propuesta.',
      'Si el problema es un proceso interno (listados, pedidos, cálculos, agendas), una web de escaparate no lo resuelve. Ahí entra el software a medida.',
      'El software se plantea por fases: primero una versión pequeña y útil, luego mejoras. Cada fase lleva su precio y plazo en la propuesta.',
      'Una señal clara: si hoy el trabajo vive en hojas de cálculo, correos o herramientas que no encajan, conviene descubrir el proceso antes de construir.',
      'Ante la duda, conviene una revisión técnica o una conversación breve. Mejor acotar el problema que pagar una pieza grande sin saber si sirve.'
    ]
  }
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
