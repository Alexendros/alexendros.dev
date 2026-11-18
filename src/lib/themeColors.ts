/** Fondos de la paleta, leídos del CSS para el `theme-color` del navegador. */
export const THEME_BG_LIGHT = '--bg-day';
export const THEME_BG_DARK = '--bg-night';

/** Resuelve el color desde la hoja ya aplicada; no duplica valores cromáticos. */
export function getThemeColor(property: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  // Si el CSS aún no aplicó (carrera con hojas externas), no tumbar el boot
  // de cabecera: devolver vacío y dejar que applyThemeColor omita el meta.
  return value;
}
