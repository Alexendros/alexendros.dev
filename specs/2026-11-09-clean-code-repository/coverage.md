# Cobertura de archivos — Clean Code integral

**Fuente:** `git ls-files` en `3aba2a7f1bb579c0e123cf22b4f82a66ccada926`
**Total:** 358 archivos versionados
**Estado final de auditoría:** 290 revisados; 68 excluidos con motivo

## Resumen

| Revisor primario | Archivos |
| ---------------- | -------: |
| CC-AUTOMATION    |       85 |
| CC-CLIENTE       |       11 |
| CC-CONTENIDO     |       15 |
| CC-ESTILOS       |       15 |
| CC-PRUEBAS       |       75 |
| CC-SERVIDOR      |       18 |
| CC-TOOLING       |       30 |
| CC-UI            |       41 |
| EXCLUIDO         |       68 |

## Manifiesto

| Archivo                                                              | Revisor primario | Revisión transversal | Estado   | Criterio                                                          |
| -------------------------------------------------------------------- | ---------------- | -------------------- | -------- | ----------------------------------------------------------------- |
| `.cursorrules`                                                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.editorconfig`                                                      | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.env.example`                                                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/CODEOWNERS`                                                 | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/ISSUE_TEMPLATE/bug.yml`                                     | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/ISSUE_TEMPLATE/config.yml`                                  | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/ISSUE_TEMPLATE/decision.yml`                                | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/ISSUE_TEMPLATE/feature.yml`                                 | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/ISSUE_TEMPLATE/hallazgo.yml`                                | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/PULL_REQUEST_TEMPLATE.md`                                   | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/policy-exceptions.md`                                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/renovate.json`                                              | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/workflows/ci.yml`                                           | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/workflows/main-watch.yml`                                   | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/workflows/pr-mergeable.yml`                                 | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/workflows/release.yml`                                      | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.github/workflows/security.yml`                                     | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.gitignore`                                                         | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.gitleaks.toml`                                                     | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.husky/pre-commit`                                                  | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.lintstagedrc`                                                      | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.nvmrc`                                                             | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.prettierignore`                                                    | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.prettierrc.json`                                                   | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.releaserc.json`                                                    | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `.stylelintrc.json`                                                  | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `AGENTS.md`                                                          | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `ARCHITECTURE.md`                                                    | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `CHANGELOG.md`                                                       | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `CODE_OF_CONDUCT.md`                                                 | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `CONTRIBUTING.md`                                                    | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `LICENSE`                                                            | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `README.md`                                                          | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `SECURITY.md`                                                        | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `SUPPORT.md`                                                         | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `astro.config.mjs`                                                   | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `docs/README.md`                                                     | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/2026-11-01/RESULTADOS.md`                               | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-01/baseline.json`                               | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/RESULTADOS.md`                               | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/SPEC.md`                                     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/TODO.md`                                     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/baseline/README.md`                          | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/baseline/check-internal-links.txt`           | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/baseline/css-budget.txt`                     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/baseline/css-runtime.json`                   | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/baseline/dialog-a11y.txt`                    | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/baseline/lighthouse-summary.json`            | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-02/baseline/ui-audit-summary.json`              | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-03/PLAN-DAISYUI.md`                             | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-03/RESULTADOS-CONSISTENCIA-VISUAL.md`           | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-03/RESULTADOS-DAISYUI.md`                       | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-03/RESULTADOS.md`                               | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-03/SPEC-CONSISTENCIA-VISUAL.md`                 | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-03/SPEC-DAISYUI.md`                             | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-diseno/CORRECCIONES-POST-T7.md`                 | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/2026-11-diseno/INFORME.md`                              | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/audits/active/README.md`                                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/CIERRE-01-referencia.md`                        | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/README.md`                                      | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/axd-contacto-medicion.md`                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/condiciones-catalogo.md`                        | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/eventos-embudo.md`                              | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/mantenimiento.md`                               | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/matriz-consentimiento.md`                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/production-closeout/22fb60e/pr-e-gates.md`      | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/production-closeout/91ae5fe/104-disposition.md` | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/production-closeout/candidato/acceptance.md`    | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/archive/production-closeout/candidato/rollback.md`      | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/decisions.json`                                         | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/events.json`                                            | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/audits/record.schema.json`                                     | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/compliance/README.md`                                          | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/compliance/accessibility-matrix.md`                            | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/compliance/processors.md`                                      | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/cookies-inventory.json`                                        | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/copy-persona-home.md`                                          | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/decisions/README.md`                                           | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/design/FUENTES.md`                                             | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/design/captures-v4/contacto-1280-alexdark.png`                 | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/design/captures-v4/contacto-1280-alexlight.png`                | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/design/captures-v4/contacto-390-alexdark.png`                  | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/design/captures-v4/contacto-390-alexlight.png`                 | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/design/captures-v4/home-1280-alexdark.png`                     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/design/captures-v4/home-1280-alexlight.png`                    | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/design/captures-v4/home-390-alexdark.png`                      | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/design/captures-v4/home-390-alexlight.png`                     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/design/inventario-v1.md`                                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/design/mock-v4-singlepage.html`                                | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/operations/README.md`                                          | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/PLAN-CIERRE-SHIP.md`                                     | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/evidence/2026-10-29-capturas-proyectos.md`               | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/evidence/2026-10-29-cmp-contract.md`                     | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/evidence/2026-10-29-cmp-native.md`                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/evidence/2026-10-29-contact-native.md`                   | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/evidence/2026-10-29-javascript-diagnostic.md`            | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/evidence/2026-10-29-lhci-pr148.md`                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/evidence/2026-10-29-needs-native.md`                     | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/evidence/2026-10-29-workaround-inventory.md`             | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/plans/evidence/capturas-2026-10-29/nav-1024.png`               | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/plans/evidence/capturas-2026-10-29/nav-1100.png`               | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/plans/evidence/capturas-2026-10-29/nav-768.png`                | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/plans/evidence/capturas-2026-10-29/nav-900.png`                | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/plans/evidence/capturas-2026-10-29/proyectos-1280-light.png`   | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/plans/evidence/capturas-2026-10-29/proyectos-320-light.png`    | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/plans/evidence/capturas-2026-10-29/proyectos-390-dark.png`     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/plans/evidence/capturas-2026-10-29/zedazo-390-dark.png`        | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `docs/releases/README.md`                                            | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/standards/product/identidad.md`                                | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/standards/protocols/ci-release.md`                             | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/standards/protocols/env-vars.md`                               | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/standards/protocols/gtm-server-side.md`                        | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/standards/protocols/security-ci.md`                            | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/standards/website/calidad.md`                                  | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/standards/website/desarrollo.md`                               | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/standards/website/diseno.md`                                   | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `docs/threat-model.md`                                               | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `eslint.config.js`                                                   | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `lighthouserc.json`                                                  | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `osv-scanner.toml`                                                   | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `package.json`                                                       | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `playwright.config.ts`                                               | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `playwright.packages.config.ts`                                      | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `pnpm-lock.yaml`                                                     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `pnpm-workspace.yaml`                                                | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `public/apple-touch-icon.png`                                        | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/cv.pdf`                                                      | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/favicon.svg`                                                 | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/blueprint.svg`                                            | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/contacto.png`                                             | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/default.png`                                              | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/experiencia.png`                                          | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/home.png`                                                 | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/metodo.png`                                               | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/proyectos.png`                                            | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/proyectos/alexendros-me.png`                              | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/proyectos/front-valencia.png`                             | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/proyectos/graficas-nasve.png`                             | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/proyectos/zedazo.png`                                     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/servicios.png`                                            | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/servicios/ciberseguridad.png`                             | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/servicios/cumplimiento-normativo.png`                     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/servicios/informe-comercial.png`                          | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/og/servicios/software-a-medida.png`                          | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/robots.txt`                                                  | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `public/theme-init.js`                                               | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `scripts/asset-stub-loader.mjs`                                      | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/audit-cookies.mjs`                                          | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/audit/check-internal-links.mjs`                             | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/audit/check-leaks.sh`                                       | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/audit/css-runtime.mjs`                                      | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/audit/dialog-a11y.mjs`                                      | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/audit/ui-audit.mjs`                                         | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/build-cv-pdf.mjs`                                           | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/capturas.mjs`                                               | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/check-classes.mjs`                                          | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/check-contrast.mjs`                                         | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/check-copy.mjs`                                             | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/check-csp.mjs`                                              | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/check-csp.test.ts`                                          | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `scripts/check-css-margin.mjs`                                       | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/check-links.sh`                                             | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/check-public-pricing.mjs`                                   | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/check-public-pricing.test.ts`                               | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `scripts/check-records.mjs`                                          | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/contrast-lib.mjs`                                           | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/contrast-lib.test.ts`                                       | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `scripts/env-collect.mjs`                                            | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/env-push.sh`                                                | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/fix-vercel-runtime.mjs`                                     | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/fix-vercel-runtime.test.ts`                                 | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `scripts/gen-og.mts`                                                 | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/inject-csp-hashes.mjs`                                      | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `scripts/smoke.sh`                                                   | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `src/assets/headshot-alexendros.webp`                                | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/assets/og-source.svg`                                           | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/assets/projects/alexendros-me.svg`                              | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/assets/projects/alexendros-me.webp`                             | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/assets/projects/front-valencia.svg`                             | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/assets/projects/front-valencia.webp`                            | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/assets/projects/graficas-nasve.svg`                             | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/assets/projects/graficas-nasve.webp`                            | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/assets/projects/zedazo.svg`                                     | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/assets/projects/zedazo.webp`                                    | EXCLUIDO         | —                    | excluido | Binario, activo, lockfile o histórico; sin reescritura Clean Code |
| `src/components/Button.astro`                                        | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/Button.module.css`                                   | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/Catalogo.astro`                                      | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/Commitments.astro`                                   | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/ContactForm.astro`                                   | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/ContactForm.module.css`                              | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/DetailIsland.astro`                                  | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/Footer.astro`                                        | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/Header.astro`                                        | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/Link.astro`                                          | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/NeedsConfigurator.astro`                             | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/NeedsConfigurator.module.css`                        | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/PageHead.astro`                                      | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/Paquetes.astro`                                      | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/ProjectCard.astro`                                   | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/SectionHeader.astro`                                 | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/SectionHeader.module.css`                            | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/ServiceBadges.astro`                                 | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/ServiceBadges.module.css`                            | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/ServiceCard.astro`                                   | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/SkipLink.astro`                                      | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/sections/ContactCta.astro`                           | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/sections/ContactCta.module.css`                      | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/sections/Faq.astro`                                  | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/sections/Hero.astro`                                 | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/sections/Hero.module.css`                            | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/sections/Metodo.astro`                               | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/sections/Metodo.module.css`                          | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/sections/Referencias.astro`                          | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/sections/Referencias.module.css`                     | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/sections/Servicios.astro`                            | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/components/sections/Servicios.module.css`                       | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/components/ui/Icon.astro`                                       | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/content/articles.ts`                                            | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/catalogo.test.ts`                                       | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/catalogo.ts`                                            | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/commercial-coherence.test.ts`                           | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/commitments.ts`                                         | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/contact.test.ts`                                        | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/contact.ts`                                             | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/contactContext.test.ts`                                 | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/contactContext.ts`                                      | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/deliveryContract.test.ts`                               | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/ejes.test.ts`                                           | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/ejes.ts`                                                | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/home.ts`                                                | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/paquetes.test.ts`                                       | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/paquetes.ts`                                            | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/portalModules.test.ts`                                  | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/portalModules.ts`                                       | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/process.test.ts`                                        | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/process.ts`                                             | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/profile.ts`                                             | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/projects.test.ts`                                       | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/projects.ts`                                            | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/redirects-web-para.test.ts`                             | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/redirects.test.ts`                                      | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/referralCodes.ts`                                       | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/servicePositioning.test.ts`                             | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/serviceProducts.test.ts`                                | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/services.catalog.test.ts`                               | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/services.ts`                                            | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/content/site.test.ts`                                           | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/content/site.ts`                                                | CC-CONTENIDO     | CC-TRANSVERSAL       | revisado | Datos, esquemas, vocabulario y contratos estables                 |
| `src/env.d.ts`                                                       | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/layouts/Layout.astro`                                           | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/lib/alertWebhook.test.ts`                                       | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/alertWebhook.ts`                                            | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/checkClasses.test.ts`                                       | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/contactHandler.test.ts`                                     | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/contactHandler.ts`                                          | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/contactIdempotency.test.ts`                                 | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/contactIdempotency.ts`                                      | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/contactSchema.property.test.ts`                             | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/contactSchema.test.ts`                                      | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/contactSchema.ts`                                           | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/copyPolicy.test.ts`                                         | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/copyTypography.test.ts`                                     | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/csp.test.ts`                                                | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/csp.ts`                                                     | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/notionLeads.ts`                                             | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/referral.test.ts`                                           | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/referral.ts`                                                | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/securityHeaders.test.ts`                                    | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/smtpConfig.property.test.ts`                                | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/smtpConfig.test.ts`                                         | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/smtpConfig.ts`                                              | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/themeColors.test.ts`                                        | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/themeColors.ts`                                             | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/tracking/capi.test.ts`                                      | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/tracking/capi.ts`                                           | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/tracking/consent.test.ts`                                   | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/tracking/consent.ts`                                        | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/tracking/events.test.ts`                                    | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/tracking/events.ts`                                         | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/tracking/loaders.test.ts`                                   | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/tracking/loaders.ts`                                        | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/turnstile.test.ts`                                          | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/lib/turnstile.ts`                                               | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/lib/viewTransitionBan.test.ts`                                  | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/middleware.ts`                                                  | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/pages/404.astro`                                                | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/accesibilidad.astro`                                      | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/api/contact.ts`                                           | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/pages/api/csp-report.ts`                                        | CC-SERVIDOR      | CC-TRANSVERSAL       | revisado | Cohesión, errores, efectos y contratos                            |
| `src/pages/articulos/[slug].astro`                                   | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/contacto.astro`                                           | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/cookies.astro`                                            | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/design-system.astro`                                      | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/experiencia.astro`                                        | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/identidad.astro`                                          | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/index.astro`                                              | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/metodo.astro`                                             | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/metodo.module.css`                                        | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/pages/privacidad.astro`                                         | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/r/[code].astro`                                           | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/referencias/[slug].astro`                                 | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/referencias/index.astro`                                  | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/servicios/[slug].astro`                                   | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/servicios/index.astro`                                    | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/pages/servicios/index.module.css`                               | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/pages/sobre-mi.astro`                                           | CC-UI            | CC-TRANSVERSAL       | revisado | Props, markup, composición y separación de lógica                 |
| `src/scripts/contactFallback.ts`                                     | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/contactForm.ts`                                         | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/cookieBanner.css`                                       | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/cookieBanner.ts`                                        | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/detailIsland.ts`                                        | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/header.ts`                                              | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/mobileMenu.ts`                                          | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/needsConfigurator.ts`                                   | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/referenceFilter.ts`                                     | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/referencias.ts`                                         | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/scripts/themeToggle.test.ts`                                    | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `src/scripts/themeToggle.ts`                                         | CC-CLIENTE       | CC-TRANSVERSAL       | revisado | Estado, listeners, DOM, consentimiento y nombres                  |
| `src/styles/design-references.css`                                   | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/styles/global.css`                                              | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `src/styles/theme.css`                                               | CC-ESTILOS       | CC-TRANSVERSAL       | revisado | Responsabilidad, duplicación y reglas muertas demostradas         |
| `tests/e2e/a11y.spec.ts`                                             | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/chrome.spec.ts`                                           | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/consent.spec.ts`                                          | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/contact.spec.ts`                                          | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/contacto.spec.ts`                                         | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/cp09-a11y-ux.spec.ts`                                     | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/critical.spec.ts`                                         | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/detail-island.spec.ts`                                    | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/diseno-interaccion.spec.ts`                               | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/entrega-legal.spec.ts`                                    | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/entrega-salida.spec.ts`                                   | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/entrega-servicios.spec.ts`                                | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/fichas-formato.spec.ts`                                   | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/fixtures/safe-network.ts`                                 | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/header-align.spec.ts`                                     | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/hero-home.spec.ts`                                        | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/home-grid-nav.spec.ts`                                    | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/objetivos-tactiles.spec.ts`                               | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/paquetes-a11y.spec.ts`                                    | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/portada-t7.spec.ts`                                       | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/process-page.spec.ts`                                     | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/products-structure.spec.ts`                               | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/referencias.spec.ts`                                      | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/retirada-fichas.spec.ts`                                  | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/revision-ruido.spec.ts`                                   | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/safe-network.spec.ts`                                     | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/seo-edge-prod.spec.ts`                                    | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/seo-routes.spec.ts`                                       | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/servicios-oferta.spec.ts`                                 | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/skip-link.spec.ts`                                        | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/theme.spec.ts`                                            | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/ui-matrix.spec.ts`                                        | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/visual-system.spec.ts`                                    | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tests/e2e/with-packages.mjs`                                        | CC-PRUEBAS       | CC-TRANSVERSAL       | revisado | Escenarios, helpers, fixtures y conservación de aserciones        |
| `tsconfig.json`                                                      | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
| `vercel.json`                                                        | CC-AUTOMATION    | CC-TRANSVERSAL       | revisado | Referencias técnicas y configuración; sin edición de CI/release   |
| `vitest.config.ts`                                                   | CC-TOOLING       | CC-TRANSVERSAL       | revisado | Funciones, CLI, exit codes, rutas y artefactos                    |
