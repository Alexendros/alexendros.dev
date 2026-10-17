export const site = {
  name: 'Alexendros',
  url: 'https://alexendros.dev',
  titleDefault: 'Alexendros — Diseño y desarrollo de productos web',
  descriptionDefault:
    'Diseño y desarrollo de productos web, y revisión de claridad, funcionamiento y seguridad básica. Alcance acordado y trato directo. Valencia — remoto.',
  locale: 'es',
  ogLocale: 'es_ES',
  nav: [
    { label: 'Servicios', href: '/servicios' },
    { label: 'Trabajos realizados', href: '/proyectos' },
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
