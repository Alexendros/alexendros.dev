# Protocolo — Variables de entorno

Objetivo: lista canónica de variables del sitio tras la decisión 0035 (medición mínima).

## 1. Reglas

- Inventario: `.env.example` y `src/env.d.ts`.
- Nunca commitear valores. `PUBLIC_*` es build-time; el resto, runtime.
- Alta en Production, Preview y Development salvo indicación contraria.

## 2. Tabla maestra

| Variable                                              | Obligatoria                 | Ámbito  | Secreto        |
| ----------------------------------------------------- | --------------------------- | ------- | -------------- |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Sí (contacto)               | runtime | Sí (USER/PASS) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Sí (rate limit fail-closed) | runtime | Sí             |
| `PUBLIC_COOKIE_CONSENT_VERSION`                       | Sí (CMP)                    | build   | No             |

Valor actual de consentimiento: `3` (categorías `necessary` + `analytics`).

## 3. Contacto

- SMTP Proton: `smtp.protonmail.ch:587`, usuario `operaciones@alexendros.dev`.
- Upstash: rate limit 10/min por IP (`x-real-ip`) e idempotencia. Sin estas vars → 503.
- Sin cabecera `x-real-ip` de plataforma → 503 fail-closed (no se abre un cubo anónimo por petición).

## 4. Medición

Vercel Analytics y Speed Insights no requieren variables propias: se activan con `__IS_VERCEL__`
(build en Vercel) y consentimiento de analítica. No hay `PUBLIC_GA4_*`, Meta, Clarity, PostHog ni
LinkedIn (decisión 0035).

## 5. Retiradas

Decisión 0034/0035: `NOTION_*`, `TURNSTILE_*`, `ALERT_WEBHOOK_*`, `CAL_WEBHOOK_SECRET`,
`EMAIL_FROM*`, `UNSUBSCRIBE_SECRET`, `PUBLIC_SITE_URL`, `PUBLIC_GTM_SS_DOMAIN`, `PUBLIC_GA4_ID`,
`PUBLIC_GTM_ID`, `PUBLIC_META_*`, `META_*`, `PUBLIC_CLARITY_ID`, `PUBLIC_POSTHOG_*`,
`PUBLIC_LINKEDIN_PARTNER_ID`.

## 6. Verificación

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -X POST https://alexendros.dev/api/contact \
  -H 'Content-Type: application/json' -d '{}'
```

- 400 = valida body; 503 = falta SMTP/Upstash.
