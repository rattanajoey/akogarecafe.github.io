# Invite & Share Feature

## Overview
The Invite & Share feature allows users to easily share Akogare Cafe with friends via social media, messaging apps, or by copying a link. The feature is available on both the web app and iOS app.

---

## Web Implementation

### Locations
The share feature is accessible from two locations on the web:

1. **Header (Social Media Section)** - Always visible in the top navigation bar
2. **Speed Dial (Nira Menu)** - Quick access menu in the bottom right corner

### Features

#### Web Share API
- On mobile browsers and supported desktop browsers, uses the native Web Share API
- Allows sharing directly to installed apps (iMessage, WhatsApp, Email, etc.)
- Provides a consistent, native sharing experience

#### Fallback - Copy to Clipboard
- For browsers that don't support Web Share API
- Automatically copies the website URL to clipboard
- Shows a confirmation snackbar notification

### Share Content
- **URL**: `https://akogarecafe.com`
- **Title**: Akogare Cafe
- **Message**: "Check out Akogare Cafe - A cozy corner for anime, manga, music, and monthly movie club! 🎬🎵"

### Files Created/Modified

#### New Files
- `src/components/InviteShare/InviteShare.jsx` - Reusable share component

#### Modified Files
- `src/components/Header/HeaderComponent.jsx` - Added share button to header
- `src/components/SpeedDial/SpeedDialComponent.jsx` - Added share action to speed dial

### Usage

```jsx
import InviteShare from "../InviteShare/InviteShare";

// Use as icon button (in header)
<InviteShare variant="icon" />

// Use in SpeedDial or other components
// The component handles share logic internally
```

### User Flow

1. User clicks the share icon (📤) in header or speed dial
2. If Web Share API is available:
   - Native share sheet appears
   - User can choose from available apps/services
3. If Web Share API is not available:
   - URL is copied to clipboard
   - Snackbar notification confirms copy
4. Share complete! ✨

---

## iOS Implementation

### Locations
The share feature is accessible from two locations in the iOS app:

1. **Profile Tab** - "Share App" button in the Actions section
2. **Movie Club Tab** - Share icon (📤) in the top navigation bar

### Features

#### Native iOS Share Sheet
- Uses `UIActivityViewController` for native iOS sharing
- Supports all iOS share options:
  - iMessage, SMS
  - Email
  - Social media (Facebook, Twitter, etc.)
  - AirDrop
  - Notes, Reminders
  - Copy to clipboard
  - And any other installed share extensions

### Share Content
- **URL**: `https://akogarecafe.com`
- **Message**: 
  ```
  Join me on Movie Club Cafe! 🎬
  
  A cozy corner for anime, manga, music, and monthly movie club! 🍿✨
  
  Check it out: https://akogarecafe.com
  ```

### Files Created/Modified

#### New Files
- `Movie Club Cafe/Services/ShareHelper.swift` - Share utility and SwiftUI wrapper

#### Modified Files
- `Movie Club Cafe/Views/Auth/ProfileView.swift` - Added "Share App" button
- `Movie Club Cafe/Views/MovieClubView.swift` - Added share icon to header

### Usage

```swift
import SwiftUI

// In your SwiftUI view
@State private var showingShareSheet = false

// Add button
Button(action: {
    showingShareSheet = true
}) {
    Label("Share App", systemImage: "square.and.arrow.up")
}

// Add sheet modifier
.sheet(isPresented: $showingShareSheet) {
    ShareSheet(items: [
        ShareHelper.shareMessage,
        URL(string: ShareHelper.websiteURL)!
    ])
}

// Alternative: Direct programmatic sharing
ShareHelper.presentShareSheet()
```

### Utility Methods

```swift
// Default share with message and URL
ShareHelper.presentShareSheet()

// Custom items
ShareHelper.presentShareSheet(items: [yourCustomMessage, yourURL])

// Share via specific app (e.g., iMessage)
ShareHelper.shareVia(activityType: .message)
```

### User Flow

1. User taps the share button/icon
2. Native iOS share sheet appears
3. User selects their preferred sharing method
4. Message and link are shared
5. Share sheet dismisses
6. Share complete! ✨

---

## Future Enhancements

### When App is Published to App Store
Update `ShareHelper.swift`:

```swift
static let appStoreURL = "https://apps.apple.com/app/movie-club-cafe/idXXXXXXXXX"
```

This will allow sharing the direct App Store link for easier app installation.

### Potential Features
- [ ] Track share analytics (how many times shared, via which platform)
- [ ] Referral system (invite codes)
- [ ] Share specific movie selections
- [ ] Share monthly movie club results
- [ ] Deep linking (open specific sections from shared links)
- [ ] Personalized share messages (include username)
- [ ] Share to Discord (custom integration)

---

## Testing

### Web Testing

1. **Desktop Browser** (Chrome, Firefox, Safari)
   - Click share icon in header or speed dial
   - Should copy URL to clipboard
   - Verify snackbar notification appears
   - Paste in notepad to confirm URL copied correctly

2. **Mobile Browser** (iOS Safari, Chrome)
   - Click share icon
   - Native share sheet should appear
   - Test sharing to Messages, Notes, etc.
   - Verify URL and message are correct

### iOS App Testing

1. **iPhone Simulator**
   - Open app and sign in
   - Navigate to Profile tab
   - Tap "Share App"
   - Share sheet should appear (limited options in simulator)
   - Alternatively, go to Movie Club tab
   - Tap share icon in header
   - Verify share sheet appears

2. **Physical iPhone Device**
   - Build and run on device
   - Test sharing via iMessage (send to yourself)
   - Test sharing via Email
   - Test AirDrop (to another device)
   - Test copying to clipboard
   - Verify all share options work correctly

### Cross-Platform Testing

1. Share from web to iPhone (via iMessage or email)
2. Share from iPhone to web (via desktop)
3. Verify links work and open correct page
4. Test on multiple devices and browsers

---

## Browser/Device Compatibility

### Web
- ✅ **Chrome/Edge** (Desktop): Clipboard fallback
- ✅ **Firefox** (Desktop): Clipboard fallback
- ✅ **Safari** (Desktop): Clipboard fallback
- ✅ **iOS Safari**: Native Web Share API
- ✅ **Chrome Mobile**: Native Web Share API
- ✅ **Samsung Internet**: Native Web Share API

### iOS
- ✅ **iOS 15.0+**: Full support
- ✅ **iOS 14.0+**: Full support
- ✅ **iOS 13.0+**: Full support (if deployment target supports)
- ✅ **iPad**: Full support with popover positioning

---

## Technical Details

### Web Share API Detection
```javascript
if (navigator.share) {
  // Use native share
} else {
  // Fallback to clipboard
}
```

### Error Handling
- Web: Catches share errors and falls back to clipboard
- iOS: UIActivityViewController handles errors automatically
- User cancellation is handled gracefully (no error shown)

### Accessibility
- All buttons have proper ARIA labels
- Icon buttons include tooltips
- Works with screen readers
- Keyboard navigation supported

---

## Design Integration

### Web
- Matches existing Material-UI theme
- Uses accent color: `#4ecdc4`
- Icon: `ShareIcon` from Material-UI
- Snackbar notifications for feedback
- Smooth animations and transitions

### iOS
- Uses SF Symbols: `square.and.arrow.up`
- Matches AppTheme accent color
- Native iOS animations
- Consistent with iOS Human Interface Guidelines

---

## Analytics Considerations

If you want to track shares, you can add analytics:

### Web
```javascript
// In handleShare function
gtag('event', 'share', {
  method: navigator.share ? 'native' : 'clipboard',
  content_type: 'website',
  content_id: 'akogarecafe'
});
```

### iOS
```swift
// In ShareSheet or ProfileView
Analytics.logEvent("share_app", parameters: [
    "method": "native_ios",
    "source": "profile_tab"
])
```

---

## Troubleshooting

### Web Issues

**Share button doesn't work**
- Check browser console for errors
- Verify clipboard permissions
- Test in incognito/private mode

**Snackbar doesn't appear**
- Check Material-UI is properly imported
- Verify state management is working
- Look for React errors in console

### iOS Issues

**Share sheet doesn't appear**
- Verify ShareHelper.swift is in target
- Check import statements
- Build and clean project
- Restart Xcode

**Share message is empty**
- Check URL is valid
- Verify shareMessage has content
- Test with simple string first

**iPad popover issues**
- Provide sourceView for positioning
- See ShareHelper for iPad support

---

## Maintenance

### Updating Share Message
Edit the message in both implementations:

**Web**: `src/components/SpeedDial/SpeedDialComponent.jsx`
```javascript
const shareText = "Your new message here";
```

**iOS**: `Movie Club Cafe/Services/ShareHelper.swift`
```swift
static var shareMessage: String {
    """
    Your new message here
    """
}
```

### Updating Share URL
If domain changes, update:

**Web**: 
- `SpeedDialComponent.jsx` - `siteUrl`
- `InviteShare.jsx` - `siteUrl`

**iOS**: 
- `ShareHelper.swift` - `websiteURL` and `appStoreURL`

---

## Resources

- [Web Share API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [UIActivityViewController Documentation](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller)
- [Material-UI Snackbar](https://mui.com/material-ui/react-snackbar/)
- [SwiftUI Sheet](https://developer.apple.com/documentation/swiftui/view/sheet(ispresented:ondismiss:content:))

