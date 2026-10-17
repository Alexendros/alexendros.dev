# Checkpoint — paquetes A–D (contacto, consentimiento, contexto, catálogo, portfolio)

```text
Checkpoint: CP-00…CP-07 (alcance A+B+C+D) + gates locales
Estado: READY_LOCAL (escrituras externas NO autorizadas)
SHA base: a3c7a689c55013573655ac53a887e37c74e42269 (origin/main)
SHA candidato: (HEAD de cursor/contacto-medicion tras commits C+D)
Objetivo y alcance autorizado: continuar plan general; sin push/PR/automerge
```

## Paquetes A y B (previos)

- Lead solo tras `accepted` no-replay; mailto hasta hidratación; Vercel gated; revocación mismo documento; contexto `servicio`/`proyecto`.

## Paquetes C y D (este cierre)

### CP-06 catálogo (AXD-004, 007, 008, 011)

- Hero y meta: crear vs revisar, sin promesas absolutas.
- Informe: SEO técnico / plan priorizado con límites; sin «puntuación» ni «solucionar cada problema».
- Sesión: orienta + resumen; implementación solo con acuerdo aparte.
- Panel de contenidos: copy comercial sin «no CMS en este sitio».
- Portal: base, pago, plazo y exclusiones visibles en configurador.
- Impuestos: nota de importes provisionales sin desglose publicado (no se inventa IVA).
- Siguiente paso concreto por ficha; CTA de acción alineado.
- Configurador: checkboxes deshabilitados hasta hidratación; noscript con enlace de consulta.

### CP-07 portfolio y CMP (AXD-009, 012)

- `workKind`: encargo | demostracion | propio (declarado, no inferido).
- Resultados reformulados como capacidades comprobadas donde faltaba fuente/permiso.
- Disponibilidad aclarada (consulta ≠ transferencia ≠ agenda).
- CMP neutro: «Aceptar todas» / «Rechazar opcionales» / «Configurar» (+ `/cookies`).

## Pruebas

| Comando                                                                        | Resultado          |
| ------------------------------------------------------------------------------ | ------------------ |
| typecheck / lint / format:check / lint:css                                     | PASS               |
| check:records / audit:cookies / check:copy                                     | PASS               |
| vitest                                                                         | PASS 198 (+1 todo) |
| Playwright (contacto, consent, critical, safe-network, home, servicios, legal) | PASS 50/50         |

## Hallazgos

| ID                         | Estado                                        |
| -------------------------- | --------------------------------------------- |
| AXD-001…003, 005, 006, 010 | corregido (local)                             |
| AXD-004, 007, 008, 011     | corregido (local; sin inventar fiscalidad)    |
| AXD-009, 012               | corregido (local; sin certificación jurídica) |
| CP-08…13                   | no ejecutados en este cierre                  |

## NOT_VERIFIED

SMTP real, preview/producción Vercel, SDK reales Clarity/LinkedIn, GTM externo, UI matriz visual completa, SEO edge, Lighthouse, SEM, merge.

## Decisión requerida

Autorización de push/PR (sin automerge). Revisión humana del tono CMP y del copy de catálogo si se desea ajustar «productos web» vs borrador corto del plan.
