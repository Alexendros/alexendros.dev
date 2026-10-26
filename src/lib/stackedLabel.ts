/** Parte una etiqueta en dos líneas: primera palabra / resto (para cabecera y CTA). */
export function splitTwoLineLabel(label: string): { primary: string; secondary: string | null } {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { primary: '', secondary: null };
  const [primary, ...rest] = parts;
  return { primary, secondary: rest.length ? rest.join(' ') : null };
}
