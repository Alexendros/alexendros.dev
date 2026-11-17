# Protocolo — Obtener y configurar cada variable de entorno

Objetivo: guiar paso a paso la obtención de **cada** token/credencial que necesita el sitio
(contacto, analítica, CAPI) y su alta en Vercel, sin inventar valores ni filtrar secretos.

## 1. Reglas generales

- **Inventario**: `.env.example` (nombres y descripción) y `src/env.d.ts` (tipos) son la lista
  canónica. Si añades una variable, actualiza **ambos**.
- **Nunca commitear valores**. `.env`, `.env.local` y `.env.*.local` están en `.gitignore`.
- **`PUBLIC_*` = build-time**. Vite las inlinea al compilar: cambiar su valor exige redeploy.
- **El resto = runtime**. Se leen dentro de las Serverless Functions (`POST /api/*`).
- **Entornos Vercel**: alta en `Production`, `Preview` y `Development` salvo que se indique lo
  contrario.
- **Seguridad**: pega los tokens directamente en el dashboard/CLI, nunca en un issue, PR o chat.

## 2. Alta en Vercel

Dashboard: **Project `alexendros-dev` → Settings → Environment Variables**.

CLI (valor por stdin):

```bash
printf '%s' "$VALUE" | vercel env add SMTP_PASS production
printf '%s' "$VALUE" | vercel env add SMTP_PASS preview "" --value "$VALUE" -y
```

Lote: `ENV_FILE=.env.provision bash scripts/env-push.sh` (nunca re-subas un `.env.local` de
`vercel env pull`: las cifradas llegan como `[SENSITIVE]`).

## 3. Tabla maestra

| Variable                                                          | Obligatoria                 | Ámbito  | Secreto        | Sección                         |
| ----------------------------------------------------------------- | --------------------------- | ------- | -------------- | ------------------------------- |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`             | Sí (contacto)               | runtime | Sí (USER/PASS) | [4.1](#41-smtp--proton-mail)    |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`             | Sí (rate limit fail-closed) | runtime | Sí             | [4.2](#42-upstash-redis)        |
| `PUBLIC_COOKIE_CONSENT_VERSION`                                   | Sí (CMP)                    | build   | No             | [4.3](#43-consentimiento-cmp)   |
| `PUBLIC_GA4_ID`                                                   | Opcional                    | build   | No             | [5.1](#51-google-analytics-4)   |
| `PUBLIC_GTM_ID`                                                   | Opcional                    | build   | No             | [5.2](#52-google-tag-manager)   |
| `PUBLIC_META_PIXEL_ID`                                            | Opcional                    | build   | No             | [6.1](#61-meta-pixel-capi)      |
| `META_PIXEL_ID` / `META_CAPI_TOKEN` / `META_CAPI_TEST_EVENT_CODE` | Opcional                    | runtime | Sí (TOKEN)     | [6.1](#61-meta-pixel-capi)      |
| `PUBLIC_CLARITY_ID`                                               | Opcional                    | build   | No             | [5.3](#53-microsoft-clarity)    |
| `PUBLIC_POSTHOG_KEY` / `PUBLIC_POSTHOG_HOST`                      | Opcional                    | build   | No             | [5.4](#54-posthog-eu)           |
| `PUBLIC_LINKEDIN_PARTNER_ID`                                      | Opcional                    | build   | No             | [6.2](#62-linkedin-insight-tag) |

Retiradas (decisión 0034): `NOTION_*`, `TURNSTILE_*`, `ALERT_WEBHOOK_*`, `CAL_WEBHOOK_SECRET`,
`EMAIL_FROM*`, `UNSUBSCRIBE_SECRET`, `PUBLIC_SITE_URL`, `PUBLIC_GTM_SS_DOMAIN`.

## 4. Contacto y consentimiento

### 4.1 SMTP — Proton Mail

Endpoint: `POST /api/contact`. Plan Proton con SMTP submission; token SMTP de
`operaciones@alexendros.dev` (no Bridge: Bridge no es alcanzable desde Vercel).

- `SMTP_HOST=smtp.protonmail.ch`
- `SMTP_PORT=587`
- `SMTP_USER=operaciones@alexendros.dev`
- `SMTP_PASS=<token SMTP>`

Alta en Production, Preview y Development.

### 4.2 Upstash Redis

Sin estas variables el contacto responde **503 fail-closed**. Rate limit 10/min/IP e
idempotencia. Alta en Production, Preview y Development.

### 4.3 Consentimiento (CMP)

- `PUBLIC_COOKIE_CONSENT_VERSION` (entero). **Increméntalo** cuando cambien categorías o el
  inventario `docs/cookies-inventory.json` (verificado por `pnpm audit:cookies`).
- Valor actual tras decisión 0034: `2`.

## 5. Analítica (client-side, gated por consentimiento)

Sin ID, el loader no carga nada. Tras cambiar `PUBLIC_*`, redeploy.

### 5.1 Google Analytics 4

Measurement ID (`G-…`) → `PUBLIC_GA4_ID`.

### 5.2 Google Tag Manager

Container ID web (`GTM-…`) → `PUBLIC_GTM_ID`. El contenedor **no** debe duplicar GA4, Clarity,
PostHog, Meta ni LinkedIn. No hay GTM server-side en runtime.

### 5.3 Microsoft Clarity

Project ID → `PUBLIC_CLARITY_ID`.

### 5.4 PostHog EU

Project API key (`phc_…`) → `PUBLIC_POSTHOG_KEY`. Host: `https://eu.i.posthog.com`.

## 6. Conversiones server-side

### 6.1 Meta Pixel + CAPI

Loader: `PUBLIC_META_PIXEL_ID`. CAPI: `META_PIXEL_ID` (cae a `PUBLIC_META_PIXEL_ID`) +
`META_CAPI_TOKEN`. Emite `Lead` tras `accepted` **solo** si `consent_v1` incluye `marketing`,
con el mismo `eventId` que el píxel. El checkbox del formulario no autoriza CAPI.

### 6.2 LinkedIn Insight Tag

Partner ID → `PUBLIC_LINKEDIN_PARTNER_ID`.

## 7. Email transaccional (retirado)

Resend / lead magnet / newsletter retirados. Borrar en Vercel si quedan `EMAIL_FROM*`,
`UNSUBSCRIBE_SECRET` o `RESEND_*`.

## 8. Verificación

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -X POST https://alexendros.dev/api/contact \
  -H 'Content-Type: application/json' -d '{}'
```

- 400 = valida body; 503 = falta SMTP/Upstash.
- CMP: sin decisión no hay etiquetas; solo analítica sin publicidad; aceptar todas carga ambas.
- CAPI: con publicidad y token, Events Manager recibe Lead (modo test con
  `META_CAPI_TEST_EVENT_CODE`).

## 9. Rollback

- Quitar `PUBLIC_*` de tracking → loaders inertes.
- Quitar `META_CAPI_TOKEN` → no hay CAPI.
- Quitar `UPSTASH_*` o `SMTP_*` → contacto 503 fail-closed.

## 10. Referencias

- [`.env.example`](../../.env.example) · [`src/env.d.ts`](../../src/env.d.ts)
- Cookies: [`docs/cookies-inventory.json`](../../cookies-inventory.json)
- CI: [`ci-release.md`](ci-release.md)
