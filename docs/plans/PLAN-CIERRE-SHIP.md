# Plan canónico de cierre y publicación

## Objetivo y alcance

Cerrar el programa iniciado en las PR #145–#147 sin repetir esa limpieza. El cierre exige que código, deployment y evidencias describan la misma realidad: catálogo revisado, obligaciones y proveedores resueltos, contacto real comprobado, accesibilidad evaluada, presupuestos técnicos cumplidos, CSP efectiva y rollback disponible.

No se declara cumplimiento jurídico integral ni conformidad WCAG por una lista de checks. Las compras, cambios de proveedor, pruebas que generan comunicaciones y aceptaciones de riesgo requieren autorización del titular.

## Fuentes y trazabilidad

- Línea base: tag `baseline-cleanup-2026-10-29`.
- Base de partida: `main@69cbd578d27bd6cf992296b1af4bde46bb03914c`.
- PR activa: [#148](https://github.com/Alexendros/alexendrosdev/pull/148), candidato `702e66ceed63b51eebdbb43927b3bc2bb68ad1e6`.
- Versión: tags y GitHub Releases; `package.json` no es la fuente canónica.
- Registros: `docs/audits/decisions.json` y `docs/audits/events.json`.
- Operación: [CI y release](../standards/protocols/ci-release.md).
- Comparación LHCI: [base frente a #148](evidence/2026-10-29-lhci-pr148.md).

## Responsables

| Rol                             | Responsable              | Acreditación pendiente                                 |
| ------------------------------- | ------------------------ | ------------------------------------------------------ |
| Mantenedor y trazabilidad       | Alejandro Domingo Agustí | Código, checks, PR y registros                         |
| Revisor editorial independiente | Pendiente de asignación  | Diff completo, fecha, resultado y correcciones         |
| Titular del servicio            | Alejandro Domingo Agustí | Identidad, actividad, proveedores y decisiones legales |
| Evaluador de accesibilidad      | Pendiente de asignación  | Método, criterios, resultados y retest                 |
| Responsable de publicación      | Alejandro Domingo Agustí | Go/no-go, deployment, observación y rollback           |

Una misma persona puede asumir roles compatibles, salvo revisar de forma independiente su propio trabajo.

## Estado y bloqueos

| Fase               | Estado                             | Bloqueo actual y siguiente acción                                                                                                      |
| ------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Catálogo #148      | CI obligatoria y 135 E2E superados | **Integración:** falta evidencia editorial independiente. LHCI ya comparado; excepción limitada pendiente de aceptación del mantenedor |
| CI y release       | En preparación                     | Separar E2E/LHCI, endurecer `pr-mergeable`, preparar CSP gate y evidencias por SHA                                                     |
| Proveedores        | Pendiente                          | **Publicación:** confirmar plan apto para uso profesional e inventario real; ninguna compra autorizada por este documento              |
| Legal y privacidad | Pendiente                          | **Publicación:** domicilio publicable, aplicabilidad, proveedores, conservación y base jurídica                                        |
| Cookies y medición | Pendiente                          | **Publicación:** matriz de navegador, referidos, retirada y proveedores reales                                                         |
| Contacto real      | Contrato automatizado existente    | **Publicación:** recepción y respuesta en buzones controlados; prueba manual autorizada                                                |
| Deuda frontend     | Pendiente                          | Refactor sin cambios legales ni de comportamiento                                                                                      |
| Rendimiento        | Fallo heredado demostrado          | **Publicación:** siete rutas superan 61.440 bytes de JavaScript; corregir sin rebajar presupuestos                                     |
| CSP y seguridad    | Informe no bloqueante              | **Publicación:** política efectiva mínima y validación de flujos                                                                       |
| Accesibilidad      | Axe sin violaciones en la muestra  | **Publicación:** evaluación manual, evidencias y declaración precisa                                                                   |
| Cierre             | No candidato                       | Requiere todos los bloqueantes de publicación resueltos y go/no-go                                                                     |

### Excepciones temporales

Solo se contempla una excepción para integrar #148: el exceso de JavaScript es heredado, con variación máxima de 196 bytes en la comparación limpia. Su alcance queda limitado a esa PR, no al ship final. Debe ser aceptada expresamente por el mantenedor junto con la evidencia editorial. No hay otras excepciones aprobadas.

La issue #132 queda fuera de este programa como trabajo independiente; no se cierra ni se pospone por este plan.

## Fases y criterios de aceptación

1. **Catálogo (#148):** evidencia editorial real, correcciones confirmadas, excepción LHCI aceptada solo para esta integración, `pr-mergeable` y CI verdes, squash y rama eliminada.
2. **CI fiable:** Playwright y Lighthouse en jobs separados; builds de prueba y publicación diferenciados; estado mergeable desconocido bloqueante; informes obligatorios y referenciados al SHA.
3. **Proveedores:** plan de alojamiento compatible, variables por nombre/entorno, propietarios y condiciones registrados sin secretos.
4. **Legal y privacidad:** aviso accesible, datos verificados, información por capas, base jurídica coherente, canales atendidos y documentos internos disponibles.
5. **Cookies:** escenarios de navegador comprobados, sin actividad opcional no autorizada; inventario y retirada coherentes.
6. **Contacto:** envío, recepción, respuesta, idempotencia y fallos acreditados con evidencia anonimizada.
7. **Deuda:** responsabilidades separadas y comportamiento equivalente; sin residuos demostrables.
8. **Rendimiento:** ninguna assertion LHCI de nivel error incumplida; avisos revisados; builds limpios.
9. **CSP y seguridad:** política efectiva validada, hosts justificados, secretos revisados y riesgos bloqueantes cerrados.
10. **Accesibilidad:** matriz manual por criterio, defectos y retest; axe verde y declaración limitada a la evidencia.
11. **Publicación:** candidato congelado, manifiesto, autorización, deployment identificado, pruebas públicas y observación finalizada.

## Evidencias

Cada evidencia debe indicar identificador, resultado, fecha, responsable, SHA o alcance, entorno, referencia y limitaciones. Las pruebas reales se anonimizan; credenciales, correos completos, contratos y expedientes permanecen fuera del repositorio público.

Los resultados de un SHA no se reutilizan para otro. Checks omitidos, cancelados o sin informe no cuentan como éxito. La revisión humana no se sustituye por automatización.

## Publicación y rollback

Antes del ship se identifican SHA, build, deployment y deployment anterior. Se comprueban variables por nombre y entorno, dominios, funciones, proveedores, CI completa, E2E, LHCI, seguridad, evidencias humanas y autorización go/no-go.

Producción se verifica desde fuera del entorno local: rutas, redirects, canonical, OG, sitemap, robots, 404, temas, móvil, CMP, contacto, cabeceras y consola. La observación posterior dura 24–48 horas y se amplía si aparecen incidencias.

Ante caída, formulario inutilizable, CSP que bloquee funciones esenciales, actividad opcional sin consentimiento o exposición de datos, se contiene el incidente y se promueve el último deployment compatible. No se usa `reset --hard`, force-push ni restauración ciega de una versión que comparta el fallo. La corrección posterior entra por PR y repite las validaciones afectadas.
