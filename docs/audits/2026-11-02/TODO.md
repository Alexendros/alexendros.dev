# Tareas — UI, CSS y diseño (2026-11-02)

Cada tarea se considera cerrada solo con su verificación. No hay commits ni push sin pedirlo.

## C0 — Arnés

- [ ] C0.1 `scripts/audit/css-runtime.mjs` y script `audit:css`.
- [ ] C0.2 `scripts/audit/check-leaks.sh` y script `check:leaks`.
- [ ] C0.3 Baseline: build, CSS gzip, LHCI, `ui-audit`, `dialog-a11y`, `check:links`.
- [ ] C0.4 Evidencias en `docs/audits/2026-11-02/baseline/`.

## C1 — Plantilla y URLs

- [ ] C1.1 `tests/e2e/chrome.spec.ts` con 7 rutas, canonical, skip-link y `#main`.
- [ ] C1.2 `:target` con `scroll-margin-top`; foco de `main` sin outline.
- [ ] C1.3 Comprobar 0 redirecciones internas y 0 `#contenido`.

## C2 — Experiencia

- [ ] C2.1 Retirar nota interna y comentario de `referralCodes.ts`.
- [ ] C2.2 Unificar `profile.summary`/`profile.title`; retirar CV.
- [ ] C2.3 OG `experiencia.png` y `ogImage` en la página.
- [ ] C2.4 `check:leaks` en `quality` y `build`.

## C4 — Controles

- [ ] C4.1 `Icon.astro` con menu/close/arrow-left/arrow-right/theme.
- [ ] C4.2 Sustituir glifos en Header, Link, tarjetas y migas.
- [ ] C4.3 Menú móvil y tema: conservar semántica, ocultar botón en desktop.
- [ ] C4.4 FAQ nativa y caret finito o retirado.
- [ ] C4.5 E2E de teclado, `aria-*` y `reducedMotion`.

## C6 — Fichas

- [ ] C6.1 Estructura única y sin duplicar `highlights`.
- [ ] C6.2 Tercera persona y «Ficha técnica» plegada.
- [ ] C6.3 Tecnologías sin herramientas internas; enlaces con nombre accesible.
- [ ] C6.4 Enlaces: conservar las URL de Vercel de Front y Nasve; no usar `frontvalencia.com`.

## C3 — Portada

- [ ] C3.1 `commitments.ts` + `Commitments.astro`.
- [ ] C3.2 Hero sin mockup ni lista duplicada.
- [ ] C3.3 Home: Hero + compromisos + servicios + 2 referencias + método + CTA.
- [ ] C3.4 FAQ a `/servicios`; formulario solo en `/contacto`.
- [ ] C3.5 Referencias con `ProjectCard`/imagen; filtro en `/referencias`.
- [ ] C3.6 Actualizar tests de home y `process-page`.

## C5 — Formulario

- [ ] C5.1 Honeypot `inert`.
- [ ] C5.2 «Otra necesidad» condicional y `aria-expanded`.
- [ ] C5.3 Un solo enlace de privacidad; solo `<noscript>`.
- [ ] C5.4 Estados `:user-invalid`, foco y resumen.
- [ ] C5.5 `test:contract` y axe.

## C7 — Sistema visual

- [ ] C7.1 Escala `--step-*` en títulos; `.tnum`; `--measure`.
- [ ] C7.2 `data-theme` `alexlight`/`alexdark`; `color-scheme`; meta `theme-color`.
- [ ] C7.3 `forced-colors`; foco único.
- [ ] C7.4 OG por ruta; `metodo.png`; retirar `proceso-y-entrega`.
- [ ] C7.5 CSS gzip, `audit:css`, LHCI; decisión de presupuesto.

## C8 — Microcopy y documentación

- [ ] C8.1 «Tienda online» → «Tienda en internet»; «SEO» en copy comercial.
- [ ] C8.2 Formulario en impersonal.
- [ ] C8.3 `diseno.md` alineado con el código.
- [ ] C8.4 Excepciones de jerga registradas.

## C9 — Cierre

- [ ] C9.1 Typecheck, lint, test, lint:css, format, build, links, smoke.
- [ ] C9.2 E2E, axe, contraste, records, copy, classes, cookies, pricing.
- [ ] C9.3 `RESULTADOS.md` con antes/después y descartes.
