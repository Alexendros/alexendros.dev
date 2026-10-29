# Estándar de desarrollo

### Propósito de este documento

- **Objetivos:** Setup local y comandos habituales sin reescribir el README.
- **Estructura:** Requisitos → arranque → scripts → reglas de contenido.
- **Contenido a integrar según contexto:** Adapta pnpm 9 y Node 22 de este repo. No copies un flujo npm/monorepo.

## Requisitos

- Node **22** (`.nvmrc` / `engines.node` `22.x`)
- pnpm **9.15.9** (`packageManager` en `package.json`; CI usa la misma línea)

```bash
pnpm i
cp .env.example .env   # SMTP_* + UPSTASH_* + NOTION_*
pnpm gen:og            # public/og/default.png si falta
pnpm dev               # http://localhost:4321
```

## Scripts

| Comando                                    | Job CI         | Qué hace                                   |
| ------------------------------------------ | -------------- | ------------------------------------------ |
| `pnpm typecheck` / `lint` / `format:check` | `quality`      | Tipos, ESLint, Prettier                    |
| `pnpm lint:css`                            | `quality`      | Stylelint (tokens, sin `!important`)       |
| `pnpm audit:cookies`                       | `quality`      | Inventario de cookies                      |
| `pnpm check:records`                       | `quality`      | Schema + asertos de decisions/events       |
| `pnpm test`                                | `test`         | Vitest (contratos API + helpers)           |
| `pnpm build`                               | `build`        | Build + runtime + gate anti-importes       |
| `pnpm smoke`                               | `smoke`        | HTML estático + HTTP 200 en rutas clave    |
| `pnpm test:e2e` (crítico)                  | `e2e-critical` | Home, contacto, consent deny-by-default    |
| `pnpm test:e2e` / `pnpm lhci`              | `e2e` (opt-in) | Playwright/axe completo y Lighthouse móvil |

`preview` sirve `.vercel/output/static` (el adapter Vercel no soporta `astro preview`).

## Contenido

Textos y ofertas viven en `src/content/*.ts`. No reintroduzcas importes públicos, no añadas CMS ni Google Fonts, no amplíes el alcance de servicios sin confirmación.
