# Mantenimiento posterior (CIERRE-29)

## Revisión operativa (quincenal)

| Ámbito              | Responsable      | Cómo                                 |
| ------------------- | ---------------- | ------------------------------------ |
| Disponibilidad apex | Mantenedor       | curl + Vercel production             |
| Contacto / SMTP     | Mantenedor       | Envío controlado a operaciones@      |
| Reserva Cal.com     | Mantenedor       | Evento sesion-tecnica + webhook      |
| Errores runtime     | Mantenedor       | Vercel logs / issues alerta:main     |
| Enlaces             | CI `check:links` | Tras cambios de rutas                |
| Dependencias        | Renovate         | PRs version-updates                  |
| Consentimiento      | Mantenedor       | Matriz en `matriz-consentimiento.md` |

## Revisión comercial (mensual)

Consultas recibidas, adecuación, servicios con dudas, abandonos observables, propuestas y contrataciones. Sin objetivos porcentuales hasta línea base.

## Residuales abiertos

- Importes provisionales (`pricing.ts`).
- Portada comercial compacta (alternativa B) no aprobada.
- Formulario de contacto mínimo con canal (0023; supersede de la UI de 6 pasos de 0014).
- Envío real de contacto en staging/producción: autorizar prueba controlada en cada release.
