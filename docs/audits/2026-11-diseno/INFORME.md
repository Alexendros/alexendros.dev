# Informe de diseño, accesibilidad y eficiencia comercial

- OT: `alexendrosdev-diseno-v1`, revisión 3.1.
- Tarea: T0, solo auditoría; no contiene cambios de producto.
- Base: `origin/main` = `7ae85bcf0c0ddcb441d907edb5947f78102cb087`.
- Fecha de medición: 3–4 de noviembre de 2026, Europe/Madrid.
- Resultado: los cinco hallazgos iniciales están cerrados en T5/T6. Ninguno era bloqueante. La adopción de la paleta exige las restricciones de contraste descritas abajo.

## 1. Integridad de fuentes y correcciones de la OT

Todos los bloques se copiaron tal como los devolvió el conector, con LF, sin valla ni salto final.

| Fuente                             | Bytes | SHA-256 / commit                                                   | Resultado                                        |
| ---------------------------------- | ----: | ------------------------------------------------------------------ | ------------------------------------------------ |
| Prompt OT, rev. 3.1                | 39617 | `4f568bc5fd0c11c1bde1ff1f754eca6545f81753be02cec6a90f290fc83c438c` | Coincide                                         |
| F1, bloque de código               | 19165 | `d89523880f3dc923869b66c3153778d9bb5d3b9f124773927328e05c63dcd9da` | Coincide                                         |
| rcp-v1.2.2, INICIO y FIN incluidos | 15907 | `05f60b8d14b37290d3a765518e32e53bd8228b0925dace67a44da209cc57d283` | Coincide e idéntico en el prompt y F1            |
| F2, bloque de código               | 35569 | `891e5d160436637b66979835b6e61cbe87ce8c7782b839afa925e2d1f4909e97` | Coincide                                         |
| F4, Atlaps                         |     — | `380b118de42de64e62333572ccc91f37e3bd0530`                         | Coincide con `git -C /tmp/atlaps rev-parse HEAD` |

Correcciones escritas durante la ejecución:

1. La revisión 3.1 aplica `-L 200` a la comprobación de etiquetas. Con la paginación corregida, `policy-exception` devuelve 1.
2. El Arquitecto fija `danger-dark / blueprint-deep` en **4,57:1**, calculado con `scripts/contrast-lib.mjs`. El valor `oklch(67.53% 0.1550 17.61)` no cambia. Sustituye al 4,59:1 que figuraba en la revisión 3.1.

## 2. Método y cobertura

- Inventario obtenido de `src/pages/**`, del HTML construido y del sitemap. Hay 23 documentos HTML revisados; 20 están en el sitemap. `/404/`, `/design-system/` y `/sobre-mi/` quedan fuera del sitemap de forma intencionada.
- Matriz principal: 23 rutas × 2 temas × 2 viewports (390×844 y 1280×900), con `prefers-reduced-motion: reduce`: **92 combinaciones**.
- En cada combinación: axe con `wcag2a`, `wcag2aa`, `wcag21aa` y `wcag22aa`; encabezados y landmarks; idioma; imágenes; desbordamiento; animaciones; CTA; ocho pasos de tabulación; ampliación del tamaño raíz de texto al 200 % y captura.
- Reflow: las 23 rutas × 2 temas a 320 px: **46 combinaciones**, sin desbordamiento de página. Espaciado de texto WCAG 1.4.12 en las mismas 46 combinaciones, sin pérdida de contenido; la tabla de cookies conserva su desplazamiento interno previsto.
- Paquetes: activación local temporal de `paquetesPublicados`, restaurada antes de continuar. Portada, `/servicios/` y `/contacto/` × 2 temas × 2 viewports: **12 combinaciones**, tres tarjetas presentes donde corresponde y axe 0. El archivo fuente y los precios no se modifican en esta rama.
- Suites existentes: Vitest 198/198 y Playwright 167/167, sin pruebas omitidas, fallidas ni inestables.
- LHCI local móvil, tres pasadas por URL. No se confunde esta medición de laboratorio con datos de usuarios reales.
- Revisión visual de las capturas de todo el inventario y revisión del contenido fuente. Las capturas son artefactos locales de `audit-out/diseno-t0/`; no se versionan.
- Límite: axe y la inspección de teclado no certifican por sí solos WCAG ni sustituyen una prueba con tecnologías de asistencia reales.

## 3. Inventario y revisión por página

«4/4» significa claro y oscuro a 390 y 1280 px, con axe 0 y revisión visual. La columna de hallazgos remite a la tabla siguiente; «—» indica que no se ha detectado un defecto con la evidencia disponible, no una certificación absoluta.

| Ruta                                 | Fuente                               | Sitemap                                    | Matriz                 | Hallazgos       |
| ------------------------------------ | ------------------------------------ | ------------------------------------------ | ---------------------- | --------------- |
| `/`                                  | `src/pages/index.astro`              | sí                                         | 4/4                    | A11Y-01         |
| `/accesibilidad/`                    | `src/pages/accesibilidad.astro`      | sí                                         | 4/4                    | —               |
| `/articulos/presupuesto-web/`        | `src/pages/articulos/[slug].astro`   | sí                                         | 4/4                    | —               |
| `/articulos/web-o-app-a-medida/`     | `src/pages/articulos/[slug].astro`   | sí                                         | 4/4                    | —               |
| `/contacto/`                         | `src/pages/contacto.astro`           | sí                                         | 4/4                    | —               |
| `/cookies/`                          | `src/pages/cookies.astro`            | sí                                         | 4/4                    | —               |
| `/design-system/`                    | `src/pages/design-system.astro`      | no; `noindex`                              | 4/4                    | A11Y-02         |
| `/experiencia/`                      | `src/pages/experiencia.astro`        | sí                                         | 4/4                    | —               |
| `/identidad/`                        | `src/pages/identidad.astro`          | sí                                         | 4/4                    | —               |
| `/metodo/`                           | `src/pages/metodo.astro`             | sí                                         | 4/4                    | —               |
| `/privacidad/`                       | `src/pages/privacidad.astro`         | sí                                         | 4/4                    | —               |
| `/referencias/`                      | `src/pages/referencias/index.astro`  | sí                                         | 4/4                    | —               |
| `/referencias/alexendros-me/`        | `src/pages/referencias/[slug].astro` | sí                                         | 4/4                    | —               |
| `/referencias/front-valencia/`       | `src/pages/referencias/[slug].astro` | sí                                         | 4/4                    | —               |
| `/referencias/graficas-nasve/`       | `src/pages/referencias/[slug].astro` | sí                                         | 4/4                    | —               |
| `/referencias/zedazo/`               | `src/pages/referencias/[slug].astro` | sí                                         | 4/4                    | —               |
| `/servicios/`                        | `src/pages/servicios/index.astro`    | sí                                         | 4/4                    | DIS-01, A11Y-03 |
| `/servicios/ciberseguridad/`         | `src/pages/servicios/[slug].astro`   | sí                                         | 4/4                    | DIS-02          |
| `/servicios/cumplimiento-normativo/` | `src/pages/servicios/[slug].astro`   | sí                                         | 4/4                    | DIS-02          |
| `/servicios/informe-comercial/`      | `src/pages/servicios/[slug].astro`   | sí                                         | 4/4                    | DIS-02          |
| `/servicios/software-a-medida/`      | `src/pages/servicios/[slug].astro`   | sí                                         | 4/4                    | DIS-02          |
| `/sobre-mi/`                         | `src/pages/sobre-mi.astro`           | no; `noindex`, canonical a `/experiencia/` | 4/4                    | —               |
| `/404/`                              | `src/pages/404.astro`                | no                                         | 4/4; HTTP 404 esperado | —               |

Las rutas `src/pages/api/**` son endpoints y `src/pages/r/[code].astro` es una redirección, no documentos HTML del inventario visual. No se han tocado.

## 4. Hallazgos

| ID      | Página                                 | Gravedad | Criterio        | Archivo:línea                                                                                       | Evidencia                                                                                                                                                                     | Cómo arreglarlo                                                                                                                                                                                                | Tarea |
| ------- | -------------------------------------- | -------- | --------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| DIS-01  | `/servicios/`                          | alta     | D3              | `src/components/NeedsConfigurator.astro:63-80`                                                      | A 390×844, en ambos temas, el primer CTA principal de `main` empieza en y=2930,6 px; queda fuera de la primera pantalla. El enlace «Contacto» de cabecera sí está disponible. | Colocar el CTA principal existente junto a la introducción, antes de las tarjetas y del configurador. Conservar el destino y el texto; dejar el CTA contextual del configurador sin competir con el principal. | T5    |
| DIS-02  | Las cuatro fichas `/servicios/<slug>/` | alta     | D3              | `src/pages/servicios/[slug].astro:174-198`                                                          | A 390×844, «Solicitar propuesta» empieza entre y=1733,0 y y=2152,5 px según la ficha, en ambos temas; nunca aparece en la primera pantalla.                                   | Situar la acción existente después del resumen comercial y antes del detalle extensivo. Mantener una sola acción principal, su contexto y el texto aprobado.                                                   | T5    |
| A11Y-01 | `/`                                    | alta     | WCAG 2.2, 1.4.4 | `src/components/sections/Hero.astro:9-13,24-28`; `src/components/sections/Hero.module.css:7-19`     | Con texto al 200 % y 390 px, `documentElement.scrollWidth=417` frente a 390 px, en claro y oscuro. El prompt y el botón principal sobrepasan el contenedor.                   | Permitir ruptura y envoltura del prompt y del CTA; aplicar `min-inline-size: 0`, tamaño máximo disponible y `white-space` adecuado sin reducir el objetivo de 44 px. Añadir la prueba de T1 con `A11Y-01`.     | T6    |
| A11Y-02 | `/design-system/`                      | media    | WCAG 2.2, 1.4.4 | `src/pages/design-system.astro:12-15`                                                               | Con texto al 200 % y 390 px, el ancho llega a 449 px, en claro y oscuro; el enlace `designsystem.alexendros.dev` no se rompe.                                                 | Aplicar ruptura segura al enlace largo y comprobar que no se corta contenido. Añadir la prueba de T1 con `A11Y-02`.                                                                                            | T6    |
| A11Y-03 | `/servicios/`                          | alta     | WCAG 2.2, 1.4.4 | `src/components/NeedsConfigurator.astro:63-80`; `src/components/NeedsConfigurator.module.css:45-62` | Con texto al 200 % y 390 px, el ancho llega a 402 px, en claro y oscuro. El CTA y las zonas internas superan el ancho disponible.                                             | Hacer flexibles los hijos, permitir que el CTA se ajuste y rompa su texto, y revisar resumen y módulos sin ocultar contenido. Añadir la prueba de T1 con `A11Y-03`.                                            | T6    |

### Resultado de los criterios sin hallazgo abierto

- **D1, D2, D4 y D5:** tono impersonal, propósito y límites explícitos; referencias e identidad localizables; compromisos y condiciones próximos a las acciones; un H1 y jerarquía de encabezados sin saltos en las 92 combinaciones.
- **D3 restante:** CTA de portada visible en y=405,9–453,9 px a 390×844; objetivos principales de 44–48 px. La cabecera ofrece `/contacto/` en todas las páginas, por lo que el camino es de un clic.
- **D6:** LHCI y CSS cumplen los umbrales; cifras en B0.4 y B0.7.
- **D7:** menú, filtros, diálogo, formulario y estados tienen cobertura en la suite Playwright. No se observan trampas de teclado, salidas ausentes ni cambios de contexto inesperados.
- **D8 restante:** axe 0 en 104 ejecuciones; 736 pasos de tabulación sin foco invisible o completamente fuera de la ventana; reflow 320 px y espaciado de texto sin pérdida; cero animaciones activas con movimiento reducido. Los enlaces inferiores a 24 px detectados son enlaces integrados en texto o están separados conforme a las excepciones de 2.5.8; no se contabilizan como fallo.

## 5. Línea base B0

| ID    | Valor medido                                                                                                                                                                                 | Comando / procedimiento                                                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| B0.1  | `true`                                                                                                                                                                                       | `gh api repos/Alexendros/alexendros.dev/commits/main -q .commit.verification.verified`                                                      |
| B0.2  | 1                                                                                                                                                                                            | `grep -c "export const paquetesPublicados: boolean = false" src/content/paquetes.ts`                                                        |
| B0.3  | 7 rutas; incluye `/servicios/informe-comercial`; solo `reducedMotion`, sin matriz de temas                                                                                                   | `tests/e2e/a11y.spec.ts:4-22`                                                                                                               |
| B0.4  | 23 páginas; máximo **22.495 B gzip** en `/servicios/`; todas ≤ 23.607 B                                                                                                                      | `pnpm audit:css` y suma gzip de las hojas enlazadas por cada HTML construido                                                                |
| B0.5  | 1                                                                                                                                                                                            | `gh label list -L 200 -R Alexendros/alexendros.dev --json name -q '.[].name' \| grep -cx policy-exception`                                  |
| B0.6  | Vitest **198/198**, 39 archivos; Playwright **167/167**, 25 specs; 0 omitidos y 0 flaky                                                                                                      | `pnpm exec vitest run --reporter=json`; `pnpm exec playwright test --reporter=json`; desglose abajo                                         |
| B0.7  | Portada: rendimiento 0,99; LCP 1882 ms; CLS 0. Contacto: 1,00; 1516 ms; 0. En ambas, accesibilidad/buenas prácticas/SEO = 1                                                                  | LHCI móvil, 3 pasadas por URL, con la configuración del repo y una configuración temporal que añade `/contacto/`                            |
| B0.8  | 33                                                                                                                                                                                           | `grep -cE '#[0-9a-fA-F]{3,6}\b' src/styles/global.css`                                                                                      |
| B0.9  | `pnpm@9.15.9`; `.nvmrc`=24; `engines.node`=24.x; runtime local Node v24.22.2                                                                                                                 | `node -p "require('./package.json').packageManager"`; `cat .nvmrc`; `node --version`                                                        |
| B0.10 | Sin `theme-boot`; tema en `src/scripts/themeToggle.ts`, clave `theme`, temas `alexlight`/`alexdark`; CSP aplicada con `'unsafe-inline'`; `INLINE_SCRIPT_HASHES=[]`; búsqueda de marcador = 0 | `git grep -c 'theme-boot BEGIN' -- src` devuelve 1 por ausencia de coincidencias; inspección de `vercel.json:189-193` y `src/lib/csp.ts:78` |
| B0.11 | `test -e src/styles/design-references.css` devuelve 1: no existe; capa «reservada» vacía                                                                                                     | `test -e src/styles/design-references.css`; `src/styles/global.css:62-64`                                                                   |

### B0.4 · CSS gzip por página

| Página                                                                                                          | Bytes gzip |
| --------------------------------------------------------------------------------------------------------------- | ---------: |
| `/servicios/`                                                                                                   |      22495 |
| `/`                                                                                                             |      22348 |
| `/404/`, artículos, `/metodo/`, fichas de referencia y fichas de servicio                                       |      22203 |
| `/referencias/`                                                                                                 |      22030 |
| `/accesibilidad/`, `/contacto/`, `/cookies/`, `/design-system/`, `/experiencia/`, `/identidad/`, `/privacidad/` |      21970 |

`pnpm audit:css` también registra 0 `transition: all`, 0 colores de texto/fondo fuera de las variables reconocidas y entre 5 y 7 tamaños tipográficos por página en sus rutas de medición.

### B0.6 · Vitest por archivo

| Archivo                                    |   Tests |
| ------------------------------------------ | ------: |
| `scripts/check-csp.test.ts`                |       4 |
| `scripts/check-public-pricing.test.ts`     |       6 |
| `scripts/contrast-lib.test.ts`             |       1 |
| `scripts/fix-vercel-runtime.test.ts`       |       6 |
| `src/content/commercial-coherence.test.ts` |       3 |
| `src/content/contact.test.ts`              |       2 |
| `src/content/contactContext.test.ts`       |       3 |
| `src/content/deliveryContract.test.ts`     |       2 |
| `src/content/ejes.test.ts`                 |       2 |
| `src/content/paquetes.test.ts`             |       3 |
| `src/content/portalModules.test.ts`        |       4 |
| `src/content/process.test.ts`              |       2 |
| `src/content/projects.test.ts`             |       5 |
| `src/content/redirects-web-para.test.ts`   |       1 |
| `src/content/redirects.test.ts`            |       3 |
| `src/content/servicePositioning.test.ts`   |       3 |
| `src/content/serviceProducts.test.ts`      |       3 |
| `src/content/services.catalog.test.ts`     |       8 |
| `src/content/site.test.ts`                 |       1 |
| `src/lib/alertWebhook.test.ts`             |       3 |
| `src/lib/checkClasses.test.ts`             |       3 |
| `src/lib/contactHandler.test.ts`           |      27 |
| `src/lib/contactIdempotency.test.ts`       |      13 |
| `src/lib/contactSchema.property.test.ts`   |       4 |
| `src/lib/contactSchema.test.ts`            |      23 |
| `src/lib/copyPolicy.test.ts`               |       5 |
| `src/lib/copyTypography.test.ts`           |       4 |
| `src/lib/csp.test.ts`                      |       2 |
| `src/lib/referral.test.ts`                 |       3 |
| `src/lib/securityHeaders.test.ts`          |       4 |
| `src/lib/smtpConfig.property.test.ts`      |       3 |
| `src/lib/smtpConfig.test.ts`               |       6 |
| `src/lib/themeColors.test.ts`              |       3 |
| `src/lib/turnstile.test.ts`                |       6 |
| `src/lib/viewTransitionBan.test.ts`        |       1 |
| `src/lib/tracking/capi.test.ts`            |       8 |
| `src/lib/tracking/consent.test.ts`         |       7 |
| `src/lib/tracking/events.test.ts`          |       5 |
| `src/lib/tracking/loaders.test.ts`         |       6 |
| **Total**                                  | **198** |

### B0.6 · Playwright por spec

| Spec                         |   Tests |
| ---------------------------- | ------: |
| `a11y.spec.ts`               |       7 |
| `chrome.spec.ts`             |       8 |
| `consent.spec.ts`            |      17 |
| `contact.spec.ts`            |      14 |
| `contacto.spec.ts`           |       7 |
| `cp09-a11y-ux.spec.ts`       |      15 |
| `critical.spec.ts`           |       5 |
| `detail-island.spec.ts`      |       6 |
| `entrega-legal.spec.ts`      |       4 |
| `entrega-salida.spec.ts`     |       1 |
| `entrega-servicios.spec.ts`  |       4 |
| `header-align.spec.ts`       |       2 |
| `hero-home.spec.ts`          |       1 |
| `home-grid-nav.spec.ts`      |       2 |
| `process-page.spec.ts`       |       9 |
| `products-structure.spec.ts` |       6 |
| `referencias.spec.ts`        |       3 |
| `revision-ruido.spec.ts`     |      10 |
| `safe-network.spec.ts`       |       2 |
| `seo-edge-prod.spec.ts`      |       3 |
| `seo-routes.spec.ts`         |       9 |
| `skip-link.spec.ts`          |       1 |
| `theme.spec.ts`              |       3 |
| `ui-matrix.spec.ts`          |      11 |
| `visual-system.spec.ts`      |      17 |
| **Total**                    | **167** |

## 6. Paleta Atlaps y contraste

La conversión con `oklchToRgb` reproduce exactamente los once hex de origen; no hay desviación de L o C que informar. Los ratios se calcularon con `scripts/contrast-lib.mjs`, no con el valor hexadecimal aproximado de los ajustes.

| Tema   | Uso                        | Par                             |      Ratio | Resultado                              |
| ------ | -------------------------- | ------------------------------- | ---------: | -------------------------------------- |
| claro  | texto                      | ink-graphite / paper-bone       |    14,56:1 | AA                                     |
| claro  | texto secundario           | ink-pencil / paper-bone         |     4,82:1 | AA                                     |
| claro  | texto sobre fondo sutil    | ink-graphite / paper-grid       |    12,48:1 | AA                                     |
| claro  | secundario sobre sutil     | ink-pencil / paper-grid         |     4,13:1 | Solo texto grande/UI; no texto normal  |
| claro  | texto de botón principal   | paper-bone / blueprint-deep     |    12,84:1 | AA                                     |
| claro  | botón hover                | paper-bone / blueprint-mid      |     7,77:1 | AA                                     |
| claro  | enlaces                    | blueprint-mid / paper-bone      |     7,77:1 | AA                                     |
| claro  | ámbar como texto o foco    | amber-signal / paper-bone       |     2,91:1 | NO                                     |
| claro  | texto sobre ámbar          | ink-graphite / amber-signal     |     5,00:1 | AA                                     |
| claro  | error                      | danger / paper-bone             |     5,19:1 | AA                                     |
| claro  | éxito                      | success / paper-bone            |     3,58:1 | Solo texto grande/UI                   |
| claro  | información                | blueprint-soft / paper-bone     |     3,96:1 | Solo texto grande/UI                   |
| claro  | borde de campo             | ink-pencil / paper-bone         |     4,82:1 | AA, también 1.4.11                     |
| oscuro | texto                      | paper-bone / blueprint-deep     |    12,84:1 | AA                                     |
| oscuro | texto secundario           | paper-grid / blueprint-deep     |    11,01:1 | AA                                     |
| oscuro | acento/CTA                 | amber-glow / blueprint-deep     |     6,12:1 | AA                                     |
| oscuro | texto de botón ámbar       | blueprint-deep / amber-glow     |     6,12:1 | AA                                     |
| oscuro | enlace azul original       | blueprint-soft / blueprint-deep |     3,24:1 | Solo texto grande/UI; no enlace normal |
| oscuro | ámbar señal                | amber-signal / blueprint-deep   |     4,41:1 | Solo texto grande/UI                   |
| oscuro | borde original             | blueprint-mid / blueprint-deep  |     1,65:1 | NO                                     |
| oscuro | texto sobre superficie mid | paper-bone / blueprint-mid      |     7,77:1 | AA                                     |
| oscuro | error original             | danger / blueprint-deep         |     2,48:1 | NO                                     |
| oscuro | borde ajustado             | border-dark / blueprint-deep    |     3,08:1 | AA para componentes                    |
| oscuro | error ajustado             | danger-dark / blueprint-deep    | **4,57:1** | AA; corrección aprobada por Arquitecto |
| oscuro | enlace ajustado            | link-dark / blueprint-deep      |     4,57:1 | AA                                     |

### Pares adicionales que condicionan el mapeo

| Par                           |   Ratio | Consecuencia obligatoria                                                     |
| ----------------------------- | ------: | ---------------------------------------------------------------------------- |
| amber-signal / blueprint-deep |  4,41:1 | El foco ámbar claro solo sería válido sobre deep, no sobre paper-bone ni mid |
| amber-signal / blueprint-mid  |  2,67:1 | No usar como foco sobre mid                                                  |
| amber-glow / blueprint-mid    |  3,70:1 | Vale para componentes, no para texto normal                                  |
| danger-dark / blueprint-mid   |  2,77:1 | No usar errores normales sobre mid                                           |
| border-dark / blueprint-mid   |  1,87:1 | No usar como único indicador de componente sobre mid                         |
| link-dark / blueprint-mid     |  2,76:1 | No usar enlaces normales sobre mid                                           |
| paper-grid / blueprint-mid    |  6,66:1 | Texto secundario oscuro válido sobre mid                                     |
| blueprint-deep / paper-grid   | 11,01:1 | Alternativa AA para texto oscuro sobre grid                                  |

**Conclusión:** no se pueden asignar indiscriminadamente `paper-grid` al fondo sutil claro ni `blueprint-mid` a las tarjetas oscuras mientras el validador exija todos los pares genéricos. El mapeo seguro siguiente evita esos fallos sin introducir colores nuevos.

## 7. Propuesta de mapeo a variables de tema

Esta es una propuesta para aprobación de Arquitecto, no una decisión aplicada.

| Variable de la web | Claro            | Oscuro           | Condición                                                                                                             |
| ------------------ | ---------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--bg`             | `paper-bone`     | `blueprint-deep` | —                                                                                                                     |
| `--bg-subtle`      | `paper-bone`     | `blueprint-deep` | Mantener la base segura para todos los textos; cualquier fondo grid/mid exige reglas específicas de la tabla anterior |
| `--fg`             | `ink-graphite`   | `paper-bone`     | —                                                                                                                     |
| `--fg-muted`       | `ink-pencil`     | `paper-grid`     | En claro no poner este texto normal sobre paper-grid                                                                  |
| `--brand`          | `blueprint-deep` | `amber-glow`     | Fondo de CTA                                                                                                          |
| `--brand-hover`    | `blueprint-mid`  | `paper-grid`     | Texto siempre con `--brand-fg`                                                                                        |
| `--brand-fg`       | `paper-bone`     | `blueprint-deep` | —                                                                                                                     |
| `--border-color`   | `paper-grid`     | `border-dark`    | En claro, separación decorativa; para identificar controles usar `--border-strong`                                    |
| `--border-strong`  | `ink-pencil`     | `paper-grid`     | ≥3:1 sobre las superficies base propuestas                                                                            |
| `--card`           | `paper-bone`     | `blueprint-deep` | La elevación y el borde separan la tarjeta; no usar mid como tarjeta genérica con enlaces/errores                     |
| `--danger`         | `danger`         | `danger-dark`    | Sobre las superficies base propuestas                                                                                 |
| Foco               | `blueprint-mid`  | `amber-glow`     | No usar ámbar claro sobre pergamino: 2,91:1                                                                           |
| Enlaces            | `blueprint-mid`  | `link-dark`      | Sobre las superficies base propuestas                                                                                 |

Superficies opcionales, solo con una revisión específica en T3/T4:

- `paper-grid` admite `ink-graphite` o `blueprint-deep` como texto normal, pero no `ink-pencil` normal.
- `blueprint-mid` admite `paper-bone` y `paper-grid`; no admite `link-dark` ni `danger-dark` para texto normal.
- `amber-signal` y `amber-glow` son fondos/acentos con la tinta indicada, nunca texto normal sobre pergamino.

## 8. Componentes Atlaps

| ID               | Veredicto        | Motivo y condición                                                                                                                                                                                              |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1 Botón        | **condicionado** | Aporta radio sobrio y hover coherente. El foco ámbar solo se adopta donde supere 3:1; en papel claro se usa blueprint-mid. Debe conservar 44 px en CTA y evitar el desbordamiento de A11Y-01/A11Y-03.           |
| C-2 Campo        | **condicionado** | Mejora el reconocimiento del foco del formulario. En claro, borde con ink-pencil y foco blueprint-mid; en oscuro sí puede usarse amber-glow. Sin cambiar el contrato del formulario.                            |
| C-3 Insignia     | **aprobado**     | Reutiliza los datos existentes de plazo y garantía cerca del CTA, sin inventar compromisos ni precios. Texto ink-graphite si el fondo es amber-signal; nunca ámbar como texto sobre pergamino. Prioridad en T4. |
| C-4 Tarjeta      | **aprobado**     | La sombra «papel» y el borde aportan separación sin desenfoque ni movimiento necesario. Usar el mapeo seguro y medir el presupuesto CSS antes de añadir reglas.                                                 |
| C-5 Foco único   | **condicionado** | Conviene una sola utilidad, pero con foco azul en papel claro y ámbar en oscuro. Debe cubrir cabecera, menú, tarjetas, formulario, diálogo y pie.                                                               |
| C-6 Tabs y toast | **condicionado** | Tabs: descartadas, no hay caso real. Toast: solo como presentación del mensaje de éxito ya existente en contacto, conservando `role="status"`; no añadir otra notificación.                                     |

No se adoptan Fraunces/Inter, fondos de cuadrícula, isolíneas ni un conmutador adicional.

## 9. Priorización recomendada

| Grupo       | IDs              | Tarea que los cierra | Orden recomendado                                                           |
| ----------- | ---------------- | -------------------- | --------------------------------------------------------------------------- |
| Bloqueantes | ninguno          | —                    | —                                                                           |
| Altos       | DIS-01, DIS-02   | T5                   | Después de T2/T3; CTA de índice y fichas antes de otros cambios comerciales |
| Altos       | A11Y-01, A11Y-03 | T6                   | Corrección de texto al 200 % con pruebas T1 asociadas                       |
| Medios      | A11Y-02          | T6                   | Ruptura del enlace largo en la página auxiliar                              |
| Bajos       | ninguno          | —                    | —                                                                           |

Antes de T1, Arquitecto debe confirmar la prioridad y el mapeo seguro. Antes de T5 solo se aplicarán textos aprobados por escrito; las correcciones DIS-01 y DIS-02 pueden reutilizar los textos y destinos actuales.

## 10. Riesgos y condiciones para las tareas siguientes

1. T1 debe cubrir las 23 rutas, ambos temas y los paquetes activados en tiempo de prueba. Cada fallo conocido llevará `test.fail()` con su ID hasta la tarea que lo cierre.
2. T2 solo crea variables; no cambia la apariencia. El PR no lleva fusión automática y T3 espera a su fusión manual.
3. T3 no debe usar los pares marcados «NO» ni los limitados a texto grande para texto normal. El mapeo propuesto evita los fallos genéricos del validador actual.
4. El máximo CSS actual es 22.495 B: quedan 1.112 B hasta 23.607 B y `/servicios/` está a 5 B de 22,5 KB. T3 y T4 deben medir antes y después, y retirar primero CSS no usado si se supera el punto de actuación.
5. No hay script inline `theme-boot`; T3 no debe crearlo. El endurecimiento de CSP queda fuera de esta OT.
6. `paquetesPublicados` permanece en `false`; la activación fue temporal y el build final vuelve a pasar la comprobación de precios públicos.

## 11. Verificación de cierre de T0

| Criterio    | Comando                                                                                    | Código de salida / resultado                              |
| ----------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| V1          | `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build` | 0; Vitest 198/198 y build correcto                        |
| V2          | `node scripts/check-csp.mjs`                                                               | 0; modo informe, sin cambios de CSP                       |
| V3          | `pnpm check:copy`                                                                          | 0                                                         |
| V4          | `pnpm check:public-pricing`                                                                | 0; 183 archivos                                           |
| V5          | `pnpm check:leaks`                                                                         | 0; fuentes y build limpios                                |
| V6          | `pnpm lint:css`                                                                            | 0                                                         |
| V7          | `pnpm check:contrast`                                                                      | 0; dos avisos `badge-soft` ya documentados, sin uso nuevo |
| V8          | `pnpm lint:a11y`                                                                           | 0; 7/7                                                    |
| V9          | `pnpm audit:css`                                                                           | 0; máximo por página 22.495 B gzip                        |
| V10         | `pnpm lhci`                                                                                | 0; 5 URL × 3 pasadas, todas las aserciones procesadas     |
| Adicionales | `pnpm format:check && pnpm check:records && pnpm audit:cookies && pnpm check:classes`      | 0                                                         |
| V11         | `gh pr checks <PR> --watch --fail-fast`                                                    | Pendiente: todavía no existe PR; T0 para antes de crearlo |

No se han retirado ni añadido tests de producto. Los artefactos temporales de auditoría están fuera del diff.

## 12. Cierre de hallazgos

| ID      | Estado            | Evidencia de cierre                                                                                                                                                                                                                                                                                                                          |
| ------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DIS-01  | **Cerrado en T5** | La acción existente se movió junto a la introducción de `/servicios/`. A 390×844 ocupa y=477,75–521,75 px, completamente visible. `DIS-01` ya no lleva `test.fail()`.                                                                                                                                                                        |
| DIS-02  | **Cerrado en T5** | «Siguiente paso» se colocó antes de las insignias comerciales en las cuatro fichas. A 390×844, las acciones ocupan: informe-comercial 605,36–649,36 px; cumplimiento-normativo 673,08–717,08 px; ciberseguridad 610,95–654,95 px; software-a-medida 625,36–669,36 px. Todas completas y a 44 px de alto. `DIS-02` ya no lleva `test.fail()`. |
| A11Y-01 | **Cerrado en T6** | Prompt y botones con ancho máximo y ruptura de texto; a 390 px con texto al 200 % no hay desbordamiento horizontal. Su prueba ya no lleva `test.fail()`.                                                                                                                                                                                     |
| A11Y-02 | **Cerrado en T6** | El enlace largo reutiliza `legal-prose` con `overflow-wrap: anywhere`; a 390 px con texto al 200 % no hay desbordamiento. Su prueba ya no lleva `test.fail()`.                                                                                                                                                                               |
| A11Y-03 | **Cerrado en T6** | Configurador, acciones y resumen con ancho mínimo/máximo y ruptura de texto; a 390 px con texto al 200 % no hay desbordamiento. Su prueba ya no lleva `test.fail()`.                                                                                                                                                                         |

La comprobación específica de estas cinco acciones pasa 5/5 y la estructura de las fichas 6/6. Las tres pruebas de texto al 200 % pasan 3/3 y `diseno-interaccion.spec.ts` completa 61/61. No se añadieron textos comerciales ni precios.

## 13. T7 · línea base, inventario y hallazgos

- OT: `alexendrosdev-diseno-v2`, tarea T7.0; solo auditoría, pruebas y controles, sin cambios de producto.
- Base: `origin/main` = `03a504855e16ac591c8d119368201e5834938230`.
- Fecha de medición: 4 de noviembre de 2026, Europe/Madrid.
- Fuentes F1–F8 abiertas y leídas. `/workspace/preview-review/grid.css` no existe; para T7.5 queda como referencia el literal del prompt, tal como autoriza F4.
- B0.8 quedó corregido por el Arquitecto: dos usos iniciales de `<Commitments>` y uno tras T7.2. El margen de `software-a-medida` quedó registrado como fallo conocido `KF-V10-SAM`; hasta T7.3 solo bloquea si supera 25.598 B.

### 13.1 Integridad de fuentes

| Fuente                             | Bytes | SHA-256                                                            | Resultado                     |
| ---------------------------------- | ----: | ------------------------------------------------------------------ | ----------------------------- |
| Prompt OT T7 actualizado           | 47901 | `1f5bc24a639dab6fcf190f21828f7d27b8b10b6c43f9172c293be6d2305a11c1` | Coincide                      |
| F1, bloque de código               | 19165 | `d89523880f3dc923869b66c3153778d9bb5d3b9f124773927328e05c63dcd9da` | Coincide                      |
| rcp-v1.2.2, INICIO y FIN incluidos | 15907 | `05f60b8d14b37290d3a765518e32e53bd8228b0925dace67a44da209cc57d283` | Coincide en F1 y en el prompt |
| F2, bloque de código               | 39759 | `fa31d3a997f14b12456171bc6847ff3b12c65ac3d426419f394e13b161511a32` | Coincide                      |

Todos los bloques se copiaron con LF, sin valla ni salto final, conforme a S5.

### 13.2 Línea base B0

| ID    | Valor medido                                                                        | Comando / procedimiento                                                                                    |
| ----- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| B0.1  | `true`                                                                              | `gh api repos/Alexendros/alexendros.dev/commits/main -q .commit.verification.verified`                     |
| B0.2  | 1; paquetes ocultos                                                                 | `grep -c "export const paquetesPublicados: boolean = false" src/content/paquetes.ts`                       |
| B0.3  | Portada 25.015 B; contacto 24.275 B; software-a-medida e informe-comercial 25.598 B | LHCI móvil, 3 pasadas por URL; máximo por página                                                           |
| B0.4  | Máximo 22.888 B gzip en `/servicios/`                                               | Suma gzip de las hojas enlazadas por cada HTML construido; `pnpm audit:css` como control de ejecución      |
| B0.5  | 1                                                                                   | `gh label list -L 200 -R Alexendros/alexendros.dev --json name -q '.[].name' \| grep -cx policy-exception` |
| B0.6  | Vitest 198/198; Playwright 267/267; axe 46/46; estructura 6/6; `test.fail()` 0      | `pnpm exec playwright test --reporter=json`; `pnpm test`; búsqueda en `tests`                              |
| B0.7  | Portada 0,99; contacto 1,00; software-a-medida 1,00; CLS 0 en las tres              | LHCI móvil, 3 pasadas; LCP 1812–1880 ms en portada y 1503–1655 ms en contacto                              |
| B0.8  | 2 usos (`Hero.astro:32`, `metodo.astro:44`); 3 compromisos                          | `git grep -n '<Commitments' -- src`; `grep -c "id: '" src/content/commitments.ts`                          |
| B0.9  | 4 tarjetas; DetailIsland presente; configurador 1; FAQ 1; paquetes 0                | Conteo de elementos en `.vercel/output/static/servicios/index.html` y DOM de preview                       |
| B0.10 | 0                                                                                   | `git grep -n 'bp-line\|bp-major' -- src` no devuelve coincidencias                                         |
| B0.11 | `pnpm@9.15.9`; `.nvmrc` = 24; Node v24.22.2                                         | `node -p "require('./package.json').packageManager"`; `cat .nvmrc`; `node --version`                       |

### 13.3 Inventario A1–A8

| Alcance | Ubicación actual                                                                                                       | Cambio previsto                                                                       |
| ------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| A1      | `src/components/sections/Hero.astro:3,32`; `src/content/commitments.ts`; `src/pages/metodo.astro:44`                   | Retirar el uso de portada en T7.2; conservar componente, datos y uso en `/metodo`     |
| A2      | `src/pages/servicios/index.astro:3-79`                                                                                 | Reducir el índice en T7.2 a paquetes condicionados, Colaboración y acción             |
| A2b     | `src/content/services.ts:70-320`; `vercel.json:92-122`; sitemap y JSON-LD generados                                    | Retirar tres fichas y sus referencias con 301 en T7.1                                 |
| A3      | `src/pages/servicios/[slug].astro:52-173`; `tests/e2e/products-structure.spec.ts`                                      | Mantener una secuencia común, verificada por `fichas-formato.spec.ts`                 |
| A4      | `src/pages/servicios/[slug].astro:71-102`; `src/components/ServiceBadges.astro:15-29`; `ServiceBadges.module.css:3-51` | Rehacer «Siguiente paso» y los tres datos en T7.3                                     |
| A5      | `src/components/sections/Hero.astro:7-32`; `Hero.module.css:3-31`; CSS de tema y botones existente                     | Afinar jerarquía, ritmo y acciones en T7.4                                            |
| A6      | `src/components/sections/Hero.astro:7`; `Hero.module.css:3-5`; sin `bp-line`/`bp-major`                                | Añadir la rejilla solo al pseudo-elemento del hero en T7.5                            |
| A7      | `lighthouserc.json`; hojas servidas en portada, contacto y software-a-medida                                           | Control local `scripts/check-css-margin.mjs`; recorte de reglas sin uso en T7.3       |
| A8      | `ContactForm.astro:90-95,205-208`; `NeedsConfigurator.astro:28-33,74-82`; `Header.astro:25`; `Footer.astro:41-43`      | Objetivos de 44 px en T7.6; el enlace del configurador solo se prueba mientras exista |

### 13.4 Hallazgos nuevos

| ID      | Página                                                            | Gravedad | Criterio                                     | Archivo:línea                                                                                                     | Evidencia                                                                                                                                                    | Cómo arreglarlo                                                                                                                                                    | Tarea       |
| ------- | ----------------------------------------------------------------- | -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| DIS-03  | `/servicios/software-a-medida/`                                   | alta     | D5; WCAG 1.3.1                               | `src/pages/servicios/[slug].astro:71-102`; `ServiceBadges.astro:15-29`; `ServiceBadges.module.css:3-51`           | Separación acción/lista 0 px; clases `badge/delivery/badge`; radios 9999/4/9999 px y padding calculado 0 en claro y oscuro. Entrega no comparte presentación | Integrar introducción, botón y `dl` uniforme; tres pares con la misma clase, sin pastillas, en la matriz de 390/1280, dos temas y texto al 200 %                   | T7.3        |
| A11Y-04 | Contacto, servicios, cabecera y pie                               | media    | WCAG 2.2, 2.5.5; objetivo reforzado de la OT | `ContactForm.astro:90-95,205-208`; `NeedsConfigurator.astro:28-33,74-82`; `Header.astro:25`; `Footer.astro:41-43` | Casillas 24×24 px; enlace sin módulos 24 px de alto; logo 40 px de alto; GitHub 42 px y Correo 41 px de ancho                                                | Ampliar el área interactiva a 44×44 px sin alterar el resto del aspecto                                                                                            | T7.6        |
| DIS-04  | `/`                                                               | media    | D2; Nielsen 8                                | `src/components/sections/Hero.astro:32`                                                                           | Tres `.commitment-item` en portada                                                                                                                           | Retirar solo este uso; conservar `Commitments.astro`, sus datos y `/metodo`                                                                                        | T7.2        |
| DIS-05  | `/servicios/`                                                     | alta     | D2, D3; Nielsen 8                            | `src/pages/servicios/index.astro:20-79`                                                                           | Cuatro tarjetas, DetailIsland, un configurador y una FAQ; el contenido actual supera la oferta vigente                                                       | Dejar paquetes condicionados, la tarjeta de Colaboración y la acción existente; probar también con paquetes activados                                              | T7.2        |
| DIS-06  | `/servicios/informe-comercial/` y `/servicios/software-a-medida/` | alta     | D6; presupuesto V10                          | Hojas CSS servidas; `ServiceBadges.module.css` en la ficha                                                        | Ambas miden 25.598 B: margen 2 B sobre 25.600 y 498 B por encima del control de 25.100                                                                       | Retirar informe-comercial en T7.1. `KF-V10-SAM` permite software-a-medida hasta 25.598 B solo antes de T7.3; después quitar reglas sin uso con evidencia por regla | T7.1 y T7.3 |
| DIS-07  | `/`                                                               | media    | D5                                           | `src/components/sections/Hero.astro:17-20`; `Hero.module.css`                                                     | H1 calculado 28,835 px a 390 (esperado 36) y 42,56 px a 1280 (esperado 58,88)                                                                                | Aplicar el clamp y la jerarquía de T7.4 sin sacar el CTA de la primera pantalla                                                                                    | T7.4        |
| DIS-08  | `/`                                                               | media    | D1, D5                                       | `src/components/sections/Hero.astro:7`; `Hero.module.css`                                                         | `background-image: none` en `::before` del hero, en claro y oscuro                                                                                           | Añadir rejilla con variables Atlaps y desactivarla en contraste alto/colores forzados                                                                              | T7.5        |
| DIS-09  | Las tres fichas de revisiones                                     | alta     | D2; retirada DA-1                            | `src/content/services.ts`; `vercel.json`; sitemap y HTML construido                                               | Las rutas responden 200 en preview, no existen sus reglas 301 y los slugs siguen en sitemap, JSON-LD y enlaces                                               | Borrar datos y referencias; añadir 301 de un salto a `/servicios/` con y sin barra, incluidos los alias existentes                                                 | T7.1        |

Todos los hallazgos anteriores están abiertos al cerrar T7.0. No se han redactado textos comerciales nuevos.

### 13.5 V10 y bytes por regla

| Página                          | Rendimiento | CLS | V10 hojas de estilo | Margen hasta 25.600 | Control T7                             |
| ------------------------------- | ----------: | --: | ------------------: | ------------------: | -------------------------------------- |
| `/`                             |        0,99 |   0 |            25.015 B |               585 B | Cumple ≤25.100 B                       |
| `/contacto/`                    |        1,00 |   0 |            24.275 B |             1.325 B | Cumple ≤25.100 B                       |
| `/servicios/software-a-medida/` |        1,00 |   0 |            25.598 B |                 2 B | `KF-V10-SAM`; máximo temporal 25.598 B |
| `/servicios/informe-comercial/` |        1,00 |   0 |            25.598 B |                 2 B | Se retira en T7.1                      |

La tabla completa por regla quedó generada como artefacto local no versionado en `/tmp/t7-css-rules-base.json` y `/tmp/t7-css-rules-base.md` (C9). Separa los bytes existentes en main de los nuevos: todos son de main y la columna nueva es 0. Las reglas de mayor peso y las específicas del alcance son:

| Página                          | Regla                                | Bytes existentes | Bytes nuevos |
| ------------------------------- | ------------------------------------ | ---------------: | -----------: |
| `/`                             | `:root` (cookie banner)              |            1.955 |            0 |
| `/`                             | `.cc--darkmode`                      |            1.692 |            0 |
| `/`                             | `*,:before,:after,::backdrop`        |            1.612 |            0 |
| `/`                             | `:root,:host`                        |            1.456 |            0 |
| `/`                             | `.btn`                               |            1.375 |            0 |
| `/`                             | `._terminal-prompt_zhl31_7`          |              349 |            0 |
| `/`                             | `._surface_zhl31_3`                  |               60 |            0 |
| `/`                             | `._actions_zhl31_24`                 |               38 |            0 |
| `/contacto/`                    | `:root` (cookie banner)              |            1.955 |            0 |
| `/contacto/`                    | `.cc--darkmode`                      |            1.692 |            0 |
| `/contacto/`                    | `*,:before,:after,::backdrop`        |            1.612 |            0 |
| `/contacto/`                    | `:root,:host`                        |            1.456 |            0 |
| `/contacto/`                    | `.btn`                               |            1.375 |            0 |
| `/servicios/software-a-medida/` | `:root` (cookie banner)              |            1.955 |            0 |
| `/servicios/software-a-medida/` | `.cc--darkmode`                      |            1.692 |            0 |
| `/servicios/software-a-medida/` | `*,:before,:after,::backdrop`        |            1.612 |            0 |
| `/servicios/software-a-medida/` | `:root,:host`                        |            1.456 |            0 |
| `/servicios/software-a-medida/` | `.btn`                               |            1.375 |            0 |
| `/servicios/software-a-medida/` | `._badge_11vmg_10`                   |              230 |            0 |
| `/servicios/software-a-medida/` | `._delivery_11vmg_31`                |              134 |            0 |
| `/servicios/software-a-medida/` | `._group_11vmg_3`                    |          80 + 63 |            0 |
| `/servicios/software-a-medida/` | `._delivery_11vmg_31 dd`             |               58 |            0 |
| `/servicios/software-a-medida/` | `._delivery_11vmg_31 dt`             |               46 |            0 |
| `/servicios/software-a-medida/` | `._delivery_11vmg_31` en media query |               40 |            0 |
| `/servicios/software-a-medida/` | `._badge_11vmg_10 dt`                |               37 |            0 |
| `/servicios/software-a-medida/` | `._badge_11vmg_10 dd`                |               30 |            0 |

Hojas servidas sin comprimir: portada 95.093 + 33.708 + 826 B; contacto 95.093 + 33.708 + 84 B; software-a-medida 337 + 95.093 + 33.708 + 752 B. La cifra V10 es la medida por LHCI en `resource-summary`, no la suma sin comprimir.

### 13.6 Cobertura roja añadida

| Prueba                                           | Archivo                                | Fallo asociado                                    |
| ------------------------------------------------ | -------------------------------------- | ------------------------------------------------- |
| Formato completo de ficha en 8 combinaciones     | `tests/e2e/fichas-formato.spec.ts`     | DIS-03                                            |
| Compromisos, clamp y rejilla de portada          | `tests/e2e/portada-t7.spec.ts`         | DIS-04, DIS-07, DIS-08                            |
| Oferta y solapes de `/servicios/`                | `tests/e2e/servicios-oferta.spec.ts`   | DIS-05; la ausencia de solapes ya pasa en la base |
| Casillas, enlace opcional, logo, GitHub y Correo | `tests/e2e/objetivos-tactiles.spec.ts` | A11Y-04                                           |
| Redirecciones y ausencia en artefactos           | `tests/e2e/retirada-fichas.spec.ts`    | DIS-09                                            |
| Oferta con paquetes temporales y axe             | `tests/e2e/paquetes-a11y.spec.ts`      | DIS-05                                            |
| Margen CSS con excepción temporal                | `scripts/check-css-margin.mjs`         | KF-V10-SAM                                        |

Las cinco specs nuevas se añaden a `e2e-critical`; la ejecución con paquetes sigue usando `with-packages.mjs` y restaura `paquetesPublicados=false`. La secuencia de secciones propuesta para las fichas restantes es `next-step`, `commercial`, `audience`, `process`, `deliverables`, `exclusions`, `requirements`, `technical`; queda pendiente de confirmación del Arquitecto al terminar T7.0.
