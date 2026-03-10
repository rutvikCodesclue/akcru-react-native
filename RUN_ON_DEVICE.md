# Run the app on your connected device

Dependencies are already installed. Follow the steps below for your device type.

---

## Option A: Android phone/tablet

### 1. Prepare your Android device
- **Enable Developer options**: Settings → About phone → tap "Build number" 7 times.
- **Enable USB debugging**: Settings → Developer options → turn on "USB debugging".
- Connect the device with a USB cable. When prompted on the phone, tap **Allow** for USB debugging.

### 2. Start Metro (JavaScript bundler)
Open a terminal in the project folder and run:
```bash
npm start
```
Leave this terminal open.

### 3. Run the app on the device
Open a **new** terminal in the project folder and run:
```bash
npm run android
```
The app will build and install on your connected Android device.

---

## Option B: iPhone (mac only)

### 1. One-time: Install iOS dependencies (CocoaPods)
If you haven’t already, run from the project folder:
```bash
cd ios && pod install && cd ..
```

### 2. Prepare your iPhone
- Connect the iPhone with a USB cable.
- On the iPhone, tap **Trust** if asked to trust this computer.
- You need **Xcode** installed from the Mac App Store (required for building iOS apps).

### 3. Start Metro
In a terminal in the project folder:
```bash
npm start
```
Leave this terminal open.

### 4. Run the app on the iPhone
In a **new** terminal:
```bash
npx react-native run-ios --device
```
If more than one device is available, you’ll be asked to choose. Pick your iPhone.

**Alternative:** Open `ios/akcruapp.xcworkspace` in Xcode, select your iPhone in the device menu, and press the Run (▶) button.

---

## Quick reference

| Step              | Command |
|-------------------|--------|
| Install deps      | `npm install` (already done) |
| iOS pods          | `cd ios && pod install && cd ..` |
| Start Metro       | `npm start` |
| Run on Android    | `npm run android` (in another terminal) |
| Run on iPhone     | `npx react-native run-ios --device` (in another terminal) |

---

## If something goes wrong

- **“No devices found”**: Check the USB cable and that USB debugging (Android) or Trust (iPhone) is enabled.
- **Metro not connecting**: Ensure the phone and Mac are on the same Wi‑Fi when using a device (optional for USB). For Android over USB, often no extra step is needed.
- **Android**: Install [Android Studio](https://developer.android.com/studio) and the Android SDK if you get SDK/NDK errors.
- **iOS**: Install Xcode from the App Store and run `xcode-select -s /Applications/Xcode.app/Contents/Developer` if Xcode isn’t detected.

### Android emulator: “Requested internal only, but not enough space”

The emulator’s internal storage is full, so the APK can’t be installed. Try one of these:

1. **Wipe the emulator** (frees the most space): Android Studio → **Device Manager** (or **AVD Manager**) → ⋮ next to your emulator → **Wipe Data**. Then run the app again.
2. **Uninstall the app** from the emulator if it’s already installed: on the emulator, long‑press the app icon → Uninstall (or drag to Uninstall).
3. **Use an emulator with more storage**: Device Manager → **Create Device** (or edit existing) → show **Advanced Settings** → set **Internal Storage** to at least **2048 MB** (or more for large apps).
4. **Uninstall other apps** on the emulator to free space, then try installing again.
