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

# La búsqueda -i hace que «todo» (palabra común en el copy) case con \bTODO\b.
# Estas líneas legítimas quedan registradas como excepción, también en el texto
# extraído de los PDF.
exceptions=(
  'Todo editable desde un panel propio'
  'edita todo desde un panel propio'
  'todo es válido'
)

if command -v rg >/dev/null 2>&1; then
  searcher=rg
elif command -v grep >/dev/null 2>&1; then
  searcher=grep
else
  echo "✗ faltan rg y grep"
  exit 2
fi

# Descarta las líneas legítimas registradas en `exceptions`.
filter_exceptions() {
  local out="$1"
  [ -n "$out" ] || return 0
  local exc
  for exc in "${exceptions[@]}"; do
    out=$(printf '%s\n' "$out" | grep -Fv -- "$exc" || true)
  done
  [ -n "$out" ] && printf '%s\n' "$out"
  return 0
}

# Busca restos en el texto de un objetivo. Los PDF quedan fuera aquí: su texto
# solo se extrae con pdftotext.
search_text() {
  local target="$1"
  if [ "$searcher" = rg ]; then
    rg -n -i \
      --glob '!node_modules/**' \
      --glob '!*.map' \
      --glob '!*.png' \
      --glob '!*.webp' \
      --glob '!*.pdf' \
      -e "$pattern" "$target" 2>/dev/null || true
  else
    grep -rniE \
      --exclude-dir=node_modules \
      --exclude='*.map' \
      --exclude='*.png' \
      --exclude='*.webp' \
      --exclude='*.pdf' \
      -e "$pattern" "$target" 2>/dev/null || true
  fi
}

status=0

# pdftotext solo es obligatorio si hay PDF que revisar.
pdf_available=1
if ! command -v pdftotext >/dev/null 2>&1; then
  pdf_available=0
fi

for target in "${targets[@]}"; do
  [ -e "$target" ] || continue

  found=$(filter_exceptions "$(search_text "$target")")

  # PDFs: ni rg ni grep extraen su texto de forma fiable; se usa pdftotext.
  while IFS= read -r -d '' f; do
    if [ "$pdf_available" = 0 ]; then
      if [ "${VERCEL:-}" = '1' ]; then
        echo "⚠ PDF no revisado en Vercel; revisado en CI"
      else
        echo "✗ falta pdftotext (hay PDFs que revisar)"
        exit 2
      fi
      break
    fi
    pdf_hits=$(filter_exceptions "$(pdftotext "$f" - | grep -inE -e "$pattern" || true)")
    if [ -n "$pdf_hits" ]; then
      found="${found:+$found$'\n'}$pdf_hits"
    fi
  done < <(find "$target" -type f -name '*.pdf' -print0 2>/dev/null || true)

  if [ -n "$found" ]; then
    printf '%s\n' "$found"
    echo "✗ restos de desarrollo en $target"
    status=1
  else
    echo "✓ $target limpio"
  fi
done

exit "$status"
