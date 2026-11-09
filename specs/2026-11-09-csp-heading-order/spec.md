# Spec — Colector CSP sin redirect y jerarquía semántica de metodología

**Fecha:** 2026-11-09

**Estado:** implementación y verificación local completadas; producción pendiente

**Origen:** inspección de producción posterior al PR #212; 120 combinaciones de ruta, viewport y tema en `audit-out/report.json`.

## 1. Objetivo

Resolver dos defectos independientes detectados en producción sin alterar la apariencia ni el comportamiento comercial del portal:

1. Los informes `Content-Security-Policy-Report-Only` deben enviarse directamente a un endpoint final, sin el redirect 308 que actualmente hace fallar el POST del navegador.
2. `/metodologia/` debe mantener una secuencia de headings ordenada y una región de pasos correctamente nombrada, eliminando la violación axe `heading-order`.

## 2. Mapa de capacidades

| Id                          | Responsabilidad                                                                                | Depende de |
| --------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| `csp-report-endpoint`       | Canonicalizar la URL del colector en middleware y cabecera estática, con pruebas de alineación | —          |
| `metodologia-heading-order` | Agrupar los pasos bajo un H2 y conservar los H3, sin cambios visuales                          | —          |

Las capacidades pueden implementarse en cualquier orden o en paralelo. Comparten únicamente los gates finales.

## 3. Diagnóstico confirmado

### 3.1 Colector CSP

- La cabecera de producción declara `report-uri /api/csp-report`.
- `POST /api/csp-report` responde 308 con `Location: /api/csp-report/`.
- `POST /api/csp-report/` responde 204.
- Las 120 muestras de la inspección registran `net::ERR_FAILED` para el envío sin barra.
- La política tiene dos emisores que deben permanecer alineados: `src/middleware.ts` para rutas on-demand y `vercel.json` para páginas estáticas.
- `src/pages/api/csp-report.ts` ya responde correctamente; no necesita cambios.

### 3.2 Headings de metodología

- La página pasa del H1 de `PageHead` a los H3 de cada paso.
- La sección `#proceso` usa el H1 como `aria-labelledby`, por lo que no existe un H2 propio que agrupe la secuencia.
- axe reporta `heading-order` con impacto `moderate` en las ocho combinaciones de la página.
- Las pruebas E2E actuales no lo detectan porque sus tags WCAG no incluyen esta regla de best-practice.

## 4. Diseño de la corrección

### 4.1 Contrato del endpoint CSP

- La única URL pública del colector será `/api/csp-report/`.
- `src/lib/csp.ts` exportará una constante `CSP_REPORT_URI` con ese valor para evitar variantes en consumidores TypeScript.
- `src/middleware.ts` usará esa constante al construir la cabecera Report-Only.
- `vercel.json` declarará literalmente la misma URL para el contenido estático; una prueba de configuración impedirá que vuelva a divergir.
- `buildCsp` conserva su API y el resto de directivas sin cambios.
- El endpoint sigue aceptando POST y respondiendo 204; no se modifica su logging, validación ni almacenamiento.
- No se añade un redirect ni lógica de cliente para compensar la URL incorrecta.

### 4.2 Contrato semántico de metodología

- `#proceso` contendrá un H2 propio con el texto accesible «Pasos del encargo» y clase `sr-only`.
- La sección pasará a usar `aria-labelledby="proceso-heading"`.
- Los cuatro pasos conservan sus H3, contenido, orden y estilos.
- El H1 de la página no actuará como nombre de la región de pasos.
- La solución no introduce un titular visual ni modifica el grid, las distancias o el cierre.

## 5. Estructura afectada

### CSP

- `src/lib/csp.ts`: constante canónica del endpoint.
- `src/middleware.ts`: consumo de la constante.
- `vercel.json`: cabecera estática alineada.
- `src/lib/csp.test.ts`: contrato de la constante y salida de `buildCsp`.
- `src/lib/securityHeaders.test.ts`: correspondencia exacta de la cabecera estática.

### Metodología

- `src/pages/metodologia.astro`: H2 y nombre accesible de la región.
- `tests/e2e/process-page.spec.ts`: contrato de headings y regresión axe específica.

No se prevén dependencias nuevas ni cambios de CI, datos, API o tokens.

## 6. Estrategia de pruebas

### 6.1 RED

**CSP:**

- Exigir `CSP_REPORT_URI === '/api/csp-report/'`.
- Comprobar que `buildCsp({ reportUri: CSP_REPORT_URI })` emite la URL exacta con barra.
- Extraer `Content-Security-Policy-Report-Only` de `vercel.json` y exigir `report-uri /api/csp-report/`, con una aserción que distinga la variante sin barra.
- Las pruebas deben fallar antes de cambiar la implementación.

**Metodología:**

- Exigir un H2 «Pasos del encargo» asociado mediante `aria-labelledby` a `#proceso` y los cuatro H3 existentes.
- Ejecutar axe sobre la página `/metodologia/` con la regla explícita `heading-order`.
- Confirmar el fallo antes de añadir el H2.

### 6.2 GREEN y regresión

- Repetir las pruebas enfocadas hasta que pasen.
- Verificar que el H2 `sr-only` no altera las mediciones del test de ritmo ni introduce overflow.
- Mantener el contenido esencial sin JavaScript, el contraste y los landmarks.
- Confirmar que no cambian las directivas CSP ni la respuesta 204 del endpoint.

### 6.3 Verificación de producción posterior al despliegue

- `POST https://alexendros.dev/api/csp-report/` debe responder 204.
- La cabecera Report-Only del apex debe apuntar directamente a esa URL.
- Repetir la inspección con `BASE_URL=https://alexendros.dev node scripts/audit/ui-audit.mjs` y comprobar que desaparecen las entradas fallidas del colector y `heading-order`.
- No se dará por verificada producción antes de ese despliegue.

## 7. Comandos

```sh
pnpm exec vitest run src/lib/csp.test.ts src/lib/securityHeaders.test.ts
pnpm exec playwright test tests/e2e/process-page.spec.ts
pnpm typecheck && pnpm lint && pnpm test
pnpm lint:css && pnpm check:records && pnpm audit:cookies
pnpm check:copy && pnpm check:classes && pnpm check:contrast
pnpm format:check
pnpm build
pnpm smoke
pnpm test:e2e
```

`pnpm test:e2e` debe ejecutarse con el webServer y las variables ficticias definidos por el repo. Para una repetición con `SKIP_E2E_BUILD=1`, el build previo debe haberse generado con ese mismo entorno.

## 8. Estilo y límites

- Mantener TypeScript estricto, Astro y los patrones de prueba actuales.
- No cambiar ninguna directiva CSP, el modo Report-Only ni la CSP efectiva.
- No modificar `src/pages/api/csp-report.ts` salvo que una prueba demuestre un defecto distinto.
- No añadir dependencias, tracking, almacenamiento de informes ni tratamiento nuevo de datos.
- No cambiar copy visual, estilos, espaciado, orden de pasos o componentes compartidos.
- No convertir los H3 de los pasos en H2: la agrupación semántica debe conservarse.
- No reescribir informes históricos ni tocar artefactos no versionados ajenos.
- No hacer commit, push, PR ni merge sin solicitud explícita.

## 9. Criterios de éxito

1. Middleware y cabecera estática anuncian exactamente `/api/csp-report/`.
2. Las pruebas impiden la regresión a la variante que provoca 308.
3. La inspección del navegador deja de registrar fallos del colector tras el despliegue.
4. `/metodologia/` tiene una secuencia H1 → H2 de proceso → H3 de pasos, con H2 posteriores para compromisos y cierre.
5. Axe deja de reportar `heading-order` en la página.
6. No hay cambios visuales, overflow, regresiones de accesibilidad ni alteraciones de CSP fuera de la URL del informe.
7. Todos los gates del repo aplicables pasan; las comprobaciones dependientes del despliegue se documentan separadamente.

## 10. Supuestos y preguntas abiertas

**Supuestos:**

1. El texto accesible «Pasos del encargo» es adecuado para el H2 no visual.
2. Se mantiene el colector actual y su respuesta 204; esta corrección no implementa agregación ni persistencia.
3. Las verificaciones opcionales pendientes de la inspección anterior —LHCI, enlaces externos y envío real del formulario— no forman parte de esta iniciativa.

**Preguntas abiertas:** ninguna.

## 11. Evidencia de ejecución local

- T1 RED: fallos por constante ausente y cabecera estática sin barra; T2 GREEN: 6 pruebas CSP/security superadas.
- T3 RED: relación `aria-labelledby` incorrecta y axe `heading-order` sobre el primer H3; T4 GREEN: 12 pruebas de proceso superadas.
- Vitest completo: 41 archivos y 209 pruebas superadas.
- Playwright completo: 284 pruebas superadas.
- Typecheck, ESLint, Stylelint, records, cookies, copy, clases, contraste, build y smoke: correctos.
- Los archivos de esta iniciativa pasan Prettier. El `pnpm format:check` global sigue bloqueado por cinco archivos preexistentes no versionados en `specs/2026-11-08-design-system-alignment/`, que no se han modificado.
- La validación de la cabecera y del colector en el apex queda pendiente de despliegue para T6.
