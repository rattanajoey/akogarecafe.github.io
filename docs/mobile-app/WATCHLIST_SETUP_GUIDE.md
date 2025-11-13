# Watchlist Feature - Quick Setup Guide

## Step 1: Add WatchlistService to Xcode Project

1. Open `Movie Club Cafe.xcodeproj` in Xcode
2. In the Project Navigator, verify that `WatchlistService.swift` appears under `Services/`
3. If not visible, right-click the `Services` folder → Add Files → Select `WatchlistService.swift`

## Step 2: Update Firebase Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your Movie Club Cafe project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the rules from `FIREBASE_WATCHLIST_RULES.txt`
5. Merge with your existing rules
6. Click **Publish**

**Important Collections to Verify:**
- `Users/{userId}` - Should allow users to update their own `watchedMovies` array
- `MovieWatchers/{docId}` - Should allow authenticated users to read/write
- `NotificationQueue/{id}` - Should allow authenticated users to create documents

## Step 3: Test User Authentication

The watchlist feature requires users to be signed in. Verify your authentication is working:

```swift
// In your app, check:
if Auth.auth().currentUser != nil {
    print("✅ User is authenticated")
} else {
    print("❌ User needs to sign in")
}
```

Users must be authenticated to:
- Mark movies as watched
- See who watched movies
- Receive notifications

## Step 4: Build and Run

1. Build the project in Xcode (⌘ + B)
2. Run on simulator or device (⌘ + R)
3. Sign in with a test account
4. Navigate to Movie Club
5. Scroll through movie carousel
6. Tap "Mark as Watched" button

## Step 5: Test the Feature

### Single User Testing
1. ✅ Mark a movie as watched
2. ✅ Verify green checkmark appears on poster
3. ✅ Verify button changes to "Unmark as Watched" (green)
4. ✅ Verify your avatar appears below poster
5. ✅ Tap "Unmark as Watched"
6. ✅ Verify checkmark disappears
7. ✅ Verify avatar disappears

### Multi-User Testing
1. ✅ Sign in on two different devices/simulators
2. ✅ User 1: Mark movie as watched
3. ✅ User 2: Check for push notification
4. ✅ User 2: View same movie and see User 1's avatar
5. ✅ User 2: Also mark as watched
6. ✅ User 1: Verify User 2's avatar appears
7. ✅ Test with 6+ users to see "+X more" indicator

### Historical Movies Testing
1. ✅ Change month selector to previous month
2. ✅ Mark old movie as watched
3. ✅ Switch back to current month
4. ✅ Switch back to previous month
5. ✅ Verify watch status persists

## Step 6: Configure Push Notifications (Optional)

### For Real Push Notifications (Not just in-app):

1. **Enable Push Notifications in Xcode:**
   - Select your target → Signing & Capabilities
   - Click "+ Capability"
   - Add "Push Notifications"

2. **Upload APNs Certificate/Key to Firebase:**
   - Go to Firebase Console → Project Settings → Cloud Messaging
   - Upload your APNs Authentication Key or Certificate
   - [Firebase APNs Setup Guide](https://firebase.google.com/docs/cloud-messaging/ios/client)

3. **Uncomment FCM Code in NotificationService.swift:**
   ```swift
   // Uncomment line 14:
   import FirebaseMessaging
   
   // Uncomment lines 210-217 (MessagingDelegate extension)
   ```

4. **Add FirebaseMessaging Package:**
   - Xcode → File → Add Packages
   - Search: `https://github.com/firebase/firebase-ios-sdk`
   - Select "FirebaseMessaging"

5. **Test Notifications:**
   - Use Firebase Console → Cloud Messaging → Send test message
   - Or wait for a user to mark a movie as watched

## Troubleshooting

### Issue: Watch button doesn't work
**Solution:** Check that user is authenticated (`Auth.auth().currentUser != nil`)

### Issue: Avatar stack doesn't show up
**Solution:** 
- Check Firestore rules allow read access to `MovieWatchers` collection
- Verify at least one user has watched the movie
- Check console for any Firebase errors

### Issue: Notifications not received
**Solution:**
- Verify FCM token is being saved to user document in Firestore
- Check Firebase Console → Cloud Messaging for delivery status
- Ensure push notification permissions are granted
- Check that `NotificationService.storeFCMToken()` is being called

### Issue: Checkmark badge doesn't appear
**Solution:**
- Check `watchedStatus` state is being updated
- Verify `isWatched` prop is passed correctly to `MovieCarouselCard`
- Check Firestore `Users/{userId}/watchedMovies` array

### Issue: "User not authenticated" error
**Solution:**
- Ensure user is signed in before accessing Movie Club
- Add authentication check before allowing watchlist actions
- Verify Firebase Auth is configured correctly

## Firebase Console Monitoring

Monitor these collections for activity:

### 1. Users Collection
```
Users/{userId}
  → watchedMovies: [...]
  → fcmToken: "..."
```

### 2. MovieWatchers Collection
```
MovieWatchers/2025-01__action__The Matrix
  → watchers: [
      {id: "user1", userName: "John", ...},
      {id: "user2", userName: "Jane", ...}
    ]
```

### 3. NotificationQueue Collection
```
NotificationQueue/{autoId}
  → tokens: ["token1", "token2"]
  → title: "🎬 Movie Club Update"
  → body: "John just watched The Matrix!"
```

## Performance Tips

1. **Batch Loading**: Watchers are loaded per-genre, not per-movie
2. **Caching**: Avatar images are cached automatically by AsyncImage
3. **Debouncing**: Consider adding a small delay if users rapidly toggle
4. **Pagination**: If watchlist grows large, implement pagination

## Next Steps

1. ✅ Test thoroughly with multiple users
2. ✅ Monitor Firebase usage in Console
3. ✅ Set up Firebase Cloud Function for processing NotificationQueue (optional)
4. ✅ Add analytics events for watch actions
5. ✅ Consider adding a "Watch Activity Feed" view
6. ✅ Add user profile page showing all watched movies

## Support

- **Firebase Issues**: Check Firebase Console → Usage → Errors
- **Build Issues**: Clean build folder (⌘ + Shift + K) and rebuild
- **Runtime Issues**: Check Xcode console for error logs

## Additional Features to Consider

1. **Watch Ratings**: Allow users to rate movies they've watched
2. **Comments**: Let users comment when marking as watched
3. **Watch Streaks**: Track consecutive months of watching
4. **Leaderboards**: Show who watches the most movies
5. **Recommendations**: Suggest movies based on watch history

---

**Questions?** Check the full implementation details in `WATCHLIST_FEATURE_IMPLEMENTATION.md`

