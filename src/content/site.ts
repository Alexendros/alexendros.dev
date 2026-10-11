export const site = {
  name: 'Alexendros',
  url: 'https://alexendros.dev',
  titleDefault: 'Alexendros — Servicios digitales medibles para negocios',
  descriptionDefault:
    'Catálogo de servicios, portal configurable por módulos, metodología y cláusulas de valor. Valencia — remoto.',
  locale: 'es',
  ogLocale: 'es_ES',
  nav: [
    { label: 'Servicios', href: '/servicios' },
    { label: 'Referencias', href: '/proyectos' },
    { label: 'Metodología', href: '/metodologia' },
    { label: 'Valores', href: '/valores' }
  ],
  footerNav: [
    { label: 'Identidad', href: '/identidad' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' }
  ],
  social: {
    github: 'https://github.com/alexendros',
    linkedin: 'https://linkedin.com/in/alexendros',
    email: 'mailto:contratacion@alexendros.dev',
    cal: 'https://cal.com/alexendros'
  }
} as const;
