/**
 * Validación del formulario en el navegador sin Zod.
 * El servidor sigue validando con contactSchema (Zod).
 */
import {
  type ContactInput,
  type ContactViaId,
  type FieldError,
  contactChannels,
  contactOrigins,
  contactReasons,
  EMAIL_MAX,
  entityTypes,
  fieldLabels,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
  NAME_MIN,
  normalizePortalModuleIds,
  OTRA_MAX,
  OTRA_MIN,
  resolveViaId,
  serializePortalModuleIds,
  SITIO_MAX
} from './contactModel';

/** Allowlist de slugs sin importar catálogos tipados con Zod. */
const SERVICE_SLUGS = new Set(['portal-web', 'software-a-medida']);
const PROJECT_SLUGS = new Set(['front-valencia', 'graficas-nasve', 'zedazo', 'alexendros-me']);

const SITIO_RE = /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function pushError(out: FieldError[], field: string, cause: string): void {
  if (out.some((e) => e.field === field)) return;
  out.push({ field, label: fieldLabels[field] ?? field, cause });
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

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

function normalizeServiceSlug(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed && SERVICE_SLUGS.has(trimmed) ? trimmed : undefined;
}

function normalizeProjectSlug(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed && PROJECT_SLUGS.has(trimmed) ? trimmed : undefined;
}

export function validateContactClient(
  data: unknown
): { success: true; data: ContactInput } | { success: false; errors: FieldError[] } {
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const errors: FieldError[] = [];

  const name = asString(record.name);
  if (name.length < NAME_MIN) pushError(errors, 'name', 'falta contenido');
  else if (name.length > NAME_MAX) pushError(errors, 'name', 'formato no válido');

  const entityRaw = asString(record.entityType);
  const entityType = (entityTypes as readonly string[]).includes(entityRaw)
    ? (entityRaw as ContactInput['entityType'])
    : 'particular';

  const channelRaw = asString(record.channel);
  if (!(contactChannels as readonly string[]).includes(channelRaw)) {
    pushError(errors, 'channel', 'formato no válido');
  }
  const channel = (channelRaw || 'correo') as ContactInput['channel'];

  const email: string | undefined = asString(record.email) || undefined;
  if (email && (email.length > EMAIL_MAX || !EMAIL_RE.test(email))) {
    pushError(errors, 'email', 'formato no válido');
  }
  if (channel === 'correo' && !email) {
    pushError(errors, 'email', 'falta contenido');
  }

  const reasonRaw = asString(record.reason);
  const reason = (contactReasons as readonly string[]).includes(reasonRaw)
    ? (reasonRaw as ContactInput['reason'])
    : 'informacionCliente';

  const message = asString(record.message);
  if (message.length < MESSAGE_MIN) pushError(errors, 'message', 'falta contenido');
  else if (message.length > MESSAGE_MAX) pushError(errors, 'message', 'formato no válido');

  const vias = normalizeVias(record.vias);
  if (vias.length < 1) pushError(errors, 'vias', 'marcar al menos una opción');

  const otraDetalle: string | undefined = asString(record.otraDetalle) || undefined;
  if (vias.includes('otra') && !otraDetalle) {
    pushError(errors, 'otraDetalle', 'falta describir la otra necesidad');
  }
  if (otraDetalle && (otraDetalle.length < OTRA_MIN || otraDetalle.length > OTRA_MAX)) {
    pushError(errors, 'otraDetalle', 'formato no válido');
  }

  let sitio: string | undefined = asString(record.sitio) || undefined;
  if (sitio) {
    if (sitio.length > SITIO_MAX || !SITIO_RE.test(sitio)) {
      pushError(errors, 'sitio', 'el sitio no parece válido');
      sitio = undefined;
    }
  }

  const modulesRaw = record.modules;
  const moduleIds =
    modulesRaw === undefined || modulesRaw === null || asString(modulesRaw) === ''
      ? []
      : normalizePortalModuleIds(modulesRaw);
  const modules = moduleIds.length > 0 ? serializePortalModuleIds(moduleIds) : undefined;

  const serviceSlug = normalizeServiceSlug(record.serviceSlug);
  const projectSlug = normalizeProjectSlug(record.projectSlug);

  const originRaw = asString(record.origin);
  const origin = (contactOrigins as readonly string[]).includes(originRaw)
    ? (originRaw as ContactInput['origin'])
    : undefined;

  if (record.consent !== true && record.consent !== 'on') {
    pushError(errors, 'consent', 'falta la aceptación del tratamiento');
  }

  if (errors.length > 0) return { success: false, errors };

  const eventId = asString(record.eventId) || undefined;

  return {
    success: true,
    data: {
      name,
      entityType,
      channel,
      email,
      reason,
      message,
      vias,
      otraDetalle,
      sitio,
      modules,
      serviceSlug,
      projectSlug,
      origin,
      consent: true,
      honeypot: asString(record.honeypot) || undefined,
      eventId: eventId && eventId.length >= 8 && eventId.length <= 64 ? eventId : undefined
    }
  };
}
