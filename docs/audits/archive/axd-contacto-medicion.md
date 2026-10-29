# Checkpoint — AXD contacto / medición / UI / a11y / SEO / LHCI / SEM

```text
Checkpoint: CP-00…CP-11
Estado: CP-10 en main (merge #123 @ 1194653); CP-11 en rama cursor/cp11-lhci-sem
```

## Paquetes A–D + CP-08/09/10 (merged)

- Lead/consent/contexto/catálogo/portfolio/CMP; matriz UI; teclado menú/axe (PR #121, #122).
- SEO público + edge prod + estabilización foco menú móvil (PR #123).

## CP-10 — SEO público y edge (cerrado)

### Local (preview estático)

| Comprobación                                                 | Resultado |
| ------------------------------------------------------------ | --------- |
| ROUTE-01…04 (previos)                                        | PASS      |
| ROUTE-05 canonical/og:url sin query en `/contacto?…`         | PASS      |
| ROUTE-06 titles únicos + description + H1 (semilla 11 rutas) | PASS      |
| ROUTE-07 robots.txt Allow + Sitemap apex                     | PASS      |

Canonical ya usa solo `pathname` en `Layout.astro` (sin query); sin cambio de código necesario.

### Inventario semilla (build local + apex)

| URL                                   | HTTP | robots  | canonical                  | H1  |
| ------------------------------------- | ---- | ------- | -------------------------- | --- |
| `/`                                   | 200  | index   | apex `/`                   | sí  |
| `/servicios` + 3 fichas               | 200  | index   | path limpio                | sí  |
| `/proyectos`                          | 200  | index   | path limpio                | sí  |
| `/proceso-y-entrega`                  | 200  | index   | path limpio                | sí  |
| `/contacto`                           | 200  | index   | path limpio (ignora query) | sí  |
| `/identidad` `/privacidad` `/cookies` | 200  | index   | path limpio                | sí  |
| `/design-system`                      | 200  | noindex | —                          | sí  |
| slug servicios inexistente            | 404  | —       | —                          | 404 |

### Edge producción (`seo-edge-prod.spec.ts`)

- www → apex 308; todos los redirects de path en `vercel.json` → destino 200 sin bucle (muestreo `:path*` = `web-para/muestra-cp10`).
- Rutas retiradas ausentes del sitemap y del nav de home.

### Defectos de producto

Ninguno detectado en este tramo.

## CP-11 — LHCI ×3 + preparación SEM

### Condiciones de medición (local)

| Parámetro          | Valor                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| Comando            | `pnpm build` → `pnpm lhci` (`lighthouserc.json`, `numberOfRuns: 3`)    |
| Chrome / LHCI      | HeadlessChrome/155; Lighthouse **12.6.1**; formFactor **mobile**       |
| Viewport           | 360×640, DPR 2                                                         |
| Throttling         | RTT 150 ms, throughput ~1,6 Mbps↓, CPU ×4 (preset móvil LH)            |
| Consentimiento     | CMP default-deny (sin aceptar cookies); trackers no esenciales off     |
| Stub trackers      | Build local sin `__IS_VERCEL__`; sin `/_vercel/*` ni píxeles reales    |
| Agregación asserts | Mediana LHCI; umbrales perf≥0,95, a11y/BP/SEO 1, CLS≤0,05, LCP≤2500 ms |

Asserts LHCI: **PASS** (21 runs, 7 URLs × 3). CI LHCI sigue **opt-in** (label `e2e`).

### Mediana y rango por URL (3 runs)

Scores = categoría Lighthouse (0–1). LCP en ms. CLS adimensional.

| URL                             | Perf med (min–max) | A11y | BP  | SEO | CLS med (min–max)   | LCP med (min–max) |
| ------------------------------- | ------------------ | ---- | --- | --- | ------------------- | ----------------- |
| `/`                             | 1,00 (0,99–1,00)   | 1    | 1   | 1   | 0 (0–0)             | 1659 (1656–2108)  |
| `/servicios/`                   | 0,98 (0,98–0,98)   | 1    | 1   | 1   | 0 (0–0)             | 2406 (2405–2407)  |
| `/servicios/informe-comercial/` | 0,99 (0,99–0,99)   | 1    | 1   | 1   | 0 (0–0)             | 2105 (2104–2106)  |
| `/proyectos/`                   | 0,99 (0,98–1,00)   | 1    | 1   | 1   | 0 (0–0)             | 1956 (1880–2262)  |
| `/proyectos/front-valencia/`    | 0,98 (0,98–0,98)   | 1    | 1   | 1   | 0 (0–0)             | 2256 (2254–2260)  |
| `/proceso-y-entrega/`           | 0,99 (0,99–0,99)   | 1    | 1   | 1   | 0 (0–0)             | 2106 (2104–2107)  |
| `/contacto/`                    | 0,98 (0,93–0,98)   | 1    | 1   | 1   | 0,028 (0,028–0,028) | 2404 (2323–2406)  |

Nota: un run aislado de `/contacto/` bajó perf a 0,93; la **mediana** (criterio LHCI) cumple ≥0,95. CLS y LCP dentro de umbral en todos los runs. Sin cambio de umbrales ni de oferta.

### Matriz SEM — preparación (sin campañas)

Intenciones hipotéticas; **sin CPC/CPL/ROAS**. GSC/Ads = NOT_VERIFIED. Precios de ficha = provisionales en `pricing.ts`.

| Servicio (landing)                                    | Intención hipotética                        | CTA primario                                                                    | Destino cualificación                               | Precio ficha (prov.)                | Exclusiones clave (ficha)                           | Cruce Cal / form (lectura)                                                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Informe 360º `/servicios/informe-comercial`           | «auditoría web» / priorizar mejoras         | Pedir el informe → `/contacto?…&servicio=informe-comercial`                     | Formulario `#escribir` + oferta form en `/contacto` | 120 €                               | Sin implementación; sin pentest; sin posiciones SEO | Form OK; Cal no aplica                                                                                                                                        |
| Sesión profesional `/servicios/sesion-profesional`    | «consultoría web 1h» / desbloquear decisión | Reservar sesión → `cal.com/alexendros/sesion-tecnica` (nueva pestaña)           | Cal (pago al reservar)                              | 300 € (+ 50 % dto. plan inspección) | Sin implementación; sin auditoría completa          | Cal **descripción pública** dice «Precio 150 €» (lectura 2026-10-17): alinea con el 50 % dto., **no** con el listado 300 € de ficha — cualificar antes de Ads |
| Inspección normativa/vuln. `/servicios/auditoria-…`   | «RGPD web» / vulnerabilidades básicas       | Pedir la inspección → `/contacto?…&servicio=auditoria-normativa-ciberseguridad` | Formulario `/contacto`                              | 200 €                               | Sin pentest; sin certificación; sin remedios        | Form OK; Cal no aplica                                                                                                                                        |
| Portal de inicio (índice `/servicios`, no ficha slug) | «hacer una web» / landing + form            | Pedir una propuesta → `/contacto?motivo=propuestaComercial`                     | Form propuesta comercial                            | Base 495 € (+ módulos)              | Sin CMS gestionado fuera del alcance escrito        | Form OK; Cal no es el destino primario                                                                                                                        |

Cualificación operativa sugerida (prep, no campaña): landing de ficha → CTA → `/contacto` o Cal → confirmar alcance/exclusiones/precio provisional antes de pago o envío. No lanzar Ads hasta alinear copy Cal (150 €) con precio base publicado (300 €) o documentar el 50 % como precio del evento.

## Hallazgos

| ID               | Estado                                                                          |
| ---------------- | ------------------------------------------------------------------------------- |
| AXD-001…012      | corregido en main                                                               |
| CP-08            | PASS                                                                            |
| CP-09            | PASS parcial (SR NOT_VERIFIED)                                                  |
| CP-10            | PASS (GSC NOT_VERIFIED)                                                         |
| CP-11 LHCI / SEM | PASS (Ads/GSC/CPC NOT_VERIFIED; desalineación Cal 150 € vs ficha 300 € anotada) |

## NOT_VERIFIED

SMTP real, SDK Clarity/LinkedIn opt-out real, GTM export, lector de pantalla, Search Console (rankings/tráfico), campañas Ads / CPC / ROAS, alineación operativa precio Cal vs ficha sesión.
