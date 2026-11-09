# Hallazgos — Clean Code integral

**Método:** revisión local por secciones, búsquedas transversales y conciliación con `coverage.md`.
**Regla:** un smell no implica edición. Solo se aceptan transformaciones pequeñas que preservan el comportamiento.

## Aceptados

### CC-SERVIDOR-001 — Construcción triplicada del estado `processing`

- **Archivo:** `src/lib/contactIdempotency.ts`, dentro de `beginContactIdempotency`.
- **Prioridad:** P1.
- **Obstáculo:** la misma estructura de claim, expiraciones y ownership se repite en reintento, lease vencido y creación inicial; un cambio futuro podría divergir.
- **Transformación:** extraer una función local que construya el registro `processing`; conservar llamadas, CAS, recursión y orden async.
- **Invariantes:** fingerprints, owner/request IDs, TTL, lease, estados devueltos, llamadas al store y reintentos.
- **Verificación:** `pnpm vitest run src/lib/contactIdempotency.test.ts src/lib/contactHandler.test.ts`; typecheck y contrato.
- **Decisión:** aceptar.

### CC-SERVIDOR-002 — Cadena de lectura de cookie de referido sin consumidores

- **Archivo:** `src/lib/referral.ts`.
- **Prioridad:** P3.
- **Obstáculo:** `readReferralCookie` no puede leer la cookie HttpOnly y carece de consumidores; mantiene además `referralFromCookieHeader` y `parseCookieHeader` solo para esa ruta imposible.
- **Evidencia:** búsqueda de los tres símbolos en `src`, `scripts`, `tests`, configuración y documentación; solo autorreferencias. La cookie se escribe en `/r/[code]` y el flujo activo usa `captureReferralFromLocation`.
- **Transformación:** eliminar los tres helpers, sin tocar `referralCookieHeader`, normalización ni captura de URL.
- **Invariantes:** formato de cookie, allowlist, redirect y limpieza de `?ref=`.
- **Verificación:** `pnpm vitest run src/lib/referral.test.ts`; build y búsqueda posterior.
- **Decisión:** aceptar.

### CC-SERVIDOR-003 — Estado `mailAccepted` redundante

- **Archivo:** `src/lib/contactHandler.ts`.
- **Prioridad:** P3.
- **Obstáculo:** la variable se inicializa a `false`, se asigna a `true` tras `await sendMail` y solo se lee en un bloque alcanzable exclusivamente después de esa asignación; el `catch` retorna antes.
- **Transformación:** eliminar la variable y la conjunción redundante.
- **Invariantes:** `unknown` cuando SMTP aceptó pero no pudo persistirse `accepted`; respuestas, logs y llamadas a idempotencia.
- **Verificación:** `pnpm test:contract`.
- **Decisión:** aceptar.

### CC-CLIENTE-001 — Cadena de ternarios para mensajes de validación

- **Archivo:** `src/scripts/contactForm.ts`, `showFieldErrors`.
- **Prioridad:** P1.
- **Obstáculo:** seis niveles de ternarios mezclan selección de texto con manipulación DOM y dificultan localizar cada mensaje.
- **Transformación:** mover los textos a una tabla constante por campo y usar `error.cause` como fallback; conservar cada literal exacto.
- **Invariantes:** copy, errores mostrados, foco, `aria-invalid`, `aria-describedby`, resumen y orden.
- **Verificación:** `pnpm playwright test tests/e2e/contact.spec.ts tests/e2e/contacto.spec.ts`; typecheck.
- **Decisión:** aceptar.

### CC-TRANSVERSAL-001 — Implementación legada de referencias sin entry point

- **Archivo:** `src/scripts/referencias.ts`.
- **Prioridad:** P3.
- **Obstáculo:** mantiene una segunda implementación de filtro y diálogo, con textos y selectores distintos, aunque la página usa `referenceFilter.ts` y `detailIsland.ts`.
- **Evidencia:** ningún import de `initReferencias` ni del archivo; no existen los hooks `#ref-dialog`/`data-project-template` requeridos por esa implementación. La página activa y sus E2E usan los módulos actuales.
- **Transformación:** eliminar el archivo legado.
- **Invariantes:** filtro, live region, diálogos, URLs, foco y CTA de referencias.
- **Verificación:** `pnpm playwright test tests/e2e/referencias.spec.ts tests/e2e/detail-island.spec.ts`; build y búsqueda posterior.
- **Decisión:** aceptar.

### CC-TOOLING-001 — Comentarios de runtime desactualizados

- **Archivos:** `astro.config.mjs`, `scripts/fix-vercel-runtime.mjs`.
- **Prioridad:** P3.
- **Obstáculo:** los comentarios mencionan adapter 7.8/Node 18–20 y afirman que el script deja Node 22, mientras el código deriva el runtime de `engines.node` y el manifiesto actual declara 24.x.
- **Transformación:** describir el mecanismo actual sin cambiar configuración ni runtime.
- **Invariantes:** adapter, build, `engines.node`, `.nvmrc` y corrección de `.vc-config.json`.
- **Verificación:** tests de `fix-vercel-runtime` y build.
- **Decisión:** aceptar.

## Rechazados para edición

### CC-UI-001 — Hint de `is:inline` en JSON-LD

- **Decisión:** rechazar. `scripts/check-classes.mjs` prohíbe explícitamente `is:inline`; Astro ya trata ese script como inline y el build es correcto. El hint no justifica contradecir el contrato del repo.

### CC-UI-002 — Hint de `CONTACT_DEST` sin uso

- **Decisión:** rechazar. `src/pages/r/[code].astro` usa la constante en `Astro.redirect(CONTACT_DEST, 302)`. El hint es un falso positivo del análisis; borrarla sería incorrecto.

### CC-CLIENTE-002 — Hint de default import en el CMP

- **Decisión:** rechazar. `src/scripts/cookieBanner.ts` documenta que el build ESM usa exports nombrados y que el default no existe en runtime. No cambiar por una sugerencia de tipos.

### CC-CLIENTE-003 — Normalización duplicada de reason/origin

- **Decisión:** diferir. Hay una decisión común entre prerender y cliente, pero extraerla amplía API y superficie de contacto para un beneficio menor que los hallazgos aceptados. Los E2E actuales verifican el comportamiento.

### CC-CONTENIDO-001 — Helpers Zod con nombres similares

- **Decisión:** rechazar. `nonEmptyTrimmed` en módulos de contenido distintos es una pequeña expresión local, no una decisión de negocio que deba acoplar catálogos independientes.

### CC-ESTILOS-001 — Reglas `.more-link` y subrayados repetidos

- **Decisión:** rechazar. Son reglas locales de CSS Modules con ownership deliberado; moverlas al global rompería la frontera adoptada para ahorrar tres declaraciones.

### CC-PRUEBAS-001 — `page as any` en tres pruebas axe

- **Decisión:** diferir. Es deuda de tipado localizada entre versiones de Playwright/axe, no motivo para cambiar dependencias o crear un wrapper que oculte el conflicto. No afecta al runtime publicado.

## Derivados fuera del refactor neutro

### CC-CONTENIDO-002 — Modelo económico inactivo

- **Destino:** EST-09 / decisión editorial. `src/content/paquetes.ts` conserva precios y condiciones detrás de `paquetesPublicados = false`. No se eliminan ni reescriben durante Clean Code; los gates confirman que no llegan al HTML actual.

### CC-AUTOMATION-001 — Discordancia Node 22/24

- **Destino:** mantenedor. `package.json` declara 24.x mientras documentación antigua menciona 22. Se corrigen solo comentarios que describen incorrectamente el mecanismo de `fix-vercel-runtime`; no se cambia runtime ni documentación operativa global sin decisión.

### CC-UI-003 — Origen `404` fuera de `contactOrigins`

- **Destino:** posible corrección de comportamiento con plan-validators. El CTA de `404.astro` envía `origen=404`, valor que el esquema descarta. No se modifica en esta limpieza porque exige decidir y probar el contrato esperado.

### CC-CLIENTE-004 — Tamaño y closures de `initContactForm`

- **Destino:** refactor futuro por responsabilidades. El archivo mezcla inicialización, validación, envío, Turnstile y accesibilidad, pero dividirlo exige preservar un estado compartido extenso. Solo se acepta la mejora localizada CC-CLIENTE-001.

## Balance

- Aceptados: 6.
- Rechazados o diferidos: 7.
- Derivados: 4.
- P0 aceptados: 0. No se detectó un P0 que pudiera resolverse como refactor neutro.
