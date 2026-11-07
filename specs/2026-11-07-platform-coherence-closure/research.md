# Research — Platform coherence closure

**Fecha de consulta de fuentes:** 2026-11-07  
**Repo de referencia:** Alexendros/alexendros.dev @ 7541a20952623165449c46b959935997c7fbc796

## 1. Vitrina / documentación viva de design system

### Patrones observados

- La documentación que se desvía del código es peor que la ausencia de documentación: engaña activamente (Storybook blog, 2026).
- El enfoque más fiable es generar o mantener la documentación a partir de los componentes reales (live rendered), no de capturas estáticas.
- Hosting habituales:
  - Code-adjacent (Storybook / MDX en el mismo repo).
  - Sitio estático custom (Astro, Docusaurus, Next) cuando se quiere control total y audiencia mixta.
  - Plataformas dedicadas (Zeroheight, Supernova) cuando hay muchos contribuidores y sincronización Figma.
- Para equipos pequeños o engineering-led, un sitio estático ligero o una página dentro del propio producto (con `noindex` si es interna) suele ser suficiente y más barato de mantener.
- Gobernanza clave: la documentación debe viajar en el mismo PR que el cambio de componente; de lo contrario se degrada.

### Fallos habituales

- Declarar un dominio o ruta de design system y dejarlo 404 (exactamente el caso actual de `designsystem.alexendros.dev`).
- Tratar la documentación como proyecto de una sola vez.
- Mezclar principios de diseño con props de implementación sin separación clara de audiencias.

### Fuentes

1. _How to document your design system: best practices & tools_ — Storybook Blog. https://storybook.js.org/blog/how-to-document-your-design-system-best-practices-tools/ (consultado 2026-11-07).
2. _Design System Best Practices from 10+ Real Builds_ — SeaLab. https://sealab.design/blog/design-system-best-practices/ (consultado 2026-11-07).
3. _Documenting Your Design System: Best Practices_ — Magic Patterns. https://www.magicpatterns.com/blog/design-system-documentation (consultado 2026-11-07).
4. _Your Guide to Design System Documentation in 2026_ — DOM Studio. https://getdom.studio/blog/design-system-documentation (consultado 2026-11-07).

## 2. Consistencia de versión de Node (README / engines / .nvmrc)

### Patrones observados

- La fuente de verdad práctica suele ser `.nvmrc` (o `.node-version`) + `engines.node` en `package.json`.
- README debe reflejar la misma versión o rango; de lo contrario genera fricción y errores de “funciona en mi máquina”.
- Herramientas como `nodrift` existen precisamente para detectar desalineaciones entre `.nvmrc`, `engines`, Dockerfiles, CI y otros.
- CI debe leer `node-version-file: '.nvmrc'` (práctica ya presente en el repo) para que el drift documental no afecte al build.

### Fallos habituales

- Actualizar `.nvmrc` / engines y olvidar el README (caso actual: README dice 22, resto 24).
- Usar rangos amplios en `engines` sin documentar el pin exacto que se usa en CI y local.

### Fuentes

1. _node-drift_ — npm package. https://www.npmjs.com/package/node-drift (consultado 2026-11-07).
2. _.nvmrc Node Version Pinning: Pin Node Per Project (2026)_ — TechEarl. https://techearl.com/node-version-pinning-nvmrc (consultado 2026-11-07).
3. _REQUIRE_NODE_VERSION_FILE_ — Vercel Conformance. https://vercel.com/docs/conformance/rules/REQUIRE_NODE_VERSION_FILE (consultado 2026-11-07).

## 3. Uso de componentes de design system frente a clases utilitarias / daisyUI

### Patrones observados

- daisyUI se presenta explícitamente como capa de componentes sobre Tailwind: `btn`, `btn-primary`, etc., más utilidades para personalización. No es “utility-only”.
- Cuando el propio design system define un componente (`Button.astro`) con API (variant, size, loading, disabled, href), el uso directo de clases `btn` en lugares de alto tráfico (Hero) crea dos fuentes de verdad visual y de comportamiento.
- La práctica recomendada en sistemas maduros es: componentes del DS para los puntos de contacto principales; utilidades o clases de librería solo donde el componente no aporta valor o está explícitamente exceptuado.
- La excepción debe documentarse en el contrato del design system para que no se reintroduzca por inercia.

### Fallos habituales

- Mezclar libremente `btn btn-primary` y `<Button variant="primary">` sin regla de cuándo usar cada uno.
- Dejar que el Hero (o cualquier superficie de conversión) escape del componente canónico.

### Fuentes

1. _What is daisyUI?_ — daisyUI Blog. https://daisyui.com/blog/what-is-daisyui/ (consultado 2026-11-07).
2. _Not going full circle with class names_ — daisyUI Blog. https://daisyui.com/blog/full-circle/ (consultado 2026-11-07).
3. Discusión saadeghi/daisyui #1782. https://github.com/saadeghi/daisyui/discussions/1782 (consultado 2026-11-07).

## 4. Tipografía documentada vs tipografía empaquetada

### Patrones observados

- ARCHITECTURE.md y diseno.md deben nombrar exactamente las familias que aparecen en `package.json` y en `@font-face` / `@fontsource`.
- El drift “Inter → Source Sans 3” es típico cuando se cambia de fuente por legibilidad o licencia y no se actualiza el documento de arquitectura.

### Criterio de elección para este SDD

Dado el brief (solo las 4 major, recuperar la vitrina externa, calidad del contrato sin límite de PRs, checklist humano + CI):

- La vitrina `designsystem.alexendros.dev` debe existir y responder 200; la forma más coherente con el stack actual (Astro + tokens propios) es un deploy estático ligero del mismo design system, no una herramienta externa pesada.
- Button en Hero: preferir el componente del DS; excepción solo si se documenta y se justifica por peso de JS o por decisión de diseño explícita.
- Node y tipografía: corrección documental pura; el pin real ya está en `.nvmrc` / engines / fuentes empaquetadas.

No se recomienda cambio de stack. Todas las fuentes anteriores son compatibles con el enfoque de mantenimiento del contrato existente.
