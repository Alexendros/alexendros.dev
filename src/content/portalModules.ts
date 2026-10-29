import { z } from 'zod';

const nonEmptyTrimmed = z.string().trim().min(1);

/** IDs canónicos aceptados en la web, la URL y el formulario. */
export const PORTAL_MODULE_IDS = ['tienda', 'mensajeria', 'usuarios', 'contenidos'] as const;

export type PortalModuleId = (typeof PORTAL_MODULE_IDS)[number];

export const portalModuleSchema = z.object({
  id: z.enum(PORTAL_MODULE_IDS),
  title: nonEmptyTrimmed,
  short: nonEmptyTrimmed,
  scope: nonEmptyTrimmed,
  dependencies: z.array(nonEmptyTrimmed),
  timeline: nonEmptyTrimmed,
  delivery: nonEmptyTrimmed,
  guarantee: nonEmptyTrimmed
});

export type PortalModule = z.infer<typeof portalModuleSchema>;

export const portalBase = {
  id: 'portal-inicio',
  title: 'Portal de inicio',
  short: 'Página principal, página de gracias, formulario y publicación.',
  scope: 'Presencia web para presentar la actividad y recibir consultas.',
  dependencies: [] as string[],
  timeline: '10 días laborables desde el encargo acordado',
  delivery: 'Página principal, página de gracias, formulario y publicación',
  guarantee:
    '30 días naturales para corregir desviaciones del alcance escrito. Los objetivos técnicos se evalúan en las rutas y el entorno acordados; no equivalen a una certificación completa.'
} as const;

export const portalModules: PortalModule[] = [
  {
    id: 'tienda',
    title: 'Catálogo y tienda online',
    short: 'Catálogo e integración con un proveedor de pagos.',
    scope: 'Presentación de productos y conexión del flujo de cobro acordado.',
    dependencies: ['Proveedor de pagos y datos de catálogo aportados por el cliente'],
    timeline: 'Plazo adicional definido en la propuesta',
    delivery: 'Catálogo e integración con el proveedor de pagos',
    guarantee: 'Misma garantía del sitio sobre el alcance escrito de este módulo'
  },
  {
    id: 'mensajeria',
    title: 'Canal de mensajería',
    short: 'Canalización de consultas a una aplicación de mensajería.',
    scope: 'Enlace o integración del canal acordado con el sitio.',
    dependencies: ['Cuenta y proveedor de mensajería confirmados antes de la integración'],
    timeline: 'Plazo adicional definido en la propuesta',
    delivery: 'Canal de mensajería conectado al sitio',
    guarantee: 'Misma garantía del sitio sobre el alcance escrito de este módulo'
  },
  {
    id: 'usuarios',
    title: 'Registro de usuarios y gestión de clientes',
    short: 'Registro de usuarios y gestión interna de clientes.',
    scope: 'Acceso de usuarios y panel interno según los permisos definidos.',
    dependencies: ['Modelo de usuarios, permisos y conservación de datos acordados'],
    timeline: 'Plazo adicional definido en la propuesta',
    delivery: 'Registro y panel interno de clientes',
    guarantee: 'Misma garantía del sitio sobre el alcance escrito de este módulo'
  },
  {
    id: 'contenidos',
    title: 'Panel de contenidos',
    short: 'Un panel para publicar y actualizar contenidos sin modificar el código.',
    scope: 'Gestión de los tipos de contenido incluidos en el alcance.',
    dependencies: ['Estructura de contenidos y responsables de edición definidos'],
    timeline: 'Plazo adicional definido en la propuesta',
    delivery: 'Panel de contenidos y publicaciones',
    guarantee: 'Misma garantía del sitio sobre el alcance escrito de este módulo'
  }
];

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

portalModules.forEach((module, index) => {
  const result = portalModuleSchema.safeParse(module);
  if (!result.success) throw new Error(`PortalModule ${index} inválido: ${result.error.message}`);
});
