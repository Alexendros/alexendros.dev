# Baseline — Clean Code integral

**Fecha:** 2026-11-09
**SHA:** `3aba2a7f1bb579c0e123cf22b4f82a66ccada926`
**Rama inicial:** `cursor/design-system-alignment`; rama de integración: `cursor/clean-code-repository`

## Estado inicial preservado

Antes del trabajo existían como no versionados:

- `2026-11-08-design-system-alignment.tar.gz`
- `platformcoherente.tar`
- `specs/`, incluida la especificación previa de design system

No se modificarán esos archivos ajenos. Los artefactos de build generados durante las comprobaciones no forman parte del diff fuente.

## Resultados

| Comando               | Estado            | Evidencia                                                                                                                               |
| --------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`      | PASS              | Sin errores                                                                                                                             |
| `pnpm lint`           | PASS              | Sin errores                                                                                                                             |
| `pnpm test`           | PASS              | 41 archivos, 200 tests                                                                                                                  |
| `pnpm lint:css`       | PASS              | Sin errores                                                                                                                             |
| `pnpm format:check`   | FAIL preexistente | Cinco archivos ajenos de `specs/2026-11-08-design-system-alignment/`: `brief.md`, `decisions.md`, `design.md`, `options.md`, `tasks.md` |
| `pnpm check:records`  | PASS              | 31 decisiones y 22 eventos válidos                                                                                                      |
| `pnpm audit:cookies`  | PASS              | 10 cookies; 180 archivos analizados                                                                                                     |
| `pnpm check:copy`     | PASS              | Sin infracciones                                                                                                                        |
| `pnpm check:classes`  | PASS              | Sin infracciones                                                                                                                        |
| `pnpm check:contrast` | PASS              | Gates correctos; cuatro avisos informativos conocidos sobre `badge-soft`, sin consumidores en la fase actual                            |
| `pnpm build`          | PASS              | Build, pricing y leaks correctos; tres hints detallados abajo                                                                           |

## Hints preexistentes del build

1. `src/layouts/Layout.astro:124`: el script JSON-LD con atributos se trata como inline; Astro sugiere declarar `is:inline` explícitamente.
2. `src/pages/r/[code].astro:7`: `CONTACT_DEST` está declarado y no se usa.
3. `src/scripts/cookieBanner.ts:3`: el import de `vanilla-cookieconsent` puede convertirse a default import.

Son candidatos de auditoría, no cambios automáticamente aceptados. Deben revisarse sus contratos y consumidores antes de actuar.

## Criterio de comparación

Un fallo posterior en los cinco documentos ajenos seguirá atribuido al baseline. Cualquier fallo nuevo detiene la secuencia de refactor. Los tres hints solo podrán marcarse resueltos si el cambio correspondiente se verifica sin alterar el comportamiento.

## Comprobación retrospectiva de E2E

El E2E completo no formó parte del baseline inicial. Tras observar diez fallos en el candidato, se extrajo el SHA base mediante `git archive HEAD` en una copia temporal y se ejecutaron allí `entrega-servicios.spec.ts`, `visual-system.spec.ts` y `ui-matrix.spec.ts` con las mismas dependencias.

Resultado base: **22 aciertos y los mismos 10 fallos**, con idénticos selectores/expectativas antiguas. La copia temporal se eliminó. Esto demuestra que esos fallos son preexistentes; no se modificaron los tests para obtener verde.
