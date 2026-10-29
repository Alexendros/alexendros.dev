# Plan de shipment, saneamiento y estabilización

Fecha de revisión: 2026-10-29.

Repositorio: [Alexendros/alexendrosdev](https://github.com/Alexendros/alexendrosdev).

Documento canónico: `docs/plans/PLAN-CIERRE-SHIP.md`.

Estado del programa: **en ejecución; publicación final no autorizada**.

## Objetivo

Publicar una versión estable y funcional del sitio profesional con:

- Catálogo y promesas coherentes.
- Ausencia de precios públicos y restos del modelo económico retirado.
- Información legal y privacidad ajustadas a la operativa real.
- Consentimiento y medición correctamente implementados.
- Contacto comprobado hasta recepción y respuesta.
- Accesibilidad evaluada automática y manualmente.
- Presupuestos de rendimiento cumplidos.
- CSP efectiva y controles de seguridad verificables.
- Código mantenible, sin residuos innecesarios.
- Repositorio organizado y trazabilidad conservada.
- Correspondencia comprobada entre código, build y deployment.
- Recuperación operativa documentada.

La integración de código, la creación de una release y el cierre del programa son hitos diferentes. Ninguno sustituye automáticamente a los otros.

## Alcance de la revisión

### Verificado directamente

- La PR #149 está fusionada y añade el plan canónico y la documentación de comparación LHCI. [PR #149](https://github.com/Alexendros/alexendrosdev/pull/149)
- La PR #150 está fusionada y declara separar E2E y LHCI, exigir informes y endurecer los comprobadores. [PR #150](https://github.com/Alexendros/alexendrosdev/pull/150)
- La PR #148 sigue abierta, en borrador y sin conflictos detectados por GitHub. [PR #148](https://github.com/Alexendros/alexendrosdev/pull/148)
- Su cabeza observada es `186a404c2e8592bff9ed1a9cb601f3871ec71cf9` y su base observada es `356fd286ff10d40764008c28753a17c2df930b56`. [PR #148](https://github.com/Alexendros/alexendrosdev/pull/148)
- En la ejecución revisada, `ci-gate`, calidad, pruebas, build, smoke, axe y E2E crítico tienen resultado satisfactorio. E2E completo y LHCI aparecen omitidos. [Ejecución CI](https://github.com/Alexendros/alexendrosdev/actions/runs/40923036922)
- `pr-mergeable` aparece omitido mientras la PR continúa en borrador. [Comprobación de merge](https://github.com/Alexendros/alexendrosdev/actions/runs/40923285126)

### Declarado, no reproducido

- Release actual `v1.32.4`.
- Vitest: 218 pruebas.
- E2E completo: 135/135 con informe HTML.
- Comparación limpia LHCI con seis rutas sin variación y contacto con incremento de 196 bytes.
- Ausencia de importes en las rutas indicadas.
- Comportamiento completo de `check-csp --enforce`.

Estos resultados no se consideran falsos ni se descartan. Deben identificarse como resultados aportados y vincularse a sus informes, entorno y SHA.

### Pendiente de inspección

- Diff completo de #149 y #150.
- Código efectivo de los workflows y comprobadores.
- Contenido de los informes originales LHCI y Playwright.
- Tests de regresión de los nuevos comprobadores.
- Configuración efectiva del alojamiento.
- Variables y proveedores activos.
- Respuestas de producción.
- Entrega real del formulario.
- Accesibilidad manual.
- Secretos y dependencias en su estado actual.

**No marcar estas tareas como realizadas por haber revisado únicamente la descripción de las PR.**

## Hallazgos del seguimiento

| ID   | Hallazgo                                                                                                                               | Prioridad                    | Acción                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| H-01 | #148 mantiene pendiente la revisión editorial                                                                                          | Bloqueante de integración    | Obtener evidencia independiente sobre el SHA final                                 |
| H-02 | La excepción LHCI para #148 sigue sin aceptación                                                                                       | Bloqueante de integración    | Aceptación expresa o resolución previa del exceso                                  |
| H-03 | El exceso JavaScript continúa abierto                                                                                                  | Bloqueante de shipment       | Optimizar sin elevar el presupuesto                                                |
| H-04 | El checklist inicial de #148 conserva 216 pruebas y “CI completa” pendiente, mientras su actualización describe resultados posteriores | Documentación                | Sustituir ambigüedad por una matriz por SHA                                        |
| H-05 | #149 y #150 conservan casillas CI pendientes en sus descripciones iniciales                                                            | Documentación                | Vincular la ejecución final y aclarar el resultado real                            |
| H-06 | E2E completo local y E2E de Actions son evidencias distintas                                                                           | Evidencia                    | No presentar una ejecución omitida como superada                                   |
| H-07 | La comparación de #149 se describe contra SHA anteriores al HEAD actual de #148                                                        | Evidencia                    | Actualizar comparación o demostrar qué cambios posteriores no afectan al artefacto |
| H-08 | `--enforce` se declara implementado, pero no activado                                                                                  | Bloqueante del cierre de CSP | Revisar el código, corregir política y activar el gate                             |
| H-09 | Legal, proveedores, contacto y accesibilidad manual siguen abiertos                                                                    | Bloqueante de shipment       | Ejecutar fases específicas                                                         |
| H-10 | La release comunicada no acredita por sí sola el deployment                                                                            | Publicación                  | Relacionar tag, commit, build y deployment                                         |

Los estados y discrepancias documentales anteriores se observan en las descripciones de las PR y sus checks; no constituyen todavía defectos demostrados del código interno. [PR #148](https://github.com/Alexendros/alexendrosdev/pull/148) · [PR #149](https://github.com/Alexendros/alexendrosdev/pull/149) · [PR #150](https://github.com/Alexendros/alexendrosdev/pull/150)

## Reglas del programa

- No reescribir `main`.
- No borrar el tag de línea base.
- No eliminar PR ni evidencias históricas.
- No usar bypass administrativo.
- No rebajar presupuestos para obtener verde.
- No eliminar pruebas válidas para ocultar fallos.
- No cerrar revisiones humanas mediante automatización.
- No introducir cambios comerciales durante una refactorización.
- No publicar datos personales o secretos.
- No asumir que una release equivale a un deployment validado.
- No imponer una versión mayor únicamente para señalar el final de la limpieza.
- No declarar el programa terminado mientras existan bloqueos.
- No exigir cero issues globales: exigir cero bloqueos de este programa.

## Orden de ejecución

| Fase | Trabajo                          | Condición de salida                                     |
| ---- | -------------------------------- | ------------------------------------------------------- |
| A    | Verificación de #149 y #150      | Implementación y pruebas contrastadas                   |
| B    | Cierre editorial de #148         | Evidencia y excepción aprobadas, o rendimiento resuelto |
| C    | Proveedores y obligaciones       | Datos reales y decisiones documentadas                  |
| D    | Privacidad, cookies y contacto   | Implementación y operación coherentes                   |
| E    | Clean-code y supresión de restos | Sin código muerto ni contratos obsoletos                |
| F    | Rendimiento                      | Presupuestos cumplidos                                  |
| G    | CSP y seguridad                  | Política efectiva y gate bloqueante                     |
| H    | Accesibilidad manual             | Matriz completada y defectos resueltos                  |
| I    | Candidato de publicación         | Evidencias completas sobre un SHA                       |
| J    | Ship y observación               | Producción estable y recuperación comprobada            |
| K    | Cierre de repositorio            | Ramas, incidencias y documentos saneados                |

El análisis y la recopilación de datos pueden avanzar en paralelo. Los cambios sobre las mismas interfaces deben integrarse de forma secuencial.

## Fase A: verificar lo integrado

### Revisar los diffs

Recuperar información y patches sin modificar GitHub:

```bash
set -euo pipefail

REPO_SLUG="Alexendros/alexendrosdev"
AUDIT_DIR="$(mktemp -d -t alexendros-ship-audit-XXXXXXXX)"

for PR in 149 150; do
  gh pr view "$PR" \
    --repo "$REPO_SLUG" \
    --json number,state,mergedAt,mergeCommit,headRefOid,url,body \
    > "$AUDIT_DIR/pr-$PR.json"

  gh pr diff "$PR" \
    --repo "$REPO_SLUG" \
    > "$AUDIT_DIR/pr-$PR.diff"
done

printf 'Directorio de revisión: %s\n' "$AUDIT_DIR"
```

Comprobar:

- Que el código hace lo descrito.
- Que no hay cambios funcionales ajenos.
- Que existen pruebas de los nuevos comportamientos.
- Que las instrucciones documentadas son ejecutables.
- Que no quedan rutas o nombres anteriores incorrectos.
- Que los informes se generan realmente.
- Que los fallos provocan el resultado esperado.

### PR #149

Checklist:

- [ ] Existe un único plan canónico.
- [ ] README, AGENTS e índice documental apuntan al mismo plan.
- [ ] Responsables identificados o declarados pendientes.
- [ ] Bloqueos siguen abiertos.
- [ ] La comparación identifica SHA base y candidato.
- [ ] La configuración y versiones están registradas.
- [ ] Se conservan resultados por ruta.
- [ ] Los enlaces a informes funcionan.
- [ ] Se diferencia evidencia original y análisis posterior.
- [ ] No se publica información sensible.
- [ ] No se atribuye al HEAD actual una medición de otro SHA.

La descripción de #149 vincula la comparación a `main@69cbd57` y al candidato `702e66c`; el HEAD actual de #148 es posterior. Esa diferencia debe quedar visible. [PR #149](https://github.com/Alexendros/alexendrosdev/pull/149) · [PR #148](https://github.com/Alexendros/alexendrosdev/pull/148)

### PR #150

Checklist:

- [ ] E2E completo ejecuta únicamente Playwright.
- [ ] LHCI ejecuta únicamente Lighthouse.
- [ ] LHCI consume el artefacto previsto, no el build con identificadores ficticios.
- [ ] Se comprueba procedencia y SHA del artefacto.
- [ ] No hay otro LHCI duplicado en un script auxiliar.
- [ ] El reporter HTML está configurado.
- [ ] La ausencia de informes exigidos falla.
- [ ] Las rutas de informes son correctas.
- [ ] Los nombres de artefactos evitan colisiones.
- [ ] `pr-mergeable` falla ante estado desconocido.
- [ ] Se ejecuta al pasar a Ready.
- [ ] El comprobador CSP separa política efectiva y `Report-Only`.
- [ ] `--enforce` devuelve error ante incumplimientos definidos.
- [ ] Existen tests positivos y negativos.
- [ ] CI no se presenta como CSP endurecida mientras no se active el modo bloqueante.

La PR declara estos cambios, pero mantiene expresamente fuera de alcance activar CSP enforce y corregir rendimiento. [PR #150](https://github.com/Alexendros/alexendrosdev/pull/150)

### Casos del comprobador CSP

Probar al menos:

| Caso                               | Resultado esperado                            |
| ---------------------------------- | --------------------------------------------- |
| Hash solo en `Report-Only`         | No autoriza el script en la política efectiva |
| Hash correcto en política efectiva | Recurso autorizado según su directiva         |
| Script inline sin autorización     | Hallazgo y fallo con `--enforce`              |
| Política ausente                   | Fallo según el contrato establecido           |
| Política inválida                  | Error claro                                   |
| Varias políticas efectivas         | Evaluación de todas, no unión permisiva       |
| Artefacto de análisis inexistente  | Error, no falso “sin hallazgos”               |
| Ruta o lectura fallida             | Error observable                              |

El comprobador estático no sustituye las pruebas de navegador y cabeceras reales.

## Fase B: cerrar #148

### Actualizar sus evidencias

La descripción debe contener una tabla única:

| Validación     | SHA              | Entorno              | Resultado               | Evidencia   |
| -------------- | ---------------- | -------------------- | ----------------------- | ----------- |
| CI obligatoria | SHA final        | Actions              | Estado real             | Run         |
| Vitest         | SHA ejecutado    | Local o Actions      | Resultado real          | Informe     |
| E2E completo   | SHA ejecutado    | Local o Actions      | Resultado real          | HTML        |
| Axe            | SHA ejecutado    | Entorno              | Resultado real          | Informe     |
| LHCI           | Base y candidato | Perfil limpio        | Incumplimiento heredado | Comparación |
| Editorial      | SHA revisado     | Humana independiente | Pendiente o aprobado    | Referencia  |
| Excepción      | Alcance exacto   | Decisión mantenedor  | Pendiente o aceptada    | Referencia  |

No marcar “CI completa” si solo han terminado los checks obligatorios y existen validaciones opt-in omitidas.

### Evidencia editorial

Exigir:

- Nombre e identificador verificable.
- Fecha y zona horaria.
- SHA revisado.
- Confirmación del diff completo.
- Revisión visual de OG.
- Resultado.
- Correcciones.
- Confirmación de su resolución.
- Referencia verificable.

Solo entonces actualizar `evt-editorial-review-0026`.

Si cambia contenido editorial después, repetir la revisión afectada.

### Excepción LHCI limitada

La aceptación debe expresar:

- PR a la que se limita.
- SHA o rango autorizado.
- Evidencia de que el exceso es heredado.
- Delta observado.
- Riesgo aceptado.
- Responsable que acepta.
- Incidencia que lo resolverá.
- Prohibición de usarla para el ship final.

No convertir una autorización limitada en una dispensa permanente del presupuesto.

### Fusión

Una vez satisfechos ambos bloqueos:

```bash
set -euo pipefail

REPO_SLUG="Alexendros/alexendrosdev"

gh pr ready 148 --repo "$REPO_SLUG"
gh pr checks 148 --repo "$REPO_SLUG" --watch --required

HEAD_SHA="$(
  gh pr view 148 \
    --repo "$REPO_SLUG" \
    --json headRefOid \
    --jq '.headRefOid'
)"

gh pr merge 148 \
  --repo "$REPO_SLUG" \
  --squash \
  --delete-branch \
  --match-head-commit "$HEAD_SHA"
```

Ejecutar la fusión únicamente después de verificar evidencia, conversaciones y autorización. No automatizar la aprobación humana.

## Fase C: proveedores y legal

### Proveedores

Inventariar:

- Alojamiento.
- Correo.
- Redis.
- Antispam.
- Reservas.
- Automatizaciones.
- Analítica.
- Publicidad.
- Almacenamiento de evidencias.

Por proveedor:

- Entidad.
- Finalidad.
- Datos.
- Entorno.
- Estado.
- Región.
- Transferencias.
- Condiciones.
- Acuerdo de tratamiento cuando proceda.
- Conservación.
- Responsable.
- Coste y límites.

### Alojamiento

- [ ] Comprobar el plan real en la cuenta.
- [ ] Confirmar que permite la actividad.
- [ ] Resolver cualquier incompatibilidad contractual.
- [ ] Configurar alertas y límites.
- [ ] Verificar titularidad y recuperación.
- [ ] Actualizar documentación.

No dar por confirmada una migración o contratación por haberla propuesto en un plan. Si sigue existiendo duda sobre las condiciones del proveedor, verificar sus documentos vigentes antes de publicar la aceptación.

### Matriz legal

Documentar:

- Prestador real.
- Actividad.
- Público objetivo.
- Solicitud de presupuesto.
- Contratación.
- Atención a consumidores, si existe.
- Tratamientos.
- Obligaciones de accesibilidad.
- Obligaciones informativas.
- Evidencias de implementación.

No declarar “cumplimiento integral” solo porque existen páginas legales.

### Aviso legal

- Verificar identidad y NIF.
- Confirmar domicilio profesional suficiente.
- Añadir datos registrales si proceden.
- Identificar canales.
- Revisar propiedad intelectual.
- Revisar límites de responsabilidad.
- Publicar datos reales.
- Mantener acceso permanente desde el pie.

Si se cambia la ruta, añadir redirección y actualizar enlaces y sitemap.

### Condiciones del servicio

- Servicios descritos con precisión.
- Exclusiones claras.
- Sin promesas de certificación no prestada.
- Sin precios públicos residuales.
- Sin condiciones de pago ficticias.
- Propuestas y contratación acordadas por el proceso real.
- Revisión jurídica cuando haya dudas relevantes no resueltas.

## Fase D: privacidad y contacto

### Información de privacidad

- Determinar finalidad y base jurídica por tratamiento.
- Añadir primera capa junto al formulario.
- Enlazar la información adicional.
- Separar publicidad de atención a consultas.
- Identificar proveedores reales.
- Definir conservación.
- Definir derechos y borrado.
- Minimizar campos.

No utilizar una casilla genérica como legitimación universal.

Si una casilla solo confirma lectura, su texto, nombre y contrato deben reflejarlo. Si cambia el payload, definir transición y pruebas.

### Canales

Decidir sobre WhatsApp, teléfono y reservas:

- Mantenerlos con tratamiento y atención efectivos.
- O retirarlos coherentemente de interfaz, API, documentación y tests.

No conservar un canal puramente decorativo.

### Cookies

Probar:

- Primera visita.
- Rechazo.
- Analítica.
- Publicidad.
- Retirada.
- Visita posterior.
- Fallo del gestor.
- Funcionamiento sin JavaScript.

Inspeccionar:

- Cookies.
- Almacenamiento.
- Red.
- Etiquetas.
- Eventos.
- Identificadores.
- Envíos del servidor.

Las políticas, inventario y comportamiento deben coincidir.

### Envío real

Realizar una prueba autorizada sobre funciones desplegadas:

1. Registrar SHA y deployment.
2. Enviar desde navegador.
3. Registrar `requestId`.
4. Confirmar respuesta de la aplicación.
5. Confirmar recepción.
6. Revisar spam y autenticación.
7. Responder.
8. Confirmar recepción de la respuesta.
9. Repetir con la misma clave de idempotencia.
10. Confirmar un único envío.
11. Anonimizar evidencia.
12. Borrar los datos de prueba cuando proceda.

Un test con mocks, un servidor estático o un HTTP satisfactorio no demuestra entrega.

### Fallos

En entorno controlado:

- Validación.
- Honeypot.
- Antispam.
- Rate limit.
- Conflicto.
- Procesamiento concurrente.
- SMTP indisponible.
- Redis indisponible.
- Timeout.
- Resultado incierto.

Verificar que no existen confirmaciones falsas, reintentos ilimitados o duplicación de mensajes.

### Seguridad del correo

- Remitente autorizado.
- `Reply-To` seguro.
- Protección de cabeceras.
- Destinatario controlado.
- Sin datos personales en logs.
- SPF, DKIM y DMARC comprobados.
- Resultado de autenticación revisado en un mensaje recibido.

## Fase E: clean-code

### Inventario previo

Antes de eliminar:

- Identificar consumidores.
- Revisar imports.
- Revisar rutas.
- Revisar pruebas.
- Revisar referencias documentales.
- Revisar dependencias dinámicas.
- Revisar convenciones del framework.

La ausencia de import estático no demuestra por sí sola que un archivo sea prescindible.

### Restos de precios

Buscar y clasificar:

- Modelo `pricing`.
- Configurador económico.
- Campos `price`, importes y totales.
- Estados provisional/confirmed.
- Funciones de descuento.
- JSON-LD económico.
- CTA de pago.
- Fixtures.
- Snapshots.
- OG.
- HTML.
- Documentación vigente.

No borrar automáticamente coincidencias históricas, legales o nombres válidos de terceros.

Criterio de salida:

- Cero referencias económicas prohibidas en superficie pública.
- Cero contratos de precio obsoletos en código activo.
- Histórico conservado e identificado.
- Gate con pruebas positivas y negativas.

### Refactor del formulario

Separar cuando el código lo justifique:

- Modelo.
- Validación.
- Estado.
- Presentación.
- Transporte.
- Gestión de errores.
- Integraciones.

Mantener comportamiento y contratos. Evitar una reorganización cosmética que aumente indirection sin reducir complejidad.

### Catálogo y módulos

- Separar contenido y esquemas.
- Mantener IDs estables.
- Preservar serialización hacia contacto.
- Validar módulos desconocidos.
- Eliminar exportaciones sin consumidores.
- Evitar dependencias circulares.
- Mantener slugs y redirecciones.

### CSS y componentes

- Consolidar tokens.
- Eliminar duplicación demostrada.
- Revisar especificidad.
- Eliminar selectores muertos comprobados.
- Mantener temas.
- Mantener estados y foco.
- Evitar valores mágicos nuevos.
- No rediseñar innecesariamente durante saneamiento.

### Scripts y configuración

- Revisar workarounds contra versiones actuales.
- Eliminar únicamente los innecesarios.
- Documentar los retenidos.
- Revisar scripts sin uso.
- Revisar variables obsoletas.
- Revisar overrides.
- Alinear configuración local y CI.

### Licencias y recursos

- Verificar procedencia de imágenes.
- Revisar fuentes.
- Retirar recursos sin licencia clara.
- Eliminar variantes huérfanas.
- Mantener originales necesarios y optimizados publicados.
- No introducir recursos remotos por comodidad sin revisar sus consecuencias.

## Fase F: rendimiento

### Medición

Por cada ruta:

- SHA.
- Perfil.
- Versiones.
- Repeticiones.
- JavaScript.
- CSS.
- Peso total.
- LCP.
- CLS.
- Elemento LCP.
- Recursos responsables.

Comparar magnitudes equivalentes. No mezclar bytes de archivo, comprimidos y transferidos.

### Optimización

Priorizar según datos:

- Hidratación innecesaria.
- Código compartido excesivo.
- Contacto cargado fuera de contacto.
- Configurador fuera de sus rutas.
- Dependencias duplicadas.
- Integraciones prematuras.
- Recursos no utilizados.
- Fuentes o imágenes que retrasen LCP.

No eliminar medición autorizada silenciosamente ni cambiar de framework sin justificación.

### Aceptación

- [ ] Todas las rutas del presupuesto medidas.
- [ ] Ninguna assertion de error incumplida.
- [ ] JavaScript dentro del presupuesto vigente.
- [ ] CSS y peso dentro del presupuesto.
- [ ] Avisos revisados.
- [ ] Sin regresión funcional.
- [ ] Sin regresión de consentimiento.
- [ ] Sin regresión de accesibilidad.
- [ ] Evidencia sobre el SHA candidato.

La excepción de #148 no satisface esta fase.

## Fase G: CSP y seguridad

### CSP

1. Inventariar recursos.
2. Retirar orígenes sin uso.
3. Revisar scripts y estilos propios.
4. Externalizar cuando proceda.
5. Generar hashes sobre salida final.
6. Usar nonces solo donde sean coherentes con el renderizado.
7. Probar `Report-Only`.
8. Resolver violaciones.
9. Aplicar política efectiva.
10. Activar `--enforce` en CI.
11. Comprobar cabeceras en producción.

No convertir un nonce fijo en aparente endurecimiento de HTML estático.

Las excepciones deben ser específicas, justificadas y revisables.

### Colector

- Límite de tamaño.
- Rate limit.
- Entrada no confiable.
- Escape.
- Minimización.
- Conservación.
- Control de costes.
- Ausencia de datos sensibles en evidencias públicas.

### Dependencias

- Ejecutar el análisis actual.
- Separar producción y desarrollo.
- Revisar exposición real.
- Actualizar de forma controlada.
- Justificar excepciones.
- Evitar correcciones masivas sin pruebas.
- No reutilizar un listado antiguo como resultado vigente.

### Secretos

- Revisar archivos.
- Revisar historial.
- Revisar workflows.
- Revisar variables de despliegue.
- Revisar bundles.
- Revisar permisos.

Ante exposición:

1. Revocar.
2. Rotar.
3. Evaluar.
4. Corregir.
5. Decidir limpieza histórica.
6. Ejecutarla con autorización.

No reescribir Git como procedimiento ordinario de saneamiento.

## Fase H: accesibilidad

### Evaluación

Completar matriz de criterios aplicables del objetivo acordado:

- Estructura.
- Teclado.
- Foco.
- Contraste.
- Ampliación.
- Reflujo.
- Espaciado.
- Movimiento.
- Nombres y roles.
- Formularios.
- Errores.
- Estados.
- Diálogos.
- CMP.
- Objetivos táctiles.
- Procesos completos.

Incluir variantes responsive y temas.

### Evidencia

Por criterio:

- Aplicabilidad.
- Ruta y estado.
- Método.
- Evaluador.
- Resultado.
- Evidencia.
- Defecto.
- Retest.

No utilizar “no aplicable” por falta de revisión.

### Declaración

La página pública debe reflejar:

- Alcance.
- Fecha.
- Método.
- Estado real.
- Limitaciones.
- Canal de comunicación.

No equiparar axe sin hallazgos con conformidad completa.

## Documentación y residuos

### Fuentes de verdad

Actualizar:

- README.
- AGENTS.
- Arquitectura.
- Protocolo de CI.
- Protocolo de release.
- Contacto.
- Cookies.
- Proveedores.
- Riesgos.
- Plan canónico.
- ADR y eventos.

No repetir el plan entero en varios documentos.

### Clasificación

Cada documento debe ser:

- Vigente.
- Histórico.
- Sustituido.
- Evidencia.
- Referencia.

Los históricos deben indicar qué los sustituye cuando corresponda.

### Residuos del repositorio

Revisar:

- Builds.
- Logs.
- Informes temporales.
- Capturas.
- Archivos de editor.
- Descargas.
- Configuración personal.
- Variables locales.
- Recursos huérfanos.
- Fixtures personales.
- Artefactos grandes.

No ejecutar borrados globales sin revisión.

### Design system

Decidir si permanece público o interno.

En cualquier caso:

- Sin datos sensibles.
- Sin importes prohibidos.
- Sin ejemplos personales.
- Sin enlaces rotos.
- Con indexación coherente.

`noindex` no es un mecanismo de confidencialidad.

## Validación reproducible

### Preparación

Desde el checkout correcto:

```bash
set -euo pipefail

REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"

git remote -v
git status --short
git fetch origin --prune --tags

node --version
pnpm --version
gh auth status

pnpm run
```

Antes de instalar:

- Comprobar remoto.
- Comprobar cambios locales.
- Comprobar versiones fijadas.
- Revisar instrucciones de agentes.
- Revisar scripts actuales.

No sobrescribir cambios para obtener un árbol limpio.

### Ejecución

Una vez confirmados los scripts en el SHA elegido:

```bash
set -euo pipefail

export ASTRO_TELEMETRY_DISABLED=1

pnpm install --frozen-lockfile

pnpm typecheck
pnpm lint
pnpm lint:css
pnpm format:check

pnpm check:records
pnpm audit:cookies
pnpm check:copy
pnpm check:classes
pnpm check:contrast
pnpm check:public-pricing

pnpm test
pnpm test:contract

pnpm build
pnpm check:links
pnpm smoke

pnpm exec playwright install --with-deps chromium
CI=true pnpm test:e2e
```

Si un script ha cambiado, actualizar el plan mediante revisión; no ignorar el error ni sustituirlo por una ejecución parcial sin registrarlo.

Después:

- Ejecutar LHCI desde build limpio.
- Ejecutar seguridad.
- Ejecutar comprobación CSP bloqueante.
- Probar funciones desplegadas.
- Completar revisiones humanas.

No promover un build de pruebas como build de producción.

## Estabilización de versión

### Identidades separadas

Registrar:

- SHA de fuente.
- Identificador de build.
- Configuración de build.
- Tag de release.
- SHA del tag.
- Deployment.
- Variables de entorno por versión o referencia.
- Fecha de promoción.

No exigir que nombres coincidan: exigir que la relación sea explícita y verificable.

### Política de versionado

- Mantener la automatización existente salvo decisión específica.
- Usar mensajes finales correctos.
- No forzar un major.
- No crear tags manuales competidores.
- No mover tags publicados.
- No editar una versión solo para aparentar sincronización.
- No usar una release anterior como etiqueta imprecisa de un deployment posterior.

La versión `v1.32.4` comunicada debe verificarse contra su tag y deployment antes de incorporarla como estado confirmado.

### Congelación

1. Integrar fases funcionales.
2. Pausar cambios ajenos.
3. Elegir SHA candidato.
4. Ejecutar validación completa.
5. Resolver fallos.
6. Repetir validación afectada.
7. Aprobar go/no-go.

Todo cambio posterior debe indicar qué evidencias invalida.

## Manifiesto de shipment

El manifiesto final debe incluir:

- SHA.
- Tag y su commit.
- Build.
- Deployment.
- Runtime.
- Gestor de paquetes.
- Perfil.
- CI.
- E2E.
- LHCI.
- CSP.
- Seguridad.
- Editorial.
- Legal y proveedores.
- Privacidad y cookies.
- Contacto real.
- Accesibilidad.
- Excepciones no bloqueantes.
- Responsable de publicación.
- Decisión.
- Rollback.
- Observación posterior.

No introducir una contradicción circular: un commit posterior para añadir evidencias cambia el SHA. Identificarlo como posterior o utilizar metadatos de release y seguimiento sin alterar el candidato validado.

## Go/no-go

| Área          | Condición exigida                      |
| ------------- | -------------------------------------- |
| #148          | Integrada con evidencia y autorización |
| Editorial     | Revisión independiente acreditada      |
| CI            | Checks requeridos satisfactorios       |
| E2E           | Completo y sobre el candidato          |
| LHCI          | Sin errores de presupuesto             |
| CSP           | Efectiva y bloqueante                  |
| Seguridad     | Sin riesgos bloqueantes                |
| Precios       | Sin restos públicos prohibidos         |
| Legal         | Datos y obligaciones revisados         |
| Proveedores   | Condiciones compatibles                |
| Privacidad    | Información y operación coherentes     |
| Cookies       | Sin actividad opcional no autorizada   |
| Contacto      | Recepción y respuesta reales           |
| Accesibilidad | Evaluación y correcciones completadas  |
| Código        | Sin residuos activos identificados     |
| Documentación | Vigente y consistente                  |
| Deployment    | Fuente y configuración verificadas     |
| Rollback      | Disponible y comprobado                |

Una condición roja impide el cierre. Una excepción aceptada para integración no se convierte automáticamente en excepción de publicación.

## Publicación

### Antes

- Confirmar responsable.
- Registrar autorización.
- Identificar deployment recuperable.
- Confirmar dominios.
- Confirmar certificados.
- Confirmar variables.
- Confirmar funciones.
- Confirmar proveedores.
- Confirmar ausencia de identificadores de prueba.
- Confirmar candidato exacto.

### Mecanismo

Elegir entre:

- Despliegue automático desde `main` con cada merge apto para operar.
- Promoción controlada tras validación.

No asumir que retrasar un tag retiene producción. Verificar la configuración efectiva del proyecto.

### Después

Comprobar:

- Dominio principal y `www`.
- HTTPS.
- Rutas públicas.
- Fichas.
- Contacto.
- Páginas legales.
- 404.
- Redirecciones.
- Sitemap.
- Robots.
- Canonical.
- OG.
- Recursos.
- Consola.
- Temas.
- Móvil.
- Teclado.
- Consentimiento.
- Cabeceras.
- Formulario real.

Verificar que la respuesta corresponde al deployment autorizado, no a una captura o caché anterior.

### Caché

Si aparecen diferencias:

1. Comparar respuestas.
2. Identificar capa.
3. Verificar deployment.
4. Aplicar purga controlada.
5. Repetir.
6. Confirmar consistencia.

Una URL con parámetro no acredita por sí sola que la URL pública normal esté actualizada.

## Rollback

### Activación

Recuperar o contener ante:

- Caída.
- Errores críticos.
- Formulario inutilizable.
- CSP que bloquea funciones.
- Tratamiento opcional no autorizado.
- Datos expuestos.
- SHA incorrecto.
- Regresión crítica.

### Ejecución

1. Declarar incidente.
2. Contener.
3. Restaurar deployment seguro.
4. Verificar dominio.
5. Verificar rutas.
6. Verificar contacto.
7. Registrar causa.
8. Corregir mediante PR.
9. Revalidar.
10. Publicar controladamente.

No restaurar una versión que comparta el riesgo grave.

No utilizar force-push de `main` como rollback de infraestructura.

## Observación

Mantener como política propuesta una ventana de 24–48 horas, ampliable según incidencias.

Observar:

- Disponibilidad.
- Funciones.
- Correo.
- Consentimiento.
- CSP.
- Errores del navegador.
- Cuotas.
- Costes.
- Alertas.
- Estado de deployments.

La ausencia de tráfico no acredita ausencia de problemas.

Si aparece un bloqueo:

- Reabrir cierre.
- Contener.
- Corregir.
- Revalidar.
- Ampliar observación.

## Saneamiento final

### Git

```bash
set -euo pipefail

REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"

git fetch origin --prune --tags
git switch main
git pull --ff-only origin main

git status --short
git branch -vv
git branch -r

gh pr list \
  --repo Alexendros/alexendrosdev \
  --state open

gh issue list \
  --repo Alexendros/alexendrosdev \
  --state open
```

Revisar antes de eliminar.

Con squash, una rama integrada puede no aparecer como ancestro de `main`. Comprobar PR y contenido, no basarse solo en `git branch --merged`.

### Prohibiciones

No utilizar como receta general:

```text
git clean -fdx
git push --force origin main
borrado masivo de ramas
borrado masivo de tags
eliminación indiscriminada del histórico
```

### Cierre administrativo

- Cerrar PR del programa.
- Eliminar sus ramas terminadas.
- Cerrar incidencias satisfechas.
- Conservar relaciones.
- Registrar sustituciones.
- Mantener pendientes independientes identificados.
- Retirar excepciones vencidas.
- Confirmar que ninguna excepción temporal oculta un bloqueo final.

## Checklist definitivo

### Integración y evidencia

- [ ] Diffs de #149 y #150 inspeccionados.
- [ ] Implementación contrastada con su descripción.
- [ ] Tests de los comprobadores revisados.
- [ ] Checklists de PR actualizados con resultados reales.
- [ ] SHA de cada evidencia identificado.
- [ ] Comparación LHCI actualizada o acotada.
- [ ] Revisión editorial realizada.
- [ ] Excepción de #148 aceptada o innecesaria.
- [ ] #148 integrada correctamente.

### Operación

- [ ] Alojamiento compatible.
- [ ] Proveedores inventariados.
- [ ] Variables revisadas.
- [ ] Información legal verificada.
- [ ] Privacidad coherente.
- [ ] Cookies verificadas en navegador.
- [ ] Canales atendidos.
- [ ] Formulario recibido.
- [ ] Respuesta recibida.
- [ ] Idempotencia comprobada.
- [ ] Fallos controlados.

### Código y seguridad

- [ ] Restos del modelo de precios eliminados del código activo.
- [ ] Superficie pública sin importes prohibidas.
- [ ] Código muerto identificado y retirado.
- [ ] Componentes y estilos saneados.
- [ ] Workarounds revisados.
- [ ] Dependencias analizadas.
- [ ] Secretos revisados.
- [ ] CSP efectiva.
- [ ] `--enforce` activado y probado.
- [ ] Sin riesgos bloqueantes.

### Calidad

- [ ] CI requerida satisfactoria.
- [ ] E2E completo satisfactorio.
- [ ] Informes obligatorios presentes.
- [ ] LHCI sin errores.
- [ ] Avisos documentados.
- [ ] Accesibilidad manual completada.
- [ ] Defectos bloqueantes corregidos.
- [ ] Documentación alineada.

### Ship

- [ ] Candidato congelado.
- [ ] SHA, tag, build y deployment relacionados.
- [ ] Go/no-go registrado.
- [ ] Perfil de producción confirmado.
- [ ] Publicación ejecutada.
- [ ] Rutas y cabeceras verificadas.
- [ ] Caché verificada.
- [ ] Contacto final comprobado.
- [ ] Rollback comprobado.
- [ ] Observación completada.
- [ ] Ramas del programa saneadas.
- [ ] Evidencias finales enlazadas.

## Condición de cierre

El programa se cierra únicamente cuando:

- No quedan bloqueos de integración o publicación.
- La web publicada corresponde al candidato autorizado.
- Las funciones esenciales están comprobadas realmente.
- El presupuesto de rendimiento se cumple.
- La seguridad y accesibilidad tienen evidencias suficientes.
- La documentación describe el funcionamiento real.
- El repositorio no contiene residuos activos o sensibles identificados.
- La recuperación está disponible.
- La observación ha terminado sin incidencias bloqueantes abiertas.

**La declaración final debe identificar qué se ha publicado, dónde, desde qué código, con qué evidencias y bajo la autorización de quién. “Release creada” o “CI verde” no bastan.**
