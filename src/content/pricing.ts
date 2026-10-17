/** Importes provisionales. Un solo sitio para sustituirlos cuando se fijen. */
export const provisionalPrices = {
  informeComercial: 650,
  sesionProfesional: 150,
  auditoria: 1500,
  portalInicio: 990,
  tienda: 1400,
  mensajeria: 400,
  usuarios: 700,
  contenidos: 410
} as const;

export const portalBasePrice = provisionalPrices.portalInicio;

export const modulePrices = {
  tienda: provisionalPrices.tienda,
  mensajeria: provisionalPrices.mensajeria,
  usuarios: provisionalPrices.usuarios,
  contenidos: provisionalPrices.contenidos
} as const;

/** Orden canónico de módulos del portal (única fuente de IDs permitidos). */
export const PORTAL_MODULE_IDS = [
  'tienda',
  'mensajeria',
  'usuarios',
  'contenidos'
] as const satisfies ReadonlyArray<keyof typeof modulePrices>;

export type PortalModuleId = (typeof PORTAL_MODULE_IDS)[number];

export const portalTotalWithModules =
  portalBasePrice +
  modulePrices.tienda +
  modulePrices.mensajeria +
  modulePrices.usuarios +
  modulePrices.contenidos;

/**
 * Normaliza IDs de módulos: solo permitidos, únicos y en orden canónico.
 * Ignora desconocidos, basura y duplicados. No interpreta precios ni plazos.
 */
export function normalizePortalModuleIds(input: unknown): PortalModuleId[] {
  const tokens: string[] = [];
  const pushToken = (raw: string) => {
    for (const part of raw.split(/[,|;]/)) {
      const t = part.trim();
      if (t) tokens.push(t);
    }
  };
  if (typeof input === 'string') {
    pushToken(input);
  } else if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') pushToken(item);
    }
  }
  const present = new Set(tokens);
  return PORTAL_MODULE_IDS.filter((id) => present.has(id));
}

export function serializePortalModuleIds(ids: readonly PortalModuleId[]): string {
  return ids.join(',');
}

/** Resta el 15 % y redondea a céntimos. */
export function discounted(amount: number): number {
  return Math.round(amount * 85) / 100;
}

/** Formato es-ES con espacio fino no separable antes del €. */
export function formatEuro(amount: number): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `${formatted}\u202F€`;
}

/** Base + módulos normalizados. Un ID desconocido o duplicado no altera el total. */
export function sumPortal(selectedModuleIds: readonly string[]): number {
  const ids = normalizePortalModuleIds(selectedModuleIds);
  let total: number = portalBasePrice;
  for (const id of ids) {
    total += modulePrices[id];
  }
  return total;
}
