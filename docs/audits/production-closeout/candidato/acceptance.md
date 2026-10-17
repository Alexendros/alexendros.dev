# Aceptación del candidato — cierre de producción (sin promote)

Fecha UTC de este informe: 2026-10-17T01:15:00Z  
Alcance: fases A–E + F-01 del plan de cierre. **F-02/F-03 (publicación y observación en producción) fuera de alcance.**

## Línea base

| Referencia                   | SHA / nota                                                       |
| ---------------------------- | ---------------------------------------------------------------- |
| Plan baseline                | `91ae5fe` (merge #107)                                           |
| Candidato (main al redactar) | `0e2b2c0` (merge #113 PR-E)                                      |
| PR-D pendiente al redactar   | #114 (`cursor/cierre-pr-d-contexto`) — actualizar SHA tras merge |

## Paquetes integrados

| Paquete                   | PR      | Estado            |
| ------------------------- | ------- | ----------------- |
| PR-A disposición #104     | #109    | MERGED            |
| PR-B idempotencia y foco  | #110    | MERGED            |
| PR-C contrato y fichas    | #108    | MERGED            |
| PR-D configurador/CRM     | #114    | OPEN (auto-merge) |
| PR-E consentimiento/rutas | #113    | MERGED            |
| PR-F CI candidato         | este PR | candidato         |

## Decisiones de ciclo

- **D-01**: excepción — sin ficha `/servicios/portal-inicio` (decisión 0017).
- **D-02**: importes provisionales explícitos; cifras sin cambio.
- **D-03**: sin copy comercial nuevo; COM-03 `BLOCKED`.
- **D-04**: Notion opcional / fallo observable; sin promesa de CRM.
- **D-05**: sin retirada masiva de embudos; Cal.com conservado.
- **D-06**: contrato 200/202/409/503 en contacto.

## Gates de este PR-F (resultado obtenido)

Registrar tras CI del PR:

| Gate                                | Resultado obtenido                           | Commit | Entorno               |
| ----------------------------------- | -------------------------------------------- | ------ | --------------------- |
| quality (+ `check:contrast`)        | PENDIENTE                                    |        | CI                    |
| test / build / smoke / e2e-critical | PENDIENTE                                    |        | CI                    |
| e2e completo + LHCI (label `e2e`)   | PENDIENTE — activar label en este PR         |        | CI                    |
| OPS-02 buzón real                   | BLOCKED                                      | —      | requiere autorización |
| REL-02 / REL-03 producción          | fuera de alcance                             | —      | —                     |
| SEC-01 CSP Preview                  | BLOCKED si no hay URL autorizada de este SHA | —      | —                     |
| COM-03 firma mantenedor             | BLOCKED                                      | —      | —                     |

## Rollback (descriptivo)

- Mecanismo: revertir el merge commit del PR en `main` vía PR de revert (ruleset PR-only); o redeploy del deployment Vercel anterior al promote.
- **No se ejecuta promote en este ciclo**; el rollback de producción no aplica hasta F-02.
- Responsable de rollback tras F-02: mantenedor + agente de release.

## Excepciones explícitas

- #104 permanece abierto; no fusionar en bloque.
- Suite completa + LHCI solo cuentan si el job `e2e` se ejecuta (label o `workflow_dispatch`), no si queda `skipped`.
