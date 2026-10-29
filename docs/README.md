# Documentación — alexendros.dev

### Propósito de este documento

- **Objetivos:** Índice de docs de producto y de plataforma. Evitar que un agente o humano tome un registro histórico como contrato.
- **Estructura:** Contratos raíz → standards y runbooks → registros tipados → auditorías activas o archivo.
- **Contenido a integrar según contexto:** Enlaza solo lo que existe en este repo. No copies el árbol de webconfig ni de un SaaS.

## Programa vigente

- [plans/PLAN-CIERRE-SHIP.md](plans/PLAN-CIERRE-SHIP.md) — fases, responsables, bloqueos, evidencias y publicación.

## Contratos (raíz)

- [README.md](../README.md) — uso, CI, deploy
- [ARCHITECTURE.md](../ARCHITECTURE.md) — capas y límites
- [AGENTS.md](../AGENTS.md) — contrato operativo para agentes
- [CONTRIBUTING.md](../CONTRIBUTING.md) · [SECURITY.md](../SECURITY.md) · [SUPPORT.md](../SUPPORT.md) · [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

## Standards

### Website

- [standards/website/desarrollo.md](standards/website/desarrollo.md)
- [standards/website/calidad.md](standards/website/calidad.md)
- [standards/website/diseno.md](standards/website/diseno.md)

### Product

- [standards/product/identidad.md](standards/product/identidad.md) — inventario de bloques del sitio (no es contrato de plataforma)

### Protocols

- [standards/protocols/ci-release.md](standards/protocols/ci-release.md)
- [standards/protocols/security-ci.md](standards/protocols/security-ci.md) — división entre `ci.yml` y `security.yml`
- [standards/protocols/env-vars.md](standards/protocols/env-vars.md)
- [standards/protocols/gtm-server-side.md](standards/protocols/gtm-server-side.md)

## Operación y decisiones

- [operations/](operations/) — runbooks vigentes
- [releases/](releases/) — aceptación y rollback de releases
- [decisions/](decisions/) — contexto ADR; la fuente tipada sigue en `audits/decisions.json`

## Registros y auditorías

Colecciones tipadas validadas con `pnpm check:records` contra [audits/record.schema.json](audits/record.schema.json):

- [audits/decisions.json](audits/decisions.json) — decisiones de plataforma (antes ADRs markdown)
- [audits/events.json](audits/events.json) — alertas (roto) y avisos (no-roto), con `active` y orden de escritura
- [audits/active/](audits/active/) — únicamente auditorías abiertas
- [audits/archive/](audits/archive/) — cierres históricos, nunca contratos vigentes

## Cumplimiento y seguridad

- [compliance/](compliance/) — matrices y procedimientos de privacidad y accesibilidad

- [cookies-inventory.json](cookies-inventory.json) — inventario canónico (`pnpm audit:cookies`)
- [threat-model.md](threat-model.md) — modelo de amenazas y residuales aceptados
