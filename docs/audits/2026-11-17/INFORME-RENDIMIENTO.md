# Informe de rendimiento — alexendros.dev

**Fecha:** 2026-11-17  
**Alcance:** Core Web Vitals, Lighthouse 12 (LHCI móvil), caché HTTP/CDN, renderizado  
**Método:** campo (`curl` producción) + laboratorio (`pnpm lhci`, 3 pasadas/URL)

Evidencia: [`lighthouse-summary.json`](./lighthouse-summary.json) (post-remediación).  
Umbrales: [`lighthouserc.json`](../../../lighthouserc.json).

## Estado tras remediación

Todas las aserciones LHCI pasan (0 avisos, 0 errores) en **7 URLs × 3 pasadas**, incluido `/contacto/` y `/metodologia/`.

| Métrica           | Antes (lab)    | Después (lab)      |
| ----------------- | -------------- | ------------------ |
| Perf portada      | 98             | **100**            |
| LCP portada       | 2032 ms (WARN) | **1582 ms** (PASS) |
| FCP portada       | 1807 ms        | **1132 ms**        |
| Fuentes / página  | 81,5 KB        | **40,8 KB**        |
| Requests portada  | 15             | **10**             |
| Hojas CSS en HTML | 5              | **2**              |
| Gate LCP ≤ 2000   | WARN           | **PASS**           |

Verificación de `Cache-Control` immutable en producción: **pendiente de deploy** (cambio en [`vercel.json`](../../../vercel.json) + test de orden). CrUX/PSI field sigue `not_applicable` (cuota API).

## Remediaciones aplicadas

| Hallazgo                                     | Solución durable                                                       | Dónde                                                                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `/_astro` sin `immutable` (catch-all pisaba) | Reglas de assets **después** del catch-all; test de regresión de orden | [`vercel.json`](../../../vercel.json), [`securityHeaders.test.ts`](../../../src/lib/securityHeaders.test.ts)           |
| Space Grotesk sin preload (LCP texto)        | Preload de latin 700 junto a Plus Jakarta                              | [`Layout.astro`](../../../src/layouts/Layout.astro)                                                                    |
| `theme-init.js` request bloqueante           | Script inline desde `?raw` (sin request de red)                        | [`Layout.astro`](../../../src/layouts/Layout.astro), [`src/scripts/theme-init.js`](../../../src/scripts/theme-init.js) |
| `/layer-order.css` hoja extra                | `@layer` en `<style is:inline>`                                        | [`Layout.astro`](../../../src/layouts/Layout.astro)                                                                    |
| JetBrains Mono ~40 KB en crítico             | Mono de sistema; dependencia eliminada                                 | [`global.css`](../../../src/styles/global.css), `package.json`                                                         |
| Space Grotesk 500 sin uso LCP                | Solo cara 700                                                          | [`global.css`](../../../src/styles/global.css)                                                                         |
| Cascada de CSS render-blocking               | `vite.build.cssCodeSplit: false`                                       | [`astro.config.mjs`](../../../astro.config.mjs)                                                                        |
| Imagen LCP en fichas                         | `fetchpriority="high"` en cover                                        | [`referencias/[slug].astro`](../../../src/pages/referencias/[slug].astro)                                              |
| Nav fuera de LHCI                            | Añadir `/contacto/` y `/metodologia/`                                  | [`lighthouserc.json`](../../../lighthouserc.json)                                                                      |

Contrato de tipografía actualizado en [`docs/standards/website/diseno.md`](../../standards/website/diseno.md).

## Semáforo (post-remediación, lab)

| Métrica                 | Valor                 | Umbral             | Semáforo         | Gate LHCI |
| ----------------------- | --------------------- | ------------------ | ---------------- | --------- |
| Performance (todas)     | 100                   | ≥ 95               | Verde            | PASS      |
| A11y / BP / SEO         | 100                   | = 100              | Verde            | PASS      |
| LCP (rango)             | 1505–1654 ms          | aviso ≤ 2000       | Verde            | PASS      |
| CLS                     | ≈ 0                   | ≤ 0,02             | Verde            | PASS      |
| TBT                     | 0 ms                  | ≤ 150              | Verde            | PASS      |
| JS / CSS / total        | dentro de presupuesto | 60 / 25,6 / 350 KB | Verde            | PASS      |
| Cache `/_astro` en prod | no medido tras cambio | immutable 1 año    | Pendiente deploy | —         |
| CrUX / PSI              | —                     | —                  | `not_applicable` | —         |

## Laboratorio (detalle)

| URL                             | Perf | LCP ms | FCP ms | Fonts   | Total  | Requests |
| ------------------------------- | ---- | ------ | ------ | ------- | ------ | -------- |
| `/`                             | 100  | 1582   | 1132   | 40,8 KB | 116 KB | 10       |
| `/servicios/software-a-medida/` | 100  | 1507   | 1130   | 40,8 KB | 79 KB  | 8        |
| `/referencias/front-valencia/`  | 100  | 1506   | 1134   | 40,8 KB | 99 KB  | 9        |
| `/metodologia/`                 | 100  | 1505   | 1130   | 40,8 KB | 78 KB  | 8        |
| `/contacto/`                    | 100  | 1654   | 1355   | 40,8 KB | 109 KB | 9        |
| `/experiencia/`                 | 100  | 1506   | 1130   | 40,8 KB | 78 KB  | 8        |
| `/privacidad/`                  | 100  | 1506   | 1130   | 40,8 KB | 78 KB  | 8        |

Informe mediano portada: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1794947611474-77086.report.html

## Campo (pre-remediación; revalidar tras deploy)

- TTFB HIT ~200–280 ms; HTML/CSS/JS con Brotli; política HTML `s-maxage=60, stale-while-revalidate=600`.
- Antes del fix, `/_astro/*` recibía la misma política corta. Tras merge a producción, comprobar con `curl -sI https://alexendros.dev/_astro/<asset>`.

## Hipótesis originales

| Hipótesis                           | Tras fix                                    |
| ----------------------------------- | ------------------------------------------- |
| Preload solo Jakarta; Grotesk tarde | Resuelta: preload dual                      |
| `.rise` del H1 = LCP                | Descartada (LCP = marca header); sin cambio |
| `theme-init.js` bloqueante          | Resuelta: inline                            |
| `layer-order.css` extra             | Resuelta: inline                            |

## Pendiente (fuera de código o post-deploy)

1. Confirmar cabeceras immutable en apex tras el deploy.
2. Repetir PSI/CrUX cuando haya cuota (field manda si discrepa).
3. Medir INP con consentimiento de analítica/publicidad concedido (lab sigue sin third-parties).

## Límites

Compliance legal y a11y profunda → `web-compliance`. Lab sin etiquetas de marketing (sin consentimiento).
