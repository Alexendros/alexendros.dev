# Baseline y evidencias — 2026-11-02

Verificación local sobre el build estático (`.vercel/output/static`) servido con `pnpm preview`
en `http://127.0.0.1:4321`. Producción no se ha desplegado desde esta rama.

## Comandos reproducibles

```bash
pnpm install --frozen-lockfile
pnpm typecheck && pnpm lint && pnpm test
pnpm lint:css && pnpm format:check
pnpm build
pnpm check:links && pnpm smoke
pnpm test:e2e
pnpm lhci
BASE_URL=http://127.0.0.1:4321 pnpm audit:css
BASE_URL=http://127.0.0.1:4321 node scripts/audit/ui-audit.mjs
BASE_URL=http://127.0.0.1:4321 node scripts/audit/dialog-a11y.mjs
node scripts/audit/check-internal-links.mjs .vercel/output/static
```

## Antes / después

| Métrica                               | Antes (artefacto 2026-11-01) | Después (2026-11-02)                       |
| ------------------------------------- | ---------------------------- | ------------------------------------------ |
| CSS principal gzip                    | 25.811 B                     | 18.279 B                                   |
| CSS de página gzip                    | 5.328 B                      | 5.328 B                                    |
| Total CSS gzip por página             | 31.139 B                     | 23.607 B (23.693 B con `DetailIsland.css`) |
| Tamaños tipográficos distintos (home) | ≥10 clases                   | 7 valores computados                       |
| `transition: all` con duración        | no medido                    | 0                                          |
| Colores fuera de token                | no medido                    | 0 (salvo mezclas alfa legítimas)           |
| Formulario en portada                 | sí                           | no                                         |
| Nota interna en `/experiencia/`       | sí                           | no                                         |
| Glifos Unicode como icono             | sí (`☰ ◐ ✕ → ←`)            | no                                         |
| Referencias en home                   | 4 sin captura                | 2 con captura                              |
| `smallTargets` (24×24)                | no medido                    | 0 en 128 combinaciones                     |
| axe (ui-audit)                        | 0                            | 0                                          |
| CLS máximo                            | 0                            | 0                                          |
| Desbordamiento horizontal             | 0                            | 0                                          |

## Lighthouse (LHCI, móvil, 5 rutas × 3 pasadas)

`lighthouse-summary.json`: Rendimiento 99–100, Accesibilidad 100, Buenas prácticas 100, SEO
100; CLS 0; LCP 1,50–1,80 s. Presupuesto de hoja de estilos: cumplido.

## Accesibilidad y enlaces

- `ui-audit-summary.json`: 128 combinaciones (16 rutas × 4 viewports × 2 temas), 0 violaciones
  axe, 0 CLS, 0 overflow, 0 objetivos pequeños, 0 nombres de enlace duplicados, 0 imágenes rotas
  o sin dimensiones.
- `dialog-a11y.txt`: 10/10 comprobaciones del diálogo de referencias.
- `check-internal-links.txt`: 23 páginas, 574 enlaces, 0 errores, 0 avisos.
- `pnpm test:e2e`: 149/149.

## Decisiones aplicadas

- Portada delgada: hero + compromisos + tres vías + dos referencias + método + CTA; sin formulario
  ni FAQ. FAQ en `/servicios/`; formulario solo en `/contacto/`.
- Compromisos desde `src/content/commitments.ts`; sin estados «Acordado».
- Iconos SVG propios; menú móvil visible por debajo de `md`; selector de tema con meta
  `theme-color` sincronizada y `theme-init.js` sin parpadeo.
- Referencias: URL de Vercel confirmadas por el titular para Front Valencia y Gráficas Nasve.
  No se usa `frontvalencia.com`.
- Ficha de referencia sin duplicados, en tercera persona, con «Ficha técnica» plegada y sin
  herramientas internas.
- CV retirado de `/experiencia/`; nota interna eliminada.
- CSS de daisyUI reducido excluyendo componentes no usados.
- `docs/standards/website/diseno.md` actualizado a los tokens y componentes reales.

## Descartado

- Reescribir layouts o la política de URLs: ya había un único `Layout.astro` y
  `trailingSlash: 'always'`; producción responde 200 con barra final.
- Añadir un `ds-lint.sh` paralelo: se amplían Stylelint, `check:leaks` y `audit:css`.
- Duplicar el selector de tema, el menú móvil o la FAQ nativa: ya existían; solo se corrigieron
  iconos, estilos y pruebas.
- Reintroducir Inter, React o un CMS.
