# Firebase Chat & Notifications Setup Guide

This guide covers the setup of real-time chat messaging and push notifications for the Movie Club Cafe iOS app.

## Overview

The app now includes:
- **Real-time Chat**: Users can chat with each other in chat rooms
- **Push Notifications**: Firebase Cloud Messaging (FCM) for push notifications
- **Real-time Notifications**: In-app notification center with badges
- **Admin Notifications**: Admins can send announcements to all users

## Firebase Collections Structure

### 1. ChatRooms Collection

```
ChatRooms/
  {chatRoomId}/
    - name: string
    - description: string (optional)
    - createdAt: timestamp
    - createdBy: string (userId)
    - lastMessage: string (optional)
    - lastMessageTimestamp: timestamp (optional)
    - memberIds: array of userIds
    - isPublic: boolean
    
    Messages/
      {messageId}/
        - senderId: string
        - senderName: string
        - senderPhotoURL: string (optional)
        - text: string
        - timestamp: timestamp
        - isRead: boolean
        - type: string (text, system, movieRecommendation)
```

### 2. Users Collection (Extended)

```
Users/
  {userId}/
    - existing user fields...
    - fcmToken: string (device token for push notifications)
    - lastTokenUpdate: timestamp
    
    Notifications/
      {notificationId}/
        - title: string
        - body: string
        - type: string (movie_update, admin_announcement, etc.)
        - timestamp: timestamp
        - senderId: string (optional)
        - senderName: string (optional)
        - isRead: boolean
        - actionUrl: string (optional)
        - metadata: map (optional)
```

### 3. AdminNotifications Collection

```
AdminNotifications/
  {notificationId}/
    - title: string
    - body: string
    - type: string
    - timestamp: timestamp
    - senderId: string
    - senderName: string
    - metadata: map (optional)
```

This collection triggers a Cloud Function that broadcasts to all users.

## Firebase Security Rules

Add these rules to your Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Chat Rooms
    match /ChatRooms/{chatRoomId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                      (resource.data.createdBy == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
      
      // Messages within chat rooms
      match /Messages/{messageId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() && 
                        request.resource.data.senderId == request.auth.uid;
        allow update: if isAuthenticated() && 
                        (resource.data.senderId == request.auth.uid || 
                         request.resource.data.keys().hasOnly(['isRead']));
        allow delete: if resource.data.senderId == request.auth.uid || isAdmin();
      }
    }
    
    // User Notifications
    match /Users/{userId}/Notifications/{notificationId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && request.auth.uid == userId &&
                      request.resource.data.keys().hasOnly(['isRead']);
      allow delete: if request.auth.uid == userId || isAdmin();
    }
    
    // Admin Notifications (broadcast to all users)
    match /AdminNotifications/{notificationId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Existing rules for other collections...
  }
}
```

## Firebase Cloud Functions

Create a Cloud Function to broadcast admin notifications to all users:

### Setup Cloud Functions

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

2. Initialize Cloud Functions in your project:
```bash
cd "Movie Club Cafe"
firebase init functions
```

3. Create the notification broadcaster:

**functions/index.js:**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Broadcast admin notifications to all users
exports.broadcastNotification = functions.firestore
  .document('AdminNotifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const db = admin.firestore();
    
    try {
      // Get all users
      const usersSnapshot = await db.collection('Users').get();
      
      // Create notification for each user
      const batch = db.batch();
      usersSnapshot.docs.forEach(userDoc => {
        const notificationRef = db
          .collection('Users')
          .doc(userDoc.id)
          .collection('Notifications')
          .doc();
        
        batch.set(notificationRef, {
          ...notification,
          isRead: false
        });
      });
      
      await batch.commit();
      
      // Send FCM push notifications
      const tokens = usersSnapshot.docs
        .map(doc => doc.data().fcmToken)
        .filter(token => token);
      
      if (tokens.length > 0) {
        const message = {
          notification: {
            title: notification.title,
            body: notification.body
          },
          tokens: tokens
        };
        
        await admin.messaging().sendMulticast(message);
      }
      
      console.log('Notification broadcast successfully');
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  });

// Auto-notify when monthly selections are updated
exports.notifyMonthlySelectionUpdate = functions.firestore
  .document('MonthlySelections/{monthId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) return; // Document deleted
    
    const monthId = context.params.monthId;
    const db = admin.firestore();
    
    const notification = {
      title: "Monthly Selections Updated! 🍿",
      body: `Check out the new movie selections for ${monthId}!`,
      type: "monthly_selection",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { month: monthId }
    };
    
    await db.collection('AdminNotifications').add(notification);
  });

// Auto-notify when a new movie is submitted
exports.notifyNewSubmission = functions.firestore
  .document('Submissions/{monthId}/users/{nickname}')
  .onCreate(async (snap, context) => {
    const { monthId, nickname } = context.params;
    const db = admin.firestore();
    
    const notification = {
      title: "New Movie Submission! 🎬",
      body: `${nickname} has submitted movies for ${monthId}!`,
      type: "new_submission",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { month: monthId, submitter: nickname }
    };
    
    await db.collection('AdminNotifications').add(notification);
  });
```

4. Deploy Cloud Functions:
```bash
firebase deploy --only functions
```

## iOS App Configuration

### 1. Add Firebase Messaging to Package.swift or Xcode

The app already includes Firebase. Ensure `FirebaseMessaging` is added:

In Xcode:
- File → Add Packages
- Add Firebase package if not already added
- Select `FirebaseMessaging` library

### 2. Enable Push Notifications Capability

1. In Xcode, select your project
2. Select the "Movie Club Cafe" target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and enable "Remote notifications"

### 3. Configure APNs (Apple Push Notification service)

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to Certificates, Identifiers & Profiles
3. Create an APNs Authentication Key:
   - Keys → Create a new key
   - Enable "Apple Push Notifications service (APNs)"
   - Download the .p8 key file
   - Note the Key ID

4. Upload to Firebase:
   - Go to Firebase Console → Project Settings
   - Select "Cloud Messaging" tab
   - Under "iOS app configuration"
   - Upload your APNs Authentication Key (.p8 file)
   - Enter Key ID and Team ID

## Testing

### Test Real-time Chat

1. Build and run the app on a simulator or device
2. Sign in with a user account
3. Navigate to the "Chat" tab
4. Create a new chat room
5. Send messages
6. Open the app on another device/simulator with a different user
7. Verify messages appear in real-time

### Test Notifications

1. Sign in as an admin user
2. Navigate to Admin → Send Notifications
3. Fill in title and body
4. Click "Send to All Users"
5. Check other user devices - they should receive:
   - In-app notification in Notification Center
   - Badge on Notifications tab
   - Push notification (if app is in background)

### Test Auto Notifications

1. As admin, update monthly movie selections
2. All users should automatically receive a notification
3. Submit a new movie
4. Admin should receive a notification about the submission

## Notification Types

- `movie_update`: When a movie is added/updated
- `admin_announcement`: Admin broadcasts
- `new_submission`: New movie submission
- `monthly_selection`: Monthly selections updated
- `chat_mention`: User mentioned in chat
- `oscar_voting`: Oscar voting related
- `general`: General notifications

## Troubleshooting

### Push notifications not working

1. Verify APNs key is uploaded to Firebase
2. Check device token is being saved to Firestore
3. Verify app has notification permissions (Settings → Movie Club Cafe → Notifications)
4. Check that FCM token is being generated and stored

### Real-time updates not working

1. Verify Firestore Security Rules are correctly set
2. Check network connectivity
3. Verify Firebase initialization in app
4. Check Xcode console for error messages

### Chat messages not appearing

1. Verify user is authenticated
2. Check Firestore Security Rules
3. Verify chat room ID is correct
4. Check for listener registration

## Best Practices

1. **Always check user authentication** before sending messages
2. **Rate limit notifications** to avoid spam
3. **Use batch writes** for multiple Firestore operations
4. **Clean up listeners** when views disappear
5. **Handle errors gracefully** with user-friendly messages
6. **Test on real devices** for push notifications
7. **Monitor Cloud Functions** for errors and performance

## Cost Considerations

- **Firestore**: Free tier includes 50K reads, 20K writes per day
- **Cloud Functions**: Free tier includes 2M invocations per month
- **FCM**: Unlimited and free
- **Cloud Messaging**: Monitor usage in Firebase Console

## Security Best Practices

1. Never expose admin functionality to regular users
2. Validate all user input before sending to Firestore
3. Use Security Rules to prevent unauthorized access
4. Rate limit notification sending
5. Sanitize message content to prevent XSS
6. Store sensitive data server-side only

## Future Enhancements

- [ ] Direct messaging between users
- [ ] Message reactions and emojis
- [ ] Image/video sharing in chat
- [ ] Voice messages
- [ ] Notification preferences per user
- [ ] Message search
- [ ] Chat room moderation tools
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message threading

## Support

For issues or questions:
- Check Xcode console for error logs
- Review Firebase Console for function logs
- Check Firestore Security Rules
- Verify APNs configuration in Apple Developer Portal

