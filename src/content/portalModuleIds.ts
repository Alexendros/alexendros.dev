/** IDs canónicos de módulos de portal (sin Zod). */

export const PORTAL_MODULE_IDS = ['tienda', 'mensajeria', 'usuarios', 'contenidos'] as const;

export type PortalModuleId = (typeof PORTAL_MODULE_IDS)[number];

/** Normaliza IDs: solo permitidos, únicos y en orden canónico. */
export function normalizePortalModuleIds(input: unknown): PortalModuleId[] {
  const tokens: string[] = [];
  const pushToken = (raw: string) => {
    for (const part of raw.split(/[,|;]/)) {
      const token = part.trim();
      if (token) tokens.push(token);
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
