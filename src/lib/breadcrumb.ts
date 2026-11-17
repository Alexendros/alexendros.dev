import { site } from '../content/site';

export type BreadcrumbCrumb = {
  /** Texto visible / schema name */
  name: string;
  /** Ruta absoluta del sitio con barra final (p. ej. `/servicios/`). */
  path: string;
};

/**
 * Nodo BreadcrumbList para el `@graph` de Layout.
 * La portada no usa migas; el resto de plantillas indexables sí.
 */
export function breadcrumbList(crumbs: readonly BreadcrumbCrumb[]): Record<string, unknown> {
  if (crumbs.length < 1) {
    throw new Error('breadcrumbList exige al menos un crumb');
  }
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => {
      if (!crumb.path.startsWith('/') || crumb.path.startsWith('//')) {
        throw new Error(`breadcrumb path inválido: ${crumb.path}`);
      }
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: new URL(crumb.path, site.url).href
      };
    })
  };
}

/** Atajo: Inicio + un segmento. */
export function breadcrumbFromHome(
  ...rest: Array<{ name: string; path: string }>
): Record<string, unknown> {
  return breadcrumbList([{ name: 'Inicio', path: '/' }, ...rest]);
}
