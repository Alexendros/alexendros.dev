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

1. Rama desde `main` (`cursor/…`, `feat/…`, `fix/…`, `docs/…`, `content/…`).
2. `pnpm i && pnpm typecheck && pnpm lint && pnpm lint:css && pnpm format:check && pnpm check:records && pnpm test && pnpm build && pnpm smoke`
3. PR con CI verde (`quality`, `test`, `build`, `smoke`, `e2e-critical`). Playwright/axe completo y LHCI: label `e2e` si tocas UI o a11y. Los jobs de seguridad (`secrets`, `sca`, …) viven en `security.yml`; patrón documentado en [docs/standards/protocols/security-ci.md](docs/standards/protocols/security-ci.md).
4. Vulnerabilidades: [SECURITY.md](SECURITY.md), no un issue público.

## Commits

Conventional Commits. Tipos extra del release: `content` (patch). Ver `.releaserc.json`.

## Deploy

Promote = merge a `main`. Versionado (semantic-release) ≠ deploy Vercel.
