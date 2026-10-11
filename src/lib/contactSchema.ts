import { z } from 'zod';

export const entityTypes = ['particular', 'empresa', 'institucion'] as const;
export const contactChannels = ['whatsapp', 'correo'] as const;
export const contactReasons = [
  'proyectoEspecial',
  'propuestaComercial',
  'informacionCliente'
] as const;

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
    modules: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      z.string().trim().max(200).optional()
    ),
    consent: z.literal(true),
    honeypot: z.string().optional(),
    turnstileToken: z.string().max(4096).optional()
  })
  .superRefine((data, ctx) => {
    if (data.channel === 'whatsapp' && !data.phone) {
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Teléfono obligatorio para WhatsApp'
      });
    }
    if (data.channel === 'correo' && !data.email) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Email obligatorio para correo'
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

export function buildContactMessage(input: ContactInput): string {
  const lines = [
    `Tipo: ${entityLabels[input.entityType]}`,
    `Canal preferido: ${input.channel === 'whatsapp' ? 'WhatsApp' : 'Correo electrónico'}`,
    `Motivo: ${reasonLabels[input.reason]}`
  ];
  if (input.phone) lines.push(`Teléfono: ${input.phone}`);
  if (input.email) lines.push(`Email: ${input.email}`);
  if (input.modules) lines.push(`Módulos de portal: ${input.modules}`);
  return lines.join('\n');
}
