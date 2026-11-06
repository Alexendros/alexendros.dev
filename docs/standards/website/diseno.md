# Design system

### Propósito de este documento

- **Objetivo:** contrato vigente de tokens, tipografía, componentes y accesibilidad del portal.
- **Fuentes de verdad:** `src/styles/theme.css`, `src/styles/global.css` y los componentes de `src/components/`.
- **Alcance:** documenta el sistema real. La ruta local `/design-system` redirige a `designsystem.alexendros.dev`; no es una vitrina local de componentes.

## 1. Principios

1. **Fuente única.** Los temas DaisyUI `alexlight`/`alexdark` viven en `src/styles/theme.css`; los primitivos, alias semánticos y patrones compartidos viven en `src/styles/global.css` (`@theme`, `@layer theme` y `@layer components`).
2. **Tres capas.** Primitivos (`--blue-*`, `--ink-*`, `--paper-*`, `--line`, `--err`) → semánticos (`--bg`, `--fg`, `--fg-muted`, `--brand`, `--brand-hover`, `--brand-fg`, `--border-color`, `--card`, `--danger`, `--bg-subtle`, `--scrim`, `--focus-ring`, `--shadow-*`) → componentes. Los componentes nunca consumen primitivos directamente. `--border` es exclusivamente el grosor de DaisyUI; `--color-border` referencia `--border-color` para conservar las utilidades Tailwind.
3. **Reglas duras.** Sin `!important` fuera de la excepción de impresión, `transition: all`, colores literales fuera de las capas autorizadas, sombras Tailwind prohibidas por `check:classes` ni `font-size` literal donde exista `--step-*`.
4. **Temas coherentes.** El selector cicla sistema → `alexlight` → `alexdark`, persiste en `localStorage` y `theme-init.js` evita el parpadeo. Las variantes oscuras por media query y `data-theme` deben contener los mismos valores; `check:contrast` las compara.
5. **Accesibilidad medible.** Contraste ≥4.5:1 para texto y ≥3:1 para foco e indicadores no textuales necesarios, objetivos táctiles ≥44px en acciones de contenido y reduced motion en todo movimiento.
6. **Movimiento acotado.** Solo `transform`/`opacity`; hover de cards únicamente con `(hover: hover)` y `prefers-reduced-motion: no-preference`. Las sombras y bordes cambian sin animación. Con reduced motion, `html` usa `scroll-behavior: auto`. Las duraciones propias usan `--duration-fast` (180ms) y `--duration-normal` (200ms) con `--ease-out`.
7. **Frontera global/módulo.** `global.css` contiene tokens y patrones con varios consumidores. Las reglas específicas viven en `Component.module.css` y se importan como `import styles from './Component.module.css'`, usando `styles.clase` o `styles['clase-kebab']`. Los tests usan IDs/`data-*`, nunca los nombres hash generados. No se usan `@apply` ni estilos inline.

## 2. Tokens

### Tipografía

- **Source Sans 3 Variable** (`--font-sans`, también referenciada por `--font-display`): cuerpo, titulares y controles. Se autoaloja con `@fontsource-variable/source-sans-3`; el archivo latin variable tiene preload en `Layout.astro`.
- **JetBrains Mono Variable** (`--font-mono`): prompt, código, eyebrows y metadatos seleccionados. Se autoaloja con `@fontsource-variable/jetbrains-mono`, sin preload prioritario.
- **Escala:** `--step--1…--step-4` fluida mediante `clamp`; Tailwind la expone como `text-step--1…4`. Roles: H1 de página `text-step-3`; H2 de sección `text-step-2`; título de card/H3 `text-step-1`; cuerpo `text-step-0`; secundario/help/meta `text-step--1`. El H1 del hero usa `--hero-title-size` (rol display entre step-3 y step-4), `text-balance` y peso 700 como máximo.
- **Lectura:** `--leading-body`, `--leading-tight`, `--tracking-eyebrow` y `--measure` (66ch). La prosa legal usa `.legal-prose`.
- **Licencias:** ambas familias usan SIL OFL 1.1; se conservan los avisos distribuidos por Fontsource. No se cargan Google Fonts.

### Espaciado y radios

- `--space-page-x` (1rem), `--space-section-y` (`clamp(4rem, 6vw, 6rem)`), `--space-block` (2.5rem), `--space-stack` (2rem), `--space-card` (1.5rem), `--space-gap` (1.5rem).
- Shells: `.page-shell` (índices `max-w-6xl`), `.page-shell-narrow` (fichas/contacto `max-w-3xl`), `.section-shell` (secciones de home). Sustituyen `py-16 md:py-24` / `py-20` ad hoc en el portal comercial.
- Radios: `--radius-control` (controles DaisyUI/`rounded-box`), `--radius-surface` (0.75rem → cards, dialog, menú; clase `.radius-surface`), `--radius-panel` (1rem → cierre de contacto; clase `.radius-panel`).
- **Anti-patrones:** no `py-16 md:py-24` en páginas comerciales; no `text-sm`/`text-xs` DaisyUI donde exista `text-step--1`; no `rounded-2xl` en cards.

### Superficie, elevación y color

- `--shadow-1`: elevación base de compromisos, cards, menú, prompt y botón primario.
- `--shadow-2`: énfasis hover/foco, sin transición de sombra.
- `--surface-chrome`: tinte de cabecera/pie (`border-color` 16 % sobre `card`), distinto del plano.
- `--surface-chrome-glass`: translúcido (~58 %) sobre chrome; con `backdrop-filter: blur(8px)`.
- `--surface-header` / `--surface-header-glass`: alias de chrome (compatibilidad).
- `--surface-sunken`: fondo de base y filas internas del configurador, mezcla de `bg` y `card`.
- `--gradient-section`: gradiente estático del cierre de contacto, derivado de `bg`, `bg-subtle` y `card`.
- `--scrim`: overlay de dialog/CMP.
- `.chrome-label`: versales UI (`--tracking-chrome` 0.1em, `--step--1`, peso 600, `fg-muted`); nav de cabecera y títulos del pie.

## 3. Componentes y patrones

### Foco

`.focus-ring:focus-visible` aplica outline 2px, offset 2px y anillo `--focus-ring`. Los controles DaisyUI cubiertos por las reglas `.btn`, `.link`, `.checkbox` y menú comparten el mismo color y geometría. No crear sistemas de foco por componente ni depender del outline predeterminado.

### Button

- **API:** `href?` renderiza `<a>` o `<button>`; `variant: 'primary'|'secondary'|'ghost'`; `size: 'sm'|'md'|'lg'`; `type?`, `disabled?`, `loading?` y atributos nativos.
- **Variantes:** primary usa `bg-primary text-ink` y hover `bg-primaryHover`; secondary usa borde y texto brand; ghost usa texto brand.
- **Tamaños:** `md`/`lg` con mínimo 44px. `sm` solo en contextos densos; la cabecera conserva 44px aunque use densidad visual `btn-sm`.
- **Estados:** primary tiene `--shadow-1` y hover `--shadow-2`; disabled conserva semántica nativa/`aria-disabled`; loading usa `aria-busy`, deshabilita el botón y muestra `styles.spinner` desde `Button.module.css`, con animación solo si el movimiento está permitido.
- **Uso:** no anidar interactivos ni duplicar manualmente una variante cuando se puede usar `Button.astro`.

### Link

- **API:** `href`, `variant: 'inline'|'nav'|'arrow'`, `current?` y atributos nativos.
- `current` emite `aria-current="page"`; `arrow` añade icono oculto al nombre accesible.
- Los enlaces en prosa mantienen subrayado. El foco usa `.focus-ring`.

### Badges y eyebrows

- Badges de DaisyUI, no un componente propio. Categoría de home: `badge-accent badge-sm`; atributos de home: `badge-ghost badge-sm` con `text-muted`; tipología de referencias: `badge-outline badge-sm` neutro.
- No usar badges como enlaces ni `badge-soft` claro mientras el gate mantenga sus avisos de contraste.
- `.eyebrow` es una clase CSS mono con `--tracking-eyebrow`; no existe un componente `Eyebrow.astro`.

### Composición y encabezados

Énfasis ámbar: el ámbar no se usa como color de texto sobre el fondo (no alcanza AA en oscuro con la rejilla). Se aplica `--fg` con subrayado decorativo (`text-decoration-color: var(--color-accent)`, grosor y offset en el módulo de la página), como en el titular de `/servicios/` y los números de paso de `/metodo/`.

`SectionHeader.astro` encapsula eyebrow + H2 + descripción opcional para Servicios, Referencias, Método y Contacto de home. Recibe `id`, `eyebrow`, `title` y `description?`; sus reglas específicas se importan desde `SectionHeader.module.css`. Cada sección conserva `aria-labelledby`.

`PageHead` permanece separado porque usa H1. `Section`, `Container`, `Stack` y `Grid` no son componentes vigentes; no reintroducir wrappers sin consumidores reales.

### SkipLink

Primer foco de la página, salta a `#main`, visible con teclado y por encima de la cabecera. No reordenar en `Layout.astro`.

### Hero y cierre de contacto

- H1 y copy fijos, sin rotación; CTAs y URLs definidos en el contenido.
- El prompt presenta `~/alexendros $ nuevo-encargo` como firma visual mono, con borde, superficie y `--shadow-1`; su regla se importa desde `Hero.module.css`.
- El fondo de todas las páginas es una rejilla de dos capas en `body::before` (`global.css`, `@layer base`): celda fina de 22 px y mayor de 120 px, fija tras el contenido (`position: fixed`, `inset: 0`, `z-index: -1`, `pointer-events: none`), con líneas de `--border-color` al **18 %** (fina) y **26 %** (mayor) y sin `mask`. El trazo cambia con el tema del sitio por tokens (`--grid-line`/`--grid-major`), sin `prefers-color-scheme` propio; se retira con `prefers-contrast: more`, `forced-colors: active` y al imprimir. El hero no tiene fondo propio; cabecera, tarjetas, cierre de contacto (que conserva `--gradient-section`) y pie mantienen su superficie. `body` no lleva `bg-base-200`: el color de página lo pinta `:root`.
- La entrada `.rise-1…4` (solo hero) usa `transform`/`opacity` con `--duration-normal` (200 ms) y delays 40/80/120 ms; desaparece con reduced motion. No hay script `reveal.ts`.
- Sin View Transitions ni librerías de motion.

### Cards y elevación

- `.surface-raised`: borde, `--card` y `--shadow-1` para bloques informativos, compromisos, menú, proceso y CTA. Los bloques no interactivos no simulan hover clickable.
- `.card-lift`: elevación para `ServiceCard`/`ProjectCard`, cuyas cards sí son enlazables. Hover eleva 2px; el foco refuerza borde y sombra. Las imágenes de referencia pueden escalar a 1.02 solo bajo las mismas condiciones de hover/motion.
- **Card-link:** el `<article>` no es un enlace; el enlace del título se estira con `::after`. El nombre accesible es el título y el CTA visual es `aria-hidden`.
- Dentro de card-link no puede haber otro interactivo. Si hace falta un segundo enlace o texto seleccionable, usar enlaces explícitos en vez de este patrón.
- Las imágenes mantienen dimensiones, `srcset`, lazy/eager y prioridad LCP según posición.

### Proceso

La home usa DaisyUI `steps` con `step-primary` como tratamiento visual de una secuencia estática. No se añade `aria-current`, progreso completado ni interacción ficticia. La lista conserva orden, vertical en móvil, horizontal desde `lg` y contenido sin JavaScript. `/metodo` mantiene su composición editorial propia.

### Cabecera y pie (chrome)

- `#site-header` y el `footer` usan la clase compartida `.chrome-surface` (`--surface-chrome` / glass + `blur(8px)`). Bordes con `border-border`. El pie no usa `bg-base-100`.
- Nav principal y menú móvil: `.chrome-label` (versales). Títulos del pie: `.footer-title.chrome-label`. Enlaces del pie en sentence case, densos (`min-block-size: 1.5rem`, `text-step--1`).
- Toggle de tema: `btn-square` 44×44; iconos `theme` (sistema), `sun` (claro), `moon` (oscuro) sincronizados por `themeToggle.ts`.
- CMP (`cookieBanner.css`): barra sólida con tokens de card/borde y `--radius-surface`; compacta en desktop (sin divisor textos/botones) y en móvil; sin `backdrop-filter`. Stacking del CMP por encima del chrome.

### Configurador de módulos

`NeedsConfigurator.astro` separa base estática, módulos opcionales y resumen. Las zonas usan `NeedsConfigurator.module.css`, `--surface-sunken` y `--primary-ghost`; desde `lg` los módulos forman dos columnas sin alterar el orden. Los labels conservan toda la superficie clicable y los hooks `data-needs-*`, live region, serialización y URLs no cambian.

### DetailIsland

Soft-nav con `<dialog>` + `pushState`; sin JavaScript los enlaces abren las páginas de detalle. Conserva foco, cierre, URL y scrim `--scrim`. No usar View Transitions.

## 4. Excepciones de color fijo

| Elemento             | Valor                 | Motivo                                                                                                      |
| -------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `theme-color` (meta) | `#f6f8fc` / `#0a1224` | `<meta>` no admite `var()`; equivalentes a los tokens de fondo claro/oscuro, validados por `check:contrast` |

No introducir nuevas excepciones sin justificarlas aquí.

## 5. Verificación

- `pnpm check:contrast`: pares WCAG en claro/oscuro, consistencia de variantes y guardrails de fuente única.
- `pnpm lint:css` + `pnpm check:classes`: prohibiciones de color, movimiento, sombras y markup.
- `tests/e2e/visual-system.spec.ts`: fuentes, preload, tokens, hero, cards, reduced motion, glass, foco, proceso y CTA.
- `tests/e2e/ui-matrix.spec.ts` y axe: reflow, objetivos, CMP y accesibilidad automática.
- `pnpm audit:css` y LHCI sobre el build final: consumo de tokens, regresiones CSS y rendimiento.
