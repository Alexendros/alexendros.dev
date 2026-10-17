# Rollback del candidato (sin promote)

Este ciclo **no publica** a producción. Procedimiento previsto cuando exista F-02:

1. Identificar el deployment Vercel de Production anterior al promote y el SHA de `main` previo.
2. Preferir revert por PR (`git revert -m 1 <merge-sha>`) y merge con merge commit; no force-push a `main`.
3. Si el fallo es solo de runtime Vercel sin cambio de git, usar rollback de deployment en el dashboard del proyecto `alexendros-dev`.
4. Causas típicas de rollback: contacto no operativo, confirmación falsa de envío, precio/condición erróneos, tracking no esencial sin categoría, navegación inaccesible.

Hasta autorización de F-02, este archivo es solo procedimiento documentado.
