#!/bin/bash
set -euo pipefail

# Bump minor version in app.js + sw.js cache version

APP_FILE="app.js"
SW_FILE="sw.js"

# --- app.js: bump APP_VERSION minor ---
LINE=$(grep -n "^const APP_VERSION" "$APP_FILE" | head -1 | cut -d: -f1)
if [ -z "$LINE" ]; then
  echo "❌ APP_VERSION not found in $APP_FILE"
  exit 1
fi

OLD=$(sed -n "${LINE}p" "$APP_FILE")
# Extract version: v1.4 → major=1, minor=4
MAJOR=$(echo "$OLD" | sed -E "s/.*'v([0-9]+)\.([0-9]+).*/\1/")
MINOR=$(echo "$OLD" | sed -E "s/.*'v([0-9]+)\.([0-9]+).*/\2/")
if [ -z "$MAJOR" ] || [ -z "$MINOR" ]; then
  echo "❌ Could not parse version from: $OLD"
  exit 1
fi

NEW_MINOR=$((MINOR + 1))
TODAY=$(date +%Y-%m-%d)

# Preserve description after the date, strip trailing quote from suffix
SUFFIX=$(echo "$OLD" | sed -E "s/.*[0-9]{4}-[0-9]{2}-[0-9]{2}//; s/'$//")
echo "const APP_VERSION = 'v${MAJOR}.${NEW_MINOR} · ${TODAY}${SUFFIX}'" > /tmp/_new_version_line.txt
NEW_LINE=$(cat /tmp/_new_version_line.txt)
sed -i "" "${LINE}s/.*/${NEW_LINE}/" "$APP_FILE"
echo "✅ $APP_FILE: v${MAJOR}.${MINOR} → v${MAJOR}.${NEW_MINOR} (${TODAY})"

# --- sw.js: bump CACHE version ---
LINE_SW=$(grep -n "^const CACHE" "$SW_FILE" | head -1 | cut -d: -f1)
if [ -z "$LINE_SW" ]; then
  echo "⚠️ CACHE not found in $SW_FILE — skipping"
  exit 0
fi

OLD_SW=$(sed -n "${LINE_SW}p" "$SW_FILE")
CACHE_NUM=$(echo "$OLD_SW" | sed -E "s/.*'v([0-9]+)'.*/\1/")
if [ -z "$CACHE_NUM" ]; then
  echo "⚠️ Could not parse CACHE version — skipping"
  exit 0
fi

NEW_CACHE=$((CACHE_NUM + 1))
NEW_LINE_SW="const CACHE = 'v${NEW_CACHE}'"
sed -i "" "${LINE_SW}s/.*/${NEW_LINE_SW}/" "$SW_FILE"
echo "✅ $SW_FILE: v${CACHE_NUM} → v${NEW_CACHE}"
