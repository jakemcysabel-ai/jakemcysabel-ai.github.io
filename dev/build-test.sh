#!/usr/bin/env bash
# Genera dev/test-build: una copia de la app que usa el Firebase simulado (dev/mock-firebase)
# en lugar del SDK real, para probar registro/login/datos sin tocar el proyecto de Firebase.
# Se sirve con la configuración "jaycstasks-test" (puerto 5511) de E:\Apps Claude\.claude\launch.json.
set -e
cd "$(dirname "$0")/.."
OUT=dev/test-build
rm -rf "$OUT" && mkdir -p "$OUT/mock"
sed 's#https://www.gstatic.com/firebasejs/[0-9.]*/#./mock/#' index.html > "$OUT/index.html"
cp manifest.json apple-touch-icon.png icon-192.png icon-512.png "$OUT/"
cp dev/mock-firebase/*.js "$OUT/mock/"
echo 'export const firebaseConfig={apiKey:"test-key",projectId:"test"};' > "$OUT/firebase-config.js"
echo "Listo: $OUT"
