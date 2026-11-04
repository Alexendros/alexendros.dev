import { z } from 'zod';

export const bookingOfferSchema = z.object({
  kind: z.literal('form'),
  id: z.string().min(1),
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
    offers: z.array(bookingOfferSchema).max(3)
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
    success: 'Solicitud enviada. La respuesta llegará por correo en un día laborable.',
    error: 'No se pudo enviar. Contacto: contratacion@alexendros.dev'
  },
  bookings: {
    heading: 'Opciones de contacto',
    intro: 'La colaboración en proyectos de programación se solicita por formulario.',
    offers: []
  }
});
