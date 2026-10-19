# Daymark — Build & Deploy Guide

End-to-end instructions: from a clean checkout, to a debug build on your phone, to a
signed release uploaded to the Play Store. Also covers how to **bump the version**.

App id: `com.sourabhkulkarni.daymark` · Author: Sourabh Kulkarni

---

## 0. Prerequisites (one-time)

| Tool | Version | Why |
|------|---------|-----|
| **Node.js** | **≥ 22** | The Capacitor 8 CLI refuses to run on older Node |
| **JDK** | **21** | Capacitor 8 compiles Java against 21 (JDK 17 fails: `invalid source release: 21`) |
| **Android SDK** | Platform 36 + build-tools | Compile/target SDK 36 (Android 16) |
| **adb** | any | Install the APK on a device |

On this machine the right toolchain lives here:

```bash
# Node 24 (system Node is 20 — too old for the Capacitor CLI)
export PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH"

# JDK 21
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

# Android SDK (already set on this machine)
export ANDROID_HOME=/usr/lib/android-sdk
```

> Put those three `export` lines in your shell profile (or run them before building)
> so every build uses the correct versions.

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Develop (live reload in the browser)

```bash
npm run dev          # http://localhost:5173
```

Live reload on a real device:

```bash
npx cap run android -l --external
```

---

## 3. Build the web layer + sync to native

Every native build starts here — this compiles the React/Ionic app and copies it into
the Android project.

```bash
npx vite build          # outputs to dist/
npx cap sync android    # copies dist/ -> android + updates native plugins
```

---

## 4. Debug build (for testing on your phone)

```bash
cd android
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew assembleDebug
```

Output:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Install it:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```
(`-r` reinstalls/updates if it's already installed.)

---

## 5. Bump the version (do this before every release)

Two places must agree. Google Play **rejects an upload whose `versionCode` is not higher**
than the last one, so always increment it.

**a) `android/app/build.gradle`**
```gradle
defaultConfig {
    ...
    versionCode 2          // <-- integer, MUST increase every Play upload
    versionName "1.0.1"    // <-- human-readable, shown to users
}
```

**b) `package.json`** (keep it in sync for your own sanity)
```json
"version": "1.0.1"
```

Versioning convention used here: `MAJOR.MINOR.PATCH` for `versionName`, and a simple
monotonically increasing integer for `versionCode` (1, 2, 3, …).

---

## 6. Signing key (ALREADY CONFIGURED ✅)

> **This is already done.** A release keystore and signing config are in place:
> - Keystore: **`daymark-release.jks`** in the **repo root** (git-ignored — keep a safe
>   backup!). It lives at the root, not in `android/`, so it survives if the Android
>   project is ever regenerated.
> - Properties: **`android/keystore.properties`** (alias `daymark`,
>   `storeFile=../daymark-release.jks`, git-ignored)
> - Credentials also recorded in git-ignored **`note.md`** at the repo root.
> - `android/app/build.gradle` already loads them and signs `release` builds.
>
> So you can jump straight to **step 7** to produce signed artifacts. The rest of this
> section is only for reference, or if you ever need to regenerate the key.

Release builds must be signed with **your own** keystore. Create it once and keep it safe
(if you lose it you can't update the app on Play).

```bash
keytool -genkey -v \
  -keystore daymark-release.jks \
  -alias daymark \
  -keyalg RSA -keysize 2048 -validity 10000
```

Store it **outside** the repo (it's git-ignored anyway) and record the passwords in a
password manager.

Then create `android/keystore.properties` (also git-ignored — never commit it):
```properties
storeFile=/absolute/path/to/daymark-release.jks
storePassword=********
keyAlias=daymark
keyPassword=********
```

Wire it into `android/app/build.gradle` (add inside `android { }`):
```gradle
// Load signing config if keystore.properties exists (keeps debug builds working without it)
def keystorePropsFile = rootProject.file("keystore.properties")
def keystoreProps = new Properties()
if (keystorePropsFile.exists()) {
    keystoreProps.load(new FileInputStream(keystorePropsFile))
}

signingConfigs {
    release {
        if (keystorePropsFile.exists()) {
            storeFile file(keystoreProps['storeFile'])
            storePassword keystoreProps['storePassword']
            keyAlias keystoreProps['keyAlias']
            keyPassword keystoreProps['keyPassword']
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false   // set true + tune proguard-rules.pro to shrink
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

---

## 7. Release build

After bumping the version (step 5) and building the web layer (step 3):

**Signed APK** (direct install / sideload distribution):
```bash
cd android
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew assembleRelease
# -> android/app/build/outputs/apk/release/app-release.apk
```

**Android App Bundle** (required format for Google Play):
```bash
cd android
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew bundleRelease
# -> android/app/build/outputs/bundle/release/app-release.aab
```

---

## 8. Deploy

### Option A — Direct / sideload
Share `app-release.apk`. Users enable "install from unknown sources" and tap it, or:
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Option B — Google Play Store
1. Go to the [Play Console](https://play.google.com/console) → create the app
   (package `com.sourabhkulkarni.daymark`).
2. Fill the store listing (title **Daymark**, description, screenshots, icon, feature graphic).
3. **Release → Testing → Internal testing** → *Create new release*.
4. Upload `app-release.aab`.
5. Add release notes, review, and roll out to your testers.
6. When happy, promote the release to **Production**.

> First upload: let Google manage the app-signing key (Play App Signing) and keep your
> upload key (the keystore from step 6) safe — you sign uploads, Google re-signs for users.

---

## 9. One-shot release recipe

```bash
# from the project root
export PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH"
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

# 1. bump versionCode/versionName in android/app/build.gradle + package.json
# 2. build & sync
npm install
npx vite build
npx cap sync android
# 3. signed bundle for Play
cd android && ./gradlew bundleRelease
# -> upload android/app/build/outputs/bundle/release/app-release.aab to Play Console
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `The Capacitor CLI requires NodeJS >=22.0.0` | Use Node ≥ 22 (set the `PATH` export above) |
| `invalid source release: 21` | `JAVA_HOME` points at JDK 17 — set it to JDK 21 |
| `SDK location not found` | Create `android/local.properties` with `sdk.dir=/usr/lib/android-sdk` |
| Play rejects upload: version code already used | Increase `versionCode` (step 5) |
| Release build unsigned / install fails | Complete the signing setup in step 6 |

---

## 10. ⚠️ Pre-publish cleanup (REMOVE SECRETS BEFORE GOING PUBLIC)

While the repo is **private**, the signing material is committed as a backup:
`daymark-release.jks`, `android/keystore.properties`, `note.md`.

**Before making the repo public (or sharing it), you MUST purge these — a plain
delete is not enough, because they remain in git history and stay recoverable.**

1. **Back them up off-device first** (password manager / secure cloud). Losing the
   keystore means you can never update the app on Play again.

2. **Stop tracking + commit the removal:**
   ```bash
   git rm --cached daymark-release.jks android/keystore.properties note.md
   git commit -m "chore: stop tracking signing secrets"
   ```

3. **Rewrite history so they're gone from every past commit:**
   ```bash
   # using git-filter-repo (recommended)
   git filter-repo --invert-paths \
     --path daymark-release.jks \
     --path android/keystore.properties \
     --path note.md
   # …or with BFG:  bfg --delete-files daymark-release.jks ...
   ```

4. **Force-push the cleaned history:**
   ```bash
   git push origin --force --all
   ```

5. Confirm they're gone from history:
   ```bash
   git log --all --oneline -- daymark-release.jks   # should print nothing
   ```

> The files stay in `.gitignore`, so after this cleanup they won't get re-committed.
> An app signing key **cannot be rotated** once the app is live on Play, so never let
> `daymark-release.jks` leak.
