# Fix Firebase DynamicLinks Dependency Issue

## Problem
Build fails with: `Missing package product 'FirebaseDynamicLinks'`

Firebase has deprecated Dynamic Links as of August 2024.

## Solution

Remove the FirebaseDynamicLinks package from the Xcode project:

1. **Open the project in Xcode**:
   ```bash
   open "Movie Club Cafe.xcodeproj"
   ```

2. **Select the project** in the navigator (top item)

3. **Select the "Movie Club Cafe" target**

4. **Go to "Frameworks, Libraries, and Embedded Content"** or **"Build Phases" → "Link Binary With Libraries"**

5. **Remove FirebaseDynamicLinks**:
   - Find `FirebaseDynamicLinks` in the list
   - Click the minus (-) button to remove it

6. **Clean build folder**:
   - Press `Cmd + Shift + K`
   - Or: Product → Clean Build Folder

7. **Build the project**:
   - Press `Cmd + B`
   - Or: Product → Build

## Alternative: Command Line Fix

If you need Dynamic Links functionality, consider using [Firebase App Check](https://firebase.google.com/docs/app-check) or custom deep linking.

## Verify Fix

After removing the dependency, the project should build successfully:

```bash
cd "Movie Club Cafe"
xcodebuild -project "Movie Club Cafe.xcodeproj" \
  -scheme "Movie Club Cafe" \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  clean build
```

---

**Note**: This doesn't affect the profile editing feature - it's a separate Firebase dependency issue.

