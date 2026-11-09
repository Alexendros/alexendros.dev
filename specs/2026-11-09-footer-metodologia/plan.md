# Plan — Footer y `/metodologia/`

**Basado en:** `spec.md` aprobada el 2026-11-09.

## Secuencia

1. **Reproducir y corregir el chrome del footer.** Añadir geometría E2E al contrato de `chrome.spec.ts`, confirmar el fallo y separar superficie exterior/contenido interior.
2. **Migrar la canónica.** Actualizar primero las expectativas unitarias/E2E; después renombrar página y módulo, invertir redirects y actualizar todos los consumidores activos.
3. **Corregir el ritmo visual.** Añadir comprobaciones de distancias y centrado; sustituir márgenes repetidos por un único gap de secciones y normalizar grids/cierre.
4. **Cerrar activos y gobernanza.** Regenerar OG, registrar la decisión que sustituye la canónica anterior y actualizar documentación viva.
5. **Verificar.** Gates estáticos, unitarios, build, E2E, smoke e inspección visual en ambos temas y viewports.

## Dependencias y riesgos

- El trabajo de ritmo depende del renombrado de archivos de la ruta.
- Footer y migración de ruta son independientes hasta las suites compartidas.
- Vercel normaliza la barra final antes de sus redirects: las pruebas conservan esa excepción conocida y descartan bucles/cadenas declaradas.
- DaisyUI tiene reglas no encapsuladas: se comprobará el CSS computado del footer sin recurrir a `!important`.
- Los redirects de producción solo pueden verificarse como aplicados tras un despliegue; antes se valida el mapa y el destino local.

## Checkpoints

- **CP1:** footer verde en `chrome.spec.ts`.
- **CP2:** redirects, navegación, sitemap y canonical verdes; build con `/metodologia/`.
- **CP3:** ritmo y centrado verdes, sin overflow ni violaciones axe.
- **CP4:** todos los comandos de cierre y revisión visual completados.
