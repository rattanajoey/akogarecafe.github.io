# Automatic Admin Privileges Setup

This document explains how the automatic admin privileges system works for trusted email addresses.

## Overview

The app automatically grants admin privileges to specific trusted email addresses when they authenticate. This eliminates the need to manually add the `role: "admin"` field in Firestore for designated administrators.

## How It Works

### 1. **Admin Email List**

Trusted admin emails are defined in `Config/AppConfig.swift`:

```swift
static let adminEmails: Set<String> = [
    "rattanajoey@gmail.com"
]
```

### 2. **Automatic Role Assignment**

When a user authenticates (sign up, sign in, or any auth method), the system:

1. Checks if their email matches any admin email
2. If yes, automatically sets `role: "admin"` in their user document
3. Grants them access to the admin panel immediately

### 3. **Supported Authentication Methods**

Auto-admin works with ALL authentication methods:
- ✅ Email/Password sign up
- ✅ Email/Password sign in
- ✅ Apple Sign In
- ✅ Google Sign In
- ✅ Phone Authentication (if email is linked)

### 4. **Retroactive Admin Grant**

If an admin email signs in with an existing account (created before being added to the admin list), the system will:
- Detect the mismatch on next sign-in
- Automatically update their Firestore document with `role: "admin"`
- Grant admin access immediately

## Implementation Details

### iOS (Swift)

#### Location: `Services/AuthenticationService.swift`

**New Account Creation:**
```swift
// When creating a new user
var newUser = AppUser(from: firebaseUser)

// Check if user should be admin
if AppConfig.isAdminEmail(newUser.email) {
    newUser.role = "admin"
    print("✅ Creating admin user: \(newUser.email ?? "unknown")")
}

try await createUserDocument(user: newUser)
```

**Existing Account Login:**
```swift
// When loading existing user data
if AppConfig.isAdminEmail(userData.email) && userData.role != "admin" {
    var updatedUser = userData
    updatedUser.role = "admin"
    try await updateUserRole(userId: updatedUser.id, role: "admin")
    currentUser = updatedUser
    print("✅ Auto-granted admin privileges to: \(userData.email ?? "unknown")")
}
```

### Web (JavaScript)

#### Location: `src/config/appConfig.js`

Currently, the web app uses password-based admin access (not email-based authentication). The configuration file is prepared for future authentication implementation:

```javascript
isAdminEmail: function(email) {
  if (!email) return false;
  return this.adminEmails.has(email.toLowerCase());
}
```

## Adding New Admin Emails

### iOS

1. Open `Movie Club Cafe/Config/AppConfig.swift`
2. Add the email to the `adminEmails` set:

```swift
static let adminEmails: Set<String> = [
    "rattanajoey@gmail.com",
    "newadmin@example.com"  // Add new email here
]
```

3. Save and rebuild the app
4. The new admin will be granted privileges on their next sign-in

### Web

1. Open `src/config/appConfig.js`
2. Add the email to the `adminEmails` set:

```javascript
adminEmails: new Set([
  "rattanajoey@gmail.com",
  "newadmin@example.com"  // Add new email here
]),
```

3. Rebuild: `npm run build`
4. Deploy: `npm run deploy`

## Testing

### Test Auto-Admin for New User

1. Add a test email to `adminEmails`
2. Sign up with that email
3. Check Xcode console for: `✅ Creating admin user: test@example.com`
4. Force quit and reopen app
5. Verify "Admin" tab appears in bottom navigation
6. Tap Admin tab and enter password
7. Confirm admin panel access

### Test Auto-Admin for Existing User

1. Create a regular user account first
2. Sign out
3. Add their email to `adminEmails` 
4. Rebuild app
5. Sign in with that account
6. Check Xcode console for: `✅ Auto-granted admin privileges to: test@example.com`
7. Verify "Admin" tab now appears
8. Check Firebase Console → Firestore → users → [user doc] → should see `role: "admin"`

## Security Considerations

### ✅ Advantages

1. **No manual Firestore edits** - Reduces human error
2. **Instant admin access** - No need to wait for manual role assignment
3. **Centralized management** - All admin emails in one place
4. **Version controlled** - Admin list is tracked in Git
5. **Type-safe** - Swift Set prevents duplicates

### ⚠️ Important Security Notes

1. **Never commit real admin emails to public repos**
   - For private repos: OK to keep emails in code
   - For public repos: Use environment variables

2. **Production deployment**: Consider moving admin emails to:
   - Firebase Remote Config
   - Environment variables
   - Secure backend API

3. **Code signing required**: App must be properly signed to prevent tampering

4. **Firebase Security Rules**: Ensure your rules enforce the `role` field:

```javascript
function isAdmin() {
  return request.auth != null && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## Using Environment Variables (Advanced)

### iOS

For production, you can override admin emails using environment variables:

1. In Xcode: Edit Scheme → Run → Arguments → Environment Variables
2. Add: `ADMIN_EMAILS=admin1@example.com,admin2@example.com`
3. Update `AppConfig.swift` to read from environment:

```swift
static var adminEmails: Set<String> {
    if let envEmails = ProcessInfo.processInfo.environment["ADMIN_EMAILS"] {
        return Set(envEmails.split(separator: ",").map { String($0).lowercased() })
    }
    return [
        "rattanajoey@gmail.com"
    ]
}
```

### Web

1. Add to `.env` file:
```
REACT_APP_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

2. Update `appConfig.js`:
```javascript
adminEmails: new Set(
  process.env.REACT_APP_ADMIN_EMAILS 
    ? process.env.REACT_APP_ADMIN_EMAILS.split(',').map(e => e.toLowerCase())
    : ['rattanajoey@gmail.com']
),
```

## Removing Admin Access

To revoke admin access:

### Method 1: Remove from Admin List

1. Remove email from `adminEmails` in `AppConfig.swift`
2. In Firebase Console → Firestore → users → [user doc]
3. Delete the `role` field or change to `"user"`
4. User must force quit and reopen app

### Method 2: Override in Firestore

1. Keep email in `adminEmails` (for tracking)
2. In Firebase Console, set `role: "user"` 
3. User loses admin access on next app restart

Note: Method 2 will be overridden on next sign-in since email is still in the list.

## Troubleshooting

### Admin tab doesn't appear for admin email

**Check:**
1. Email matches exactly (case-insensitive)
2. Email is in the `adminEmails` set
3. App was rebuilt after adding email
4. User force quit and reopened app
5. User's Firestore document has `role: "admin"`

**Debug:**
1. Check Xcode console for admin grant messages
2. View Firestore Console → users → [user doc]
3. Add print statement in `AppConfig.isAdminEmail()`

### Existing user still not admin after adding email

**Fix:**
1. User must sign out completely
2. Force quit the app
3. Reopen and sign back in
4. System will detect and update role

**Or manually:**
1. Go to Firebase Console → Firestore
2. Find user document
3. Add/update field: `role: "admin"`

## Current Admin Users

| Email | Added Date | Notes |
|-------|-----------|-------|
| rattanajoey@gmail.com | 2025-11-07 | Primary admin |

## Related Documentation

- [Admin Setup Instructions](./ADMIN_SETUP_INSTRUCTIONS.md) - Manual admin setup
- [Authentication Quick Start](./AUTHENTICATION_QUICK_START.md) - Auth system overview
- [Firebase Security Rules](../../Movie%20Club%20Cafe/FIREBASE_SECURITY_RULES.txt) - Security rules

## Next Steps

Once auto-admin is working:

1. ✅ Test with actual admin email
2. ✅ Verify admin panel access
3. ✅ Test all admin features
4. ✅ Add more admin emails if needed
5. ✅ Consider environment variables for production

## Changelog

- **2025-11-07**: Initial auto-admin implementation
  - Added `adminEmails` to `AppConfig.swift`
  - Added `isAdminEmail()` helper function
  - Modified `AuthenticationService` to auto-grant admin role
  - Created `appConfig.js` for web app (future-proofing)
  - Added `rattanajoey@gmail.com` as first auto-admin

