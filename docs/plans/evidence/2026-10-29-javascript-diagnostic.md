# Diagnóstico de JavaScript por recurso

Fecha: 2026-10-29.

## Método y alcance

Se analizan los `network-requests` de los informes LHCI limpios del candidato `702e66ceed63b51eebdbb43927b3bc2bb68ad1e6`, con tres ejecuciones por ruta. La métrica es transferencia de `resource-summary.script.size`, no tamaño de archivo ni código ejecutado.

Los cambios posteriores hasta `1607f0c6e0632b56d77837f2655b7489288b217c` no modifican `src/`, `public/` ni `lighthouserc.json`. Esto acota la comparación de artefacto, pero no sustituye una nueva medición antes del ship.

## Recursos por ruta

Cifras en bytes transferidos. Las rutas no enumeradas comparten el mismo conjunto que `/`.

| Recurso                         |        `/` | `/servicios/` | `/contacto/` | Responsabilidad                                    |
| ------------------------------- | ---------: | ------------: | -----------: | -------------------------------------------------- |
| `client.CLhIxG29.js`            |     66.642 |        66.642 |       66.642 | Runtime cliente de Astro/React cargado globalmente |
| `jsx-runtime.CePeojmM.js`       |          0 |        25.046 |       25.046 | Runtime JSX de islas concretas                     |
| `CookieBanner.DVClWr-z.js`      |     11.229 |        11.229 |       11.229 | Banner y preferencias CMP                          |
| `react.DJY1zw8Z.js`             |      3.420 |         3.420 |        3.420 | Código React adicional                             |
| `Layout…DIECK09z.js`            |      1.585 |         1.585 |        1.585 | Scripts compartidos de layout/tracking             |
| `events.CBotBvuf.js`            |      1.345 |         1.345 |        1.345 | Eventos comerciales                                |
| `consent.D8qFUxxf.js`           |      1.174 |         1.174 |        1.174 | Estado de consentimiento                           |
| `NeedsConfigurator.CXzjXAo3.js` |          0 |         1.616 |            0 | Selector de necesidades                            |
| `ContactForm.0Aos-38J.js`       |          0 |             0 |        8.830 | Formulario de contacto                             |
| **Total**                       | **85.395** |   **112.057** |  **119.271** | Presupuesto: **61.440**                            |

`/proyectos/`, `/proyectos/front-valencia/` y `/metodo/` tienen el mismo desglose y total que `/`. `/servicios/informe-comercial/` también comparte el total de 85.395 bytes.

## Interpretación

1. El problema principal es global: el runtime cliente de Astro/React aporta 66.642 bytes en todas las rutas y por sí solo ya supera el presupuesto de 61.440 bytes.
2. El banner de cookies obliga a cargar ese runtime en todas las páginas. Reducir únicamente el catálogo o imágenes no resolvería el incumplimiento.
3. `/servicios/` añade 25.046 bytes de runtime JSX y 1.616 bytes del selector. `/contacto/` añade los mismos 25.046 bytes y 8.830 bytes del formulario.
4. Los scripts de medición compartida son pequeños frente al runtime. No se justifica eliminar medición autorizada para obtener verde.

## Objetivo de la fase de rendimiento

La primera opción a evaluar es sustituir la isla React del CMP por una integración nativa/Astro de `vanilla-cookieconsent`, conservando interfaz, categorías, callbacks y accesibilidad. Debe medirse si elimina el runtime compartido sin alterar comportamiento.

El selector y el formulario solo deben optimizarse si el resultado global lo exige después de esa intervención. No se propone cambiar de framework, retirar proveedores ni relajar presupuestos.

## Criterios de validación de la corrección

- Mismo comportamiento en los escenarios CMP existentes y en retirada de consentimiento.
- Banner y preferencias operativos con teclado y tecnologías de apoyo.
- Ausencia de cargas opcionales antes de consentimiento.
- E2E completo y axe sin regresiones.
- Nueva medición LHCI sobre build de publicación y SHA explícito.
- Todas las rutas por debajo del presupuesto vigente; avisos LCP documentados por separado.
