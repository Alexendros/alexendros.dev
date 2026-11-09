# Informe final — Clean Code integral

**Fecha:** 2026-11-09
**Estado:** ejecución y corrección de las diez E2E completadas; candidato validado para integración
**Base de auditoría:** `3aba2a7f1bb579c0e123cf22b4f82a66ccada926`; integración sobre `origin/main` actual
**Delegación:** no utilizada; el operador autorizó prescindir de KimiCode2.8

## 1. Cambios Clean Code

- `src/lib/contactIdempotency.ts`: una única construcción del registro `processing` para creación, reintento y lease vencido; tipo interno explícito para las opciones.
- `src/lib/contactHandler.ts`: eliminado el estado `mailAccepted`, redundante tras el flujo `try/catch` con retorno temprano.
- `src/scripts/contactForm.ts`: mensajes de error por campo en una tabla constante, eliminando seis ternarios anidados sin cambiar textos ni fallback.
- `src/scripts/referencias.ts`: eliminada la implementación legada sin entry point ni hooks activos; se conservan `referenceFilter.ts` y `detailIsland.ts`.
- `src/lib/referral.ts`: eliminados tres helpers sin consumidores que intentaban leer en cliente una cookie HttpOnly.
- `astro.config.mjs` y `scripts/fix-vercel-runtime.mjs`: comentarios actualizados para describir la derivación real del runtime desde `engines.node`.

**Diff fuente:** siete archivos; 44 inserciones y 184 eliminaciones antes de documentación. No se añadieron dependencias ni archivos de producción.

## 2. Cobertura y trazabilidad

- 358 archivos versionados clasificados en `coverage.md`.
- 290 archivos mantenibles revisados; 68 activos, binarios, lockfile o históricos excluidos con motivo.
- Nueve secciones de auditoría registradas en `audit-log.md`.
- Seis hallazgos aceptados y ejecutados; siete rechazados/diferidos y cuatro derivados en `findings.md`.
- Checkpoints y pruebas por tarea registrados en `tasks/todo.md`.

## 3. Verificación focalizada

| Comando                                                                              | Estado | Resultado            |
| ------------------------------------------------------------------------------------ | ------ | -------------------- |
| `pnpm vitest run src/lib/contactIdempotency.test.ts src/lib/contactHandler.test.ts`  | PASS   | 2 archivos, 40 tests |
| `pnpm test:contract`                                                                 | PASS   | 7 archivos, 80 tests |
| `pnpm playwright test tests/e2e/contact.spec.ts tests/e2e/contacto.spec.ts`          | PASS   | 21 tests             |
| `pnpm playwright test tests/e2e/referencias.spec.ts tests/e2e/detail-island.spec.ts` | PASS   | 3 tests              |
| `pnpm vitest run src/lib/referral.test.ts`                                           | PASS   | 3 tests              |
| `pnpm vitest run scripts/fix-vercel-runtime.test.ts`                                 | PASS   | 6 tests              |

## 4. Verificación final

| Comando               | Estado                              | Resultado                                                                  |
| --------------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| `pnpm typecheck`      | PASS                                | Sin errores                                                                |
| `pnpm lint`           | PASS                                | Sin errores                                                                |
| `pnpm test`           | PASS                                | 41 archivos, 200 tests                                                     |
| `pnpm lint:css`       | PASS                                | Sin errores                                                                |
| `pnpm check:records`  | PASS                                | 31 decisiones y 22 eventos válidos                                         |
| `pnpm audit:cookies`  | PASS                                | 10 cookies; sin referencias fuera de inventario                            |
| `pnpm check:copy`     | PASS                                | Sin infracciones                                                           |
| `pnpm check:classes`  | PASS                                | Sin infracciones                                                           |
| `pnpm check:contrast` | PASS                                | Gates correctos; cuatro avisos informativos conocidos de `badge-soft`      |
| `pnpm build`          | PASS                                | Build production-like, pricing y leaks correctos                           |
| `pnpm check:links`    | PASS                                | 63 enlaces comprobados                                                     |
| `pnpm smoke`          | PASS                                | 5 rutas HTTP 200; 20 HTML sin trackers estáticos                           |
| `git diff --check`    | PASS                                | Sin errores de whitespace                                                  |
| `pnpm format:check`   | FAIL preexistente                   | Exactamente los mismos cinco documentos ajenos del baseline                |
| `pnpm test:e2e`       | PASS tras alinear pruebas obsoletas | 280/280; los 10 fallos iniciales quedaron resueltos sin cambiar producción |

### Fallos preexistentes de formato

- `specs/2026-11-08-design-system-alignment/brief.md`
- `specs/2026-11-08-design-system-alignment/decisions.md`
- `specs/2026-11-08-design-system-alignment/design.md`
- `specs/2026-11-08-design-system-alignment/options.md`
- `specs/2026-11-08-design-system-alignment/tasks.md`

No se formatearon porque pertenecen a otra iniciativa y ya eran no versionados al comenzar.

### Diez fallos E2E iniciales, ya resueltos

Los diez fallos pertenecían a expectativas antiguas de servicios, configurador, tarjetas y cabecera en:

- `tests/e2e/entrega-servicios.spec.ts`: 3.
- `tests/e2e/ui-matrix.spec.ts`: 1.
- `tests/e2e/visual-system.spec.ts`: 6.

La ejecución sobre una copia limpia del SHA base produjo los mismos diez fallos (22 aciertos en esos tres specs), descartando una regresión del refactor. Después se actualizaron las expectativas al catálogo vigente y a selectores reales, conservando la cobertura de CTA, contacto, overflow, tarjetas, foco, bordes y temas. La ejecución posterior es **280/280 PASS**.

## 5. Contratos

**Ninguno modificado intencionadamente.** La preservación se apoya en:

- 80 tests de contrato de contacto, incluidos idempotencia, SMTP y cabeceras.
- E2E de validación, foco, envío, reintento idempotente y errores de contacto.
- E2E de filtros y soft-nav de referencias.
- Gates de copy, cookies, clases, contraste, registros, pricing y leaks.
- Build, enlaces y smoke sobre la salida final.

No cambian API, respuestas HTTP, schemas, serialización, URLs, slugs, copy, consentimiento, tracking, CSP, estilos, CI, release, dependencias ni runtime.

Los tres hints de Astro se conservan deliberadamente: dos son falsos positivos o sugerencias incompatibles con los contratos del repo y el tercero contradiría el runtime ESM documentado del CMP.

## 6. Pendientes y límites

- Los diez E2E ya están resueltos y la suite está completamente verde. Los cinco formatos preexistentes pertenecen a archivos no versionados ajenos; todos los archivos versionados pasan Prettier.
- El modelo económico inactivo permanece bajo EST-09/decisión editorial.
- La discordancia documental Node 22/24 requiere decisión; solo se corrigieron comentarios que describían mal el mecanismo actual.
- `origen=404` fuera de `contactOrigins` se deriva como posible corrección de comportamiento, no como refactor.
- La división amplia de `initContactForm` y la deuda de tipado axe quedan diferidas por riesgo/beneficio.
- No se cierra EST-09 ni shipment por este informe.
- No se hicieron commits, push, PR, deploy ni escrituras externas; estas acciones requieren autorización explícita.

## 7. Corrección de las diez E2E y candidato de deploy

- `tests/e2e/entrega-servicios.spec.ts`: catálogo data-driven, CTA con motivo/origen y contacto principal sin módulos retirados.
- `tests/e2e/ui-matrix.spec.ts`: overflow y CTA sobre el catálogo actual a 320 px.
- `tests/e2e/visual-system.spec.ts`: durante la corrección se alinearon encargos estáticos, badges, foco, superficies y bordes. Al trasladar el trabajo al `main` actual se comprobó que ya contenía correcciones equivalentes; este archivo no forma parte del diff final de la PR.

No fue necesario modificar producción para resolver estos diez fallos: eran expectativas obsoletas y contradictorias con `servicios-oferta.spec.ts`.

### Diff acumulado

- Refactors iniciales: 7 archivos, 44 inserciones, 184 eliminaciones; **140 líneas netas menos**.
- Corrección E2E presente en la PR: 2 archivos, 34 inserciones, 39 eliminaciones; **5 líneas netas menos**.
- Total contra el `main` actual: 9 archivos, 78 inserciones, 223 eliminaciones; **145 líneas netas menos**.

### Validación final del candidato

- Unitarias sobre el `main` actual: 209/209.
- E2E: 280/280.
- Typecheck, ESLint, Stylelint, registros, cookies, copy, clases, contraste, build, pricing, leaks, enlaces, smoke y diff: PASS.
- Prettier: PASS en todos los archivos versionados. El comando global local solo falla por cinco archivos no versionados de otra iniciativa.

El candidato está listo para commit/push y PR, pero esas acciones no se han ejecutado.
