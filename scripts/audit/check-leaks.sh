#!/usr/bin/env bash
# Restos de desarrollo en fuentes o en la salida publicada.
# Uso: bash scripts/audit/check-leaks.sh [ruta...]
set -euo pipefail

targets=("$@")
if [ "${#targets[@]}" -eq 0 ]; then
  targets=(src)
  if [ -d .vercel/output/static ]; then
    targets+=(.vercel/output/static)
  fi
fi

pattern='Pendiente de|\bTODO\b|\bFIXME\b|lorem ipsum|scripts/build-|\[object Object\]|>undefined<|>NaN<'
status=0

for target in "${targets[@]}"; do
  [ -e "$target" ] || continue
  if rg -n \
    --glob '!node_modules/**' \
    --glob '!*.map' \
    --glob '!*.pdf' \
    --glob '!*.png' \
    --glob '!*.webp' \
    -e "$pattern" "$target"; then
    echo "✗ restos de desarrollo en $target"
    status=1
  else
    echo "✓ $target limpio"
  fi
done

exit "$status"
