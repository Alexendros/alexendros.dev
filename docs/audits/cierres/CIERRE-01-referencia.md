# CIERRE-01 — Versión de referencia

```text
Fecha de comprobación: 2026-10-16T16:22:00Z
Repositorio: Alexendros/alexendrosdev
Rama: main
Commit: cf355e4743d7c22fb160edbf05e071e43d5b90b2
Despliegue: dpl_GMKphxUX58CaWHzHYiutrxXYAgEz (alexendros-dev, production READY)
Dominio principal: https://alexendros.dev
Comportamiento de www: 308 → https://alexendros.dev/
Entorno de pruebas: curl + Vercel MCP get_deployment(alexendros.dev)
Rutas verificadas: / (hero-slot, nav Servicios/Publicaciones, Contactar en header), /contacto (asistente Paso, mailto contratacion@)
Incidencias:
  - Local estaba 8 commits detrás de origin/main; producción = origin/main.
  - No hay discrepancia de catálogo antiguo: la home publicada es hero mínimo (0014).
  - Lead magnet no aparece en HTML de /; BookingOptions no montado.
  - Rotador H1 sin control de pausa y con giro bajo prefers-reduced-motion (regresión frente a 0015 / WCAG 2.2.2).
```
