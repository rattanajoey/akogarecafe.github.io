# Watchlist Feature Implementation Summary

## Overview
Implemented a complete watchlist feature for the Movie Club Cafe iOS app that allows users to mark movies as watched, see who else has watched each movie, and receive push notifications when someone watches a movie.

## Features Implemented

### 1. User Watchlist Tracking
- Users can mark any Movie Club selection (current or historical) as watched
- Users can unmark movies if accidentally clicked
- Watch history is stored with timestamps, month, and genre information

### 2. Social Features
- **Avatar Stack**: Displays overlapping circular avatars of all users who watched each movie
- Shows up to 5 avatars with a "+X more" indicator for additional watchers
- Avatars display user profile pictures or colorful gradient circles with initials

### 3. Visual Indicators
- **Checkmark Badge**: Green circle with white checkmark appears on top-right of poster when user has watched the movie
- **Dynamic Button**: Changes between "Mark as Watched" (red) and "Unmark as Watched" (green)
- Real-time UI updates when watch status changes

### 4. Push Notifications
- Immediate notification blast to all users when someone marks a movie as watched
- Notification format: "🎬 Movie Club Update - {UserName} just watched {MovieTitle}!"
- Integrates with existing Firebase Cloud Messaging infrastructure

## Files Created

### `/Services/WatchlistService.swift`
Core service handling all watchlist functionality:
- `toggleWatchStatus()` - Mark/unmark movies as watched
- `fetchMovieWatchers()` - Get list of users who watched a movie
- `checkIfWatched()` - Check if user has watched a specific movie
- `sendWatchNotification()` - Trigger push notifications to all users

## Files Modified

### 1. `/Models/MovieModels.swift`
**Added:**
- `MovieWatcher` struct - Stores watcher information (userId, userName, photoURL, watchedAt)

### 2. `/Models/UserModel.swift`
**Added:**
- `WatchedMovie` struct - Stores detailed watch history per movie
- `fcmToken` property - For push notification targeting
- Helper methods:
  - `hasWatched()` - Check if user watched a specific movie
  - `addWatchedMovie()` - Add to watch history
  - `removeWatchedMovie()` - Remove from watch history

### 3. `/Services/NotificationService.swift`
**Added:**
- `notifyMovieWatched()` - Send notification when user watches a movie
- Already had `storeFCMToken()` method for token management

### 4. `/Views/SelectedMoviesView.swift`
**Major UI Updates:**
- Added state tracking for watchers and watch status per genre
- `loadWatchersAndStatus()` - Fetches watchers and status for all movies
- `handleWatchToggle()` - Handles mark/unmark actions
- Updated `MovieCarouselCard` with new parameters:
  - `watchers: [MovieWatcher]`
  - `isWatched: Bool`
  - `onWatchToggle: () -> Void`

**UI Components Added:**
- Checkmark badge overlay on movie poster (ZStack with Circle + Image)
- Avatar stack component below poster
- Watch/Unmark button in action buttons section

**New Components:**
- `WatcherAvatarStack` - Displays overlapping avatar circles
- `WatcherAvatar` - Individual avatar with photo or initials

## Firebase Structure

### Collections Created

#### `MovieWatchers/{monthId}__{genre}__{movieTitle}`
Stores all watchers for each specific movie:
```swift
{
  "watchers": [
    {
      "id": "userId",
      "userName": "User Name",
      "photoURL": "https://...",
      "watchedAt": Timestamp
    }
  ]
}
```

#### Updated: `Users/{userId}`
Added to user document:
```swift
{
  "watchedMovies": [
    {
      "movieTitle": "Movie Title",
      "monthId": "2025-01",
      "genre": "action",
      "watchedAt": Timestamp
    }
  ],
  "fcmToken": "device_token_string"
}
```

#### `NotificationQueue` (for processing)
Stores pending notifications for Cloud Function processing:
```swift
{
  "tokens": ["token1", "token2", ...],
  "title": "🎬 Movie Club Update",
  "body": "UserName just watched MovieTitle!",
  "data": {
    "type": "movie_watched",
    "movieTitle": "...",
    "genre": "...",
    "userName": "..."
  }
}
```

## User Flow

### Marking a Movie as Watched
1. User opens Movie Club and views a movie
2. User taps "Mark as Watched" button
3. `WatchlistService.toggleWatchStatus()` is called
4. Service adds entry to user's `watchedMovies` array
5. Service adds user to `MovieWatchers` collection
6. Service triggers notification to all users
7. UI updates immediately:
   - Green checkmark badge appears on poster
   - Button changes to "Unmark as Watched" (green)
   - User's avatar appears in avatar stack
8. All users receive push notification

### Unmarking a Movie
1. User taps "Unmark as Watched" button
2. Service removes entry from user's `watchedMovies` array
3. Service removes user from `MovieWatchers` collection
4. UI updates:
   - Checkmark badge disappears
   - Button changes back to "Mark as Watched" (red)
   - User's avatar removed from stack

## Design Details

### Checkmark Badge
- **Position**: Top-right corner of poster
- **Style**: 44x44pt green circle with white checkmark icon
- **Shadow**: 4pt radius for depth
- **Icon**: SF Symbol "checkmark" (size 24, bold)

### Avatar Stack
- **Layout**: Horizontal stack with -12pt spacing (overlapping)
- **Size**: 40x40pt circles
- **Border**: 2pt white stroke
- **Max Visible**: 5 avatars + "+X more" indicator
- **Z-Index**: Higher for earlier watchers (layered left to right)
- **Fallback**: Gradient circle with first letter initial if no photo

### Watch Button
- **States**:
  - Unwatched: Red (`AppTheme.accentColor`), "eye.circle" icon
  - Watched: Green, "checkmark.circle.fill" icon
- **Style**: Full width, rounded corners (12pt), bold text
- **Position**: Above trailer button in action section

## Technical Notes

### Real-time Updates
- Uses Firebase Firestore listeners for real-time watch status updates
- Avatar stack refreshes automatically when new watchers are added
- UI responds immediately to user actions with optimistic updates

### Performance
- Watchers are fetched only when viewing a specific month
- Batch queries minimize Firebase reads
- Avatar images are async loaded with caching

### Error Handling
- All async operations wrapped in try-catch
- Graceful fallbacks for missing data (empty avatar stack, default avatars)
- User feedback through button state changes

## Future Enhancements (Optional)

1. **Watch Activity Feed**: Dedicated view showing recent watches from all users
2. **Reactions**: Allow users to react to others' watches with emojis
3. **Watch Parties**: Schedule group watch events
4. **Stats**: Show personal and club-wide watch statistics
5. **Recommendations**: Suggest movies based on watch history

## Testing Checklist

- [ ] Mark a current month movie as watched
- [ ] Mark a historical movie as watched
- [ ] Unmark a watched movie
- [ ] Verify checkmark badge appears/disappears correctly
- [ ] Verify button changes color and text
- [ ] Verify avatar stack updates in real-time
- [ ] Test with multiple users watching same movie
- [ ] Test avatar stack with >5 watchers
- [ ] Test with user without profile photo (initials display)
- [ ] Verify push notifications are sent
- [ ] Test notification content and formatting
- [ ] Test on different iPhone sizes

## Dependencies

No new dependencies required! The implementation uses:
- Existing Firebase Firestore setup
- Existing Firebase Auth
- Existing notification infrastructure
- SwiftUI native components

## Notes

- The `NotificationQueue` collection is used to queue notifications for a Cloud Function to process
- Alternatively, you can implement direct FCM sending from the iOS app using Firebase Cloud Messaging SDK
- All Firebase security rules should be updated to allow reads/writes to `MovieWatchers` collection
- Users must be authenticated to use watch features (enforced by `Auth.auth().currentUser` checks)

---

**Implementation Date**: November 7, 2025  
**iOS Version**: SwiftUI (iOS 15+)  
**Firebase**: Firestore, Auth, Cloud Messaging

