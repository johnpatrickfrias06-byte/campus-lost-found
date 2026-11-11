#!/usr/bin/env bash
# Adds the location permissions the Geolocation plugin needs to the generated Android manifest.
set -euo pipefail
MANIFEST="android/app/src/main/AndroidManifest.xml"
if grep -q "ACCESS_FINE_LOCATION" "$MANIFEST"; then
  echo "Location permissions already present."
  exit 0
fi
sed -i 's#</manifest>#    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n</manifest>#' "$MANIFEST"
echo "Location permissions added."
