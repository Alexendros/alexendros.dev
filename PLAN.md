# Estado — alexendros.dev (Astro MVP)

### Propósito de este documento

- **Objetivos:** Registrar el estado del MVP, pendientes operativos y criterios de mantenimiento.
- **Estructura:** Objetivos → arquitectura → pendiente → predecesor → releases → mantenimiento.
- **Contenido a integrar según contexto:** Actualiza issues y gates. No uses este archivo como CMS ni para cambiar pricing.

MVP en **producción** en [https://alexendros.dev](https://alexendros.dev). Repo canónico: `Alexendros/alexendrosdev`. Proyecto Vercel: **`alexendros-dev`**.

## Objetivos cumplidos

- LCP medido ~1.9s (objetivo histórico &lt;1.65s en Speed Insights); CLS ≤0.05 en gate LHCI; INP &lt;200ms
- Lighthouse CI opt-in: perf ≥95, a11y/BP/SEO 100, CLS ≤0.05, LCP ≤2.5s
- axe-core 0 violaciones en rutas CI; `e2e-critical` always-on
- Formulario tipado + honeypot + Upstash + Proton SMTP (+ Turnstile si hay secreto)
- Tracking con consentimiento previo y granular (CMP `vanilla-cookieconsent` v3; Consent Mode v2 default-deny); decisión 0012 en `docs/audits/decisions.json`
- Vercel Analytics/Speed Insights solo en builds de Vercel (`__IS_VERCEL__`)
- Tema claro editorial (decisión 0011); design system en `docs/standards/website/diseno.md`

## Arquitectura entregada

- Contenido tipado en `src/content/*.ts` (Zod en build)
- Páginas: home, servicios, proyectos, sobre-mí, contacto, cookies, aviso-legal, privacidad
- Islas cliente: `ContactForm.tsx` (`client:visible`), `CookieBanner.tsx`
- API: contacto, webhook Cal, CSP report
- CI: `quality` (incluye `lint:css` + `check:records`), `test`, `build`, `smoke`, `e2e-critical`; e2e/LHCI opt-in
- Deploy Hobby: preview por PR; producción = merge a `main`
- Registros vivos: `docs/audits/decisions.json` y `docs/audits/events.json`

## Pendiente operativo

| Item                  | Issue / nota                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Drift local Node/pnpm | Evento activo `evt-local-node-pnpm-drift` en `docs/audits/events.json` — validar con Node 22 + pnpm 9 |
| Labels taxonomía      | WARN histórico pre-Remachar: deduplicar labels GitHub-default vs `type:*`                             |

Issues cerrados de referencia: [#11](https://github.com/Alexendros/alexendrosdev/issues/11) Node 22.x; [#12](https://github.com/Alexendros/alexendrosdev/issues/12) majors; [#13](https://github.com/Alexendros/alexendrosdev/issues/13) SMTP/Upstash.

## Predecesor

El sitio Next.js en `nuevowebsite-alexendrosdev` está **archivado**. No hay redirecciones legacy de rutas; lanzamiento limpio sobre este stack Astro.

## Releases

Automáticas con **semantic-release** al push a `main` (workflow `release.yml`). SemVer: `content`/`docs`/`chore`/`style`/`refactor` → patch; `feat` → minor; breaking → major. Genera tag `v*.*.*` y GitHub Release (sin push de `chore(release)` a `main`; ruleset PR-only). Fuente de verdad de versión = tag. **Versionado ≠ promoción** a Vercel. Fallos en main/Production → issue `alerta:main` (`main-watch.yml`).

## Criterios de mantenimiento

No tocar pricing sin confirmar; no añadir CMS ni Google Fonts; no ampliar alcance de servicios sin decisión explícita. Commits y PRs en español; ramas `cursor/…` + PR borrador desde `main`. Documentación viva en `docs/standards/`; decisiones y eventos en `docs/audits/`.
