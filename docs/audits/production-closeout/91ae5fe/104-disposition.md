# Disposición del PR #104 (`cursor/correccion-integral-sitio`)

Baseline: `main` @ `91ae5fe` (merge PR #107).
Head #104: `203539b` (rama en conflicto con main; no se fusiona en bloque).
Fecha de clasificación: 2026-10-17.

## Criterio

Portar solo defectos que **aún se reproducen** en `91ae5fe` (CSS translúcido, overflow, foco, CMP). Preservar H1 estable (#105/#107), contacto endurecido y tarjetas de producto. No reintroducir rotador, lead magnet, newsletter, verticales ni `web-para`.

## Matriz por tema / archivo

| Tema / archivo(s)                                                                                        | Clasificación                   | Acción                                                                   |
| -------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| `src/styles/global.css` — `.glass-bg` / `.glass-card` / `.swatch-brand`                                  | útil pendiente                  | **Portado** (Tailwind v3 no emite `bg-*/N` sobre `var()`)                |
| `Header.astro` — `bg-bg/80` → `glass-bg`; CTA oculto `<360px`                                            | útil pendiente                  | **Portado**                                                              |
| `StickyCta.astro` — `bg-card/95` → `glass-card`; `focus-ring`                                            | útil pendiente                  | **Portado**                                                              |
| `design-system.astro` — `bg-primary/60` → `swatch-brand`                                                 | útil pendiente                  | **Portado**                                                              |
| `Hero.astro` — `overflow-hidden` (BlueprintMotif `-right-16`)                                            | útil pendiente                  | **Portado** (sin tocar H1/copy/CTAs estables)                            |
| `tests/e2e/critical.spec.ts` — alpha del header                                                          | útil pendiente                  | **Portado**                                                              |
| `tests/e2e/home-grid-nav.spec.ts` — F02 scroll-x                                                         | útil pendiente                  | **Portado** (F01/F03 de producto de #104 **descartados**)                |
| `Button.astro`, `PricingConfigurator.tsx`, `ContactForm.tsx` (solo clases de foco)                       | útil pendiente                  | **Portado** (anillo `.focus-ring`; multi-paso intacto)                   |
| `BlueprintMotif.astro`, `Dimension.astro`                                                                | útil pendiente                  | **Portado**                                                              |
| `--primary-ghost`, `::selection` color, pares `check-contrast`, Tailwind                                 | útil pendiente                  | **Portado** (28 pares = 14×2 temas)                                      |
| `#cc-main` tokens + foco CMP; `.legal-prose` unificado; quitar `<style>` de cookies/identidad/privacidad | útil pendiente                  | **Portado**                                                              |
| `Hero.astro` rotador / copy / CTA «Ver servicios» de #104                                                | cambio de producto / obsoleto   | **Descartado** — main ya tiene H1 estable (decisión 0016)                |
| `ContactForm.tsx` formulario de una pantalla / schema                                                    | cambio de producto / conflicto  | **Descartado** — contacto endurecido en #105; foco de hidratación → PR-B |
| `LeadMagnet`, `api/lead-magnet`, newsletter, `doubleOptIn`, `resend`, `qrSvg`, `uqr`                     | útil pendiente (limpieza)       | **Diferido a PR-E** — no se reintroduce; inventario y poda en PR-E       |
| `verticals.ts`, `web-para/*`, `BookingOptions`, `FigureHead`, `ejes`                                     | cambio de producto / obsoleto   | **Descartado / diferido** — no reintroducir; residuos en main → PR-E     |
| Inventario cookies LinkedIn / referidos en página e `docs/cookies-inventory.json`                        | útil pendiente (consentimiento) | **Diferido a PR-E**                                                      |
| Poda de tokens (`blue-500`, spaces, etc.) y gutters globales                                             | conflicto / colateral           | **Descartado** en PR-A                                                   |
| `themeColor.test.ts`, poda env Resend                                                                    | colateral #104                  | **Descartado**                                                           |
| Decisiones/eventos de #104 en `docs/audits/*`                                                            | conflicto                       | **No duplicar**; decisión `0017` (excepción portal) → PR-C / D-01        |
| `tasks/plan.md`, `tasks/todo.md` de #104                                                                 | obsoleto                        | **Descartado**                                                           |
| Integrado vía #105–#107 (H1, contacto accesible/idempotente parcial, fichas)                             | integrado                       | N/A — no reaplicar                                                       |

## BL-04

El diff portado **no** restaura rotador, lead magnet, newsletter, verticales ni `web-para`. El H1 estable y los CTAs del hero de `91ae5fe` se mantienen.

## Propuesta sobre el PR #104

**No cerrar #104 sin autorización explícita del mantenedor.**

Opciones recomendadas tras merge de este PR-A (y, si aplica, PR-E):

1. **Sustituir** el alcance de #104 por un comentario que apunte a esta matriz y a los PRs de cierre que absorben lo útil.
2. **Cerrar** #104 como superseded cuando el mantenedor confirme que no queda nada portátil (tras PR-E si aún hay residuos de embudo en `main`).
3. **No** intentar `merge`/`rebase` del head `203539b` sobre `main`: el conflicto es de producto, no solo de texto.

## Verificación local esperada (PR-A)

- `pnpm check:contrast`
- `pnpm lint:css`
- `pnpm typecheck` / `pnpm lint` / `pnpm test` según toque
- e2e crítico: aserción de header no transparente; F02 overflow (con build previo)
