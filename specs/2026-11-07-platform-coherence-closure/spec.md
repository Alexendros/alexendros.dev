# Spec — Platform coherence closure (Opción B)

**Fecha:** 2026-11-07  
**Estado:** DRAFT  
**Opción elegida:** B — Vitrina rica + gobernanza de componentes  
**Commit de referencia de auditorías:** 7541a20952623165449c46b959935997c7fbc796

## Contexto y objetivo

El repositorio declara un design system contractual (`docs/standards/website/diseno.md`, componentes en `src/components/`, ruta `/design-system`) y un dominio externo `designsystem.alexendros.dev` como vitrina viva. Ese dominio responde 404. Además existen tres drifts documentales/código de severidad major: CTAs del Hero con clases daisyUI directas, versión de Node desalineada en README, y tipografía Inter declarada frente a Source Sans 3 Variable empaquetada.

El objetivo es cerrar las cuatro inconsistencias de forma verificable y reforzar la gobernanza para que el uso de componentes del design system en superficies de conversión no se degrade de nuevo.

## Actores

- **Principal:** Mantenedor del repositorio y agentes de código que operan bajo `AGENTS.md`.
- **Fuera:** Visitantes del sitio comercial, colaboradores sin permiso de escritura, procesos de marketing o ampliación de catálogo.

## Historias

### H1 — Vitrina viva del design system

Como mantenedor  
quiero que `designsystem.alexendros.dev` responda 200 con una vitrina que muestre tokens, componentes (Button, Link, shells) y estados reales o controlados  
para que el contrato de `diseno.md` deje de apuntar a un destino inexistente y los consumidores puedan ver el sistema en vivo.

### H2 — CTAs del Hero bajo el componente canónico

Como mantenedor  
quiero que los CTAs principales del Hero usen el componente `Button.astro` (o la API canónica del design system)  
para que no existan dos fuentes de verdad visual y de comportamiento en la superficie de mayor conversión.

### H3 — Gobernanza de clases de botón en superficies de conversión

Como mantenedor  
quiero una regla documental y un mecanismo de verificación (check o test) que detecte el uso directo de clases `btn` / `btn-primary` / `btn-outline` (o equivalentes) en el Hero y CTAs de página sin pasar por el componente  
para que la desviación no se reintroduzca por inercia.

### H4 — Alineación de versión de Node

Como mantenedor  
quiero que README, `package.json` engines y `.nvmrc` declaren la misma versión de Node  
para eliminar el drift documental y las instrucciones contradictorias.

### H5 — Alineación de tipografía documentada

Como mantenedor  
quiero que ARCHITECTURE.md (y cualquier documento de arquitectura que nombre tipografías) declare exactamente las familias empaquetadas y usadas (Source Sans 3 Variable + JetBrains Mono)  
para que la documentación deje de describir un estado anterior.

### H6 — Checklist de aceptación

Como mantenedor  
quiero un checklist de aceptación en `docs/plans/` (o ruta equivalente del repo) que enumere las cuatro inconsistencias major y la prueba observable de cada una  
para poder cerrar el trabajo con revisión humana además de los gates automatizados.

## Reglas

R1. La vitrina en `designsystem.alexendros.dev` debe renderizar o mostrar de forma controlada los componentes y tokens del design system actual del repo. No se permite una página genérica o placeholder que no refleje el sistema.

R2. Los CTAs del Hero que hoy usan clases daisyUI directas deben pasar a `Button.astro` (o a la API canónica documentada). No se admite excepción silenciosa.

R3. Existe una regla escrita en el contrato de design system (`diseno.md` o documento sucesor) que establece el uso obligatorio del componente Button en Hero y CTAs de conversión de página.

R4. Existe un mecanismo de verificación automatizado (extensión de `check:classes`, test e2e o gate de CI) que falla si reaparecen las clases de botón directas en las superficies protegidas, salvo excepciones explícitamente listadas y documentadas.

R5. README, `engines.node` y `.nvmrc` deben coincidir en la versión mayor (y, si se documenta pin, en el pin) que CI ya usa.

R6. ARCHITECTURE.md debe nombrar las tipografías realmente presentes en dependencias y estilos.

R7. El checklist de aceptación debe ser legible por un humano y referenciar comando, URL o fichero verificable por cada ítem.

R8. No se amplía el catálogo de servicios, no se cambia tracking, no se introducen islas React ni CMS, no se reescribe el inventario histórico completo más allá de lo necesario para no contradecir el estado actual.

## Criterios de aceptación (comprobables)

### CA-H1 — Vitrina

- **Dado** el dominio `designsystem.alexendros.dev`
- **Cuando** se solicita la URL raíz o la página principal de la vitrina
- **Entonces** la respuesta es 200 y el contenido muestra tokens y/o componentes del design system del repo (Button, estados, o equivalentes)
- **No hace** devolver 404 ni un placeholder sin relación con el sistema
- **Verificación:** petición HTTP + inspección visual o snapshot; checklist humano

### CA-H2 — Hero usa Button

- **Dado** el código de `src/components/sections/Hero.astro` (o el fichero que renderiza los CTAs del Hero)
- **Cuando** se inspeccionan los CTAs principales
- **Entonces** usan el componente `Button.astro` (o la API canónica) y no clases `btn btn-primary` / `btn-outline` / equivalentes directas
- **No hace** mantener las clases daisyUI directas en esos CTAs
- **Verificación:** lectura de código + `check:classes` o equivalente; e2e de Hero si aplica

### CA-H3 — Gobernanza y check

- **Dado** la regla documental y el mecanismo de verificación
- **Cuando** se introduce de nuevo una clase de botón directa en el Hero o en un CTA de conversión protegido
- **Entonces** el check o test falla de forma observable en CI o en `pnpm` local
- **No hace** permitir la reintroducción silenciosa
- **Verificación:** test negativo (introducir la clase y observar fallo) + lectura de la regla en `diseno.md`

### CA-H4 — Node alineado

- **Dado** README, `package.json` y `.nvmrc`
- **Cuando** se comparan las declaraciones de versión de Node
- **Entonces** coinciden en la versión mayor (y pin si se documenta)
- **No hace** dejar README en 22 mientras el resto está en 24
- **Verificación:** lectura de los tres ficheros; opcional `node-drift` o script de CI

### CA-H5 — Tipografía alineada

- **Dado** ARCHITECTURE.md y las dependencias / estilos de fuentes
- **Cuando** se lee la sección de tipografía
- **Entonces** nombra Source Sans 3 Variable (y JetBrains Mono si aplica) y no Inter como fuente principal
- **No hace** describir un estado anterior
- **Verificación:** lectura de ARCHITECTURE.md + package.json / estilos

### CA-H6 — Checklist

- **Dado** el fichero de checklist en `docs/plans/`
- **Cuando** se revisa al cierre
- **Entonces** lista las cuatro inconsistencias major y la prueba observable de cada una
- **No hace** omitir ninguna de las cuatro ni dejar pruebas no verificables
- **Verificación:** lectura del checklist + ejecución de las pruebas citadas

## Calidad como escenarios

| Estímulo                                    | Respuesta esperada                    | Medida                           |
| ------------------------------------------- | ------------------------------------- | -------------------------------- |
| Petición a designsystem.alexendros.dev      | 200 + contenido de DS                 | HTTP status + inspección         |
| Cambio de CTA Hero a Button                 | Build y e2e-critical de Hero en verde | CI jobs quality / e2e-critical   |
| Reintroducción de `btn btn-primary` en Hero | Check o test falla                    | Fallo observable de gate         |
| Lectura de README vs engines vs .nvmrc      | Misma versión                         | Diff cero en versión documentada |
| Lectura de ARCHITECTURE.md tipografía       | Source Sans 3 Variable                | Texto coincide con dependencias  |
| Revisión del checklist                      | 4 ítems + pruebas                     | Checklist completo y ejecutable  |

## Interfaces externas

- Dominio `designsystem.alexendros.dev` (DNS + hosting, presumiblemente Vercel u otro compatible con el stack estático).
- CI existente del repo (jobs quality, test, build, smoke, e2e-critical).
- No se introducen APIs de terceros nuevas más allá de lo ya autorizado en AGENTS.md.

## Datos

- Entrada: estado actual de los ficheros y del dominio (404).
- Salida: dominio 200, ficheros alineados, regla y check de gobernanza, checklist de aceptación.

## Supuestos

- El mantenedor controla el DNS y el proyecto de hosting de `designsystem.alexendros.dev` (o puede obtener ese control en el ciclo).
- La versión de Node 24 ya usada en CI y engines es la canónica; no se cambia a 22.
- Source Sans 3 Variable + JetBrains Mono son las fuentes intencionales actuales.
- `Button.astro` ya existe y es la API canónica del design system para botones/CTAs.

## Fuera de alcance

- Implementar componentes de producto nuevos.
- Migrar de framework o de librería de componentes.
- Cambiar catálogo de servicios, precios o copy comercial.
- Ampliar tracking o CMP.
- Reescribir por completo `docs/design/inventario-v1.md`.
- Resolver hallazgos minor no derivados de las cuatro major (salvo que el check de gobernanza los toque de forma inevitable).
- Introducir islas React, CMS o Google Fonts.

## Trazabilidad

| Criterio | Historia |
| -------- | -------- |
| CA-H1    | H1       |
| CA-H2    | H2       |
| CA-H3    | H3       |
| CA-H4    | H4       |
| CA-H5    | H5       |
| CA-H6    | H6       |
