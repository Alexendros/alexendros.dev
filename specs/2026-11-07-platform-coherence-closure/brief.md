# Brief — Platform coherence closure

**Fecha:** 2026-11-07  
**Repo:** Alexendros/alexendros.dev  
**Commit de referencia de las auditorías:** 7541a20952623165449c46b959935997c7fbc796

## Objetivo

Cerrar de forma verificable las cuatro inconsistencias de severidad major detectadas en las auditorías design-system-audit y repo-audit:

1. Referencia rota a `designsystem.alexendros.dev` (404) y declaración contractual que apunta a un destino inexistente.
2. CTAs del Hero que usan clases daisyUI directas en lugar del componente `Button.astro` del design system.
3. Declaración de Node 22 en README frente a `engines.node` / `.nvmrc` en 24.
4. Declaración de tipografía Inter en ARCHITECTURE.md frente a Source Sans 3 Variable realmente empaquetada y usada.

Al terminar, el mantenedor debe poder verificar con comandos de CI existentes y un checklist de aceptación humano que las cuatro inconsistencias están resueltas y que el contrato documental y de componentes vuelve a ser fuente única de verdad.

## Actor principal

Mantenedor del repositorio (Alexendros) y agentes de código que operan bajo el contrato de `AGENTS.md`.

Queda fuera: usuarios finales del sitio comercial, colaboradores externos sin acceso de escritura, procesos de marketing o ampliación de catálogo.

## Problema actual y coste de no hacerlo

Las discrepancias entre código, documentación de arquitectura y referencias externas erosionan la fuente única de verdad del design system y de la plataforma. Cada inconsistencia obliga a comprobaciones manuales adicionales y aumenta el riesgo de que futuros agentes o PRs reintroduzcan desviaciones. El dominio `designsystem.alexendros.dev` declarado como vitrina viva no existe, por lo que el contrato de `diseno.md` y de la ruta local `/design-system` es falso.

## Dentro de alcance

- Recuperar o desplegar `designsystem.alexendros.dev` como vitrina viva del design system (opción 3A).
- Unificar los CTAs del Hero bajo `Button.astro` (o documentar excepción explícita y justificada en el contrato).
- Alinear la versión de Node documentada (README, engines, `.nvmrc`).
- Alinear la declaración de tipografía en ARCHITECTURE.md con las fuentes realmente empaquetadas (Source Sans 3 Variable + JetBrains Mono).
- Checklist de aceptación en `docs/plans/` (o ruta equivalente del repo) que permita revisión humana además de los gates automatizados.

## Fuera de alcance (no-objetivos)

- Implementar componentes de producto nuevos.
- Migrar de framework o de librería de componentes.
- Cambiar catálogo de servicios, precios o copy comercial.
- Ampliar tracking, CMP o consentimientos.
- Reescribir el inventario histórico `docs/design/inventario-v1.md` más allá de lo necesario para no contradecir el estado actual.
- Resolver hallazgos minor de las auditorías (rangos caret, inventario desactualizado completo, etc.) salvo que sean consecuencia directa de las cuatro major.
- Abrir o cerrar SDD de features comerciales.

## Restricciones fijas

- Stack y contratos de `AGENTS.md` (Astro 7, TypeScript, Tailwind 4, daisyUI 5, Zod, pnpm, sin islas React, sin CMS, sin Google Fonts, fail-closed en contacto, tracking solo con consentimiento, etc.).
- Tokens y reglas de `docs/standards/website/diseno.md`.
- CI canónico existente: quality → test → build → smoke → e2e-critical + gates de seguridad.
- Trabajo desde `main` vía rama `cursor/…` + PR en borrador.
- Licencia MIT.
- Sin restricción de número de PRs; se prioriza la calidad del contrato (opción 2C).

## Criterio de hecho

1. Los comandos de CI existentes (`pnpm typecheck`, `pnpm lint`, `pnpm lint:css`, `pnpm check:contrast`, `pnpm check:classes`, `pnpm test`, e2e-critical relevantes, etc.) permanecen en verde tras los cambios.
2. Existe un checklist de aceptación en `docs/plans/` (o ruta equivalente) que enumera las cuatro inconsistencias y la prueba observable de cada una (comando, URL o lectura de fichero).
3. `designsystem.alexendros.dev` responde 200 con contenido de design system, o el contrato documental se actualiza de forma coherente si la recuperación del dominio se considera imposible dentro del ciclo (esta segunda vía solo se activaría con decisión explícita posterior).
4. README, `package.json` engines y `.nvmrc` declaran la misma versión de Node.
5. ARCHITECTURE.md declara las fuentes realmente usadas.
6. Los CTAs del Hero usan `Button.astro` (o excepción documentada en `diseno.md`).

## Hipótesis de stack

Se confirma el stack del repositorio. No se propone cambio.

## Críticos resueltos / abiertos

- Resueltos: objetivo, actor, problema, alcance, no-objetivos, restricciones, criterio de hecho, destino del design system externo (recuperar/desplegar), ritmo (sin límite de PRs, calidad primero).
- Abiertos: ninguno crítico para pasar a Contraste.
