# Firebase Authentication - Quick Start

## ✅ What's Been Set Up

Firebase Authentication has been fully integrated into your Movie Club Cafe iOS app with:

### Authentication Methods
- ✅ Email/Password Sign In
- ✅ Apple Sign In
- ✅ Google Sign In (structure ready, needs final setup)
- ✅ Phone Authentication (structure ready)

### Files Created
```
Movie Club Cafe/
├── Models/
│   └── UserModel.swift                    # User data model
├── Services/
│   └── AuthenticationService.swift        # Auth service (@MainActor)
├── Views/
│   └── Auth/
│       ├── SignInView.swift               # Sign in screen
│       ├── SignUpView.swift               # Sign up screen
│       ├── ForgotPasswordView.swift       # Password reset
│       └── ProfileView.swift              # User profile
└── Config/
    └── FirebaseConfig.swift               # Updated with Auth
```

## 🚀 Testing the App

### 1. Build and Run
Open the project in Xcode:
```bash
cd "Movie Club Cafe"
open "Movie Club Cafe.xcodeproj"
```

### 2. First Launch Experience
When you run the app, you'll see:
1. **Sign In Screen** (if not authenticated)
   - Email/Password sign in form
   - "Sign in with Apple" button
   - "Continue with Google" button (placeholder)
   - "Forgot Password?" link
   - "Sign Up" link

### 3. Create Test Account
1. Tap "Sign Up"
2. Enter:
   - Display Name: "Test User"
   - Email: test@example.com
   - Password: test123
   - Confirm Password: test123
3. Tap "Create Account"
4. You'll be automatically signed in

### 4. Authenticated Experience
After signing in, you'll see:
- **Tab 1: Movie Club** - Your existing movie club functionality
- **Tab 2: Profile** - User profile with:
  - Profile picture (or default icon)
  - Display name and email
  - Account details (member since, phone)
  - Statistics (movies submitted, watched, favorite genres)
  - Sign Out button

## 🔐 Authentication Flow

### Sign In Flow
```
App Launch → Check Auth State
   ↓
Not Authenticated → SignInView
   ↓
Enter Credentials → AuthenticationService.signIn()
   ↓
Success → Load User Data from Firestore
   ↓
Show Tab View (Movie Club + Profile)
```

### Sign Up Flow
```
Tap "Sign Up" → SignUpView Sheet
   ↓
Enter Details → AuthenticationService.signUp()
   ↓
Create Firebase Auth User
   ↓
Create Firestore User Document
   ↓
Auto Sign In → Show Tab View
```

## 📝 User Data Structure

Each user gets a document in Firestore `users` collection:

```json
{
  "id": "firebase-uid",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": null,
  "phoneNumber": null,
  "createdAt": "2025-10-05T00:00:00Z",
  "lastLoginAt": "2025-10-05T00:00:00Z",
  "favoriteGenres": [],
  "watchedMovies": [],
  "submittedMovies": []
}
```

## 🛠️ Next Steps to Complete Setup

### 1. Enable Apple Sign In (5 minutes)
In Xcode:
1. Select your project → Target → Signing & Capabilities
2. Click "+ Capability"
3. Add "Sign in with Apple"
4. Build and test

### 2. Set Up Google Sign In (optional, 15 minutes)
1. Add GoogleSignIn package:
   ```
   File → Add Package Dependencies
   https://github.com/google/GoogleSignIn-iOS
   ```
2. Add URL scheme from GoogleService-Info.plist to Info.plist
3. Complete the implementation in `AuthenticationService.swift`

### 3. Configure Firestore Security Rules
In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### 4. Test All Features
- ✅ Email/Password sign up
- ✅ Email/Password sign in
- ✅ Password reset (check email)
- ✅ Apple Sign In
- ✅ Profile display
- ✅ Sign out
- ✅ Automatic re-authentication on app restart

## 💡 Using Auth in Your Code

### Access Current User
```swift
@EnvironmentObject var authService: AuthenticationService

// In your view
if let user = authService.currentUser {
    Text("Welcome, \(user.displayName ?? "User")!")
}
```

### Check Authentication State
```swift
if authService.isAuthenticated {
    // User is signed in
} else {
    // User is signed out
}
```

### Sign Out
```swift
Button("Sign Out") {
    do {
        try authService.signOut()
    } catch {
        print("Error signing out: \(error)")
    }
}
```

### Submit Movie with User ID
```swift
if let userId = authService.currentUser?.id {
    // Save movie with userId
    movie.submittedBy = userId
}
```

## 🔍 Debugging

### View Firebase Authentication Users
1. Go to Firebase Console
2. Click "Authentication"
3. Click "Users" tab
4. You'll see all registered users

### View Firestore User Documents
1. Go to Firebase Console
2. Click "Firestore Database"
3. Navigate to "users" collection
4. See all user documents

### Common Issues

**Can't sign in:**
- Check Firebase Console → Authentication is enabled
- Verify GoogleService-Info.plist is in Config/ folder
- Check Xcode console for error messages

**User document not created:**
- Check Firestore security rules
- Look for errors in Xcode console
- Verify Firestore is initialized

**Apple Sign In not working:**
- Add "Sign in with Apple" capability in Xcode
- Verify Bundle ID matches Apple Developer account

## 📚 Key Files to Know

1. **AuthenticationService.swift** - All auth operations
   - Sign in/up/out methods
   - User state management
   - Apple/Google sign in

2. **UserModel.swift** - User data structure
   - AppUser model
   - Authentication errors

3. **ContentView.swift** - Main app routing
   - Shows SignInView or TabView based on auth state

4. **SignInView.swift** - Entry point
   - Email/password sign in
   - Social sign in buttons

## 🎉 You're All Set!

Your app now has:
- ✅ Complete authentication system
- ✅ User profile management
- ✅ Secure Firestore integration
- ✅ Beautiful, modern UI
- ✅ Error handling
- ✅ Loading states

Build and run to see it in action!

For detailed information, see `FIREBASE_AUTH_SETUP.md`.
