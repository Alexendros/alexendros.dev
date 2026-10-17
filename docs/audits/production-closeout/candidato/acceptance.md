# Aceptación del candidato — cierre de producción (sin F-02 autorizado)

Fecha UTC de cierre documental: 2026-10-17T10:30:00Z  
Alcance ejecutado: fases A–E + F-01. **F-02 smoke real / correo a buzón y F-03 observación 24h–7d no ejecutados como procedimiento autorizado** (quedan a decisión del mantenedor).

En este repo Hobby, `main` despliega Production automáticamente. El SHA de Production observado al redactar coincide con el candidato; eso **no** sustituye REL-02 (smoke de dominio + contacto real autorizado).

## Línea base

| Referencia                    | SHA / nota                   |
| ----------------------------- | ---------------------------- |
| Plan baseline                 | `91ae5fe` (merge #107)       |
| Candidato en `main`           | `53a20b6` (merge #114)       |
| Release                       | `v1.24.4`                    |
| Production Vercel (observado) | deployment con SHA `53a20b6` |

## Paquetes integrados

| Paquete                   | PR   | Estado |
| ------------------------- | ---- | ------ |
| PR-A disposición #104     | #109 | MERGED |
| PR-B idempotencia y foco  | #110 | MERGED |
| PR-C contrato y fichas    | #108 | MERGED |
| PR-D configurador/CRM     | #114 | MERGED |
| PR-E consentimiento/rutas | #113 | MERGED |
| PR-F CI candidato         | #115 | MERGED |

## Decisiones de ciclo

- **D-01**: excepción — sin ficha `/servicios/portal-inicio` (decisión 0017).
- **D-02**: importes provisionales explícitos; cifras sin cambio.
- **D-03**: sin copy comercial nuevo; COM-03 `BLOCKED` hasta firma del mantenedor.
- **D-04**: Notion opcional / fallo observable; sin promesa de CRM.
- **D-05**: limpieza selectiva en #113; Cal.com conservado; #104 no fusionado en bloque.
- **D-06**: contrato 200/202/409/503 en contacto.

## Gates — resultado obtenido

| Gate                                | Resultado obtenido                           | Commit / run                             | Entorno                             |
| ----------------------------------- | -------------------------------------------- | ---------------------------------------- | ----------------------------------- |
| quality (+ `check:contrast`)        | PASS                                         | #115 run `38990016709` job quality       | CI PR                               |
| test / build / smoke / e2e-critical | PASS                                         | #114 merge run `38990380625` (`53a20b6`) | CI main                             |
| e2e completo + LHCI (label `e2e`)   | PASS                                         | #115 run `38990016709` job e2e           | CI PR (label)                       |
| e2e en push a `main`                | SKIPPED (esperado: sin label / sin dispatch) | `38990380625`                            | CI main                             |
| OPS-02 buzón real                   | BLOCKED                                      | —                                        | requiere autorización               |
| REL-02 / REL-03 procedimiento       | BLOCKED / no ejecutado                       | —                                        | mantenedor                          |
| SEC-01 CSP Preview dedicado         | BLOCKED como PASS formal                     | —                                        | no auditado como evidencia separada |
| COM-03 firma mantenedor             | BLOCKED                                      | —                                        | —                                   |

## Rollback

Ver [rollback.md](./rollback.md). Mecanismo: revert por PR o rollback de deployment Vercel. No se ha ejecutado rollback en este ciclo.

## Excepciones explícitas

- #104 permanece abierto; no fusionar en bloque (matriz en `91ae5fe/104-disposition.md`).
- Suite completa + LHCI acreditadas en el PR #115 con label `e2e`, no en el push a `main` posterior.
- Production auto-deploy ≠ aceptación REL-02 (contacto real, consentimiento en apex sin datos previos, etc.).
