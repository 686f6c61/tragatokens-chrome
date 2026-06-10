#!/usr/bin/env bash
# Empaqueta la extensión en dist/quematokens-<version>.zip con solo los
# ficheros de runtime (lo que Chrome necesita, nada de tests ni docs).
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
version="$(python3 -c "import json; print(json.load(open('$raiz/manifest.json'))['version'])" 2>/dev/null \
  || grep -oP '"version":\s*"\K[^"]+' "$raiz/manifest.json")"
destino="$raiz/dist/quematokens-$version.zip"

mkdir -p "$raiz/dist"
rm -f "$destino"

cd "$raiz"
zip -q "$destino" \
  manifest.json \
  popup.html popup.css popup.js \
  logic.js simbolos.js sound.js \
  icons/icon16.png icons/icon48.png icons/icon128.png \
  img/*.png

echo "[OK] $destino"

# Deja también la carpeta descomprimida lista para "Cargar descomprimida".
descomprimida="$raiz/dist/quematokens"
rm -rf "$descomprimida"
unzip -q "$destino" -d "$descomprimida"
echo "[OK] $descomprimida (para cargar descomprimida en chrome://extensions)"
