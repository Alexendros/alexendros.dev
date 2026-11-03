# Especificación — UI, CSS y diseño (iteración 2)

Fecha: 2026-11-02. Estado: **borrador para aprobación**. No se ha modificado código de producto.

Repo: `Alexendros/alexendros.dev`. Rama actual: `main` limpia. Baseline verificado:
`pnpm typecheck`, `pnpm lint` y `pnpm test` (178/178). Producción responde 200 con barra final
en `/`, `/servicios/`, `/referencias/`, `/metodo/` y `/experiencia/`.

Documento de origen: auditoría externa «Plan de corrección, mejora y perfeccionamiento de UI,
CSS, componentes y diseño» (2026-11-02). Esta especificación **no la copia**: fija qué es cierto
en este repositorio, qué se descarta y qué se compromete a entregar.

## 1. Objetivo

Cerrar la deuda visual verificable del portal sin reabrir decisiones comerciales ni reescribir
lo que ya funciona:

1. Eliminar contenido interno publicado y duplicaciones de copy.
2. Unificar iconografía, controles y estados interactivos con semántica accesible.
3. Reducir la portada a una entrada clara y dejar el detalle en las páginas reales.
4. Ordenar tipografía, medida, color y ritmo con los tokens existentes de daisyUI/Tailwind 4.
5. Añadir evidencias reproducibles (axe, teclado, CSS en ejecución, capturas y LHCI) y dejar
   gates que impidan la regresión.

## 2. Verificación de premisas de la auditoría

La auditoría se hizo sobre HTML extraído, no sobre el código. Estas son las diferencias que
condicionan el alcance:

| Premisa de la auditoría                            | Comprobación local (2026-11-02)                                                                                                                     | Consecuencia                                                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Dos familias de plantillas; skip-link `#contenido` | Un solo `Layout.astro`; `SkipLink.astro` apunta a `#main`; no hay `#contenido` en `src`                                                             | **Descartado** reescribir layouts. Solo test guardián                          |
| `/servicios/` redirige a la home                   | `astro.config.mjs` con `trailingSlash: 'always'`; producción 200 en `/servicios/`                                                                   | **No reproducible**                                                            |
| `/referencias/` redirige a `/referencias`          | Producción 200 en `/referencias/`; canonical con barra                                                                                              | **No reproducible**                                                            |
| `theme-color` único                                | Dos metas: `#f6f8fc` (light) y `#0a1224` (dark) en `Layout.astro`                                                                                   | Ya resuelto; falta sincronizar con tema forzado                                |
| FAQ sin marcado nativo                             | `Faq.astro` ya usa `<details name="faq">`                                                                                                           | Ya resuelto; solo estilos y verificación                                       |
| Filtro sin estado accesible                        | Botones con `aria-pressed` y `role="group"`                                                                                                         | Ya resuelto; verificar teclado                                                 |
| Menú móvil y tema sin semántica                    | `aria-expanded`, Escape, foco de retorno, `aria-label` dinámico, `theme-init.js` anti-parpadeo                                                      | Ya resuelto; **solo sustituir glifos**                                         |
| Campo trampa y contador 1500 ausentes              | `.honeypot` con `aria-hidden` y `tabindex="-1"`; contador `0 / 1500`; leyenda de obligatorios                                                       | Ya resuelto; falta `inert`, un solo enlace de privacidad y `<noscript>` limpio |
| Animación de terminal en bucle infinito            | `cursor-blink` se usa en `Hero.astro` pero **no tiene CSS**; no hay animación                                                                       | **No reproducible**; limpiar clase muerta o implementar cursor finito          |
| `/cv.pdf` inexistente                              | PDF 1.4 válido, 1 página, 1,9 KB                                                                                                                    | Existe; decidir si es el definitivo                                            |
| Enlaces de proyecto privados                       | GitHub de Front Valencia, Gráficas Nasve y Zedazo: 200 públicos; las URL de producción de Front y Nasve son las de Vercel y las confirma el titular | No retirar «Código»; conservar las URL de Vercel y mejorar el texto accesible  |
| `og:image` genérica en `/experiencia/`             | `experiencia.astro` no pasa `ogImage`; usa `/og/default.png`                                                                                        | Confirmado                                                                     |
| Nota interna publicada                             | `src/pages/experiencia.astro:53`                                                                                                                    | Confirmado                                                                     |
| Ficha con viñetas duplicadas y primera persona     | «Qué hice» + `highlights` repetidos en «Detalles técnicos»                                                                                          | Confirmado                                                                     |
| Portada con formulario y secciones duplicadas      | `index.astro` monta `Hero`, `Servicios`, `Referencias`, `Metodo` y `Contacto` con `ContactForm`                                                     | Confirmado, pero choca con el plan de página única (#177)                      |
| Escala tipográfica sin disciplina                  | ≥10 tamaños distintos (`text-xs`…`text-5xl`, `text-step-*`); sin `--measure`                                                                        | Confirmado                                                                     |
| `!important` y hex fuera de tokens                 | `!important` solo en el bloque `@media print`; hex solo en `@layer theme`                                                                           | **Falso positivo** del `ds-lint.sh` propuesto                                  |
| Jerga vetada de forma global                       | «SEO» y «software» viven en fichas de servicio aprobadas; «Tienda online» en copy de proyectos                                                      | Requiere lista de excepciones, no un veto ciego                                |
| Presupuesto CSS ≤ 30 KB gzip                       | Build local: 25,8 KB + 5,3 KB = 31,1 KB gzip por página                                                                                             | Cerca del objetivo; el presupuesto LHCI de 25,6 KB ya se incumple por 211 B    |

También se detecta deuda documental: `docs/standards/website/diseno.md` describe `@layer tokens`,
skip-link a `#contenido`, «sin toggle de UI» y H1 con `text-step-4`. Nada de eso coincide ya con
el código. Se corrige dentro de esta iteración.

## 3. Decisiones bloqueantes (requieren respuesta antes de implementar)

### OQ-1. Arquitectura de la portada (bloquea C3)

La auditoría pide portada delgada, formulario solo en `/contacto/` y FAQ en `/servicios/`
(DEC-01). Eso contradice el cambio recién integrado «página única daisyUI 5» (#177), que monta
las cinco secciones en la home, y coincide con la decisión 0027 y el `AGENTS.md` vigente
(«home = hero + encargos habituales»). No hay decisión 0029 que registre el cambio a página única.

- **A (recomendada):** restaurar la home delgada; conservar `/servicios/`, `/referencias/` y
  `/metodo/` como páginas canónicas; mover FAQ y formulario; dejar un CTA final. Alinea código,
  decisiones y SEO, y elimina la duplicación.
- **B:** mantener la página única; actualizar decisiones/`AGENTS.md` y descartar U-03. La home
  seguiría compitiendo consigo misma en buscadores y el formulario se hidrataría en `/`.
- **C:** home intermedia (resumen + formulario, sin FAQ ni pasos). No resuelve la duplicación.

### OQ-2. CV y experiencia (bloquea C2)

`public/cv.pdf` es un PDF de una página generado por `scripts/build-cv-pdf.mjs`. ¿Es el CV
definitivo? Opciones: (a) conservar el botón; (b) retirarlo hasta que el contenido sea real;
(c) mantenerlo y marcar la página como no indexable mientras esté incompleta.

### OQ-3. Alcance del veto de jerga (bloquea C8)

La auditoría propone prohibir `online`, `landing`, `e-commerce`, `stack`, `SEO`, `software`,
`framework`, `hosting` y `website` en todo el copy. El repositorio ya tiene decisiones que
conservan «Auditoría técnica SEO», «software a medida» y la URL `/servicios/software-a-medida/`.
Propuesta: aplicar el veto solo a copy comercial visible y mantener las excepciones registradas
(nombres de servicio, URLs y «Ficha técnica» plegada). «Tienda online» del copy de proyectos se
sustituye por «Tienda en internet»; «Website personal» ya no existe.

### OQ-4. Referencias destacadas en portada (bloquea C3/U-06)

`Referencias.astro` usa `projects.filter((p) => p.featured || true)`, que siempre devuelve todo.
Hay cuatro proyectos con portada real (`front-valencia`, `graficas-nasve`, `zedazo`,
`alexendros-me`). ¿Se muestran dos (Front Valencia y Gráficas Nasve) en la home y los cuatro en
`/referencias/`, o se mantienen los cuatro en la home? Recomendación: dos + enlace al índice.

### OQ-5. Arnés y gates (bloquea C0)

La auditoría propone un `scripts/audit/ds-lint.sh` con regex y un `audit:ds` que reejecuta el
build. Este repo ya tiene Stylelint, `check-contrast`, `check-classes`, `check-copy`,
`check-records` y `audit:cookies` como fuente única. Propuesta: **no crear un lint paralelo**;
ampliar Stylelint y añadir solo `check:leaks` + `audit:css` (Playwright) + snapshots opcionales.
El gate nuevo entra en el job `quality` de CI, no en un `postbuild` local que CI no ejecuta.

## 4. Supuestos

- Node 24, pnpm 9.15.9, Astro 7.3, Tailwind 4.3, daisyUI 5.5, TypeScript estricto.
- Sin islas React ni dependencias de runtime nuevas. Playwright y axe ya están en
  `devDependencies`.
- Tokens canónicos: `src/styles/theme.css` (temas daisyUI `alexlight`/`alexdark`) y
  `@theme`/`@layer theme` de `src/styles/global.css`. **No se crea un `@layer tokens` nuevo.**
- Tipografía: JetBrains Mono Variable self-hosted. **No se reintroduce Inter** (retirada en #177).
- Iconos: componente SVG propio con `currentColor`; sin librería y sin glifos Unicode.
- Copy comercial en tercera persona o impersonal. La ficha técnica plegada puede nombrar
  tecnología; no herramientas internas (pnpm, Turborepo, TypeScript estricto).
- No se tocan API de contacto, idempotencia, tracking, consentimiento, precios ni catálogo.
- Las capturas y artefactos de auditoría no se publican en `public/` ni se sirven en producción.

## 5. Mapa de capacidades

| ID  | Capacidad              | Tareas                                                 | Depende de               | Esfuerzo | Riesgo |
| --- | ---------------------- | ------------------------------------------------------ | ------------------------ | -------- | ------ |
| C0  | `baseline-2026-11-02`  | Arnés, CSS runtime, capturas, LHCI, evidencias         | —                        | S        | Bajo   |
| C1  | `plantilla-urls`       | U-02 (verificar), U-14                                 | C0                       | S        | Bajo   |
| C2  | `experiencia-limpia`   | U-01, OG de experiencia, microcopy de experiencia      | C1                       | S        | Bajo   |
| C3  | `portada-delgada`      | U-03, U-04, U-06                                       | OQ-1, C1                 | L        | Alto   |
| C4  | `controles-accesibles` | U-05, U-11, U-12                                       | C1                       | M        | Medio  |
| C5  | `formulario-contacto`  | U-10                                                   | C3 (si cambia de página) | M        | Medio  |
| C6  | `fichas-referencias`   | U-07                                                   | C1                       | M        | Medio  |
| C7  | `sistema-visual`       | U-08, U-09, U-13, U-15                                 | C3–C6                    | M        | Medio  |
| C8  | `microcopy-y-docs`     | U-16, corrección de `docs/standards/website/diseno.md` | OQ-3, C2/C3              | S        | Bajo   |
| C9  | `cierre`               | Gates completos y `RESULTADOS.md`                      | Todas                    | S        | Bajo   |

Orden: C0 → C1 → (C2, C4, C6 en paralelo) → C3 → C5 → C7 → C8 → C9.

## 6. Alcance y aceptación por capacidad

### C0. Baseline

- `scripts/audit/css-runtime.mjs`: inventario de tamaños, medidas, radios, sombras, `z-index`,
  `transition: all`, animaciones y colores fuera de token en 7 rutas × 2 temas.
- `tests/visual.spec.ts` opcional (no gate inicial): 3 viewports × 2 temas, con
  `reducedMotion: 'reduce'`.
- `pnpm lhci` y medición de CSS gzip por página.
- Evidencias en `docs/audits/2026-11-02/baseline/` (JSON y tablas, no binarios pesados).

**Aceptación:** baseline guardado; cifras reproducibles; ningún cambio de producto.

### C1. Plantilla y URLs

- Test `tests/e2e/chrome.spec.ts`: 7 rutas, 200 sin redirecciones, canonical con barra, un
  `SkipLink`, un `main#main`, un botón de tema, cabecera y pie comunes.
- U-14: `scroll-padding-top` ya existe; añadir `scroll-margin-top` a `:target`, comprobar que
  `#top` existe y que el foco por teclado no queda bajo la cabecera fija.
- Verificar que no reaparece `#contenido` ni una segunda plantilla.

**Aceptación:** test verde en local y CI; 0 redirecciones internas; `rg 'id="contenido"' src dist`
vacío.

### C2. Experiencia limpia

- Retirar la nota «Pendiente de Alejandro…» y el comentario equivalente de `referralCodes.ts` o
  convertirlo en deuda trazada fuera del HTML.
- Unir los párrafos duplicados; decidir «Trayectoria» (contenido verificable o retirada).
- `ogImage` propio de experiencia (1200 × 630) y `og:image:alt` coherente.
- `check:leaks` sobre `dist` y sobre `src`: `Pendiente de`, `TODO`, `FIXME`, `lorem ipsum`,
  `scripts/build-` y `[object Object]`.
- Decidir CV según OQ-2.

**Aceptación:** `pnpm check:leaks` verde; 0 cadenas internas en `dist`; OG de experiencia 200.

### C3. Portada delgada (sujeta a OQ-1)

- Home: hero + compromisos + tres vías + dos referencias con imagen + cuatro pasos resumidos +
  CTA final. Sin `<form>` y sin FAQ.
- `/servicios/`: FAQ y anclas de las tres vías; H1, canonical y description propios.
- `/contacto/`: único formulario.
- `src/content/commitments.ts`: un solo dato para alcance, plazo, condiciones, respuesta,
  revisiones y entrega. `Commitments.astro` sin estados falsos («Acordado»).
- Retirar el `mockup-browser` decorativo del hero y la lista `sr-only` duplicada.
- Referencias de la home con `ProjectCard`/`Image` (WebP, `width`/`height`, `aspect-ratio 16/10`,
  `loading="lazy"` salvo la primera). Arreglar `featured` según OQ-4.
- Filtro: `aria-pressed`, sin JS se ven todos, con JS `hidden` sin saltos de layout.
- Diálogo: `<button>` de cierre con icono, `showModal`, foco inicial y retorno, `::backdrop` con
  token, animación opcional con `transform`/`opacity`, `overflow` bloqueado solo con
  `html:has(dialog[open])`.

**Aceptación:** home sin `<form>`; ≤5 secciones; «día laborable» ≤2 veces en `dist/index.html`;
«Acordado» = 0; miniaturas reales; CLS ≤0,05; diálogo accesible.

### C4. Controles accesibles

- `src/components/ui/Icon.astro` con `menu`, `close`, `arrow-right`, `arrow-left`, `theme`.
  `aria-hidden` por defecto; `label` solo si el icono comunica sin texto.
- Sustituir `☰`, `◐`, `✕`, `→`, `←` en cabecera, tarjetas, migas y diálogos.
- Botones de icono ≥44 × 44 px, foco visible y nombre accesible.
- Menú móvil: conservar `aria-expanded`/`aria-controls`, Escape y retorno de foco; ocultar el
  botón cuando la nav de escritorio esté visible (hoy `lg`, no `768px`).
- Tema: conservar el ciclo sistema → claro → oscuro, `localStorage` con `try/catch` y
  `theme-init.js` en `<head>`.
- FAQ: mantener `<details name="faq">`; estilos con `summary` de altura mínima, indicador con
  `transform` y `prefers-reduced-motion`.
- Terminal: eliminar `cursor-blink` si no se implementa; si se implementa, ciclos finitos,
  `aria-hidden` y sin movimiento con `reduce`.

**Aceptación:** 0 glifos Unicode como icono en `src`; navegación completa por teclado; sin
parpadeo de tema; `document.getAnimations()` vacío con `reducedMotion: 'reduce'`.

### C5. Formulario de contacto

- Honeypot con `inert` además de `aria-hidden` y `tabindex="-1"`.
- «Por dónde empezar» con `<fieldset><legend>` y tarjetas de selección clicables (ya existe la
  base `has-checked`); unificar radios/checkboxes según el contrato de datos.
- Campo «Otra necesidad» con `hidden`/`aria-expanded`, sin salto de layout.
- Estados `:user-invalid`, resumen de errores con `role="alert"`, foco al primer inválido,
  botón «enviando» deshabilitado.
- Contador con `.tnum` y `aria-live` solo cerca del límite.
- Un único enlace a privacidad; aviso sin JS solo en `<noscript>`; retirar el párrafo
  `#contact-nojs` duplicado si el script ya lo oculta.
- Reservar la altura del formulario para evitar CLS al hidratar.

**Aceptación:** axe sin `label`, `aria-hidden-focus` ni `autocomplete-valid`; Tab no entra en el
honeypot; CLS ≤0,05; contrato API intacto (`pnpm test:contract`).

### C6. Fichas de referencia

- Estructura única: migas + H1 + resumen + categoría; imagen; «Punto de partida», «Qué se hizo»,
  «Resultado» (viñetas una sola vez, tercera persona); `<details>` «Ficha técnica» con alcance,
  tecnología relevante y enlaces; CTA.
- Eliminar duplicación `results`/`highlights`.
- Quitar pnpm, Turborepo y TypeScript estricto de la ficha visible.
- Enlaces externos con texto completo y `sr-only` «(abre en otra pestaña)», `rel="noopener
noreferrer"`.
- Usar las URL de Vercel confirmadas por el titular para Front Valencia y Gráficas Nasve
  (`website-frontvalencia.vercel.app`, `ecommerce-graficasnasve.vercel.app`); no usar
  `frontvalencia.com`. Los repositorios son públicos, así que «Código» se conserva.
- Aplicar a las cuatro fichas (`front-valencia`, `graficas-nasve`, `zedazo`, `alexendros-me`).

**Aceptación:** ninguna frase repetida en `<main>`; 0 herramientas internas visibles; `linkinator`
sin rotos; enlaces con nombre accesible.

### C7. Sistema visual

- Tipografía: usar `--step--1…--step-4` en títulos y cuerpo; retirar `text-4xl`/`text-5xl` sueltos;
  `text-wrap: balance` en títulos y `pretty` en prosa; `--measure: 66ch` y `max-inline-size` en
  párrafos; `.tnum` para contadores y pasos; etiquetas `// 0N` decorativas con `aria-hidden`.
- Color: `color-scheme` coherente con `data-theme`; el selector actualiza la meta `theme-color`
  cuando el usuario fuerza tema; foco único `:focus-visible` con contraste ≥3:1; reglas
  `@media (forced-colors: active)` para tarjetas, chips, botones y diálogo; resolver
  `offToken*` del inventario.
- Rendimiento: medir CSS gzip; reducir si se puede sin purgar a ciegas; `content-visibility` solo
  bajo el pliegue; fuentes ya self-hosted con `preload`; imágenes con `width`/`height` y `srcset`.
- Metadatos visuales: OG 1200 × 630 por ruta indexable (incluida experiencia), `og:image:alt`
  coherente, iconos y manifest verificados.

**Aceptación:** ≤8 tamaños por página; ninguna línea de prosa >75 caracteres a 1440 px; 0 hex
fuera de tokens; axe sin contraste en ambos temas; CSS total ≤30 KB gzip o justificación medida;
LHCI móvil ≥90 rendimiento y 100 en accesibilidad/BP/SEO; OG 200.

### C8. Microcopy y documentación

- `/metodo/`: revisar description; «Metodología clara» puede quedarse en la description, pero el
  título ya es «Cómo se trabaja». Pasos y «Se recibe» ya están corregidos.
- `/referencias/`: categorías desde un único dato; «Tienda en internet»; «Página web personal».
- Formulario: «Se indica por dónde empezar y qué necesita el proyecto.»
- Actualizar `docs/standards/website/diseno.md`: `@layer theme`, skip-link `#main`, toggle de
  tema, tokens reales, componentes retirados y reglas de foco.
- Registrar excepciones de jerga en `RESULTADOS.md`.

**Aceptación:** `check:copy` y `check:classes` verdes; 0 jerga fuera de excepciones; documento
de diseño sin afirmaciones falsas.

### C9. Cierre

- `pnpm typecheck && pnpm lint && pnpm test && pnpm lint:css && pnpm format:check`
- `pnpm build && pnpm check:links && pnpm smoke`
- `pnpm test:e2e` (incluye `e2e-critical`)
- `pnpm check:contrast`, `check:records`, `check:copy`, `check:classes`, `audit:cookies`,
  `check:public-pricing`
- `pnpm lhci`
- `docs/audits/2026-11-02/RESULTADOS.md` con antes/después, descartes y excepciones.

## 7. Comandos canónicos

El protocolo de la auditoría usa `npm ci` y `npm run`; este repo usa pnpm y sirve el build de
Vercel:

```bash
pnpm install --frozen-lockfile
pnpm typecheck && pnpm lint && pnpm test
pnpm lint:css && pnpm format:check
pnpm build && pnpm check:links && pnpm smoke
pnpm test:e2e
pnpm lhci
```

Nuevos comandos propuestos (nombres por confirmar en OQ-5):

```json
"audit:css": "node scripts/audit/css-runtime.mjs",
"audit:visual": "playwright test tests/visual.spec.ts",
"check:leaks": "bash scripts/audit/check-leaks.sh"
```

`pnpm preview` sirve `.vercel/output/static` en el puerto 4321; Playwright ya lo reutiliza con
`SKIP_E2E_BUILD=1`.

## 8. Estructura prevista

| Archivo                                     | Acción                                          |
| ------------------------------------------- | ----------------------------------------------- |
| `src/components/ui/Icon.astro`              | Nuevo                                           |
| `src/components/Commitments.astro`          | Nuevo                                           |
| `src/content/commitments.ts`                | Nuevo                                           |
| `src/components/sections/Referencias.astro` | Reescribir tarjetas y filtro                    |
| `src/components/sections/Contacto.astro`    | Reducir a CTA (si OQ-1 A)                       |
| `src/components/sections/Hero.astro`        | Retirar mockup y lista duplicada                |
| `src/pages/index.astro`                     | Adelgazar                                       |
| `src/pages/servicios/index.astro`           | Añadir FAQ y anclas                             |
| `src/pages/referencias/[slug].astro`        | Estructura única y deduplicada                  |
| `src/content/projects.ts`                   | `featured`, tecnologías, enlaces, copy          |
| `src/pages/experiencia.astro`               | Sanear y OG                                     |
| `src/components/ContactForm.astro`          | Honeypot `inert`, estados, privacidad, noscript |
| `src/components/Header.astro`               | Iconos SVG                                      |
| `src/styles/global.css`                     | Tipografía, medida, `:target`, `forced-colors`  |
| `scripts/audit/css-runtime.mjs`             | Nuevo                                           |
| `scripts/audit/check-leaks.sh`              | Nuevo                                           |
| `tests/e2e/chrome.spec.ts`                  | Nuevo                                           |
| `tests/visual.spec.ts`                      | Nuevo, opt-in                                   |
| `docs/standards/website/diseno.md`          | Corregir deriva                                 |
| `docs/audits/2026-11-02/RESULTADOS.md`      | Nuevo al cierre                                 |

No se crean `BaseLayout.astro`, `@layer tokens`, `scripts/audit/ds-lint.sh` ni una segunda
política de URLs: ya existen sus equivalentes.

## 9. Reglas de código y diseño

- Sin `!important` (la única excepción es el bloque `@media print` ya documentado), sin
  `transition: all`, sin View Transitions, sin Google Fonts, sin CMS.
- Sin colores literales fuera de `theme.css`/`@layer theme`; usar tokens semánticos de daisyUI
  (`base-100`, `base-200`, `base-300`, `primary`, `base-content`) o los alias de `@theme`.
- Motion solo con `transform` y `opacity`; respetar `prefers-reduced-motion`; JS de cada
  interacción ≤2 KB gzip.
- Iconos SVG con `currentColor`, `focusable="false"`, tamaño por token.
- Copy en tercera persona; sin jerga fuera de las excepciones aprobadas; sin importes ni
  condiciones de pago.
- No debilitar tests, no borrar líneas base, no silenciar gates con `|| true`.

## 10. Estrategia de pruebas

| Superficie                        | Prueba                                                              |
| --------------------------------- | ------------------------------------------------------------------- |
| Datos (`commitments`, `projects`) | Vitest: una fuente, `featured` coherente, sin herramientas internas |
| Plantilla y URLs                  | E2E `chrome.spec.ts`                                                |
| Portada                           | E2E sin `<form>`, ≤5 secciones, miniaturas, CTA                     |
| Referencias                       | E2E filtro, diálogo, foco, imágenes, ficha sin duplicados           |
| Formulario                        | Vitest contrato + E2E teclado/honeypot/estados + axe                |
| Iconos/tema/menú                  | E2E teclado, `aria-*`, `localStorage`, sin parpadeo                 |
| Anclas                            | E2E `scroll-margin`, foco visible                                   |
| Accesibilidad                     | axe en 7 rutas × claro/oscuro (ampliar `a11y.spec.ts`)              |
| Visual                            | Snapshots opt-in; revisión manual de las pantallas tocadas          |
| Rendimiento                       | `audit:css`, LHCI móvil, gzip de CSS                                |

La suite existente (`e2e-critical`) no se reduce. Los tests nuevos que dependan de OQ-1 se
escriben después de la decisión.

## 11. Límites

- No se modifican precios, catálogo, textos legales, consentimiento, tracking ni la API de
  contacto (`contactHandler`, idempotencia, SMTP, Turnstile).
- No se añaden dependencias de runtime; solo `devDependencies` de auditoría si faltara alguna.
- No se edita `~/.pi/agent/` ni configuración del escritorio.
- No se hace `git push`, PR ni merge sin petición explícita. La rama de trabajo será
  `design/2026-11-02-ui-css`; los commits locales, uno por capacidad, solo si se autoriza.
- No se publican capturas ni artefactos de auditoría en `public/`.
- No se reintroduce React, Inter ni `daisyUI` se retira sin una decisión específica.

## 12. Criterios de éxito global

- 0 redirecciones internas; 200 y canonical con barra en las 7 rutas.
- 0 notas internas en `dist`; 0 «Acordado»; 0 viñetas duplicadas en fichas.
- Home sin formulario (si OQ-1 A) y con ≤5 secciones.
- 0 glifos Unicode como icono; todos los controles ≥44 px y con nombre accesible.
- axe: 0 violaciones `serious`/`critical` en claro y oscuro.
- ≤8 tamaños tipográficos por página; prosa ≤75 caracteres por línea a 1440 px; 0 `font-size`
  literal donde exista `--step-*`.
- 0 hex fuera de tokens; 0 `!important` fuera de impresión; 0 `transition: all`.
- CSS ≤30 KB gzip por página o excepción medida; LHCI móvil: rendimiento ≥90, accesibilidad,
  buenas prácticas y SEO = 100, CLS ≤0,05, LCP ≤2,5 s.
- OG 1200 × 630 y 200 en todas las rutas indexables.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm check:links` verdes.
- `RESULTADOS.md` con evidencia de cada punto.

## 13. Riesgos

| Riesgo                                        | Mitigación                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| C3 revierte parte de #177 y rompe e2e de home | Decidir OQ-1 antes; actualizar tests en el mismo commit; checkpoint tras C3      |
| Recorte de CSS insuficiente por daisyUI       | Medir primero; purgar componentes no usados o justificar el presupuesto con LHCI |
| Snapshots visuales frágiles                   | Opt-in, `reducedMotion`, umbral 0,2 %, no gate inicial                           |
| Copia de proyectos propiedad del titular      | Cambios de OQ-3 con revisión; no inventar hechos                                 |
| Deriva documental vuelve                      | Actualizar `diseno.md` y `AGENTS.md` en C8; `check:records`                      |
| Cambios de formulario alteran el contrato     | No tocar esquema ni handler; `pnpm test:contract` en cada paso                   |

## 14. Plan de ejecución

1. **Fase 0 — C0:** arnés, baseline, LHCI, CSS runtime, capturas. Checkpoint: cifras y sin
   cambios de producto.
2. **Fase A — C1, C2, C4, C6:** plantilla/URLs, experiencia, controles, fichas. Checkpoint:
   e2e y axe verdes; sin tocar la portada.
3. **Fase B — C3, C5:** portada y formulario según OQ-1. Checkpoint: home y contacto.
4. **Fase C — C7, C8:** sistema visual, microcopy y documentación. Checkpoint: LHCI y contraste.
5. **Cierre — C9:** gates completos, `RESULTADOS.md` y revisión de checklist.

Cada capacidad termina con `pnpm typecheck && pnpm lint && pnpm test` y las pruebas de su
superficie. No se acumulan más de dos capacidades sin checkpoint.

## 15. Preguntas abiertas

**Bloqueantes:** OQ-1 (portada), OQ-2 (CV), OQ-3 (jerga), OQ-4 (destacadas), OQ-5 (gates).
**No bloqueantes, con valor por defecto:** commits locales por capacidad sin push; snapshots no
versionados; iconos inline en lugar de sprite; mantener daisyUI y ajustar el presupuesto CSS con
medición.

## 16. Aprobación

Esta especificación no autoriza a escribir código todavía. Para pasar a plan y tareas necesito:

1. Aprobación del alcance y de los descartes de la sección 2.
2. Respuesta a OQ-1 a OQ-5.
3. Confirmación de si se crea la rama y los commits locales, o solo se preparan los cambios.
