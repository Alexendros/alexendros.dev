# Plan operativo de estabilización y shipment

Fecha: 2026-10-29.

Repositorio: [Alexendros/alexendrosdev](https://github.com/Alexendros/alexendrosdev).

Documento canónico: `docs/plans/PLAN-CIERRE-SHIP.md`.

Estado: **en ejecución; integración del catálogo y shipment final pendientes**.

## Alcance de esta actualización

Este plan continúa el trabajo existente. No ordena repetir fases cerradas ni sustituye las decisiones registradas.

El estado inicial procede del último avance comunicado por el mantenedor, **sin una nueva inspección independiente de GitHub en esta actualización**:

| Elemento              | Estado comunicado                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| PR activa de catálogo | [#152 — fix: alinear catálogo con revisiones técnicas reales](https://github.com/Alexendros/alexendrosdev/pull/152) |
| Estado                | Abierta, en borrador                                                                                                |
| Cabeza                | `1607f0c6e0632b56d77837f2655b7489288b217c`                                                                          |
| Base                  | `d847cbe30ce16db09338f686ceb166d6f0289c5b`                                                                          |
| PR anterior           | [148](https://github.com/Alexendros/alexendrosdev/pull/148), cerrada sin fusionar y sustituida                      |
| Revisión editorial    | Pendiente                                                                                                           |
| Excepción LHCI        | Pendiente                                                                                                           |
| Shipment final        | Bloqueado por las fases restantes                                                                                   |

**La sustitución de una PR conserva trabajo y trazabilidad, pero no transfiere automáticamente aprobaciones, checks o excepciones.**

## Objetivo operativo

Conseguir una versión publicada que cumpla simultáneamente:

- Código integrado y revisado.
- Catálogo conceptualmente correcto.
- Ausencia de precios públicos y contratos económicos obsoletos.
- Información legal y privacidad verificadas.
- Proveedores compatibles con la actividad.
- Consentimiento real y revocable.
- Contacto recibido y respondido.
- Accesibilidad evaluada automática y manualmente.
- Presupuestos técnicos cumplidos.
- CSP efectiva validada.
- Dependencias, secretos y permisos revisados.
- Repositorio limpio y documentación coherente.
- Correspondencia entre fuente, build, tag y deployment.
- Recuperación y observación completadas.

No declarar terminado el trabajo únicamente porque se haya fusionado #152, creado una release o superado `ci-gate`.

## Reglas de cierre

- No reescribir `main`.
- No borrar la línea base ni el histórico útil.
- No reabrir #148 como paso necesario: continuar mediante #152.
- No eliminar la rama compartida mientras #152 dependa de ella.
- No atribuir aprobaciones a personas que no las hayan emitido.
- No usar bypass administrativo.
- No ampliar presupuestos para ocultar deuda.
- No eliminar pruebas válidas para obtener verde.
- No contratar servicios ni publicar datos personales sin autorización.
- No alterar decisiones comerciales mediante una refactorización.
- No convertir excepciones temporales de integración en permisos de shipment.
- No crear planes competidores.
- No cerrar asuntos sin evidencia de su criterio de aceptación.

## Registro de pendientes

Utilizar estos identificadores dentro del plan. **No representan issues o eventos ya creados**; deben enlazarse con los existentes o crearse una sola vez.

| ID     | Asunto                           | Bloquea                                | Evidencia de cierre                        |
| ------ | -------------------------------- | -------------------------------------- | ------------------------------------------ |
| EST-01 | Trazabilidad #148 → #152         | Integración del catálogo               | Referencias y SHA coherentes               |
| EST-02 | Revisión editorial independiente | Integración del catálogo               | Revisión del diff y OG                     |
| EST-03 | Decisión sobre excepción LHCI    | Integración con presupuesto incumplido | Aceptación expresa o presupuesto corregido |
| EST-04 | Rendimiento                      | Shipment                               | LHCI satisfactorio sobre candidato         |
| EST-05 | Legal y proveedores              | Shipment                               | Matriz y datos verificados                 |
| EST-06 | Privacidad y canales             | Shipment                               | Interfaz, API y documentos coherentes      |
| EST-07 | Cookies y medición               | Shipment                               | Pruebas reales de elección y retirada      |
| EST-08 | Contacto real                    | Shipment                               | Recepción, respuesta y errores comprobados |
| EST-09 | Clean-code y restos              | Shipment                               | Inventario resuelto y regresión superada   |
| EST-10 | CSP efectiva                     | Shipment                               | Política aplicada y gate bloqueante        |
| EST-11 | Seguridad                        | Shipment                               | Análisis actual y riesgos resueltos        |
| EST-12 | Accesibilidad                    | Shipment                               | Evaluación manual y automática             |
| EST-13 | Release y deployment             | Publicación                            | Identidades relacionadas y go/no-go        |
| EST-14 | Observación y saneamiento        | Cierre                                 | Operación estable y expediente final       |

Estados permitidos:

- Pendiente.
- En curso.
- Bloqueado.
- Listo para revisión.
- Cerrado con evidencia.

“Implementado” no equivale necesariamente a “cerrado”: puede faltar la comprobación operativa.

## Primer paquete de trabajo

### EST-01: fijar la sustitución

Acciones:

- Actualizar el plan para señalar #152 como PR activa.
- Mantener #148 como antecedente histórico.
- Revisar referencias de ADR, eventos, incidencias y descripciones.
- Mantener `evt-editorial-review-0026` abierto.
- Actualizar su alcance o referencias mediante el esquema existente, sin duplicarlo.
- No borrar evidencias antiguas: identificarlas como correspondientes a otros SHA.
- Identificar cuáles requieren repetición.
- Mantener una tabla única de resultados por SHA.

Comprobación inicial de solo lectura:

```bash
set -euo pipefail

REPO_SLUG="Alexendros/alexendrosdev"

gh pr view 152 \
  --repo "$REPO_SLUG" \
  --json number,state,isDraft,headRefName,headRefOid,baseRefName,baseRefOid,url

gh pr checks 152 --repo "$REPO_SLUG"

gh pr diff 152 --repo "$REPO_SLUG" --stat
```

Si cabeza o base ya no coinciden con el estado comunicado, registrar el nuevo estado antes de continuar.

**Cierre de EST-01:** todas las referencias vigentes apuntan a #152 y no existe ambigüedad sobre qué cambios o revisiones pertenecen a #148.

### EST-02: revisión editorial

La revisión independiente debe cubrir:

- Diff completo contra la base vigente.
- Taxonomía.
- Promesas y exclusiones.
- Requisitos del cliente.
- CTA y recorrido hacia contacto.
- Identidad profesional.
- Datos estructurados.
- Imágenes OG mediante inspección visual.
- Documentación modificada.

Evidencia obligatoria:

- Revisor e identificador.
- Fecha y zona horaria.
- SHA cabeza y base, o identificación inequívoca del diff.
- Confirmación del alcance completo.
- Resultado.
- Correcciones solicitadas.
- Resolución.
- Referencia verificable.

Resultados válidos:

- Aprobada sin correcciones.
- Aprobada después de verificar las correcciones.
- Rechazada o pendiente de cambios.

“Aprobada con correcciones pendientes” no autoriza la fusión.

**Cierre de EST-02:** revisión real completada y evento actualizado conforme al esquema del repositorio.

### EST-03: decisión LHCI

Elegir expresamente una de estas rutas:

| Ruta                                 | Actuación                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| Integrar catálogo antes de optimizar | El mantenedor acepta una excepción limitada a #152                                |
| No aceptar excepción                 | Corregir el rendimiento antes de integrar, mediante trabajo separado y coordinado |

La excepción debe incluir:

- PR #152.
- SHA o rango autorizado.
- Comparación base/candidato.
- Naturaleza heredada del incumplimiento.
- Delta y limitaciones de la evidencia.
- Riesgo aceptado.
- Responsable.
- Trabajo corrector vinculado.
- Vencimiento: antes del shipment final.

Las mediciones antiguas pueden justificar antecedentes, pero no demostrar por sí solas el estado de una cabeza posterior.

**Cierre de EST-03:** aceptación expresa documentada o presupuesto ya corregido. La redacción de este plan no constituye aceptación.

### Integración de #152

Antes de pasar a Ready:

- EST-01 cerrado.
- EST-02 cerrado.
- EST-03 resuelto.
- Descripción con evidencias correctas.
- Conversaciones resueltas.
- Checks sobre la cabeza vigente.
- Ningún bloqueo nuevo.

Después de pasar a Ready:

- Esperar `pr-mergeable`.
- Confirmar checks obligatorios.
- Confirmar que la cabeza no ha cambiado.
- Fusionar mediante squash.
- Verificar el resultado en `main`.
- Comprobar el despliegue si el merge publica automáticamente.
- Eliminar la rama solo cuando haya terminado su función.

No copiar aprobaciones o estados de Actions de #148 como si pertenecieran a #152.

## Trabajo paralelo permitido

Mientras se obtiene la revisión editorial, avanzar desde `main` en:

- Recopilación de datos legales.
- Inventario de proveedores.
- Comprobación del alojamiento.
- Análisis de privacidad.
- Preparación de pruebas reales de correo.
- Diagnóstico de rendimiento.
- Inventario de código y recursos obsoletos.
- Revisión de dependencias y permisos.

No utilizar ese paralelismo para producir varias refactorizaciones incompatibles sobre formulario, CMP o catálogo.

Si cambia la base de #152, evaluar qué revisiones y mediciones deben repetirse.

## Segundo paquete: operación y legal

### EST-05: proveedores

Crear o completar un inventario con:

| Campo          | Contenido                     |
| -------------- | ----------------------------- |
| Proveedor      | Entidad y producto            |
| Finalidad      | Uso real                      |
| Datos          | Información transmitida       |
| Entorno        | Producción, preview o pruebas |
| Estado         | Activo, inactivo o retirado   |
| Ubicación      | Región verificada             |
| Transferencias | Situación evaluada            |
| Condiciones    | Documentos aplicables         |
| Conservación   | Plazo y borrado               |
| Responsable    | Persona encargada             |
| Credenciales   | Referencias, nunca valores    |

Revisar alojamiento, correo, antispam, Redis, reservas, automatizaciones y medición según el uso efectivo.

Para el alojamiento:

- Comprobar el plan real.
- Verificar compatibilidad con la actividad profesional.
- Resolver incompatibilidades antes del cierre.
- Configurar límites y alertas.
- Confirmar titularidad, acceso y recuperación.
- Actualizar la documentación.

No tratar una recomendación previa de migración como si la migración ya se hubiera ejecutado.

### Información legal

Obtener los datos reales del titular y documentar aplicabilidad:

- Identidad.
- Actividad.
- Domicilio publicable suficiente.
- Información fiscal o registral pertinente.
- Público objetivo.
- Proceso de presupuesto y contratación.
- Obligaciones de información.
- Obligaciones de accesibilidad aplicables.
- Tratamientos y proveedores.

Implementar:

- Aviso legal identificable.
- Acceso desde todas las páginas.
- Redirecciones necesarias.
- Enlaces y sitemap coherentes.
- Condiciones que correspondan a la operativa real.
- Ausencia de promesas de certificación o asesoramiento no prestado.

**Cierre de EST-05:** datos confirmados, proveedores y alojamiento resueltos, y revisión de las obligaciones aplicables. Si faltan datos, registrar el bloqueo; no inventarlos.

## Tercer paquete: privacidad y contacto

### EST-06: contrato de privacidad

Decidir por finalidad:

- Qué datos son necesarios.
- Para qué se usan.
- Qué base jurídica corresponde.
- Quién los recibe.
- Cuánto se conservan.
- Cómo se ejercen derechos.
- Cómo se borran.

Implementar una primera capa junto al formulario y una política adicional coherente.

Si la casilla confirma lectura:

- Utilizar una denominación y texto compatibles con esa función.
- Actualizar API, validación, pruebas y documentación.
- Definir la transición desde contratos anteriores.
- No presentarla como consentimiento universal.

Decidir explícitamente sobre WhatsApp, teléfono y reservas:

- Mantenerlos con tratamiento y operativa reales.
- O retirarlos de interfaz, API, políticas y tests.

### EST-07: cookies

Validar en navegador:

| Escenario         | Comportamiento esperado              |
| ----------------- | ------------------------------------ |
| Primera visita    | Sin actividad opcional no autorizada |
| Rechazo           | Solo actividad técnica justificada   |
| Selección parcial | Solo categorías elegidas             |
| Retirada          | Cese posterior y limpieza posible    |
| Nueva visita      | Preferencia respetada                |
| Fallo del gestor  | Comportamiento restrictivo           |
| Sin JavaScript    | Contenido y alternativa de contacto  |

Inspeccionar:

- Cookies.
- Almacenamiento.
- Red.
- Eventos.
- Etiquetas.
- Identificadores.
- Procesamiento del lado servidor.

Revisar por separado atribución y referidos. No clasificarlos automáticamente como técnicos.

**Cierre de EST-07:** código, inventario, política y comportamiento real coinciden.

### EST-08: contacto real

Probar sobre un entorno con funciones desplegadas:

1. Identificar SHA y deployment.
2. Usar datos y buzones controlados.
3. Enviar desde navegador.
4. Registrar hora y `requestId`.
5. Comprobar respuesta de la aplicación.
6. Confirmar recepción en Proton o buzón efectivo.
7. Revisar spam y autenticación.
8. Confirmar `Reply-To`.
9. Responder.
10. Confirmar recepción de la respuesta.
11. Repetir con la misma clave de idempotencia.
12. Confirmar ausencia de duplicados.
13. Anonimizar evidencia.
14. Aplicar el borrado previsto.

Pruebas de fallo en entorno controlado:

- Payload inválido.
- Antispam.
- Rate limit.
- Conflicto.
- Concurrencia.
- SMTP indisponible.
- Redis indisponible.
- Timeout.
- Resultado incierto.

Comprobar:

- Sin confirmaciones falsas.
- Sin reintentos ilimitados.
- Sin duplicación.
- Sin información personal en logs, URL, consola o analítica.
- Errores accesibles y recuperables.
- Alternativa de correo funcional.

**Cierre de EST-08:** recepción y respuesta demostradas. Un HTTP satisfactorio no basta.

## Cuarto paquete: saneamiento y rendimiento

### EST-09: inventario de restos

Clasificar antes de borrar:

| Categoría                | Tratamiento                      |
| ------------------------ | -------------------------------- |
| Código activo necesario  | Conservar y mejorar              |
| Código muerto demostrado | Eliminar con pruebas             |
| Compatibilidad temporal  | Documentar condición de retirada |
| Workaround vigente       | Conservar y justificar           |
| Workaround obsoleto      | Retirar tras comprobar           |
| Histórico útil           | Archivar e identificar           |
| Temporal o sensible      | Retirar y evaluar exposición     |

La ausencia de imports estáticos no demuestra por sí sola que un archivo no se use.

### Supresión del modelo económico

Buscar y revisar:

- Modelos de precios retirados.
- Totales.
- Descuentos.
- Estados provisionales.
- Campos económicos.
- Configuradores antiguos.
- CTA de pago.
- JSON-LD.
- Fixtures.
- Snapshots.
- OG.
- HTML generado.
- Documentación vigente.

Conservar el histórico necesario. No eliminar coincidencias legítimas mediante una sustitución masiva.

El gate debe tener:

- Casos que deban fallar.
- Casos que deban pasar.
- Inspección de la salida pública.
- Alcance documentado.
- Falsos positivos controlados.

### Clean-code

Priorizar:

- Separación de presentación, estado, validación y transporte del formulario.
- Separación de esquemas y contenido.
- IDs y slugs estables.
- Serialización de módulos hacia contacto.
- Eliminación de exportaciones sin consumidores.
- Reducción de duplicación.
- Helpers de pruebas coherentes.
- Estilos agrupados por responsabilidad.
- Tokens consistentes.
- Dependencias y scripts realmente utilizados.

No usar límites arbitrarios de líneas como sustituto del diseño. No rediseñar el sitio durante una limpieza salvo necesidad demostrada.

### EST-04: rendimiento

Medir el build de publicación, separado del build de pruebas.

Por ruta, registrar:

- SHA.
- Versiones.
- Perfil.
- Repeticiones.
- Recursos.
- Métrica exacta.
- JavaScript compartido y específico.
- CSS.
- Peso total.
- LCP.
- CLS.
- Elemento responsable.

Optimizar según datos:

- Hidratación.
- Dependencias duplicadas.
- Código fuera de su ruta.
- Recursos no utilizados.
- Integraciones prematuras.
- Imágenes y fuentes.
- Fragmentación de componentes.

No eliminar decisiones de medición autorizadas de manera silenciosa.

**Cierre de EST-04:**

- Ninguna assertion LHCI de error incumplida.
- Presupuestos vigentes cumplidos.
- Avisos revisados.
- Sin regresiones funcionales.
- Sin regresiones de consentimiento o accesibilidad.
- Medición repetida sobre el SHA candidato final.

## Quinto paquete: seguridad y CSP

### EST-10: política efectiva

Secuencia:

1. Inventariar scripts, estilos y dominios.
2. Retirar orígenes innecesarios.
3. Revisar inline propios.
4. Externalizar cuando proceda.
5. Generar hashes sobre la salida final.
6. Usar nonces solo donde el renderizado y las cabeceras sean coherentes.
7. Observar `Report-Only`.
8. Resolver violaciones.
9. Aplicar política efectiva.
10. Activar el modo bloqueante en CI.
11. Probar respuestas y navegador reales.

No asumir que la presencia de `--enforce` demuestra que está activo o que todos sus casos son correctos.

Pruebas del comprobador:

- Hash solo en `Report-Only`.
- Inline sin autorización.
- Política efectiva ausente.
- Política inválida.
- Varias políticas efectivas.
- Artefacto inexistente.
- Error de lectura.
- Recursos permitidos correctamente.

No unir permisos de políticas diferentes de forma que se oculte un bloqueo real.

**Cierre de EST-10:** política efectiva funcional, excepciones acotadas y gate capaz de fallar ante incumplimientos.

### EST-11: seguridad

Revisar estado actual:

- Dependencias de producción.
- Herramientas de desarrollo.
- Overrides.
- Runtime.
- Workarounds.
- Acciones de GitHub.
- Permisos.
- Variables.
- Secretos.
- Bundles públicos.
- Colector CSP.
- Logs y retención.

Ante secreto expuesto:

1. Revocar.
2. Rotar.
3. Evaluar exposición.
4. Corregir origen.
5. Decidir limpieza histórica.
6. Ejecutarla mediante procedimiento autorizado.

No utilizar la limpieza de Git como sustituto de la revocación.

**Cierre de EST-11:** sin riesgos bloqueantes y con excepciones no bloqueantes justificadas, responsables y revisión prevista.

## Sexto paquete: accesibilidad

### EST-12: evaluación final

Realizarla cuando formulario, CMP y componentes estén estabilizados.

Cubrir:

- Teclado.
- Foco visible y no oculto.
- Orden.
- Encabezados y regiones.
- Nombres, roles y valores.
- Contraste.
- Zoom.
- Reflujo.
- Espaciado.
- Movimiento.
- Objetivos táctiles.
- Formularios y errores.
- Estados de envío.
- Diálogos.
- CMP.
- Lector de pantalla.
- Procesos completos.
- Temas y variantes responsive.

Por criterio:

- Aplicabilidad.
- Ruta y estado.
- Método.
- Evaluador.
- Resultado.
- Evidencia.
- Incidencia.
- Retest.

No utilizar “no aplicable” como sustituto de una revisión pendiente.

Actualizar la información pública de accesibilidad con alcance y estado reales.

**Cierre de EST-12:** matriz completada y objetivo establecido alcanzado. Axe sin hallazgos no sustituye esta fase.

## Validación técnica final

Antes de ejecutar, revisar los scripts disponibles en el SHA elegido. Los comandos siguientes recogen los establecidos en el plan anterior; si han cambiado, adaptar el documento mediante revisión.

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

Después:

- Ejecutar LHCI mediante su flujo separado y sobre el artefacto correcto.
- Ejecutar seguridad.
- Ejecutar CSP en modo bloqueante.
- Verificar presencia de informes.
- Revisar pruebas omitidas.
- Probar funciones desplegadas.
- Completar evidencias manuales.

No publicar un artefacto construido con IDs o configuración ficticia de E2E.

## Evidencias y validez

Cada evidencia debe identificar:

- Asunto.
- Resultado.
- Responsable.
- Fecha.
- SHA o rango.
- Entorno.
- Método.
- Referencia.
- Limitaciones.

Reglas de reutilización:

| Cambio posterior     | Actuación                                       |
| -------------------- | ----------------------------------------------- |
| Contenido editorial  | Revisión de la parte afectada                   |
| Dependencias o build | Repetir validación técnica afectada             |
| Formulario o backend | Repetir contrato y operación afectada           |
| CMP o tracking       | Repetir consentimiento                          |
| CSS o componentes    | Repetir accesibilidad y visuales afectadas      |
| CSP o proveedores    | Repetir política e integraciones                |
| Solo documentación   | Justificar qué evidencias siguen siendo válidas |
| Candidato final      | Ejecutar la matriz final acordada               |

Una revisión incremental puede complementar la original; debe quedar claro qué conjunto de evidencias cubre el estado final.

## Candidato y estabilización

### EST-13: congelación

Cuando estén resueltas las fases previas:

1. Pausar cambios ajenos.
2. Seleccionar SHA candidato.
3. Construir con perfil de producción.
4. Identificar build.
5. Identificar deployment candidato.
6. Ejecutar validación final.
7. Resolver fallos.
8. Obtener go/no-go.

No seguir añadiendo refactorizaciones mientras se certifica el candidato.

### Identidades

Relacionar explícitamente:

- SHA de código.
- SHA del tag.
- Nombre del tag.
- Build.
- Configuración relevante.
- Deployment.
- Dominio.
- Fecha de promoción.

No forzar una versión mayor por motivos cosméticos ni mover tags publicados.

Mantener la estrategia de versionado acordada o modificarla mediante una decisión específica.

### Manifiesto

El registro de shipment debe incluir:

- Identidades anteriores.
- CI.
- E2E completo.
- LHCI.
- Seguridad.
- CSP.
- Editorial.
- Legal y proveedores.
- Privacidad y cookies.
- Contacto.
- Accesibilidad.
- Excepciones no bloqueantes.
- Autorización.
- Rollback.
- Observación.

No añadir evidencias mediante un nuevo commit y seguir afirmando que se publica exactamente el SHA anterior. Identificar el commit posterior o registrar el resultado sin alterar el candidato.

## Matriz de publicación

| Área          | Condición                             |
| ------------- | ------------------------------------- |
| Catálogo      | #152 integrada correctamente          |
| Editorial     | Evidencia independiente               |
| Rendimiento   | Presupuesto cumplido                  |
| Proveedores   | Operativa y condiciones verificadas   |
| Legal         | Información y aplicabilidad resueltas |
| Privacidad    | Interfaz, API y política coherentes   |
| Cookies       | Elección y retirada comprobadas       |
| Contacto      | Recepción y respuesta reales          |
| Código        | Restos activos resueltos              |
| Seguridad     | Sin bloqueos                          |
| CSP           | Efectiva y bloqueante                 |
| Accesibilidad | Evaluación completada                 |
| CI            | Checks y artefactos correctos         |
| Deployment    | Candidato identificado                |
| Recuperación  | Procedimiento comprobado              |

Un resultado satisfactorio no compensa otro pendiente.

## Publicación controlada

Antes:

- Registrar autorización.
- Identificar deployment recuperable.
- Confirmar variables.
- Confirmar dominios y certificados.
- Confirmar proveedores.
- Confirmar ausencia de configuración de prueba.
- Confirmar candidato.

Después:

- Verificar dominio principal y `www`.
- Verificar HTTPS.
- Verificar rutas y fichas.
- Verificar páginas legales.
- Verificar redirecciones y 404.
- Verificar sitemap, robots y canonical.
- Verificar OG.
- Verificar recursos y consola.
- Verificar temas, móvil y teclado.
- Verificar CMP.
- Verificar cabeceras.
- Ejecutar contacto real.
- Confirmar deployment servido.
- Resolver caché si hay diferencias.

No usar snippets de buscadores o capturas antiguas como prueba del estado publicado.

## Recuperación

Activar contención o rollback ante:

- Caída.
- Errores críticos.
- Contacto inutilizable.
- CSP que bloquee funciones.
- Actividad opcional no autorizada.
- Exposición de información.
- Deployment incorrecto.
- Regresión crítica.

Procedimiento:

1. Contener.
2. Identificar causa y alcance.
3. Restaurar un deployment seguro y compatible.
4. Verificar rutas y contacto.
5. Registrar incidente.
6. Corregir mediante PR.
7. Revalidar.
8. Publicar controladamente.

No restaurar ciegamente una versión que comparta el mismo riesgo.

No utilizar force-push de `main` como rollback de infraestructura.

## Observación posterior

### EST-14: estabilización

Mantener como política propuesta 24–48 horas de observación, ampliables según incidencias.

Revisar:

- Disponibilidad.
- Funciones.
- Correo.
- Consentimiento.
- CSP.
- Recursos bloqueados.
- Errores.
- Cuotas.
- Costes.
- Alertas.
- Deployments.

La ausencia de tráfico no demuestra ausencia de fallos.

Si aparece un bloqueo, reabrir el cierre y ampliar la observación tras corregirlo.

## Saneamiento final

Verificar:

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

Después:

- Eliminar solo ramas terminadas.
- Comprobar PR y contenido antes de borrar.
- Conservar #148 como antecedente.
- Conservar evidencias y decisiones.
- Cerrar incidencias satisfechas.
- Mantener mejoras independientes.
- Actualizar documentación vigente.
- Retirar excepciones vencidas.

Con squash, no basar toda la decisión de borrado en `git branch --merged`.

No ejecutar borrados globales, `git clean -fdx` ni reescrituras de historial como receta de saneamiento.

## Checklist de esta iteración

La siguiente entrega de avance debe resolver o identificar con precisión:

- [ ] #152 registrada como sustituta en todas las referencias vigentes.
- [ ] Cabeza y base comprobadas.
- [ ] Evidencias antiguas clasificadas por SHA.
- [ ] Revisor editorial solicitado o asignado.
- [ ] Decisión explícita sobre excepción LHCI.
- [ ] Inventario inicial de proveedores completado.
- [ ] Datos legales faltantes identificados.
- [ ] Diagnóstico de JavaScript con recursos responsables.
- [ ] Inventario inicial de restos y workarounds.
- [ ] Próximas PR delimitadas sin números inventados.
- [ ] Bloqueos con responsable y siguiente acción.
- [ ] Ningún evento cerrado sin evidencia.

## Checklist de cierre total

- [ ] EST-01 cerrado.
- [ ] EST-02 cerrado.
- [ ] EST-03 resuelto.
- [ ] EST-04 cerrado sin excepción de presupuesto.
- [ ] EST-05 cerrado.
- [ ] EST-06 cerrado.
- [ ] EST-07 cerrado.
- [ ] EST-08 cerrado.
- [ ] EST-09 cerrado.
- [ ] EST-10 cerrado.
- [ ] EST-11 cerrado.
- [ ] EST-12 cerrado.
- [ ] EST-13 cerrado.
- [ ] EST-14 cerrado.
- [ ] Repositorio, documentación y deployment describen el mismo estado.
- [ ] No quedan bloqueos del programa.
- [ ] El responsable ha autorizado el cierre.

**El siguiente paso no es otro plan general: es ejecutar el primer paquete, avanzar con los inventarios en paralelo y aportar evidencias que permitan cerrar EST-01, EST-02 y EST-03 sin inventar aprobaciones ni detener el resto del trabajo.**
