# Tasks — Platform coherence closure (Opción B)

**Fecha:** 2026-11-07  
**Estado:** DRAFT  
**Spec / Design de referencia:** `spec.md`, `design.md`  
**Regla:** Cada tarea es atómica, verificable sola y no implementa el feature completo. Prohibido “hacer el backend” o equivalentes.

---

## T-01 — Alinear declaración de Node en README

- **Depende de:** ninguna
- **Área:** `README.md`
- **Hecho comprobable:** README declara la misma versión mayor de Node que `package.json` → `engines.node` y `.nvmrc` (24). Diff de versión documentada = 0 entre los tres.
- **No incluye:** cambiar engines ni `.nvmrc`; no tocar CI.

## T-02 — Alinear tipografía en ARCHITECTURE.md

- **Depende de:** ninguna
- **Área:** `ARCHITECTURE.md` (sección de tipografía / stack visual)
- **Hecho comprobable:** El texto nombra Source Sans 3 Variable (y JetBrains Mono si aplica) y no presenta Inter como fuente principal. Coincide con las dependencias `@fontsource-variable/source-sans-3` (u equivalente) y estilos.
- **No incluye:** cambiar fuentes empaquetadas ni tokens de tipografía.

## T-03 — Sustituir CTAs del Hero por Button.astro

- **Depende de:** ninguna (puede ir en paralelo a T-01/T-02)
- **Área:** `src/components/sections/Hero.astro` (y cualquier parcial que renderice los CTAs del Hero)
- **Hecho comprobable:** Los CTAs principales del Hero importan y usan `Button.astro` (o la API canónica del DS). No quedan clases `btn btn-primary`, `btn-outline` o equivalentes directas en esos CTAs. `pnpm` typecheck / lint / e2e de Hero siguen en verde.
- **No incluye:** reescribir otros botones del sitio; no añadir variantes nuevas a Button.

## T-04 — Documentar regla de gobernanza en diseno.md

- **Depende de:** T-03 (para que la regla describa el estado deseado ya aplicado en Hero)
- **Área:** `docs/standards/website/diseno.md`
- **Hecho comprobable:** Existe párrafo o sección explícita que obliga al uso de `Button.astro` (o API canónica) en Hero y CTAs de conversión de página, y prohíbe clases daisyUI de botón directas salvo excepciones listadas.
- **No incluye:** implementar el check automatizado.

## T-05 — Extender o crear check de clases de botón en superficies protegidas

- **Depende de:** T-04 (la regla define qué es “protegido”)
- **Área:** script de `check:classes` existente, o nuevo script invocado desde `package.json` / job `quality`
- **Hecho comprobable:** Ejecutar el check con una clase `btn btn-primary` (o equivalente) reintroducida temporalmente en Hero produce exit code ≠ 0 y mensaje localizable. Sin la clase, exit 0. El check se ejecuta en el pipeline de quality (o e2e-critical si se opta por test DOM).
- **No incluye:** desplegar la vitrina; no ampliar el check a todo el repo salvo superficies listadas.

## T-06 — Construir la vitrina del design system

- **Depende de:** ninguna crítica (puede avanzar en paralelo; idealmente tras T-03 para mostrar Button actualizado)
- **Área:** carpeta o sub-proyecto de la vitrina (p. ej. `design-system-site/` o ruta acordada) + páginas que importen tokens, Button, Link, shells y estados
- **Hecho comprobable:** Build local de la vitrina genera HTML estático que muestra tokens y/o componentes reales del DS. No es un placeholder genérico.
- **No incluye:** apuntar DNS ni deploy a producción del subdominio.

## T-07 — Desplegar y apuntar designsystem.alexendros.dev

- **Depende de:** T-06
- **Área:** proyecto Vercel (u hosting) del subdominio + DNS
- **Hecho comprobable:** `curl -sI https://designsystem.alexendros.dev` (o la URL raíz de la vitrina) devuelve 200. El contenido visible corresponde al build de T-06.
- **No incluye:** cambios en el sitio comercial apex; no modificar consent ni tracking.

## T-08 — Escribir checklist de aceptación

- **Depende de:** T-01 … T-07 (o al menos de los ítems que se den por cerrados)
- **Área:** `docs/plans/` (nombre sugerido: `PLAN-PLATFORM-COHERENCE-CLOSURE.md`)
- **Hecho comprobable:** El fichero lista las inconsistencias major (vitrina, Hero/Button, Node, tipografía) más gobernanza, cada una con prueba observable (comando, URL o fichero). Un revisor humano puede seguir el checklist y marcar ítems.
- **No incluye:** ejecutar el checklist (eso es cierre); no abrir nuevos SDD.

## T-09 — Verificar cierre con CI + checklist

- **Depende de:** T-01 … T-08
- **Área:** CI del repo + checklist humano
- **Hecho comprobable:** Jobs quality / test / build / smoke / e2e-critical relevantes en verde tras los cambios. Checklist de T-08 completado (todas las casillas con evidencia). No quedan 404 en designsystem.alexendros.dev ni drifts de Node/tipografía/Hero.
- **No incluye:** merge a main sin PR en borrador según AGENTS.md; no semantic-release.

---

## Orden de dependencias (resumen)

```
T-01 ──┐
T-02 ──┼── (paralelo documental)
T-03 ──┴── T-04 ── T-05
T-06 ────────────── T-07
         └────────── T-08 ── T-09
```

T-01, T-02, T-03 y T-06 pueden iniciarse en paralelo. T-09 es la única de cierre.

## Fuera de estas tareas

- Implementar componentes de producto nuevos.
- Cambiar catálogo, tracking, CMP, islas React o CMS.
- Resolver hallazgos minor no derivados de las cuatro major.
- Push directo a `main` (usar rama `cursor/…` + PR borrador).
