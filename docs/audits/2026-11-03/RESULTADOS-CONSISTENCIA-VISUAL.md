# Consistencia visual y CSS Modules — resultados

- Fecha: 2026-11-03.
- Rama: `cursor/consistencia-visual-css-modules`.
- Base: `a269fec125cf68f6846728d9854feb26ae6e7f40` (`main`, `v1.37.0`).
- Alcance: working tree local, sin commit ni deployment.
- Spec: `SPEC-CONSISTENCIA-VISUAL.md`. Plan: `tasks/plan.md`.

## Resultado implementado

- Corrección de la colisión entre el color propio y el grosor DaisyUI: `--border` sigue siendo `1px`; el color es `--border-color` y `--color-border` lo referencia.
- Prueba E2E de estilo computado para cards y configurador en `alexlight`/`alexdark`.
- `SectionHeader.astro` comparte eyebrow, H2 y descripción en las cuatro secciones de home, con estilos importados desde `SectionHeader.module.css`.
- Badges de categoría con acento sólido; atributos de home neutros mediante ghost; tipología de referencias conserva outline neutro.
- Configurador separado en base estática, módulos opcionales y resumen. Filas con superficie sunken, labels completos, estado checked y dos columnas desde `lg`.
- Footer con títulos de columna reforzados; duraciones propias mediante `--duration-fast`/`--duration-normal` y `--ease-out`.
- Reduced motion también desactiva el scroll suave.
- Cards conservan elevación, foco, hover y active sin animar sombras.

## Clean Code y arquitectura CSS

- `global.css` conserva tokens y patrones compartidos; se retiraron las reglas específicas migradas.
- `Hero.module.css`, `ContactCta.module.css` y `Header.module.css` encapsulan las reglas introducidas por #187.
- `SectionHeader.module.css` y `NeedsConfigurator.module.css` contienen los nuevos patrones específicos.
- Los componentes importan el objeto `styles`; no se añadieron `@apply`, estilos inline ni dependencias.
- Las pruebas usan IDs y `data-*`, no nombres hash.
- `Button.module.css` implementa `styles.spinner`: antes el comentario apuntaba a una regla global inexistente.
- Se eliminaron los antiguos nombres globales y no quedan referencias a `btn-spinner`, `terminalPrompt`, `hero-surface`, `contact-cta-panel`, `data-commitments`, `card-cover` o `is-loaded` en el alcance.
- `docs/standards/website/diseno.md` documenta la frontera global/módulo, tokens y contratos actuales.

## Contratos

No se modificaron JavaScript, API, schemas, handlers, tracking, CMP, URLs ni serialización. El configurador conserva hooks, live region, orden canónico, selección múltiple y ambos enlaces. No se añadieron categorías al modelo `ProductCard` ni contenido económico.

Los cambios estructurales de encabezados y zonas del configurador son los aprobados en la especificación; no hay cambios funcionales intencionales.

## Verificación

| Comando               | Resultado                                  |
| --------------------- | ------------------------------------------ |
| `pnpm typecheck`      | PASS                                       |
| `pnpm lint`           | PASS                                       |
| `pnpm test`           | PASS — 38 archivos, 189 pruebas            |
| `pnpm lint:css`       | PASS, incluidos los seis módulos CSS       |
| `pnpm format:check`   | PASS                                       |
| `pnpm check:records`  | PASS                                       |
| `pnpm audit:cookies`  | PASS                                       |
| `pnpm check:copy`     | PASS                                       |
| `pnpm check:classes`  | PASS                                       |
| `pnpm check:contrast` | PASS — ambos temas                         |
| `pnpm build`          | PASS                                       |
| `pnpm test:e2e`       | PASS — 167 pruebas                         |
| `pnpm check:links`    | PASS — 65 enlaces                          |
| `pnpm smoke`          | PASS                                       |
| `pnpm audit:css`      | PASS revisado — 14 combinaciones ruta/tema |
| `pnpm lhci`           | PASS — cinco URLs × tres ejecuciones       |

La build conserva los tres hints preexistentes documentados en `RESULTADOS-DAISYUI.md`. No se introdujeron errores ni warnings nuevos.

## CSS y contraste

- La reproducción inicial confirmó que `--color-border` recibía `1px` y el navegador usaba `currentColor`; la prueba final compara el borde real con una sonda de `--border-color` y pasa en ambos temas.
- Badges sólidos usan el par `accent-content/accent`: 5,68:1 en claro y 11,61:1 en oscuro.
- No se adoptó `badge-soft` claro; sus avisos conocidos permanecen documentados y sin consumidor.
- `audit:css`: 0 `transition: all`, 0 textos fuera de token y 0 fondos fuera de token en siete rutas × dos temas.
- CSS global principal: 92.382 bytes sin comprimir (`Layout.B1HeQA2M.css`), frente a 92.342 en la iteración anterior: +40 bytes. Las reglas específicas se distribuyen en módulos por página.

## LHCI móvil final

Tres ejecuciones por URL; se muestra la mediana. A11y, Best Practices y SEO: 100 en todas.

| Ruta                            | Perf |    LCP |   CLS | CSS transferido | Peso total |
| ------------------------------- | ---: | -----: | ----: | --------------: | ---------: |
| `/`                             |   99 | 1,88 s | 0,000 |        24.521 B |  154.713 B |
| `/servicios/informe-comercial/` |  100 | 1,50 s | 0,000 |        24.171 B |   76.416 B |
| `/referencias/front-valencia/`  |   99 | 1,81 s | 0,000 |        24.171 B |  138.259 B |
| `/experiencia/`                 |   99 | 1,80 s | 0,000 |        23.515 B |  115.533 B |
| `/privacidad/`                  |   99 | 1,65 s | 0,000 |        23.515 B |  115.556 B |

Todos los presupuestos se mantienen, incluido CSS ≤25.600 bytes.

Informe home: [Lighthouse final](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793741253284-95687.report.html).

## Revisión visual

Capturas finales con fuentes cargadas, reduced motion, contenido lazy recorrido y CMP rechazado:

- `audit-out/iter2-final-home-light.png`
- `audit-out/iter2-final-home-dark.png`
- `audit-out/iter2-final-servicios-light.png`
- `audit-out/iter2-final-servicios-dark.png`
- `audit-out/iter2-final-servicios-mobile.png`
- `audit-out/iter2-final-ficha-dark.png`

Las seis capturas tienen 0 overflow horizontal y 0 imágenes rotas. La revisión cubre home, catálogo, configurador y ficha de servicio en claro/oscuro y móvil/escritorio.

## Limitaciones

- Validación en Chromium; no se ejecutaron Firefox ni WebKit.
- No se realizó una nueva evaluación manual con lector de pantalla o alto contraste.
- No hay commit, deployment ni evidencia de producción para esta segunda iteración.
- Las capturas de `audit-out/` son artefactos locales ignorados por Git.
- No se cierran bloqueos independientes de `docs/plans/PLAN-CIERRE-SHIP.md`.
