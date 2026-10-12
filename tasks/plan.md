---
name: Corrección integral y coherencia comercial del sitio
overview: 'Plan aprobado 2026-10-12: bugs de renderizado, enlaces rotos, retirada del embudo huérfano, cookies, home con CTA, formulario de 1 paso y saneamiento visual.'
todos:
  - id: a1-superficies
    content: A1. Superficies translúcidas que sí compilan (header, StickyCta, swatch DS) + e2e RED.
    status: pending
  - id: a2-overflow
    content: A2. Sin overflow-x en home móvil + e2e RED.
    status: pending
  - id: a3-ctas-sectores
    content: A3. CTAs de sectores reales + formulario lee servicio/vertical de la URL.
    status: pending
  - id: b1-embudo
    content: B1. Eliminar lead magnet, doble opt-in, reserva QR y referencias.
    status: pending
  - id: b2-muerto
    content: B2. Eliminar FigureHead, ejes.ts, hero-slot-root, reduce-motion.
    status: pending
  - id: c1-cookie-ref
    content: C1. Documentar alexendros_ref en inventario y /cookies.
    status: pending
  - id: c2-cookie-linkedin
    content: C2. Completar cookies de LinkedIn en inventario y /cookies.
    status: pending
  - id: d1-home-cta
    content: D1. Párrafo que vende + botones Ver servicios/Contactar + decisión 0016.
    status: pending
  - id: e1-tests-form
    content: E1. Reescribir tests del flujo de contacto (RED).
    status: pending
  - id: e2-form-un-paso
    content: E2. Formulario de una pantalla (GREEN).
    status: pending
  - id: f1-foco
    content: F1. Un solo sistema de foco.
    status: pending
  - id: f2-legal
    content: F2. Estilos legales a @layer con tokens + fechas de actualización.
    status: pending
  - id: f3-cmp
    content: F3. Theming del CMP con tokens.
    status: pending
  - id: f4-contraste
    content: F4. Pares de contraste nuevos + ::selection + tracking token.
    status: pending
  - id: f5-poda
    content: F5. Poda de tokens, gutters unificados, landmark, nota interna, 404.
    status: pending
  - id: f6-theme-color
    content: F6. Test theme-color vs tokens.
    status: pending
  - id: g1-docs
    content: G1. Decisión 0016, diseno.md, AGENTS.md, tasks.
    status: pending
  - id: g2-cierre
    content: G2. Verificación integral + PR en borrador.
    status: pending
isProject: false
---

# Corrección integral y coherencia comercial del sitio

Plan aprobado el 2026-10-12. Fuente completa con hallazgos y evidencia: sesión del plan (forager-domino-sandman). Resumen operativo:

## Decisiones del operador (cerradas)

1. Home: cabecera + hero + pie (0014), con párrafo reescrito que diga qué se ofrece y dos botones («Ver servicios», «Contactar»). Sin secciones nuevas.
2. Metodología y Valores mantienen el aviso «EN DESARROLLO».
3. Se retira todo el embudo huérfano (lead magnet, doble opt-in, reserva QR, endpoints y helpers).
4. Contacto: de 6 pasos a 1 pantalla; honeypot, rate-limit, Turnstile y contrato de API intactos.

## Boundaries

- No se toca: importes ni su carácter provisional; aviso «EN DESARROLLO»; rotador del H1 (0015); CSP; `/api/contact`, `/api/cal/webhook`, `/api/csp-report`; `referral.ts` y `/r/[code]`; webhook Cal→Notion.
- Sin dependencias nuevas. Tokens de `global.css` única fuente de color. Motion solo transform/opacity. Tests primero (RED) en lógica y bugs visuales.
- Rama `cursor/correccion-integral-sitio`, commits en español, PR en borrador al final.

## Orden

A (A1 superficies, A2 overflow-x, A3 CTAs sectores + prefill URL) → B (retiradas) → C (cookies) → D (home CTA) → E (E1 tests RED, E2 formulario GREEN) → F (foco, legal, CMP, contraste, poda, theme-color) → G (docs + verificación integral + PR).

## Comandos de verificación

`pnpm typecheck` · `pnpm test` · `pnpm lint:css` · `pnpm check:contrast` · `pnpm check:copy` · `pnpm check:records` · `pnpm run audit:cookies` · `pnpm exec playwright test tests/e2e/home-grid-nav.spec.ts tests/e2e/contact.spec.ts tests/e2e/critical.spec.ts` · `pnpm lint:a11y` · `pnpm build`
