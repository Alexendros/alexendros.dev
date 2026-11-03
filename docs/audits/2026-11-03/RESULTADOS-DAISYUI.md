# Evolución visual DaisyUI — resultados

- Fecha: 2026-11-03.
- Rama: `cursor/evolucion-visual-daisyui`.
- Base: `5ba7885542565ae65ea43cdba5cbedf2da523f23`.
- Alcance verificado: working tree local de esa rama, sin commit ni deployment.
- Spec: `SPEC-DAISYUI.md`. Plan archivado: `PLAN-DAISYUI.md`.

## Resultado implementado

- Tipografía **Source Sans 3 Variable** para lectura, titulares y controles; **JetBrains Mono Variable** para prompt, código y metadatos seleccionados.
- Ambas fuentes autoalojadas con Fontsource, SIL OFL 1.1, solo subconjunto latin. Source Sans conserva el único preload prioritario.
- Tokens propios para elevación, cabecera opaca/glass y gradiente de secciones.
- Cards informativas con elevación estática; card-links con hover/foco y movimiento condicionado por hover y reduced motion.
- Badges de categoría/característica/tipología diferenciados; referencias con zoom de imagen 1.02 solo cuando está permitido.
- Proceso con superficie propia y `step-primary`, sin estados de progreso anunciados.
- Cabecera glass con blur de 12px y fallback opaco; menú móvil con superficie compartida.
- CTA de contacto integrado en un panel con gradiente; texto secundario migrado a `text-muted` en las superficies tocadas.
- Eliminados `card-cover`, `is-loaded`, `data-commitments` y `font-extrabold` del código vigente, además de imports/preload y subconjuntos de fuentes sin uso.
- `docs/standards/website/diseno.md` actualizado; el documento histórico del mock queda identificado como tal.

## Contratos

No se modificaron copy comercial, catálogo, URLs, API, schemas, handlers, JavaScript de navegación, tracking, CMP ni consentimiento. Los cambios de `ContactForm.astro` son exclusivamente clases de color de texto.

La suite E2E comprueba menú, tema, card-links, diálogos, filtros, formulario, idempotencia visible, consentimiento, revocación, no-JS, SEO y recorridos críticos.

## Verificación funcional y estática

| Comando               | Resultado                                           |
| --------------------- | --------------------------------------------------- |
| `pnpm typecheck`      | PASS                                                |
| `pnpm lint`           | PASS                                                |
| `pnpm test`           | PASS — 38 archivos, 189 pruebas                     |
| `pnpm lint:css`       | PASS                                                |
| `pnpm format:check`   | PASS                                                |
| `pnpm check:records`  | PASS                                                |
| `pnpm audit:cookies`  | PASS — 10 cookies declaradas                        |
| `pnpm check:copy`     | PASS                                                |
| `pnpm check:classes`  | PASS                                                |
| `pnpm check:contrast` | PASS — claro y oscuro, incluidos gradientes y steps |
| `pnpm build`          | PASS                                                |
| `pnpm test:e2e`       | PASS — 162 pruebas                                  |
| `pnpm check:links`    | PASS — 62 enlaces                                   |
| `pnpm smoke`          | PASS — 23 HTML, cinco rutas HTTP 200                |
| `pnpm audit:css`      | PASS revisado — 14 combinaciones ruta/tema          |
| `pnpm lhci`           | PASS — cinco URLs × tres ejecuciones                |

La build mantiene tres hints preexistentes fuera del alcance: JSON-LD inline en `Layout.astro`, una constante no leída en `src/pages/r/[code].astro` y estilo de import del CMP. No son errores ni se han introducido en este trabajo.

## Contraste y CSS en ejecución

- El parser de contraste ahora reconoce y compara `alexdark`; antes omitía los tokens semánticos oscuros.
- Nuevos pares de texto secundario/brand sobre `bg-subtle` y contraste no textual de steps sobre bases.
- `steps primary/base`: 10,64–11,43:1 en claro y 8,23–9,01:1 en oscuro.
- `focus-ring`: 3,13:1 en claro y 3,17:1 en oscuro.
- Se conservan dos avisos conocidos de `badge-soft` claro; esa variante no se usa.
- `audit:css`: 0 `transition: all`, 0 textos fuera de token y 0 fondos fuera de token en siete rutas × dos temas.
- El inventario acepta correctamente tokens `color-mix()`; antes el glass producía un falso positivo.

## Fuentes y presupuesto

La primera medición final falló el presupuesto de CSS: **26.040 bytes** transferidos frente a un máximo de 25.600. No se amplió el umbral.

Se sustituyeron los índices Fontsource con todos los subconjuntos por dos `@font-face` latin explícitos. Resultado:

- CSS principal sin comprimir: **92.342 bytes** (`Layout.DwJEp40h.css`), frente a 91.772 en baseline: +570 bytes.
- CSS transferido en Lighthouse: **23.467 bytes**, 2.573 bytes menos que la medición fallida y 2.133 por debajo del presupuesto.
- Source Sans latin: **28.872 bytes**.
- JetBrains Mono latin: **40.404 bytes**.
- No se emiten subconjuntos cyrillic, greek, vietnamese o latin-ext de las nuevas reglas.

## LHCI móvil final

Tres ejecuciones por URL; se muestra la mediana. A11y, Best Practices y SEO: 100 en todas.

| Ruta                            | Perf |    LCP |   CLS | CSS transferido | Peso total |
| ------------------------------- | ---: | -----: | ----: | --------------: | ---------: |
| `/`                             |   99 | 1,81 s | 0,000 |        23.467 B |  151.440 B |
| `/servicios/informe-comercial/` |  100 | 1,51 s | 0,000 |        23.467 B |   73.524 B |
| `/referencias/front-valencia/`  |   99 | 1,81 s | 0,000 |        23.467 B |  135.377 B |
| `/experiencia/`                 |   99 | 1,81 s | 0,000 |        23.467 B |  113.316 B |
| `/privacidad/`                  |   99 | 1,66 s | 0,000 |        23.467 B |  113.342 B |

Informe home: [Lighthouse final](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793736922496-87940.report.html).

## Revisión visual

Capturas estables con reduced motion, fuentes cargadas, contenido lazy recorrido y CMP rechazado:

- `audit-out/final-home-light.png`
- `audit-out/final-home-dark.png`
- `audit-out/final-home-mobile.png`
- `audit-out/final-servicios-light.png`
- `audit-out/final-referencias-dark.png`
- `audit-out/final-contacto-mobile.png`
- `audit-out/final-metodo-dark.png`

Las siete capturas tienen 0 overflow horizontal y 0 imágenes rotas. La revisión cubre home, servicios, referencias, contacto y método; las páginas legales quedan cubiertas por E2E/LHCI y herencia de tokens.

## Limitaciones

- Validación de navegador en Chromium; no se ejecutaron Firefox ni WebKit.
- No se realizó una nueva evaluación manual con lector de pantalla o alto contraste.
- No hay deployment de producción ni evidencia sobre un commit publicado.
- Las capturas de `audit-out/` son artefactos locales ignorados por Git.
- Este resultado no cierra los bloqueos independientes de `docs/plans/PLAN-CIERRE-SHIP.md`.
