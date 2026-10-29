# Contrato de eventos propuesto (CIERRE-23)

No sustituye a ciegas los nombres actuales. Convención viva en `src/lib/tracking/events.ts`.

| Evento propuesto           | Punto de emisión                                      | Consentimiento                      | Atributos permitidos   |
| -------------------------- | ----------------------------------------------------- | ----------------------------------- | ---------------------- |
| `service_view`             | Ficha `/servicios/[slug]`                             | analytics                           | `slug`                 |
| `service_cta_click`        | CTA de ficha                                          | analytics                           | `slug`, `cta`          |
| `publication_view`         | Ficha publicación                                     | analytics                           | `slug`, `availability` |
| `configurator_start`       | Primer toggle                                         | analytics                           | —                      |
| `configurator_complete`    | Clic «Pedir propuesta»                                | analytics                           | `moduleCount` (entero) |
| `contact_start`            | Montaje ContactForm                                   | analytics                           | `motivo` (enum)        |
| `contact_step_complete`    | Continuar válido                                      | analytics                           | `step`                 |
| `contact_submit_attempt`   | Alias semántico de `form_submit` (antes de respuesta) | analytics                           | —                      |
| `contact_request_accepted` | Alias de `contact_form_success` (tras 2xx)            | analytics                           | —                      |
| `booking_outbound_click`   | Clic a Cal.com                                        | analytics                           | `offer`                |
| `booking_confirmed`        | Solo webhook Cal confirmado                           | servidor / marketing según política | `trigger`              |

## Distinciones obligatorias

- `form_submit` ≠ éxito. `contact_form_success` solo tras `200` + `status: accepted` (no replay).
- Meta estándar `Lead` solo en `contact_form_success`, nunca en el intento.
- Clic en reserva (`data-cal`) = `cal_click` (salida) ≠ reserva confirmada.
- Prohibido: nombre, email, teléfono, texto libre o IDs de alta cardinalidad innecesarios.
- Contexto comercial (`servicio` / `proyecto`) allowlisted en formulario y correo; no se emite en eventos.
