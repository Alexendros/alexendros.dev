import { z } from 'zod';

export const bookingOfferSchema = z.object({
  kind: z.literal('form'),
  id: z.enum(['informe-comercial', 'cumplimiento-normativo', 'ciberseguridad']),
  title: z.string().min(1),
  summary: z.string().min(1),
  cta: z.string().min(1),
  href: z.string().min(1)
});

export const contactChannelSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
  priority: z.number().int(),
  external: z.boolean().optional()
});

export const contactSchema = z.object({
  channels: z.array(contactChannelSchema).min(1),
  messages: z.object({
    success: z.string().min(1),
    error: z.string().min(1)
  }),
  bookings: z.object({
    heading: z.string().min(1),
    intro: z.string().min(1),
    offers: z.array(bookingOfferSchema).min(1).max(3)
  })
});

export const contact = contactSchema.parse({
  channels: [
    { id: 'form', label: 'Rellenar formulario', href: '#escribir', priority: 1 },
    {
      id: 'github',
      label: 'GitHub',
      href: 'https://github.com/alexendros',
      priority: 2,
      external: true
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/alexendros',
      priority: 3,
      external: true
    },
    {
      id: 'email',
      label: 'contratacion@alexendros.dev',
      href: 'mailto:contratacion@alexendros.dev',
      priority: 4,
      external: true
    }
  ],
  messages: {
    success: 'Mensaje enviado. Respuesta en un día laborable por el canal elegido.',
    error: 'No se pudo enviar. Contacto: contratacion@alexendros.dev'
  },
  bookings: {
    heading: 'Opciones de contacto',
    intro:
      'Posicionamiento en buscadores, cumplimiento normativo y ciberseguridad se piden por formulario.',
    offers: [
      {
        kind: 'form',
        id: 'informe-comercial',
        title: 'Posicionamiento comercial en buscadores',
        summary:
          'Informe técnico SEO y plan de ajustes con métricas verificables para mejorar el posicionamiento.',
        cta: 'Rellenar formulario',
        href: '#escribir'
      },
      {
        kind: 'form',
        id: 'cumplimiento-normativo',
        title: 'Cumplimiento normativo',
        summary: 'Revisión de protección de datos, políticas de cookies y accesibilidad del sitio.',
        cta: 'Rellenar formulario',
        href: '#escribir'
      },
      {
        kind: 'form',
        id: 'ciberseguridad',
        title: 'Ciberseguridad',
        summary:
          'Revisión de vulnerabilidades básicas con severidad y corrección recomendada por problema.',
        cta: 'Rellenar formulario',
        href: '#escribir'
      }
    ]
  }
});

/** Reservado para ofertas de reserva; hoy la página solo usa formulario. */
export const publicBookingEvents: Array<{
  kind: 'cal';
  calLink: string;
  url: string;
  title: string;
  summary: string;
  cta: string;
  id: string;
}> = [];
