# Resultados — corrección de UI, CSS y diseño (2026-11-02)

Rama: `design/2026-11-02-ui-css`. Verificación local sobre build estático; sin push ni merge.
Evidencias: [`baseline/`](baseline/README.md).

## Estado por hallazgo

| ID   | Estado                  | Evidencia                                                                                                                                                                                     |
| ---- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U-01 | Cerrado                 | Nota interna y `scripts/build-cv-pdf` fuera de `/experiencia/`; CV retirado; párrafos unificados; OG propia; `check:leaks` en build y CI                                                      |
| U-02 | Cerrado sin reescritura | Un único `Layout.astro`, `#main`, `trailingSlash: 'always'`; producción 200 con barra; `chrome.spec.ts` 8/8                                                                                   |
| U-03 | Cerrado                 | Home delgada sin formulario ni FAQ; FAQ en `/servicios/`; formulario solo en `/contacto/`                                                                                                     |
| U-04 | Cerrado                 | `commitments.ts` como fuente única; sin «Acordado»; «día laborable» 1 vez en home                                                                                                             |
| U-05 | Cerrado                 | `Icon.astro`; sin glifos; menú móvil por debajo de `md`; tema con `data-theme`, meta y `theme-init.js`; teclado probado                                                                       |
| U-06 | Cerrado                 | Dos referencias con captura en home; cuatro con imagen en `/referencias/`; filtro `aria-pressed`; diálogo 10/10                                                                               |
| U-07 | Cerrado                 | «Punto de partida / Qué se hizo / Resultado»; sin viñetas duplicadas; «Ficha técnica» plegada; tecnologías sin herramientas internas; URL de Vercel confirmadas para Front y Nasve            |
| U-08 | Cerrado                 | 5–7 tamaños computados por página; `--measure: 66ch`; `text-wrap`; `.tnum`; `text-step-*`                                                                                                     |
| U-09 | Cerrado                 | `alexlight`/`alexdark` en `color-scheme` y tokens; meta `theme-color` sincronizada; `forced-colors`; contraste OK                                                                             |
| U-10 | Cerrado                 | Honeypot `inert`; «otra necesidad» condicional; un solo enlace de privacidad; `:user-invalid`; `<noscript>` + fallback si el script no hidrata                                                |
| U-11 | Cerrado sin rehacer     | `<details name="faq">` nativo, movido a `/servicios/`; prueba de 5 elementos y teclado                                                                                                        |
| U-12 | Cerrado                 | No existía animación de terminal; se retiró `cursor-blink` muerto; sin movimiento con `reduce`                                                                                                |
| U-13 | Cerrado                 | CSS total 23,6 KB gzip (antes 31,1); daisyUI sin componentes no usados; LHCI 99–100 rendimiento                                                                                               |
| U-14 | Cerrado                 | `scroll-padding-top`, `:target` con `scroll-margin`, `main:focus`, `#top`; ancla bajo cabecera probada                                                                                        |
| U-15 | Cerrado                 | OG 1200×630 en home, servicios, referencias, método, contacto y experiencia; `apple-touch-icon` 180×180; sin `proceso-y-entrega`                                                              |
| U-16 | Cerrado                 | «Tienda en internet», «posicionamiento» y «herramienta a medida» en copy comercial; formulario impersonal; `diseno.md` actualizado; excepciones: slug/URL `software-a-medida` y URL de Vercel |

## Verificación

| Comando                | Resultado                                                                  |
| ---------------------- | -------------------------------------------------------------------------- |
| `pnpm typecheck`       | OK                                                                         |
| `pnpm lint`            | OK                                                                         |
| `pnpm test`            | 180/180                                                                    |
| `pnpm test:contract`   | 77/77                                                                      |
| `pnpm lint:css`        | OK                                                                         |
| `pnpm format:check`    | OK                                                                         |
| `pnpm check:copy`      | OK                                                                         |
| `pnpm check:classes`   | OK                                                                         |
| `pnpm check:records`   | 28 decisiones, 21 eventos                                                  |
| `pnpm audit:cookies`   | 10 cookies, sin terceros fuera de inventario                               |
| `pnpm check:contrast`  | OK en ambos temas                                                          |
| `pnpm build`           | OK, incluido `check:leaks`                                                 |
| `pnpm check:links`     | 62 enlaces, 0 errores                                                      |
| `pnpm smoke`           | 5 rutas 200, sin trackers estáticos                                        |
| `pnpm test:e2e`        | 149/149                                                                    |
| `pnpm lhci`            | OK; 99–100 rendimiento, 100 a11y/BP/SEO                                    |
| `audit:css`            | 0 `transition: all`; 5–7 tamaños; 0 color fuera de token salvo mezcla alfa |
| `ui-audit`             | 128 combinaciones, 0 axe, 0 CLS, 0 overflow, 0 objetivos pequeños          |
| `dialog-a11y`          | 10/10                                                                      |
| `check-internal-links` | 23 páginas, 574 enlaces, 0 errores, 0 avisos                               |

## Decisiones y descartes

- Se confirma la URL de producción de Front Valencia y Gráficas Nasve en Vercel. **No se usa
  `frontvalencia.com`.**
- Se descarta reescribir plantillas o URLs: el problema descrito no era reproducible.
- Se descarta un `ds-lint.sh` paralelo: se amplían Stylelint, `check:leaks` y `audit:css`.
- Se descarta rehacer el selector de tema, el menú móvil o la FAQ: ya existían y funcionaban.
- El formulario conserva el contrato API, idempotencia y pruebas de contacto.
- La portada sigue usando daisyUI; se redujo el CSS excluyendo componentes no usados, no se
  retiró la librería.

## Pendiente fuera de esta rama

- Revisión visual humana final y despliegue de Preview/Producción.
- Sustituir el CV cuando exista el definitivo; el botón se retiró.
- Revisión editorial independiente del copy, si el mantenedor la considera necesaria.
- Commits, push y PR: no realizados por indicación del contrato operativo.
