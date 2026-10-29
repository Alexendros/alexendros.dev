# Migración CMP nativa: resultados y comparación

Candidato: `3b7fc6ab4d91e97cdb709b59c25f47f3f6bd34eb` (`perf/cmp-native`).

## Alcance

Se sustituye el adaptador React del banner por `src/scripts/cookieBanner.ts`, inicializado una sola vez por documento desde `Layout.astro`. Se conservan `vanilla-cookieconsent`, cookie, revisión, categorías, textos, callbacks, loaders y eventos. React permanece en las islas que lo necesitan.

No cambian proveedores, semántica de consentimiento, CSP, catálogo ni formulario.

## Regresión de consentimiento y accesibilidad

- Contrato anterior: 16 pruebas de consentimiento superadas antes del cambio.
- Resultado final: **136/136 E2E**, incluidas las 17 pruebas CMP y una nueva prueba de fallo síncrono de inicialización.
- Axe: **12 rutas sin violaciones automatizadas**.
- Vitest: **215 pruebas superadas**.
- Preferencias válidas conservadas por nombre, estructura y revisión; no se borran cookies ajenas.
- Aceptación, rechazo, selección parcial, persistencia, retirada y apertura desde pie se mantienen.
- Un fallo de inicialización no marca el CMP listo ni activa integraciones ni errores no controlados.
- Se corrigió durante la revisión el nombre accesible de «Configurar» para conservar su identificación y destino.

Estas pruebas no cierran EST-07 ni la accesibilidad manual completa del sitio.

## JavaScript antes/después

Misma métrica de transferencia `resource-summary.script.size`, perfil móvil y tres repeticiones por ruta. Base `69cbd57` frente a candidato `3b7fc6a`; build de publicación sin IDs ficticios.

| Ruta                            | Antes (bytes) | Después (bytes) | Reducción | Presupuesto 61.440 | Informe                                                                                                                   |
| ------------------------------- | ------------: | --------------: | --------: | ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `/`                             |        85.395 |          14.243 |   −71.152 | Cumple             | [candidato](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793299943142-5670.report.html)  |
| `/servicios/`                   |       112.057 |         110.964 |    −1.093 | **Incumple**       | [candidato](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793299944441-69534.report.html) |
| `/servicios/informe-comercial/` |        85.395 |          14.243 |   −71.152 | Cumple             | [candidato](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793299945832-21813.report.html) |
| `/proyectos/`                   |        85.395 |          14.243 |   −71.152 | Cumple             | [candidato](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793299947524-25301.report.html) |
| `/proyectos/front-valencia/`    |        85.395 |          14.243 |   −71.152 | Cumple             | [candidato](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793299950043-84731.report.html) |
| `/metodo/`                      |        85.395 |          14.243 |   −71.152 | Cumple             | [candidato](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793299951332-62069.report.html) |
| `/contacto/`                    |       119.271 |         117.987 |    −1.284 | **Incumple**       | [candidato](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793299952841-42840.report.html) |

La base por ruta se conserva en `2026-10-29-lhci-pr148.md`. Los informes temporales pueden caducar.

## Desglose y conclusión

- El CMP ya no obliga a descargar el runtime React global. En las rutas informativas desaparecen `client.CLhIxG29.js` (66.642 bytes), `CookieBanner` y `react.DJY1zw8Z.js`; el layout nativo transfiere 12.233 bytes y los eventos 2.010 bytes.
- `/servicios/` mantiene 66.642 bytes de cliente React, 25.044 de runtime JSX, 3.420 de React y 1.615 del selector.
- `/contacto/` mantiene esos runtimes y 8.638 bytes del formulario.
- La corrección global está acreditada, pero **EST-04 sigue abierto** por `/servicios/` y `/contacto/`. Sus islas requieren trabajo técnico separado.
- LHCI se ejecutó completo: 21 mediciones. Solo `/servicios/` y `/contacto/` incumplen la assertion de JavaScript; los avisos LCP permanecen documentados y no se ocultan.
- EST-03 sigue pendiente para #152 hasta actualizar su base y medir el candidato editorial. No se usa esta mejora como excepción ni como aprobación editorial.
