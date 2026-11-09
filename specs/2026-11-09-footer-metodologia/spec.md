# Spec — Footer a todo el ancho y consolidación de `/metodologia/`

**Fecha:** 2026-11-09

**Estado:** implementada y verificada en local; producción pendiente de despliegue

**Alcance:** chrome compartido, migración de la ruta de metodología y composición vertical de su contenido.

## 1. Objetivo

Corregir de forma conjunta tres defectos relacionados sin introducir un rediseño:

1. El fondo y el borde superior del footer deben ocupar todo el ancho disponible, como ya hace el header, mientras su contenido permanece en un contenedor centrado y alineado con el chrome.
2. `/metodologia/` debe convertirse en la URL pública canónica; `/metodo/` y los alias históricos deben conservar acceso mediante redirecciones permanentes, sin bucles ni cadenas de redirects declaradas.
3. `/metodologia/` debe tener una jerarquía de espaciado clara entre hero, pasos, compromisos y cierre, con aire suficiente entre secciones y un eje visual coherente en móvil y escritorio.

No se cambian copy comercial, catálogo, precios, formulario, tracking, CMP ni el contenido de los pasos.

## 2. Mapa de capacidades

| Id                      | Responsabilidad                                                                 | Depende de              |
| ----------------------- | ------------------------------------------------------------------------------- | ----------------------- |
| `chrome-footer`         | Superficie a todo el ancho y contenido interior centrado/alineado con el header | —                       |
| `metodologia-canonical` | Ruta canónica, enlaces, redirects, metadatos, sitemap y activos OG              | —                       |
| `metodologia-rhythm`    | Espaciado entre bloques, grids y alineación del cierre                          | `metodologia-canonical` |

**Orden de construcción:** `chrome-footer` y `metodologia-canonical` pueden prepararse de forma independiente; `metodologia-rhythm` se aplica después de renombrar los archivos de la página para evitar ediciones concurrentes y referencias ambiguas.

## 3. Inspección y diagnóstico

### 3.1 Footer recortado y contenido sin contrato común con el header

**Evidencia medida a 1440 px:**

- `<header>`: `x=0`, `width=1440`.
- `.navbar-inner`: `x=144`, `width=1152`, centrado.
- `<footer>`: `x=144`, `width=1152`; su superficie y borde quedan limitados al mismo ancho que el contenido.

**Causa:** `src/styles/global.css` aplica `max-width: 72rem`, `margin-inline: auto` y padding directamente a `footer.footer`. En cambio, `Header.astro` separa el `<header>` de ancho completo y `.navbar-inner` de ancho limitado. `Footer.astro` no tiene equivalente interior.

**Consecuencia adicional:** al ensanchar únicamente el footer sin crear ese contenedor interior, el contenido quedaría pegado a los extremos o perdería la alineación con el header. La corrección debe ser estructural, no un parche con márgenes negativos.

### 3.2 Canonicalidad invertida respecto al objetivo

La página viva es `src/pages/metodo.astro`, la navegación enlaza `/metodo/` y `vercel.json` redirige `/metodologia` y `/metodologia/` hacia `/metodo`.

El cambio no consiste solo en renombrar un archivo. También dependen de la URL:

- navegación principal y enlace desde la sección de home;
- canonical y `og:url`, derivados de la ruta por `Layout.astro`;
- sitemap generado por Astro;
- aliases `/valores/`, `/como-trabajo/` y `/proceso-y-entrega/`;
- recurso OG y su generador;
- pruebas unitarias, E2E, smoke y scripts de auditoría;
- README, contrato operativo y estándar de diseño;
- decisiones vigentes 0021/0026/0027, que fijan `/metodo` como canónica.

**Riesgo que debe evitarse:** invertir solo una de las reglas crearía un bucle `/metodo/ ↔ /metodologia/`; dejar los alias antiguos apuntando a `/metodo/` crearía una cadena.

### 3.3 Ritmo vertical plano en el cuerpo de metodología

**Evidencia medida:**

- A 1440 px, el shell tiene `86,4 px` de padding vertical y cada `.stack-block` añade `40 px`.
- Esos mismos `40 px` separan hero→pasos, pasos→compromisos y compromisos→cierre.
- A 390 px se repite el mismo valor de `40 px`, aunque los pasos ya forman una lista larga de cuatro bloques.
- Los pasos usan `24 px` de gap; las tarjetas de compromisos usan `12 px`, pese a ser grids del mismo nivel visual.
- El cierre tiene `max-w-2xl` pero no `margin-inline: auto`: queda a la izquierda mientras H1 y pasos están centrados.
- `metodo.module.css` duplica el padding y centrado de `.page-shell` en una regla `.shell` fuera de capas para protegerse del orden de carga del CSS. Es un workaround conocido; no debe sustituirse por otra serie de márgenes `mt-*` ad hoc.

**Causa:** se reutiliza `.stack-block` tanto para una separación interna como para separar secciones principales. No existe una distinción entre ritmo de bloque y ritmo de sección en esta página.

### 3.4 Problemas relacionados que entran en la corrección

- Los identificadores internos `delivery-hero-title` y `metodo-close-heading` conservan nomenclatura de la ruta anterior; se normalizarán dentro de la página renombrada.
- Las reglas del footer dependen de selectores `footer.footer` que dejarán de describir la estructura al introducir el contenedor interior; deben migrarse junto con el markup, no quedar como CSS muerto.
- DaisyUI puede imponer estilos no encapsulados sobre `.footer` y `.navbar`. La implementación debe comprobar estilos computados y usar el patrón de excepciones de chrome ya existente, sin `!important` ni cambiar globalmente el framework.

## 4. Diseño funcional acordado para implementación

### 4.1 Contrato del chrome

`Footer.astro` adoptará la misma separación estructural que el header:

- `<footer>` semántico y exterior: ancho `100%`, superficie `.chrome-surface` y borde superior.
- Un único hijo interior: contiene aside y navegaciones, limita su ancho a `72rem`, se centra con `margin-inline: auto` y conserva el padding horizontal `--space-page-x` y vertical existente.
- Las clases de grid de DaisyUI pertenecen al contenedor interior, no al elemento que pinta la superficie.
- Los textos y enlaces mantienen su alineación actual; «centrar el contenido» significa centrar el contenedor y alinearlo con el header, no centrar tipográficamente todas las columnas.
- Se conservan landmarks, etiquetas de navegación, enlaces, hit areas, foco y comportamiento responsive.

### 4.2 Contrato de la ruta canónica

- Página viva: `src/pages/metodologia.astro` con módulo `metodologia.module.css`.
- URL canónica pública: `https://alexendros.dev/metodologia/`.
- `/metodo/` pasa de página a alias permanente hacia `/metodologia/`.
- `/valores/`, `/como-trabajo/` y `/proceso-y-entrega/` apuntan directamente a `/metodologia/`.
- Las variantes sin barra conservan las reglas necesarias; se acepta únicamente la normalización inicial de barra propia de Vercel, ya contemplada por la suite de edge.
- Ningún enlace interno activo, canonical, `og:url` ni entrada de sitemap apunta a un alias.
- El recurso OG se nombra `metodologia.png`; el generador y el archivo generado se actualizan de forma consistente.
- El ancla `#metodo` y el componente de la sección de home no cambian: describen el bloque de home y no son la ruta pública objeto de la migración.
- Se registra una nueva decisión tipada que sustituye la canonicalidad anterior y conserva explícitamente el resto de los contratos de 0027.

### 4.3 Contrato de espaciado de metodología

La página utilizará tres niveles, sin valores arbitrarios nuevos:

| Relación                                                             | Token/contrato      |
| -------------------------------------------------------------------- | ------------------- |
| Entre los tres bloques principales: hero+pasos, compromisos y cierre | `--space-section-y` |
| Entre `PageHead` y la lista de pasos                                 | `--space-block`     |
| Entre pasos y entre tarjetas de compromisos                          | `--space-gap`       |

Implementación prevista:

- El shell local organiza sus hijos principales con un único mecanismo de separación (`grid` + `row-gap`), evitando márgenes duplicados y colapsados.
- Los bloques principales dejan de usar `.stack-block`; hero→pasos usa su propio `row-gap` local para no depender del orden de carga de esa clase global.
- El padding exterior continúa usando `.page-shell`/`--space-section-y` y no se suma a las separaciones internas.
- Las tarjetas de compromisos reciben `gap-6` desde su único consumo actual o mediante una prop/localización que no altere otros consumidores futuros implícitamente.
- El cierre conserva su medida `max-w-2xl`, se centra en el eje del shell y centra su contenido/CTA; no se añade otra superficie ni otro CTA.
- La lista mantiene una columna en móvil, dos desde `md` y cuatro desde `lg`, con el orden semántico intacto.

## 5. Stack y estructura afectada

- Astro 7.3, TypeScript estricto, Tailwind 4 y DaisyUI 5.
- `src/components/Footer.astro`: estructura del chrome.
- `src/styles/global.css`: contrato exterior/interior del footer y selectores asociados.
- `src/pages/metodo.astro` → `src/pages/metodologia.astro`.
- `src/pages/metodo.module.css` → `src/pages/metodologia.module.css`.
- `src/components/Commitments.astro`: gap del grid, sin cambiar datos ni API salvo necesidad demostrada.
- `src/components/sections/Metodo.astro` y `src/content/site.ts`: enlaces a la nueva canónica.
- `vercel.json`: aliases permanentes y destino directo.
- `scripts/gen-og.mts`, `public/og/metodologia.png`: activo social coherente.
- `src/pages/design-system.astro`, `README.md`, `AGENTS.md`, `docs/standards/website/diseno.md`: referencias vivas.
- `docs/audits/decisions.json`: nueva decisión y trazabilidad de sustitución.
- Suites y scripts que enumeran la ruta: `tests/e2e/`, `scripts/smoke.sh`, `scripts/check-css-margin.mjs`, `scripts/audit/css-runtime.mjs`, `scripts/audit/ui-audit.mjs` y `scripts/audit-cookies.mjs`.

Los informes históricos de `docs/audits/` no se reescriben.

## 6. Estilo y restricciones

- Usar los tokens y shells existentes; no introducir valores hex, `!important`, `transition: all`, márgenes negativos ni utilidades arbitrarias de espaciado.
- No añadir componentes `Section`, `Container`, `Stack` o `Grid` genéricos para resolver esta página.
- Mantener HTML útil sin JavaScript, un solo H1, headings y landmarks actuales.
- No cambiar el ancla `#metodo`, el contenido de `processPage` ni la URL de contacto y sus parámetros.
- No modificar `Header.astro`; el centrado compartido de `.navbar-inner` y `.footer-inner` sí se estabiliza en `global.css` porque la reproducción en el build demostró que el orden de capas de `/metodologia/` anulaba ambos.
- No tocar la especificación previa `specs/2026-11-08-design-system-alignment/` ni los archivos no versionados ajenos a esta iniciativa.
- No hacer commit, push ni despliegue sin solicitud explícita.

## 7. Estrategia de pruebas

### 7.1 Pruebas de contrato, primero en rojo

**Footer / chrome:**

- En 320, 390, 768, 1280, 1440 y 1920 px, el rectángulo del footer exterior comienza en `0` y termina en el ancho del viewport (tolerancia ≤1 px).
- El contenedor interior está centrado (diferencia entre márgenes laterales ≤1 px), no supera `72rem` y comparte eje horizontal con `.navbar-inner` cuando ambos alcanzan su ancho máximo.
- El footer conserva sus tres `nav`, el aside, el foco visible y la ausencia de overflow horizontal.

**Ruta:**

- `/metodologia/` responde 200, tiene un H1 y canonical/`og:url` absolutos a esa ruta.
- Sitemap incluye `/metodologia/` y excluye `/metodo/` y los demás aliases.
- `vercel.json` contiene redirects permanentes desde `/metodo/` y todos los aliases directamente a `/metodologia/`, sin que un destino vuelva a ser source.
- Los enlaces de home, header, footer y design system usan `/metodologia/`.
- La suite de edge valida producción cuando esté desplegada y, antes del despliegue, el destino contra el build local según su contrato actual.

**Composición:**

- La distancia entre bloques principales coincide con el valor computado de `--space-section-y`; hero→pasos coincide con `--space-block` y los dos grids con `--space-gap`.
- El cierre está centrado respecto al shell con tolerancia ≤1 px.
- No hay overflow a 320, 390, 768 y 1280 px, ni cambios en el orden de lectura.
- Axe permanece sin violaciones WCAG 2.2 AA en claro y oscuro; reduced motion no altera el layout.

### 7.2 Verificación visual

Revisar `/`, `/metodologia/`, `/servicios/`, `/referencias/` y `/contacto/` para confirmar que el cambio de chrome es común y no introduce regresiones. Capturas de `/metodologia/` y del footer en móvil/escritorio, claro/oscuro, incluyendo el estado sin JavaScript.

### 7.3 Comandos de cierre

```sh
pnpm typecheck && pnpm lint && pnpm test
pnpm lint:css && pnpm check:records && pnpm audit:cookies
pnpm check:copy && pnpm check:classes && pnpm check:contrast
pnpm format:check
pnpm build
pnpm exec playwright test tests/e2e/chrome.spec.ts tests/e2e/process-page.spec.ts tests/e2e/seo-routes.spec.ts tests/e2e/seo-edge-prod.spec.ts tests/e2e/visual-system.spec.ts tests/e2e/ui-matrix.spec.ts tests/e2e/a11y.spec.ts
pnpm smoke
```

La ejecución E2E usa el webServer definido por el repo. La validación final de redirects de producción queda pendiente hasta que la configuración correspondiente esté desplegada; no se afirmará como verificada antes de ese momento.

## 8. Criterios de éxito

1. La superficie y el borde del footer llegan a ambos extremos en todos los viewports, y su contenido queda centrado y alineado con el header.
2. `/metodologia/` es la única URL canónica de la página; `/metodo/` y los aliases históricos redirigen de forma permanente y sin bucles.
3. Navegación, sitemap, canonical, OG, scripts, documentación viva y pruebas reflejan la nueva canónica.
4. La página distingue visualmente separación de sección, separación de bloque y separación de grid mediante tokens existentes.
5. El cierre comparte el eje centrado de la composición y los compromisos tienen el mismo gap que los pasos.
6. No hay regresiones de accesibilidad, reflow, contraste, contenido sin JavaScript ni chrome en las demás rutas.
7. Todos los comandos de cierre aplicables terminan correctamente; cualquier comprobación dependiente de despliegue se declara pendiente con evidencia, no como superada.

## 9. Supuestos y preguntas abiertas

**Supuestos:**

1. «Centrar el contenido del footer» se refiere al contenedor de contenido, no a aplicar `text-align: center` a todas las columnas.
2. El aumento de aire usa `--space-section-y` entre secciones principales; no se busca un rediseño ni más contenido.
3. La renumeración de IDs internos de la página no afecta a contratos externos; `#metodo` de home permanece estable.

**Preguntas abiertas:** ninguna. Estos supuestos deben corregirse antes de aprobar la especificación si no representan el resultado esperado.

## 10. Evidencia de ejecución

- Reproducciones en rojo confirmadas para geometría del footer, nueva ruta/redirects y ritmo de metodología antes de cada corrección.
- `pnpm typecheck`, `pnpm lint`, `pnpm lint:css`, `pnpm check:records`, `pnpm audit:cookies`, `pnpm check:copy`, `pnpm check:classes`, `pnpm check:contrast`, `pnpm build` y `pnpm smoke`: correctos.
- Vitest: 41 archivos y 209 pruebas superadas.
- Playwright completo: 283 pruebas superadas. La sitemap de producción todavía incluye `/metodo/` hasta desplegar este cambio; queda anotada como pendiente y el contrato se exige al build local, que sí incluye `/metodologia/` y excluye el alias.
- Prettier: todos los archivos modificados y añadidos por esta iniciativa pasan. El `pnpm format:check` global sigue detenido por cinco archivos no versionados preexistentes en `specs/2026-11-08-design-system-alignment/`; no se han modificado.
- Revisión visual del build: `/metodologia/` a 1440 px en claro y 390 px en oscuro, sin overflow ni errores de consola. Footer exterior 0–1440 px; `.footer-inner` y `.navbar-inner` 144–1296 px.
- Capturas: `.playwright-mcp/metodologia-final-light-1440.png` y `.playwright-mcp/metodologia-final-dark-390.png`.
