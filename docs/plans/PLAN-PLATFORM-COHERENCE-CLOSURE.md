# Plan — Platform coherence closure (Opción B)

**Fecha:** 2026-11-07  
**Rama:** `cursor/platform-coherence-closure`  
**PR:** [#208](https://github.com/Alexendros/alexendros.dev/pull/208)  
**Spec:** `specs/2026-11-07-platform-coherence-closure/`

Checklist de aceptación humano + gates automatizados. Marcar con evidencia (comando, URL o path).

## Criterios

- [ ] **CA-H1 — Vitrina (producción subdominio)** — **pendiente de merge + deploy**  
      Prueba producción:  
      `curl -sI https://designsystem.alexendros.dev/` → 200  
      `curl -s https://designsystem.alexendros.dev/ | rg -n 'data-ds-vitrina|Button|Vitrina'`  
      Estado 2026-11-07 pre-merge: dominio verified y HTTP 200, pero el **body es el home comercial** (sin `data-ds-vitrina`); rewrite aún no está en Production.  
      Evidencia preview (SSO): `web_fetch` Preview → `/design-system/` 200, `data-ds-vitrina`, título «Design system — Alexendros», `noindex`, botones Primary lg.  
      Evidencia local: `.vercel/output/static/design-system/index.html` con los mismos marcadores.  
      **No marcar hecho solo por dominio verified.**

- [x] **CA-H2 — Hero → Button**  
      Prueba: `Hero.astro` / `ContactCta.astro` importan `Button.astro`; sin literales btn en class; `pnpm exec playwright test tests/e2e/hero-home.spec.ts`.  
      Evidencia: e2e-critical CI SUCCESS en PR #208; hero-home local verde.

- [x] **CA-H3 — Gobernanza + check**  
      Prueba: «Gobernanza de CTAs» en `diseno.md`; `pnpm check:classes` exit 0; negativo (btn en class de Hero → `btn-direct`). Comentarios HTML / prosa no disparan. Button.astro y design-system.astro fuera del gate.  
      Evidencia: vitest + check:classes OK.

- [x] **CA-H4 — Node**  
      Prueba: README / `engines.node` / `.nvmrc` = major **24**.  
      Evidencia: README «Node 24»; engines `24.x`; `.nvmrc` = `24`.

- [x] **CA-H5 — Tipografía**  
      Prueba: ARCHITECTURE = Source Sans 3 Variable (+ JetBrains Mono); no Inter como principal.  
      Evidencia: ARCHITECTURE § Stack.

- [x] **CA-H6 — Checklist**  
      Prueba: este fichero lista CA-H1…H6 con prueba observable y estado realista de CA-H1.  
      Evidencia: este documento.

## Follow-ups menores (no bloqueantes)

- [ ] `.cursorrules` aún menciona Inter → alinear a Source Sans 3.
- [ ] `AGENTS.md` / `CONTRIBUTING.md` / `docs/standards/website/desarrollo.md` aún mencionan Node 22 → alinear a 24.
- [ ] Reactivar 308 apex `/design-system` → `designsystem.alexendros.dev` **solo** tras curl producción con `data-ds-vitrina`.

## Notas T-07

- Dominio `designsystem.alexendros.dev` en proyecto **`alexendros-dev`** (Hobby), verified.
- Rewrite: host DS `/` y `/index.html` → `/design-system/`; en ese host `/design-system` → `/` (302).
- 308 apex → subdominio **retirado** de este PR hasta evidencia de body DS en producción (evita apuntar a home vacío de DS).
