#!/bin/bash
set -euo pipefail

APP_FILE="app.js"
SW_FILE="sw.js"
VERSION_FILE="version.js"

LINE=$(grep -n "^const APP_VERSION" "$APP_FILE" | head -1 | cut -d: -f1)
[ -z "$LINE" ] && { echo "❌ APP_VERSION not found"; exit 1; }

OLD=$(sed -n "${LINE}p" "$APP_FILE")
MAJOR=$(echo "$OLD" | sed -E "s/.*'v([0-9]+)\.([0-9]+).*/\1/")
MINOR=$(echo "$OLD" | sed -E "s/.*'v([0-9]+)\.([0-9]+).*/\2/")
[ -z "$MAJOR" ] || [ -z "$MINOR" ] && { echo "❌ parse fail: $OLD"; exit 1; }

NEW_MINOR=$((MINOR + 1))
TODAY=$(date +%Y-%m-%d)
SUFFIX=$(echo "$OLD" | sed -E "s/.*[0-9]{4}-[0-9]{2}-[0-9]{2}//; s/'$//")

echo "const APP_VERSION = 'v${MAJOR}.${NEW_MINOR} · ${TODAY}${SUFFIX}'" > /tmp/_new_ver
sed -i "" "${LINE}s/.*/$(cat /tmp/_new_ver)/" "$APP_FILE"
echo "✅ $APP_FILE: v${MAJOR}.${MINOR} → v${MAJOR}.${NEW_MINOR}"

# sw.js CACHE = same minor number
sed -i "" "s/^const CACHE = 'v[0-9]*'/const CACHE = 'v${NEW_MINOR}'/" "$SW_FILE"
echo "✅ $SW_FILE: CACHE = v${NEW_MINOR}"
