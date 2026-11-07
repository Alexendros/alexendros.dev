# Design — Platform coherence closure (Opción B)

**Fecha:** 2026-11-07  
**Estado:** IMPLEMENTADO en PR #208 (MADR-1: vitrina = página Astro `/design-system` del mismo repo; sin Storybook ni `design-system-site/`)  
**Spec de referencia:** `spec.md`

## 1. Contexto C4 (solo lo no obvio)

### Personas y sistemas externos

- **Mantenedor / agentes** → escriben y revisan código y docs del repo `Alexendros/alexendros.dev`.
- **Visitantes del sitio comercial** → no interactúan con la vitrina de design system (puede ser noindex o subdominio separado).
- **DNS / hosting de designsystem.alexendros.dev** → sistema externo controlado por el mantenedor (Vercel u otro estático compatible).
- **CI de GitHub Actions** → ejecuta quality, test, build, smoke, e2e-critical y los nuevos/extendidos checks de gobernanza.

### Contenedores que intervienen

1. **Repo principal** (`alexendros.dev`)
   - Contiene componentes (`Button.astro`, etc.), estilos/tokens, `diseno.md`, ARCHITECTURE.md, README, engines, `.nvmrc`, Hero, y el código del check de gobernanza.
2. **Vitrina** (`designsystem.alexendros.dev`)
   - Sitio estático desplegado desde el mismo repo (subpath, proyecto Vercel separado o carpeta `design-system-site/`) que renderiza o embebe stories/live de tokens + Button + Link + shells.
3. **CI**
   - Orquesta los gates existentes + el check de clases de botón en superficies protegidas.

No se añaden contenedores de backend, bases de datos ni servicios de terceros nuevos.

## 2. Componentes y piezas no obvias

### 2.1 Vitrina rica

- **Decisión MADR-1**
  - **Problema:** El dominio externo debe mostrar el design system real, no un placeholder.
  - **Fuerzas:** Stack Astro existente, sin islas React, coste de mantenimiento bajo, necesidad de live/rendered.
  - **Opciones:** (a) Página Astro estática dentro del mismo deploy con rewrite de dominio; (b) sub-proyecto Astro mínimo desplegado en el subdominio; (c) Storybook completo.
  - **Resultado:** Preferir (b) o (a) con stories/MDX o páginas Astro que importen los componentes reales del monorepo/paquete compartido. Storybook completo solo si el coste de (a)/(b) resulta insuficiente para mostrar estados.
  - **Consecuencias:** La vitrina debe poder reconstruirse desde el mismo commit que el sitio principal.
  - **Confirmación:** CA-H1.

### 2.2 Gobernanza de Button / clases btn

- **Decisión MADR-2**
  - **Problema:** Evitar reintroducción de `btn btn-primary` etc. en Hero y CTAs de conversión.
  - **Fuerzas:** Ya existe `check:classes`; e2e de Hero; no se desea nueva dependencia pesada.
  - **Opciones:** (a) Extender `check:classes` o script de lint de clases prohibidas en rutas/superficies listadas; (b) test e2e que falle si el DOM del Hero contiene esas clases; (c) solo regla documental.
  - **Resultado:** Combinación de (a) o (b) + regla en `diseno.md`. El check debe ser ejecutable en el job `quality` o en e2e-critical.
  - **Consecuencias:** Lista blanca de excepciones documentadas si alguna superficie legítima las necesita.
  - **Confirmación:** CA-H3.

### 2.3 Correcciones documentales

- Node: actualizar README para que coincida con engines / `.nvmrc` (24).
- Tipografía: reescribir la sección de ARCHITECTURE.md para Source Sans 3 Variable + JetBrains Mono.
- No se modifican tokens ni `@fontsource` salvo que se descubra inconsistencia adicional durante la implementación (fuera del perímetro si no afecta a las major).

### 2.4 Checklist de aceptación

- Fichero Markdown en `docs/plans/` (nombre sugerido: `PLAN-PLATFORM-COHERENCE-CLOSURE.md` o similar) que liste los 4+ ítems (vitrina, Hero/Button, Node, tipografía, gobernanza) con comando/URL/fichero de verificación.

## 3. Datos y contratos

- **Entrada:** Ficheros actuales (Hero.astro, ARCHITECTURE.md, README, diseno.md, package.json, .nvmrc) y estado 404 del dominio.
- **Salida:**
  - Dominio 200 con contenido de DS.
  - Hero usando Button.astro.
  - Regla escrita + check automatizado.
  - Documentos alineados.
  - Checklist legible.
- **Contrato del check de gobernanza:** exit code ≠ 0 si se detectan clases prohibidas en superficies listadas; mensaje de error localizable.

## 4. Errores y degradación

- Si el deploy de la vitrina falla (DNS, credenciales, cuota Hobby): el checklist lo marca como bloqueante; no se considera cerrado el SDD.
- Si el check de clases produce falsos positivos: se documenta lista blanca explícita en el contrato y en el propio check.
- Fallos de CI existentes (contrast, typecheck, e2e) siguen siendo bloqueantes; no se relajan.

## 5. Seguridad

- Sin cambios de superficie de ataque.
- La vitrina puede ser pública; si contiene solo tokens y componentes de presentación no introduce secretos.
- No se modifican handlers de contacto, rate-limit ni consent.

## 6. Observabilidad y pruebas

- **Pruebas existentes a mantener en verde:** typecheck, lint, lint:css, check:contrast, check:classes (extendido), test, build, smoke, e2e-critical (especialmente hero-home y relacionados).
- **Nuevas/extendidas:**
  - Check de clases de botón en Hero/CTAs.
  - (Opcional) smoke o e2e que visite la vitrina y verifique status 200 + presencia de un marcador de contenido de DS.
- **Verificación humana:** checklist en `docs/plans/`.

## 7. Migración / orden sugerido de trabajo (sin implementar)

1. Alinear Node y tipografía (cambios documentales de bajo riesgo).
2. Sustituir CTAs del Hero por Button.astro + actualizar e2e si hace falta.
3. Escribir regla en diseno.md + implementar/extender el check de gobernanza.
4. Construir y desplegar la vitrina; apuntar DNS.
5. Escribir y ejecutar el checklist de aceptación.
6. PR(s) en borrador desde rama `cursor/…` según AGENTS.md.

## 8. Riesgos abiertos

| Riesgo                                                                                    | Mitigación                                                                                        |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Control de DNS / proyecto Vercel de designsystem.alexendros.dev no disponible en el ciclo | Checklist lo marca bloqueante; se puede abrir decisión para degradar a vitrina interna + redirect |
| Falsos positivos del check de clases                                                      | Lista blanca documentada                                                                          |
| Storybook o tooling de stories añade dependencia no deseada                               | Preferir páginas Astro que importen componentes reales antes que Storybook completo               |
| Peso de JS en Hero al pasar a Button.astro                                                | Medir LCP/JS; Button debe seguir siendo ligero (vanilla / Astro)                                  |

## 9. Decisiones MADR resumidas

- **MADR-1 (Vitrina):** Sitio estático Astro (mismo repo o sub-proyecto) con componentes reales; Storybook solo si es necesario para estados interactivos.
- **MADR-2 (Gobernanza):** Regla en diseno.md + check automatizado (extensión de check:classes o e2e) sobre superficies de conversión.
