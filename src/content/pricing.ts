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

export const portalTotalWithModules =
  portalBasePrice +
  modulePrices.tienda +
  modulePrices.mensajeria +
  modulePrices.usuarios +
  modulePrices.contenidos;

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

export function sumPortal(selectedModuleIds: readonly string[]): number {
  let total = portalBasePrice;
  for (const id of selectedModuleIds) {
    if (id in modulePrices) {
      total += modulePrices[id as keyof typeof modulePrices];
    }
  }
  return total;
}
