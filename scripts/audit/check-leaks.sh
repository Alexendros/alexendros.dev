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

# Restos de desarrollo, en dos grupos:
# - marcadores: se buscan sin -i. Con -i, «\bTODO\b» casa con «método» y «todo»
#   en grep según el locale (en C, «é» no es carácter de palabra) y tumba el
#   deploy de Vercel por copy legítimo.
# - prosa: se busca con -i porque el resto suele aparecer en minúscula.
marker_pattern='\bTODO\b|\bFIXME\b|scripts/build-|\[object Object\]|>undefined<|>NaN<'
prose_pattern='Pendiente de|lorem ipsum'

# Líneas legítimas que casarían con los patrones. Se aplican también al texto
# extraído de los PDF. Añadir aquí solo lo justificado, no para tapar fugas.
exceptions=()

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
  local markers prose
  if [ "$searcher" = rg ]; then
    markers=$(rg -n \
      --glob '!node_modules/**' \
      --glob '!*.map' \
      --glob '!*.png' \
      --glob '!*.webp' \
      --glob '!*.pdf' \
      -e "$marker_pattern" "$target" 2>/dev/null || true)
    prose=$(rg -n -i \
      --glob '!node_modules/**' \
      --glob '!*.map' \
      --glob '!*.png' \
      --glob '!*.webp' \
      --glob '!*.pdf' \
      -e "$prose_pattern" "$target" 2>/dev/null || true)
  else
    markers=$(grep -rnE \
      --exclude-dir=node_modules \
      --exclude='*.map' \
      --exclude='*.png' \
      --exclude='*.webp' \
      --exclude='*.pdf' \
      -e "$marker_pattern" "$target" 2>/dev/null || true)
    prose=$(grep -rniE \
      --exclude-dir=node_modules \
      --exclude='*.map' \
      --exclude='*.png' \
      --exclude='*.webp' \
      --exclude='*.pdf' \
      -e "$prose_pattern" "$target" 2>/dev/null || true)
  fi
  [ -n "$markers" ] && printf '%s\n' "$markers"
  [ -n "$prose" ] && printf '%s\n' "$prose"
  return 0
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
    pdf_hits=$(filter_exceptions "$(pdftotext "$f" - | grep -nE -e "$marker_pattern" || true)")
    pdf_prose=$(filter_exceptions "$(pdftotext "$f" - | grep -niE -e "$prose_pattern" || true)")
    for chunk in "$pdf_hits" "$pdf_prose"; do
      [ -n "$chunk" ] && found="${found:+$found$'\n'}$chunk"
    done
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
