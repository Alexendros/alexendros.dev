# Design system

### Propósito de este documento

- **Objetivo:** contrato vigente de tokens, tipografía, componentes y accesibilidad del portal.
- **Fuentes de verdad:** `src/styles/global.css` y los componentes de `src/components/`.
- **Alcance:** documenta el sistema real. La vitrina viva es `/design-system` (noindex) en este repositorio. El subdominio `designsystem.alexendros.dev` (mismo proyecto Hobby `alexendros-dev`) reescribe `/` e `/index.html` hacia esa vitrina; en el host del subdominio, `/design-system` redirige a `/`. El 308 apex → subdominio solo se reactivará cuando el body del subdominio muestre `data-ds-vitrina` en producción (hoy el apex sirve la vitrina localmente).

## 1. Principios

1. **Fuente única.** La paleta iris y melocotón, en claro y en oscuro, vive en `src/styles/global.css` (`@theme`, `@layer theme` y `@layer components`). El selector sigue ciclando sistema, `alexlight` y `alexdark`.
2. **Tokens en una capa.** La paleta iris y melocotón, en claro y en oscuro, vive en `@layer theme` de `src/styles/global.css`. Tailwind solo referencia semánticos (`--bg`, `--fg`, `--fg-muted`, `--brand`, `--brand-hover`, `--brand-fg`, `--brand-soft`, `--peach`, `--border-color`, `--card`, `--danger`, `--success`, `--bg-subtle`, `--scrim`, `--focus-ring`, `--shadow-*`). `--border` es el grosor (`1px`); `--color-border` referencia `--border-color`. `--color-accent` es el melocotón y solo se usa en subrayados decorativos.
3. **Reglas duras.** Sin `!important` fuera de la excepción de impresión, `transition: all`, colores literales fuera de las capas autorizadas, sombras Tailwind prohibidas por `check:classes` ni `font-size` literal donde exista `--step-*`.
4. **Temas coherentes.** El selector avanza sistema → `alexlight` → `alexdark` y salta cualquier paso que no cambie el aspecto (p. ej. `alexdark` → sistema con OS oscuro), para que ningún clic sea nulo. Persiste en `localStorage` y el script inline de `src/scripts/theme-init.js` (inyectado en `Layout.astro`) evita el parpadeo. Las variantes oscuras por media query y `data-theme` deben contener los mismos valores; `check:contrast` las compara.
5. **Accesibilidad medible.** Contraste ≥4.5:1 para texto y ≥3:1 para foco e indicadores no textuales necesarios, objetivos táctiles ≥44px en acciones de contenido y reduced motion en todo movimiento.
6. **Movimiento acotado.** Solo `transform`/`opacity`; hover de cards únicamente con `(hover: hover)` y `prefers-reduced-motion: no-preference`. Las sombras y bordes cambian sin animación. Con reduced motion, `html` usa `scroll-behavior: auto`. Las duraciones propias usan `--duration-fast` (180ms) y `--duration-normal` (200ms) con `--ease-out`.
7. **Frontera global/módulo.** `global.css` contiene tokens y patrones con varios consumidores. Las reglas específicas viven en `Component.module.css` y se importan como `import styles from './Component.module.css'`, usando `styles.clase` o `styles['clase-kebab']`. Los tests usan IDs/`data-*`, nunca los nombres hash generados. No se usan `@apply` ni estilos inline.

## 2. Tokens

### Tipografía

- **Plus Jakarta Sans Variable** (`--font-sans`): cuerpo y controles. Se autoaloja con `@fontsource-variable/plus-jakarta-sans`; el archivo latin variable tiene preload en `Layout.astro`.
- **Space Grotesk** (`--font-display`): titulares y marca. Se autoaloja con `@fontsource/space-grotesk`, solo peso 700, con preload en `Layout.astro` (elemento LCP de texto).
- **Mono de sistema** (`--font-mono`): cejas, código y metadatos (`ui-monospace` + respaldo). Sin descarga de fuente mono para no competir con el LCP. La ceja va en minúsculas y en color de marca.
- **Escala:** `--step--1…--step-4` fluida mediante `clamp`; Tailwind la expone como `text-step--1…4`. Roles: H1 de página `text-step-3`; H2 de sección `text-step-2`; título de card/H3 `text-step-1`; cuerpo `text-step-0`; secundario/help/meta `text-step--1`. El H1 del hero usa la familia de titulares, `text-balance` y peso 700, con `text-4xl`, `sm:text-5xl` y `lg:text-6xl`.
- **Lectura:** `--leading-body`, `--leading-tight`, `--tracking-eyebrow` y `--measure` (66ch). La prosa legal usa `.legal-prose`.
- **Licencias:** Plus Jakarta y Space Grotesk usan SIL OFL 1.1; se conservan los avisos Fontsource. No se cargan Google Fonts.

### Espaciado y radios

- `--space-page-x` (1rem), `--space-section-y` (`clamp(4rem, 6vw, 6rem)`), `--space-block` (2.5rem), `--space-stack` (2rem), `--space-card` (1.5rem), `--space-gap` (1.5rem).
- Shells: `.page-shell` (índices `max-w-6xl`), `.page-shell-narrow` (fichas/contacto `max-w-3xl`), `.section-shell` (secciones de home). Sustituyen `py-16 md:py-24` / `py-20` ad hoc en el portal comercial.
- Radios: `--radius-control` (superficie menos 2px), `--radius-surface` (0.75rem → cards, diálogo y menú; clase `.radius-surface`), `--radius-panel` (1.5rem → cierre de contacto; clase `.radius-panel`).
- **Anti-patrones:** no `py-16 md:py-24` en páginas comerciales; no `text-sm`/`text-xs` donde exista `text-step--1`; no `rounded-2xl` en cards; no un modificador `/N` sobre un color que es `var()`.

### Superficie, elevación y color

- `--shadow-1` y `--shadow-2`: elevación. El hover de una ficha pasa a `--shadow-2` sin animar la sombra ni mover la ficha.
- `--surface-chrome` y `--surface-chrome-glass`: velo de la cabecera. El vidrio mezcla `--bg` al 92 % para que el titular no se lea detrás, con `backdrop-filter: blur(8px)`.
- `--surface-header` / `--surface-header-glass`: alias del velo.
- `--gradient-section`: gradiente del cierre de contacto, derivado de `bg`, `bg-subtle` y `card`.
- `--scrim`: overlay del diálogo y del aviso de cookies.

## 3. Componentes y patrones

### Foco

`.focus-ring:focus-visible` y los botones aplican un solo outline de 2px en `--focus-color`. No hay un segundo anillo de sombra. No crear sistemas de foco por componente.

### Button

- **API:** `href?` renderiza `<a>` o `<button>`; `variant: 'primary'|'secondary'|'ghost'`; `size: 'sm'|'md'|'lg'`; `type?`, `disabled?`, `loading?` y atributos nativos.
- **Variantes:** primary pinta fondo `--brand` y texto `--brand-fg`, y en hover `--brand-hover`. Secondary (`.btn-outline`) usa borde `--border-strong`, fondo `--bg` y texto `--fg`; en hover, fondo `--brand-soft` y texto `--accent-fg`. Ghost usa texto `--fg-muted`.
- **Tamaños:** `md`/`lg` con mínimo 44px. `sm` solo en contextos densos; la cabecera conserva 44px aunque use densidad visual `btn-sm`.
- **Estados:** primary tiene `--shadow-1` y hover `--shadow-2`; disabled conserva semántica nativa/`aria-disabled`; loading usa `aria-busy`, deshabilita el botón y muestra `styles.spinner` desde `Button.module.css`, con animación solo si el movimiento está permitido.
- **Uso:** no anidar interactivos ni duplicar manualmente una variante cuando se puede usar `Button.astro`.

#### Gobernanza de CTAs

- **Obligatorio:** el Hero y los CTAs de conversión de página usan `Button.astro` (API canónica). En home, `ContactCta` se incluye por coherencia de conversión.
- **Prohibido** en el markup fuente de esas superficies: clases `btn`, `btn-primary`, `btn-outline`, `btn-ghost`, `btn-lg` (u otras `btn-*`) sin pasar por el componente.
- **Gate:** `pnpm check:classes` escanea solo el markup fuente de `Hero.astro` y `ContactCta.astro`. No escanea `Button.astro` ni la vitrina `/design-system` (el componente emite `btn*` internamente).
- **Lista blanca (sin gate; idéntica a `BTN_WHITELIST_EXCEPTIONS` en `check-classes.mjs`):** `Header.astro` (CTA Contacto de chrome), `SkipLink.astro`, submit de `ContactForm.astro`, `Paquetes.astro`, enlaces «más» de listados en home (`Servicios.astro`, `Referencias.astro`, `Metodo.astro`).

### Link

- **API:** `href`, `variant: 'inline'|'nav'|'arrow'`, `current?` y atributos nativos.
- `current` emite `aria-current="page"`; `arrow` añade icono oculto al nombre accesible.
- Los enlaces en prosa mantienen subrayado. El foco usa `.focus-ring`.

### Badges y eyebrows

- Los badges son clases de `global.css`. Categoría de home: `badge-brand`. Atributos y condiciones: `badge-ghost` con `text-muted`. Tipología de referencias: `badge-outline`.
- No usar badges como enlaces.
- `.eyebrow` es mono, en minúsculas y en color de marca. El texto ya trae el prefijo; la clase no añade otro. No existe un componente `Eyebrow.astro`.

### Composición y encabezados

Énfasis melocotón: no se usa como color de texto. El texto queda en `--fg` y el subrayado decorativo usa `var(--color-accent)`, como en el titular de `/servicios/` y los números de paso de `/metodologia/`.

`SectionHeader.astro` encapsula eyebrow + H2 + descripción opcional para Servicios, Referencias, Método y Contacto de home. Recibe `id`, `eyebrow`, `title` y `description?`; sus reglas específicas se importan desde `SectionHeader.module.css`. Cada sección conserva `aria-labelledby`.

`PageHead` permanece separado porque usa H1. `Section`, `Container`, `Stack` y `Grid` no son componentes vigentes; no reintroducir wrappers sin consumidores reales.

### SkipLink

Primer foco de la página, salta a `#main`, visible con teclado y por encima de la cabecera. No reordenar en `Layout.astro`.

### Hero y cierre de contacto

- H1 y copy fijos, sin rotación. Los CTAs del Hero y de `ContactCta` usan `Button.astro`.
- El hero es de dos columnas: el texto y el diagrama del método real (los cuatro pasos), con un pulso de `transform` y `opacity`.
- El fondo de página es liso (`--bg`). No hay rejilla. La cabecera es un velo fijo. El cierre de contacto conserva `--gradient-section` y un resplandor `.glow`. El pie usa `.footer-veil`.
- La entrada `.rise-1…4` (solo hero) usa `transform`/`opacity` con `--duration-normal` (200 ms). Las secciones usan `data-reveal` y `.is-in`. Con reduced motion no hay animación y el contenido sigue visible. Sin View Transitions ni librerías de motion.

### Cards y elevación

- `.surface-raised`: borde, `--card` y `--shadow-1` para bloques informativos. Los bloques no interactivos no simulan un hover de enlace.
- `.surface-card`: la misma superficie en fichas enlazables. El hover solo cambia la sombra. La imagen de una referencia no se escala.
- **Card-link:** el `<article>` no es un enlace; el enlace del título se estira con `::after`. El nombre accesible es el título y el CTA visual es `aria-hidden`.
- Dentro de card-link no puede haber otro interactivo. Si hace falta un segundo enlace o texto seleccionable, usar enlaces explícitos en vez de este patrón.
- Las imágenes mantienen dimensiones, `srcset`, lazy/eager y prioridad LCP según posición.

### Catalogo

`Catalogo.astro` presenta el catálogo promocional de `/servicios/`. Props: `items` (`readonly CatalogoItem[]`, datos estáticos de `src/content/catalogo.ts`) y `headingLevel` (`h2` | `h3`). Cada ítem muestra título, descripción y, si existe, un solo CTA con `Button.astro`. `precioOpcional` existe en el tipo para el contrato de datos, pero el módulo falla al cargar si algún ítem lo define y el componente no lo renderiza.

La sección vive dentro del `.page-shell` de la página y no anida `.section-shell`, para no duplicar padding ni max-width. Las tarjetas usan `.surface-raised`, `.radius-surface` y tokens de texto (`text-step-*`, `text-muted`). El ámbar no se usa como color de texto. No hay hover que simule un enlace. Si `items` llega vacío, se muestra un párrafo de estado vacío y el build no se rompe.

`ServiceCard` no cubre este catálogo: es la ficha enlazable de un solo producto publicado (`surface-card` y card-link), y el índice conserva exactamente esa ficha. `Paquetes` tampoco: permanece oculto mientras `paquetesPublicados` es falso y su marcado incluye importes. El catálogo promocional es una composición aparte.

### Proceso

La home usa `.steps` y `.step`: una secuencia estática con la marca numerada en color de marca. No se añade `aria-current`, progreso completado ni interacción ficticia. En móvil va en columna. En pantallas de 80rem o más, en fila. El diagrama del hero usa los mismos cuatro pasos. `/metodologia/` mantiene su composición editorial propia: `row-gap` con `--space-section-y` entre bloques principales, `--space-block` entre PageHead y pasos, `--space-gap` en los grids y cierre `max-w-2xl` centrado.

### Cabecera y pie (chrome)

- La cabecera es fija, con velo (`--surface-chrome-glass` al 92 % y desenfoque). El pie usa `.footer-veil`. `.header-bar` y `.footer-inner` limitan el contenido a 72rem.
- La navegación de escritorio entra desde `lg`, en una línea: Servicios, Referencias, Metodología. El botón de cabecera dice «Contacto».
- Enlaces del pie en sentence case. Los sociales (GitHub, LinkedIn, Correo) tienen área de 44×44 vía `.footer-social::before`.
- El botón de tema mide 44×44; cada clic cambia el aspecto (claro ↔ oscuro), partiendo de sistema.
- CMP (`cookieBanner.css`): barra sólida con tokens de card, borde y `--radius-surface`; compacta en escritorio y en móvil (`max-height: min(40vh, 12rem)`); sin `backdrop-filter`. Queda por encima de la cabecera.

### DetailIsland

Soft-nav con `<dialog>` + `pushState`; sin JavaScript los enlaces abren las páginas de detalle. Conserva foco, cierre, URL y scrim `--scrim`. No usar View Transitions.

## 4. Excepciones de color fijo

| Elemento             | Valor                                | Motivo                                                                                                               |
| -------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `theme-color` (meta) | literal de `--bg-day` y `--bg-night` | `<meta>` no resuelve `var()`; esos dos tokens no cambian con el tema y Layout lee el valor declarado en `global.css` |

No introducir nuevas excepciones sin justificarlas aquí.

## 5. Verificación

- `pnpm check:contrast`: pares WCAG en claro/oscuro, consistencia de variantes y guardrails de fuente única.
- `pnpm lint:css` + `pnpm check:classes`: prohibiciones de color, movimiento, sombras y markup.
- `tests/e2e/visual-system.spec.ts`: fuentes, preload, tokens, hero, cards, reduced motion, glass, foco, proceso y CTA.
- `tests/e2e/ui-matrix.spec.ts` y axe: reflow, objetivos, CMP y accesibilidad automática.
- `pnpm audit:css` y LHCI sobre el build final: consumo de tokens, regresiones CSS y rendimiento.
