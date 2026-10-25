# Protocolo — CI y release

### Propósito de este documento

- **Objetivos:** Operar el pipeline y el versionado sin confundirlo con el promote a Vercel; bloquear PRs en conflicto y responder fallos en `main`/Production.
- **Estructura:** CI principal → mergeable → release → vigilancia main → Renovate → fallos.
- **Contenido a integrar según contexto:** Adapta nombres de jobs y el proyecto Vercel `alexendros-dev`. No copies husky/npm de webconfig. No cambies org settings ni branch protection desde un PR sin decisión explícita.

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
| `pr-mergeable` | Sí (aviso)      | Falla si el PR tiene conflictos con la base                     |

`release.yml` queda aparte (semantic-release en `main`). El patrón canónico de `security.yml` (gitleaks con checksum, OSV, dependency-review, CodeQL, Scorecard) está en [`security-ci.md`](security-ci.md). `main-watch.yml` abre issues `alerta:main` si CI/security/Release fallan en `main` o si falla un deploy Production.

## Bloqueo por conflicto (PR)

Workflow: `.github/workflows/pr-mergeable.yml`.

1. Si GitHub marca el PR como no mergeable (`dirty` / `mergeable=false`), el check **`pr-mergeable` falla** y se comenta el PR con pasos de rebase.
2. No mergear (ni auto-merge) hasta que el check vuelva a verde.
3. Acción: `git fetch origin main && git rebase origin/main`, resolver, `pnpm` gates locales, push.

## Release

- Conventional Commits. Tipo extra `content` → patch (`.releaserc.json`).
- Push/merge a `main` con CI verde → semantic-release crea **tag** `vX.Y.Z` + GitHub Release (notas en el release).
- **No** se usa `@semantic-release/git` ni push de `CHANGELOG.md`/`package.json` a `main` (ruleset: PR obligatorio + checks; GH013).
- `CHANGELOG.md` / `package.json` en `main` pueden desfasarse respecto al tag; la fuente de verdad de versión es el **tag GitHub**.
- **Versionado ≠ promote.** Vercel Production = merge a `main`.
- Si Release falla tras un merge: no implica automáticamente sitio caído; verificar Production y re-lanzar Release con `workflow_dispatch` tras el fix.
- **Caché HTML:** `vercel.json` fija `Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=600` en documentos; `/_astro/` y `/_image` siguen `immutable`. Tras un deploy, si `verify-site.sh` (sección 2: hash normal vs `?cb=`) marca diferencias, purgar la caché del proyecto Vercel `alexendros-dev` (Dashboard → Caching → Purge) y repetir la verificación.

## Vigilancia de main y Production (`main-watch`)

Workflow: `.github/workflows/main-watch.yml`.

| Evento                                                       | Acción                                     |
| ------------------------------------------------------------ | ------------------------------------------ |
| `CI` / `security` / `Release` fallan en rama `main`          | Issue `alerta:main` + `priority: critical` |
| `deployment_status` failure en entorno Production/production | Issue `alerta:main` (impacto deploy)       |

### Respuesta técnica inmediata (si afecta al despliegue publicado)

1. Abrir el issue `alerta:main` y el enlace del run/deploy.
2. Comprobar apex `https://alexendros.dev/` (HTTP 200, sin 5xx/blanco) y estado Ready en Vercel proyecto `alexendros-dev`.
3. Si Production está roto: **rollback/promote** al deployment anterior verde en Vercel; no esperar al siguiente merge.
4. Si solo falló **Release** y el sitio responde OK: no rollback; corregir release y re-lanzar `workflow_dispatch`.
5. Hotfix: rama `cursor/hotfix-…` → PR → gates → merge (nunca push directo a `main`).
6. Cerrar el issue y dejar el evento correspondiente en `docs/audits/events.json` con `active: false` cuando el incidente quede cerrado.

## Renovate

`.github/renovate.json` cubre `npm` y `github-actions`. No hay Dependabot de version-updates. Stack majors al día (issue #12 cerrado: Astro 7, Zod 4, nodemailer 10, React 19). Alertas y avisos operativos viven en `docs/audits/events.json`.

## Si CI falla (PR)

1. Reproduce el job en local (`pnpm typecheck`, `test`, `build`, `smoke`, `check:records`).
2. `smoke` exige `.vercel/output/static` (tras `pnpm build`).
3. No force-push a `main`. No toques org settings.
