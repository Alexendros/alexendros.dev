### Propósito de este documento

- **Objetivos:** Contrato operativo para agentes de código y el rol Mantenedor: preferencias aprendidas, fuentes de verdad y Definition of Done.
- **Estructura:** Propósito → preferencias → hechos del workspace → CI canónico.
- **Contenido a integrar según contexto:** Conserva las preferencias de este portfolio. No copies un `AGENTS.md` de landing/SaaS ni tokens/DS de otro paquete. No reutilices `release.yml` ni cambies pricing/servicios sin confirmación.

**Destinatarios:** agentes de código y el rol Mantenedor. Homogeneizamos **nombres y contratos** (jobs `quality` / `test` / `build` / `smoke` / `e2e-critical`), no el copy del sitio.

## Learned User Preferences

- Responder siempre en español.
- Commits en español.
- Tracking solo con consentimiento previo y granular (CMP `vanilla-cookieconsent` v3; Consent Mode v2 con todo `denied` por defecto). Vercel Analytics y Speed Insights solo en builds Vercel (`__IS_VERCEL__`) y solo tras consentimiento de analítica; en local/CI no existen `/_vercel/*` y romperían Best Practices. Medición comercial: `form_submit` = intento; Meta Lead y `contact_form_success` solo tras `200` con `status: 'accepted'` y sin replay.
- Tracking comercial completo **autorizado** (giro mercenario): GA4, Meta Pixel + CAPI server-side, LinkedIn Insight, Microsoft Clarity y PostHog EU, además de GTM server-side en Vercel. Todos gated por consentimiento de su categoría; ninguna etiqueta no esencial se carga sin consentimiento.
- Las cookies deben figurar en `docs/cookies-inventory.json`; `pnpm run audit:cookies` es la verificación canónica. La categoría de marketing del CMP se muestra como **Publicidad** (clave técnica `marketing`).
- Catálogo autorizado: informe comercial, sesión profesional, auditoría, y portal de inicio con módulos de coste añadido. Importes **provisionales** en `src/content/pricing.ts` hasta fijación explícita; no añadir CMS ni Google Fonts ni ampliar servicios sin decisión.
- Preferir repo público + Vercel Hobby para preview por PR (decisión 1B); relajar Deployment Protection/SSO de previews para URLs compartibles (decisión 2A).
- Versionado (semantic-release / release.yml) distinto de promote a producción; content=patch, feat=minor, breaking=major.
- Al trabajar desde `main`, abrir rama `cursor/…`, commit/push y PR en borrador (no push directo a default).

## Learned Workspace Facts

- Repo canónico **público**: `Alexendros/alexendrosdev`; producción apex `https://alexendros.dev` en proyecto Vercel **`alexendros-dev`** (Hobby), Git link a este repo (decisión 1B).
- Predecesor Next.js `nuevowebsite-alexendrosdev` archivado; no reutilizar como fuente de verdad.
- Stack MVP: Astro 7.3 + isla React `ContactForm` (`client:load`, asistente de 6 pasos) + Tailwind (PostCSS) + TS estricto + Zod; contacto vía Proton SMTP (`operaciones@alexendros.dev`), honeypot, rate-limit Upstash y Turnstile (si `TURNSTILE_SECRET_KEY`). API contacto idempotente: `200 accepted` (+ replay), `202 processing`, `409 conflict`, `503 retryable_failure|unknown`; `accepted` = aceptación de la aplicación, no entrega al buzón. SMTP/Upstash en Vercel: issue #13 cerrado; fail-closed sin esas vars.
- Tema visual (decisión 0011, supersedes 0006/0007): claro editorial azul `#0f3778` con tokens en 3 capas (`@layer tokens` de `src/styles/global.css` es la fuente única; Tailwind solo referencia semánticos). Tema oscuro vía `prefers-color-scheme`/`data-theme`, validado por `pnpm check:contrast` (28 pares, ambos temas). Prohibidos colores literales fuera de tokens, `!important` y `transition: all` (stylelint `pnpm lint:css`).
- Design system: componentes en `src/components/`, página viva `/design-system` (noindex) y `docs/standards/website/diseno.md`. Motion: solo `transform`/`opacity`, reveal v2 con stagger, JS ≤ 2 KB gzip, 100% reduced-motion.
- Documentación viva en `docs/standards/` (`website/`, `product/`, `protocols/`). Decisiones y eventos tipados en `docs/audits/{decisions,events}.json` (schema `record.schema.json`, gate `pnpm check:records`).
- `engines.node` fijado a `22.x` (`.nvmrc`); `packageManager` `pnpm@9.15.9`. Validar Preview tras merge (issue #11 cerrado).
- CI canónico: jobs `quality` (typecheck, lint, format, **lint:css**, **check:records**, **audit:cookies**, **check:copy**, **check:contrast**), `test`, `build`, `smoke`, **`e2e-critical`** (always-on: `critical`, `products-structure`, `consent`, `seo-routes`, `seo-edge-prod`, `process-page`, `cp09-a11y-ux`, `skip-link`, `revision-ruido`), **`pr-mergeable`** (falla si hay conflicto con la base). Contrato API/contacto vía `pnpm run test:contract` (local y pre-release). e2e/axe completo + LHCI móvil son **opt-in** (label `e2e`); umbrales LHCI: perf ≥95, a11y/BP/SEO 100, CLS ≤0.05, LCP ≤2.5s. LCP medido ~1.9s.
- Release: semantic-release en `main` crea **tag + GitHub Release**; no usa `@semantic-release/git` (ruleset PR-only). Fuente de verdad de versión = tag. `main-watch.yml` abre issues `alerta:main` si CI/security/Release fallan en `main` o si falla deploy Production; respuesta técnica inmediata documentada en `docs/standards/protocols/ci-release.md`.
- Renovate (`.github/renovate.json`) es el único bot de version-updates (`npm` + `github-actions`). Stack majors al día: Astro 7, Zod 4, nodemailer 10, React 19 (issue #12 cerrado).
- Security: `security.yml` (gitleaks, osv-scanner + `osv-scanner.toml`, CodeQL sin upload); scorecard y dependency-review solo si el repo es público. Residuales documentados en `docs/threat-model.md`.
- IA (decisión 0019; supersede 0014–0018): nav Servicios, Proyectos realizados (`/proyectos`), Cómo trabajo (`/proceso-y-entrega`); aliases 308 desde metodología, valores y como-trabajo. `/sobre-mi` es página viva. Home = hero estable + tres caminos + tira Cómo trabajo + un caso. Proyectos declaran `availability` y `productType` (Web · Tienda · Herramienta). Fichas: informe-comercial, sesion-profesional, auditoría y software-a-medida (sin precio «desde» inventado); portal solo vía configurador.
