# Checkpoint — AXD contacto / medición / UI / a11y / SEO

```text
Checkpoint: CP-00…CP-10
Estado: CP-08/09 en main (v1.24.11 @ 7b6bd8a); CP-10 en rama cursor/cp10-seo-edge
```

## Paquetes A–D + CP-08/09 (merged)

- Lead/consent/contexto/catálogo/portfolio/CMP; matriz UI; teclado menú/axe (PR #121, #122).

## CP-10 — SEO público y edge (este cierre)

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

## Hallazgos

| ID               | Estado                         |
| ---------------- | ------------------------------ |
| AXD-001…012      | corregido en main              |
| CP-08            | PASS                           |
| CP-09            | PASS parcial (SR NOT_VERIFIED) |
| CP-10            | PASS (GSC NOT_VERIFIED)        |
| CP-11 LHCI / SEM | pendiente                      |

## NOT_VERIFIED

SMTP real, SDK Clarity/LinkedIn opt-out real, GTM export, lector de pantalla, Search Console (rankings/tráfico), Lighthouse ×3, SEM con datos reales.
