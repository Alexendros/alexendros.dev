# Especificación: evolución visual profesional y sistema DaisyUI

- Fecha: 2026-11-03.
- Revisión: 2 — alcance visual ampliado y tipografía A.
- Base inspeccionada: `5ba7885542565ae65ea43cdba5cbedf2da523f23` (`main`).
- Estado: **implementada con opción A y validada localmente; ver `RESULTADOS-DAISYUI.md`**.

## 1. Objetivo

Elevar `https://alexendros.dev/` a una presentación más profesional, formal y resuelta: mejor jerarquía, tipografía, profundidad, ritmo, estados interactivos y coherencia entre páginas.

No se trata de aplicar una receta de DaisyUI ni de hacer un cambio cosmético aislado. Se desarrollará una dirección visual propia sobre la base actual, usando DaisyUI donde aporte componentes adecuados y CSS semántico donde el sistema necesite un tratamiento específico.

Se conservarán el catálogo, el copy comercial, las rutas, la accesibilidad y los contratos de interacción. La identidad tecnológica debe seguir reconocible, pero la monocromía tipográfica actual no es intocable.

### Recorrido prioritario

Como persona que valora un encargo profesional, debo percibir una propuesta creíble y cuidada, distinguir con rapidez el mensaje principal, los compromisos, las vías de servicio, las referencias y el proceso, y completar el recorrido en claro u oscuro, con teclado, sin JavaScript cuando ya esté soportado y sin depender del movimiento.

## 2. Diagnóstico verificado

### Base técnica y visual

- Astro 7.3.5, Tailwind 4.3.3 y DaisyUI 5.5.14; configuración CSS-first.
- `alexlight` y `alexdark` ya existen en `src/styles/theme.css`, con OKLCH, acento ámbar y todos los roles `info`, `success`, `warning` y `error`.
- Los alias semánticos de producto viven en `src/styles/global.css`; los componentes no deben consumir primitivos directamente.
- La identidad actual combina azul, acento ámbar, JetBrains Mono para todos los roles y escala fluida `--step-*`.
- Existen foco visible, skip link, selector de tema, menú móvil, `Button` con carga, tarjetas enlazables y proceso estático.
- DaisyUI excluye numerosos componentes para controlar CSS. Activar uno será una decisión de diseño y presupuesto, no un ejercicio de catálogo.

### Observaciones de producción

Inspección con Chromium sobre la home publicada:

- Escritorio claro y oscuro: estructura legible y sin desbordamiento horizontal, pero superficies planas, proceso con poca jerarquía y escasa diferenciación entre bloques.
- Móvil a 390 px: menú operativo, sin desbordamiento horizontal; controles principales de 44 px de alto.
- El prompt `~/alexendros $ nuevo-encargo` es un distintivo aprovechable, pero actualmente es texto sin contenedor visual.
- Los compromisos son una lista semántica correcta con tres bloques planos.
- Las cards de home usan DaisyUI; `ServiceCard` y `ProjectCard` usan el patrón propio `card-lift`. Esa clase no tiene actualmente una regla en los dos archivos CSS fuente: el nombre no demuestra elevación o movimiento real.
- Los badges distinguen categoría y características, pero pueden ganar consistencia de tamaño, ritmo y definición.
- En oscuro, los marcadores y conectores de `steps` requieren una comprobación específica de contraste no textual.
- El uso universal de monoespaciada refuerza la identidad técnica, pero reduce la diferencia entre lectura, titulares, controles y metadatos; es la principal oportunidad para ganar formalidad sin cambiar el contenido.

Evidencias temporales: `audit-out/daisyui-home-light.png`, `audit-out/daisyui-home-dark.png` y `audit-out/daisyui-home-mobile-menu.png`.

### Baseline automática

- `pnpm check:contrast`: correcto; mantiene dos avisos conocidos de `badge-soft` claro por debajo de AA. No se adoptará esa variante sin corregir esos pares.
- `pnpm check:classes`: correcto.
- `pnpm lint:css`: correcto.
- `docs/audits/2026-11-03/RESULTADOS.md` registra axe, matriz UI, diálogos y LHCI en verde. Los cambios visuales obligan a repetir las comprobaciones afectadas.

## 3. Dirección visual

### Concepto

**Editorial técnica de precisión:** una base sans serif formal para lectura y autoridad; monoespaciada reservada para evidencias, código y metadatos; superficies azuladas con capas discretas; acento ámbar usado con intención; profundidad mediante elevación, gradientes de baja amplitud y transparencia controlada.

### Elemento distintivo

El prompt del hero evoluciona a una firma visual compacta. El lenguaje de líneas, terminales y numeración puede reaparecer en el proceso y en detalles técnicos, sin convertir cada sección en una consola.

### Layout y ritmo

```text
┌──────────────────────────────────────────────────────┐
│ Cabecera sticky translúcida / navegación / Contacto │
├──────────────────────────────────────────────────────┤
│ Fondo con gradiente tonal muy discreto               │
│ Prompt · H1 · lectura · CTA                         │
│ Compromisos en una unidad estructurada              │
├──────────────────────────────────────────────────────┤
│ Servicios: cards con jerarquía y elevación           │
│ Referencias: imagen + contenido + tipo de proyecto  │
│ Proceso: secuencia visible, sin falsa progresión    │
│ CTA de contacto como cierre visual integrado        │
└──────────────────────────────────────────────────────┘
```

El mobile apila los mismos grupos sin reducir objetivos táctiles ni crear una versión visualmente secundaria.

## 4. Mapa de capacidades

| Módulo               | Responsabilidad                                                                      | Depende de                                 |
| -------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| `visual-foundations` | Tipografía, tokens, elevación, gradientes, glass, movimiento y contraste             | Elección tipográfica                       |
| `content-components` | Cards, badges, compromisos, prompt y superficies de contenido                        | `visual-foundations`                       |
| `process-navigation` | Steps, cabecera, menú y controles                                                    | `visual-foundations`                       |
| `site-coherence`     | Extensión coherente a CTA, formularios, FAQ, footer y páginas que heredan el sistema | `content-components`, `process-navigation` |
| `visual-validation`  | Pruebas, limpieza, responsive, accesibilidad, rendimiento y documentación            | Todos los anteriores                       |

Orden: `visual-foundations` → `content-components` y `process-navigation` → `site-coherence` → `visual-validation`.

## 5. Opciones tipográficas abiertas

Todas las opciones siguientes se pueden autoalojar mediante Fontsource y declaran **SIL OFL 1.1**, verificada en el registro npm el 2026-11-03. OFL permite uso comercial sin coste, pero no significa ausencia de licencia: se conservarán los avisos y archivos de licencia distribuidos por cada paquete.

| Opción              | Sistema                                              | Carácter                                            | Ventajas                                                                                     | Coste o riesgo                                                                                                                     |
| ------------------- | ---------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **A — recomendada** | **Source Sans 3 + JetBrains Mono**                   | Profesional, clara, técnica sin parecer una consola | Sans muy legible; conserva el prompt y metadatos actuales; cambio reconocible pero coherente | Dos familias variables; exige reajustar medida, pesos y algunas alturas                                                            |
| **B**               | **IBM Plex Sans + JetBrains Mono**                   | Corporativa, ingeniería, más contundente            | Más personalidad que una sans neutra; titulares sólidos y controles precisos                 | Puede endurecer demasiado el tono; IBM Plex Mono no se propone para mantener dos variables y evitar archivos estáticos adicionales |
| **C**               | **Public Sans + Source Code Pro**                    | Institucional, sobria, documental                   | Excelente neutralidad y lectura; Source Code Pro da un acento técnico más discreto           | Sustituye por completo la firma JetBrains; resultado más neutral y menos diferenciado                                              |
| **D**               | **Source Serif 4 + Source Sans 3; mono del sistema** | Editorial, experta, formal                          | Titulares con autoridad y cuerpo muy legible; menor sensación de plantilla tecnológica       | Mayor cambio de identidad; la terminal pierde protagonismo; conviene validar especialmente el H1                                   |

Muestra visual comparativa con las fuentes reales: `audit-out/opciones-tipograficas.png`. Es una lámina tipográfica, no una propuesta final de layout.

### Decisión tipográfica

**Opción A aprobada: Source Sans 3 + JetBrains Mono.** Source Sans 3 asumirá lectura, titulares y controles; JetBrains Mono quedará reservada para prompt, código y metadatos seleccionados.

### Criterios de aplicación

- Se implementará únicamente la opción A.
- Máximo dos familias descargadas; no se mantendrán fuentes antiguas sin consumidores.
- Preferencia por variables y subconjunto latin, con los pesos efectivamente usados.
- `font-display: swap`, preload solo de la fuente crítica y fallbacks métricamente compatibles para limitar CLS.
- Se revisarán H1, cuerpo, botones, badges, formulario, prompt y footer en 320–1440 px y en ambos temas.
- La recomendación A conserva mejor la identidad actual y el equilibrio entre formalidad y tecnología.

## 6. Alcance funcional y visual

### 6.1 Fundamentos

- Conservar `alexlight`/`alexdark`; evolucionar sus valores cuando mejore jerarquía o contraste, no para seguir una paleta genérica.
- Introducir roles tipográficos explícitos (`display`, `body`, `mono`) y alinear la escala `--step-*`, interlineado, tracking y medida de prosa con la opción elegida.
- Añadir tokens semánticos de elevación, superficie, transparencia y estado en las fuentes de verdad existentes.
- No usar sombras Tailwind `shadow-sm/md/...`, colores literales en componentes ni opacidades arbitrarias prohibidas por `check:classes`.
- Mantener separación visible entre fondo, superficie y borde en ambos temas.
- Incorporar **gradientes tonales discretos** en hero y cierre de contacto si la revisión visual confirma su valor. Deben derivarse de tokens y no portar información.
- Incorporar **glass controlado** en la cabecera sticky: fondo translúcido, borde y blur moderado, con fallback opaco y contraste suficiente sobre todo contenido desplazado.
- No añadir ruido por defecto: aporta textura, pero también complejidad y riesgo de artefactos sin una necesidad clara.

### 6.2 Cards, badges y referencias

- Unificar el tratamiento de `card-lift` y cards DaisyUI: superficie, borde, elevación, hover, active y foco coherentes.
- Implementar o retirar nombres sin efecto; no dejar clases decorativas muertas.
- El movimiento será solo `transform`/`opacity`, limitado a `prefers-reduced-motion: no-preference`, sin `transition: all` ni desplazamiento del layout.
- Conservar card-links con un único enlace, nombre accesible del título y sin interactivos anidados.
- Mantener imágenes responsivas y prioridad LCP. Se pueden valorar overlays o badges superpuestos solo si no tapan información ni reducen legibilidad.
- Diferenciar categoría y características por tamaño, peso y tratamiento. No usar `badge-soft` claro mientras sus avisos de contraste sigan abiertos.
- Revisar espaciado y estructura de `card-body`/`card-actions` cuando aporten una jerarquía real, sin duplicar CTA ni alterar nombres accesibles.

### 6.3 Hero y compromisos

- Convertir el prompt en una pieza compacta tipo código con tokens semánticos.
- Mantener H1, CTAs, copy y enlaces.
- Refinar los tres compromisos como una unidad estructurada, horizontal en escritorio y apilada en móvil.
- Se valorarán `stat` o `join` por su ajuste visual y semántico. No se usarán para simular métricas: alcance, plazo y condiciones son compromisos, no cifras.
- Ajustar el ritmo vertical por jerarquía de secciones, no añadiendo espacio uniforme indiscriminadamente.

### 6.4 Proceso, navegación y botones

- Dar presencia a números, conectores y texto de los cuatro pasos sin sugerir progreso completado ni un control interactivo.
- Comprobar marcadores/conectores con contraste no textual 3:1 cuando sean necesarios para percibir la secuencia.
- Mantener steps verticales en móvil, horizontales en escritorio, orden del DOM y contenido sin JavaScript.
- Conservar navbar sticky, CTA «Contacto», selector de tema y menú móvil; el glass no debe cambiar altura, stacking del CMP ni comportamiento.
- Unificar foco con el sistema existente y conservar objetivos táctiles y estado de carga.
- Revisar hover, active, focus y disabled sin animar sombras de forma costosa ni cambiar el contrato del formulario.
- No introducir `loading` en enlaces ni modificar la API de contacto.

### 6.5 Coherencia del sitio y componentes admitidos

- Extender la dirección a CTA de contacto, FAQ, formularios, diálogos y footer cuando hereden patrones visuales; evitar una home renovada sobre páginas visualmente antiguas.
- Revisar las páginas principales y legales con la nueva tipografía, medida y espaciado.
- Se admiten componentes DaisyUI actualmente excluidos —por ejemplo `stat`, `join`, `tooltip`, `indicator` o `mockup-code`— solo cuando haya un consumidor real, semántica correcta, teclado/contraste resueltos y beneficio frente a HTML/CSS propio.
- No habrá tooltips con información esencial, indicators decorativos sin significado ni componentes activados «por si acaso».
- No se cambiarán textos, servicios, URLs, analítica, CMP ni lógica de negocio por necesidades del rediseño.

## 7. Supuestos

1. Se aprueba una evolución visual del sitio, no solo el listado inicial de mejoras.
2. Home, `/servicios`, `/referencias`, `/metodo` y `/contacto` son prioritarias; los tokens y componentes compartidos afectarán de forma controlada al resto.
3. Glass y gradientes están autorizados dentro de los criterios de contraste, rendimiento y sobriedad de esta especificación.
4. La elección de una opción tipográfica autoriza añadir los paquetes Fontsource necesarios y retirar los que queden sin uso.
5. La validación estética requiere capturas antes/después y revisión humana; los tests automáticos no certifican por sí solos una apariencia profesional.

## 8. Estructura previsible

```text
src/styles/theme.css                    → temas DaisyUI y primitivos OKLCH
src/styles/global.css                   → tokens, tipografía y patrones compartidos
src/layouts/Layout.astro                → imports/preload de fuentes elegidas
src/components/Commitments.astro
src/components/ServiceCard.astro
src/components/ProjectCard.astro
src/components/Header.astro
src/components/Footer.astro
src/components/Button.astro
src/components/ContactForm.astro         → solo presentación si resulta necesaria
src/components/sections/                → hero, servicios, referencias, método y CTA
tests/e2e/                              → contratos visuales, tema, UI y accesibilidad
scripts/check-contrast.mjs              → nuevas parejas y estados
scripts/check-classes.mjs               → guardrails existentes
docs/standards/website/diseno.md        → contrato vivo actualizado
package.json / pnpm-lock.yaml           → solo fuentes seleccionadas
```

El plan confirmará los archivos reales. No se tocará lógica de contacto, tracking o consentimiento para resolver estilos.

## 9. Estilo y limpieza

- Astro + TypeScript estricto; HTML semántico y contenido desde las fuentes existentes.
- CSS por capas, nombres que expresen responsabilidad y variables semánticas.
- Sin `!important`, `transition: all`, View Transitions ni reglas prohibidas por Stylelint/`check:classes`.
- Movimiento solo en `transform`/`opacity`, desactivado con reduced motion.
- Consolidar decisiones duplicadas, no unir reglas solo por parecerse visualmente.
- Eliminar imports, preloads, selectores, clases y exclusiones DaisyUI obsoletos dentro del alcance; no dejar dos sistemas tipográficos o de cards compitiendo.
- Actualizar comentarios y documentación que describan el sistema anterior.
- No hacer limpieza general ajena al cambio ni refactorizaciones estructurales sin cobertura.
- Revisar el diff completo antes del cierre.
- Formato Prettier y Stylelint del repositorio.
- Commits, push o PR solo con autorización explícita.

## 10. Estrategia de pruebas

### Durante la implementación

- Baseline y pruebas E2E de hero, proceso, header, referencias, estructura de productos, tema, formulario y diálogos.
- Aserciones de estilo computado para elevación, transform, reduced motion, glass y foco cuando sean contratos nuevos.
- Contraste ampliado a nuevas combinaciones, incluidos gradientes/transparencias y estados de steps/badges.
- Medición de fuentes: número de archivos, peso, preload, CLS y LCP; no mantener la fuente anterior sin consumidor.
- Revisión manual a 320, 390, 768, 1280/1440 px, en claro y oscuro, con y sin reduced motion.
- Comparación antes/después de home y de todas las superficies compartidas afectadas.
- Comprobación del menú móvil, CMP sobre cabecera, card-links, diálogos y formulario tras los cambios.

### Cierre obligatorio

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm lint:css
pnpm format:check
pnpm check:records
pnpm audit:cookies
pnpm check:copy
pnpm check:classes
pnpm check:contrast
pnpm build
pnpm test:e2e
```

Además:

- `pnpm audit:css` y presupuesto CSS vigente.
- LHCI móvil con los umbrales ya definidos; no ampliar presupuestos para ocultar regresiones.
- Sin overflow, CLS introducido por fuentes, pérdida de contenido sin JS ni regresiones en CMP/consentimiento.
- Inventario final de clases/imports recién introducidos: cada uno debe tener consumidor o función demostrable.

## 11. Límites

### Siempre

- Preservar semántica, contraste AA, foco, objetivos táctiles y reduced motion.
- Documentar tokens, fuentes y patrones nuevos en `docs/standards/website/diseno.md`.
- Mantener licencias de fuentes y recursos autoalojados.
- Verificar con los comandos del repositorio antes de declarar el trabajo terminado.

### Pedir antes

- Cambiar copy, catálogo, URLs, CI, presupuestos o comportamiento de formulario/CMP.
- Introducir una dirección cromática distinta, nuevas fuentes fuera de la opción aprobada o dependencias adicionales.
- Crear commits, push o PR.

### Nunca

- Copiar literalmente código que infringe los gates del proyecto.
- Eliminar o relajar pruebas para obtener verde.
- Convertir una sucesión estática en una barra de progreso falsa.
- Ocultar información esencial detrás de tooltips, transparencias o movimiento.
- Dar por superada la calidad visual solo porque axe o Lighthouse estén en verde.

## 12. Criterios de éxito

1. El sitio transmite una imagen más profesional y formal, con una dirección propia coherente en las páginas afectadas.
2. La tipografía elegida separa con claridad lectura, titulares, controles y metadatos; no quedan fuentes o imports antiguos sin uso.
3. Cards, badges, compromisos, prompt, steps, cabecera y cierres comparten un lenguaje documentado de superficie, borde, elevación y estados.
4. Gradientes y glass aportan profundidad sin reducir legibilidad, contraste, rendimiento ni estabilidad.
5. Claro y oscuro conservan AA; los nuevos indicadores no textuales necesarios alcanzan 3:1.
6. No hay overflow a 320–1440 px, cambios de layout por hover, CLS tipográfico evitable, foco perdido ni movimiento con reduced motion.
7. Menú, tema, card-links, diálogos, filtros, CMP y formulario mantienen sus contratos.
8. Todos los comandos de cierre y comprobaciones visuales afectadas pasan sobre el código final, con capturas y resultados.
9. El diff no contiene selectores muertos, dependencias sin uso, documentación obsoleta ni componentes activados sin consumidor justificado.

## 13. Siguiente fase

La especificación y la opción A están aprobadas. El siguiente paso es redactar el plan técnico para revisión, descomponerlo después en tareas verificables y ejecutarlo solo tras esa revisión.

El plan UI/CSS anterior se ha archivado con autorización en `docs/audits/2026-11-02/PLAN.md` y `docs/audits/2026-11-02/TODO.md`. El plan técnico vigente se encuentra en `tasks/plan.md`, pendiente de revisión antes de generar tareas.
