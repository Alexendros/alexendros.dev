# Protocolo — Security CI (referencia de flota)

### Propósito de este documento

- **Objetivos:** Documentar el patrón canónico de `.github/workflows/security.yml` de este repo para que otros repositorios lo copien sin inventar jobs ni actions de pago.
- **Estructura:** Principios → jobs (`secrets`, `sca`, `dependency-review`, `sast`, `scorecard`) → Renovate → qué no hacer.
- **Contenido a integrar según contexto:** Copia fragmentos y ajusta el lockfile / lenguaje. No copies husky de otro paquete. No uses `gitleaks-action@v2` en repos de organización (exige licencia).

Fuente de verdad del workflow: [`.github/workflows/security.yml`](../../../.github/workflows/security.yml). Residuales de OSV: [`osv-scanner.toml`](../../../osv-scanner.toml) y [`docs/threat-model.md`](../../threat-model.md). Operación de CI/release: [`ci-release.md`](ci-release.md).

## Principios

1. Actions fijadas por **SHA de 40 hex** con comentario de versión etiquetada.
2. `permissions: contents: read` a nivel de workflow; ampliar solo en el job que lo necesite.
3. **Sin** `continue-on-error` en `secrets` ni `sca`.
4. Los nombres de job `secrets` y `sca` deben coincidir con los required checks del ruleset.
5. Renovate (decisión **0001** en este repo) es el único bot de version-updates; no añadir `dependabot.yml`.

En este repositorio `secrets` y `sca` **ya son required** en el ruleset `main-required-checks` (junto con `build`, `e2e-critical`, `pr-mergeable`, `quality`, `smoke`, `test`).

## Job `secrets` (gitleaks)

Descarga el **binario** oficial de gitleaks (no la action de pago), verifica el checksum SHA-256 del tarball y ejecuta detección con redacción.

```yaml
secrets:
  name: secrets
  runs-on: ubuntu-latest
  timeout-minutes: 10
  steps:
    - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0
      with:
        fetch-depth: 0
        persist-credentials: false
    # Binario gitleaks (no la action de pago). Checksum release v8.30.1.
    - name: gitleaks
      run: |
        set -euo pipefail
        curl -sSfL -o gitleaks.tar.gz https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz
        echo "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb  gitleaks.tar.gz" | sha256sum -c -
        tar -xzf gitleaks.tar.gz gitleaks
        ./gitleaks detect --source . --redact --verbose
```

Notas al copiar:

- Versión documentada: **gitleaks v8.30.1**; checksum `551f6fc8…470eb`.
- `fetch-depth: 0` para historial completo.
- `./gitleaks detect --source . --redact --verbose`.
- No uses `gitleaks-action@v2` en repos de la organización: exige licencia.

## Job `sca` (OSV-Scanner)

Escaneo de dependencias con OSV sobre el árbol del repo y la allowlist en `osv-scanner.toml`.

```yaml
sca:
  name: sca
  runs-on: ubuntu-latest
  timeout-minutes: 15
  steps:
    - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0
      with:
        persist-credentials: false
    - uses: google/osv-scanner-action/osv-scanner-action@19ec1116569a47416e11a45848722b1af31a857b # v1.9.0
      with:
        scan-args: |-
          -r
          --config=osv-scanner.toml
          .
```

Notas al copiar:

- En **este** repo el job `sca` es OSV-Scanner; no ejecuta `pnpm audit` en el mismo workflow.
- La allowlist de `osv-scanner.toml` solo cubre toolchain/CI (ver threat model). No ignorar CVEs de runtime sin triage.
- En otros repos de la flota se puede complementar con auditoría nativa (`pnpm audit --prod --audit-level=high`, `npm audit --omit=dev --audit-level=high`, o `cargo audit` / `cargo deny check advisories`) en el mismo job o en uno hermano, sin `continue-on-error`.

## Job `dependency-review`

Solo en **pull_request** y solo si el repo es **público** (API de Dependency Review).

```yaml
dependency-review:
  name: dependency-review
  if: github.event_name == 'pull_request' && github.event.repository.visibility == 'public'
  runs-on: ubuntu-latest
  timeout-minutes: 10
  permissions:
    contents: read
    pull-requests: write
  steps:
    - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0
      with:
        persist-credentials: false
    - uses: actions/dependency-review-action@3b139cfc5fae8b618d3eae3675e383bb1769c019 # v4.5.0
```

## Job `sast` (CodeQL)

Análisis local de javascript-typescript. `upload: false` porque sin GitHub Advanced Security el upload responde **403**.

```yaml
sast:
  name: sast
  runs-on: ubuntu-latest
  timeout-minutes: 30
  permissions:
    contents: read
    security-events: write
  steps:
    - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0
      with:
        persist-credentials: false
    - uses: github/codeql-action/init@bd726e2a6ef9fb1305ebd28a690e459525916958 # v3.29.1
      with:
        languages: javascript-typescript
    - uses: github/codeql-action/analyze@bd726e2a6ef9fb1305ebd28a690e459525916958 # v3.29.1
      with:
        upload: false
```

## Job `scorecard`

OpenSSF Scorecard solo en repos **públicos** (en privados el `GITHUB_TOKEN` no tiene alcance suficiente para ListCommits).

```yaml
scorecard:
  name: scorecard
  if: github.event.repository.visibility == 'public'
  runs-on: ubuntu-latest
  timeout-minutes: 15
  permissions:
    contents: read
    security-events: write
    id-token: write
  steps:
    - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0
      with:
        persist-credentials: false
    - uses: ossf/scorecard-action@f2ea147fec3c2f0d459703eba7405b5e9bcd8c8f # v2.4.2
      with:
        results_file: results.sarif
        results_format: sarif
        publish_results: false
```

## Disparadores y concurrencia

El workflow se dispara en `pull_request`, `push` a `main` y cron semanal (`17 5 * * 1`). Concurrencia por ref con `cancel-in-progress: true`.

## Renovate

Configuración: [`.github/renovate.json`](../../../.github/renovate.json) (`npm` + `github-actions`, Dependency Dashboard, sin automerge de majors).

Si el JSON valida con `renovate-config-validator` y no aparece el issue «Dependency Dashboard», falta instalar la **App de Renovate** en la cuenta u organización del repo. Eso es tarea de operador (Settings), no de un PR.

## Qué no hacer

- No usar `gitleaks-action@v2` en la flota de organización.
- No añadir `dependabot.yml` de version-updates (Renovate es el único bot).
- No poner `continue-on-error: true` en `secrets` o `sca`.
- No ampliar la allowlist de OSV sin actualizar el threat model.
- No cambiar rulesets, secretos ni Vercel/DNS desde un PR de documentación.
