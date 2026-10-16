# Matriz de solicitudes y consentimiento (CIERRE-21)

Inventario operativo a 2026-10-16. Verificar en producción con sesión limpia tras cada cambio de CMP.

| Integración                       | Finalidad              | Categoría CMP                 | Cliente / servidor | Estado                              | Notas                                             |
| --------------------------------- | ---------------------- | ----------------------------- | ------------------ | ----------------------------------- | ------------------------------------------------- |
| `consent_v1`                      | Recordar decisión      | necessary                     | Cliente            | Activa                              | Inventario cookies                                |
| `alexendros_ref`                  | Referidos              | necessary (técnica)           | Cliente            | Activa                              | 90 días                                           |
| Vercel Analytics / Speed Insights | Rendimiento plataforma | n/a (`__IS_VERCEL__`)         | Cliente            | Solo builds Vercel                  | No en local/CI                                    |
| GA4                               | Analítica              | analytics                     | Cliente            | Condicional a vars + consentimiento |                                                   |
| PostHog EU                        | Analítica producto     | analytics                     | Cliente            | Condicional                         |                                                   |
| Clarity                           | Sesión / UX            | analytics                     | Cliente            | Condicional                         | Enmascarar campos sensibles                       |
| Meta Pixel                        | Publicidad             | marketing (rótulo Publicidad) | Cliente            | Condicional                         |                                                   |
| Meta CAPI Lead (formulario)       | Publicidad             | marketing                     | Servidor           | **Desactivado**                     | Sin consentimiento de publicidad en el formulario |
| Meta CAPI (Cal webhook)           | Conversiones reserva   | marketing / operación         | Servidor           | Condicional a vars                  | Revisar alineación legal                          |
| LinkedIn Insight                  | Publicidad             | marketing                     | Cliente            | Condicional                         |                                                   |
| GTM / metrics                     | Contenedor             | según etiquetas               | Cliente/servidor   | Condicional                         |                                                   |
| Turnstile                         | Antispam               | necessary / seguridad         | Cliente+servidor   | Si hay secret                       |                                                   |
| Notion leads                      | CRM interno            | operación (respuesta)         | Servidor           | Si hay token                        | `consentMarketing: false`                         |

## Pruebas mínimas

1. Primera visita sin decisión → sin etiquetas no esenciales.
2. Rechazo → sin analytics/marketing.
3. Solo analítica → sin publicidad.
4. Publicidad → etiquetas de marketing.
5. Revocación y nueva sesión.
6. Scripts bloqueados → contacto usable vía mailto.
