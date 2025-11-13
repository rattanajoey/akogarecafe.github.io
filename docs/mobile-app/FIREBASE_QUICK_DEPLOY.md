# Firebase Features - Quick Deployment Guide
## Movie Club Cafe iOS App

**Last Updated**: November 7, 2025

---

## Prerequisites ✅

- ✅ Xcode installed with all Firebase SDKs
- ✅ Firebase CLI installed: `npm install -g firebase-tools`
- ✅ Firebase project: `movie-club-cafe` (or your project ID)
- ✅ Logged in: `firebase login`

---

## Quick Deploy Steps

### 1. Deploy Firebase Rules (5 minutes)

```bash
cd "/Users/kavyrattana/Coding/akogarecafe.github.io/Movie Club Cafe"

# Check which project you're connected to
firebase projects:list

# Select your project (if not already)
firebase use movie-club-cafe

# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules

# Expected output:
# ✔ Deploy complete!
```

### 2. Enable Firebase Features in Console (10 minutes)

#### A. Analytics (Automatic)
- Already enabled ✅
- No setup required
- Data appears after first app launch

#### B. Crashlytics (Required)
1. Go to: https://console.firebase.google.com/project/movie-club-cafe/crashlytics
2. Click "Enable Crashlytics"
3. That's it! Next crash will be reported

#### C. Remote Config (Optional but Recommended)
1. Go to: https://console.firebase.google.com/project/movie-club-cafe/config
2. Click "Get Started"
3. Import template:
   ```bash
   firebase deploy --only remoteconfig
   ```
4. Or manually create parameters:
   - `submission_enabled` = true
   - `chat_enabled` = true
   - `max_submissions_per_user` = 1
   - etc. (see `remoteconfig.template.json`)

#### D. Performance Monitoring (Automatic)
1. Go to: https://console.firebase.google.com/project/movie-club-cafe/performance
2. Click "Get Started"
3. Data appears after first app launch

#### E. Dynamic Links (Required for Sharing)
1. Go to: https://console.firebase.google.com/project/movie-club-cafe/durablelinks
2. Click "Get Started"
3. Add URL prefix: `https://movieclubcafe.page.link`
4. Click "Finish"

⚠️ **Note**: You'll need to verify domain ownership:
   - Add DNS TXT record or
   - Upload verification file to your website

#### F. Storage (Already Configured)
1. Go to: https://console.firebase.google.com/project/movie-club-cafe/storage
2. Rules are already deployed ✅
3. Ready to use!

#### G. In-App Messaging (Optional)
1. Go to: https://console.firebase.google.com/project/movie-club-cafe/inappmessaging
2. Click "Get Started"
3. Create your first campaign when ready

#### H. App Check (Recommended for Security)
1. Go to: https://console.firebase.google.com/project/movie-club-cafe/appcheck
2. Click "Get Started"
3. Register iOS app: `com.akogarecafe.Movie-Club-Cafe`
4. Choose "DeviceCheck" provider
5. Click "Save"
6. Enable enforcement for Firestore and Storage (optional)

#### I. Cloud Messaging (Already Working)
- Already configured ✅
- Device tokens being registered
- Ready for notifications

---

### 3. Build and Test (5 minutes)

```bash
# Open Xcode project
open "Movie Club Cafe.xcodeproj"

# Build and run (Cmd+R)
# Or from terminal:
xcodebuild -scheme "Movie Club Cafe" -configuration Debug
```

**Test Checklist**:
- [ ] App launches without errors
- [ ] Check Xcode console for Firebase logs:
  ```
  ✅ Firebase configured with all features enabled
  ✅ Firestore configured with offline persistence
  ✅ Analytics configured
  ✅ Crashlytics configured (or disabled in DEBUG)
  ✅ Remote Config initialized
  ✅ Performance Monitoring configured
  ✅ FCM token: <token>
  ```

---

### 4. Verify Firebase Console (10 minutes)

#### After 5-10 minutes of app usage:

**A. Analytics**
- Go to: Analytics → Events
- Look for:
  - `screen_view`
  - `movie_viewed`
  - `user_engagement`

**B. Crashlytics**
- Go to: Crashlytics → Dashboard
- Should show "Waiting for data..." (if no crashes)
- Test crash (optional):
  ```swift
  fatalError("Test crash") // Remove after testing
  ```

**C. Performance**
- Go to: Performance → Dashboard
- Look for:
  - App start time
  - Screen rendering metrics

**D. Storage**
- Go to: Storage → Files
- Should see folder structure:
  ```
  /profile_pictures
  /chat_images
  /movie_posters
  /temp
  ```

---

## Common Issues & Solutions

### Issue: "Firebase not configured"

**Solution**:
```bash
# Make sure GoogleService-Info.plist is in the project
# Check if it's included in target membership
```

### Issue: "Crashlytics SDK not initialized"

**Solution**:
1. Clean build folder: Cmd+Shift+K
2. Delete DerivedData:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
3. Rebuild project

### Issue: "Storage rules permission denied"

**Solution**:
```bash
# Deploy storage rules again
firebase deploy --only storage:rules

# Verify rules in console:
# Storage → Rules → Check rules are active
```

### Issue: "Dynamic Links not working"

**Solution**:
1. Verify domain is approved in Firebase Console
2. Check Associated Domains capability in Xcode:
   - Target → Signing & Capabilities
   - Add: `applinks:movieclubcafe.page.link`
3. Test on physical device (not simulator)

### Issue: "Remote Config values not updating"

**Solution**:
```swift
// Force fetch (for testing only)
RemoteConfigService.shared.remoteConfig.fetch(withExpirationDuration: 0) { status, error in
    if status == .success {
        RemoteConfigService.shared.remoteConfig.activate { _, _ in
            print("Remote Config updated!")
        }
    }
}
```

---

## Debug Mode Setup

### Enable Analytics Debug Mode

1. Edit Scheme → Run → Arguments
2. Add argument: `-FIRAnalyticsDebugEnabled`
3. Run app
4. Go to: Analytics → DebugView
5. See events in real-time

### Enable Crashlytics Debug Logging

1. Edit Scheme → Run → Arguments
2. Add argument: `-FIRDebugEnabled`
3. Run app
4. See detailed logs in Xcode console

---

## Production Checklist

Before releasing to App Store:

- [ ] Remove all `-FIRDebugEnabled` and `-FIRAnalyticsDebugEnabled` arguments
- [ ] Verify Crashlytics is enabled in Release builds
- [ ] Test all Firebase features on physical device
- [ ] Review Firebase security rules
- [ ] Set up App Check enforcement
- [ ] Configure Remote Config production values
- [ ] Test Dynamic Links on production domain
- [ ] Set up Firebase Alerts (Crashlytics, Performance)
- [ ] Review Analytics data collection compliance
- [ ] Update Privacy Policy with Firebase services

---

## Monitoring & Maintenance

### Daily
- Check Crashlytics dashboard for new crashes
- Review Analytics events for anomalies

### Weekly
- Review Performance metrics
- Check Storage usage
- Update Remote Config as needed

### Monthly
- Review Analytics trends
- Clean up unused Storage files
- Review and optimize Firebase rules
- Check for Firebase SDK updates

---

## Firebase CLI Commands Reference

```bash
# Login
firebase login

# List projects
firebase projects:list

# Select project
firebase use <project-id>

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only remoteconfig

# Deploy everything
firebase deploy

# View current deployment
firebase projects:list
firebase status

# Open Firebase Console
firebase open
```

---

## Cost Monitoring

### Free Tier Limits (Spark Plan)

- **Firestore**: 50K reads/day, 20K writes/day
- **Storage**: 5GB total, 1GB downloads/day
- **Analytics**: Unlimited
- **Crashlytics**: Unlimited
- **Remote Config**: Unlimited
- **Performance**: Unlimited
- **Dynamic Links**: 100K/month

### Upgrade to Blaze Plan (Pay-as-you-go)

If you exceed free tier:
```bash
firebase projects:upgrade
```

### Cost Estimates for Movie Club Cafe

**Estimated Monthly Costs** (for 1000 active users):
- Firestore: $0-5
- Storage: $0-2
- Cloud Functions: $0-5 (for notifications)
- **Total**: ~$10-15/month

---

## Support & Resources

- **Firebase Status**: https://status.firebase.google.com
- **Firebase Documentation**: https://firebase.google.com/docs
- **Firebase Console**: https://console.firebase.google.com
- **Firebase Support**: https://firebase.google.com/support

---

## What's Next?

After deployment, you can:

1. **Create In-App Messages**
   - Welcome new users
   - Promote movie submissions
   - Announce new features

2. **Set Up A/B Testing**
   - Test different UI variations with Remote Config
   - Track conversion with Analytics

3. **Monitor User Behavior**
   - Identify most popular movies
   - Track user retention
   - Optimize user flows

4. **Set Up Alerts**
   - Get notified of crashes
   - Performance degradation alerts
   - Budget alerts

---

**Deployment Time**: ~30 minutes total
**Status**: ✅ Ready to Deploy

**Questions?** Check `FIREBASE_FEATURES_COMPLETE.md` for detailed documentation.

