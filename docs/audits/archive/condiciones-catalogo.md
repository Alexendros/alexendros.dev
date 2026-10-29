# Condiciones del catálogo — pendientes de aprobación (CIERRE-11 / 12)

Estado a 2026-10-16. Los importes en `src/content/pricing.ts` siguen **provisionales**.

## Pendientes de decisión comercial

| Tema                                                | Estado actual                               | Qué falta aprobar                                            |
| --------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| Importes                                            | Visibles como provisionales en `/servicios` | Fijar o mantener el rótulo «provisional» de forma permanente |
| Garantía vs entregable vs objetivo técnico vs plazo | Mezclados en fichas de `services.ts`        | Glosario único por oferta                                    |
| Auditoría normativa/ciber                           | Oferta publicada                            | Alcance sin presentarla como certificación                   |
| Inicio/suspensión de plazos                         | Copy genérico                               | Criterio contractual (kickoff, materiales del cliente)       |
| Gastos de terceros                                  | Mencionado en módulos                       | Lista explícita de lo no incluido                            |

## Promesas técnicas del portal (CIERRE-12)

Compromiso publicado: «LCP ≤ 2,5 s, axe 0 en rutas acordadas, contraste AA» (portal de inicio).

| Compromiso   | Método propuesto                               | Entorno                              | Notas                                                                      |
| ------------ | ---------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| LCP ≤ 2,5 s  | LHCI / Lighthouse móvil en rutas acordadas     | Preview o producción, red controlada | No certificado hasta medir la entrega concreta del cliente                 |
| axe 0        | `pnpm lint:a11y` / axe-core en rutas acordadas | CI + manual                          | No equivale a conformidad WCAG completa                                    |
| Contraste AA | `pnpm check:contrast` (pares del tema)         | Repo                                 | Temas claro/oscuro del DS; no sustituye contraste de contenido del cliente |

Corrección ofrecida si no se cumple (pendiente de ratificar): 30 días naturales sobre el alcance escrito, según ficha del portal.
