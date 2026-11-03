# Especificación: consistencia visual y formalización de servicios

- Fecha: 2026-11-03.
- Base: `a269fec125cf68f6846728d9854feb26ae6e7f40` (`main`, release `v1.37.0`).
- Estado: **implementada y validada localmente; ver `RESULTADOS-CONSISTENCIA-VISUAL.md`**.
- Iniciativa anterior: `SPEC-DAISYUI.md` y `RESULTADOS-DAISYUI.md`.

## 1. Objetivo

Consolidar el sistema visual introducido en #187 y elevar la consistencia de `/servicios/`, sus fichas y los bloques compartidos, sin repetir trabajo ya integrado ni cambiar contenido o contratos.

La prioridad no es añadir más efectos: es corregir un defecto real de tokens, hacer que superficies/badges/encabezados tengan reglas reconocibles y convertir el configurador en una composición más clara y formal.

## 2. Hallazgos verificados

### Ya resuelto; no reabrir sin evidencia

- `ServiceCard` y `ProjectCard` ya usan `card-lift`, `--shadow-1`, foco y hover condicionado.
- La cabecera ya tiene `--surface-header`, glass con blur de 12px y fallback opaco.
- Home ya tiene `surface-raised`, gradientes, badges diferenciados, compromisos elevados y steps con contraste validado.
- Source Sans 3 + JetBrains Mono, reduced motion, E2E y presupuestos LHCI están integrados.

### Defecto técnico prioritario

DaisyUI define `--border: 1px` como **grosor**. El sistema propio usa ese mismo nombre como **color** y lo referencia desde `--color-border`.

Comprobación de producción en `/servicios/` con `alexdark`:

```text
--border: 1px
--color-border: 1px
border-color computado en ServiceCard: base-content (currentColor)
```

El valor de color es inválido y el navegador usa el color de texto. El gate estático calcula los pares fuente correctamente, pero no detecta esta resolución en ejecución.

**Consecuencia:** antes de endurecer bordes o añadir superficies hay que separar el token de color del grosor DaisyUI y probar el resultado computado en ambos temas.

### Oportunidades visuales reales

- El configurador conserva borde/superficie base, pero no tiene elevación y sus filas son una sucesión de separadores; base, opcionales y resumen tienen poca diferenciación.
- Las cards de catálogo ya están elevadas, pero no disponen de una categoría en el modelo `ProductCard`. Añadir badges exigiría datos reales; no se derivará una taxonomía artificial del slug.
- Los encabezados de home repiten la misma estructura Astro. Pueden compartir un patrón presentacional sin reintroducir abstracciones de layout retiradas.
- Los badges de categoría y atributos se pueden diferenciar mejor sin usar `badge-soft` claro, que mantiene avisos de contraste.
- El footer y ciertos estados active/easing pueden alinearse con las reglas existentes.

## 3. Mapa de capacidades

| Módulo                 | Responsabilidad                                                          | Depende de                         |
| ---------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| `border-runtime`       | Separar color/grosor, corregir superficies y probar estilos computados   | —                                  |
| `section-system`       | Encabezados, badges, ritmo y estados compartidos                         | `border-runtime`                   |
| `service-catalog`      | Coherencia de cards y fichas sin inventar taxonomía                      | `border-runtime`, `section-system` |
| `module-configurator`  | Base, módulos y resumen con mejor jerarquía, conservando selección y CTA | `border-runtime`                   |
| `iteration-validation` | Contraste, responsive, E2E, limpieza, documentación y rendimiento        | Todos                              |

Orden: `border-runtime` → `section-system` y `module-configurator` → `service-catalog` → `iteration-validation`.

## 4. Alcance

### 4.1 Corrección de bordes y superficies

- Renombrar el token semántico propio a un nombre sin colisión —por ejemplo `--border-color`— y mantener `--border` exclusivamente como grosor DaisyUI.
- Conservar la utilidad pública Tailwind `border-border`; cambiar su referencia interna, no todos sus consumidores.
- Actualizar shorthands propios como `.surface-raised` para consumir el token de color corregido.
- Añadir una prueba E2E que demuestre que el alias se resuelve a un color válido y que la card usa el color esperado, no `currentColor`.
- Revisar visualmente claro/oscuro después de la corrección: el cambio debe revelar los bordes diseñados, no compensarlo aumentando contraste indiscriminadamente.
- Mantener `bg` como superficie base y `card` como raised. Añadir `surface-sunken` solo si tiene consumidor en el configurador; no crear clases duplicadas para base/overlay sin necesidad.
- El menú móvil y la cabecera conservan su comportamiento y tokens de superficie actuales.

### 4.2 Encabezados de sección

- Extraer un `SectionHeader.astro` presentacional solo si sustituye al menos tres repeticiones reales de home.
- API mínima: `id`, `eyebrow`, `title`, `description?`; título `h2` y `aria-labelledby` conservado por la sección consumidora.
- Conservar eyebrow mono, título sans, texto secundario `text-muted` y la escala `--step-*`.
- Añadir como máximo un separador o regla tipográfica compartida si mejora la revisión visual; no introducir números nuevos ni cambiar `// 01…04`.
- No convertir `PageHead` en el mismo componente: su H1 y contrato son distintos. Solo alinear reglas visuales si procede.

### 4.3 Badges y cards de catálogo

- Mantener dos niveles: categoría destacada y atributos neutrales.
- Evaluar categoría con `badge-accent badge-sm` frente al outline actual; atributos con variante ghost/outline neutra. La decisión final debe quedar respaldada por captura y contraste.
- No usar `badge-soft` claro sin eliminar antes sus avisos AA.
- No añadir badges a `ServiceCard` mientras `ProductCard` no tenga una categoría editorial real y validada.
- Conservar card-link, único enlace, nombre accesible, CTA visual `aria-hidden`, imágenes y prioridad LCP.
- No aplicar `line-clamp` si solo sirve para ocultar diferencias de contenido; primero revisar ritmo y altura real.
- Las fichas de detalle heredan la corrección de bordes y tipografía; solo se ajustan bloques que presenten una inconsistencia demostrada.

### 4.4 Configurador de módulos

- Separar visualmente tres zonas: **base incluida**, **módulos opcionales** y **resumen de selección**.
- La base será contenido estático, sin checkbox ni apariencia de opción modificable.
- Cada módulo conservará `<label>` asociado y toda su superficie clicable; el checkbox DaisyUI mantiene foco y estado checked.
- Las filas pueden usar superficie sunken/borde y espaciado propio, sin convertir cada línea de descripción en un bloque independiente.
- El resumen será visible como zona diferenciada, inferior o lateral según reflow; nunca dependerá de posición visual para entender el orden.
- Conservar `data-needs-*`, `aria-live`, `aria-atomic`, orden de módulos, serialización, URLs de CTA y funcionamiento sin cambios de JavaScript.
- No añadir contadores o precios no presentes en el contenido.

### 4.5 Navegación, footer y estados

- No añadir otra sombra a la cabecera: el glass actual es suficiente. La corrección de borde debe integrarlo con el resto.
- Footer: revisar contraste/peso de títulos y enlaces, sin modificar destinos ni texto.
- Reutilizar `--ease-out`; introducir tokens de duración solo si sustituyen al menos dos valores propios.
- Mantener transiciones de transform/color ya existentes dentro de 180–200 ms cuando se toquen; no animar sombras ni usar `transition: all`.
- `:active` solo donde aporte feedback a una acción real. No simular interactividad en cards informativas.

### 4.6 Arquitectura CSS y Clean Code

Aplicar Clean Code tanto al código introducido en #187 como al nuevo, sin refactorizaciones ajenas.

- `global.css` conserva tokens, fuentes, reset, focus y patrones con varios consumidores (`surface-raised`, `card-lift`, utilidades compartidas).
- Las reglas específicas de un componente usan **CSS Modules**: `import styles from './Component.module.css'` y `class={styles.nombre}` o `class:list` cuando haya composición.
- Migrar las reglas específicas existentes de Hero (`hero-surface`, `terminal-prompt`), ContactCta (`contact-cta-panel`) y Header (`site-header`, glass/fallback) a módulos co-localizados. Los tokens de gradiente, elevación y superficie permanecen globales.
- Las reglas nuevas del configurador y de `SectionHeader` nacerán en sus módulos, no en `global.css`.
- No convertir utilidades Tailwind/DaisyUI en clases propias por sistema ni crear un módulo para una regla realmente compartida.
- No usar `@apply`, estilos inline ni selectores globales nuevos para resolver aislamiento. Si una interacción compartida necesita `:global`, debe justificarse y quedar cubierta por E2E.
- Las pruebas no dependen de nombres hash: usarán IDs, atributos `data-*` estables y estilos computados.
- Revisar referencias sin regla, selectores sin consumidor, comentarios obsoletos y duplicación de decisiones en los componentes tocados. Conservar contratos públicos o declarar explícitamente cualquier cambio.

## 5. Supuestos

1. La home necesita consolidación, no otro rediseño.
2. El trabajo se concentra en componentes compartidos, `/servicios/` y sus fichas; el resto solo recibe correcciones heredadas.
3. No se cambian copy, taxonomía, contenido, precios, rutas, APIs, formulario, CMP, tracking ni JavaScript del configurador.
4. No se añaden dependencias.
5. La calidad estética se valida con capturas; los tests prueban contratos objetivos.

## 6. Estructura previsible

```text
src/styles/global.css                    → tokens y patrones realmente compartidos
src/components/Header.module.css         → superficie/glass importado como styles
src/components/sections/Hero.module.css  → hero y prompt importados como styles
src/components/sections/ContactCta.module.css → panel importado como styles
src/components/SectionHeader.astro       → nuevo solo si cumple la regla de reutilización
src/components/SectionHeader.module.css  → reglas específicas si son necesarias
src/components/NeedsConfigurator.astro   → composición visual, mismos hooks
src/components/NeedsConfigurator.module.css → filas, zonas y resumen
src/components/ServiceCard.astro         → revisión, no taxonomía nueva
src/components/Footer.astro              → contraste/peso si procede
tests/e2e/visual-system.spec.ts          → borde computado y patrones visuales
tests/e2e/entrega-servicios.spec.ts      → selección, CTA y contratos
tests/e2e/ui-matrix.spec.ts              → responsive/CMP
docs/standards/website/diseno.md         → sistema final
```

## 7. Estilo y limpieza

- Tokens semánticos y clases compartidas; ningún literal fuera de las zonas autorizadas.
- CSS Modules importados como objeto `styles` para reglas específicas; ninguna clase específica nueva se añade al global.
- Sin `!important`, View Transitions, sombras Tailwind prohibidas ni nuevas clases sin consumidor.
- No mantener alias del token antiguo una vez migrado: `--border` debe seguir siendo exclusivamente el grosor DaisyUI.
- Actualizar documentación y eliminar selectores experimentales no adoptados.
- No hacer limpieza general fuera de los archivos tocados.

## 8. Estrategia de pruebas

### Pruebas nuevas o reforzadas

- **RED inicial:** computed style demuestra la colisión actual; después debe resolver el color semántico en `alexlight` y `alexdark`.
- Header/cards/configurador usan bordes válidos y no `currentColor` como sustituto accidental.
- Las pruebas de Hero/Header/ContactCta dejan de exigir nombres globales y validan comportamiento visual mediante selectores estables.
- Build y búsqueda de símbolos confirman que cada clase de módulo tiene import y consumidor.
- Encabezados conservan un solo H1 por página, IDs y `aria-labelledby`.
- Configurador: selección múltiple, resumen `aria-live`, CTA con módulos serializados, enlace sin selección, teclado y foco.
- Cards: card-link, foco, hover y reduced motion sin regresión.
- Responsive 320, 390, 768, 1280/1440 px, ambos temas; CMP por encima del header.
- Axe en home, servicios y una ficha; contraste de cualquier variante nueva de badge.

### Cierre

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm lint:css && pnpm format:check
pnpm check:records && pnpm audit:cookies && pnpm check:copy
pnpm check:classes && pnpm check:contrast
pnpm build && pnpm test:e2e
pnpm check:links && pnpm smoke
```

Con preview del build final: `pnpm audit:css` y `pnpm lhci`. No ampliar presupuestos.

## 9. Límites

### Siempre

- Preservar contenido, contratos, AA, foco, reduced motion y funcionamiento sin JS ya existente.
- Revisar capturas antes/después y el diff completo.
- Documentar los tokens/patrones adoptados.

### Pedir antes

- Nueva taxonomía de servicios, cambios de copy, nuevas dependencias o cambios de comportamiento.
- Commit, push, PR o merge.

### Nunca

- Renombrar el grosor `--border` de DaisyUI ni intentar ganar la cascada con `!important`.
- Inventar badges/categorías o información comercial.
- Relajar pruebas o presupuestos para cerrar.

## 10. Criterios de éxito

1. `border-border` y las superficies propias resuelven colores válidos y coherentes en ejecución, con prueba en ambos temas.
2. Home y servicios comparten encabezados, badges, elevación y estados sin diferencias arbitrarias.
3. El configurador distingue base/opcionales/resumen y conserva íntegros selección, accesibilidad y URLs.
4. No hay badges sin significado, superficies duplicadas ni clases/tokens sin consumidor.
5. No hay overflow, regresiones de foco, reduced motion, CMP, card-links o diálogos.
6. Todos los comandos de cierre pasan y LHCI mantiene los umbrales.
7. La documentación y las capturas finales describen el sistema efectivamente publicado en el candidato.
8. Las reglas específicas de componentes están en módulos importados como `styles`; `global.css` no conserva las migradas ni añade reglas de un único consumidor.

## 11. Preguntas abiertas

Ninguna bloqueante. La aprobación confirma la corrección inicial de `--border`, la ausencia de categorías artificiales y el uso de CSS Modules importados como `styles` para reglas específicas, manteniendo los patrones compartidos en el global.
