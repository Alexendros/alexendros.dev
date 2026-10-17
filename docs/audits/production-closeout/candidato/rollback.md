# Rollback tras F-02

F-02 smoke de dominio ejecutado el 2026-10-17 sobre Production `a3fc027` (`dpl_HRyWxfj24Aj9z7xBdRfQxLPMRp1Q`).

## Procedimiento

1. Identificar el deployment de Production anterior estable: tip de producto `53a20b6` → `dpl_EpFrrhV5LVGAJKVKxrb1e6wPtoqF` (o el READY previo en el dashboard `alexendros-dev`).
2. Preferir revert por PR (`git revert -m 1 <merge-sha>`) y merge con merge commit; no force-push a `main`.
3. Si el fallo es solo de runtime Vercel sin cambio de git, rollback de deployment en el proyecto `alexendros-dev`.
4. Causas típicas: contacto no operativo, confirmación falsa de envío, precio/condición erróneos, tracking no esencial sin categoría, navegación inaccesible.

## Estado

Procedimiento activo. No se ha ejecutado rollback en este ciclo.
