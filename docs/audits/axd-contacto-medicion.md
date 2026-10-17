# Checkpoint — AXD contacto / medición / UI / a11y

```text
Checkpoint: CP-00…CP-09 (+ publish A–D+CP-08)
Estado: CP-08/09 listos para PR; A–D+CP-08 en main @ 9a3cdf0 (v1.24.10)
SHA base merge A–D+CP-08: 9a3cdf0ca0817f2126250795b510943bb2a16bc9
Rama CP-09: cursor/cp09-a11y-ux
```

## Paquetes A–D (merged #121)

- Lead solo tras `accepted` no-replay; mailto hasta hidratación; Vercel gated; revocación mismo documento; contexto `servicio`/`proyecto`.
- Catálogo con límites; portfolio `workKind`/`availability`; CMP neutro.

## CP-08 — matriz UI (merged #121)

- e2e `tests/e2e/ui-matrix.spec.ts`: viewports 320/390/768/1280 × claro/oscuro × motion; CMP/sticky; contacto/servicios 320.
- Hardening tipográfico/layout en fichas de proyecto (`min-w-0`, `text-pretty`, cover recortada).
- CI: `e2e-critical` construye con `E2E_TRACKER_ENV` (no reutiliza artefacto prod sin IDs).

## CP-09 — UX / teclado / a11y (este cierre)

### Defecto corregido

- Menú móvil: Escape en captura de documento cierra el menú y recupera el foco en el botón; evita que el CMP robe el Escape.

### Automatización bloqueante

- `tests/e2e/cp09-a11y-ux.spec.ts`: landmarks/H1, menú teclado, CMP teclado, contacto aria-invalid+axe, recorridos A–D muestreo, reflow 320, zoom 200 %, axe post-rechazo.
- `tests/e2e/a11y.spec.ts`: rutas ampliadas (auditoría, cookies, privacidad).
- Job `e2e-critical` incluye `cp09-a11y-ux` + `skip-link`.

### Límites

- No se declara conformidad WCAG completa.
- Lector de pantalla real: **NOT_VERIFIED**.
- Recorridos F–I (timeouts form, fallo parcial hidratación exhaustivo) cubiertos en parte por `contact.spec` / `consent.spec` previos; no se reabren aquí.

## CP-13 residual (lectura segura producción)

- `https://alexendros.dev/` /contacto /servicios → HTTP 200; ruta inexistente → 404.
- Sin marcadores de IDs e2e (`G-E2E`, `GTM-E2E`, etc.) en HTML de home (muestreo).
- Deploy post-merge A–D+CP-08 verificado a nivel HTTP; SMTP real sigue NOT_VERIFIED.

## Pruebas (CP-09 local)

| Comando                            | Resultado         |
| ---------------------------------- | ----------------- |
| Playwright cp09 + skip-link + a11y | PASS 28/28        |
| typecheck / vitest / lint:css      | (gate pre-commit) |

## Hallazgos

| ID                         | Estado                                       |
| -------------------------- | -------------------------------------------- |
| AXD-001…012                | corregido en main (v1.24.10)                 |
| CP-08                      | PASS (merged)                                |
| CP-09                      | PASS parcial (automatizado; SR NOT_VERIFIED) |
| CP-10 SEO edge             | pendiente                                    |
| CP-11 LHCI / SEM           | pendiente                                    |
| CP-12/13 publish A–D+CP-08 | PASS (merge + release + lectura HTTP)        |

## NOT_VERIFIED

SMTP real, SDK Clarity/LinkedIn opt-out en runtime real, GTM externo export, lector de pantalla, SEO edge aliases, Lighthouse ×3, SEM con datos reales.
