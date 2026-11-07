# Options — Platform coherence closure

**Fecha:** 2026-11-07  
**Brief de referencia:** `brief.md`  
**Research de referencia:** `research.md`

## Contexto de decisión

Hay que cerrar exactamente las cuatro inconsistencias major:

1. `designsystem.alexendros.dev` inexistente (404) y referencias contractuales que apuntan a él.
2. CTAs del Hero con clases daisyUI directas en lugar de `Button.astro`.
3. Node 22 en README vs 24 en engines / `.nvmrc`.
4. Tipografía Inter declarada en ARCHITECTURE.md vs Source Sans 3 Variable real.

Restricciones: stack actual innegociable, recuperar/desplegar la vitrina externa, calidad del contrato prioritaria, checklist humano + CI verde.

## Opción A — Vitrina mínima + correcciones quirúrgicas

**Enfoque**

- Desplegar `designsystem.alexendros.dev` como sitio estático ligero (Astro o página estática generada desde el mismo repo o un sub-proyecto mínimo) que renderice tokens, Button, Link, shells y ejemplos de estados a partir del código real o de copias controladas.
- Sustituir los CTAs del Hero por `Button.astro` (sin excepciones).
- Alinear README, engines y `.nvmrc` a la versión 24 ya usada en CI.
- Corregir ARCHITECTURE.md para nombrar Source Sans 3 Variable + JetBrains Mono.
- Añadir checklist de aceptación en `docs/plans/`.

**Tabla**

| Criterio      | Valoración                                                          |
| ------------- | ------------------------------------------------------------------- |
| Encaje        | Alto — respeta el brief y el stack                                  |
| Complejidad   | Baja-media                                                          |
| Riesgo        | Bajo (cambios acotados, CI ya cubre contraste y componentes)        |
| Mantenimiento | Bajo si la vitrina se genera o se actualiza en el mismo flujo de PR |
| Sacrificio    | Ningún feature nuevo; no se reescribe inventario histórico completo |

## Opción B — Vitrina rica + gobernanza de componentes

**Enfoque**

- Misma base de A, pero la vitrina incluye Storybook (o equivalente) embebido o desplegado en el subdominio, con stories de Button, Link, estados y tokens.
- Introducir una regla o check (`check:classes` o similar) que falle si aparecen `btn btn-primary` / `btn-outline` en superficies de conversión (Hero y CTAs principales) sin pasar por el componente.
- Documentar en `diseno.md` la regla “componentes del DS obligatorios en Hero y CTAs de página”.
- Correcciones documentales de Node y tipografía idénticas a A.
- Checklist + posible ADR corto de gobernanza de componentes.

**Tabla**

| Criterio      | Valoración                                                           |
| ------------- | -------------------------------------------------------------------- |
| Encaje        | Alto — refuerza el contrato a medio plazo                            |
| Complejidad   | Media (Storybook o stories + posible check nuevo)                    |
| Riesgo        | Medio (más superficie de CI y de deploy)                             |
| Mantenimiento | Medio — hay que mantener stories y el check                          |
| Sacrificio    | Más tiempo de ciclo; posible dependencia nueva de tooling de stories |

## Opción C — Solo correcciones documentales y de código; vitrina diferida

**Enfoque**

- Corregir Hero → Button, Node y tipografía de inmediato.
- Actualizar `diseno.md` y la ruta `/design-system` para que dejen de apuntar a un dominio 404 (redirección a documentación interna o mensaje claro de “vitrina en preparación”).
- No desplegar `designsystem.alexendros.dev` en este ciclo.
- Checklist de aceptación limitado a las tres correcciones + el cambio de referencia.

**Tabla**

| Criterio      | Valoración                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Encaje        | Bajo — contradice la decisión 3A del intake (recuperar/desplegar la vitrina)                           |
| Complejidad   | Muy baja                                                                                               |
| Riesgo        | Bajo a corto plazo; alto a medio plazo (la referencia rota sigue existiendo o se debilita el contrato) |
| Mantenimiento | Muy bajo                                                                                               |
| Sacrificio    | Incumple el resultado observable elegido en intake                                                     |

## Recomendación

**Se recomienda la Opción A.**

Razones:

- Cumple de forma directa las cuatro major y la decisión explícita de recuperar la vitrina externa.
- Mantiene complejidad y riesgo bajos, alineados con “calidad del contrato sin límite de PRs pero sin sobreingeniería”.
- No introduce tooling nuevo (Storybook) ni checks adicionales que el brief no exige.
- La Opción B añade valor de gobernanza, pero supera el perímetro de las cuatro major y eleva el coste de mantenimiento sin evidencia de que A sea insuficiente.
- La Opción C incumple el intake (3A) y deja el contrato con una referencia falsa o debilitada.

**Por qué pierden las otras**

- B: sobrepasa el alcance acordado (solo las four major) y añade superficie de mantenimiento no solicitada.
- C: no recupera ni despliega `designsystem.alexendros.dev`; contradice la señal de intake.

## Evidencia que faltaría para cambiar de recomendación

- Si el coste de desplegar cualquier contenido en `designsystem.alexendros.dev` resultara bloqueante (DNS, proyecto Vercel, tiempo), se podría reabrir C con decisión explícita.
- Si se quisiera prevenir reintroducción de `btn` en Hero de forma automática, se podría elevar B en un SDD posterior de gobernanza.
