import { z } from 'zod';

export const entityTypes = ['particular', 'empresa', 'institucion'] as const;
export const contactChannels = ['whatsapp', 'correo'] as const;
export const contactReasons = [
  'proyectoEspecial',
  'propuestaComercial',
  'informacionCliente'
] as const;

const UNSAFE_CONTENT = /<\s*script|javascript:|on\w+\s*=|data:\s*text\/html/i;

function rejectUnsafe(value: string, ctx: z.RefinementCtx, path: string) {
  if (UNSAFE_CONTENT.test(value)) {
    ctx.addIssue({
      code: 'custom',
      path: [path],
      message: 'formato'
    });
  }
}

export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    entityType: z.enum(entityTypes),
    channel: z.enum(contactChannels),
    phone: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      z
        .string()
        .trim()
        .min(9)
        .max(20)
        .regex(/^[+\d\s()-]+$/)
        .optional()
    ),
    email: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      z.string().trim().email().max(254).optional()
    ),
    reason: z.enum(contactReasons),
    message: z.string().trim().min(10).max(2000),
    modules: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      z.string().trim().max(200).optional()
    ),
    consent: z.literal(true),
    honeypot: z.string().optional(),
    turnstileToken: z.string().max(4096).optional()
  })
  .superRefine((data, ctx) => {
    rejectUnsafe(data.name, ctx, 'name');
    rejectUnsafe(data.message, ctx, 'message');
    if (data.modules) rejectUnsafe(data.modules, ctx, 'modules');

    if (data.channel === 'whatsapp' && !data.phone) {
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'falta'
      });
    }
    if (data.channel === 'correo' && !data.email) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'falta'
      });
    }
  });

export type ContactInput = z.infer<typeof contactSchema>;

export function parseContactBody(data: unknown) {
  return contactSchema.safeParse(data);
}

export function isHoneypotFilled(honeypot: string | undefined): boolean {
  return Boolean(honeypot && honeypot.trim().length > 0);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const reasonLabels: Record<(typeof contactReasons)[number], string> = {
  proyectoEspecial: 'Proyecto especial',
  propuestaComercial: 'Propuesta comercial',
  informacionCliente: 'Información para clientes'
};

export const entityLabels: Record<(typeof entityTypes)[number], string> = {
  particular: 'Particular',
  empresa: 'Empresa',
  institucion: 'Institución'
};

export const fieldLabels: Record<string, string> = {
  name: 'Nombre',
  entityType: 'Categoría',
  channel: 'Canal de respuesta',
  phone: 'Teléfono WhatsApp',
  email: 'Correo electrónico',
  reason: 'Motivo',
  message: 'Tu petición',
  modules: 'Módulos',
  consent: 'Consentimiento'
};

export type FieldError = { field: string; label: string; cause: string };

/** Traduce issues de Zod a mensajes «Campo: causa» para la UI. */
export function formatContactFieldErrors(error: z.ZodError): FieldError[] {
  const seen = new Set<string>();
  const out: FieldError[] = [];
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    if (seen.has(field)) continue;
    seen.add(field);
    const label = fieldLabels[field] ?? field;
    const missing =
      issue.message === 'falta' ||
      issue.code === 'invalid_type' ||
      issue.code === 'too_small' ||
      field === 'consent';
    const cause = missing ? 'falta contenido' : 'formato no válido';
    out.push({ field, label, cause });
  }
  return out;
}

export function buildContactMessage(input: ContactInput): string {
  const lines = [
    `Categoría: ${entityLabels[input.entityType]}`,
    `Canal preferido: ${input.channel === 'whatsapp' ? 'WhatsApp' : 'Correo electrónico'}`,
    `Motivo: ${reasonLabels[input.reason]}`,
    `Petición:\n${input.message}`
  ];
  if (input.phone) lines.push(`Teléfono: ${input.phone}`);
  if (input.email) lines.push(`Email: ${input.email}`);
  if (input.modules) lines.push(`Módulos de portal: ${input.modules}`);
  return lines.join('\n');
}
