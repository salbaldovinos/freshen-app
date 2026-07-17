# Running Freshen Locally

## Prerequisites

- Node.js 20+
- npm 10+
- Xcode 16+ (for iOS simulator)
- Android Studio + Android emulator (for Android)
- Expo CLI (installed via npx, no global install needed)

## Quick start

```bash
# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Start the Expo dev server
npx expo start
```

This opens the Expo CLI menu. From there:

| Key | Action |
|-----|--------|
| `i` | Open in iOS simulator |
| `a` | Open in Android emulator |
| `w` | Open in web browser |
| `r` | Reload the app |
| `j` | Open debugger |

## Running on iOS simulator

```bash
# Option 1: Via Expo Go (quickest, no build required)
npx expo start
# Press 'i' to open in iOS simulator

# Option 2: Development build (needed for native modules like expo-sqlite)
npx expo run:ios
```

**Note:** The app uses `expo-sqlite` which requires a development build — it won't work in Expo Go. Use `npx expo run:ios` for the first run, which builds the native project. Subsequent runs can use `npx expo start` with the dev client.

## Running on Android emulator

```bash
# Start Android emulator first (via Android Studio or command line)
# Then:
npx expo run:android
```

## What to expect on first launch

1. Splash screen shows while fonts load and database migrates
2. Home screen appears with empty state: "No breeding records yet. Tap + to add your first entry."
3. Tap the + FAB (bottom-right) to add your first breeding record
4. The only selectable species is Goat (others show "Coming soon")

## MVP walkthrough

1. **Add a record:** Tap + → fill in animal name, sire (optional), pairing date → Save
2. **View list:** Home screen shows the card with status badge, days bred, due date
3. **Sort:** Tap the sort button (top area) to change sort order
4. **View detail:** Tap a card → see full detail with stats, info, notes
5. **Mark pregnant:** Long-press a card → "Mark pregnant" (or use the button on detail screen)
6. **Log birth:** Long-press → "Log birth" or use the button on the detail screen
7. **Edit:** Long-press → "Edit entry" or tap "Edit" on detail screen
8. **Archive:** Long-press → "Archive" (only if no birth logged)
9. **Delete:** Long-press → "Delete" → confirm
10. **Settings:** Tab bar → Settings (placeholder sections for MVP)

## Common commands

```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx --fix

# Run tests
npx jest

# Run tests with coverage
npx jest --coverage

# Generate DB migration (after schema changes)
npx drizzle-kit generate

# Clear Expo cache (if you see stale builds)
npx expo start --clear
```

## Troubleshooting

**"Unable to resolve module" errors:**
```bash
npx expo start --clear
```

**Database issues (schema out of sync):**
```bash
# Regenerate migrations
npx drizzle-kit generate
# Then rebuild the app
npx expo run:ios
```

**Fonts not rendering:**
Check that all .ttf files exist in `assets/fonts/`. The app stays on the splash screen until fonts load — if it's stuck, check the terminal for font loading errors.

**Build fails on iOS:**
```bash
cd ios && pod install && cd ..
npx expo run:ios
```

---

## App Store Submission (iOS)

### Prerequisites

1. **Apple Developer Account** — $99/year at [developer.apple.com](https://developer.apple.com/programs/)
2. **Xcode** installed with iOS simulator runtime
3. **EAS CLI** — `npm install -g eas-cli` then `eas login`

### One-time setup

1. **Create App Store Connect entry:**
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - My Apps → + → New App
   - Name: "Freshen", Bundle ID: `com.freshenapp.freshen`, SKU: `freshen`

2. **Configure EAS Build:**
   ```bash
   eas build:configure
   ```
   This creates `eas.json` with build profiles.

3. **App icons:**
   - Need a 1024x1024 source icon
   - EAS generates all required sizes automatically

4. **Screenshots needed:**
   - 6.9" (iPhone 16 Pro Max) — required
   - 6.7" (iPhone 15 Plus) — recommended
   - 6.5" (iPhone 14 Plus) — recommended
   - 5.5" (iPhone 8 Plus) — optional
   - 12.9" (iPad Pro) — if supporting iPad

### Build and submit

```bash
# Build for iOS production
eas build --platform ios --profile production

# Submit to App Store (after build completes)
eas submit --platform ios

# Or do both in one command
eas build --platform ios --profile production --auto-submit
```

### Before submitting — checklist

- [ ] App icon (1024x1024) in `assets/images/icon.png`
- [ ] Splash screen asset in `assets/images/splash-icon.png`
- [ ] App Store screenshots (at least 6.9" iPhone)
- [ ] App Store description written
- [ ] Privacy policy live at freshenapp.com/privacy
- [ ] Terms of service live at freshenapp.com/terms
- [ ] iOS privacy labels configured in App Store Connect (what data the app collects)
- [ ] Test on a real device (TestFlight)
- [ ] Version and build number set in `app.json`

### TestFlight (internal testing)

```bash
# Build and upload to TestFlight
eas build --platform ios --profile production
eas submit --platform ios

# Then in App Store Connect:
# TestFlight → Internal Testing → add testers
```

---

## Google Play Submission (Android)

### Prerequisites

1. **Google Play Developer Account** — $25 one-time at [play.google.com/console](https://play.google.com/console)
2. **Android Studio** installed (for local testing, not required for cloud builds)
3. **EAS CLI** — `npm install -g eas-cli` then `eas login`

### One-time setup

1. **Create Google Play Console entry:**
   - Go to [play.google.com/console](https://play.google.com/console)
   - Create app → name: "Freshen", default language: English

2. **Configure EAS Build** (same as iOS if already done):
   ```bash
   eas build:configure
   ```

3. **Upload signing key:**
   - EAS manages this automatically on first build
   - Or use Google Play App Signing (recommended) — EAS uploads to Google automatically

### Build and submit

```bash
# Build for Android production (.aab format)
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android

# Or both at once
eas build --platform android --profile production --auto-submit
```

### Before submitting — checklist

- [ ] App icon (1024x1024, same as iOS)
- [ ] Feature graphic (1024x500) for Play Store listing
- [ ] Screenshots — phone (min 2, recommended 4-8)
- [ ] Screenshots — 7" tablet (if supporting)
- [ ] Screenshots — 10" tablet (if supporting)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Privacy policy URL set in Play Console
- [ ] Data Safety Form completed in Play Console (what data the app collects/shares)
- [ ] Content rating questionnaire completed
- [ ] Target audience and content settings
- [ ] Test on a real Android device or emulator

### Internal testing (recommended before production)

```bash
# Build and submit
eas build --platform android --profile production
eas submit --platform android

# Then in Play Console:
# Testing → Internal testing → create release → add testers
```

---

## Both platforms at once

```bash
# Build both
eas build --platform all --profile production

# Submit both
eas submit --platform all
```

---

## Accounts summary

| Service | Cost | Required for | Link |
|---------|------|-------------|------|
| Apple Developer | $99/year | iOS App Store | [developer.apple.com](https://developer.apple.com/programs/) |
| Google Play Developer | $25 one-time | Google Play Store | [play.google.com/console](https://play.google.com/console) |
| Supabase | Free tier available | Auth, database, storage | [supabase.com](https://supabase.com) |
| RevenueCat | Free to start | In-app purchases (later) | [revenuecat.com](https://www.revenuecat.com) |
| PowerSync | Free tier available | Cloud sync (later) | [powersync.com](https://www.powersync.com) |
| PostHog | Free tier available | Analytics (later) | [posthog.com](https://posthog.com) |

Only Apple Developer + Google Play are needed for launch. The rest can be added post-launch.

---

## Project structure (key files)

```
app/(tabs)/index.tsx     → Home screen (breeding list)
app/(tabs)/add.tsx       → Add/edit breeding
app/(tabs)/settings.tsx  → Settings
app/breeding/[id].tsx    → Breeding detail
app/birth/[breedingId].tsx → Log birth
```

See CLAUDE.md for the full project structure.
