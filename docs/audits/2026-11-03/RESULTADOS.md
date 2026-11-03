# Auditoría 2026-11-03 — Resultados de evidencia con navegador

Fecha de ejecución: 2026-11-03 (rama `fix/auditoria-2026-11-03`, build limpio sin trackers de e2e).

Veredicto: **todo en verde**. Sin violaciones axe, sin errores de consola ni peticiones fallidas, sin enlaces rotos y con Lighthouse 100 en las cuatro categorías en la muestra móvil.

## Axe por ruta y tema

Fuente: `scripts/audit/ui-audit.mjs` (16 rutas × 2 temas × 4 viewports = 128 combinaciones) + `pnpm test:e2e` (suite completa, 150 tests en Chromium).

| Ruta                                  | Claro         | Oscuro        |
| ------------------------------------- | ------------- | ------------- |
| `/`                                   | 0 violaciones | 0 violaciones |
| `/servicios`                          | 0             | 0             |
| `/servicios/software-a-medida`        | 0             | 0             |
| `/servicios/informe-comercial`        | 0             | 0             |
| `/referencias`                        | 0             | 0             |
| `/referencias/front-valencia`         | 0             | 0             |
| `/referencias/graficas-nasve`         | 0             | 0             |
| `/referencias/zedazo`                 | 0             | 0             |
| `/referencias/alexendros-me`          | 0             | 0             |
| `/metodo`                             | 0             | 0             |
| `/contacto?motivo=propuestaComercial` | 0             | 0             |
| `/experiencia`                        | 0             | 0             |
| `/identidad`                          | 0             | 0             |
| `/privacidad`                         | 0             | 0             |
| `/cookies`                            | 0             | 0             |
| `/accesibilidad`                      | 0             | 0             |

Tags evaluados: `wcag2a`, `wcag2aa`, `wcag22aa`, `best-practice`.

## Lighthouse móvil (LHCI)

Fuente: `pnpm lhci` — móvil 360×640, 3 ejecuciones por URL, mediana.

| Ruta                            | Perf | A11y | BP  | SEO | LCP    | CLS   |
| ------------------------------- | ---- | ---- | --- | --- | ------ | ----- |
| `/`                             | 100  | 100  | 100 | 100 | 1.73 s | 0.000 |
| `/servicios/informe-comercial/` | 100  | 100  | 100 | 100 | 1.50 s | 0.000 |
| `/referencias/front-valencia/`  | 100  | 100  | 100 | 100 | 1.65 s | 0.000 |
| `/experiencia/`                 | 100  | 100  | 100 | 100 | 1.50 s | 0.000 |
| `/privacidad/`                  | 100  | 100  | 100 | 100 | 1.50 s | 0.000 |

## Navegadores

- **Chromium**: ejercitado por toda la evidencia (e2e, ui-audit, dialog-a11y, audit:css, lhci).
- **Firefox y WebKit**: descargados vía `playwright install`, pero no ejercitados: los scripts de auditoría usan Chromium. WebKit requiere dependencias de sistema (`libicu74`, `libxml2`, `libflite1`) no instaladas en la máquina.

## Otros controles

- **Enlaces internos** (`check-internal-links.mjs`): 23 páginas, 574 enlaces, 0 errores, 0 avisos.
- **Diálogo de fichas** (`dialog-a11y.mjs`): 10/10 comprobaciones correctas (apertura, foco, nombre accesible, pushState, bloqueo de scroll, Tab confinado, Esc, retorno de foco, atrás del navegador).
- **Matriz UI** (`ui-audit.mjs`): 0 errores de consola, 0 peticiones fallidas, 0 imágenes rotas o sin `alt`, 0 imágenes sin dimensiones, 0 objetivos táctiles pequeños, 0 nombres de enlace duplicados, 0 `id` duplicados, 0 desborde horizontal, CLS máximo 0.
- **CSS en ejecución** (`audit:css`): sin `transition: all`; colores de fondo 100% en token. Una observación menor: en `/contacto/` hay un color de texto fuera de token (`oklab(.../0.6)`, texto atenuado). No bloqueante y no forma parte del alcance de esta auditoría.

## No verificado (manual)

- Lector de pantalla: no verificado (manual).
- Alto contraste: no verificado (manual).
- Zoom (200–400 %): no verificado (manual).

## Declaración de accesibilidad

No se edita (decisión D5): se conserva la evidencia de 16 rutas.
