# Correcciones post-T7 (cierre 04/11)

- OT: `alexendrosdev-diseno-v2`, correcciones tras T7.5/T7.6.
- Rama: `fix/diseno-post-t7`, desde `origin/main` = `ccb9d240` (T7.5 fusionada).
- Fecha: 4 de noviembre de 2026, Europe/Madrid.
- Alcance: rejilla del plano en el fondo del cuerpo, presupuesto CSS (20 rutas),
  redirecciones 301 y objetivos táctiles de 44 px. Sin cambios en CSP ni en
  `/design-system/`.

## 1. Rejilla del plano en el fondo del cuerpo

`src/styles/global.css` (una sola regla, `@layer base`) y hero transparente:

- `body::before` con `position: fixed; inset: 0; z-index: -1; pointer-events: none` y las dos capas históricas de `1991232`: celda fina de **22 px** y mayor de **120 px**. Sin `mask` (la rejilla es el fondo de toda la página); tampoco viñeteado.
- Líneas de `--border-color` al 30 % (fina) y 40 % (mayor), declaradas como `--grid-line` / `--grid-major` en `:root`. El trazo cambia con el tema del sitio por tokens (claro, oscuro y sistema). **No hay `@media (prefers-color-scheme)` en el módulo ni en la regla.**
- Se retira con `prefers-contrast: more`, `forced-colors: active` y al imprimir.
- Para que la rejilla no quede tapada, `body` deja de llevar `bg-base-200`: el color de página lo pinta `:root` (daisyUI, `base-100` = `base-200`, mismo valor en ambos temas). `Header` (surface y glass), `surface-raised`/cards, `ContactCta` (`--gradient-section`), `Footer` (`bg-base-100`) y el prompt del hero conservan su superficie.
- `Hero.module.css` pierde fondo y rejilla: el hero queda transparente sobre el fondo del cuerpo.

### Contraste del texto que queda sobre la rejilla

Peor caso, línea mayor al 40 % (`scripts/contrast-lib.mjs` y barrido de las 20 rutas en 1280 px, claro y oscuro):

| Texto                    | Claro sobre línea | Oscuro sobre línea |
| ------------------------ | ----------------: | -----------------: |
| `--fg`                   |         13,69 : 1 |           8,23 : 1 |
| `--fg-muted`             |          4,53 : 1 |           7,05 : 1 |
| `--link`                 |          7,31 : 1 |           4,66 : 1 |
| `--brand` (text-primary) |         12,08 : 1 |           3,92 : 1 |
| `--danger`               |          4,88 : 1 |           4,72 : 1 |

- **Claro:** todo el texto que queda sobre la rejilla cumple AA (mínimo 4,53 : 1, `--fg-muted`).
- **Oscuro:** con la decisión del 4 de noviembre, `--link` y `--danger` suben de luminosidad solo en tema oscuro (`--ds-atlaps-link-dark` a `oklch(78% 0.1157 249.29)` y `--ds-atlaps-danger-dark` a `oklch(84% 0.155 17.61)`, mismo tono): 7,28 : 1 y 7,37 : 1 sobre fondo plano, 4,66 : 1 y 4,72 : 1 sobre la línea mayor. Las líneas y el tema claro no cambian. `--fg` (8,23) y `--fg-muted` (7,05) ya cumplían.
- **Pendiente (fuera de la decisión):** el ámbar `text-primary` de «respuesta a necesidades reales» (`/servicios/`) sigue en 3,92 : 1 sobre la línea (6,12 : 1 plano). Para AA sobre la rejilla, `--ds-atlaps-amber-glow` tendría que subir a L 79 % (`oklch(79% 0.1386 63.1)`: 7,26 : 1 plano y 4,65 : 1 sobre línea), lo que cambia el acento/CTA del tema oscuro; sin autorización no se toca.
- Los dos pares nuevos (`link/grid-major` y `danger/grid-major`) están en `scripts/check-contrast.mjs` (30 pares por tema) y la referencia Atlaps de `link-dark`/`danger-dark` sube a 7.

## 2. Bytes (control local `scripts/check-css-margin.mjs`)

Medición LHCI móvil (`resource-summary` de hojas de estilo) con las 20 rutas del
build; todas dentro de 25.100 B:

| Ruta                                                                              |  Bytes | Margen |
| --------------------------------------------------------------------------------- | -----: | -----: |
| `/servicios/software-a-medida/`                                                   | 23.215 | +1.885 |
| `/`                                                                               | 22.428 | +2.672 |
| `/servicios/`, fichas de referencia, `/metodo/`, `/sobre-mi/`, artículos, `/404/` | 22.150 | +2.950 |
| `/contacto/`                                                                      | 21.898 | +3.202 |
| `/referencias/`                                                                   | 21.851 | +3.249 |
| `/experiencia/`, legales, `/accesibilidad/`, `/design-system/`                    | 21.494 | +3.606 |

Antes del cambio, con el control de 3 rutas: portada 25.087 → 22.449; contacto
24.355 → 21.679; software-a-medida 25.672 → 22.996. El traslado de la rejilla al
`body` deja la portada en 22.428 B y sube software-a-medida a 23.215 B (+219 por
la regla global), dentro del límite.

Recorte de reglas sin uso (con evidencia):

- `src/styles/global.css`: Tailwind pasa a `source(none)` + `@source "../../src"`. Escaneaba `docs/design/mock-v4-singlepage.html` y los informes de auditoría, de donde salían utilidades que no aplica ninguna página (81 clases del mock no existen en `src/`, p. ej. `from-primary`, `to-secondary`, `bg-linear-to-br`, `backdrop-blur`, `text-5xl`). Ninguna página ni script de `src/` deja de estar escaneado.
- Bundle global: 95.136 → 76.267 B crudos; 16.341 → 13.835 B gzip.
- `KF-V10-SAM` retirado: `software-a-medida` entra en el control común de 25.100 B. No se han relajado umbrales.

## 3. Redirecciones de las fichas retiradas

`vercel.json`: las seis direcciones (`/servicios/{informe-comercial,cumplimiento-normativo,ciberseguridad}` con y sin barra) pasan de `permanent: true` (308) a `statusCode: 301` con destino único `/servicios/`. El destino no es source de otra regla: en la configuración no hay cadena.

**Bloqueo de plataforma (requiere decisión):** con `trailingSlash: true` Vercel normaliza la barra final **antes** de evaluar `redirects`, también para rutas de función. Comprobado en producción:

```
GET https://alexendros.dev/servicios/informe-comercial   → 308 Location: /servicios/informe-comercial/
GET https://alexendros.dev/servicios/informe-comercial/  → 308 Location: /servicios/
GET https://alexendros.dev/metodologia                   → 308 Location: /metodologia/   (hay regla 308 /metodologia → /metodo)
GET https://alexendros.dev/r/abc                         → 308 Location: /r/abc/          (ruta de función)
```

Por tanto, la dirección **con** barra sale con un solo 301 tras el despliegue; la dirección **sin** barra recibe primero el 308 de normalización de la plataforma y después el 301 (dos saltos, con paso por la versión con barra). No hay regla de `vercel.json` que se evalúe antes de esa normalización. **Decisión registrada (4 nov 2026, opción a):** se acepta la cadena de plataforma en la variante sin barra —308 a la versión con barra y 301 final a `/servicios/`— porque los enlaces canónicos del sitio, el sitemap y el JSON-LD siempre llevan barra final. No se cambia `trailingSlash` a nivel global: alteraría todas las URL canónicas y queda fuera de esta OT. El hero claro se queda en pergamino.

Cobertura: `tests/e2e/retirada-fichas.spec.ts` con una prueba por dirección (6) en `e2e-critical`, más el mapa completo. `tests/e2e/seo-edge-prod.spec.ts` acepta `statusCode: 301`, resuelve el 308 de normalización de la variante sin barra y exige el 301 final a `/servicios/`; incluye una prueba propia para las seis direcciones retiradas que anota `pendiente-despliegue` hasta que producción sirve la regla.

## 4. Objetivos táctiles de 44 px

| Elemento                                          | Antes | Después | Módulo                   |
| ------------------------------------------------- | ----: | ------: | ------------------------ |
| «Ver el catálogo de servicios»                    | 40 px |   44 px | `Servicios.module.css`   |
| «Ver todas las referencias»                       | 40 px |   44 px | `Referencias.module.css` |
| «Ver el método completo»                          | 40 px |   44 px | `Metodo.module.css`      |
| Enlaces Front Valencia y Gráficas Nasve (portada) | 28 px |   44 px | `Referencias.module.css` |

`tests/e2e/objetivos-tactiles.spec.ts` amplía T7.6 con los cinco enlaces.

## 5. Checks ejecutados

| Control                                                              | Resultado                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm typecheck`                                                     | OK                                                                                          |
| `pnpm lint` / `pnpm lint:css` / `pnpm format:check`                  | OK                                                                                          |
| `pnpm test`                                                          | 198/198                                                                                     |
| `pnpm build` (`astro check` incluido)                                | OK                                                                                          |
| `e2e-critical` (22 specs del job)                                    | 175/175                                                                                     |
| `tests/e2e/a11y.spec.ts` (axe, 20 rutas × 2 temas)                   | 40/40, 0 violaciones                                                                        |
| `pnpm check:contrast`                                                | OK (30 pares por tema, con los dos de la rejilla; `badge-soft` bajo AA, aviso ya existente) |
| `pnpm check:copy`, `check:classes`, `check:records`, `audit:cookies` | OK                                                                                          |
| `node scripts/check-css-margin.mjs`                                  | 20 rutas dentro de 25.100 B (máximo 23.215)                                                 |
| `tests/e2e/visual-system.spec.ts`                                    | 33/37; los 4 fallos (cabecera glass, configurador, borde claro/oscuro) ya estaban en `main` |
| `seo-edge-prod` (301 + 308 de plataforma)                            | Las 6 direcciones aceptadas; anota `pendiente-despliegue` hasta el deploy                   |

## 6. Capturas

`audit-out/cierre-04-11/` (artefacto local, no versionado):

- `rejilla-global/`: portada, `/servicios/` y `/servicios/software-a-medida/` × claro/oscuro × 390/1280, más versión de página completa a 1280.
- `hero-alex{light,dark}-{mobile,desktop}.png`: estado anterior (rejilla solo en el hero) y `antes/`.

`/design-system/` y la CSP no se han tocado: quedan para Ingeniero.
