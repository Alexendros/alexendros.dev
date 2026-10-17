import { z } from 'zod';
import { formatEuro, provisionalPrices } from './pricing';
import { calEventUrl } from '../lib/calBooking';

export const bookingOfferSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('form'),
    id: z.literal('informe-comercial'),
    title: z.string().min(1),
    priceLabel: z.string().min(1),
    summary: z.string().min(1),
    cta: z.string().min(1),
    href: z.string().min(1)
  }),
  z.object({
    kind: z.literal('cal'),
    id: z.literal('sesion-profesional'),
    calLink: z.string().regex(/^alexendros\/[a-z0-9-]+$/),
    url: z.string().url(),
    title: z.string().min(1),
    priceLabel: z.string().min(1),
    summary: z.string().min(1),
    cta: z.string().min(1)
  })
]);

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
    offers: z.array(bookingOfferSchema).length(2)
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
    success:
      'Mensaje enviado. Te responderé en menos de 24 horas laborables por el canal que hayas elegido.',
    error: 'No se pudo enviar. Escríbeme a contratacion@alexendros.dev'
  },
  bookings: {
    heading: 'Opciones de contacto',
    intro: 'Informe comercial por formulario. Sesión profesional con reserva y pago en Cal.com.',
    offers: [
      {
        kind: 'form',
        id: 'informe-comercial',
        title: 'Informe comercial',
        priceLabel: formatEuro(provisionalPrices.informeComercial),
        summary:
          'Inspección metodológica de tu dominio y presencia en internet. Dossier con hallazgos y recomendaciones.',
        cta: 'Rellenar formulario',
        href: '#escribir'
      },
      {
        kind: 'cal',
        id: 'sesion-profesional',
        calLink: 'alexendros/sesion-tecnica',
        url: calEventUrl('alexendros/sesion-tecnica'),
        title: 'Sesión profesional',
        priceLabel: formatEuro(provisionalPrices.sesionProfesional),
        summary:
          'Sesión de 60 minutos para desbloquear un problema concreto. Siguientes pasos por escrito en 1 día laborable.',
        cta: 'Reservar sesión profesional'
      }
    ]
  }
});

export const publicBookingEvents = contact.bookings.offers.filter(
  (o): o is Extract<(typeof contact.bookings.offers)[number], { kind: 'cal' }> => o.kind === 'cal'
);
