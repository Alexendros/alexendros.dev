# Inventario inicial de proveedores e integraciones

Fecha de revisión: 2026-10-29.

Estado: inventario técnico inicial basado en código y documentación. **No acredita configuración, contratos, regiones ni actividad real de cuentas.** No contiene valores de credenciales.

Responsable de completar la verificación: titular del servicio.

## Proveedores

| Proveedor                               | Finalidad y datos                                                         | Entorno                                | Estado verificado                                                                | Región / transferencias                                     | Acción necesaria                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Vercel (`alexendros-dev`)               | Alojamiento, funciones, previews y deployment; logs operativos            | Producción y preview                   | Código y proyecto documentados; **plan y configuración de cuenta pendientes**    | Pendiente de confirmar proyecto, regiones y subprocesadores | Confirmar plan compatible con actividad profesional, titularidad, Git link, límites, alertas y recuperación            |
| Vercel Analytics / Speed Insights       | Medición de navegación y rendimiento tras consentimiento de analítica     | Solo builds Vercel                     | Implementación presente; activación real pendiente                               | Pendiente                                                   | Confirmar activación y documentar datos/retención; mantener ausencia en local/CI                                       |
| Proton Mail (SMTP)                      | Envío de solicitudes: nombre, canal, email o teléfono, mensaje y contexto | Runtime producción/preview             | Implementación presente; entrega real no verificada                              | Pendiente de contrato y región                              | Acreditar SMTP, recepción, respuesta, `Reply-To`, conservación y borrado                                               |
| Upstash Redis                           | Rate limit e idempotencia; claves técnicas y estado temporal              | Runtime producción/preview             | Implementación presente; servicio y región pendientes                            | Pendiente de región y replicación                           | Confirmar base, región, TTL, acceso y procedimiento de borrado                                                         |
| Cloudflare Turnstile                    | Antispam; token y señales necesarias para validación                      | Build y runtime, condicionado a claves | Implementación condicionada; configuración desconocida                           | Pendiente                                                   | Confirmar si está activo; si lo está, dominios, proveedor, retención y accesibilidad                                   |
| Notion                                  | CRM de solicitudes y reservas; datos de contacto y contexto               | Runtime                                | Integración presente; base y permisos pendientes                                 | Pendiente de región y contrato                              | Confirmar base, campos reales, accesos, retención y borrado                                                            |
| Google Analytics 4 / Google Tag Manager | Analítica y medición tras consentimiento                                  | Build, condicionado a IDs              | Implementación autorizada; IDs reales desconocidos                               | Pendiente de región y transferencias                        | Confirmar actividad, IDs por nombre, propiedades y configuración; retirar si no existe                                 |
| GTM server-side                         | Transporte de medición mediante dominio propio                            | Runtime/configuración externa          | Protocolo documentado; despliegue no acreditado                                  | Pendiente                                                   | Confirmar si existe; no mantener dominio o CSP si está inactivo                                                        |
| Meta Pixel + Conversions API            | Publicidad y conversiones tras consentimiento/criterios del servidor      | Build y runtime                        | Implementación presente; IDs/token desconocidos                                  | Transferencias pendientes de evaluar                        | Confirmar actividad y base de tratamiento; revisar CAPI y datos enviados                                               |
| Microsoft Clarity                       | Analítica de comportamiento tras consentimiento                           | Build, condicionado a ID               | Implementación presente; ID desconocido                                          | Pendiente                                                   | Confirmar actividad, región y retención; retirar si no se usa                                                          |
| PostHog EU                              | Analítica tras consentimiento                                             | Build, condicionado a clave/host       | Implementación presente; proyecto desconocido                                    | EU declarada en configuración, pendiente de verificar       | Confirmar proyecto EU, datos y retención; retirar si no se usa                                                         |
| LinkedIn Insight                        | Publicidad tras consentimiento                                            | Build, condicionado a ID               | Implementación presente; ID desconocido                                          | Pendiente de transferencias                                 | Confirmar actividad y finalidad; retirar si no se usa                                                                  |
| Lighthouse CI temporary public storage  | Informes de rendimiento de pruebas                                        | Herramienta local/CI                   | Utilizado en evidencias LHCI                                                     | Servicio externo; revisión de URLs necesaria                | Usar solo builds y URLs públicas sin datos sensibles; conservar tabla si caducan informes                              |
| Resend / lead magnet                    | Integración retirada                                                      | Ninguno en runtime actual              | **Retirado del código; residuos documentales y variables candidatas a limpieza** | No aplica                                                   | Revisar dashboard y retirar variables `RESEND_API_KEY`, `EMAIL_FROM*`, `UNSUBSCRIBE_SECRET` si ya no tienen consumidor |

## Credenciales por referencia

Los nombres se inventarían en `.env.example` y `src/env.d.ts`; nunca se registran valores. Antes del cierre se debe exportar un inventario desde cada proveedor con nombre, entorno, propietario, finalidad y fecha de rotación, sin adjuntar contenido secreto.

`PUBLIC_GTM_SS_DOMAIN` figura como referencia/documentación y no tiene consumidor runtime confirmado. Su presencia debe revisarse al simplificar configuración y CSP.

## Datos legales y operativos pendientes

- Domicilio profesional completo y publicable.
- Condición profesional/mercantil y datos registrales aplicables.
- Público atendido y existencia de contratación a distancia con consumidores.
- Plan real de Vercel y compatibilidad con la actividad profesional.
- Titulares, accesos, MFA y recuperación de cada cuenta.
- Regiones, encargados, subencargados y transferencias internacionales.
- Contratos/DPA y condiciones aplicables, conservados fuera del repositorio público.
- Plazos de conservación y borrado por sistema.
- Canales de contacto: WhatsApp y teléfono retirados del formulario; solo correo electrónico.
- Base jurídica por finalidad y textos de privacidad correspondientes.
- IDs y estado real de analítica, publicidad, Turnstile y Notion.

La ausencia de estos datos mantiene EST-05 y EST-06 abiertos. No se sustituyen por suposiciones ni marcadores públicos.
