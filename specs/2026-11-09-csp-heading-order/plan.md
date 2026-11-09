# Plan — Colector CSP y headings de metodología

**Basado en:** `spec.md`, aprobada el 2026-11-09.

## 1. Estrategia

Dos correcciones pequeñas, independientes y verificables por separado. Cada una sigue RED → GREEN → REFACTOR y mantiene el build utilizable después de su checkpoint.

No se mezclan en una única edición de pruebas o producción: primero se demuestra cada defecto con su contrato nuevo y después se aplica el cambio mínimo.

## 2. Secuencia técnica

### Fase A — Canonicalizar el colector CSP

1. Actualizar las expectativas de `src/lib/csp.test.ts` y `src/lib/securityHeaders.test.ts` para exigir `/api/csp-report/` y distinguir la variante sin barra.
2. Ejecutar ambas suites y confirmar RED por la URL actual.
3. Exportar `CSP_REPORT_URI` desde `src/lib/csp.ts` y consumirla en `src/middleware.ts`.
4. Actualizar el literal de `Content-Security-Policy-Report-Only` en `vercel.json`.
5. Repetir las suites y comprobar que el resto de directivas no cambia.

**Checkpoint CP-A:** tests CSP/security verdes, sin cambios en el endpoint ni en las políticas.

### Fase B — Corregir la agrupación de headings

1. Añadir a `tests/e2e/process-page.spec.ts` el contrato del H2 «Pasos del encargo», su relación con `#proceso` y una comprobación axe con `heading-order`.
2. Ejecutar la prueba y confirmar RED por la ausencia del H2 y la violación axe.
3. Añadir el H2 `sr-only` en `src/pages/metodologia.astro` y asociar la región a `proceso-heading`.
4. Repetir proceso, ritmo, reflow, contenido sin JavaScript y axe en ambos temas.

**Checkpoint CP-B:** jerarquía H1 → H2 → H3 verde, sin alterar geometría ni estilos.

Las fases A y B pueden ejecutarse en paralelo porque no comparten archivos de implementación. Si se ejecuta en una sola sesión, se hará A → B para mantener un único flujo de gates.

### Fase C — Verificación integrada

1. Formatear únicamente los archivos modificados y revisar el diff.
2. Ejecutar typecheck, ESLint, Stylelint, Vitest completo, controles de records/cookies/copy/clases/contraste, Prettier, build y smoke.
3. Ejecutar Playwright completo con el webServer del repo y su build instrumentado.
4. Revisar `/metodologia/` en producción tras el despliegue y repetir la auditoría de consola/red/axe.

**Checkpoint CP-C:** gates locales y CI verdes; producción pendiente hasta que exista despliegue.

## 3. Dependencias y riesgos

- `vercel.json` no puede importar la constante TypeScript: la alineación con el middleware se protege mediante una aserción exacta en `securityHeaders.test.ts`.
- El preview estático local no reproduce las cabeceras de edge de Vercel; la prueba de configuración cubre el contrato antes del despliegue y la inspección del apex lo confirma después.
- Un regex laxo como `/report-uri .*csp-report/` aceptaría la variante sin barra: las expectativas deben fijar el delimitador final.
- El H2 debe usar `sr-only`, no `hidden` ni `display: none`, para permanecer en el árbol accesible.
- Cambiar `#proceso` de `aria-labelledby` no debe alterar el H1 ni los H3 de los pasos.
- Una repetición E2E con `SKIP_E2E_BUILD=1` exige un build previo generado por Playwright con sus IDs ficticios.

## 4. Evidencias requeridas

- Salida RED y GREEN de cada capacidad.
- Vitest completo y Playwright completo.
- Build y smoke correctos.
- Diff sin cambios de directivas CSP ni diferencias visuales de metodología.
- Tras despliegue: POST 204, cabecera con barra final, ausencia de fallos del colector y ausencia de `heading-order` en la auditoría de producción.

## 5. Fuera del plan

- Persistencia o agregación de informes CSP.
- Modificación de la política CSP efectiva o salida de Report-Only.
- LHCI, enlaces externos o envío real del formulario.
- Commit, push, PR, merge o despliegue sin autorización explícita.
