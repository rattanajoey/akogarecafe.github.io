# Deploy Firebase Storage Rules

## Quick Deploy

To deploy the new Firebase Storage rules for profile image uploads:

```bash
cd "Movie Club Cafe"
firebase deploy --only storage
```

## What This Does

This command deploys the `storage.rules` file to Firebase, enabling:
- Profile image uploads (max 5MB)
- Users can only upload to their own profile path
- All authenticated users can view profile images
- Image-only file type restriction

## Verify Deployment

After deployment, check the Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Storage** → **Rules**
4. Verify the rules match `storage.rules`

## Testing

After deployment, test in the app:
1. Sign in to the app
2. Go to Profile
3. Tap "Edit Profile"
4. Tap the camera icon
5. Select a photo
6. Update display name (optional)
7. Tap "Save Changes"
8. Verify the new profile picture appears

## Deploy All Rules (Optional)

To deploy both Firestore and Storage rules at once:

```bash
firebase deploy --only firestore,storage
```

## Troubleshooting

### Error: "No project active"
```bash
firebase use --add
# Select your project from the list
```

### Error: "Permission denied"
```bash
firebase login
# Sign in with admin account
```

### Error: "Storage rules invalid"
Check syntax in `storage.rules` file. Common issues:
- Missing semicolons
- Incorrect match patterns
- Invalid function syntax

## Current Rules Summary

### Storage Rules
- **Path**: `profile_images/{userId}.jpg`
- **Read**: Any authenticated user
- **Write**: Owner only
- **Max Size**: 5MB
- **Type**: Images only

---

**Note**: Make sure you're logged into Firebase CLI with an account that has admin access to the project.

