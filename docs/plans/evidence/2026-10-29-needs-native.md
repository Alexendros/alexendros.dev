# Selector nativo: resultado y comparación

Candidato: `98601754d867e2613b6ba37a8dbbe9ec4429e841` (`perf/needs-native`).

## Alcance y regresión

El selector pasa de isla React a `NeedsConfigurator.astro` con un listener nativo. Conserva IDs, títulos, alcance, dependencias, orden canónico, resumen `aria-live` y query `modulos` hacia contacto. Sin JavaScript, la base, enlaces y contenido siguen disponibles.

- Selector y reflow: 5 pruebas específicas superadas.
- E2E completo: **136/136**.
- Axe: **12 rutas sin violaciones automatizadas**.
- Vitest: **215 pruebas superadas**.

## Rendimiento

Antes: `a57378b` con CMP nativo y selector React, `/servicios/` transfería 110.964 bytes. Después: `9860175`, **40.123 bytes**. Presupuesto: 61.440 bytes, cumplido.

Desglose candidato:

- `portalModules`: 24.712 bytes, incluida validación de contenido.
- Layout nativo: 12.244 bytes.
- Eventos: 2.010 bytes.
- Script del selector: 1.157 bytes.
- Ya no se descargan `client`, `jsx-runtime` ni `react` para esta ruta.

[Informe LHCI de `/servicios/`](https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1793301156564-56962.report.html), mediana de tres ejecuciones sobre build de publicación.

`/contacto/` sigue transfiriendo 117.842 bytes y continúa abierto por su isla React. EST-04 no se cierra hasta resolver y medir ese coste específico.
