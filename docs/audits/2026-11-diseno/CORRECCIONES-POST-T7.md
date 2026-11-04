# Correcciones post-T7 (cierre 04/11)

- OT: `alexendrosdev-diseno-v2`, correcciones tras T7.5/T7.6.
- Rama: `fix/diseno-post-t7`, desde `origin/main` = `ccb9d240` (T7.5 fusionada).
- Fecha: 4 de noviembre de 2026, Europe/Madrid.
- Alcance: rejilla del hero, presupuesto CSS, redirecciones 301 y objetivos táctiles de 44 px. Sin cambios en CSP ni en `/design-system/`.

## 1. Rejilla del hero (solo portada)

`src/components/sections/Hero.module.css`:

- Dos capas: celda fina de **22 px** y mayor de **120 px** (la histórica de `1991232`), sobre fondo plano `--bg` (el hero deja de usar `--gradient-section`; ContactCta la conserva).
- Líneas con `--border-color` al 30 % (fina) y 40 % (mayor): el trazo cambia con el tema del sitio por tokens (claro, oscuro y sistema). **No hay `@media (prefers-color-scheme)` en el módulo.**
- `mask-image` de 0 → 12 % → 88 % → 100 %: la rejilla se desvanece arriba y abajo y no acaba en línea dura.
- Se retira con `prefers-contrast: more` y `forced-colors: active`.

Contraste del texto del hero sobre la línea mayor (`scripts/contrast-lib.mjs`):

| Tema   | Titular (`--fg`) | Subtítulo (`--fg-muted`) | Mínimo AA |
| ------ | ---------------: | -----------------------: | --------: |
| Claro  |        13,69 : 1 |                 4,53 : 1 |   4,5 : 1 |
| Oscuro |         9,27 : 1 |                 7,95 : 1 |   4,5 : 1 |

El alfa mayor queda limitado por el subtítulo: con la rejilla anterior (blueprint-mid al 10 %) el subtítulo bajaba a 4,14 : 1 y no cumplía AA en claro.

## 2. Bytes (control local `scripts/check-css-margin.mjs`)

Medición LHCI móvil (3 pasadas por URL, `resource-summary` de hojas de estilo):

| Página                          |  Antes | Después | Límite | Margen |
| ------------------------------- | -----: | ------: | -----: | -----: |
| `/`                             | 25.087 |  22.449 | 25.100 | +2.651 |
| `/contacto/`                    | 24.355 |  21.679 | 25.100 | +3.421 |
| `/servicios/software-a-medida/` | 25.672 |  22.996 | 25.100 | +2.104 |

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

Por tanto, la dirección **con** barra sale con un solo 301 tras el despliegue; la dirección **sin** barra recibe primero el 308 de normalización de la plataforma y después el 301 (dos saltos, con paso por la versión con barra). No hay regla de `vercel.json` que se evalúe antes de esa normalización. Alternativas: (a) aceptar dos saltos en la variante sin barra (los enlaces canónicos del sitio siempre llevan barra), o (b) cambiar `trailingSlash` a nivel global, que altera todas las URL canónicas y queda fuera de esta OT.

Cobertura: `tests/e2e/retirada-fichas.spec.ts` con una prueba por dirección (6) en `e2e-critical`, más el mapa completo; `seo-edge-prod.spec.ts` acepta `statusCode: 301` y verifica el primer salto contra el apex cuando producción ya sirve la regla.

## 4. Objetivos táctiles de 44 px

| Elemento                                          | Antes | Después | Módulo                   |
| ------------------------------------------------- | ----: | ------: | ------------------------ |
| «Ver el catálogo de servicios»                    | 40 px |   44 px | `Servicios.module.css`   |
| «Ver todas las referencias»                       | 40 px |   44 px | `Referencias.module.css` |
| «Ver el método completo»                          | 40 px |   44 px | `Metodo.module.css`      |
| Enlaces Front Valencia y Gráficas Nasve (portada) | 28 px |   44 px | `Referencias.module.css` |

`tests/e2e/objetivos-tactiles.spec.ts` amplía T7.6 con los cinco enlaces.

## 5. Checks ejecutados

| Control                                                              | Resultado                                                            |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm typecheck`                                                     | OK                                                                   |
| `pnpm lint` / `pnpm lint:css` / `pnpm format:check`                  | OK                                                                   |
| `pnpm test`                                                          | 198/198                                                              |
| `pnpm build` (`astro check` incluido)                                | OK                                                                   |
| `e2e-critical` (22 specs del job)                                    | 173/173                                                              |
| `tests/e2e/a11y.spec.ts` (axe, 20 rutas × 2 temas)                   | 40/40, 0 violaciones                                                 |
| `pnpm check:contrast`                                                | OK (28 pares; `badge-soft` sigue bajo AA, aviso ya existente)        |
| `pnpm check:copy`, `check:classes`, `check:records`, `audit:cookies` | OK                                                                   |
| `node scripts/check-css-margin.mjs`                                  | Las tres rutas dentro de 25.100 B                                    |
| `tests/e2e/visual-system.spec.ts`                                    | 13/17; fallos de cabecera, configurador y borde ya presentes en main |

## 6. Capturas

`audit-out/cierre-04-11/` (artefacto local, no versionado): hero en claro y oscuro a 390 y 1280 px (`hero-alex{light,dark}-{mobile,desktop}.png`) y las de antes en `antes/`.

`/design-system/` y la CSP no se han tocado: quedan para Ingeniero.
