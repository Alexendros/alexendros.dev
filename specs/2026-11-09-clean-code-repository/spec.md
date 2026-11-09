# Especificación — Clean Code integral de alexendros.dev

**Fecha:** 2026-11-09
**Estado:** aprobada por el operador el 2026-11-09
**Ámbito:** todo el repositorio, con refactorizaciones que preserven el comportamiento
**Relación operativa:** contribuye a EST-09 de `docs/plans/PLAN-CIERRE-SHIP.md`; no lo cierra por sí sola ni sustituye sus bloqueos de shipment

## 1. Comprobación de alcance

La petición se trata como **una sola capacidad**: elevar la legibilidad y mantenibilidad del repositorio sin alterar su comportamiento. Las secciones siguientes son frentes de auditoría de esa capacidad, no productos independientes ni rediseños con entregas separadas.

El trabajo tendrá dos modos estrictamente separados:

1. **Auditoría de solo lectura por secciones**, ejecutada por el agente coordinador; el operador ha autorizado prescindir de KimiCode2.8.
2. **Aplicación secuencial de tareas pequeñas**, solo sobre hallazgos aceptados y después de aprobar el plan y las tareas.

No se escribirá código durante la especificación, el inventario o la auditoría.

## 2. Supuestos explícitos

1. Se parte del estado actual de la rama `cursor/design-system-alignment`; no se cambia de rama ni se crea otra sin autorización.
2. Los archivos no versionados `2026-11-08-design-system-alignment.tar.gz`, `platformcoherente.tar` y `specs/` preexistente se conservan intactos.
3. «Todo el repositorio» significa revisar y clasificar el 100 % de los archivos devueltos por `git ls-files`; las refactorizaciones se limitan a fuentes mantenibles y seguras, no a binarios, artefactos o archivos generados.
4. El objetivo es Clean Code, no corregir bugs, rediseñar la arquitectura, cambiar el aspecto visual ni modificar copy comercial.
5. El operador autoriza expresamente ejecutar la auditoría sin subagentes ni KimiCode2.8. La cobertura completa y los criterios de revisión se mantienen.
6. Los hallazgos de seguridad, arquitectura, rendimiento, accesibilidad o dependencias se derivan al skill correspondiente; esta iniciativa solo aplica la limpieza estructural segura asociada.
7. La discrepancia preexistente entre `engines.node: 24.x` y las referencias a Node 22 se registrará, pero no se corregirá como si fuera una limpieza neutra.

## 3. Objetivo

Hacer que el código sea más expresivo, cohesivo y fácil de cambiar mediante transformaciones pequeñas y revisables, manteniendo intactos los contratos públicos y el comportamiento observable.

### Objetivos medibles

- Crear un inventario completo de archivos, responsables, exclusiones y verificaciones.
- Detectar y priorizar nombres ambiguos, responsabilidades mezcladas, duplicación de decisiones, código muerto demostrado, comentarios obsoletos, errores ocultos y fronteras confusas.
- Resolver los hallazgos aceptados con tareas de tamaño XS–M, de uno a cinco archivos por tarea.
- Mantener una red de seguridad: baseline, pruebas focalizadas, pruebas de caracterización cuando sean necesarias y gates completos al cierre.
- Entregar trazabilidad `hallazgo → tarea → diff → verificación` y una lista explícita de riesgos o mejoras pendientes.

## 4. Stack y convenciones verificadas

- Astro 7.3, TypeScript estricto, Tailwind 4, CSS Modules y Zod 4.
- Node según `package.json`: `24.x`; pnpm `9.15.9`.
- Vitest para pruebas unitarias y de contrato; Playwright para E2E.
- ESLint, Prettier y Stylelint ya configurados; no se sustituyen ni se añaden herramientas.
- Sin React ni nuevas islas; scripts de navegador en TypeScript vanilla.
- El formulario, CMP, tracking, CSP, API de contacto, contenido y despliegue tienen contratos que deben tratarse como invariantes.

## 5. Estructura y cobertura de auditoría

### 5.1 Regla de cobertura

El coordinador generará `coverage.md` a partir de `git ls-files`. Cada archivo tendrá: sección, revisor primario, revisiones transversales aplicables, estado (`pendiente`, `revisado`, `excluido`) y motivo de exclusión. Ningún archivo quedará sin clasificar.

La auditoría será de **solo lectura**: no editará, formateará, creará ramas ni hará commits. Las secciones se revisarán de forma ordenada y se conciliará su cobertura antes de proponer cambios.

### 5.2 Matriz de cobertura por secciones

| ID             | Sección y rango primario                                                                                           | Criterios concretos                                                                                                                                                | Roles a invocar si se implementa                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| CC-CONTENIDO   | `src/content/**`                                                                                                   | Separación datos/esquema, vocabulario de dominio, duplicación de decisiones, IDs/slugs/URLs estables, exports usados y copy intacto                                | role-clean-code; plan-validators                               |
| CC-SERVIDOR    | `src/lib/**`, `src/pages/api/**`, `src/middleware.ts`                                                              | Cohesión, errores y causas, efectos laterales, orden async, límites SMTP/Redis/Notion/Turnstile, idempotencia y contratos HTTP                                     | role-clean-code + role-back; plan-validators                   |
| CC-CLIENTE     | `src/scripts/**`                                                                                                   | Responsabilidad por módulo, estado y mutaciones, listeners/ciclo de vida, guards, nombres, duplicación y conservación de `data-*`, ARIA y consentimiento           | role-clean-code + role-front; plan-validators                  |
| CC-UI          | `src/components/**`, `src/layouts/**`, `src/pages/**`                                                              | Props expresivas, markup y responsabilidades, composición sin abstracciones especulativas, imports/exports y separación presentación/lógica                        | role-clean-code + role-front                                   |
| CC-ESTILOS     | `src/**/*.css`                                                                                                     | Agrupación por responsabilidad, selectores y tokens duplicados, reglas muertas demostradas, comentarios vigentes; sin cambios visuales ni de tokens por heurística | role-clean-code + role-design                                  |
| CC-TOOLING     | `scripts/**`, `astro.config.mjs`, `eslint.config.js`, `playwright*.config.ts`, `vitest.config.ts`, `tsconfig.json` | Funciones y CLI legibles, duplicación real, errores de proceso, rutas/exit codes, exports y scripts utilizados; preservar artefactos y salidas                     | role-clean-code + role-back; plan-validators                   |
| CC-PRUEBAS     | `src/**/*.test.ts`, `scripts/**/*.test.ts`, `tests/**`                                                             | Nombres de escenarios, arrange/act/assert, fixtures y helpers compartidos solo cuando representan el mismo concepto; sin borrar ni relajar aserciones              | role-clean-code + plan-validators; role-front según superficie |
| CC-AUTOMATION  | `.github/**`, `.husky/**`, configuración raíz y documentación técnica                                              | Referencias obsoletas, duplicación y claridad; workflows/CI/release son auditoría solamente salvo autorización expresa                                             | role-clean-code; role-back si hay cambio autorizado            |
| CC-TRANSVERSAL | Todo el código mantenible, sin propiedad de edición                                                                | Duplicación entre secciones, símbolos sin consumidores, comentarios/TODO/código comentado, coherencia de nombres y documentación de contratos                      | role-clean-code; derivación al rol especializado               |

`public/**`, imágenes, fuentes, PDF, SVG/binarios, `pnpm-lock.yaml`, changelogs e histórico se clasifican, pero no se reescriben como ejercicio de Clean Code. `.astro/`, `.vercel/`, `dist/`, `node_modules/`, reportes, capturas y demás artefactos generados quedan fuera de edición.

### 5.3 Revisiones cruzadas obligatorias

- Cambios de API/contacto/tracking/CSP: CC-SERVIDOR + CC-CLIENTE o CC-UI según consumidores.
- Cambios de contenido: CC-CONTENIDO + CC-UI + CC-PRUEBAS para detectar referencias, rutas y contratos.
- Extracción de helpers: revisor de cada consumidor; no unificar por similitud textual sin aprobación del coordinador.
- Eliminación de código: CC-TRANSVERSAL debe aportar búsqueda de referencias estáticas y dinámicas, configuración, scripts, pruebas y documentación.
- Cambios de estilos: CC-ESTILOS + CC-UI + CC-PRUEBAS, con evidencia visual si existe riesgo de regresión.

## 6. Criterios de auditoría y prioridad

Una coincidencia heurística no es automáticamente un defecto ni autoriza editar.

- **P0 — riesgo de corrección:** efectos laterales ocultos, errores tragados, ownership poco claro, fuentes de verdad duplicadas o contratos ambiguos. Se deriva a corrección de comportamiento si no puede resolverse como refactor neutro.
- **P1 — coste de comprensión/cambio:** nombres engañosos, responsabilidades mezcladas, anidación evitable y decisiones repetidas.
- **P2 — fricción estructural:** baja cohesión, acoplamiento accidental o filtración de límites con una transformación acotada posible.
- **P3 — higiene:** comentarios obsoletos, código muerto demostrado y redundancia de bajo riesgo.

Cada hallazgo se registrará con:

```text
ID: CC-<sección>-<número>
Archivo y líneas:
Prioridad: P0/P1/P2/P3
Obstáculo concreto para el lector:
Evidencia y referencias cruzadas:
Transformación mínima propuesta:
Contratos e invariantes:
Prueba focalizada y riesgo residual:
Decisión: aceptar / diferir / rechazar / derivar
Motivo de la decisión:
```

Se prioriza valor y riesgo, no número de líneas, cantidad de funciones ni porcentaje de archivos modificados.

## 7. Estrategia de tareas replicables

### 7.1 Secuencia prevista

1. **CC-T00 — Baseline y manifiesto:** registrar rama, SHA, estado del árbol, comandos y fallos preexistentes; clasificar todos los archivos.
2. **CC-T01 — Auditoría por secciones:** revisar cada rango y las relaciones transversales; consolidar y desduplicar hallazgos sin editar.
3. **CC-T02 — Triaje y plan:** aceptar, diferir, rechazar o derivar cada hallazgo; ordenar por riesgo, dependencias y valor.
4. **CC-T03…Tn — Una transformación por tarea:** ejecutar bottom-up, primero pruebas de caracterización si hacen falta y luego el refactor mínimo.
5. **Checkpoint cada 2–3 tareas:** diff completo, pruebas focalizadas y gates de la superficie; no continuar sobre un fallo nuevo.
6. **CC-FINAL — Integración:** revisión global de contratos, cobertura, artefactos, documentación afectada y suite completa.

El plan técnico y la lista definitiva se elaborarán después de aprobar esta especificación. No se sustituirá ningún plan con tareas abiertas.

### 7.2 Plantilla obligatoria para cada tarea de refactor

```markdown
- [ ] **CC-<id>: <una transformación concreta>**
  - Hallazgo y obstáculo: <ID y motivo; sin cambios genéricos de “limpieza”>.
  - Alcance: <1–5 archivos; exclusiones explícitas>.
  - Invariantes: <API, datos, orden, errores, efectos, DOM, URLs o estilos que deben conservarse>.
  - Acceptance: <2–3 condiciones observables y comprobables>.
  - Dependencies: <tareas previas o ninguna>.
  - Implementation roles: <reevaluar e invocar todos los roles aplicables>.
  - Test surfaces: <funciones, rutas, componentes, jobs y flujos E2E>.
  - Verify: <baseline/comprobación focalizada + gate del repo + revisión de diff>.
  - Contracts: <“sin cambios intencionados” o cambio separado y autorizado>.
  - Files: <rutas probables>.
  - Size: XS/S/M; si supera cinco archivos, dividir antes de ejecutar.
```

### 7.3 Patrones permitidos

- Renombrar por intención con todas las referencias revisadas.
- Extraer una responsabilidad cohesiva o inlinear una indirección que oculta intención.
- Introducir guard clauses sin alterar orden de evaluación ni efectos.
- Consolidar decisiones duplicadas con idéntica semántica y razón de cambio.
- Retirar exports/código muerto solo con alcance dinámico comprobado.
- Sustituir comentarios redundantes por código expresivo; conservar el «por qué» y los workarounds vigentes.

## 8. Comandos y estrategia de verificación

### 8.1 Baseline mínimo antes de cualquier refactor

```bash
pnpm typecheck && pnpm lint && pnpm test
```

### 8.2 Baseline y cierre de calidad del repositorio

```bash
pnpm lint:css && pnpm format:check
pnpm check:records && pnpm audit:cookies && pnpm check:copy
pnpm check:classes && pnpm check:contrast
pnpm build
```

### 8.3 Verificación según superficie

- Contacto: `pnpm test:contract` y E2E de contacto relevantes.
- Una unidad o script: `pnpm vitest run <archivos-de-test>` antes y después de la transformación.
- Navegador, rutas o interacción: `pnpm playwright test <specs-relevantes>`.
- Cierre integral: `pnpm test:e2e`, `pnpm check:links` y `pnpm smoke` sobre el build apropiado.
- Revisión de parche: `git diff --check` y diff completo por tarea y al cierre.

Si una transformación relevante carece de cobertura, se añade primero una prueba de caracterización mediante plan-validators, se reduce el alcance o se pide decisión. Nunca se afirmará que el comportamiento se conserva sin evidencia suficiente. Los fallos preexistentes se registran y no se ocultan ni se corrigen dentro del refactor.

No se ejecutará `pnpm format`, `prettier --write .` ni un autofix global: el formateo se limita a archivos tocados y se separa si genera ruido.

## 9. Contratos que deben permanecer intactos

- Copy comercial, catálogo, servicios, precios/condiciones, taxonomía y persona editorial.
- URLs, redirects, slugs, IDs públicos, HTML funcional, nombres accesibles, `data-*`, ARIA y orden DOM relevante.
- Esquemas Zod, serialización hacia contacto y valores por defecto.
- API de contacto: `200 accepted/replay`, `202 processing`, `409 conflict`, `503 retryable_failure|unknown`, `Retry-After`, idempotencia y fail-closed.
- SMTP, Redis, Notion, Turnstile, reintentos, logs y efectos externos.
- Consent Mode/CMP y carga condicionada de GA4, Meta, Clarity, PostHog, LinkedIn, GTM y Vercel.
- CSP, cabeceras, middleware, JSON-LD, sitemap y salida estática/serverless.
- Tokens visuales, contraste, responsive, reduced motion, presupuestos y comportamiento observable de pruebas.
- Exit codes y artefactos de scripts usados por CI/release.

Cualquier cambio intencionado en estos puntos deja de ser Clean Code neutro y exige alcance y aprobación separados.

## 10. DO’s y DONT’s

### DO’s

- Mantener una fuente única de verdad y nombres coherentes con el dominio.
- Explicar cada cambio por un obstáculo concreto para el lector.
- Preservar evaluación, laziness, orden async, errores, efectos y lifetime de recursos.
- Leer callers, templates, configuración y puntos dinámicos antes de renombrar o borrar.
- Añadir caracterización antes de refactorizar comportamiento importante sin cobertura.
- Aplicar una transformación comprensible cada vez y verificar después de cada paso.
- Registrar hallazgos diferidos y comprobaciones no ejecutadas.
- Reevaluar los roles antes de cada tarea o acción independiente.
- Detenerse al obtener una mejora clara y suficiente.

### DONT’s

- No hacer reescrituras masivas, formateo global ni cambios por cuotas de líneas.
- No introducir dependencias, patrones, capas, clases, concurrencia o arquitectura especulativa.
- No unificar código solo porque se parece visualmente.
- No cambiar tests, aserciones, fixtures o umbrales para obtener verde.
- No borrar workarounds, flags, compatibilidad o exports por ausencia de imports estáticos únicamente.
- No mezclar bug fixes, funcionalidad, copy, rediseño visual o actualización de dependencias con un refactor.
- No tocar secretos, lockfile, generados, binarios, histórico ni archivos ajenos al hallazgo.
- No editar CI/release, `.github`, hooks o configuración de despliegue sin autorización expresa.
- No hacer commit, push, PR, merge ni escrituras GitHub sin petición explícita.
- No declarar EST-09, shipment o el trabajo completo cerrado solo por tener tests verdes.

## 11. Límites de decisión

- **Siempre:** inventario y diff trazables, baseline, pruebas focalizadas, gates del repo, reporte de comandos y conservación de contratos.
- **Preguntar primero:** cambios de comportamiento, APIs públicas, schemas, dependencias, CI/release, eliminación dudosa, tareas de más de cinco archivos o riesgo sin cobertura.
- **Nunca:** secretos en el repo, autofix masivo, tests debilitados, edición de generados o afirmaciones de verificación no ejecutada.

## 12. Criterios de éxito

1. `coverage.md` clasifica el 100 % de los archivos versionados y asigna revisor primario a todo archivo mantenible.
2. Cada sección de la matriz tiene informe y cobertura registrados; las revisiones cruzadas aplicables están documentadas.
3. Todo cambio aceptado tiene hallazgo, invariantes, tarea XS–M, diff revisable y verificación asociada.
4. No quedan hallazgos P0/P1 aceptados para esta iniciativa sin resolver; los diferidos o derivados tienen motivo y riesgo explícitos.
5. No hay cambios intencionados de comportamiento, copy, contratos, apariencia o configuración protegida.
6. Los gates mínimos `pnpm typecheck && pnpm lint && pnpm test` y todos los controles relevantes ejecutados terminan en verde; cualquier comprobación no ejecutada queda visible.
7. El informe final enumera cambios por archivo, comandos PASS/FAIL/NOT RUN, contratos y pendientes.
8. No se han alterado los archivos no versionados preexistentes ni artefactos fuera de alcance.

## 13. Decisiones aprobadas

1. Alcance estrictamente preservador de comportamiento, sin formateo ni autofix global.
2. El operador autoriza prescindir de KimiCode2.8; el coordinador ejecuta directamente la auditoría con la misma matriz de cobertura.
3. `.github`, hooks, release y despliegue quedan solo auditados, sin edición salvo autorización posterior.

**Siguiente fase:** preparar el plan técnico y someterlo a revisión antes de descomponer las tareas definitivas.
