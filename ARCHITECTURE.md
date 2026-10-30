# Arquitectura — alexendros.dev

### Propósito de este documento

- **Objetivos:** Describir las capas del sitio, las fronteras de runtime y dónde vive cada contrato (contenido, API, CI, deploy).
- **Estructura:** Contexto → stack → árbol de runtime → APIs → CI/release → límites.
- **Contenido a integrar según contexto:** Adapta rutas y adapters de este Astro híbrido. No copies la arquitectura de un SaaS, de Next.js archivado ni de la CLI webconfig. No cambies el alcance de servicios ni reintroduzcas importes públicos desde aquí.

Sitio profesional de conversión + contratación. Producción: [https://alexendros.dev](https://alexendros.dev) (`www` → apex). Repo: `Alexendros/alexendros.dev`. Proyecto Vercel **`alexendros-dev`**.

## Stack

Astro 7.3 con `output: 'static'` y rutas on-demand (`prerender = false`) + Tailwind (PostCSS) + TypeScript estricto + Zod. Sin islas React: formulario, CMP y configurador son componentes Astro con scripts vanilla. Fuentes Inter + JetBrains Mono self-hosted. Tracking comercial (GA4, Meta, Clarity, PostHog, LinkedIn, GTM) solo con consentimiento previo y granular (Consent Mode v2 default-deny). Vercel Analytics y Speed Insights solo en builds de Vercel (`__IS_VERCEL__`).

## Runtime

| Capa                 | Dónde                                                              | Notas                                 |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| Páginas SSG          | `src/pages/*.astro`                                                | Contenido tipado; 0 JS de contenido   |
| Scripts cliente      | `src/scripts/*.ts` (reveal, header, CMP, formulario, configurador) | Importados desde Layout y componentes |
| APIs serverless      | `src/pages/api/contact.ts`, `src/pages/api/csp-report.ts`          | Adapter `@astrojs/vercel`             |
| Contenido            | `src/content/*.ts`                                                 | Zod en build; no CMS                  |
| Estáticos de preview | `.vercel/output/static`                                            | `pnpm preview` / job `smoke`          |

## APIs

- `POST /api/contact` — Zod, honeypot, rate-limit Upstash, Proton SMTP, Turnstile si hay secreto. Fail-closed (503) sin Redis/SMTP. Idempotencia con estados `processing` | `accepted` | `retryable_failure` | `unknown` (contrato HTTP: 200 accepted/+replay, 202 processing + `Retry-After`, 409 conflict, 503 retryable_failure|unknown). Un claim ocupado no es éxito final.
- `POST /api/csp-report` — colector de violaciones CSP (Report-Only).

Variables: [`.env.example`](.env.example) y [docs/standards/protocols/env-vars.md](docs/standards/protocols/env-vars.md). Nunca en git.

**Límite (contacto):** Redis (claim/estado) y Proton SMTP no forman una transacción. No se promete exactly-once: el transporte puede aceptar un correo sin persistir `accepted`, o el estado puede quedar `unknown` sin reenvío ciego.

## CI y release

El workflow principal ejecuta `quality`, `test`, `build` (incluido `check:links`), `smoke`, `e2e-critical`, `csp`, `axe` y controles de seguridad; `ci-gate` agrega los obligatorios. Playwright completo + LHCI son **opt-in** (label `e2e` o `workflow_dispatch`). Release: `release.yml` + semantic-release (versionado ≠ promote a Vercel). Actualizaciones de dependencias: Renovate (`.github/renovate.json`).

## Límites

- No CMS, no Google Fonts, no ampliar servicios ni publicar importes sin decisión explícita.
- Predecesor Next.js `nuevowebsite-alexendrosdev` archivado: no es fuente de verdad.
- Decisiones de plataforma: [`docs/audits/decisions.json`](docs/audits/decisions.json) (schema en `docs/audits/record.schema.json`).
- Alertas y avisos operativos: [`docs/audits/events.json`](docs/audits/events.json).
