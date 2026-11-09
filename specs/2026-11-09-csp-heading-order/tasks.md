# Tasks — Colector CSP y headings de metodología

**Basado en:** `spec.md` y `plan.md` aprobados el 2026-11-09.

## Dependencias

```text
T1 → T2 ─┐
T3 → T4 ─┼→ T5 → T6 (solo tras despliegue)
```

T1/T2 y T3/T4 son cadenas independientes. En una única sesión se ejecuta T1 → T2 → T3 → T4 → T5.

- [x] **T1 — Reproducir en rojo la URL incorrecta del colector CSP**
  - Acceptance: las pruebas exigen `CSP_REPORT_URI === '/api/csp-report/'` y la misma URL exacta en `buildCsp` y `vercel.json`; fallan con la implementación actual.
  - Depends on: ninguna.
  - Implementation roles: role-back, plan-validators.
  - Test surfaces: construcción de CSP y cabecera Report-Only estática.
  - Verify: `pnpm exec vitest run src/lib/csp.test.ts src/lib/securityHeaders.test.ts` con fallos esperados y relacionados con la URL.
  - Files: `src/lib/csp.test.ts`, `src/lib/securityHeaders.test.ts`.
  - Size: XS.

- [x] **T2 — Canonicalizar el endpoint CSP en ambos emisores**
  - Acceptance: T1 pasa; middleware y cabecera estática usan `/api/csp-report/`; no cambia ninguna directiva ni el endpoint.
  - Depends on: T1.
  - Implementation roles: role-back, plan-validators.
  - Test surfaces: `buildCsp`, middleware on-demand y cabecera de contenido estático.
  - Verify: repetir el comando de T1; revisar que el diff solo afecta a la URL y su constante.
  - Files: `src/lib/csp.ts`, `src/middleware.ts`, `vercel.json`.
  - Size: XS.

- [x] **T3 — Reproducir en rojo la jerarquía de headings de metodología**
  - Acceptance: una prueba exige el H2 «Pasos del encargo», `aria-labelledby="proceso-heading"` y los cuatro H3; axe con `heading-order` falla antes de la corrección.
  - Depends on: ninguna.
  - Implementation roles: role-front, plan-validators.
  - Test surfaces: `/metodologia/`, árbol accesible y relación de región.
  - Verify: `pnpm exec playwright test tests/e2e/process-page.spec.ts` con el fallo nuevo confirmado.
  - Files: `tests/e2e/process-page.spec.ts`.
  - Size: XS.

- [x] **T4 — Añadir la agrupación semántica sin cambios visuales**
  - Acceptance: T3 pasa; H1 → H2 de proceso → H3 de pasos; el H2 permanece accesible con `sr-only`; ritmo, reflow y contenido sin JavaScript siguen verdes.
  - Depends on: T3.
  - Implementation roles: role-front, plan-validators.
  - Test surfaces: `/metodologia/` en ambos temas, 320–1440 px, teclado y sin JavaScript.
  - Verify: repetir `process-page.spec.ts`; revisar que las mediciones de ritmo no cambian.
  - Files: `src/pages/metodologia.astro`.
  - Size: XS.

- [x] **T5 — Ejecutar la verificación integrada**
  - Acceptance: todos los comandos de `spec.md` pasan; el diff está formateado y no contiene cambios fuera del alcance; quedan registradas las evidencias RED/GREEN.
  - Depends on: T2 y T4.
  - Implementation roles: role-front, role-back, plan-validators.
  - Test surfaces: gates estáticos, Vitest completo, build, smoke y Playwright completo.
  - Verify: sección 7 de `spec.md`; actualizar `spec.md` con resultados y cualquier comprobación pendiente.
  - Files: archivos anteriores y `specs/2026-11-09-csp-heading-order/spec.md` para evidencias.
  - Size: M.

- [ ] **T6 — Verificar producción después del despliegue**
  - Acceptance: el apex anuncia `/api/csp-report/`; POST responde 204 sin redirect; la auditoría no registra fallos del colector ni `heading-order`.
  - Depends on: T5 y un despliegue autorizado.
  - Implementation roles: role-back, role-front, plan-validators.
  - Test surfaces: cabeceras y endpoint de producción, 15 rutas × 4 anchos × 2 temas de la auditoría.
  - Verify: `curl` del endpoint/cabecera y `BASE_URL=https://alexendros.dev node scripts/audit/ui-audit.mjs`, seguido de inspección de `failed` y `axe` en `audit-out/report.json`.
  - Files: ninguno salvo evidencia en `spec.md` si se actualiza.
  - Size: S.
