# Protocolo — CI y release

### Propósito de este documento

- **Objetivos:** Operar el pipeline y el versionado sin confundirlo con el promote a Vercel.
- **Estructura:** CI principal → e2e → release → Renovate → fallos.
- **Contenido a integrar según contexto:** Adapta nombres de jobs y el proyecto Vercel `alexendros-dev`. No copies husky/npm de webconfig. No cambies org settings ni branch protection desde un PR.

## CI principal

Workflow: `.github/workflows/ci.yml`.

| Job            | Bloquea PR      | Notas                                                           |
| -------------- | --------------- | --------------------------------------------------------------- |
| `quality`      | Sí              | typecheck, lint, lint:css, format, audit:cookies, check:records |
| `test`         | Sí              | Vitest                                                          |
| `build`        | Sí              | Artefacto `site-static`                                         |
| `smoke`        | Sí              | Depende de `build`                                              |
| `e2e-critical` | Sí              | Home, contacto, consent deny-by-default                         |
| `e2e`          | Solo si se pide | Label `e2e` o input `e2e` en `workflow_dispatch`                |

`release.yml` queda aparte (semantic-release en `main`). `security.yml` corre gitleaks, osv-scanner y CodeQL.

## Release

- Conventional Commits. Tipo extra `content` → patch (`.releaserc.json`).
- Push a `main` con CI verde → tag `vX.Y.Z` + GitHub Release (notas en el release).
- **No** hay push de `@semantic-release/git` a `main` (branch protection exige checks; GH006).
- `CHANGELOG.md` / `package.json` en `main` pueden desfasarse respecto al tag; la fuente de verdad de versión es el tag GitHub.
- **Versionado ≠ promote.** Vercel Production = merge a `main`.

## Renovate

`.github/renovate.json` cubre `npm` y `github-actions`. No hay Dependabot de version-updates. Stack majors al día (issue #12 cerrado: Astro 7, Zod 4, nodemailer 10, React 19). Alertas y avisos operativos viven en `docs/audits/events.json`.

## Si CI falla

1. Reproduce el job en local (`pnpm typecheck`, `test`, `build`, `smoke`, `check:records`).
2. `smoke` exige `.vercel/output/static` (tras `pnpm build`).
3. No force-push a `main`. No toques org settings.
