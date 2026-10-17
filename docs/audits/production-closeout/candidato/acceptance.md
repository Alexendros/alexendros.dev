# Aceptación del candidato — cierre de producción (F-02 ejecutado)

Fecha UTC de cierre documental: 2026-10-17T11:05:00Z  
Alcance: fases A–E + F-01 + **F-02 smoke de dominio** (autorizado).  
**F-03** (observación 24h–7d) queda abierto como ventana de vigilancia; no bloquea el cierre de smoke.  
**OPS-02** (correo real a buzón) no ejecutado en este ciclo (sin envío sintético a `operaciones@`).  
**COM-03** sigue a firma del mantenedor.

En Hobby, `main` despliega Production. Production observado: deployment READY con SHA `a3fc027` (merge #116; tip de código de producto = `53a20b6` + docs de aceptación).

## Línea base

| Referencia              | SHA / nota                               |
| ----------------------- | ---------------------------------------- |
| Plan baseline           | `91ae5fe` (merge #107)                   |
| Candidato de producto   | `53a20b6` (merge #114)                   |
| Tip `main` / Production | `a3fc027` (merge #116)                   |
| Release                 | `v1.24.4`                                |
| Production Vercel       | `dpl_HRyWxfj24Aj9z7xBdRfQxLPMRp1Q` READY |

## Paquetes integrados

| Paquete                   | PR   | Estado |
| ------------------------- | ---- | ------ |
| PR-A disposición #104     | #109 | MERGED |
| PR-B idempotencia y foco  | #110 | MERGED |
| PR-C contrato y fichas    | #108 | MERGED |
| PR-D configurador/CRM     | #114 | MERGED |
| PR-E consentimiento/rutas | #113 | MERGED |
| PR-F CI candidato         | #115 | MERGED |
| STATUS acceptance         | #116 | MERGED |

## Decisiones de ciclo

- **D-01**: sin ficha `/servicios/portal-inicio` (404 verificado; decisión 0017).
- **D-02**: importes provisionales visibles en catálogo y sticky CTA.
- **D-03**: sin copy comercial nuevo; COM-03 `BLOCKED`.
- **D-04**: Notion opcional / fallo observable.
- **D-05**: #104 no fusionado en bloque.
- **D-06**: contrato 200/202/409/503 en contacto.

## Gates — resultado obtenido

| Gate                                | Resultado      | Evidencia                                                                                                                                                                                                            | Entorno               |
| ----------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| quality (+ `check:contrast`)        | PASS           | #115 run `38990016709`                                                                                                                                                                                               | CI PR                 |
| test / build / smoke / e2e-critical | PASS           | #114 merge `38990380625`                                                                                                                                                                                             | CI main               |
| e2e completo + LHCI                 | PASS           | #115 run `38990016709`                                                                                                                                                                                               | CI PR (label)         |
| REL-02 HTTP apex/www                | PASS           | `/` y rutas clave 200; `www`→apex 308; ficha auditoría 200; portal-inicio 404                                                                                                                                        | Producción 2026-10-17 |
| REL-02 UI smoke                     | PASS           | Home, `/servicios` (3 fichas + configurador), `/servicios/informe-comercial`, `/contacto` (paso 1/6); CMP con botones «Aceptación desinformada» / «Sí a lo esencial» / «Configuración informada» tras limpiar cookie | Browser Cursor        |
| OPS-02 buzón real                   | BLOCKED        | Sin envío real en este ciclo                                                                                                                                                                                         | —                     |
| F-03 observación                    | OPEN           | Ventana 24h–7d desde F-02                                                                                                                                                                                            | Mantenedor            |
| SEC-01 CSP Preview dedicado         | BLOCKED formal | CSP presente en apex (headers)                                                                                                                                                                                       | Producción            |
| COM-03 firma                        | BLOCKED        | —                                                                                                                                                                                                                    | —                     |

## Rollback

Ver [rollback.md](./rollback.md). Ante fallo de contacto o precio: revert PR o rollback Vercel al deployment previo (`53a20b6` / `dpl_EpFrrhV5LVGAJKVKxrb1e6wPtoqF`).

## Excepciones explícitas

- #104 permanece abierto; no fusionar en bloque.
- OPS-02 y COM-03 fuera del smoke F-02.
- Tema oscuro observado vía `prefers-color-scheme` del browser de inspección.
