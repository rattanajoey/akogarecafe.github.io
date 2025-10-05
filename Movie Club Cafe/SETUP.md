# Quick Setup Guide

## Step 1: Install Dependencies

1. Open the project in Xcode
2. Go to **File > Add Packages**
3. Add Firebase iOS SDK: `https://github.com/firebase/firebase-ios-sdk`
4. Select these packages:
   - ✅ FirebaseCore
   - ✅ FirebaseFirestore

## Step 2: Configure Firebase

### Option A: GoogleService-Info.plist (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or use the same one as the web version)
3. Click the iOS icon to add an iOS app
4. Download `GoogleService-Info.plist`
5. Drag it into your Xcode project
6. Update `FirebaseConfig.swift` line 16:

```swift
func configure() {
    FirebaseApp.configure()  // Uses GoogleService-Info.plist
}
```

### Option B: Environment Variables

1. In Xcode, go to **Product > Scheme > Edit Scheme**
2. Select **Run** in the left sidebar
3. Go to **Arguments** tab
4. Under **Environment Variables**, add:
   - `FIREBASE_API_KEY` = (from Firebase Console)
   - `FIREBASE_PROJECT_ID` = (from Firebase Console)
   - `FIREBASE_APP_ID` = (from Firebase Console)
   - `FIREBASE_MESSAGING_SENDER_ID` = (from Firebase Console)
   - `FIREBASE_STORAGE_BUCKET` = (from Firebase Console)

The code is already set up to read from these environment variables!

## Step 3: Add TMDB Logo (Optional)

1. Go to `public/logos/tmdb.svg` in your web project
2. Convert to PNG if needed (or use SF Symbol instead)
3. Add to `Assets.xcassets` as "tmdb"
4. Or replace the image reference in `MovieClubView.swift` with an SF Symbol

## Step 4: Configure Info.plist

Add these keys to your `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>themoviedb.org</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

## Step 5: Run the App!

1. Select a simulator or device
2. Press **⌘ + R** to build and run
3. The app will connect to the same Firebase database as your web version

## Troubleshooting

### Firebase not connecting
- Check that your Firebase configuration is correct
- Make sure Firestore is enabled in Firebase Console
- Verify your Firebase rules allow read access

### TMDB images not loading
- The default API key is included in `TMDBService.swift`
- If you want to use your own, add `TMDB_API_KEY` to environment variables

### Build errors
- Make sure you've added Firebase packages via Swift Package Manager
- Clean build folder: **Product > Clean Build Folder** (⇧⌘K)
- Restart Xcode if needed

## Using the Same Firebase Database

The iOS app uses the exact same Firestore collections as your web version:
- ✅ Reads from `MonthlySelections` collection
- ✅ Reads from `GenrePools` collection  
- ✅ Writes to `Submissions` collection

No additional setup needed if you already have the web version running!

