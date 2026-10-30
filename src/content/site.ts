export const site = {
  name: 'Alexendros',
  url: 'https://alexendros.dev',
  titleDefault: 'Alexendros — Tecnologías y servicios informáticos',
  descriptionDefault:
    'Sitios web profesionales, integración de catálogo y pagos, aplicaciones para Linux e integración de Inteligencia Artificial. Desde Valencia.',
  locale: 'es',
  ogLocale: 'es_ES',
  nav: [
    { label: 'Servicios profesionales', href: '/servicios' },
    { label: 'Proyectos realizados', href: '/proyectos' },
    { label: 'Metodología clara', href: '/metodo' }
  ],
  /** Enlaces legales del pie (Contacto va en la columna Navegación). */
  footerNav: [
    { label: 'Identidad', href: '/identidad' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Accesibilidad', href: '/accesibilidad' }
  ],
  footerExtraNav: [{ label: 'Contacto', href: '/contacto' }],
  social: {
    github: 'https://github.com/alexendros',
    linkedin: 'https://linkedin.com/in/alexendros',
    email: 'mailto:contratacion@alexendros.dev'
  }
} as const;
