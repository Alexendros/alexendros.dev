/**
 * Modelo de contacto sin Zod: constantes y helpers compartidos por cliente y servidor.
 */
import {
  normalizePortalModuleIds,
  serializePortalModuleIds,
  type PortalModuleId
} from '../content/portalModuleIds';

export const entityTypes = ['particular', 'empresa', 'institucion'] as const;
export const contactChannels = ['correo'] as const;
export const contactReasons = [
  'proyectoEspecial',
  'propuestaComercial',
  'informacionCliente'
] as const;

export const contactOrigins = [
  'proceso',
  'servicios',
  'home',
  'referencias',
  'proyectos',
  'home-linux',
  'home-gestion',
  'home-ia',
  'referido',
  'catalogo-revision',
  'catalogo-construccion',
  'catalogo-colaboracion'
] as const;

export const contactViaIds = [
  'web',
  'tienda',
  'asistente',
  'revisar',
  'crear',
  'colaborar',
  'otra'
] as const;
export type ContactViaId = (typeof contactViaIds)[number];

export const LEGACY_VIA_IDS: Readonly<Record<string, ContactViaId>> = {
  automatizacion: 'asistente'
};

export function resolveViaId(value: string): ContactViaId | null {
  const trimmed = value.trim();
  const id = LEGACY_VIA_IDS[trimmed] ?? trimmed;
  return (contactViaIds as readonly string[]).includes(id) ? (id as ContactViaId) : null;
}

export const contactViaLabels: Record<ContactViaId, string> = {
  web: 'Paquete Web',
  tienda: 'Paquete Tienda online',
  asistente: 'Paquete Asistente IA para tu negocio',
  revisar: 'Revisar lo que ya existe',
  crear: 'Crear una web o una tienda',
  colaborar: 'Sumar un programador al equipo',
  otra: 'Otra necesidad'
};

export const NAME_MIN = 2;
export const NAME_MAX = 100;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
export const EMAIL_MAX = 254;
export const OTRA_MIN = 3;
export const OTRA_MAX = 120;
export const SITIO_MAX = 200;

const PORTAL_MODULE_TITLES: Record<PortalModuleId, string> = {
  tienda: 'Integración de catálogo y pagos',
  mensajeria: 'Canal de mensajería',
  usuarios: 'Registro de usuarios y gestión de clientes',
  contenidos: 'Panel de contenidos'
};

export function portalModuleDisplayNames(modules: string | readonly string[] | undefined): string {
  const ids = normalizePortalModuleIds(modules);
  return ids.map((id) => PORTAL_MODULE_TITLES[id] ?? id).join(', ');
}

export { normalizePortalModuleIds, serializePortalModuleIds };

export type ContactInput = {
  name: string;
  entityType: (typeof entityTypes)[number];
  channel: (typeof contactChannels)[number];
  email?: string;
  reason: (typeof contactReasons)[number];
  message: string;
  vias: ContactViaId[];
  otraDetalle?: string;
  phone?: string;
  sitio?: string;
  modules?: string;
  serviceSlug?: string;
  projectSlug?: string;
  origin?: (typeof contactOrigins)[number];
  consent: true;
  honeypot?: string;
  eventId?: string;
};

export type FieldError = { field: string; label: string; cause: string };

export const fieldLabels: Record<string, string> = {
  name: 'Nombre completo',
  entityType: 'Categoría',
  channel: 'Canal de respuesta',
  email: 'Correo electrónico',
  reason: 'Motivo',
  message: 'Mensaje',
  vias: 'Vías',
  otraDetalle: 'Otra necesidad',
  phone: 'Teléfono móvil',
  sitio: 'Sitio web',
  modules: 'Módulos',
  serviceSlug: 'Servicio',
  projectSlug: 'Trabajo',
  consent: 'Consentimiento'
};
