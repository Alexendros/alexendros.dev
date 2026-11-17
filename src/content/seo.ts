import { z } from 'zod';

/** Bandas alineadas al script de auditoría web-compliance (title 50–65, meta 150–170). */
export const SEO_TITLE_MIN = 50;
export const SEO_TITLE_MAX = 65;
export const SEO_DESCRIPTION_MIN = 150;
export const SEO_DESCRIPTION_MAX = 170;

export const seoSnippetSchema = z.object({
  title: z.string().min(SEO_TITLE_MIN).max(SEO_TITLE_MAX),
  description: z.string().min(SEO_DESCRIPTION_MIN).max(SEO_DESCRIPTION_MAX)
});

export type SeoSnippet = z.infer<typeof seoSnippetSchema>;

/**
 * Snippets SEO de rutas indexables estáticas.
 * `/sobre-mi/` queda fuera a propósito (noindex, decisión 0029).
 */
export const seoByPath = {
  '/': {
    title: 'Alexendros — Tecnologías y servicios para negocios',
    description:
      'Auditoría, diseño y construcción de páginas web, tiendas y herramientas para negocios locales y equipos. Desde Valencia y en remoto, con alcance por escrito.'
  },
  '/servicios/': {
    title: 'Servicios profesionales de programación — Alexendros',
    description:
      'Colaboración técnica y sitio profesional por módulos. Cada encargo define alcance, plazo y condiciones en la propuesta, sin importes genéricos en el portal.'
  },
  '/referencias/': {
    title: 'Referencias y proyectos ya realizados — Alexendros',
    description:
      'Proyectos publicados con el alcance acordado en cada caso: problema, intervención y resultado. Portal de empresa, tienda, herramienta y sitio personal.'
  },
  '/metodologia/': {
    title: 'Cómo se trabaja: metodología paso a paso — Alexendros',
    description:
      'Metodología clara desde la idea hasta el producto entregado. Propuesta, acuerdo, desarrollo y entrega con alcance, plazo y condiciones fijados por escrito.'
  },
  '/contacto/': {
    title: 'Contacto para solicitar una propuesta comercial — Alexendros',
    description:
      'Solicitud de propuesta o información sobre un servicio profesional. La respuesta llega por correo electrónico con alcance, plazo y condiciones por escrito.'
  },
  '/experiencia/': {
    title: 'Experiencia y trayectoria profesional — Alexendros',
    description:
      'Alejandro Domingo Agustí: diseño y desarrollo web en Valencia para profesionales y pequeños negocios. Trato directo, alcance acordado por escrito y casos publicados.'
  },
  '/identidad/': {
    title: 'Identidad legal y datos del titular del sitio — Alexendros',
    description:
      'Titular de alexendros.dev, NIF, domicilio en Valencia y correo de contacto. Responsabilidad legal sobre la presentación de servicios profesionales en este portal.'
  },
  '/privacidad/': {
    title: 'Privacidad: tratamiento de datos personales — Alexendros',
    description:
      'Quién trata los datos del formulario, con qué finalidad, durante cuánto tiempo y qué derechos se pueden ejercer ante el responsable o ante la AEPD española.'
  },
  '/cookies/': {
    title: 'Cookies — qué se guarda, para qué y cómo se controlan',
    description:
      'Explicación clara de las cookies de este sitio: qué hace cada una, quién la emite, cuánto dura, si necesita permiso y cómo cambiar o retirar el consentimiento.'
  },
  '/accesibilidad/': {
    title: 'Declaración de accesibilidad del sitio web — Alexendros',
    description:
      'Estado de accesibilidad de alexendros.dev: alcance evaluado, método, resultados de la última comprobación, limitaciones conocidas y canal para reportar barreras.'
  }
} as const satisfies Record<string, SeoSnippet>;

export type SeoPath = keyof typeof seoByPath;

/** Titles y metas de fichas de servicio (slugs publicados). */
const serviceSeo: Record<string, SeoSnippet> = {
  'software-a-medida': {
    title: 'Colaboración en proyectos de programación — Alexendros',
    description:
      'Trabajo por fases con equipos que ya tienen un producto en marcha. Alcance y plazo quedan escritos antes de cada fase; no es un paquete cerrado ni una web de escaparate.'
  }
};

/** Titles y metas de fichas de referencia. */
const projectSeo: Record<string, SeoSnippet> = {
  'front-valencia': {
    title: 'Front Valencia: carta y reservas del restaurante — Alexendros',
    description:
      'Web para un restaurante en La Marina de Valencia: carta digital bilingüe con alérgenos y reservas directas, editable por el propio equipo sin tocar código.'
  },
  'graficas-nasve': {
    title: 'Gráficas Nasve: catálogo y venta en internet — Alexendros',
    description:
      'Tienda en internet para un taller familiar que vende sus productos sin depender de un intermediario, con catálogo, pedidos y precios claros para el cliente.'
  },
  zedazo: {
    title: 'Zedazo: herramienta de código abierto — Alexendros',
    description:
      'Herramienta de código abierto para limpiar y unificar listados de contactos, con reglas visibles y sin ceder los datos a un servicio cerrado de terceros.'
  },
  'alexendros-me': {
    title: 'Alexendros.me: web personal de lectura — Alexendros',
    description:
      'Web personal rápida y clara, centrada en publicar textos largos con buena lectura, contraste cuidado y sin elementos que distraigan del contenido principal.'
  }
};

/** Titles y metas de artículos. */
const articleSeo: Record<string, SeoSnippet> = {
  'presupuesto-web': {
    title: 'Qué debe incluir un presupuesto de web — Alexendros',
    description:
      'Alcance, plazos, pago, qué queda fuera y cómo se prueba la entrega. Una lista clara para revisar antes de firmar un presupuesto de página web o de producto digital.'
  },
  'web-o-app-a-medida': {
    title: 'Web o aplicación a medida: cómo decidir — Alexendros',
    description:
      'Cuándo basta una web clara para captar consultas y cuándo hace falta un producto de programación por fases, con alcance y plazo definidos en cada propuesta.'
  }
};

export function seoForPath(path: SeoPath): SeoSnippet {
  return seoByPath[path];
}

export function seoForService(slug: string): SeoSnippet {
  const snippet = serviceSeo[slug];
  if (!snippet) throw new Error(`Falta SEO para servicio ${slug}`);
  return snippet;
}

export function seoForProject(slug: string): SeoSnippet {
  const snippet = projectSeo[slug];
  if (!snippet) throw new Error(`Falta SEO para referencia ${slug}`);
  return snippet;
}

export function seoForArticle(slug: string): SeoSnippet {
  const snippet = articleSeo[slug];
  if (!snippet) throw new Error(`Falta SEO para artículo ${slug}`);
  return snippet;
}

/**
 * Todas las snippets indexables (estáticas + dinámicas) para el gate de longitud.
 * Itera solo mapas locales: no importar projects/services/articles aquí (sus .webp
 * rompen Playwright/Node al cargar process → seo desde e2e).
 */
export function allIndexableSeo(): Array<{ path: string; snippet: SeoSnippet }> {
  const out: Array<{ path: string; snippet: SeoSnippet }> = Object.entries(seoByPath).map(
    ([path, snippet]) => ({ path, snippet })
  );
  for (const slug of Object.keys(serviceSeo)) {
    out.push({ path: `/servicios/${slug}/`, snippet: seoForService(slug) });
  }
  for (const slug of Object.keys(projectSeo)) {
    out.push({ path: `/referencias/${slug}/`, snippet: seoForProject(slug) });
  }
  for (const slug of Object.keys(articleSeo)) {
    out.push({ path: `/articulos/${slug}/`, snippet: seoForArticle(slug) });
  }
  return out;
}
