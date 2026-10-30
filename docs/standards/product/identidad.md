# IDENTIDAD DE CADA ELEMENTO — alexendros.dev

Repo canónico **público**: [`Alexendros/alexendrosdev`](https://github.com/Alexendros/alexendrosdev). Deploy: Vercel Hobby proyecto **`alexendros-dev`** (apex producción).

## site.ts

Config global: name, url https://alexendros.dev apex, titleDefault "Alexendros — Tecnologías y servicios informáticos", nav Servicios/Referencias/Metodología, footer legal, social GitHub/LinkedIn/mailto. Fuente verdad SEO canonical OG JSON-LD Person + ProfessionalService (marca profesional individual).

## profile.ts

Alejandro Domingo Agustí como persona responsable y Alexendros como marca profesional. Diseño y desarrollo web, contacto directo, proceso escrito y pruebas descritas por muestra y evidencia; Valencia y trabajo en remoto.

## services.ts — cuatro fichas y sitio profesional por módulos

- informe-comercial: Auditoría técnica SEO, con incidencias y métricas de referencia; sin promesa de posiciones.
- cumplimiento-normativo: Revisión técnica de privacidad, cookies y accesibilidad; sin asesoramiento jurídico ni certificación.
- ciberseguridad: Revisión básica de seguridad web; sin prueba de intrusión.
- software-a-medida: Colaboración por fases con alcance, requisitos y entregables escritos.
- portalModules.ts: Sitio web profesional e Integración de catálogo y pagos, canal de mensajería, usuarios y contenidos; sin importes públicos.

## projects.ts — 4 proyectos (profundidad > cantidad, 70% recruiters prefiere)

- front-valencia: Astro+React+Tailwind, Payload CMS 3+PostgreSQL i18n ES/EN carta con alergenos reservas CoverManager panel propio. Web rapida y accesible
- graficas-nasve: Next.js motor precios 200+ reglas validacion PDF Stripe Checkout B2B/B2C. 48h->5min +300% pedidos 0 errores -70% gestion PCI SAQ-A
- zedazo: CLI Rust 3MB limpiar VCF E.164 dedup VCF/CSV. Open source MIT
- alexendros-me: Next.js lab contenido MDX privacidad real sin GA. Lectura comoda y accesible

## Componentes

- Header.astro: sticky blur; nav Servicios / Referencias / Metodología; CTA Contacto
- Footer.astro: glass-bg + blur; marca + Contratación (mailto) + nav + legal; tracking solo con consentimiento (CMP); sin Sobre mí en el pie
- Hero.astro: H1 de taxonomía; lista de cuatro enlaces; CTAs «Solicitar propuesta» y «Catálogo de servicios»
- ServiceCard.astro / ProjectCard.astro: fichas de catálogo y referencias con availability
- ContactForm.tsx: isla React `client:load`, formulario mínimo (mensaje → nombre → canal → email|tel → consentimiento); motivo/categoría/refs ocultos o por query; errores por campo, honeypot, Turnstile opcional
- DetailIsland.astro: dialog nativo sobre índices de servicios/referencias con soft-nav (decisión 0022)
- CookieBanner.tsx: isla CMP `vanilla-cookieconsent` v3 (`client:idle`); Consent Mode v2 default-deny

## Paginas

- index.astro: Hero + Encargos habituales (decisión 0027; copy en tercera persona)
- servicios/: Servicios profesionales + selector de necesidades; fichas con propuesta/plazo/entrega/garantía/exclusiones/requisitos
- referencias/: Referencias con availability si|no|reservado (308 desde /proyectos)
- metodo.astro (Metodología clara), identidad.astro
- contacto.astro: formulario mínimo + mailto; sin embed Cal en página
- api/contact.ts: Zod, honeypot, rate-limit Upstash, idempotencia Redis (estados accepted/processing/conflict/unknown; no exactly-once Redis+SMTP), Proton SMTP; sin CAPI Lead (falta consentimiento publicidad)
- privacidad.astro / cookies.astro: textos alineados al CMP; Identidad como aviso del prestador

Cada elemento existe para reducir objecion o aumentar trust. No anadir sin justificar metrica conversion.
