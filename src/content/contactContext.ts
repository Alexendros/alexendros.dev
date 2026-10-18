import { PUBLISHED_SERVICE_SLUGS, services } from './services';

/** Slugs de obra referenciables desde /contacto (allowlist; sin importar assets). */
export const PUBLISHED_PROJECT_SLUGS = [
  'front-valencia',
  'graficas-nasve',
  'zedazo',
  'alexendros-me'
] as const;

/** Portal web: opción de contexto en el formulario; no es ficha `/servicios/[slug]`. */
export const CONTACT_EXTRA_SERVICE_OPTIONS = [{ slug: 'portal-web', title: 'Portal web' }] as const;

export type ContactServiceSlug =
  (typeof PUBLISHED_SERVICE_SLUGS)[number] | (typeof CONTACT_EXTRA_SERVICE_OPTIONS)[number]['slug'];
export type ContactProjectSlug = (typeof PUBLISHED_PROJECT_SLUGS)[number];

const SERVICE_SLUG_SET = new Set<string>([
  ...PUBLISHED_SERVICE_SLUGS,
  ...CONTACT_EXTRA_SERVICE_OPTIONS.map((o) => o.slug)
]);
const PROJECT_SLUG_SET = new Set<string>(PUBLISHED_PROJECT_SLUGS);

export const contactServiceOptions: ReadonlyArray<{ slug: ContactServiceSlug; title: string }> = [
  ...CONTACT_EXTRA_SERVICE_OPTIONS,
  ...PUBLISHED_SERVICE_SLUGS.map((slug) => {
    const title = services.find((s) => s.slug === slug)?.title ?? slug;
    return { slug, title };
  })
];

export const contactProjectOptions: ReadonlyArray<{ slug: ContactProjectSlug; title: string }> = [
  { slug: 'front-valencia', title: 'Front Valencia — Restaurante' },
  { slug: 'graficas-nasve', title: 'Gráficas Nasve — Tienda online' },
  { slug: 'zedazo', title: 'Zedazo — Herramienta de contactos' },
  { slug: 'alexendros-me', title: 'Alexendros.me — Web personal' }
];

/** Conserva un slug de servicio referenciable; descarta desconocidos y vacíos. */
export function normalizeServiceSlug(value: unknown): ContactServiceSlug | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || !SERVICE_SLUG_SET.has(trimmed)) return undefined;
  return trimmed as ContactServiceSlug;
}

/** Conserva un slug de proyecto publicado; descarta desconocidos y vacíos. */
export function normalizeProjectSlug(value: unknown): ContactProjectSlug | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || !PROJECT_SLUG_SET.has(trimmed)) return undefined;
  return trimmed as ContactProjectSlug;
}

export function serviceTitle(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  return contactServiceOptions.find((o) => o.slug === slug)?.title;
}

export function projectTitle(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  return contactProjectOptions.find((o) => o.slug === slug)?.title;
}
