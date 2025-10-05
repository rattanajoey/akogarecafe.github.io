# Firebase Authentication Setup Guide

This guide explains how to set up and use Firebase Authentication in the Movie Club Cafe iOS app.

## Overview

Firebase Authentication has been integrated into the app with support for:
- Email/Password Authentication
- Apple Sign In
- Google Sign In (placeholder - requires additional setup)
- Phone Authentication

## Files Created

### Models
- `Models/UserModel.swift` - User data model and authentication errors

### Services
- `Services/AuthenticationService.swift` - Main authentication service handling all auth operations

### Views
- `Views/Auth/SignInView.swift` - Sign in screen with email/password and social login
- `Views/Auth/SignUpView.swift` - Account creation screen
- `Views/Auth/ForgotPasswordView.swift` - Password reset screen
- `Views/Auth/ProfileView.swift` - User profile and account management

### Configuration
- Updated `Config/FirebaseConfig.swift` - Added Auth support
- Updated `Movie_Club_CafeApp.swift` - Integrated AuthenticationService
- Updated `ContentView.swift` - Added authentication flow

## Firebase Console Setup

### 1. Enable Authentication Methods

Go to your Firebase Console → Authentication → Sign-in method:

#### Email/Password
- Status: ✅ Enabled (as shown in your screenshot)
- No additional configuration needed

#### Apple Sign In
- Status: ✅ Enabled
- **Additional Steps Required:**
  1. Add your Apple Team ID in Firebase Console
  2. In Xcode, enable "Sign in with Apple" capability:
     - Select your project → Target → Signing & Capabilities
     - Click "+ Capability" → "Sign in with Apple"

#### Google Sign In
- Status: ✅ Enabled
- **Additional Steps Required:**
  1. Install GoogleSignIn SDK:
     ```swift
     // Add to your Swift Package Dependencies
     https://github.com/google/GoogleSignIn-iOS
     ```
  2. Add URL scheme to Info.plist (from your GoogleService-Info.plist)
  3. Implement the full Google Sign In flow in `AuthenticationService.swift`

#### Phone Authentication
- Status: ✅ Enabled
- **Additional Steps Required:**
  1. Configure your app's APNs authentication key in Firebase Console
  2. Enable push notifications in Xcode capabilities
  3. Configure reCAPTCHA verification (handled by Firebase automatically)

### 2. Firestore Database Rules

Update your Firestore security rules to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Movies collection - authenticated users can read
    match /movies/{movieId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## User Data Structure

Each authenticated user gets a document in the `users` collection with:

```swift
{
  "id": String,              // Firebase Auth UID
  "email": String?,          // User's email
  "displayName": String?,    // Display name
  "photoURL": String?,       // Profile picture URL
  "phoneNumber": String?,    // Phone number
  "createdAt": Timestamp,    // Account creation date
  "lastLoginAt": Timestamp,  // Last login date
  "favoriteGenres": [String], // User's favorite movie genres
  "watchedMovies": [String],  // IDs of watched movies
  "submittedMovies": [String] // IDs of submitted movies
}
```

## Authentication Flow

### Sign In Flow
1. User opens app → `SignInView` is displayed (if not authenticated)
2. User can:
   - Sign in with email/password
   - Sign in with Apple
   - Sign in with Google (when implemented)
   - Create a new account
   - Reset password

### Sign Up Flow
1. User taps "Sign Up" → `SignUpView` sheet appears
2. User enters email, password, and optional display name
3. Account is created in Firebase Auth
4. User document is created in Firestore
5. User is automatically signed in

### Authenticated State
Once authenticated, the app shows:
- Tab 1: Movie Club (existing functionality)
- Tab 2: Profile (user profile and stats)

## Using the Authentication Service

The `AuthenticationService` is available throughout the app as an `@EnvironmentObject`:

```swift
@EnvironmentObject var authService: AuthenticationService

// Check authentication state
if authService.isAuthenticated {
    // User is signed in
}

// Access current user
if let user = authService.currentUser {
    Text("Hello, \(user.displayName ?? "Movie Fan")!")
}

// Sign out
try authService.signOut()
```

## Key Features

### Email/Password Authentication
- ✅ Sign up with email and password
- ✅ Sign in with email and password
- ✅ Password reset via email
- ✅ Password strength validation

### Apple Sign In
- ✅ Native Apple Sign In button
- ✅ Secure authentication flow
- ✅ Profile data integration

### User Management
- ✅ User profile display
- ✅ Account statistics (movies submitted, watched, favorite genres)
- ✅ Sign out functionality
- ✅ Automatic user document creation

### Security
- ✅ Secure password handling
- ✅ Error handling with user-friendly messages
- ✅ Loading states for all async operations
- ✅ Form validation

## Testing Authentication

### Test Email/Password Sign Up
1. Build and run the app
2. Tap "Sign Up"
3. Enter email, password, and name
4. Verify account creation in Firebase Console → Authentication

### Test Sign In
1. Sign out if signed in
2. Enter credentials on sign-in screen
3. Verify successful authentication

### Test Apple Sign In
1. Tap "Sign in with Apple" button
2. Complete Apple authentication
3. Verify account creation in Firebase Console

## Troubleshooting

### Common Issues

**Issue: FirebaseAuth module not found**
- Solution: Open Xcode project and let it resolve the Swift Package dependencies
- Or manually resolve: File → Packages → Resolve Package Versions

**Issue: Apple Sign In not working**
- Check that "Sign in with Apple" capability is enabled in Xcode
- Verify Bundle ID matches in both Xcode and Apple Developer Portal
- Ensure Apple Sign In is enabled in Firebase Console

**Issue: User document not created**
- Check Firestore security rules allow write access
- Verify `GoogleService-Info.plist` is properly configured
- Check console logs for detailed error messages

**Issue: "Cannot assign value of type 'Auth' to type 'Auth'"**
- This is a common issue when FirebaseAuth is not properly imported
- Clean build folder: Xcode → Product → Clean Build Folder
- Restart Xcode

## Next Steps

### Complete Google Sign In Setup
1. Add GoogleSignIn package dependency
2. Configure OAuth client in Firebase Console
3. Add URL schemes to Info.plist
4. Implement full Google Sign In flow

### Add Profile Editing
- Allow users to update display name
- Add profile picture upload
- Enable email change functionality

### Add Social Features
- Friend system
- Movie recommendations based on user preferences
- Group movie clubs

### Analytics
- Track sign-up methods
- Monitor authentication events
- User engagement metrics

## Security Best Practices

1. **Never commit sensitive files**
   - `GoogleService-Info.plist` should be in `.gitignore`
   - Never share Firebase API keys publicly

2. **Use proper Firestore rules**
   - Implement proper security rules for all collections
   - Test rules using Firebase Console simulator

3. **Handle errors gracefully**
   - Show user-friendly error messages
   - Log detailed errors for debugging

4. **Keep dependencies updated**
   - Regularly update Firebase SDK
   - Monitor security advisories

## Support

For issues related to:
- Firebase setup: Check [Firebase Documentation](https://firebase.google.com/docs/auth)
- iOS implementation: Refer to the inline code comments
- Authentication errors: Check `UserModel.swift` for error definitions
