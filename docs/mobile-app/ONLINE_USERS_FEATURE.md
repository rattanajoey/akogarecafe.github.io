# Online Users Feature - Movie Club Chat 👥

## Overview

The chat now shows **who's online in real-time**! Users can see how many people are currently active and view a list of online members.

## What Was Added

### 1. **Online User Tracking**
- Automatically marks users as online when they enter the chat
- Marks users as offline when they leave
- Real-time updates using Firestore listeners

### 2. **Online Users Button** (Top Right)
- Shows count of online users (e.g., "👥 3")
- Green dot indicator when users are online
- Tap to see full list of who's online

### 3. **Online Users View**
- Full-screen list of all online users
- Shows user avatars (or initials)
- Green "Active now" indicator
- Beautiful cards with user info

## Files Added/Modified

### New Files
- **Views/OnlineUsersView.swift** - UI for viewing online users list

### Modified Files
- **Services/ChatService.swift** - Added online user tracking
- **Views/MainChatView.swift** - Added online users button & tracking
- **FIREBASE_SECURITY_RULES.txt** - Added OnlineUsers subcollection rules

## How It Works

### User Flow
1. User opens the Chat tab
2. Automatically marked as online
3. Added to `ChatRooms/main-chat-room/OnlineUsers` collection
4. Other users see the count update in real-time
5. When user leaves chat → automatically removed from online list

### Firestore Structure
```
ChatRooms/
  main-chat-room/
    OnlineUsers/
      {userId}/
        - userId: string
        - displayName: string
        - photoURL: string (optional)
        - isOnline: boolean
        - lastSeen: timestamp
```

## UI Features

### Navigation Bar Button
```
[👥 3]  ← Button in top right
```
- Red accent color matching app theme
- Badge-style design
- Shows real-time count
- Green dot indicator

### Online Users List
- Scrollable list of all online users
- User avatars with fallback to initials
- Green dot "Active now" status
- Clean white cards on gradient background
- "Done" button to close

## Firebase Security Rules

The new rules allow:
- ✅ Anyone signed in can **read** online users
- ✅ Users can **write/delete** their own status
- ❌ Users cannot modify others' status

```javascript
// Online Users tracking
match /OnlineUsers/{userId} {
  allow read: if isSignedIn();
  allow write: if isSignedIn() && request.auth.uid == userId;
  allow delete: if isSignedIn() && request.auth.uid == userId;
}
```

## Setup Instructions

### 1. Update Firebase Rules
Copy the updated `FIREBASE_SECURITY_RULES.txt` to Firebase Console:
1. Go to Firebase Console → Firestore → Rules
2. Paste the new rules (includes OnlineUsers section)
3. Click **Publish**

### 2. Test the Feature
1. Build and run the app
2. Sign in and go to Chat tab
3. You should see "👥 1" in the top right
4. Tap it to see the online users list
5. Open app on another device → count updates to "👥 2"

## Key Features

✅ **Real-time Updates** - Count and list update instantly  
✅ **Automatic Tracking** - No manual action needed  
✅ **Privacy Friendly** - Only shows basic info (name, avatar)  
✅ **Performant** - Uses Firestore listeners efficiently  
✅ **Clean UI** - Matches app's design aesthetic  
✅ **Auto Cleanup** - Removes users when they leave  

## Technical Details

### Presence Tracking
```swift
// On chat appear
try await chatService.markUserOnline()
chatService.listenToOnlineUsers()

// On chat disappear
await chatService.markUserOffline()
```

### Real-time Listener
```swift
@Published var onlineUsers: [UserStatus] = []

func listenToOnlineUsers() {
    db.collection("ChatRooms/main-chat-room/OnlineUsers")
        .addSnapshotListener { snapshot, error in
            self.onlineUsers = // parse users
        }
}
```

## Future Enhancements

Possible additions:
- [ ] "Last seen" timestamp for offline users
- [ ] Typing indicators ("User is typing...")
- [ ] Status messages (e.g., "Watching movies...")
- [ ] Direct message to online users
- [ ] Sort by recently active
- [ ] Filter/search online users

## Troubleshooting

### Count Shows 0 But I'm Signed In
**Solution:**
- Check Firebase rules are published
- Verify user is authenticated
- Check Xcode console for errors
- Try closing and reopening the chat

### Users Not Updating in Real-time
**Solution:**
- Check internet connection
- Verify listener is active (check console logs)
- Try force-closing and reopening the app

### Permission Denied Error
**Solution:**
- Update Firebase Security Rules
- Make sure OnlineUsers section is included
- Click "Publish" in Firebase Console

## Testing Checklist

- [ ] Single user shows count of 1
- [ ] Multiple users show correct count
- [ ] Tapping button opens users list
- [ ] Users list shows avatars/names
- [ ] Count updates when users join/leave
- [ ] Leaving chat removes user from list
- [ ] Re-entering chat adds user back

## Design Details

**Colors:**
- Accent: `#bc252d` (red)
- Background gradient: `#d2d2cb` → `#4d695d`
- Online indicator: Green
- Card background: White with opacity

**Icons:**
- Online users: `person.2.fill`
- Individual users: Circle avatars
- Status: Green dot

## Summary

The online users feature adds a **social element** to the Movie Club chat, showing members who's currently active and available to chat. It's **automatic**, **real-time**, and **seamlessly integrated** into the existing chat UI.

Users can now see:
- "How many people are online right now?"
- "Who's available to chat?"
- "Is anyone else in the movie club active?"

This encourages engagement and makes the chat feel more **alive and interactive**! 🎬💬

---

**Status:** ✅ Complete and Ready to Use  
**Firebase Rules:** Updated with OnlineUsers support  
**UI:** Integrated into MainChatView  
**Testing:** Ready for testing on multiple devices

