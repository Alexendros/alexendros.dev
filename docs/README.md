# Documentación — alexendros.dev

### Propósito de este documento

- **Objetivos:** Índice de docs de producto y de plataforma. Evitar que un agente o humano tome un registro histórico como contrato.
- **Estructura:** Contratos raíz → standards → registros en audits → threat model e inventario de cookies.
- **Contenido a integrar según contexto:** Enlaza solo lo que existe en este repo. No copies el árbol de webconfig ni de un SaaS.

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
- [standards/protocols/security-ci.md](standards/protocols/security-ci.md) — patrón de `security.yml` (referencia de flota)
- [standards/protocols/env-vars.md](standards/protocols/env-vars.md)
- [standards/protocols/gtm-server-side.md](standards/protocols/gtm-server-side.md)

## Registros (audits)

Colecciones tipadas validadas con `pnpm check:records` contra [audits/record.schema.json](audits/record.schema.json):

- [audits/decisions.json](audits/decisions.json) — decisiones de plataforma (antes ADRs markdown)
- [audits/events.json](audits/events.json) — alertas (roto) y avisos (no-roto), con `active` y orden de escritura

## Cumplimiento y seguridad

- [cookies-inventory.json](cookies-inventory.json) — inventario canónico (`pnpm audit:cookies`)
- [threat-model.md](threat-model.md) — modelo de amenazas y residuales aceptados
