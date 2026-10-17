# Checkpoint — paquetes A y B (contacto, consentimiento, contexto)

```text
Checkpoint: CP-00…CP-05 (alcance A+B) + gates locales parciales
Estado: READY_LOCAL (escrituras externas NO autorizadas)
SHA base: a3c7a689c55013573655ac53a887e37c74e42269 (origin/main)
SHA candidato: de95e96797b82e2e6f4032a35b7280535874d1be
Objetivo y alcance autorizado: paquetes A y B; rama cursor/contacto-medicion; sin push/PR
```

## Cambios realizados

- **AXD-001:** `form_submit` ya no emite Meta Lead; Lead solo en `contact_form_success` tras `200` + `status: accepted` y `replay !== true`.
- **AXD-005:** aviso mailto permanece hasta `data-contact-hydrated`; no se oculta con script inline previo.
- **AXD-002:** Vercel Analytics/Speed Insights dejan de montarse en HTML; `loadVercelPlatform()` tras consentimiento analytics y `__IS_VERCEL__`.
- **AXD-003:** revocación mismo documento: gtag denied, fbq revoke, posthog `opt_out_capturing`, clarity `consent false`; LinkedIn partner id local limpiado.
- **AXD-006 / AXD-010:** query `servicio`/`proyecto` allowlisted; CTAs de ficha; `data-cal` + `cal_click` en reserva; sin PII en eventos.

## Pruebas ejecutadas

| Comando                                                                                      | Resultado           |
| -------------------------------------------------------------------------------------------- | ------------------- |
| `fnm use 22 && pnpm run typecheck`                                                           | PASS                |
| `pnpm run lint`                                                                              | PASS                |
| `pnpm run format:check`                                                                      | PASS                |
| `pnpm run lint:css`                                                                          | PASS                |
| `pnpm run check:records`                                                                     | PASS                |
| `pnpm run audit:cookies`                                                                     | PASS                |
| `pnpm run check:copy`                                                                        | PASS                |
| `pnpm run test`                                                                              | PASS (196 + 1 todo) |
| `pnpm run build`                                                                             | PASS                |
| Playwright contacto+consent+critical+safe-network (build e2e con `VERCEL=1` + IDs ficticios) | PASS 40/40          |

Node: 22.23.3. Playwright: 1.63.0. Navegador: Chromium headless shell 153.

## Hallazgos

| ID                               | Estado                                                               |
| -------------------------------- | -------------------------------------------------------------------- |
| AXD-001                          | corregido (local)                                                    |
| AXD-002                          | corregido (local; P2 stub)                                           |
| AXD-003                          | corregido (comandos cliente); SDK real Clarity/LinkedIn NOT_VERIFIED |
| AXD-005                          | corregido (local)                                                    |
| AXD-006                          | corregido (local)                                                    |
| AXD-010                          | corregido (local; sin form_start/form_step nuevos)                   |
| AXD-004, 007, 008, 009, 011, 012 | abiertos (fuera de alcance A+B)                                      |

## Qué no se ha comprobado

- SMTP real, Notion, CAPI Graph, preview Vercel del SHA, producción (P3/P4).
- Contenedor GTM externo (sin exportación).
- Opt-out interno del SDK real de Clarity/LinkedIn tras carga completa.
- Correspondencia SHA–producción.

## Riesgos y reversión

- Revertir el commit de esta rama. Sin escrituras remotas en este cierre.
- Builds e2e usan `VERCEL=1` solo en el webServer de Playwright; producción sigue gated por plataforma + consentimiento.

## Decisión requerida

- Autorización separada para push/PR/preview.
- Política jurídica definitiva de Vercel Analytics (código aplica analytics + consentimiento).
- Paquetes C/D (catálogo, portfolio, tono CMP) cuando el propietario apruebe copy/condiciones.

## Siguiente checkpoint permitido

CP-06+ tras autorización de alcance comercial, o CP-12 preview tras autorización de push/PR.
