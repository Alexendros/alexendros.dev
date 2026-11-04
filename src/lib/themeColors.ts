/** Propiedades Atlaps usadas para el `theme-color` del navegador. */
export const THEME_BG_LIGHT = '--ds-atlaps-paper-bone';
export const THEME_BG_DARK = '--ds-atlaps-blueprint-deep';

/** Resuelve el color desde la hoja ya aplicada; no duplica valores cromáticos. */
export function getThemeColor(property: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  if (!value) throw new Error(`No se pudo resolver el color de tema: ${property}`);
  return value;
}
