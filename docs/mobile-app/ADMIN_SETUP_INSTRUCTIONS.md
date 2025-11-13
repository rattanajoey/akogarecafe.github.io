# Admin Setup Instructions

Quick guide to set yourself up as an admin in the Movie Club app.

## Step 1: Find Your User ID

### Method A: Using Firebase Console
1. Open Firebase Console
2. Go to Authentication → Users
3. Find your account (by email)
4. Copy your User UID

### Method B: Using the App
1. Sign in to the Movie Club app
2. Check Xcode console logs for your User ID
3. It will appear as: "User signed in: [USER_ID]"

## Step 2: Add Admin Role to Your Account

### Using Firebase Console (Recommended)

1. Open Firebase Console
2. Navigate to Firestore Database
3. Click on the `users` collection
4. Find your user document (match the User UID from Step 1)
5. Click on the document to open it
6. Click "Add field" (or edit if `role` field exists)
   - Field name: `role`
   - Field type: string
   - Field value: `admin`
7. Click "Update" to save

### Using Firebase Admin SDK (Advanced)

If you have a backend with Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function makeAdmin(userId) {
  await db.collection('users').doc(userId).set({
    role: 'admin'
  }, { merge: true });
  console.log('Admin role granted!');
}

// Replace with your actual User ID
makeAdmin('YOUR_USER_ID_HERE');
```

## Step 3: Verify Admin Access

1. **Force quit** the Movie Club app (swipe up in app switcher)
2. Reopen the app
3. Sign in again
4. Check the bottom tab bar
5. You should now see three tabs:
   - 🎬 Movie Club
   - 👤 Profile
   - ⚙️ **Admin** ← This is new!

## Step 4: Access Admin Panel

1. Tap the **Admin** tab
2. Enter the admin password: `adminpass`
3. You're now in the admin panel!

## Admin Panel Features

Once you're in the admin panel, you can:

### 1. Select Monthly Movies
- View all current genre pools
- Randomize selections
- Manually review options

### 2. Publish Selections
- Select movies for each genre
- Click "Save to Firestore"
- Enter publish password: `thunderbolts`
- Selections are published to users

### 3. Manage Oscar Categories
- Create voting categories
- Add movies to categories
- View voting results
- Delete votes if needed

### 4. Review Holding Pool
- See submissions in holding
- Approve submissions to move to main pool
- Edit submissions
- Delete submissions

## Troubleshooting

### "Admin tab doesn't appear"

**Check:**
1. Did you set `role: "admin"` exactly (case-sensitive)?
2. Did you force quit and reopen the app?
3. Are you signed in with the correct account?
4. Check Firebase Console to verify the field exists

**Fix:**
- Go to Firebase Console → Firestore → users → [your user doc]
- Verify the `role` field shows: `admin` (in quotes, lowercase)
- Force quit app again and reopen

### "Wrong password" when accessing admin panel

**Fix:**
- Default password is: `adminpass` (all lowercase, no spaces)
- To change it, edit `Config/AppConfig.swift`
- Update the value of `adminPanelPassword`

### "Can't save selections"

**Check:**
1. Did you randomize selections first?
2. Are there movies in the genre pools?
3. Is the publish password correct: `thunderbolts`?

**Fix:**
- Make sure Firebase security rules allow admin writes
- Check that you have internet connection
- Try force quitting and reopening the app

## Changing Admin Passwords

To change the default passwords:

1. Open Xcode
2. Navigate to: `Movie Club Cafe/Config/AppConfig.swift`
3. Update these values:
   ```swift
   static let adminPanelPassword = "your-new-password"
   static let publishSelectionsPassword = "your-new-password"
   ```
4. Rebuild and reinstall the app

## Security Best Practices

1. **Change default passwords** before going to production
2. **Limit admin users** - only give admin role to trusted users
3. **Use Firebase security rules** to restrict admin actions
4. **Monitor Firebase logs** for suspicious activity
5. **Rotate passwords** periodically
6. **Use environment variables** for production passwords

## Revoking Admin Access

To remove admin access from a user:

1. Go to Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Find the user document
4. Delete the `role` field (or change it to `"user"`)
5. Have the user force quit and reopen the app

## Next Steps

Once you have admin access:

1. ✅ Test randomizing movie selections
2. ✅ Test publishing selections
3. ✅ Create Oscar voting categories
4. ✅ Review the holding pool
5. ✅ Invite other admins (if needed)

## Need Help?

If you're stuck:
1. Check Firebase Console for data
2. Check Xcode console for errors
3. Verify security rules are deployed
4. Review the full setup guide: `MOVIE_CLUB_FEATURES_SETUP.md`

