/**
 * Paquetes cerrados de captación (portada y /servicios/).
 *
 * ÚNICO sitio donde se editan precios, plazos y condiciones. Importes en euros, sin IVA.
 *
 * `paquetesPublicados` decide si los paquetes se ven en la web. Mientras valga
 * `false`, portada, /servicios/ y el formulario siguen mostrando las vías actuales
 * y ninguna cifra llega al HTML (lo comprueba scripts/check-public-pricing.mjs).
 * Cámbialo a `true` solo cuando Alejandro confirme los precios.
 */
export const paquetesPublicados: boolean = false;

export const paqueteIds = ['web', 'tienda', 'asistente'] as const;
export type PaqueteId = (typeof paqueteIds)[number];

export const MANTENIMIENTO_INCLUIDO = '1 año de mantenimiento incluido';

export interface Paquete {
  id: PaqueteId;
  nombre: string;
  paraQuien: string;
  incluye: readonly string[];
  /** Euros, sin IVA. */
  precioDesde: number;
  /** Días naturales desde que se reciben los contenidos. */
  plazoDias: number;
  mantenimiento: string;
  /**
   * Euros al año, sin IVA, a partir del segundo año.
   * Pendiente: recalcular las cifras de renovación con el coste de Vercel Pro.
   */
  renovacionAnual: number;
  letraPequena: string;
  /** Bandera propia: el paquete solo se ve si esto y `paquetesPublicados` valen `true`. */
  publicado: boolean;
}

export const paquetes: readonly Paquete[] = [
  {
    id: 'web',
    nombre: 'Web',
    paraQuien:
      'Comercios y profesionales que necesitan una web clara para que les encuentren y les contacten.',
    incluye: [
      'Diseño a medida adaptado al móvil',
      'Hasta 4 secciones con textos revisados',
      'Formulario de contacto y aviso de cookies',
      'Posicionamiento básico en buscadores'
    ],
    precioDesde: 349,
    plazoDias: 7,
    mantenimiento: MANTENIMIENTO_INCLUIDO,
    renovacionAnual: 120,
    letraPequena:
      'Alojamiento, dominio y seguridad incluidos el primer año. Después, 120 € al año.',
    publicado: true
  },
  {
    id: 'tienda',
    nombre: 'Tienda online',
    paraQuien: 'Negocios que quieren vender sus productos por internet y cobrar con tarjeta.',
    incluye: [
      'Catálogo de hasta 30 productos con fotos y precios',
      'Carrito y pago con tarjeta',
      'Panel para gestionar pedidos y existencias',
      'Textos legales de venta a distancia preparados'
    ],
    precioDesde: 790,
    plazoDias: 14,
    mantenimiento: MANTENIMIENTO_INCLUIDO,
    renovacionAnual: 240,
    letraPequena:
      'Alojamiento, dominio y seguridad incluidos el primer año. Después, 240 € al año. Pagos con Stripe: comisión por venta a cargo del cliente.',
    publicado: true
  },
  {
    id: 'asistente',
    nombre: 'Asistente IA para tu negocio',
    paraQuien: 'Negocios que pierden horas en correos, documentos, presupuestos y agenda.',
    incluye: [
      'Asistente con Grok Bot configurado para el negocio',
      'Correo, documentos y presupuestos',
      'Agenda y tareas',
      'Conexión con Slack'
    ],
    precioDesde: 290,
    plazoDias: 7,
    mantenimiento: MANTENIMIENTO_INCLUIDO,
    renovacionAnual: 180,
    letraPequena:
      'Después, 180 € al año. Suscripción Grok Bot a nombre del cliente: desde 300 $/año + impuestos (o 30 $/mes).',
    publicado: true
  }
];

/** Paquetes que se muestran: ninguno mientras `paquetesPublicados` sea `false`. */
export function paquetesVisibles(
  publicados: boolean = paquetesPublicados,
  lista: readonly Paquete[] = paquetes
): readonly Paquete[] {
  return publicados ? lista.filter((p) => p.publicado) : [];
}

export function precioTexto(p: Paquete): string {
  return `${p.precioDesde.toLocaleString('es-ES')} € + IVA`;
}

export function plazoTexto(p: Paquete): string {
  return `en ${p.plazoDias} días`;
}

export function paqueteContactoHref(p: Paquete): string {
  return `/contacto/?origen=servicios&via=${p.id}&motivo=propuestaComercial`;
}
