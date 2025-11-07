# Chat & Notifications - Quick Start Guide

## 🎉 What's New

Your Movie Club Cafe app now has:

✅ **Real-time Chat** - Users can chat with each other in chat rooms  
✅ **Push Notifications** - Firebase Cloud Messaging for alerts  
✅ **Notification Center** - In-app notifications with badges  
✅ **Admin Broadcasts** - Send announcements to all users  
✅ **Auto Notifications** - Automatic alerts for movie updates  

## 🚀 Quick Setup (5 Steps)

### Step 1: Update Firebase Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy the contents of `FIREBASE_SECURITY_RULES.txt`
5. Paste into the rules editor
6. Click **Publish**

### Step 2: Enable Push Notifications in Xcode

1. Open `Movie Club Cafe.xcodeproj` in Xcode
2. Select the project → Select "Movie Club Cafe" target
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability** → Add **Push Notifications**
5. Click **+ Capability** → Add **Background Modes**
6. Check **Remote notifications**

### Step 3: Configure APNs (Apple Push Notifications)

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Go to **Certificates, Identifiers & Profiles** → **Keys**
3. Click **+** to create a new key
4. Name it "Movie Club Cafe APNs Key"
5. Check **Apple Push Notifications service (APNs)**
6. Click **Continue** → **Register** → **Download** the `.p8` file
7. Note your **Key ID** and **Team ID**

### Step 4: Upload APNs Key to Firebase

1. Go to Firebase Console → Your Project
2. Click gear icon → **Project Settings**
3. Select **Cloud Messaging** tab
4. Under **iOS app configuration**:
   - Upload your `.p8` file
   - Enter **Key ID**
   - Enter **Team ID** (find in Apple Developer account)
5. Click **Upload**

### Step 5: Deploy Cloud Functions (Optional but Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize functions
cd "Movie Club Cafe"
firebase init functions
# Select your project
# Choose JavaScript or TypeScript
# Install dependencies: Yes

# Copy the Cloud Functions code
cp firebase-functions-index.js functions/index.js

# Deploy
firebase deploy --only functions
```

## 📱 Using the Features

### For All Users

#### Chat
1. Open the app → Go to **Chat** tab
2. Tap **+** to create a new chat room
3. Enter room name and description
4. Start chatting!
5. Messages appear in real-time for all users

#### Notifications
1. Go to **Notifications** tab
2. View all notifications
3. Tap to mark as read
4. Badge shows unread count
5. Receive push notifications when app is in background

### For Admin Users

#### Send Announcement
1. Go to **Admin** tab → **Send Notifications**
2. Enter notification title and body
3. Select notification type
4. Preview your notification
5. Tap **Send to All Users**
6. All users receive it instantly!

#### Quick Actions
- Use preset templates for common notifications
- "Monthly Selections Updated"
- "New Movie Added"

## 🔔 Automatic Notifications

These happen automatically (when Cloud Functions are deployed):

- **Monthly Selections Updated**: When you update monthly movies
- **New Submission**: When a user submits movies
- **Movie Updates**: When movies are added to genre pools

## 🧪 Testing

### Test Chat (2 devices/simulators)

1. **Device 1**: Sign in as User A
2. **Device 2**: Sign in as User B
3. **Device 1**: Create a chat room
4. **Device 2**: Join the same room
5. Send messages from both devices
6. ✅ Messages should appear in real-time on both

### Test Notifications

1. **Sign in as Admin**
2. Go to Admin → Send Notifications
3. Fill in title: "Test Notification"
4. Fill in body: "This is a test!"
5. Click Send
6. **On another device** (signed in as regular user):
   - Check Notifications tab
   - Should see the notification
   - Badge should show "1"

### Test Push Notifications

1. Have app open on **Device A**
2. On **Device B** (admin): Send a notification
3. **Close or background the app** on Device A
4. ✅ Should receive a push notification banner

## 📊 Feature Overview

### Chat Features
- ✅ Create public chat rooms
- ✅ Real-time message delivery
- ✅ Message timestamps
- ✅ User avatars
- ✅ Unread message badges
- ✅ Scroll to latest message
- 🔮 Future: Private messages, reactions, images

### Notification Features
- ✅ In-app notification center
- ✅ Push notifications (FCM)
- ✅ Unread badges
- ✅ Mark as read
- ✅ Different notification types with icons
- ✅ Admin broadcasts
- ✅ Auto notifications for movie updates
- 🔮 Future: Notification preferences, filters

## 🔧 Troubleshooting

### Push Notifications Not Working

**Problem**: Not receiving push notifications

**Solutions**:
1. Check Settings → Movie Club Cafe → Notifications (should be enabled)
2. Verify APNs key is uploaded to Firebase
3. Check Xcode console for FCM token
4. Ensure device is registered for remote notifications
5. Test on a real device (not simulator for production APNs)

### Chat Messages Not Appearing

**Problem**: Messages don't show up in real-time

**Solutions**:
1. Check internet connection
2. Verify Firebase Security Rules are published
3. Check Xcode console for Firestore errors
4. Ensure user is authenticated
5. Try force closing and reopening the app

### No Unread Badge

**Problem**: Badge doesn't show unread count

**Solutions**:
1. Check that messages are marked as unread
2. Verify listener is active in ContentView
3. Check badge permissions in iOS Settings
4. Restart the app

### Admin Can't Send Notifications

**Problem**: Admin notification view shows "Admin Only"

**Solutions**:
1. Verify user role in Firestore:
   - Go to Firestore Console
   - Navigate to `users/{userId}`
   - Ensure `role` field is set to `"admin"`
2. Re-authenticate if role was just changed
3. Check AuthenticationService.isAdmin property

## 📝 Firestore Collections

### ChatRooms
```
ChatRooms/{chatRoomId}
  - name: string
  - description: string
  - createdAt: timestamp
  - createdBy: userId
  - lastMessage: string
  - lastMessageTimestamp: timestamp
  - memberIds: [userId]
  - isPublic: boolean
  
  Messages/{messageId}
    - senderId: userId
    - senderName: string
    - senderPhotoURL: string
    - text: string
    - timestamp: timestamp
    - isRead: boolean
    - type: "text" | "system" | "movieRecommendation"
```

### Notifications
```
users/{userId}/Notifications/{notificationId}
  - title: string
  - body: string
  - type: string
  - timestamp: timestamp
  - senderId: userId
  - senderName: string
  - isRead: boolean
  - actionUrl: string (optional)
  - metadata: map (optional)
```

### AdminNotifications (Broadcast Trigger)
```
AdminNotifications/{notificationId}
  - title: string
  - body: string
  - type: string
  - timestamp: timestamp
  - senderId: userId
  - senderName: string
  - metadata: map (optional)
```

## 🎨 Customization

### Change Accent Color

In all views, the accent color is:
```swift
Color(red: 0.74, green: 0.15, blue: 0.18) // #bc252d
```

Replace this color to match your brand.

### Change Notification Icons

Edit `NotificationCard.swift`:
```swift
private var iconName: String {
    switch notification.type {
    case .movieUpdate: return "film.fill" // Change icon here
    // ...
    }
}
```

### Add New Notification Types

1. Add to `ChatModels.swift`:
```swift
enum NotificationType: String, Codable {
    case yourNewType = "your_new_type"
}
```

2. Update icon mappings in `NotificationCard.swift`

## 🚀 Next Steps

1. ✅ Test all features thoroughly
2. ✅ Deploy Cloud Functions for auto-notifications
3. ✅ Set up APNs for push notifications
4. 📱 Test on real devices
5. 🎨 Customize UI to match your style
6. 📊 Monitor Firebase usage in console
7. 🔐 Review and test security rules

## 📚 Additional Resources

- **Full Setup Guide**: See `FIREBASE_CHAT_NOTIFICATIONS_SETUP.md`
- **Security Rules**: See `FIREBASE_SECURITY_RULES.txt`
- **Cloud Functions**: See `firebase-functions-index.js`
- **Firebase Docs**: https://firebase.google.com/docs
- **FCM Docs**: https://firebase.google.com/docs/cloud-messaging

## 💡 Tips

1. **Test incrementally**: Test each feature as you set it up
2. **Use real devices**: Push notifications work better on real devices
3. **Monitor costs**: Check Firebase usage in console (free tier is generous)
4. **Backup rules**: Always backup your security rules before changes
5. **Version control**: Commit your changes before deploying
6. **User feedback**: Ask beta users to test notifications

## 🎬 Demo Flow

1. **Admin** updates monthly movie selections
2. **Auto-notification** is sent to all users
3. **All users** see notification in Notifications tab
4. **Users** receive push notification
5. **Users** tap notification → Navigate to Movie Club
6. **Users** go to Chat tab → Discuss movies
7. **Real-time** chat messages appear instantly
8. **Admin** sends announcement: "Oscar voting open!"
9. **Everyone** is notified immediately

## Need Help?

- Check the troubleshooting section above
- Review the detailed setup guide
- Check Firebase Console logs
- Review Xcode console for errors
- Verify all 5 setup steps are complete

---

**Congratulations!** 🎉 Your Movie Club Cafe app now has real-time chat and notifications!

