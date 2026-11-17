# Encargados del tratamiento

Fuente canónica en código: [`src/content/processors.ts`](../../src/content/processors.ts)
(decisión 0035). La página `/privacidad/` y la allowlist CSP se generan desde ahí.

| Encargado                                       | Función                                    | Estado                     |
| ----------------------------------------------- | ------------------------------------------ | -------------------------- |
| Vercel                                          | Alojamiento y funciones serverless         | Activo                     |
| Proton Mail                                     | Buzón de contacto                          | Activo                     |
| Upstash (Frankfurt)                             | Rate limit e idempotencia (sin el mensaje) | Activo                     |
| Vercel Analytics                                | Medición agregada tras consentimiento      | Activo (solo build Vercel) |
| Vercel Speed Insights                           | Core Web Vitals tras consentimiento        | Activo (solo build Vercel) |
| Notion                                          | CRM de leads                               | Retirado (0034/0035)       |
| Cloudflare Turnstile                            | Captcha                                    | Retirado (0034/0035)       |
| GA4 / GTM / Meta / Clarity / PostHog / LinkedIn | Medición comercial                         | Retirado (0035)            |

No reintroducir variables `PUBLIC_GA4_*`, `META_*` ni similares sin una decisión nueva.
