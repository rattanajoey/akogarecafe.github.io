# Movie Club Features Setup Guide

This guide will help you set up all the new Movie Club features in your iOS app.

## 1. Firebase Collections Setup

### Required Collections

You need to create or ensure these Firebase collections exist:

#### A. HoldingPool Collection

**Path:** `HoldingPool/{userId}`

**Structure:**
```json
{
  "action": "Movie Title",
  "drama": "Movie Title",
  "comedy": "Movie Title",
  "thriller": "Movie Title",
  "submittedAt": "2025-01-15T10:30:00Z"
}
```

**How to create:**
1. Go to Firebase Console → Firestore Database
2. Click "Start Collection"
3. Collection ID: `HoldingPool`
4. Add a test document with ID: `testUser`
5. Add fields as shown above

#### B. OscarCategories Collection

**Path:** `OscarCategories/{categoryId}`

**Structure:**
```json
{
  "name": "Best Action/Sci-Fi/Fantasy",
  "movies": [
    "Dune: Part Two",
    "Godzilla Minus One",
    "The Creator"
  ]
}
```

**Sample Categories to Create:**
```javascript
// Category 1
{
  "name": "Best Action/Sci-Fi/Fantasy",
  "movies": []
}

// Category 2
{
  "name": "Best Drama/Documentary",
  "movies": []
}

// Category 3
{
  "name": "Best Comedy/Musical",
  "movies": []
}

// Category 4
{
  "name": "Best Thriller/Horror",
  "movies": []
}

// Category 5
{
  "name": "Movie of the Year",
  "movies": []
}

// Category 6
{
  "name": "Hidden Gem",
  "movies": []
}
```

**How to create:**
1. In Firestore Database, click "Start Collection"
2. Collection ID: `OscarCategories`
3. Add each category as a separate document
4. Use auto-ID or create custom IDs like: `best-action`, `best-drama`, etc.

#### C. OscarVotes Collection

**Path:** `OscarVotes/{voterName}_{categoryId}`

**Structure:**
```json
{
  "voterName": "John Doe",
  "categoryId": "best-action",
  "movie": "Dune: Part Two",
  "timestamp": "2025-01-15T10:30:00Z",
  "updated": false
}
```

**Note:** This collection will be auto-created when users vote. No manual setup needed.

---

## 2. Firebase Security Rules

Update your Firestore security rules to secure the new collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Existing rules for MonthlySelections, GenrePools, Submissions...
    
    // HoldingPool - Read by all, write by authenticated users
    match /HoldingPool/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // OscarCategories - Read by all, write by admins only
    match /OscarCategories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // OscarVotes - Read by admins, write by authenticated users
    match /OscarVotes/{voteId} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null;
    }
    
    // Users collection - needed for role checking
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                      (request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

---

## 3. Admin Role Assignment

### Method 1: Firebase Console (Recommended)

1. Go to Firebase Console → Firestore Database
2. Navigate to the `users` collection
3. Find the user document you want to make admin (by user ID)
4. Click "Edit Field" or add a new field
5. Field name: `role`
6. Field value: `admin`
7. Save

### Method 2: Using Firebase Admin SDK (Server-side)

If you have a backend, you can create a script:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

async function makeUserAdmin(userId) {
  await db.collection('users').doc(userId).update({
    role: 'admin'
  });
  console.log(`User ${userId} is now an admin`);
}

// Usage
makeUserAdmin('USER_ID_HERE');
```

### Method 3: Firestore REST API

```bash
curl -X PATCH \
  'https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/users/USER_ID?updateMask.fieldPaths=role' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "role": {
        "stringValue": "admin"
      }
    }
  }'
```

### Testing Admin Access

1. Sign in to the app with an admin user
2. You should see a third "Admin" tab in the tab bar
3. Tap the Admin tab to access the admin panel

---

## 4. Password Configuration

### Current Passwords (Hardcoded)

The app currently uses these passwords:

| Feature | Password | Location |
|---------|----------|----------|
| Admin Panel Access | `adminpass` | MovieClubAdminView.swift |
| Publish Selections | `thunderbolts` | MovieClubAdminView.swift |
| Oscar Voting | `oscar2025` | OscarVotingView.swift |

### Option A: Change Passwords (Simple)

Edit the following files and update the password strings:

**MovieClubAdminView.swift:**
```swift
private let adminPassword = "YOUR_NEW_ADMIN_PASSWORD"
private let publishPassword = "YOUR_NEW_PUBLISH_PASSWORD"
```

**OscarVotingView.swift:**
```swift
private let oscarPassword = "YOUR_NEW_OSCAR_PASSWORD"
```

### Option B: Environment Variables (Recommended for Production)

See `Config/AppConfig.swift` (created in next step) for centralized password management.

---

## 5. Populating Oscar Categories with Movies

### Automatic Population (Recommended)

The admin panel can help populate Oscar categories from your monthly selections:

1. Go to Admin tab in the app
2. Scroll to "Oscar Voting Admin" section
3. Use the movie selection interface to add movies to each category
4. Movies are pulled from all `MonthlySelections` documents

### Manual Population via Firebase Console

1. Go to Firebase Console → Firestore Database
2. Navigate to `OscarCategories/{categoryId}`
3. Edit the document
4. Update the `movies` array field with movie titles:
   ```
   ["Dune: Part Two", "Godzilla Minus One", "The Creator"]
   ```

---

## 6. Testing the Features

### Test Submission List
1. Have users submit movies for the current month
2. Open the app
3. Scroll down to "Submissions for [Current Month]"
4. Verify all submissions appear in horizontal cards

### Test Info Modal
1. Tap the info icon (ⓘ) in the header
2. Verify the modal shows all rules and guidelines
3. Close the modal

### Test Holding Pool
1. Add test data to `HoldingPool` collection in Firebase
2. Open the app
3. Scroll to "📋 Holding Submissions"
4. Verify movies appear grouped by genre

### Test Oscar Voting
1. Tap "🏆 Oscar Voting" button
2. Enter password: `oscar2025`
3. Enter your name
4. Select movies for each category
5. Submit votes
6. Verify votes appear in Firebase `OscarVotes` collection

### Test Admin Panel
1. Make your user account an admin (see Section 3)
2. Restart the app
3. Verify "Admin" tab appears in tab bar
4. Tap Admin tab
5. Enter password: `adminpass`
6. Test randomizing selections
7. Test saving selections with password: `thunderbolts`
8. Verify `MonthlySelections` collection is updated

---

## 7. Troubleshooting

### Issue: Admin tab doesn't appear
**Solution:** 
- Verify the user document in Firebase has `role: "admin"`
- Restart the app completely (force quit and reopen)
- Check that the user is signed in

### Issue: "Firebase is not available" message
**Solution:**
- Verify Firebase is properly configured in `FirebaseConfig.swift`
- Check that `GoogleService-Info.plist` is in the project
- Rebuild the project

### Issue: Oscar categories don't load
**Solution:**
- Verify `OscarCategories` collection exists in Firebase
- Check that documents have `name` and `movies` fields
- Check Firebase security rules allow reading

### Issue: Can't save selections in admin panel
**Solution:**
- Verify you're entering the correct password: `thunderbolts`
- Check Firebase security rules allow admin writes
- Check that genre pools have movies to select from

### Issue: Submissions don't appear in list
**Solution:**
- Verify submissions exist in `Submissions/{currentMonth}/users/`
- Check that the current month format matches (YYYY-MM)
- Verify Firebase listener is working (check console logs)

---

## 8. Production Deployment

Before releasing to production:

1. ✅ Change all default passwords
2. ✅ Set up proper Firebase security rules
3. ✅ Assign admin roles to trusted users only
4. ✅ Test all features thoroughly
5. ✅ Set up Firebase backup/export
6. ✅ Configure Firebase budget alerts
7. ✅ Add analytics tracking (optional)
8. ✅ Test on multiple devices/iOS versions

---

## 9. Feature Toggle

To disable Oscar voting during off-season:

**MovieClubView.swift** (line ~145):
```swift
.disabled(true) // Change false to true to disable
```

To hide the button entirely:
```swift
// Comment out or wrap in if statement:
if oscarVotingEnabled {
    Button(action: { showOscarVoting = true }) {
        // ... button content
    }
}
```

---

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Check Xcode console for Swift errors
3. Verify all collections and documents are properly structured
4. Review security rules for access issues

For questions about specific features, refer to the implementation in:
- `Views/SubmissionListView.swift`
- `Views/MovieClubInfoView.swift`
- `Views/HoldingPoolView.swift`
- `Views/OscarVotingView.swift`
- `Views/MovieClubAdminView.swift`

