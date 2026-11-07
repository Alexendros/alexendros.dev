# Plan — Platform coherence closure (Opción B)

**Fecha:** 2026-11-07  
**Rama:** `cursor/platform-coherence-closure`  
**Spec:** `specs/2026-11-07-platform-coherence-closure/`

Checklist de aceptación humano + gates automatizados. Marcar con evidencia (comando, URL o path).

## Criterios

- [x] **CA-H1 — Vitrina**  
      Prueba: `curl -sI https://designsystem.alexendros.dev/` → 200; dominio verificado en proyecto Hobby `alexendros-dev`. Contenido de vitrina (`data-ds-vitrina`) tras deploy Production de este PR (rewrite `/` → `/design-system/`). Local: build genera `.vercel/output/static/design-system/index.html` con `noindex` + `data-ds-vitrina`.  
      Evidencia: dominio añadido `verified: true` (2026-11-07); curl producción HTTP/2 200; HTML local de vitrina en build.

- [x] **CA-H2 — Hero → Button**  
      Prueba: `src/components/sections/Hero.astro` importa `Button.astro`; sin literales `btn btn-primary` / `btn-outline` en markup; `pnpm exec playwright test tests/e2e/hero-home.spec.ts`.  
      Evidencia: Hero + ContactCta usan `<Button>`; e2e hero-home / seo-routes / diseno-interaccion 62 passed.

- [x] **CA-H3 — Gobernanza + check**  
      Prueba: sección «Gobernanza de CTAs» en `docs/standards/website/diseno.md`; `pnpm check:classes` exit 0; test negativo (`scanProtectedBtnSurfaces` con `btn btn-primary` en Hero → hit `btn-direct`).  
      Evidencia: `check:classes OK`; vitest `checkClasses.test.ts` + negativo local OK.

- [x] **CA-H4 — Node**  
      Prueba: README, `package.json` → `engines.node` y `.nvmrc` declaran major **24**.  
      Evidencia: README «Node 24»; engines `24.x`; `.nvmrc` = `24`.

- [x] **CA-H5 — Tipografía**  
      Prueba: `ARCHITECTURE.md` nombra Source Sans 3 Variable (+ JetBrains Mono); no Inter como fuente principal.  
      Evidencia: ARCHITECTURE § Stack actualizado.

- [x] **CA-H6 — Checklist**  
      Prueba: este fichero lista CA-H1…H6 con prueba observable.  
      Evidencia: este documento

## Follow-ups menores (no bloqueantes)

- [ ] `.cursorrules` aún menciona Inter → alinear a Source Sans 3.
- [ ] `AGENTS.md` / `CONTRIBUTING.md` / `docs/standards/website/desarrollo.md` aún mencionan Node 22 → alinear a 24.

## Notas T-07

- Dominio `designsystem.alexendros.dev` añadido a proyecto Vercel **`alexendros-dev`** (Hobby), verificado.
- Rewrite host `/` → `/design-system/`; 308 apex `/design-system` → subdominio solo con `has: host = alexendros.dev` (preview/local sirven la vitrina sin 308).
- Tras merge: confirmar body del subdominio con marcador `data-ds-vitrina` / «Button».
