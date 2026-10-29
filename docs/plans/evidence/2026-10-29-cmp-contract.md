# Contrato funcional del CMP antes de la migración nativa

Fecha de referencia: 2026-10-29.

## Referencia fijada antes del cambio

- Categorías: `necessary` activa y bloqueada; `preferences`, `analytics` y `marketing` opcionales y desactivadas por defecto.
- Cookie `consent_v1`, primera parte, `Lax`, ruta `/`, caducidad de 12 meses y revisión derivada de `PUBLIC_COOKIE_CONSENT_VERSION`.
- Estado espejo en `localStorage` mediante `writeConsent`, usado por loaders y eventos existentes.
- La estructura y finalidad no cambian: una elección válida se conserva; un rechazo no se convierte en aceptación.
- Los proveedores no se activan antes de la elección correspondiente y cada loader se ejecuta como máximo una vez por ciclo previsto.
- La apertura de preferencias usa los controles `data-cc="show-preferencesModal"`; el enlace «Configurar» del aviso lleva a `/cookies`.
- La retirada emite las desactivaciones previstas por cada integración; no se confunde con eliminar una etiqueta.
- No se añaden listeners de navegación: el sitio no usa un router cliente. La inicialización es única por documento.

## Referencia automatizada anterior

Antes de sustituir el adaptador React, `tests/e2e/consent.spec.ts` superó 16 pruebas: primera visita, aceptación, rechazo, selección parcial, carga positiva con IDs ficticios interceptados, persistencia, retirada, apertura desde pie, ausencia de datos de contacto en tracking y accesibilidad básica del panel.

Esas pruebas son el contrato de regresión de `perf/cmp-native`; no se eliminan ni se relajan para aceptar la migración.

## Compatibilidad y fallos

La migración conserva el nombre de cookie, revisión y estructura de categorías. No invalida elecciones ni borra cookies ajenas. Si la inicialización falla, no se marca `data-cmp-ready` y no se activan integraciones. Los errores síncronos y de promesa se capturan sin dejar errores no controlados.

La retirada sigue el contrato de `src/lib/tracking/loaders.ts`: actualizaciones de Consent Mode, `fbq revoke`, `posthog.opt_out_capturing`, consentimiento de Clarity y limpieza de LinkedIn. Las pruebas de red y eventos, no la presencia de una etiqueta, acreditan ese comportamiento.
