# Formulario nativo: contrato y presupuesto

Candidato: `e124931bf184ba808ed43f826856f9b46c048e6b` (`perf/contact-native`).

## Contrato conservado

- Campos, IDs, validación Zod, errores por campo, resumen y foco.
- Contexto de motivo, servicio, proyecto, origen y módulos normalizados.
- Payload API sin cambios, honeypot, Turnstile y timeout de 25 segundos.
- Clave de idempotencia estable para el mismo payload lógico.
- Estados `accepted`, `processing`, `conflict`, `retryable_failure` y `unknown`.
- `form_submit` por intento y `contact_form_success` solo tras aceptación sin replay.
- Datos conservados tras errores y alternativa `mailto:` hasta inicialización efectiva.

## Regresión y correcciones revisadas

- 17 pruebas específicas de contacto superadas, incluidos canales, errores, idempotencia, contexto hostil y ausencia de JavaScript.
- E2E completo: **136/136**.
- Axe: **12 rutas sin violaciones automatizadas**.
- Contrato API: **117 pruebas superadas**.
- Vitest total: **215 pruebas superadas**.
- Se ajustaron durante la revisión: éxito solo cuando existe aceptación, limpieza de estados anteriores y ausencia real del resumen de módulos cuando no hay selección.

## Rendimiento

Antes, con selector React: `/contacto/` transfería 117.842 bytes. Después: **46.069 bytes**, dentro del presupuesto de 61.440.

Desglose candidato:

- `portalModules`: 24.712 bytes.
- Layout nativo: 12.244 bytes.
- Controlador del formulario: 7.103 bytes.
- Eventos: 2.010 bytes.
- No se descargan `client`, `jsx-runtime` ni `react` en esta ruta.

[Informe LHCI de `/contacto/`](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793302517142-62802.report.html), mediana de tres ejecuciones sobre build de publicación.

Las siete rutas configuradas superan LHCI sin assertions de error. Los avisos de LCP se revisan por separado. Esta medición debe repetirse sobre el candidato editorial y sobre el ship final.
