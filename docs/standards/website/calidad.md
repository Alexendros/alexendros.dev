# Estándar de calidad

### Propósito de este documento

- **Objetivos:** Declarar gates de calidad de este sitio y el mínimo de flota.
- **Estructura:** Jobs CI → cobertura → a11y/perf → lo que no se mide aquí.
- **Contenido a integrar según contexto:** Adapta umbrales de este portfolio Astro. No copies gates de CLI (tokens/DS) ni de un SaaS.

## Jobs (canon)

1. **quality** — tipos, lint, formato, CSS, cookies, registros, copy, clases y contraste
2. **test** — Vitest (`src/**/*.test.ts`, `scripts/**/*.test.ts`)
3. **build** — build, gate anti-importes, `check:links` y artefacto `.vercel/output/static`
4. **smoke** — `scripts/smoke.sh` (archivos + HTTP 200)
5. **e2e-critical** — always-on: home, contacto, consent deny-by-default
6. **csp / axe** — informe CSP y axe always-on
7. **secrets / sca / actionlint / zizmor** — seguridad y validación de workflows
8. **ci-gate** — agrega los checks obligatorios y falla si alguno no tiene éxito
9. **e2e / lhci** — opt-in: Playwright completo y Lighthouse móvil

## Cobertura

Mínimo de flota: **≥ 70 %** (statements/functions/lines; branches ≥ 70 %). Este repo **no** publica aún un gate de coverage en Vitest: los tests de contrato cubren schema, SMTP, handler, Cal HMAC y Notion mapper. No bajes tests existentes. Si se añade reporter, el umbral no debe quedar por debajo del mínimo de flota.

## Accesibilidad y rendimiento

Objetivos de producto (cuando corre e2e/LHCI o Speed Insights en prod):

- axe-core: 0 violaciones en las rutas CI
- Lighthouse móvil: perf ≥95, a11y/BP/SEO 100, CLS ≤0.05, LCP ≤2.5s
- LCP medido en torno a ~1.9s; objetivo de producto histórico &lt;1.65s en Speed Insights

El job `e2e` completo no bloquea PRs por defecto. Actívalo con label `e2e` o `workflow_dispatch` si el cambio toca UI, a11y o CWV. `e2e-critical` sí bloquea siempre.

## Residuos de auditoría web (decisión 0033)

Algunos checks de la matriz web-compliance no tienen sistema en este repo. Quedan cerrados así para no reabrirlos como PENDING sin dueño:

| Check                    | Cierre                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| TEC-06 CrUX/PSI de campo | Umbral de laboratorio = LHCI opt-in (label `e2e`). CrUX de campo no se consulta en CI.                                   |
| OFF-01 / OFF-03          | Sin herramienta de backlinks ni ficha de negocio local → N/A hasta que existan.                                          |
| ANA-02 paridad GA4↔Ads   | Sin campañas ni cuenta de anuncios → N/A (mismo criterio que el pilar SEM).                                              |
| ACC-11 HTML Validator    | Gate = axe CI + build Astro; sin validador W3C en quality.                                                               |
| ACC-12 / ACC-13 AT       | Gate = axe + e2e de formulario/CMP/teclado. Pasada con lector de pantalla: revisión manual trimestral, no fallo abierto. |

Titles y metas indexables: `src/content/seo.ts` (bandas 50–65 / 150–170) con test Vitest. Migas: `src/lib/breadcrumb.ts` en plantillas indexables salvo la portada. `/sobre-mi/` sigue noindex (decisión 0029); la autoría indexable vive en `/experiencia/`.
