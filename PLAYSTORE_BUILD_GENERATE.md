# Daymark — Play Store Build & APK Generation Guide

This guide contains step-by-step instructions for building the signed production **.aab** (for Google Play) and generating the installable **.apk** on Windows (PowerShell).

---

## 1. App Version Incremented

- **`package.json`**: bumped to `1.0.1`
- **`android/app/build.gradle`**:
  - `versionCode`: `2` (was `1`)
  - `versionName`: `"1.0.1"` (was `"1.0.0"`)

---

## 2. Prepare Web Bundle & Sync Android

From the **project root**:

```powershell
# Build web assets and sync to native Android project
npm run build
npx cap sync android
```

---

## 3. Generate Play Store Ready `.aab` (Android App Bundle)

From the project root:

```powershell
# Set Android SDK path (if not already in local.properties)
$env:ANDROID_HOME = "C:\Android"

# Build the signed release .AAB
cd android
.\gradlew.bat bundleRelease
```

- **Output `.aab` location:**  
  `android/app/build/outputs/bundle/release/app-release.aab`
- **Signing:**  
  Automatically signed with `daymark-release.jks` configured in `android/keystore.properties`. Upload this file to the Google Play Console!

---

## 4. Generate Installable `.apk` for Direct Testing

### Option A: Direct Signed Universal APK via Gradle (Recommended & Easiest)

Gradle can compile and sign the universal `.apk` directly without needing extra tools:

```powershell
cd android
.\gradlew.bat assembleRelease
```

- **Output `.apk` location:**  
  `android/app/build/outputs/apk/release/app-release.apk`
- Ready to transfer to any phone or install via ADB:
  ```powershell
  adb install -r android/app/build/outputs/apk/release/app-release.apk
  ```

---

### Option B: Using Google's `bundletool` (from the `.aab`)

Using the bundletool located at `C:\Android\bundletool-all-1.18.3.jar`:

From the **project root** (`c:\Users\Sourabh K\Documents\Date Count\Count-Date-`):

```powershell
# 1. Clean previous artifacts if needed
Remove-Item -Force -Recurse -ErrorAction SilentlyContinue app-release.apks, app-release.zip, extracted_apk

# 2. Generate universal .apks archive from the .aab (--overwrite allows re-running anytime)
java -jar "C:\Android\bundletool-all-1.18.3.jar" build-apks `
  --bundle=android/app/build/outputs/bundle/release/app-release.aab `
  --output=app-release.apks `
  --mode=universal `
  --overwrite `
  --ks=daymark-release.jks `
  --ks-pass=pass:Daymark@2026 `
  --ks-key-alias=daymark `
  --key-pass=pass:Daymark@2026

# 3. Extract universal.apk from the .apks archive
Copy-Item app-release.apks app-release.zip -Force
Expand-Archive app-release.zip -DestinationPath ./extracted_apk -Force
```

- **Extracted `.apk`:**  
  `extracted_apk/universal.apk`


  ```powershell
  java -jar "C:\Android\bundletool-all-1.18.3.jar" build-apks `
  --bundle=android/app/build/outputs/bundle/release/app-release.aab `
  --output=app-release.apks `
  --mode=universal `
  --overwrite `
  --ks=daymark-release.jks `
  --ks-pass=pass:Daymark@2026 `
  --ks-key-alias=daymark `
  --key-pass=pass:Daymark@2026

Copy-Item app-release.apks app-release.zip -Force
Expand-Archive app-release.zip -DestinationPath ./extracted_apk -Force
```