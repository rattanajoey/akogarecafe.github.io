# Environment Variables Setup

## How to Set Environment Variables in Xcode

1. Open your project in Xcode
2. Click on the scheme selector at the top (next to the play button)
3. Select **"Edit Scheme..."**
4. In the left sidebar, select **"Run"**
5. Go to the **"Arguments"** tab
6. Under **"Environment Variables"**, click the **"+"** button to add each variable

## Required Firebase Variables

Get these from your Firebase Console: https://console.firebase.google.com/

```
Name: FIREBASE_API_KEY
Value: AIza... (from Firebase Console > Project Settings > General)

Name: FIREBASE_PROJECT_ID
Value: your-project-id (from Firebase Console > Project Settings)

Name: FIREBASE_APP_ID
Value: 1:123456789:ios:abc123... (from Firebase Console > Project Settings > iOS app)

Name: FIREBASE_MESSAGING_SENDER_ID
Value: 123456789 (from Firebase Console > Project Settings)

Name: FIREBASE_STORAGE_BUCKET
Value: your-project.appspot.com (from Firebase Console > Project Settings)
```

## Optional TMDB Variable

The app includes a default TMDB API key, but you can override it:

```
Name: TMDB_API_KEY
Value: your_tmdb_api_key (get from https://www.themoviedb.org/settings/api)
```

## Alternative: Using GoogleService-Info.plist

Instead of environment variables, you can use a `GoogleService-Info.plist` file:

1. Download from Firebase Console:
   - Go to Project Settings
   - Scroll to "Your apps" section
   - Click the iOS app
   - Click "Download GoogleService-Info.plist"

2. Add to your Xcode project:
   - Drag the file into your project navigator
   - Make sure "Copy items if needed" is checked
   - Make sure your target is selected

3. Update FirebaseConfig.swift:
   - Change line 16 from the manual configuration to:
   ```swift
   FirebaseApp.configure()
   ```

## Which Method Should I Use?

### Use GoogleService-Info.plist if:
- ✅ You're building for production
- ✅ You want the simplest setup
- ✅ You don't mind committing config to git (or add to .gitignore)

### Use Environment Variables if:
- ✅ You want to keep secrets out of source control
- ✅ You need different configs for different developers
- ✅ You're building for multiple environments (dev/staging/prod)

## Verify Your Setup

After configuring Firebase, run this test:

```swift
// Add this to MovieClubView's onAppear
print("Firebase configured: \(FirebaseApp.app() != nil)")
```

You should see `Firebase configured: true` in the console.

## Common Issues

### "Firebase not configured"
- Make sure you called `FirebaseConfig.shared.configure()` in the app init
- Check that your GoogleService-Info.plist is in the project
- OR verify all environment variables are set correctly

### "Invalid API key"
- Double-check your FIREBASE_API_KEY value
- Make sure there are no extra spaces or quotes
- Try downloading a fresh GoogleService-Info.plist

### "Permission denied" when reading Firestore
- Check your Firestore security rules in Firebase Console
- For development, you can use:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read: if true;
        allow write: if false;
      }
    }
  }
  ```
- For production, implement proper authentication and rules

## Example: Full Xcode Scheme Configuration

If using environment variables, your scheme should look like:

```
Environment Variables:
├─ FIREBASE_API_KEY          = AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ123456
├─ FIREBASE_PROJECT_ID       = movie-club-cafe
├─ FIREBASE_APP_ID           = 1:123456789:ios:abcdef123456
├─ FIREBASE_MESSAGING_SENDER_ID = 123456789
├─ FIREBASE_STORAGE_BUCKET   = movie-club-cafe.appspot.com
└─ TMDB_API_KEY             = 576be59b6712fa18658df8a825ba434e (optional)
```

## Security Note

⚠️ **Important**: Never commit your actual Firebase credentials to public repositories!

- Add `GoogleService-Info.plist` to `.gitignore` (already done)
- Don't commit screenshots of your Firebase Console
- Use Firebase App Check in production
- Implement proper Firestore security rules

