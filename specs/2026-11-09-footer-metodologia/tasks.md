# Tasks — Footer y `/metodologia/`

- [x] **T1 — Reproducir la geometría incorrecta del footer**
  - Acceptance: una prueba E2E exige footer exterior a todo el ancho e interior centrado/alineado con el header; falla antes del fix.
  - Implementation roles: role-front, plan-validators.
  - Test surfaces: `/` y rutas con chrome común, 320–1920 px.
  - Verify: `pnpm exec playwright test tests/e2e/chrome.spec.ts`.
  - Files: `tests/e2e/chrome.spec.ts`.
  - Size: S.

- [x] **T2 — Separar superficie y contenido del footer**
  - Acceptance: T1 pasa; aside/nav, foco y responsive se conservan; no quedan selectores `footer.footer` obsoletos.
  - Implementation roles: role-front, role-design.
  - Test surfaces: chrome compartido, teclado, overflow, claro/oscuro.
  - Verify: T1 y `pnpm lint:css`.
  - Files: `src/components/Footer.astro`, `src/styles/global.css`.
  - Size: S.

- [x] **T3 — Reproducir los contratos de la nueva canónica**
  - Acceptance: pruebas actualizadas exigen página `/metodologia/`, enlaces, sitemap y redirects directos; fallan antes de migrar.
  - Implementation roles: role-front, plan-validators.
  - Test surfaces: ruta, canonical, `og:url`, sitemap, mapa de redirects y navegación.
  - Verify: Vitest y Playwright enfocados.
  - Files: `src/content/redirects.test.ts`, `src/content/site.test.ts`, `tests/e2e/process-page.spec.ts`, `tests/e2e/seo-routes.spec.ts`, `tests/e2e/seo-edge-prod.spec.ts`.
  - Size: M.

- [x] **T4 — Migrar la ruta y todos sus consumidores activos**
  - Acceptance: T3 pasa; no existe `src/pages/metodo.astro`; `/metodo/` es alias permanente y no aparece en enlaces/sitemap; OG usa `metodologia.png`.
  - Implementation roles: role-front.
  - Test surfaces: build estático, home, header/footer, design system, smoke, auditorías.
  - Verify: `pnpm test`, `pnpm build` y E2E de rutas.
  - Files: página/módulo renombrados, `site.ts`, sección home, `vercel.json`, scripts, tests y generador OG.
  - Size: M.

- [x] **T5 — Reproducir el ritmo y la alineación de metodología**
  - Acceptance: pruebas miden `--space-section-y`, `--space-block`, `--space-gap` y el centrado del cierre; fallan con la composición anterior.
  - Implementation roles: role-design, plan-validators.
  - Test surfaces: `/metodologia/` a 390 y 1440 px.
  - Verify: Playwright enfocado.
  - Files: `tests/e2e/process-page.spec.ts`.
  - Size: S.

- [x] **T6 — Aplicar ritmo visual y cierre centrado**
  - Acceptance: T5 pasa con tokens existentes; no hay overflow ni cambios de orden/headings.
  - Implementation roles: role-front, role-design.
  - Test surfaces: responsive, claro/oscuro, reduced motion, sin JavaScript y axe.
  - Verify: E2E de proceso, matriz visual y a11y.
  - Files: `src/pages/metodologia.astro`, `src/pages/metodologia.module.css`, `src/components/Commitments.astro`.
  - Size: S.

- [x] **T7 — Actualizar activo OG, decisión y documentación viva**
  - Acceptance: OG regenerado; decisión nueva enlaza la sustitución de 0027; README/AGENTS/estándar reflejan `/metodologia/`; `check:records` pasa.
  - Implementation roles: role-front.
  - Test surfaces: generador OG y esquema de registros.
  - Verify: `pnpm gen:og` y `pnpm check:records`.
  - Files: `public/og/`, `docs/audits/decisions.json`, `README.md`, `AGENTS.md`, `docs/standards/website/diseno.md`.
  - Size: S.

- [x] **T8 — Ejecutar cierre completo y revisión visual**
  - Acceptance: todos los criterios de `spec.md` tienen evidencia; las comprobaciones de producción no desplegadas se declaran pendientes.
  - Implementation roles: role-front, role-design, plan-validators.
  - Test surfaces: gates del repo, E2E, smoke, navegador real.
  - Verify: comandos de la sección 7.3 de la spec.
  - Files: evidencia en la especificación si procede.
  - Size: M.
