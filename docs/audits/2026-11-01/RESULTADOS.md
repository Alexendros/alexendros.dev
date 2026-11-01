# Auditoría 2026-11-01 — Resultados

## Cambios aplicados

- F-01: eliminadas redirecciones heredadas; nav y CTAs apuntan a rutas reales.
- F-02: trailingSlash 'always' en astro.config y vercel.json; todos los enlaces internos actualizados; check-internal-links 0 errors 0 warns.
- F-03: nombres accesibles únicos (sr-only) en Servicios y DetailIsland; CTA cabecera «Contacto».
- F-04: dialog-a11y 10/10 OK (scroll lock, URL sync).
- F-05: formulario: sitio web opcional, maxlength 1500, legend obligatorios.
- F-06/F-09: vocabulario categorías y copy vetado actualizado.
- F-08: theme-color alineado a tokens.
- F-10: pie con correo enlazado (ya existente).
- F-11: /cookies axe scrollable-region-focusable corregido (tabindex/role).
- F-12: OG método renombrado a og/metodo.png, título actualizado.

## Verificación

- pnpm test: 169/169 ✅
- pnpm lint: ✅
- pnpm format:check: ✅
- pnpm lint:css: ✅
- pnpm check:contrast: ✅
- pnpm astro build: ✅
- dialog-a11y.mjs: 10/10 ✅
- ui-audit.mjs: 0 axe, 0 overflow, 0 cls>0.1, 0 dup names ✅
- check-internal-links.mjs: 0 errors, 0 warns ✅

## Descartados

- F-07 franja "Trabajos recientes" en home: no añadida (no hay capturas nuevas; home sin duplicación ya).
