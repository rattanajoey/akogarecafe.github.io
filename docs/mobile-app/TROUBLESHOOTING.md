# 🔧 Troubleshooting Guide

## Error: Missing required module 'FirebaseFirestoreInternalWrapper'

This is a common Firebase SDK build issue. Try these solutions in order:

### ✅ Solution 1: Clean Build Folder (Works 90% of the time)

1. In Xcode, go to **Product** → **Clean Build Folder** (or press **⇧⌘K**)
2. Close Xcode completely
3. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
4. Open Xcode again
5. Build and run (⌘R)

### ✅ Solution 2: Re-add Firebase Packages

1. In Xcode, go to your project settings (click the blue project icon at the top)
2. Select your target: "Movie Club Cafe"
3. Go to **"Frameworks, Libraries, and Embedded Content"** section
4. Remove any Firebase entries (click the "-" button)
5. Now re-add Firebase packages:
   - **File** → **Add Packages**
   - URL: `https://github.com/firebase/firebase-ios-sdk`
   - Version: **11.0.0** or later
   - Click **Add Package**
   - Select **ONLY** these two:
     - ✅ **FirebaseFirestore**
     - ✅ **FirebaseFirestoreSwift** (important!)
   - Click **Add Package**

**Note**: Make sure to add **FirebaseFirestoreSwift** as well - this is often missed!

### ✅ Solution 3: Check Package Dependencies

1. In Xcode's left sidebar, look for "Package Dependencies"
2. Make sure you see:
   - Firebase (github.com/firebase/firebase-ios-sdk)
3. Right-click on it → **Update Package**
4. Wait for it to finish
5. Clean build folder again (⇧⌘K)
6. Build (⌘R)

### ✅ Solution 4: Reset Package Cache

In Terminal, navigate to your project folder and run:
```bash
cd "/Users/kavyrattana/Coding/akogarecafe.github.io/Movie Club Cafe"
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf .build
```

Then in Xcode:
1. **File** → **Packages** → **Reset Package Caches**
2. **File** → **Packages** → **Update to Latest Package Versions**
3. Clean build folder (⇧⌘K)
4. Build (⌘R)

### ✅ Solution 5: Update Imports

If the above don't work, update your import statements. Open these files and make sure imports are correct:

**FirebaseConfig.swift:**
```swift
import Foundation
import FirebaseCore
import FirebaseFirestore
```

**MovieClubView.swift:**
```swift
import SwiftUI
import FirebaseFirestore
```

**All View files should have:**
```swift
import SwiftUI
import FirebaseFirestore  // Only if directly using Firestore
```

### ✅ Solution 6: Check Minimum Deployment Target

1. Go to project settings
2. Select your target
3. Under **"General"** → **"Minimum Deployments"**
4. Make sure it's set to **iOS 17.0** or higher
5. Clean and rebuild

### ✅ Solution 7: Verify GoogleService-Info.plist

1. In Xcode, click on `GoogleService-Info.plist`
2. In the right panel (File Inspector), check:
   - ✅ **Target Membership** → Make sure "Movie Club Cafe" is checked
3. If not checked, check it
4. Clean and rebuild

---

## Other Common Errors

### "Firebase not configured" at runtime

**Fix:**
- Make sure `FirebaseConfig.shared.configure()` is called in `Movie_Club_CafeApp.swift` init
- Verify `GoogleService-Info.plist` is in the project and target membership is checked

### "Permission denied" from Firestore

**Fix:**
Update Firebase security rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to monthly selections and pools
    match /MonthlySelections/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    match /GenrePools/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    // Allow authenticated writes to submissions
    match /Submissions/{document=**} {
      allow read: if true;
      allow write: if true; // Add proper auth in production
    }
  }
}
```

### Images not loading from TMDB

**Fix:**
- Check internet connection
- TMDB API key is included by default
- Make sure app has internet permission (should be automatic)

### Simulator issues

**Try:**
- Reset simulator: **Device** → **Erase All Content and Settings**
- Try a different simulator
- Try on a physical device

---

## Still Having Issues?

1. Check Xcode version: Should be 15.0+
2. Check Swift version: Should be 5.9+
3. Try creating a new scheme
4. As a last resort: Create a new project and copy files over

---

## Quick Diagnostic Command

Run this in Terminal to check your setup:
```bash
cd "/Users/kavyrattana/Coding/akogarecafe.github.io/Movie Club Cafe"
xcodebuild -list
```

This will show your schemes and targets.

