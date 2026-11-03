# Plan técnico — evolución visual profesional y DaisyUI

- Fecha: 2026-11-03.
- Especificación aprobada: `docs/audits/2026-11-03/SPEC-DAISYUI.md`.
- Tipografía aprobada: **Source Sans 3 + JetBrains Mono**.
- Estado: **ejecutado y validado localmente; evidencias en `docs/audits/2026-11-03/RESULTADOS-DAISYUI.md`**.

## 1. Resultado previsto

Evolucionar el portal desde una base funcional pero visualmente plana hacia un sistema editorial técnico más formal: sans serif para lectura y autoridad, monoespaciada como acento, superficies con profundidad, gradientes discretos, cabecera glass y componentes coherentes en todo el recorrido.

No cambian contenido, catálogo, URLs, contratos de contacto, CMP, tracking ni comportamiento de navegación.

## 2. Decisiones de arquitectura visual

### 2.1 Una fuente de verdad, dos niveles ya existentes

- `src/styles/theme.css` conserva los temas DaisyUI y primitivos OKLCH.
- `src/styles/global.css` conserva los alias semánticos, roles tipográficos y patrones compartidos.
- Los componentes consumen tokens y clases del sistema; no reciben valores cromáticos propios.
- No se crea un segundo tema ni una hoja paralela para el rediseño.

### 2.2 Tipografía A sin restos

- Añadir `@fontsource-variable/source-sans-3`; conservar `@fontsource-variable/jetbrains-mono`.
- Importar ambos desde `Layout.astro`. La entrada principal de Source Sans 3 y el archivo latin variable `files/source-sans-3-latin-wght-normal.woff2` están verificados en Fontsource 5.3.1.
- Definir `--font-sans`/`--font-body` y `--font-display` con Source Sans 3; `--font-mono` conserva JetBrains Mono.
- Cambiar `body` a la sans; titulares y botones usan la misma familia con pesos diferenciados. Prompt, código, eyebrows y metadatos seleccionados conservan mono.
- Sustituir el preload de JetBrains por el latin variable de Source Sans. JetBrains se carga cuando se use, sin preload prioritario.
- Revisar `font-extrabold`: la dirección formal prefiere 600–700 en titulares, no peso máximo generalizado.
- No mantener imports, preloads o reglas de una tercera fuente. No se añaden paquetes de las opciones descartadas.

### 2.3 Profundidad mediante tokens

- Introducir solo los tokens necesarios para elevación, superficie de cabecera y fondos de sección; nombres semánticos, no valores por componente.
- Sombras propias basadas en `color-mix`, no utilidades `shadow-*` bloqueadas.
- Gradientes estáticos de baja amplitud para hero y cierre de contacto, derivados de `base`/`brand`. Sin animación ni texto dependiente del fondo para comunicar información.
- Glass de cabecera con superficie translúcida, borde y blur moderado. La superficie opaca es el fallback; `@supports` activa la transparencia solo cuando existe backdrop filter.
- Revisar los extremos del gradiente y el estado glass en ambos temas, no solo el color base.

### 2.4 Un patrón de card, no tres acabados

- Convertir `card-lift` en una regla compartida real o sustituirla por un nombre más preciso si el resultado no implica movimiento.
- Aplicar el mismo lenguaje a cards DaisyUI de home, `ServiceCard` y `ProjectCard`: superficie, borde, elevación y foco.
- Hover con desplazamiento vertical mínimo solo en dispositivos con hover y `prefers-reduced-motion: no-preference`.
- Animar únicamente `transform`; los cambios de borde o sombra no necesitan transición. Sin `transition: all` ni animación de box-shadow.
- Mantener el enlace estirado, el foco `has(:focus-visible)`, las imágenes y la prioridad LCP.
- No introducir overlays que oculten información ni enlaces adicionales dentro de card-links.

### 2.5 Componentes DaisyUI con consumidor real

- Conservar `card`, `badge`, `steps`, `button`, `navbar`, `menu` y `footer` donde ya funcionan.
- Para compromisos, comparar la lista actual refinada con `stat`/`stats`; adoptar DaisyUI solo si conserva `<ul>/<li>`, reduce CSS propio y no presenta los compromisos como métricas.
- No activar `tooltip`, `indicator`, `mockup-code` u otros módulos sin una necesidad que aparezca en una tarea aprobada.
- Actualizar la lista `exclude` únicamente con módulos efectivamente usados al finalizar; no dejar activaciones provisionales.

### 2.6 Coherencia de recorrido

- Hero: prompt tipo código compacto, H1 con mejor lectura, CTA intactos y gradiente tonal.
- Compromisos: una unidad con jerarquía título/detalle y ritmo consistente.
- Servicios/referencias: cards alineadas, badges con dos niveles claros y espaciado consistente.
- Proceso: números y conectores visibles, sin `aria-current`, estados completados ni interacción ficticia.
- Contacto: cierre con superficie/gradiente relacionado con el hero; CTA y copy intactos.
- Cabecera/menú: glass sin cambiar altura, stacking del CMP, objetivos táctiles ni JS.
- Footer, FAQ, formularios y diálogos: heredar tipografía, superficies y foco; solo ajustes puntuales para evitar contraste de estilos.

## 3. Orden de ejecución

### Fase 0 — Baseline reproducible

1. Confirmar working tree y SHA de partida.
2. Ejecutar quality, tests y build sobre la base.
3. Generar build/preview local y capturas comparables de home, servicios, referencias, método y contacto en claro/oscuro, móvil/escritorio.
4. Guardar medición inicial de fuentes, CSS, CLS/LCP y `audit:css`.

**Salida:** baseline identificado; cualquier fallo preexistente queda registrado antes del diff visual.

### Fase 1 — Fundamentos tipográficos y tokens

1. Añadir Source Sans 3 y actualizar imports/preload.
2. Separar roles sans/mono y ajustar escala, pesos, tracking, medida e interlineado según evidencia visual.
3. Añadir tokens de elevación/superficie/gradiente necesarios.
4. Ampliar contraste y pruebas para los nuevos pares antes de construir componentes sobre ellos.

**Salida:** sitio funcional con la nueva tipografía y tokens; sin componentes nuevos todavía.

### Fase 2 — Recorrido principal

Implementar en vertical y revisar después de cada bloque:

1. Hero + prompt + compromisos.
2. Cards de servicios + badges.
3. Cards de referencias + imágenes.
4. Steps + CTA de método.
5. Cabecera glass + menú móvil + botones compartidos.
6. Cierre de contacto.

**Salida:** home completa y contratos de índices conservados.

### Fase 3 — Coherencia y saneamiento

1. Revisar las páginas que heredan el sistema: servicios, referencias, método, contacto, experiencia y legales.
2. Ajustar footer, FAQ, formularios y diálogos solo donde persista una inconsistencia visible.
3. Eliminar selectores sin efecto, imports/preloads antiguos, tokens sin consumidor y exclusiones DaisyUI provisionales.
4. Actualizar `docs/standards/website/diseno.md` con fuentes, tokens y patrones finales.

**Salida:** un único sistema documentado, sin restos del régimen anterior dentro del alcance.

### Fase 4 — Validación y evidencias

1. Ejecutar gates, E2E completos, axe/matriz UI y revisión manual responsive/reduced-motion.
2. Medir CSS, fuentes, CLS/LCP y LHCI sobre el build final.
3. Comparar capturas antes/después y revisar el diff completo.
4. Registrar resultados y limitaciones; no declarar cierre si falta una comprobación obligatoria.

## 4. Contratos de pruebas nuevos o reforzados

| Superficie | Contrato objetivo                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Tipografía | Body/titulares usan Source Sans; prompt usa JetBrains; no queda preload de la fuente antigua como principal |
| Cards      | Hover eleva solo con hover/motion permitidos; reduced motion elimina transform; foco conserva outline       |
| Steps      | Secuencia visible en ambos temas; no hay estado de progreso anunciado; contenido sigue disponible sin JS    |
| Header     | Fallback opaco; glass solo con soporte; CMP y menú mantienen stacking, altura y foco                        |
| Gradientes | Texto supera AA sobre los extremos definidos; no hay color literal fuera de tokens                          |
| Responsive | Sin overflow a 320, 390, 768, 1280 y 1440 px; cards y compromisos apilan correctamente                      |
| Limpieza   | `audit:css`, búsqueda de símbolos y diff no muestran clases/imports/tokens introducidos sin uso             |

Las pruebas comprobarán propiedades objetivas. La revisión humana decidirá si la composición es efectivamente más profesional.

## 5. Checkpoints

### Tras fundamentos

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm lint:css && pnpm check:classes && pnpm check:contrast
pnpm build
```

Revisar H1, lectura, formulario y CLS antes de continuar.

### Tras cada dos bloques del recorrido

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm lint:css && pnpm check:classes && pnpm check:contrast
pnpm exec playwright test tests/e2e/hero-home.spec.ts tests/e2e/process-page.spec.ts tests/e2e/theme.spec.ts tests/e2e/ui-matrix.spec.ts
```

Añadir al comando las specs específicas del bloque tocado. Revisar capturas antes de acumular más cambios.

### Cierre

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

Con preview del build final:

```bash
pnpm audit:css
pnpm lhci
```

Registrar cualquier comando no ejecutado o fallo pendiente.

## 6. Riesgos y mitigación

| Riesgo                                                     | Impacto | Mitigación                                                                                                                |
| ---------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| Dos fuentes aumentan descarga y CLS                        | Alto    | Variables latin, un solo preload prioritario, medición antes/después y ajuste de fallback solo si los datos lo justifican |
| La nueva escala provoca saltos de línea o desbordes        | Alto    | Revisar H1/formularios a 320–1440 px y mantener la matriz UI bloqueante                                                   |
| Glass reduce contraste sobre contenido desplazado          | Alto    | Fallback opaco, transparencia acotada y pruebas con scroll en ambos temas                                                 |
| DaisyUI y reglas propias compiten                          | Medio   | Capas conocidas, selectores compartidos mínimos y sin `!important`; retirar reglas redundantes                            |
| Sombras/movimiento perjudican rendimiento o reduced motion | Medio   | Elevación estática, transform mínimo y condicionado; sin animación de sombra                                              |
| La home mejora pero el resto queda anticuado               | Medio   | Fase explícita de coherencia y capturas de páginas secundarias                                                            |
| Se acumulan componentes o clases experimentales            | Medio   | Activar solo consumidores finales, inventario de símbolos y revisión del diff                                             |
| Los tests verdes ocultan un resultado genérico             | Medio   | Revisión humana de comparativas; no sustituir criterio visual por axe/Lighthouse                                          |

## 7. Limpieza y límites del diff

- Archivos de estilos y componentes exclusivamente relacionados con el alcance visual.
- Ninguna refactorización de handlers, schemas, tracking o CMP.
- Ninguna eliminación de código dudoso sin demostrar alcance y consumidores.
- Ninguna actualización masiva de dependencias: solo la fuente aprobada.
- Ningún commit, push o PR sin autorización explícita.
- El plan anterior queda archivado en `docs/audits/2026-11-02/PLAN.md` y `docs/audits/2026-11-02/TODO.md`; no se reabre ni se mezcla con esta iniciativa.

## 8. Preguntas abiertas

Ninguna. Tras la aprobación de este plan se generará `tasks/todo.md` con tareas S/M, dependencias, roles, superficies de prueba y criterios de aceptación.
