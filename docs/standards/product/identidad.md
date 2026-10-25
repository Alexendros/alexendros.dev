# IDENTIDAD DE CADA ELEMENTO — alexendros.dev

Repo canónico **público**: [`Alexendros/alexendrosdev`](https://github.com/Alexendros/alexendrosdev). Deploy: Vercel Hobby proyecto **`alexendros-dev`** (apex producción).

## site.ts

Config global: name, url https://alexendros.dev apex, titleDefault "webs que convierten", nav Servicios/Proyectos/Sobre mi/Contacto, footer legal, social GitHub/LinkedIn/mailto/cal.com. Fuente verdad SEO canonical OG JSON-LD Person.

## profile.ts

Quien eres: role Full Stack · Auditor · Consultor, summary conversion-focused, method 6 pasos (definicion alcance, arquitectura ADRs, TS estricto + a11y, validacion CI, deploy Vercel <1.65s LCP, transferencia 30 dias), Valencia remoto.

## services.ts — 3 servicios con alcance cerrado

- produccion-sitios-web: Para fundadores WP lento. Problemas LCP>4s, landings genericas, forms rotos 78% abandono. Scope 10 inc Stripe/PayPal forms Zod 3 campos. Deliverables app+CI verde+informe Lighthouse/axe+guia. Metricas -65% LCP 3.2% conversion. Desde 1500€ 1-4 sem. Exclusiones sin CMS gestionado.
- auditorias: Para CTOs tech leads. Scope perf CWV LCP CLS INP, a11y axe-core+teclado/NVDA, SEO tecnico, calidad, seguridad proporcional, priorizacion ICE, plan remediacion. Deliverables informe navegable+ICE+scripts+sesion 1h. Desde 650€ 3-5 dias.
- consultoria-tecnologica: Sin hype. Diagnostico arquitectura evaluacion alternativas plan faseado ADRs/runbooks. Stack TS Node Rust Go MCP Ollama Zod. Desde 900€ 1-2 sem.

## projects.ts — 4 proyectos (profundidad > cantidad, 70% recruiters prefiere)

- front-valencia: Astro+React+Tailwind, Payload CMS 3+PostgreSQL i18n ES/EN carta con alergenos reservas CoverManager panel propio. Web rapida y accesible
- graficas-nasve: Next.js motor precios 200+ reglas validacion PDF Stripe Checkout B2B/B2C. 48h->5min +300% pedidos 0 errores -70% gestion PCI SAQ-A
- zedazo: CLI Rust 3MB limpiar VCF E.164 dedup VCF/CSV. Open source MIT
- alexendros-me: Next.js lab contenido MDX privacidad real sin GA. Lectura comoda y accesible

## Componentes

- Header.astro: sticky blur; nav Servicios profesionales / Proyectos realizados / Metodología clara; CTA Formulario de contacto
- Footer.astro: marca + Contratación (mailto) + nav + legal; tracking solo con consentimiento (CMP); sin Sobre mí en el pie
- Hero.astro: H1 de taxonomía; lista de cuatro enlaces; CTAs «Solicitar propuesta» y «Catálogo de servicios»
- ServiceCard.astro / ProjectCard.astro: fichas de catálogo y proyectos con availability
- ContactForm.tsx: isla React `client:load`, asistente de 6 pasos (motivo → nombre → categoría → canal → petición → consentimiento), errores por campo, honeypot, Turnstile opcional
- CookieBanner.tsx: isla CMP `vanilla-cookieconsent` v3 (`client:idle`); Consent Mode v2 default-deny
- Reserva de sesión profesional: enlace Cal.com en ficha (sin QR embebido ni lead magnet)

## Paginas

- index.astro: Hero + Encargos habituales (decisión 0021; copy en tercera persona)
- servicios/: Servicios profesionales + configurador de portal; fichas con precio/pago/plazo/entrega/garantía
- proyectos/: Proyectos realizados con availability si|no|reservado
- metodo.astro (Metodología clara), identidad.astro
- contacto.astro: formulario asistente + mailto; sin embed Cal en página
- api/contact.ts: Zod, honeypot, rate-limit Upstash, idempotencia Redis (estados accepted/processing/conflict/unknown; no exactly-once Redis+SMTP), Proton SMTP; sin CAPI Lead (falta consentimiento publicidad)
- privacidad.astro / cookies.astro: textos alineados al CMP; Identidad como aviso del prestador

Cada elemento existe para reducir objecion o aumentar trust. No anadir sin justificar metrica conversion.
