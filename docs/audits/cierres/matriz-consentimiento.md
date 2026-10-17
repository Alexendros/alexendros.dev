# Matriz de solicitudes y consentimiento (CIERRE-21)

Inventario operativo a 2026-10-17. Verificar en producción con sesión limpia tras cada cambio de CMP.

| Integración                       | Finalidad              | Categoría CMP                 | Cliente / servidor | Estado                              | Notas                                                |
| --------------------------------- | ---------------------- | ----------------------------- | ------------------ | ----------------------------------- | ---------------------------------------------------- |
| `consent_v1`                      | Recordar decisión      | necessary                     | Cliente            | Activa                              | Inventario cookies                                   |
| `alexendros_ref`                  | Referidos              | necessary (técnica)           | Cliente            | Activa                              | 90 días                                              |
| Vercel Analytics / Speed Insights | Rendimiento plataforma | analytics                     | Cliente            | Solo builds Vercel + consentimiento | Carga vía `loadVercelPlatform()`; no HTML inicial    |
| GA4                               | Analítica              | analytics                     | Cliente            | Condicional a vars + consentimiento | Consent Mode v2 default denied                       |
| PostHog EU                        | Analítica producto     | analytics                     | Cliente            | Condicional                         | `opt_out_capturing` al revocar                       |
| Clarity                           | Sesión / UX            | analytics                     | Cliente            | Condicional                         | `clarity('consent', bool)`; SDK real P4 NOT_VERIFIED |
| Meta Pixel                        | Publicidad             | marketing (rótulo Publicidad) | Cliente            | Condicional                         | Lead solo en `contact_form_success`                  |
| Meta CAPI Lead (formulario)       | Publicidad             | marketing                     | Servidor           | **Desactivado**                     | Sin consentimiento de publicidad en el formulario    |
| Meta CAPI (Cal webhook)           | Conversiones reserva   | marketing / operación         | Servidor           | Condicional a vars                  | Revisar alineación legal                             |
| LinkedIn Insight                  | Publicidad             | marketing                     | Cliente            | Condicional                         | Partner id local limpiado; opt-out SDK NOT_VERIFIED  |
| GTM / metrics                     | Contenedor             | según etiquetas               | Cliente/servidor   | Condicional                         | Contenedor externo sin exportación: pendiente        |
| Turnstile                         | Antispam               | necessary / seguridad         | Cliente+servidor   | Si hay secret                       |                                                      |
| Notion leads                      | CRM interno            | operación (respuesta)         | Servidor           | Si hay token                        | `consentMarketing: false`                            |

## Distinciones de conversión

- `form_submit` = intento (no Lead).
- `contact_form_success` / Meta `Lead` = solo tras `200` + `status: accepted` y `replay !== true`.
- `accepted` = aceptación de aplicación/SMTP; no demuestra bandeja ni lectura.
- Clic Cal.com (`data-cal`) = `cal_click` (salida), no reserva confirmada.

## Pruebas mínimas

1. Primera visita sin decisión → sin etiquetas no esenciales ni `/_vercel/*`.
2. Rechazo → sin analytics/marketing.
3. Solo analítica → sin publicidad; con `__IS_VERCEL__` puede haber `/_vercel/*` stub.
4. Publicidad → etiquetas de marketing.
5. Revocación mismo documento y entre documentos.
6. Scripts bloqueados → contacto usable vía mailto.
