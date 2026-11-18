import { z } from 'zod';
import {
  normalizeProjectSlug,
  normalizeServiceSlug,
  projectTitle,
  serviceTitle
} from '../content/contactContext';
import { normalizePortalModuleIds, serializePortalModuleIds } from '../content/portalModules';
import {
  contactChannels,
  contactOrigins,
  contactReasons,
  contactViaIds,
  contactViaLabels,
  EMAIL_MAX,
  entityTypes,
  fieldLabels,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
  NAME_MIN,
  OTRA_MAX,
  OTRA_MIN,
  portalModuleDisplayNames,
  resolveViaId,
  SITIO_MAX,
  type ContactViaId,
  type FieldError
} from './contactModel';

export {
  contactChannels,
  contactOrigins,
  contactReasons,
  contactViaIds,
  contactViaLabels,
  entityTypes,
  fieldLabels,
  portalModuleDisplayNames,
  resolveViaId,
  type ContactViaId,
  type FieldError
};

/** CRLF y C0 en campos que pueden acabar en cabeceras SMTP (asunto). */
const HEADER_UNSAFE_CHARS = /[\r\n\u0000-\u001f\u007f]/;
/** En mensaje de cuerpo: permitir \\n y \\t; rechazar CR y demás controles. */
const BODY_UNSAFE_CHARS = /[\r\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

function rejectHeaderUnsafe(value: string, ctx: z.RefinementCtx, path: string) {
  if (HEADER_UNSAFE_CHARS.test(value)) {
    ctx.addIssue({
      code: 'custom',
      path: [path],
      message: 'formato'
    });
  }
}

function rejectBodyUnsafe(value: string, ctx: z.RefinementCtx, path: string) {
  if (BODY_UNSAFE_CHARS.test(value)) {
    ctx.addIssue({
      code: 'custom',
      path: [path],
      message: 'formato'
    });
  }
}

/** Quita caracteres de control de valores usados en cabeceras SMTP (Subject). */
export function sanitizeMailHeaderValue(value: string): string {
  // Flag `g`: sin él solo se elimina el primer control (p. ej. queda \\n tras \\r).
  return value.replace(/[\r\n\u0000-\u001f\u007f]/g, '').trim();
}

/** Sitio visible (no honeypot). Acepta dominio o URL http(s). */
const sitioSchema = z.preprocess(
  (v) => {
    if (typeof v !== 'string') return undefined;
    const trimmed = v.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z
    .string()
    .max(SITIO_MAX)
    .regex(/^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i, { message: 'formato' })
    .optional()
);

function normalizeVias(v: unknown): ContactViaId[] {
  const raw = Array.isArray(v) ? v : typeof v === 'string' ? [v] : [];
  const out: ContactViaId[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const id = resolveViaId(item);
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

export const contactSchema = z
  .object({
    name: z.string().trim().min(NAME_MIN).max(NAME_MAX),
    /** UI mínima: default particular si no llega (contexto oculto). */
    entityType: z.preprocess((v) => {
      if (typeof v === 'string' && (entityTypes as readonly string[]).includes(v)) return v;
      return 'particular';
    }, z.enum(entityTypes)),
    channel: z.enum(contactChannels),
    email: z.preprocess((v) => {
      if (typeof v !== 'string') return v;
      const trimmed = v.trim();
      return trimmed === '' ? undefined : trimmed;
    }, z.email().max(EMAIL_MAX).optional()),
    /** UI mínima: default informacionCliente; query `motivo` allowlisted si llega. */
    reason: z.preprocess((v) => {
      if (typeof v === 'string' && (contactReasons as readonly string[]).includes(v)) return v;
      return 'informacionCliente';
    }, z.enum(contactReasons)),
    /** Tope UI 600; servidor admite hasta 2000. */
    message: z.string().trim().min(MESSAGE_MIN).max(MESSAGE_MAX),
    vias: z.preprocess(normalizeVias, z.array(z.enum(contactViaIds)).min(1)),
    otraDetalle: z.preprocess((v) => {
      if (typeof v !== 'string') return undefined;
      const trimmed = v.trim();
      return trimmed === '' ? undefined : trimmed;
    }, z.string().min(OTRA_MIN).max(OTRA_MAX).optional()),
    phone: z.preprocess(
      (v) => {
        if (typeof v !== 'string') return undefined;
        const trimmed = v.trim();
        return trimmed === '' ? undefined : trimmed;
      },
      z
        .string()
        .max(40)
        .regex(/^[+\d][\d\s().-]{5,38}$/u, { message: 'formato' })
        .optional()
    ),
    sitio: sitioSchema,
    modules: z.preprocess((v) => {
      if (v === undefined || v === null) return undefined;
      if (typeof v === 'string' && v.trim() === '') return undefined;
      const ids = normalizePortalModuleIds(v);
      return ids.length > 0 ? serializePortalModuleIds(ids) : undefined;
    }, z.string().optional()),
    serviceSlug: z.preprocess((v) => normalizeServiceSlug(v), z.string().optional()),
    projectSlug: z.preprocess((v) => normalizeProjectSlug(v), z.string().optional()),
    origin: z.preprocess((v) => {
      if (typeof v !== 'string') return undefined;
      const trimmed = v.trim();
      if (!(contactOrigins as readonly string[]).includes(trimmed)) return undefined;
      return trimmed;
    }, z.enum(contactOrigins).optional()),
    consent: z.literal(true),
    honeypot: z.string().optional(),
    /** Correlación opcional cliente ↔ eventos de analítica. */
    eventId: z.preprocess((v) => {
      if (typeof v !== 'string') return undefined;
      const trimmed = v.trim();
      return trimmed === '' ? undefined : trimmed;
    }, z.string().min(8).max(64).optional())
  })
  .superRefine((data, ctx) => {
    rejectHeaderUnsafe(data.name, ctx, 'name');
    rejectBodyUnsafe(data.message, ctx, 'message');
    if (data.otraDetalle) {
      rejectHeaderUnsafe(data.otraDetalle, ctx, 'otraDetalle');
    }
    if (data.phone) {
      rejectHeaderUnsafe(data.phone, ctx, 'phone');
    }

    if (data.channel === 'correo' && !data.email) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'falta'
      });
    }

    if (data.vias.includes('otra') && !data.otraDetalle) {
      ctx.addIssue({
        code: 'custom',
        path: ['otraDetalle'],
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

/** Traduce issues de Zod a mensajes «Campo: causa» para la UI. */
export function formatContactFieldErrors(error: z.ZodError): FieldError[] {
  const seen = new Set<string>();
  const out: FieldError[] = [];
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    if (seen.has(field)) continue;
    seen.add(field);
    const label = fieldLabels[field] ?? field;
    let cause: string;
    if (field === 'consent') {
      cause = 'falta la aceptación del tratamiento';
    } else if (field === 'vias') {
      cause = 'marcar al menos una opción';
    } else if (field === 'otraDetalle') {
      cause = 'falta describir la otra necesidad';
    } else if (field === 'phone') {
      cause = 'el teléfono no parece válido';
    } else if (field === 'sitio') {
      cause = 'el sitio no parece válido';
    } else {
      const missing =
        issue.message === 'falta' || issue.code === 'invalid_type' || issue.code === 'too_small';
      cause = missing ? 'falta contenido' : 'formato no válido';
    }
    out.push({ field, label, cause });
  }
  return out;
}

export function buildContactMessage(input: ContactInput): string {
  const viaLines = input.vias.map((id) =>
    id === 'otra' && input.otraDetalle
      ? `Otra necesidad: ${input.otraDetalle}`
      : contactViaLabels[id]
  );
  const lines = [
    `Categoría: ${entityLabels[input.entityType]}`,
    'Canal preferido: Correo electrónico',
    `Motivo: ${reasonLabels[input.reason]}`,
    `Vías: ${viaLines.join('; ')}`,
    `Petición:\n${input.message}`
  ];
  if (input.email) lines.push(`Email: ${input.email}`);
  if (input.phone) lines.push(`Teléfono móvil: ${input.phone}`);
  if (input.sitio) lines.push(`Sitio web: ${input.sitio}`);
  if (input.modules) {
    const names = portalModuleDisplayNames(input.modules);
    if (names) lines.push(`Módulos de portal: ${names}`);
  }
  const serviceLabel = serviceTitle(input.serviceSlug);
  if (serviceLabel) lines.push(`Servicio de referencia: ${serviceLabel}`);
  const projectLabel = projectTitle(input.projectSlug);
  if (projectLabel) lines.push(`Trabajo de referencia: ${projectLabel}`);
  if (input.origin) lines.push(`Origen de página: ${input.origin}`);
  return lines.join('\n');
}
