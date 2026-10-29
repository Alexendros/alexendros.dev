# Capturas de revisión visual de proyectos

Fecha: 2026-10-29. Build de `main@b8263e1` servido con `serve .vercel/output/static`.

## Método

`scripts/capturas.mjs` captura 5 rutas × 4 anchos (320, 390, 768, 1280) × 2 temas (claro y oscuro) sobre el artefacto de publicación, con `prefers-reduced-motion` y el CMP oculto solo para no tapar el contenido inferior.

- 40 imágenes en total.
- 0 errores de consola y 0 errores de página en las 40.
- 0 desbordes horizontales (`scrollWidth > clientWidth`) en los cuatro anchos.

En el repositorio se conservan cuatro muestras; el resto es reproducible con `node scripts/capturas.mjs --out <dir>`.

## Muestras conservadas

| Archivo                    | Ruta                 | Ancho | Tema   |
| -------------------------- | -------------------- | ----- | ------ |
| `proyectos-1280-light.png` | `/proyectos/`        | 1280  | claro  |
| `proyectos-320-light.png`  | `/proyectos/`        | 320   | claro  |
| `proyectos-390-dark.png`   | `/proyectos/`        | 390   | oscuro |
| `zedazo-390-dark.png`      | `/proyectos/zedazo/` | 390   | oscuro |

## Observado

- Rejilla de tres columnas a 1280 y una a 320/390, sin solapes ni recortes de imagen.
- Tarjetas con tipología visible. La tarjeta no muestra el origen (`Encargo`, `Proyecto propio`); la PR #152 lo añade.
- Encabezado con «Formulario de contacto» en dos líneas y botón de menú sin colisión a 390 px.
- Tema oscuro con contraste legible en títulos, texto secundario y CTA.
- En `/proyectos/` el H1 ocupa cinco líneas a 320 px: es legible y no desborda, pero es largo.

## Pendiente de decisión visual

- H1 «Proyectos profesionales cumplidos con el criterio de Alexendros.dev» (R2-07): corregido en `description` y `og:image:alt`; el H1 requiere decisión de copy.
- M-02 (flecha del CTA de tarjetas), M-07 (orden del hero) y M-08 (nav en dos líneas) siguen abiertos.
