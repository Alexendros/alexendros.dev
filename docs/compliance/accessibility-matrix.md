# Matriz de accesibilidad WCAG 2.2 AA

Fecha: 2026-10-29. Commit: `e9beb82` + cambios de esta PR. Muestra: inicio, servicios y sus cuatro fichas, proyectos y una ficha, metodología, sobre mí, contacto, identidad, privacidad, cookies y accesibilidad.

Métodos: `axe-core` (12 rutas), comprobaciones instrumentadas con Playwright sobre el build de publicación, recorridos de teclado de los E2E existentes y revisión del código.

Estados: **cumple** · **cumple con nota** · **no evaluado** · **no aplica**.

| Criterio                                   | Nivel | Comprobación                                                                 | Método                                    | Resultado       |
| ------------------------------------------ | ----- | ---------------------------------------------------------------------------- | ----------------------------------------- | --------------- |
| 1.1.1 Contenido no textual                 | A     | Imágenes con `alt`; decorativas con `aria-hidden`                            | Instrumentado (`imgSinAlt=0` en 14 rutas) | Cumple          |
| 1.2.x Multimedia pregrabada                | A/AA  | El sitio no publica audio ni vídeo                                           | Revisión de contenido                     | No aplica       |
| 1.3.1 Información y relaciones             | A     | `header`/`main`/`footer` únicos, listas y `dl` semánticas                    | Instrumentado + DOM                       | Cumple          |
| 1.3.2 Secuencia significativa              | A     | Orden del DOM coincide con el visual; sin `order` que lo altere              | Revisión de CSS                           | Cumple          |
| 1.3.4 Orientación                          | AA    | Sin bloqueo de orientación                                                   | Revisión de código                        | Cumple          |
| 1.3.5 Identificar el propósito             | AA    | `autocomplete` en nombre y correo                                            | DOM                                       | Cumple          |
| 1.4.1 Uso del color                        | A     | Errores con texto además de color                                            | E2E de contacto                           | Cumple          |
| 1.4.3 Contraste de texto                   | AA    | 28 pares de tokens en claro y oscuro                                         | `check:contrast`                          | Cumple          |
| 1.4.4 Cambio de tamaño del texto           | AA    | Reflujo a 320 CSS px y zoom 200 %                                            | Instrumentado                             | Cumple          |
| 1.4.10 Reflujo                             | AA    | Sin scroll horizontal a 320 px en 5 rutas densas                             | Instrumentado                             | Cumple          |
| 1.4.11 Contraste de elementos no textuales | AA    | Bordes de control y anillo de foco ≥ 3:1                                     | `check:contrast`                          | Cumple          |
| 1.4.12 Espaciado del texto                 | AA    | Interlineado 1.5, `letter-spacing` 0.12em, `word-spacing` 0.16em sin recorte | Instrumentado                             | Cumple          |
| 1.4.13 Contenido al pasar el cursor        | AA    | Sin tooltips dependientes de hover                                           | Revisión de código                        | No aplica       |
| 2.1.1 Teclado                              | A     | Menú, diálogos, CMP y formulario operables con teclado                       | E2E `cp09`, `skip-link`, `detail-island`  | Cumple          |
| 2.1.2 Sin trampas de teclado               | A     | Escape cierra diálogo, menú y panel de cookies                               | E2E                                       | Cumple          |
| 2.2.2 Pausar, detener, ocultar             | A     | Sin contenido en movimiento automático                                       | Revisión de motion                        | Cumple          |
| 2.3.1 Tres destellos                       | A     | Sin destellos                                                                | Revisión de motion                        | No aplica       |
| 2.4.1 Evitar bloques                       | A     | Enlace de salto al contenido                                                 | E2E `skip-link`                           | Cumple          |
| 2.4.2 Título de página                     | A     | `title` único en 14 rutas                                                    | Instrumentado                             | Cumple          |
| 2.4.3 Orden del foco                       | A     | Orden del DOM; sin `tabindex` positivos                                      | Revisión de código                        | Cumple          |
| 2.4.4 Propósito de los enlaces             | A     | Enlaces con texto propio; se corrigieron etiquetas duplicadas                | Instrumentado                             | Cumple          |
| 2.4.6 Encabezados y etiquetas              | AA    | Un H1 y sin saltos de nivel en 14 rutas                                      | Instrumentado                             | Cumple          |
| 2.4.7 Foco visible                         | AA    | Anillo de 2 px en controles; tarjetas con `focus-within` en el contenedor    | Instrumentado + CSS                       | Cumple con nota |
| 2.4.11 Foco no oscurecido                  | AA    | Sticky CTA y CMP sin tapar el foco del contenido                             | E2E de matriz UI                          | Cumple          |
| 2.5.3 Etiqueta en el nombre                | A     | Etiquetas visibles incluidas en el nombre accesible                          | DOM                                       | Cumple          |
| 2.5.7 Movimientos de arrastre              | AA    | Sin acciones de arrastre                                                     | Revisión de código                        | No aplica       |
| 2.5.8 Tamaño del objetivo                  | AA    | Objetivos ≥ 24 px salvo enlaces en línea de una frase                        | Instrumentado + corrección aplicada       | Cumple con nota |
| 3.1.1 Idioma de la página                  | A     | `lang="es"`                                                                  | Instrumentado                             | Cumple          |
| 3.1.2 Idioma de las partes                 | AA    | Sin cambios de idioma en el contenido                                        | Revisión de contenido                     | Cumple          |
| 3.2.1 Al recibir el foco                   | A     | Sin cambios de contexto al enfocar                                           | E2E                                       | Cumple          |
| 3.2.2 Al introducir datos                  | A     | Sin envíos automáticos por cambio de campo                                   | Revisión de código                        | Cumple          |
| 3.2.3 Navegación coherente                 | AA    | Navegación y pie idénticos en todas las rutas                                | E2E `revision-ruido`                      | Cumple          |
| 3.2.4 Identificación coherente             | AA    | Mismo componente con mismo nombre en todo el sitio                           | Revisión de contenido                     | Cumple          |
| 3.3.1 Identificación de errores            | A     | Errores por campo con `aria-invalid` y mensaje asociado                      | E2E `contact`                             | Cumple          |
| 3.3.2 Etiquetas o instrucciones            | A     | Etiqueta visible en todos los campos                                         | E2E                                       | Cumple          |
| 3.3.3 Sugerencia ante errores              | AA    | Mensaje con causa y alternativa por correo                                   | E2E                                       | Cumple          |
| 3.3.4 Prevención de errores                | AA    | El envío no genera obligaciones; idempotencia y confirmación explícita       | E2E + contrato                            | Cumple          |
| 3.3.7 Entrada redundante                   | A     | Sin reintroducción de datos ya aportados                                     | Revisión de flujo                         | Cumple          |
| 3.3.8 Autenticación accesible              | AA    | No hay autenticación                                                         | Revisión de código                        | No aplica       |
| 4.1.2 Nombre, función, valor               | A     | Controles nativos; `aria-expanded` en el menú; diálogos nativos              | E2E + DOM                                 | Cumple          |
| 4.1.3 Mensajes de estado                   | AA    | Resumen del selector y estado de envío con `aria-live` y `role="status"`     | E2E                                       | Cumple          |

## No evaluado

| Criterio                                       | Motivo                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| 1.4.4 y 1.4.10 en navegador real de escritorio | Solo se comprobó el equivalente con viewport y `deviceScaleFactor` |
| 2.4.7 con lector de pantalla                   | No se ejecutó NVDA ni VoiceOver                                    |
| 1.4.13 y 2.5.7 en dispositivos táctiles reales | Sin dispositivo físico                                             |

## Incidencias conocidas y decisiones

- **Foco en tarjetas de servicio**: el enlace del título no lleva `.focus-ring`; el anillo lo dibuja el contenedor con `focus-within`. Visible, pero fuera del patrón único del sistema. Anotado para la fase de deuda.
- **Enlaces en línea** («política de privacidad», correo de contacto): altura de línea de texto, amparados por la excepción de contenido en línea de 2.5.8.
- **`/accesibilidad/`**: creada en esta PR; antes respondía 404.

Esta matriz no acredita conformidad: no sustituye una auditoría con tecnologías de asistencia ni una evaluación por tercero.
