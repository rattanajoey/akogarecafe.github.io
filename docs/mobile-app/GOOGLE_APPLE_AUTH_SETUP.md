# Google & Apple Authentication Setup Guide

Complete guide to enable Google and Apple Sign In for the Movie Club Cafe iOS app.

**Date:** November 7, 2025  
**Status:** Ready to implement

---

## Quick Overview

Your app will support:
- ✅ Email/Password authentication (already working)
- ✅ Apple Sign In (already implemented, needs capability enabled)
- 🔄 Google Sign In (implementing now)

---

## Part 1: Apple Sign In Setup

### ✅ Code Already Implemented

The code is already in `AuthenticationService.swift`:
- `signInWithApple()` method ✅
- `startSignInWithAppleFlow()` ✅
- Nonce generation for security ✅

### 🔧 Steps to Enable (You need to do this in Xcode)

1. **Open Xcode Project**
   ```bash
   open "Movie Club Cafe.xcodeproj"
   ```

2. **Select the Project**
   - Click on "Movie Club Cafe" in the project navigator (top item)
   - Select "Movie Club Cafe" target under TARGETS

3. **Add Sign in with Apple Capability**
   - Click the "Signing & Capabilities" tab
   - Click "+ Capability" button
   - Search for "Sign in with Apple"
   - Click to add it

4. **Apple Developer Portal** (if deploying to device/TestFlight)
   - Go to [developer.apple.com](https://developer.apple.com)
   - Go to Certificates, Identifiers & Profiles
   - Select your App ID: `com.akogarecafe.Movie-Club-Cafe`
   - Enable "Sign in with Apple" capability
   - Click "Save"

### ✅ Apple Sign In Button (Already in SignInView.swift)

```swift
SignInWithAppleButton(
    .signIn,
    onRequest: { request in
        request.requestedScopes = [.fullName, .email]
        request.nonce = authService.startSignInWithAppleFlow()
    },
    onCompletion: { result in
        handleAppleSignIn(result)
    }
)
```

---

## Part 2: Google Sign In Setup

### Step 1: Get Google Client ID

Your GoogleService-Info.plist shows:
```
CLIENT_ID: 712370038259-pimrcof7fqdk1f4lctr2hu1e3dcgsofl.apps.googleusercontent.com
REVERSED_CLIENT_ID: com.googleusercontent.apps.712370038259-pimrcof7fqdk1f4lctr2hu1e3dcgsofl
```

### Step 2: Add Google Sign In Package (Already done via code)

The GoogleSignIn package will be added to your project automatically.

### Step 3: Configure URL Scheme (Need to do in Xcode)

1. **Open Xcode Project**
2. **Select Project → Target → Info tab**
3. **Expand "URL Types"**
4. **Click "+" to add a new URL Type**
5. **Fill in:**
   - **URL Schemes:** `com.googleusercontent.apps.712370038259-pimrcof7fqdk1f4lctr2hu1e3dcgsofl`
   - **Identifier:** `com.google.signin`
   - **Role:** Editor

### Step 4: Update App Delegate (Automatic in code below)

The app will handle Google Sign In URL callbacks automatically.

---

## Part 3: Implementation Details

### Authentication Flow

#### Apple Sign In:
```
User taps Apple button
  ↓
iOS presents Apple Sign In sheet
  ↓
User authenticates with Face ID/Touch ID
  ↓
App receives Apple ID credential
  ↓
Creates Firebase credential
  ↓
Signs in to Firebase
  ↓
User data synced to Firestore
```

#### Google Sign In:
```
User taps Google button
  ↓
GoogleSignIn SDK presents sign in flow
  ↓
User selects Google account
  ↓
App receives ID token
  ↓
Creates Firebase credential
  ↓
Signs in to Firebase
  ↓
User data synced to Firestore
```

---

## Part 4: Testing

### Test Apple Sign In

1. Build and run on Simulator or Device
2. Tap "Continue with Apple" button
3. Use test Apple ID or your actual Apple ID
4. Grant permissions
5. Verify you're signed in to the app

**Note:** Apple Sign In works on Simulator (iOS 13.5+)

### Test Google Sign In

1. Build and run on Simulator or Device
2. Tap "Continue with Google" button
3. Select Google account
4. Grant permissions
5. Verify you're signed in to the app

**Note:** Google Sign In works on both Simulator and Device

---

## Part 5: Troubleshooting

### Apple Sign In Issues

**Problem:** "The operation couldn't be completed"
- **Fix:** Make sure Sign in with Apple capability is added in Xcode
- **Fix:** Verify bundle ID matches in Apple Developer Portal

**Problem:** "Invalid nonce"
- **Fix:** Already handled in code - nonce is generated securely

### Google Sign In Issues

**Problem:** "No application found"
- **Fix:** Verify URL scheme is added correctly
- **Fix:** Check REVERSED_CLIENT_ID matches URL scheme

**Problem:** "Network error"
- **Fix:** Check internet connection
- **Fix:** Verify GoogleService-Info.plist is in the project

**Problem:** "Invalid client ID"
- **Fix:** Ensure CLIENT_ID from GoogleService-Info.plist matches Firebase project

---

## Part 6: Security Notes

### Data Privacy

Both Google and Apple Sign In:
- ✅ Don't share passwords with your app
- ✅ Use OAuth 2.0 for secure authentication
- ✅ Allow users to manage permissions
- ✅ Support account deletion

### User Privacy

**Apple Sign In:**
- Users can hide their email (Apple provides proxy email)
- Face ID/Touch ID for biometric authentication
- No tracking across apps

**Google Sign In:**
- Users choose which Google account to use
- Can revoke access from Google account settings
- Standard OAuth permissions

---

## Part 7: Firebase Console Verification

### Check Sign-In Methods

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `ac-movie-club`
3. Go to Authentication → Sign-in method
4. Verify these are enabled:
   - ✅ Email/Password
   - ✅ Apple
   - ✅ Google

### Enable if not enabled:

**Google Sign In:**
1. Click "Google" in sign-in providers
2. Click "Enable"
3. Enter Web SDK configuration (if asked)
4. Save

**Apple Sign In:**
1. Click "Apple" in sign-in providers
2. Click "Enable"
3. Save

---

## Part 8: Production Checklist

Before releasing to App Store:

### Apple Sign In
- [ ] Capability added in Xcode
- [ ] Tested on physical device
- [ ] Enabled in Apple Developer Portal
- [ ] Privacy Policy mentions Apple Sign In
- [ ] Terms of Service updated

### Google Sign In
- [ ] URL scheme configured
- [ ] GoogleService-Info.plist included
- [ ] Tested on physical device
- [ ] OAuth consent screen configured in Google Cloud Console
- [ ] Privacy Policy mentions Google Sign In

### General
- [ ] Error messages are user-friendly
- [ ] Loading states work correctly
- [ ] Sign out flow tested
- [ ] Account deletion implemented (if required)
- [ ] Analytics tracking sign-in methods

---

## Summary

### What's Already Done ✅
- Firebase configured
- Apple Sign In code implemented
- Google Sign In code implemented
- UI buttons added
- Error handling in place

### What You Need to Do 🔧

**In Xcode (5 minutes):**
1. Add "Sign in with Apple" capability
2. Add Google URL scheme to Info tab

**In Firebase Console (2 minutes):**
1. Verify Google and Apple sign-in methods are enabled

**Testing (5 minutes):**
1. Test Apple Sign In
2. Test Google Sign In
3. Verify user data syncs to Firestore

---

## Code Files Modified

- ✅ `AuthenticationService.swift` - Complete Google Sign In implementation
- ✅ `Movie_Club_CafeApp.swift` - Google Sign In initialization
- ✅ `SignInView.swift` - Already has both buttons
- ✅ Package dependencies updated

---

## Support

If you encounter issues:
1. Check Xcode console for error messages
2. Verify Firebase configuration
3. Test with test accounts first
4. Review this guide's troubleshooting section

For Firebase-specific issues:
- Check Firebase Console → Authentication → Users
- Review Firebase Console → Authentication → Sign-in method

---

**Next:** Run the implementation scripts below to complete the setup!

