# Decisions log

## 2026-11-07 — Intake

- **Señal:** intake suficiente
- **Decisión:** Brief aceptado. Perímetro = 4 inconsistencias major; recuperar/desplegar designsystem.alexendros.dev; sin límite de PRs (calidad primero); criterio de hecho = CI verde + checklist humano en docs/plans/.
- **Archivo tocado:** brief.md

## 2026-11-07 — Contraste

- **Señal:** contraste suficiente
- **Decisión:** Research aceptado. No cambio de stack. Patrones de vitrina ligera, alineación Node y componentes DS vs utilidades validados.
- **Archivo tocado:** research.md

## 2026-11-07 — Opciones

- **Señal:** elijo B (usuario escribió «B»)
- **Decisión:** Se adopta la Opción B — Vitrina rica + gobernanza de componentes. Incluye vitrina con stories/live components, regla documental y check para evitar clases btn directas en Hero/CTAs de conversión, correcciones de Node y tipografía, checklist de aceptación.
- **Archivo tocado:** options.md

## 2026-11-07 — Spec

- **Señal:** spec suficiente
- **Decisión:** Spec aceptada. Historias H1–H6, reglas R1–R8 y criterios CA-H1–CA-H6 quedan como contrato de qué y por qué.
- **Archivo tocado:** spec.md

## 2026-11-07 — Diseño

- **Señal:** diseño suficiente (usuario: «diseño suficiente» / «diseño suficiente»)
- **Decisión:** Design aceptado. MADR-1 (vitrina) y MADR-2 (gobernanza) quedan firmes. Orden de migración del design.md es la referencia de dependencias.
- **Archivo tocado:** design.md

## 2026-11-07 — T-07 dominio

- **Señal:** `add_project_domain` OK; `verified: true` en proyecto `alexendros-dev`
- **Decisión:** No degradación. Subdominio `designsystem.alexendros.dev` ligado al mismo Hobby; rewrite `/` → `/design-system/`; 308 apex condicionado a host `alexendros.dev`. Confirmación de contenido de vitrina tras deploy Production.
- **Archivo tocado:** vercel.json; checklist PLAN-PLATFORM-COHERENCE-CLOSURE.md
