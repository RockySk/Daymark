# Countdate — Change Log

**Author / Developer:** Sourabh Kulkarni
**Package:** `com.sourabhkulkarni.countdate`
**Version:** 1.0.1 (versionCode 2)
**Feedback / feature requests:** developer.sourabhk@gmail.com
**Built from:** a fresh repository, based on the original `sk5s/countdateapp` native scaffolding.

This document summarises everything that changed in this rebuild so you're good to
go for the next iteration.

---

## 1. New repository & rebrand

- Created a brand-new repo in `countdate/` (fresh git history, **iOS removed** — Android only).
- App identity:
  - `applicationId` → **`com.sourabhkulkarni.countdate`** (`android/app/build.gradle`)
  - Capacitor `appId` updated (`capacitor.config.ts`, `android/.../assets/capacitor.config.json`)
  - `strings.xml` `package_name` updated
  - `package.json`: name `countdate`, version `1.0.0`, **`author: Sourabh Kulkarni`**, new description
- Removed the `@capacitor/ios` dependency and the `ios/` folder.
- Bumped `typescript` to `^5.4.5` (resolves the react-i18next peer-dependency conflict).

## 2. Android version support (Android 6 → 16/17)

- `minSdkVersion` **24 → 23** (Android 6.0) — the lowest Capacitor 8 supports.
  > Note: true Android 5.0 (API 21) is **not** possible on Capacitor 8; 6.0 is the floor.
- `targetSdkVersion` / `compileSdk` **36** (Android 16). Forward-compatible with Android 17.
- `@vitejs/plugin-legacy` already emits legacy JS bundles, so older WebViews are covered.

## 3. The "4-year limit" bug — FIXED

- Old behaviour: the date picker was capped at `currentYear ± 2` (a 4-year window) and
  only widened if you dug into Settings and toggled a hidden "extend mode".
- New behaviour: the picker opens from **1900-01-01 to (current year + 100)** by default.
  No toggle, no wall. (`src/pages/Add.tsx`)
- The obsolete "extend mode" setting and `EXTEND_YEARS` constant were removed.

## 4. Material You (M3) redesign

- Switched Ionic from forced **iOS** mode to **Material** mode (`src/App.tsx`).
- Rewrote `src/theme/variables.css` as a full M3 token system:
  - Material You purple seed (`#6750A4`), tuned light **and** dark palettes.
  - Rounded cards (28dp), pill buttons, M3 segments / chips / searchbar, soft elevation.
- Android brand colors + splash updated to purple (`color.xml`, `capacitor.config`).

## 5. Extensible data architecture (for easy future features)

Everything now goes through a typed data layer in `src/data/` instead of scattered
`Preferences` calls — add a field once and the whole app picks it up.

| File | Purpose |
|------|---------|
| `src/data/types.ts` | `CountdateEvent`, `Category`, `AppSettings` models (all new fields optional) |
| `src/data/eventStore.ts` | CRUD, pinning, reorder, **auto-migration of old saved events** |
| `src/data/categories.ts` | Built-in + custom categories |
| `src/data/dateMath.ts` | Recurrence-aware next-occurrence, day counts, progress |
| `src/data/reminders.ts` | Local-notification scheduling per event |

Old backups keep working: events with only `{id, event_name, date}` are upgraded on read.

## 6. New features

- **Pin / favourite** — pinned events get their own section at the top.
- **Categories** — 6 built-ins (General, Birthday, Anniversary, Travel, Work, Health)
  + **your own custom categories**:
  - Manage screen: **Settings → Categories** (`src/pages/Categories.tsx`)
  - **Inline custom label** right inside the event form — pick "➕ Custom category…",
    type any title (Experience, Exam, Trip…), save, and it's selected immediately.
- **Recurring / anniversary events** — yearly / monthly / weekly. Recurring events roll
  forward to the next occurrence instead of going negative.
- **Reminder notifications** — choose On-the-day / 1d / 3d / 1w / 2w / 1m before; fires at
  9am local. Runtime permission is requested automatically (Android 13+).
- **Richer cards** (`src/components/EventCard.tsx`) — big day count, **progress bar**,
  per-event/category color + emoji icon, target date, recurrence/reminder badges.
- **Sort** — Soonest / Newest / Name. **Search** and **category filter chips** on Home.
- **Days / Weeks / Months** views and relative-time mode retained.
- **Share / Edit / Pin / Delete** via a tap action sheet on each card.

## 7. Screens

| Screen | Status |
|--------|--------|
| `Home` | Rewritten — M3 cards, pinned section, filters, sort, search |
| `Add` (also edit via `/add?id=`) | Rewritten — full rich event form + inline custom category |
| `Edit` | Rewritten — manage list, drag-reorder, pin, edit, delete |
| `Categories` | **New** — view/add/delete categories |
| `Settings` | Rewritten — grouped M3 lists, Categories link, dev tools |
| `About` | Rewritten — **Sourabh Kulkarni** credit + feedback/feature **mailto: developer.sourabhk@gmail.com** |

Removed legacy components: `CountCard(s)`, `CountdownItem`, `EventDetailModal`,
`DescriptionEditor`, `TitleCard`, `CountDownUpSwitcher`, `constants/Constants.ts`.

## 8. Home-screen widget

- Redesigned (`countdate_widget.xml`, `widget_background.xml`): Material You purple
  gradient, 28dp corners, big day number, top-aligned event name, "COUNTDATE" caption.
- Java/IDs unchanged, so the existing widget provider keeps working.

## 9. Feedback routing

- All feedback / bug / feature-request actions in **About** open the mail client to
  **developer.sourabhk@gmail.com** with a prefilled subject + app/version footer.

---

## How to build

```bash
# Web frontend
npm install
npx vite build

# Sync to Android  (Capacitor CLI needs Node >= 22)
PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH" npx cap sync android

# Build the APK  (Capacitor 8 needs JDK 21)
cd android
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew assembleDebug
```

**Output APK:** `android/app/build/outputs/apk/debug/app-debug.apk` (~6.5 MB)

### Toolchain notes (important for next time)
- **Capacitor CLI requires Node ≥ 22** — system Node is 20; use the nvm v24 on this machine.
- **Capacitor 8 compiles with JDK 21** — set `JAVA_HOME` to java-21 (java-17 fails with
  `invalid source release: 21`).

---

## Ideas for the next iteration (not yet done)
- Extra widget sizes (list / multi-event) — the four single-event styles already exist.
- Optional time-of-day on events (currently all-day at 23:59 local).
- Material You **dynamic color** from the device wallpaper (needs a native plugin).
- Translate the new English strings into the other bundled locales (es, de, zh, th).
- Release signing config + `assembleRelease` for a Play-ready build.

---

## 10. Documentation, repo hygiene & publishing

- **README.md** rewritten for this app: feature list, tech stack, Android support range,
  project structure, and full **how-to-run / build / install** instructions.
- **`.gitignore`** rewritten to exclude `node_modules/`, `dist/`, all Android build
  artifacts (`android/build`, `android/app/build`, `.gradle`, `local.properties`),
  `*.apk` / `*.aab` / keystores, logs and editor/OS files.
- Removed a stale `android/app/release/output-metadata.json` left over from the original
  project so only real source is tracked (188 files).
- Initialised the project as a fresh Git repository and pushed it to the owner's remote:
  **https://github.com/SourabhKulkarni19/Date-count.git** with a descriptive initial commit.

---

## 11. App renamed: Countdate → **Daymark**

To avoid a confusing name clash with the original app in the launcher (both showed
"Countdate"), the user-facing app name was changed to **Daymark**.

- Launcher label & activity title: `android/.../values/strings.xml` (`app_name`, `title_activity_main`)
- Capacitor `appName`, splash/notification branding
- In-app title (Home header) and all bundled locales (en, es, de, zh-CN, zh-TW, th)
- About screen header + feedback mail subjects, home-screen widget caption, README
- `package.json` name → `daymark`, description updated

> Unchanged on purpose: the `applicationId` stays **`com.sourabhkulkarni.countdate`** (a
> stable, unique package id — already different from the original app, so the two install
> side by side without conflict), and the internal `CountdateEvent` type / data keys keep
> their names to avoid touching the storage format.

---

## 12. Full build → deploy guide

- Added **[BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md)** documenting the complete pipeline:
  prerequisites/toolchain, dev run, web build + sync, debug APK, **version bumping**
  (`versionCode`/`versionName` + `package.json`), **keystore creation & signing config**,
  **release APK / AAB** (`assembleRelease` / `bundleRelease`), **Play Store deployment**,
  a one-shot release recipe, and a troubleshooting table.
- Linked it from the README.

---

## 13. Removed the original `cyou.sk5s.app.countdate` namespace

The internal Java/Android namespace still carried the original author's id. It is gone now.

- `android/app/build.gradle`: `namespace` → `com.sourabhkulkarni.countdate`
- Moved the Java sources `MainActivity`, `CountdateWidget`, `CountdateWidgetConfig`
  from `…/java/cyou/sk5s/app/countdate/` → `…/java/com/sourabhkulkarni/countdate/`
  and updated their `package` / `import` declarations.
- `countdate_widget_info.xml` `android:configure` updated to the new package.
- Purged every remaining `sk5s` text reference: `index.html` author meta, the dead
  "More sk5s apps" strings in all locale files, the language-credit "by" fields,
  the app-tour wiki link (now points at the new repo), and the store badges in `Share.tsx`.
- `applicationId` stays `com.sourabhkulkarni.countdate` (unchanged, unique).

## 14. Release signing & keystore (Play-ready)

The app is now signed for release.

- **Keystore file (.jks) path:** `daymark-release.jks` — kept in the **repo root**
  (NOT inside `android/`, so it survives if the Android project is regenerated).
- **Signing properties:** `android/keystore.properties`  *(alias `daymark`,
  `storeFile=../daymark-release.jks`)*
- Credentials are also recorded in a git-ignored **`note.md`** at the repo root.
- All three (`*.jks`, `keystore.properties`, `note.md`) are **git-ignored** — never
  committed. Keep `daymark-release.jks` + passwords backed up safely; if you lose them
  you cannot publish updates to the same Play listing.
- `android/app/build.gradle` now loads `keystore.properties` and applies a `release`
  `signingConfig` (falls back to debug signing if the file is absent, so the project
  still builds for anyone without the keystore).

`android/keystore.properties` format:
```properties
storeFile=../daymark-release.jks
storePassword=<your-store-password>
keyAlias=daymark
keyPassword=<your-key-password>
```

Regenerate the keystore (only if you ever need a new one):
```bash
cd android
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 keytool -genkeypair -v \
  -keystore daymark-release.jks -alias daymark \
  -keyalg RSA -keysize 2048 -validity 10000
```

## 15. Recurrence: added **Every hour** and **Every day**

- `Recurrence` type extended to: `none · hourly · daily · weekly · monthly · yearly`
  (`src/data/types.ts`).
- Next-occurrence + progress math handle the hourly/daily steps (`src/data/dateMath.ts`).
- New options exposed in the event form's Repeat selector (`src/pages/Add.tsx`) with
  strings `repeatHourly` / `repeatDaily`.

## 16. Swipe between Upcoming and Past

- Added a left/right swipe gesture on the Home list (via `react-swipeable`) to flip
  between Upcoming and Past — in addition to tapping the segment labels.

## 17. New app icon (not identical to the original)

- Brand-new **Daymark** icon: a white calendar showing **19** on a Material You purple
  gradient — visually distinct from the original teal logo so the two never look alike.
- Adaptive icon background color → `#6750A4`; foreground + legacy launcher/round PNGs
  regenerated for every density; 512×512 store icon + in-app logo refreshed.
- Generator: **`scripts/gen_icon.py`** — run `python3 scripts/gen_icon.py` to rebuild
  (edit `DAY_NUMBER` to change the date shown).

## 18. Own screenshots (replacing the cloned app's)

- Removed the original app's tour images and Play screenshots.
- Generated 5 on-brand **Daymark** phone mockups (Material You, light + dark, real
  sample events) used for both the in-app tour (`public/assets/tour/`) and the Play
  listing (`fastlane/.../phoneScreenshots/`). The tour now shows 5 slides.
- Generator: **`scripts/gen_screenshots.py`** — run `python3 scripts/gen_screenshots.py`.

---

## Build & signing — quick reference

### Windows (PowerShell)

```powershell
# Set Android SDK path (required before every build, or set local.properties once)
$env:ANDROID_HOME = "C:\Android"

# Web build + sync to Android
npm install
npx vite build
npx cap sync android

# Regenerate art (optional)
python scripts/gen_icon.py
python scripts/gen_screenshots.py
python scripts/gen_splash.py

# Build APK / AAB (run from android/)
cd android
.\gradlew.bat assembleRelease    # -> app/build/outputs/apk/release/app-release.apk   (signed)
.\gradlew.bat bundleRelease      # -> app/build/outputs/bundle/release/app-release.aab (signed, for Play)
```

> **Tip:** To avoid setting `$env:ANDROID_HOME` every time, create
> `android/local.properties` with `sdk.dir=C:\\Android` — it persists across sessions.

### Linux / macOS

```bash
# toolchain
export PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH"   # Node >= 22 for Capacitor CLI
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64          # JDK 21 for Capacitor 8

# web -> native
npm install
npx vite build
npx cap sync android

# builds (run from android/)
cd android
./gradlew assembleRelease    # -> app/build/outputs/apk/release/app-release.apk   (signed)
./gradlew bundleRelease      # -> app/build/outputs/bundle/release/app-release.aab (signed, for Play)
```

Signing inputs used by the release builds:
- `daymark-release.jks`  (keystore in **repo root** — git-ignored, keep backed up)
- `android/keystore.properties`  (passwords + alias, `storeFile=../daymark-release.jks` — git-ignored)
- `note.md`  (repo root — full credentials reference, git-ignored)

See **[BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md)** for the full version-bump → release →
Play Store walkthrough.

---

## 19. Keystore relocated to repo root + signing notes

- Moved the keystore out of `android/` to the **repo root** (`daymark-release.jks`) so it
  survives if the Android project is ever regenerated.
- `android/keystore.properties` now uses `storeFile=../daymark-release.jks`; verified the
  release APK still signs as `CN=Sourabh Kulkarni`.
- Added **`note.md`** (repo root) with the keystore path, alias (`daymark`), passwords and
  a copy of `keystore.properties` for recovery.

## 20. ⚠️ TEMPORARY: signing secrets committed to the (private) repo

At the owner's request, the signing material is committed as a **backup while the repo is
private** and is meant to be removed before publishing:

- `daymark-release.jks` · `android/keystore.properties` · `note.md`
  (force-added with `git add -f`; they remain in `.gitignore` so nothing else is committed
  by accident).

> **These must be purged before the repo is ever made public** — and a plain delete is not
> enough because they persist in git history. Follow **BUILD_AND_DEPLOY.md → §10
> "Pre-publish cleanup"** (stop tracking → `git filter-repo` to rewrite history →
> force-push). An app signing key cannot be rotated once published to Play, so it must
> never leak.

- Added **§10 "Pre-publish cleanup"** to BUILD_AND_DEPLOY.md with the exact removal steps.

## 21. Opening-screen branding: Countdate → Daymark

Remaining "Countdate" references in the app launch/opening screens were updated to
**Daymark**:

- `index.html`: `<title>` and `apple-mobile-web-app-title` → **Daymark**
- `public/manifest.json`: `short_name` → **Daymark**, `name` → **Daymark**,
  `theme_color` / `background_color` → `#6750A4` (Material You purple, was old teal
  `#01989f` / black)
- **Splash screen assets regenerated** — all `splash.png` (11 density variants),
  `drawable/icon.png`, and `drawable/branding.png` replaced: old teal Countdate calendar
  → new **purple Daymark "19" calendar** with "Daymark" text on `#6750A4` background.
- Generator: **`scripts/gen_splash.py`** — run `python scripts/gen_splash.py` to rebuild.

## 22. "Experience" feature

New built-in category **Experience** (`🏆`) for tracking time since a past date
(job start, skill learned, etc.).

- `src/data/categories.ts` — added 7th built-in category `{ id: "experience" }`.
- `src/data/dateMath.ts` — added `experienceDuration(from, to)` → `{ years, months, days }`
  using calendar-accurate math (not 365/30 approximation).
- `src/components/EventCard.tsx` — when `categoryId === "experience"`, the card shows
  3 stat blocks (years | months | days) instead of one big number; progress bar hidden.
- `src/pages/Add.tsx` — shows a contextual hint when Experience is selected.
- i18n keys added to `en.json`.

## 23. Full UI redesign — "Frosted Depth" style

Replaced the flat Material You cards and surfaces with a glassmorphism + gradient accent
design language across the entire app.

**Theme (`src/theme/variables.css`):**
- Glass tokens: `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-shadow`
- Page gradient backgrounds (light: `#f8f0ff→#e4ddef`, dark: `#1a1625→#0f0d14`)
- `--accent-gradient` for gradient text on numbers and FAB glow
- Transparent toolbar backgrounds; glass segment controls, searchbar, chips
- Card slide-up entry animation with staggered delay

**Cards (`EventCard.css/tsx`):**
- Removed the left accent bar
- Glass card surface: `backdrop-filter: blur(20px)` + translucent border
- Big count number uses gradient text (`background-clip: text`)
- Larger icon circle (52px) with blurred accent background
- Bolder typography (font-weight 800)
- Staggered `cardSlideUp` entry animation (60ms per card)

**Home (`Home.css/tsx`):**
- Ambient accent orb (blurred purple circle) behind content
- Glass filter chips with glow shadow when active
- Glass segment controls

**Add/Edit form (`Add.css`):**
- Glass form cards with backdrop-filter
- Glass pick-chips and color-dots with glow when selected
- Experience hint banner with tinted glass background

**Settings (`Settings.css`):**
- Glass `ion-list[inset]` containers

## 24. Selectable app themes (6 Material You palettes)

Replaced the old accent color picker with a full **theme selector** in Settings.
Each theme changes the primary color, page gradient, FAB glow, and accent gradient
across both light and dark modes.

| Theme | Emoji | Light gradient | Primary (light) |
|-------|-------|---------------|-----------------|
| Purple Bloom | 💜 | `#f8f0ff → #e4ddef` | `#6750a4` |
| Ocean Teal | 🌊 | `#e6fffe → #c5ede9` | `#006a6a` |
| Sunset Rose | 🌹 | `#fff0f5 → #f2d6e2` | `#b5446e` |
| Forest Green | 🌿 | `#f0f9ec → #d5e8cf` | `#386a20` |
| Midnight Blue | 🌙 | `#edf2ff → #d0dbf2` | `#3558a0` |
| Amber Gold | ✨ | `#fff8eb → #f0e4cc` | `#8b5e00` |

- `src/data/themes.ts` — theme definitions + `applyTheme()` that sets CSS custom properties
- `src/components/ThemeSelectModal.tsx` — 2-column card grid with live gradient previews
- `src/pages/Settings.tsx` — swapped `AccentColorSelectModal` for `ThemeSelectModal`
- `src/App.tsx` — restores saved theme on startup
- Saved to `countdate_app_theme` in Preferences

## 25. Years view + smoother swipe transitions

- Added **Years** as a 4th view option in the bottom segment (Days / Weeks / Months / **Years**)
- Swipe between Upcoming↔Past now has a smooth slide animation (CSS `swipeOutLeft` /
  `swipeOutRight` with cubic-bezier easing) instead of an instant jump
- Swipe threshold increased to 40px to prevent accidental triggers while scrolling
- Emoji icon picker chips in the Add form are now larger (44×44px min, 1.3rem font) for
  easier tapping

## 26. Event detail page

Tapping a card now opens a **full detail view** instead of an action sheet.

- New route `/event?id=` (`src/pages/EventDetail.tsx` + `EventDetail.css`)
- Hero section: large icon, event name, date, pin badge
- Giant gradient count number (4.5rem) with progress bar + percentage
- Breakdown grid: Years / Months / Days / Weeks
- Experience events: 3 glass stat columns
- Info rows: category, recurrence, reminders, description, photos
- **3-dot menu** (top-right `ellipsisVertical`) for Edit / Pin / Share / Delete
  with delete confirmation alert

## 27. Photo support

Events can now have photos attached.

- `CountdateEvent.photos` — optional `string[]` of base64 data URIs
- **Add/Edit form**: photo picker in "More options" accordion — pick from gallery,
  auto-compressed to 800px / JPEG 70%, removable per photo
- **EventCard**: shows a 3-photo thumbnail strip if photos exist
- **EventDetail**: full photo grid (2-column) display

## 28. Font selector (18 fonts, 5 categories)

New **Font** option in Settings → Appearance with live preview cards.

| Category | Fonts |
|----------|-------|
| ಕನ್ನಡ Kannada | Noto Sans Kannada, Noto Serif Kannada, Baloo Tamma 2, Tiro Kannada, Rajdhani |
| Modern | Poppins, Inter, Quicksand, Verdana, Trebuchet MS |
| Classic | Playfair Display, Times New Roman, Georgia, Palatino |
| Handwriting | Dancing Script, Pacifico, Caveat, Comic Sans MS |
| System | System Default |

All fonts loaded via Google Fonts CDN in `index.html`. Font choice saved to
`countdate_app_font` and restored on startup.

## 29. Indian languages + language cleanup

- Removed Chinese (zh-TW, zh-CN) and Thai
- Added **6 Indian languages**: Kannada (ಕನ್ನಡ), Hindi (हिन्दी), Telugu (తెలుగు),
  Tamil (தமிழ்), Marathi (मराठी), Bengali (বাংলা) — all with translated locale files
- Language order: Kannada first, English, Hindi, Telugu, Tamil, Marathi, Bengali,
  German, Spanish

## 30. Miscellaneous fixes

- **Swipe**: left-to-right swipe now works across the full screen (min-height: 100%)
- **About page**: red filled heart icon + "Made with Love By Sourabh Kulkarni
  From Belagavi, Karnataka, India"
- **Text color modal**: removed Chinese characters ("文字顏色"), now shows "Text Color"
- **Tour screenshots**: "Sarah's Birthday" → "Sourabh's Birthday" (regenerated)
- **16 themes** total (10 new): Coral Reef, Lavender Mist, Cherry Red, Slate Grey,
  Peach Blush, Indigo Night, Mint Fresh, Wine Burgundy, Sky Blue, Charcoal Dark

## 31. Multiple widget styles (4 variants)

Users can now choose from **4 widget styles** when adding a Daymark widget:

| Widget | Label | Style |
|--------|-------|-------|
| **Daymark Purple** | Original | Purple gradient, white text |
| **Daymark Minimal** | New | Clean white background, purple accent number |
| **Daymark Dark** | New | Dark M3 surface, lavender accent |
| **Daymark Glass** | New | Semi-transparent overlay, white text with drop shadow |

Each widget is a separate `AppWidgetProvider` in AndroidManifest.xml with its own
layout XML and background drawable. All share the same `CountdateWidgetConfig`
activity for event selection. All resizable and update hourly.

- Java: `MinimalWidget.java`, `DarkWidget.java`, `TransparentWidget.java`
- Layouts: `widget_minimal.xml`, `widget_dark.xml`, `widget_transparent.xml`
- Backgrounds: `widget_bg_minimal.xml`, `widget_bg_dark.xml`, `widget_bg_transparent.xml`
- Widget info: `widget_minimal_info.xml`, `widget_dark_info.xml`, `widget_transparent_info.xml`

## 32. About page — Kannada pride + Karnataka flag

- Added **"ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ - ಸೌರಭ ಕುಲಕರ್ಣಿ"** text below the footer
- Added the **Karnataka state flag** (yellow + red) as `src/assets/karnataka-flag.png`
  displayed below the Kannada text

## 33. Text color — global apply + reset

- Rewrote `TextColorSelectModal.tsx`: colour picker now shows a live preview
  and a prominent **"Save Color"** button that applies the selected colour to
  **all text** across the app (sets `--ion-text-color` + `--ion-color-dark`)
- **"Reset to Default"** button removes the override, returning to the theme's
  default text colour
- Text colour is restored on app startup via `applyTextColor()` in `App.tsx`

## 34. Photo storage — file-based (handles 50MB+ images)

Photos are now saved as **compressed JPEG files** on the device filesystem
(Capacitor Filesystem → app-local `daymark_photos/`) instead of base64 in
SharedPreferences. Only the file path is stored in the event data.

- `src/data/photoStore.ts` — `savePhoto()` compresses to 1200px max / JPEG 75%,
  writes to disk; `loadPhoto()` reads back as data URI; `deletePhoto()` cleans up
- Supports images from **any file manager** (broad `accept` attribute)
- Legacy base64 data URIs (from before this change) are handled transparently

## 35. Experience end date

Experience events can now have an **end date** for completed experiences.

- `CountdateEvent.endDate` — optional ISO-8601 string
- Add form: when Experience category is selected, an "End date (optional)" field appears
- If set, the duration is calculated from start → end (not start → today)
- Cards and detail page show "Ended · [date]" badge

## 36. UI cleanup

- Removed the **icon/emoji picker** field from the Add form (cluttered)
- About page: "From Belagavi, Karnataka, India" on its own centered line

## 37. Fullscreen image viewer with pinch-to-zoom

Tapping a photo in the event detail page opens a **fullscreen image viewer**:

- Dark overlay with the image centered and fit to screen
- **Pinch-to-zoom** on touch (two-finger gesture, 0.5× to 5×)
- **Pan/drag** when zoomed in (single-finger)
- **+/−** zoom buttons at the bottom with percentage display
- Tap outside the image or the **✕** button to close
- Smooth fade-in animation

## 38. Real-time Android widget sync & midnight auto-refresh

- **Unified Widget Engine** (`android/.../WidgetHelper.java`): Centralized calculation across all 4 widget styles (`Daymark Purple`, `Daymark Minimal`, `Daymark Dark`, `Daymark Glass`).
- **Calendar-accurate day counting**: Normalized calendar date comparisons eliminating time-of-day discrepancy bugs.
- **Support for recurrence, multi-day spans & inclusive counts**: Widgets automatically compute recurring events (yearly/monthly/weekly/daily), end date spans, and `+1 day` inclusive settings.
- **Midnight Auto-Refresh (`WidgetAlarmReceiver.java`)**: Exact `AlarmManager` wakeup scheduled at midnight (`00:00:01`) every day, plus system receiver for `DATE_CHANGED`, `TIME_SET`, `TIMEZONE_CHANGED`, `BOOT_COMPLETED`, and `MY_PACKAGE_REPLACED`.
- **Instant In-App Synchronization (`WidgetUpdaterPlugin.java` & `WidgetUpdater.ts`)**: Whenever an event is added, edited, deleted, or pinned in the app, the native widgets update immediately.

## 39. End date & inclusive day count (+1 day) for all events

- **Include End Date toggle**: Available right inside the Date section when creating or editing any event (`src/pages/Add.tsx`). Toggling on reveals an End Date picker with a live span/duration preview badge (e.g. `12 days total`).
- **Include End Day (+1 day inclusive) toggle**: Option to count both the start and end dates in calculations (inclusive calculation).
- **Date Math & Progress** (`src/data/dateMath.ts`): Accurate handling of multi-day ranges, ongoing events (`startDate <= now <= endDate`), countdowns to end dates, and inclusive counts.
- **Card & Detail UI** (`EventCard.tsx`, `EventDetail.tsx`): Displays formatted date ranges (`Oct 5, 2026 – Oct 17, 2026`), ongoing badges (`Ongoing · 12d total`), progress bars, and `+1d inclusive` indicators.

## 40. Generating AAB and converting to APK via bundletool

1. **Build the Release AAB** (from `android/`):
   ```powershell
   .\gradlew.bat bundleRelease
   # Output: android/app/build/outputs/bundle/release/app-release.aab
   ```

2. **Convert .AAB to Universal .APK using Google `bundletool`**:
   Download `bundletool-all.jar` from [Google's bundletool releases](https://github.com/google/bundletool/releases):
   ```powershell
   # Generate universal APKS archive:
   java -jar bundletool.jar build-apks `
     --bundle=app/build/outputs/bundle/release/app-release.aab `
     --output=app-release.apks `
     --mode=universal `
     --ks=../daymark-release.jks `
     --ks-pass=pass:YOUR_KEYSTORE_PASSWORD `
     --ks-key-alias=daymark `
     --key-pass=pass:YOUR_KEY_PASSWORD

   # Extract universal APK from the APKS archive:
   # Rename app-release.apks to app-release.zip and extract universal.apk:
   Copy-Item app-release.apks app-release.zip
   Expand-Archive app-release.zip -DestinationPath ./extracted_apk
   # -> extracted_apk/universal.apk
   ```

   > **Note:** `.\gradlew.bat assembleRelease` also outputs the signed release `.apk` directly to `android/app/build/outputs/apk/release/app-release.apk`.
 
## 41. Widget Customisation: Transparency, Wallpapers, Theme Colours & Duration Display

Applies to **every** Daymark widget (Purple, Minimal, Dark, Glass) — new placements and existing ones (long-press → Reconfigure on launchers that support it).

- **Per-widget opacity / transparency**:
  - Slider 0–100% in the configure screen (`CountdateWidgetConfig`).
  - Saved as `w_opacity_{widgetId}`.
  - Alpha is applied only to the **colour overlay**, so the day count stays readable.
  - Glass widgets default to 50% opacity; others default to 100%.
- **Optional wallpaper**:
  - Gallery picker (`ActivityResultContracts.GetContent`), preview + remove.
  - Image is compressed (max 512px JPEG) and stored as `w_wallpaper_{widgetId}`.
- **Stretch-to-fill scaling**:
  - Wallpaper is **center-cropped** into a rounded bitmap sized to the widget.
  - `onAppWidgetOptionsChanged` rebuilds the bitmap whenever the user resizes/stretches the widget, so the photo fills the new bounds without letterboxing.
- **App theme colours**:
  - Configure step **② Widget Colour**: Default, **Match app theme**, or any of the 16 Daymark palettes (`WidgetThemes.java`, aligned with `src/data/themes.ts`).
  - Saved as `w_color_{widgetId}` (`default` / `app` / theme id).
  - Colour overlay respects the opacity slider (tint a wallpaper, or a solid themed card).
  - Text contrast auto-switches (light vs dark overlay; white text when a photo shows through).
  - Changing the in-app theme refreshes widgets that use **Match app theme** (`ThemeSelectModal` → `refreshNativeWidgets()`).
- **Years + months + days on widgets**:
  - All four styles show a calendar-accurate breakdown (`2y 3m 12d`), dropping zero units (`45d`, `3m 2d`).
  - Caption is `to go` / `ago` / `today!`.
  - Recurrence, end-date spans, and +1 inclusive counting use the same year/month/day math as the in-app Experience duration.
- **Reconfigure & cleanup**:
  - `android:widgetFeatures="reconfigurable"` on all widget providers.
  - Existing event, colour, opacity, and wallpaper are restored when reopening configure.
  - Widget prefs are removed in `onDeleted`.

## 42. App Version Bump (v1.0.1 / versionCode 2) & Production Build Setup

- **Version Increment**:
  - `package.json`: bumped `version` from `1.0.0` → `1.0.1`.
  - `android/app/build.gradle`: `versionCode` bumped from `1` → `2`, `versionName` bumped from `"1.0.0"` → `"1.0.1"`.
- **Play Store Release Bundle (.aab)**:
  - Generate release bundle:
    ```powershell
    npm run build
    npx cap sync android
    cd android
    .\gradlew.bat bundleRelease
    ```
  - Outputs signed release AAB to: `android/app/build/outputs/bundle/release/app-release.aab`
- **Universal Release APK (.apk)**:
  - Assemble directly via Gradle:
    ```powershell
    cd android
    .\gradlew.bat assembleRelease
    ```
    Output: `android/app/build/outputs/apk/release/app-release.apk`
  - Or convert via `bundletool` with signing keystore:
    ```powershell
    java -jar "C:\Android\bundletool-all-1.18.3.jar" build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab --output=app-release.apks --mode=universal --overwrite --ks=daymark-release.jks --ks-pass=pass:Daymark@2026 --ks-key-alias=daymark --key-pass=pass:Daymark@2026
    Copy-Item app-release.apks app-release.zip -Force
    Expand-Archive app-release.zip -DestinationPath ./extracted_apk -Force
    ```
    Output: `extracted_apk/universal.apk`
## 43. Widget Display Unit Customisation (Years, Months, Days, Weeks)

Users can now choose their preferred time unit display when configuring or reconfiguring any Daymark widget:

- **Display Unit Selection (`CountdateWidgetConfig`)**:
  - Added **② Display Unit** radio group with 5 display modes:
    1. **Years, Months & Days**: e.g., `2y 3m 12d` (calendar-accurate breakdown)
    2. **Total Days only**: e.g., `842d`
    3. **Months & Days**: e.g., `27m 12d`
    4. **Years & Days**: e.g., `2y 112d`
    5. **Weeks & Days**: e.g., `120w 2d`
## 44. Live Time Counting & Exact Time Support (App & Widgets)

Live real-time counting down to the exact second for all events (past, present, or upcoming), plus exact hour & minute configuration:

- **Exact Time Option in Event Form (`Add.tsx`)**:
  - Added **Exact time** toggle with an inline time picker (`IonDatetime` in `time` mode).
  - Users can specify exact hours & minutes (defaults to `00:00` or custom time; all-day events still default to `23:59:00`).
  - Supports ISO-8601 formatting with local timezone preservation via `appendLocalTimezone(date, time)`.
- **Live 1-Second Ticking Clock across App**:
  - **`EventCard.tsx`**: Card counts now tick live every second. Added a dedicated live pill badge (`04h 23m 12s`) showing exact hours, minutes, and seconds remaining or elapsed, regardless of whether the event was 4 years ago or 4 years in the future.
  - **`EventDetail.tsx`**: Full detail view features an interactive live ticker (`HHh : MMm : SSs`) and real-time breakdown updating continuously every second.
- **Widgets Time Unit Support (`CountdateWidgetConfig` & `WidgetHelper.java`)**:
  - Added **Days & Time (e.g. 12d 5h 30m)** display mode to the widget configure screen (`radio_unit_time` / `UNIT_TIME`).
  - Native parser reads exact `yyyy-MM-dd'T'HH:mm` timestamps to compute exact hours and minutes on home-screen widgets.

## 45. Widget Configuration Screen Event List Scrolling Fix

- **Nested Scroll Conflict Resolved (`activity_countdate_widget_config.xml` & `CountdateWidgetConfig.java`)**:
  - Previously, a fixed-height `ListView` was placed inside the outer `ScrollView`, causing Android touch event interception issues where events beyond the 3rd or 4th item could not be scrolled into view.
  - Replaced `ListView` with a dynamic `events_container` `LinearLayout` that naturally inflates all stored events.
  - All items (regardless of how many events exist) now render cleanly and scroll smoothly as part of the page's unified `ScrollView`.
  - Added smooth selection highlighting (`0x226750A4`) and dividers between event items.




