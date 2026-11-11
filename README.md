# Campus Lost & Found

A small Ionic (Angular) + Capacitor app for reporting lost and found items on campus.

| Requirement | Implementation |
|---|---|
| Mobile capabilities | **Camera** (item photo), **Geolocation + Leaflet** (pin where the item was lost/found), **Haptics** (vibration feedback) |
| Data operation | Local data management with **Capacitor Preferences** (Create, Read, Update, Delete) |
| Stack | Ionic 8, Angular 20 (standalone components + signals), Capacitor 7, Leaflet 1.9 |

## Run in the browser

```bash
npm install
npm start          # http://localhost:4200
```
Camera and GPS work in a desktop browser too (the browser asks for permission). Map tiles need internet.

## Get the Android APK

**Option A: GitHub Actions (no Android Studio needed)**
1. Push this folder to a GitHub repository (branch `main`).
2. Open the **Actions** tab, then **Build Android APK**, then wait for it to finish (about 5 minutes).
3. Download the `campus-lost-found-apk` artifact, unzip it, and install `app-debug.apk` on an Android phone
   (allow "Install unknown apps" when asked).

**Option B: locally** (needs Node 20+, JDK 21, Android Studio / Android SDK)
```bash
npm install
npm run build
npx cap add android
bash scripts/patch-android-manifest.sh     # adds location permissions
npx cap sync android
cd android && ./gradlew assembleDebug      # APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Using the app
1. Home lists active reports. Search, or filter by **All / Lost / Found / Returned**.
2. Tap **+** to report an item: name, category, photo, location (Use my location, or tap/drag the map), contact.
3. Tap an item to see details, mark it **returned**, or delete it.

No accounts, passwords or API keys are needed. Map tiles come from OpenStreetMap.

## Project structure
```
src/app/
  models/item.model.ts          data types
  services/item.service.ts      CRUD + persistence (Preferences)
  services/feedback.service.ts  toasts + Haptics
  components/map-view.component.ts   reusable Leaflet map
  pages/home | report | detail  the three screens
```

## Configuration
Set the map's starting position to your campus in `src/app/models/map.config.ts`.
