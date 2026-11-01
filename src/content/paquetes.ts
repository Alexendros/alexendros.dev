/**
 * Paquetes cerrados de captación (portada y /servicios/).
 *
 * ÚNICO sitio donde se editan precios y plazos.
 * Mientras valgan `null`, la web muestra «desde [PRECIO] €» / «en [PLAZO] semanas»
 * como marcador visible. Para publicar una cifra, sustituye `null` por el número:
 *   precioDesde: 1200,   plazoSemanas: '2-3'
 */
export const PRECIO_MARCADOR = '[PRECIO]';
export const PLAZO_MARCADOR = '[PLAZO]';

export const paqueteIds = ['web', 'tienda', 'automatizacion'] as const;
export type PaqueteId = (typeof paqueteIds)[number];

export interface Paquete {
  id: PaqueteId;
  nombre: string;
  paraQuien: string;
  incluye: readonly string[];
  /** Euros, sin IVA. `null` = pendiente de decidir (se muestra el marcador). */
  precioDesde: number | null;
  /** Semanas (número o rango como '2-3'). `null` = pendiente de decidir. */
  plazoSemanas: number | string | null;
}

export const paquetes: readonly Paquete[] = [
  {
    id: 'web',
    nombre: 'Web',
    paraQuien:
      'Comercios y profesionales que necesitan una web clara para que les encuentren y les contacten.',
    incluye: [
      'Diseño a medida adaptado al móvil',
      'Hasta 5 secciones con textos revisados',
      'Formulario de contacto y aviso de cookies',
      'Posicionamiento básico en buscadores'
    ],
    precioDesde: null,
    plazoSemanas: null
  },
  {
    id: 'tienda',
    nombre: 'Tienda online',
    paraQuien: 'Negocios que quieren vender sus productos por internet y cobrar con tarjeta.',
    incluye: [
      'Catálogo de productos con fotos y precios',
      'Carrito y pago con tarjeta',
      'Panel para gestionar pedidos y existencias',
      'Textos legales de venta a distancia preparados'
    ],
    precioDesde: null,
    plazoSemanas: null
  },
  {
    id: 'automatizacion',
    nombre: 'Automatización con IA',
    paraQuien:
      'Negocios que pierden horas en tareas repetitivas: correos, citas, presupuestos o datos.',
    incluye: [
      'Análisis de la tarea que más tiempo consume',
      'Automatización conectada a tus herramientas',
      'Asistente con IA para responder o clasificar',
      'Guía de uso y acompañamiento al arrancar'
    ],
    precioDesde: null,
    plazoSemanas: null
  }
];

export function precioTexto(p: Paquete): string {
  const valor = p.precioDesde === null ? PRECIO_MARCADOR : p.precioDesde.toLocaleString('es-ES');
  return `desde ${valor} €`;
}

export function plazoTexto(p: Paquete): string {
  const valor = p.plazoSemanas === null ? PLAZO_MARCADOR : String(p.plazoSemanas);
  return `en ${valor} semanas`;
}

export function paqueteContactoHref(p: Paquete): string {
  return `/contacto/?origen=servicios&via=${p.id}&motivo=propuestaComercial`;
}
