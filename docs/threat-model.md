# Modelo de amenazas de alexendros.dev

**Versión**: 1.4 | **Fecha**: 2026-11-26 | **Autor**: Alexendros
**Metodología**: STRIDE + ATT&CK v19 · mapeo OWASP Top 10:2021 | **Revisión**: cada cambio mayor

---

## 1. Activos

| Activo                                         | Tipo          | Criticidad | Descripción                                     |
| ---------------------------------------------- | ------------- | ---------- | ----------------------------------------------- |
| Datos de contacto (correo Proton)              | PII           | Alta       | Nombre, email y mensaje del formulario          |
| Cookies de consentimiento                      | PII (técnica) | Media      | Preferencias CMP v3, cookie `consent_v1`        |
| Vercel Analytics y Speed Insights              | Analítica     | Media      | Métricas tras consentimiento de analítica       |
| Secretos de despliegue (Vercel, Upstash, SMTP) | Credenciales  | Crítica    | Tokens en Vercel/Upstash/Proton; **no en repo** |
| Código fuente y dependencias                   | IP            | Media      | Repo público GitHub                             |

---

## 2. Actores de amenaza

| Actor                                   | Motivación                    | Capacidad                  |
| --------------------------------------- | ----------------------------- | -------------------------- |
| Atacante externo oportunista            | Robo credenciales, defacement | Media (automatizado)       |
| Atacante dirigido (competidor)          | Espionaje, robo leads         | Alta (manual + tools)      |
| Insider malicioso                       | Fuga datos, sabotaje          | Muy alta (acceso legítimo) |
| Dependencia comprometida (supply chain) | RCE, exfiltración             | Variable                   |

---

## 3. Superficie de ataque (STRIDE)

### Formulario de contacto (`/api/contact`)

| STRIDE                     | Amenaza                  | Mitigación actual                        | Gap                          |
| -------------------------- | ------------------------ | ---------------------------------------- | ---------------------------- |
| **S**poofing               | Falsificación remitente  | Honeypot + Zod + rate limit Upstash      | ✅                           |
| **T**ampering              | Inyección en payload     | Zod schema validation                    | ✅                           |
| **R**epudiation            | Negación envío           | Eventos estructurados con ID de petición | Correlación operativa por ID |
| **I**nformation Disclosure | Fuga emails en error     | Respuesta genérica                       | ✅                           |
| **D**enial of Service      | Flood API                | Upstash Ratelimit (10/min/IP)            | ✅                           |
| **E**levation of Privilege | N/A (sin auth)           | —                                        | —                            |
| Inyección SMTP (A03)       | CRLF en `name` → Subject | Zod rechaza CRLF + sanitize asunto       | ✅ (2026-11-17)              |

### Lead magnet / newsletter (retirados)

`/api/lead-magnet`, `/api/newsletter/*` y el doble opt-in Resend se eliminaron del árbol
publicado (PR-E). No hay superficie de amenaza activa; las redirecciones históricas
`/servicios/web-para` siguen apuntando a `/servicios`.

### Frontend estático (Astro + scripts vanilla)

| STRIDE                     | Amenaza                     | Mitigación actual                                     | Gap |
| -------------------------- | --------------------------- | ----------------------------------------------------- | --- |
| **S**poofing               | Clickjacking                | `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'` | ✅  |
| **T**ampering              | Modificación JS en tránsito | HSTS, CSP **impuesta**                                | ✅  |
| **R**epudiation            | —                           | —                                                     | —   |
| **I**nformation Disclosure | Fuga env vars en build      | `.env.local` en .gitignore, Vercel env                | ✅  |
| **D**enial of Service      | —                           | Vercel edge caching                                   | ✅  |
| **E**levation of Privilege | XSS via sinks               | Sin `innerHTML`/`insertAdjacentHTML` detectados       | ✅  |

### CI/CD (GitHub Actions)

| STRIDE                     | Amenaza                         | Mitigación actual                                | Gap                  |
| -------------------------- | ------------------------------- | ------------------------------------------------ | -------------------- |
| **S**poofing               | Commit malicioso                | Branch protection, signed commits (pendiente)    | ❌ Branch protection |
| **T**ampering              | Action comprometida             | Actions fijadas por SHA inmutable (security.yml) | ✅                   |
| **R**epudiation            | —                               | Audit log GitHub                                 | ✅                   |
| **I**nformation Disclosure | Secretos en logs                | Gitleaks en CI + pre-commit Husky                | ✅                   |
| **D**enial of Service      | Workflow infinito               | Concurrency cancel-in-progress                   | ✅                   |
| **E**levation of Privilege | Permisos excesivos GITHUB_TOKEN | `permissions: contents: read`                    | ✅                   |

### Dependencias (npm)

| STRIDE                     | Amenaza               | Mitigación actual                                       | Gap       |
| -------------------------- | --------------------- | ------------------------------------------------------- | --------- |
| **S**poofing               | Typosquatting         | Lockfile versionado. Sin detector automático de nombres | Pendiente |
| **T**ampering              | Paquete malicioso     | `pnpm-lock.yaml` commitado, Renovate                    | ✅        |
| **R**epudiation            | —                     | —                                                       | —         |
| **I**nformation Disclosure | CVE en dependencia    | osv-scanner en CI (security.yml)                        | ✅        |
| **D**enial of Service      | —                     | —                                                       | —         |
| **E**levation of Privilege | Postinstall malicioso | Sin `scripts.postinstall` sospechosos                   | ✅        |

Residuales aceptados del expediente `20261007-085704`, tras los parches de la misma línea. Cada entrada de `osv-scanner.toml` lleva `ignoreUntil` (90 días); al caducar hay que re-triar o retirar la excepción.

- Solo build o CI, fuera del runtime de Vercel: `basic-ftp`, `braces`, `extract-zip`, `sprintf-js`, `postcss-selector-parser`, `tmp`, `uuid`. No hay versión corregida en la misma línea, o el padre no admite el salto. No se fuerza un major. Allowlist en `osv-scanner.toml`.
- `picomatch` 2.3.2 (GHSA-fc5q-39xc-vjpf) vía `astro > unstorage > anymatch` (grafo de producción del framework) y 4.0.7 en toolchain. Sin parche en la misma línea. No entra en la función de contacto. `@astrojs/check` está en `devDependencies` para no declarar highs de type-check como prod. Allowlist con caducidad 2027-02-16.
- `handlebars` (cadena semantic-release / `conventional-changelog-writer`): override `pnpm` a `4.7.10` (cierra GHSA-p8wg-vrv2-v86f y hermanas). Sigue siendo solo toolchain.
- Copia de `vite` que arrastra Vitest: override a `>= 8.2.4` en la línea 8.2 (Astro ya resuelve `8.3.3+`). Cierra las alertas de `launch-editor` embebido.
- Parches de misma línea (2026-10-25): `vitest` ≥5.0.5, `nodemailer` ≥10.1.4, `zod` ≥4.6.6 (directo + override 4.x), `body-parser` 1.20.9, `undici` 6.29.1/7.30.1/8.12.2, `ip-address` 10.7.4, `fast-uri` 3.1.9. Residual `zod` 3.x de Playwright (`chromium-bidi`) en allowlist OSV.
- `http-cache-semantics` residual de toolchain: aceptado si no hay parche en la misma línea.
- `nodemailer` **10.x** (issue #12 cerrado 2026-10-09). El email que va a `replyTo` sigue limitado a 254 caracteres.
- F-003 a F-007 están cerrados en `.gitleaks.toml`: `STORAGE_KEY` de `localStorage` del banner, no una credencial.

---

## 4. Flujos de datos y zonas de confianza

```text
Navegador → Vercel → /api/contact → validación → Upstash (límite e idempotencia) → Proton SMTP
Navegador → Vercel → /api/csp-report → Upstash (límite y agregación) → Proton SMTP (aviso)
Navegador → Vercel Analytics y Speed Insights (build de Vercel y consentimiento de analítica)
```

El servidor valida las entradas del navegador. Vercel ejecuta las funciones y Upstash conserva los límites, estados y contadores. Nodemailer exige transporte cifrado para Proton mediante TLS implícito en el puerto 465 o STARTTLS obligatorio en los demás puertos. Los proveedores declarados y sus finalidades figuran en [el inventario de encargados](compliance/processors.md).

La revisión del 26 de noviembre verificó el código y las pruebas locales. La configuración efectiva de WAF, versiones TLS en el edge, copias de seguridad y retención de proveedores queda pendiente de evidencia operativa fechada.

---

## 5. Matriz de mitigaciones (ATT&CK v19)

| Táctica               | Técnica                            | Mitigación                                    | Estado |
| --------------------- | ---------------------------------- | --------------------------------------------- | ------ |
| **Initial Access**    | T1190 (Exploit Public-Facing App)  | Límite de peticiones y validación de entrada  | ✅     |
| **Initial Access**    | T1195.001 (Supply Chain)           | Lockfile, Renovate, osv-scanner CI            | ✅     |
| **Execution**         | T1059 (Command/Script Interpreter) | Sin `eval`/`exec` detectados, CSP             | ✅     |
| **Credential Access** | T1552.001 (Unsecured Credentials)  | Secret scanning (pre-commit + CI), .gitignore | ✅     |
| **Credential Access** | T1557 (MITM)                       | HSTS y SMTP con TLS obligatorio               | ✅     |
| **Discovery**         | T1083 (File/Directory Discovery)   | Sin directory listing, CSP                    | ✅     |
| **Collection**        | T1005 (Data from Local System)     | No datos sensibles en cliente                 | ✅     |
| **Exfiltration**      | T1041 (Exfil over C2)              | CSP `connect-src` restrictivo                 | ✅     |
| **Impact**            | T1485 (Data Destruction)           | Historial Git para el código                  | ✅     |

---

### Colector CSP (`/api/csp-report`)

| STRIDE                     | Amenaza                     | Mitigación actual                         | Gap             |
| -------------------------- | --------------------------- | ----------------------------------------- | --------------- |
| **D**enial of Service      | Cuerpo enorme / flood       | Tope 16 KiB; sin log del cuerpo oversized | ✅ (2026-11-17) |
| **I**nformation Disclosure | Log de informes de terceros | Solo `console.warn` acotado               | Residual bajo   |

---

## 6. Decisiones de riesgo aceptado

| Riesgo                             | Decisión              | Justificación                                                                                                                                                                                                     | Revisión   |
| ---------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Sin branch protection              | **ACEPTADO temporal** | Requiere admin repo; pendiente configuración manual                                                                                                                                                               | 2026-10-14 |
| Logging estructurado               | **ACEPTADO**          | Vercel Logs + Analytics cubren observabilidad básica                                                                                                                                                              | 2026-11-07 |
| CSP enforce sin `unsafe-inline`    | **MITIGADO**          | Hashes de theme-init y @layer; orígenes solo Vercel Analytics (0035)                                                                                                                                              | 2026-11-17 |
| Scripts terceros sin SRI           | **ACEPTADO**          | Solo `va.vercel-scripts.com` tras consentimiento; SRI en backlog                                                                                                                                                  | 2026-11-17 |
| Resultado SMTP indeterminado       | **RESIDUAL**          | Redis aplica transiciones atómicas. SMTP y Redis son independientes. Durante la vigencia del registro, un lease vencido se trata como resultado indeterminado y bloquea el reenvío automático con la misma clave. | 2026-11-26 |
| Sin check Origin en `/api/contact` | **ACEPTADO**          | JSON + sin CORS; abuso directo mitigado por honeypot + rate limit                                                                                                                                                 | 2026-11-17 |
| Sin captcha en contacto            | **ACEPTADO**          | Decisión 0034/0035: honeypot + Upstash 10/min; sin Turnstile                                                                                                                                                      | 2026-11-17 |

---

## 7. Pruebas de validación

| Prueba                                                    | Frecuencia                  | Responsable |
| --------------------------------------------------------- | --------------------------- | ----------- |
| `security.yml` (gitleaks, osv-scanner, CodeQL, Scorecard) | En cada PR y push a main    | CI          |
| `secops.py audit`                                         | Bajo demanda, no está en CI | Manual      |
| Ejercicio mesa secret-leak                                | Trimestral                  | Alexendros  |
| Revisión threat model                                     | Cambio mayor                | Alexendros  |

---

## 8. Referencias

- OWASP ASVS 5.0 L1/L2
- MITRE ATT&CK v19 (Enterprise)
- NIST SSDF v1.1
- Vercel Security Best Practices
- Astro Security Guide
