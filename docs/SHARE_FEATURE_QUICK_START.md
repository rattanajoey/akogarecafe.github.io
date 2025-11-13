# Share Feature - Quick Start Guide

## 🎉 Feature Added - Now Enhanced! ✨

The invite/share feature has been successfully implemented for both web and iOS apps with **rich metadata and app icon support**!

### 🆕 Latest Enhancement
- ✅ **App icon** displayed in iOS share sheet
- ✅ **Open Graph metadata** for rich social media previews
- ✅ **Twitter Card** support with large image previews
- ✅ **Professional appearance** across all platforms

📖 **See full details:** [Enhanced Share Feature Documentation](./ENHANCED_SHARE_FEATURE.md)

---

## 📱 For Users

### Web App (akogarecafe.com)

**How to Share:**

1. **From Header** (Top of page)
   - Look for the share icon (📤) next to social media icons
   - Click to share

2. **From Speed Dial** (Bottom right corner)
   - Click the Nira character icon
   - Click the share icon in the menu
   - Select how you want to share

**What Happens:**
- On mobile: Native share sheet appears (share to any app)
- On desktop: Link is copied to clipboard automatically
- You'll see a confirmation message

### iOS App (Movie Club Cafe)

**How to Share:**

1. **From Profile Tab**
   - Tap "Profile" at the bottom
   - Scroll down to Actions section
   - Tap "Share App"

2. **From Movie Club Tab**
   - On Movie Club screen
   - Tap the share icon (📤) in the top right
   - Select how you want to share

**What Happens:**
- Native iOS share sheet appears
- Share via iMessage, Email, AirDrop, or any installed app
- Includes a friendly message and link

---

## 🛠️ For Developers

### Quick Setup

**Web - Already Integrated ✅**
- Component: `src/components/InviteShare/InviteShare.jsx`
- Used in: Header and SpeedDial
- No additional setup needed

**iOS - File Added ✅**
- Service: `Movie Club Cafe/Services/ShareHelper.swift`
- Integrated in: ProfileView and MovieClubView
- Xcode will auto-detect the new file

### First Time Build (iOS)

1. Open Xcode project:
   ```bash
   cd "Movie Club Cafe"
   open "Movie Club Cafe.xcodeproj"
   ```

2. If ShareHelper.swift is not in project navigator:
   - File → Add Files to "Movie Club Cafe"
   - Select `ShareHelper.swift` from Services folder
   - ✅ Check "Movie Club Cafe" target
   - Click "Add"

3. Build the project:
   - Select simulator or device
   - Press ⌘+B to build
   - Press ⌘+R to run

### Testing the Feature

**Web:**
```bash
# Start dev server
npm start

# Test in browser at http://localhost:3000
# Try share button in header or speed dial
```

**iOS:**
```bash
# From Xcode, run on simulator or device
# Test both Profile and Movie Club share buttons
```

---

## 📝 Customization

### Change Share Message

**Web** (`src/components/SpeedDial/SpeedDialComponent.jsx`):
```javascript
const shareText = "Your custom message here 🎬";
```

**iOS** (`Services/ShareHelper.swift`):
```swift
static var shareMessage: String {
    """
    Your custom message here 🎬
    """
}
```

### Change Share URL

**Web**:
- Update `siteUrl` in `SpeedDialComponent.jsx` and `InviteShare.jsx`

**iOS**:
- Update `websiteURL` in `ShareHelper.swift`
- Update `appStoreURL` when app is published

---

## 🐛 Troubleshooting

### Web Issues

**Share button not visible:**
- Clear browser cache
- Restart dev server
- Check console for errors

**Clipboard not working:**
- Check browser permissions
- Try HTTPS (not HTTP)
- Test in different browser

### iOS Issues

**ShareHelper not found:**
```bash
# Clean build folder
⌘+Shift+K in Xcode

# Rebuild
⌘+B
```

**Share sheet not appearing:**
- Check you're testing on simulator/device (not preview)
- Verify sheet modifier is present
- Check `showingShareSheet` state

---

## 📦 Files Summary

### Created Files

**Web:**
- ✅ `src/components/InviteShare/InviteShare.jsx`
- ✅ `docs/INVITE_SHARE_FEATURE.md` (full documentation)
- ✅ `docs/SHARE_FEATURE_QUICK_START.md` (this file)

**iOS:**
- ✅ `Movie Club Cafe/Services/ShareHelper.swift`

### Modified Files

**Web:**
- ✅ `src/components/Header/HeaderComponent.jsx`
- ✅ `src/components/SpeedDial/SpeedDialComponent.jsx`

**iOS:**
- ✅ `Movie Club Cafe/Views/Auth/ProfileView.swift`
- ✅ `Movie Club Cafe/Views/MovieClubView.swift`

---

## ✨ What's Next?

### Immediate Next Steps
1. Build and test on iOS device
2. Test all share methods (iMessage, Email, etc.)
3. Verify share message looks good
4. Test on different browsers

### Future Enhancements
- Add share analytics tracking
- Create referral system
- Add deep linking support
- Share specific movies
- Customized messages per user

---

## 🎯 Feature Status

- ✅ Web implementation complete
- ✅ iOS implementation complete
- ✅ Documentation complete
- ⏳ Testing pending (requires your verification)
- ⏳ App Store URL update (when app is published)

---

## 💡 Pro Tips

1. **Test on real devices** for best results (especially iOS)
2. **Share to yourself** first to verify message looks good
3. **Check spam folders** when testing email shares
4. **Use AirDrop** between devices to test full flow

---

## 📞 Need Help?

See full documentation: `docs/INVITE_SHARE_FEATURE.md`

Common issues are covered in the Troubleshooting section above.

---

Happy sharing! 🎉

