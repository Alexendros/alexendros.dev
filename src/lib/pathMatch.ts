/** Compara rutas sin depender de la barra final. */
export function normalizePathname(pathname: string): string {
  if (!pathname) return '/';
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

/** `path` es exactamente `base` o un descendiente (`base/...`). */
export function pathMatches(pathname: string, base: string): boolean {
  const path = normalizePathname(pathname);
  const root = normalizePathname(base);
  return path === root || path.startsWith(`${root}/`);
}
