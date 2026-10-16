# Arquitectura — alexendros.dev

### Propósito de este documento

- **Objetivos:** Describir las capas del sitio, las fronteras de runtime y dónde vive cada contrato (contenido, API, CI, deploy).
- **Estructura:** Contexto → stack → árbol de runtime → APIs → CI/release → límites.
- **Contenido a integrar según contexto:** Adapta rutas y adapters de este Astro híbrido. No copies la arquitectura de un SaaS, de Next.js archivado ni de la CLI webconfig. No cambies el alcance de servicios ni el pricing desde aquí.

Sitio profesional de conversión + contratación. Producción: [https://alexendros.dev](https://alexendros.dev). Repo: `Alexendros/alexendrosdev`. Proyecto Vercel **`alexendros-dev`**.

## Stack

Astro 7.3 hybrid + islas React (`ContactForm` con `client:load`, CMP `CookieBanner` con `client:idle`) + Tailwind (PostCSS) + TypeScript estricto + Zod. Fuentes Inter + JetBrains Mono self-hosted. Tracking comercial (GA4, Meta, Clarity, PostHog, LinkedIn, GTM) solo con consentimiento previo y granular (Consent Mode v2 default-deny). Vercel Analytics y Speed Insights solo en builds de Vercel (`__IS_VERCEL__`).

## Runtime

| Capa                 | Dónde                                                                  | Notas                               |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------------- |
| Páginas SSG          | `src/pages/*.astro`                                                    | Contenido tipado; 0 JS de contenido |
| Islas cliente        | `ContactForm.tsx` (`client:load`), `CookieBanner.tsx` (`client:idle`)  | Formulario + CMP                    |
| APIs serverless      | `src/pages/api/contact.ts`, `src/pages/api/cal/webhook.ts`, CSP report | Adapter `@astrojs/vercel`           |
| Contenido            | `src/content/*.ts`                                                     | Zod en build; no CMS                |
| Estáticos de preview | `.vercel/output/static`                                                | `pnpm preview` / job `smoke`        |

## APIs

- `POST /api/contact` — Zod, honeypot, rate-limit Upstash, Proton SMTP, Turnstile si hay secreto. Fail-closed (503) sin Redis/SMTP.
- `POST /api/cal/webhook` — HMAC `X-Cal-Signature-256`, upsert Notion Leads, Redis solo idempotencia.

Variables: [`.env.example`](.env.example) y [docs/standards/protocols/env-vars.md](docs/standards/protocols/env-vars.md). Nunca en git.

## CI y release

Jobs del workflow principal: `quality` → `test` → `build` → `smoke` → `e2e-critical`. Playwright completo + LHCI son **opt-in** (label `e2e` o `workflow_dispatch`). Release: `release.yml` + semantic-release (versionado ≠ promote a Vercel). Actualizaciones de dependencias: Renovate (`.github/renovate.json`).

## Límites

- No CMS, no Google Fonts, no ampliar servicios ni tocar pricing sin decisión explícita.
- Predecesor Next.js `nuevowebsite-alexendrosdev` archivado: no es fuente de verdad.
- Decisiones de plataforma: [`docs/audits/decisions.json`](docs/audits/decisions.json) (schema en `docs/audits/record.schema.json`).
- Alertas y avisos operativos: [`docs/audits/events.json`](docs/audits/events.json).
