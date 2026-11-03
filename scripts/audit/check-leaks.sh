#!/usr/bin/env bash
# Restos de desarrollo en fuentes o en la salida publicada.
# Uso: bash scripts/audit/check-leaks.sh [ruta...]
set -euo pipefail

command -v rg >/dev/null || { echo "✗ falta rg"; exit 2; }

targets=("$@")
if [ "${#targets[@]}" -eq 0 ]; then
  targets=(src)
  if [ -d .vercel/output/static ]; then
    targets+=(.vercel/output/static)
  fi
fi

pattern='Pendiente de|\bTODO\b|\bFIXME\b|lorem ipsum|scripts/build-|\[object Object\]|>undefined<|>NaN<'

# La búsqueda -i hace que «todo» (palabra común en el copy) case con \bTODO\b.
# Estas líneas legítimas quedan registradas como excepción.
exceptions=(
  'Todo editable desde un panel propio'
  'edita todo desde un panel propio'
  'todo es válido'
)

status=0

for target in "${targets[@]}"; do
  [ -e "$target" ] || continue
  if matches=$(rg -n -i \
    --glob '!node_modules/**' \
    --glob '!*.map' \
    --glob '!*.png' \
    --glob '!*.webp' \
    -e "$pattern" "$target" 2>/dev/null); then
    for exc in "${exceptions[@]}"; do
      matches=$(printf '%s\n' "$matches" | grep -Fv "$exc" || true)
    done
    if [ -n "$matches" ]; then
      printf '%s\n' "$matches"
      echo "✗ restos de desarrollo en $target"
      status=1
    else
      echo "✓ $target limpio"
    fi
  else
    echo "✓ $target limpio"
  fi
done

# PDFs: rg no extrae el texto de forma fiable; se usa pdftotext.
pdf_files=()
while IFS= read -r -d '' f; do
  pdf_files+=("$f")
done < <(find "${targets[@]}" -type f -name '*.pdf' -print0 2>/dev/null || true)

if [ "${#pdf_files[@]}" -gt 0 ]; then
  if ! command -v pdftotext >/dev/null; then
    echo "✗ falta pdftotext (hay PDFs que revisar)"
    exit 2
  fi
  for f in "${pdf_files[@]}"; do
    if pdftotext "$f" - | grep -inE "$pattern"; then
      echo "✗ restos de desarrollo en $f"
      status=1
    else
      echo "✓ $f limpio"
    fi
  done
fi

exit "$status"
