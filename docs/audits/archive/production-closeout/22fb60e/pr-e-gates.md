# PR-E — Limpieza, consentimiento y rutas

Base: `origin/main` @ `22fb60e` (merge PR #109 / PR-A).

## Inventario de residuos (D-05)

| Residuo                          | Consumidor en main                | Acción PR-E                                     |
| -------------------------------- | --------------------------------- | ----------------------------------------------- |
| `LeadMagnet.astro`               | Ninguno (no montado)              | Retirado                                        |
| `/api/lead-magnet`               | Solo el componente anterior       | Retirado                                        |
| `/api/newsletter/*` + Resend     | Solo lead magnet / doble opt-in   | Retirado                                        |
| `doubleOptIn` / `resend` / `uqr` | Solo embudo retirado              | Retirado (+ lockfile)                           |
| `BookingOptions` + `qrSvg`       | Ninguno en rutas publicadas       | Retirado; Cal.com se conserva en ficha/contacto |
| `FigureHead.astro`               | Ninguno                           | Retirado                                        |
| `/servicios/web-para`            | Solo redirects en `vercel.json`   | Conservado (301→`/servicios`)                   |
| Cal.com                          | Ficha sesión + `contact.bookings` | Conservado                                      |

## Overflow / foco / solape

Reproducido sobre main post-PR-A: glass header, overflow-x a 320, tokens CMP y hero estable
ya cubiertos por PR-A (`critical.spec`, `home-grid-nav`). CMP vendor `--cc-z-index: 2147483647`
queda por encima de sticky CTA (`z-30`) y header (`z-50`); no se portó CSS adicional.

## Gates

| ID          | Resultado                                              | Nota                                                                  |
| ----------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| PRIV-01…05  | Cubiertos en `tests/e2e/consent.spec.ts`               | Matriz red; fixture CMP vía `webdriver=false` + IDs e2e en Playwright |
| COM-01      | Cubierto en `src/content/commercial-coherence.test.ts` | Copy/precios vigentes; sin fiscal/cancelación inventados              |
| COM-03      | **BLOCKED**                                            | Firma del mantenedor; `it.todo` explícito                             |
| ROUTE-01…04 | `tests/e2e/seo-routes.spec.ts`                         | Tres fichas en sitemap; noindex design-system; 404 slug; embudo 404   |
| SEC-01      | **BLOCKED**                                            | Sin URL de Preview autorizada en este ciclo; no se afirma PASS        |
| SEC-02      | Fuera de alcance PR-E                                  | Residual en `docs/threat-model.md`                                    |
