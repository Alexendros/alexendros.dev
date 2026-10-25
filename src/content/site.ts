export const site = {
  name: 'Alexendros',
  url: 'https://alexendros.dev',
  titleDefault: 'Alexendros — Auditoría, diseño y desarrollo web',
  descriptionDefault:
    'Página web, tienda en internet, aplicaciones para Linux, protocolos de gestión e integración de Inteligencia Artificial. Desde Valencia.',
  locale: 'es',
  ogLocale: 'es_ES',
  nav: [
    { label: 'Servicios', href: '/servicios' },
    { label: 'Proyectos realizados', href: '/proyectos' },
    { label: 'Cómo trabajo', href: '/proceso-y-entrega' }
  ],
  /** Enlaces legales del pie (Sobre mí y Contacto van en la columna Navegación). */
  footerNav: [
    { label: 'Identidad', href: '/identidad' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' }
  ],
  footerExtraNav: [
    { label: 'Sobre mí', href: '/sobre-mi' },
    { label: 'Contacto', href: '/contacto' }
  ],
  social: {
    github: 'https://github.com/alexendros',
    linkedin: 'https://linkedin.com/in/alexendros',
    email: 'mailto:contratacion@alexendros.dev',
    cal: 'https://cal.com/alexendros'
  }
} as const;
