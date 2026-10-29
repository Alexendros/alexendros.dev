# Contribuir — alexendros.dev

### Propósito de este documento

- **Objetivos:** Explicar setup, flujo de rama/PR y comprobaciones locales sin romper contenido ni contratos de API.
- **Estructura:** Idioma → requisitos → flujo → commits → deploy.
- **Contenido a integrar según contexto:** Adapta pnpm 9, Node 22 y jobs `quality`/`test`/`build`/`smoke`/`e2e-critical`. No copies husky/npm de otro paquete. e2e completo es opt-in.

Idioma: este fichero, README y `docs/standards/` en español. Commits y PRs en español (Conventional Commits).

Lee también [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md) y [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Requisitos

- Node **22** (`.nvmrc` / `engines.node` `22.x`)
- pnpm **9.15.9** (`packageManager` en `package.json`)

## Flujo

1. Crea una rama desde `main` con el formato `tipo/descripcion-breve`. Tipos: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`, `security` y `legal`. No hagas push directo a `main`.
2. Ejecuta `corepack enable && pnpm install --frozen-lockfile` y después `pnpm typecheck && pnpm lint && pnpm lint:css && pnpm format:check && pnpm check:records && pnpm audit:cookies && pnpm check:copy && pnpm check:classes && pnpm check:contrast && pnpm test && pnpm build && pnpm check:links && pnpm smoke`.
3. Abre una PR pequeña y de una sola responsabilidad, con título Conventional Commit, riesgo, evidencias y rollback. Debe tener `ci-gate` y `pr-mergeable` en verde, la rama actualizada y las conversaciones resueltas. La integración se realiza únicamente mediante squash y la rama se borra después.
4. Playwright completo y LHCI son opt-in con la etiqueta `e2e`; axe y los E2E críticos se ejecutan en cada PR. Los jobs `secrets` y `sca` viven en `ci.yml` para alimentar `ci-gate`.
5. Vulnerabilidades: [SECURITY.md](SECURITY.md), no un issue público.

## Commits

Conventional Commits. Tipos extra del release: `content` (patch). Ver `.releaserc.json`.

## Deploy

Promote = merge a `main`. Versionado (semantic-release) ≠ deploy Vercel.
