export const site = {
  name: 'Alexendros',
  url: 'https://alexendros.dev',
  titleDefault: 'Alexendros — Tecnologías y servicios informáticos',
  descriptionDefault:
    'Sitios web profesionales, integración de catálogo y pagos, auditoría técnica SEO y colaboración en proyectos de software. Desde Valencia.',
  locale: 'es',
  ogLocale: 'es_ES',
  nav: [
    { label: 'Servicios', href: '/servicios' },
    { label: 'Referencias', href: '/referencias' },
    { label: 'Metodología', href: '/metodo' }
  ],
  /** Enlaces legales del pie (Contacto va en la columna Navegación). */
  footerNav: [
    { label: 'Identidad', href: '/identidad' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Accesibilidad', href: '/accesibilidad' }
  ],
  footerExtraNav: [{ label: 'Contacto', href: '/contacto?motivo=propuestaComercial' }],
  social: {
    github: 'https://github.com/alexendros',
    linkedin: 'https://linkedin.com/in/alexendros',
    email: 'mailto:contratacion@alexendros.dev'
  }
} as const;
