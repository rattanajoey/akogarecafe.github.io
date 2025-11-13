# Quick Start Guide - New Movie Club Features

Get up and running with all the new Movie Club features in 5 minutes!

## 🚀 What's New?

Your iOS app now has these new features from the web:
- ✅ **Submission List** - See who's submitted movies
- ✅ **Info Modal** - Help guide for users
- ✅ **Holding Pool** - Review submissions before approval
- ✅ **Oscar Voting** - End-of-year awards system
- ✅ **Admin Panel** - Manage monthly selections

## ⚡ Quick Setup (5 Minutes)

### 1. Deploy Firebase Security Rules (2 min)

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy contents from `FIREBASE_SECURITY_RULES.txt`
5. Paste and click **Publish**

### 2. Create Oscar Categories (1 min)

Open Firebase Console → Firestore Database → Start Collection:

**Collection ID:** `OscarCategories`

Add these documents (click "Add document" for each):

| Document ID | Field: name (string) | Field: movies (array) |
|-------------|---------------------|----------------------|
| best-action | Best Action/Sci-Fi/Fantasy | [] |
| best-drama | Best Drama/Documentary | [] |
| best-comedy | Best Comedy/Musical | [] |
| best-thriller | Best Thriller/Horror | [] |
| movie-of-year | Movie of the Year | [] |
| hidden-gem | Hidden Gem | [] |

### 3. Make Yourself Admin (2 min)

1. Sign in to the app once to create your user account
2. Open Firebase Console → Firestore → **users** collection
3. Find your user document (match your email)
4. Click the document → Add field:
   - Name: `role`
   - Type: `string`
   - Value: `admin`
5. Save, then force quit and reopen the app
6. You'll see an **Admin** tab appear!

## ✅ Verify Everything Works

### Test 1: Info Modal
- Open Movie Club tab
- Tap the ⓘ icon in the header
- ✓ Modal should show rules and guidelines

### Test 2: Submission List
- Have someone submit movies (or do it yourself)
- Scroll down in Movie Club tab
- ✓ See "Submissions for [Month]" with cards

### Test 3: Oscar Voting
- Tap "🏆 Oscar Voting" button
- Enter password: `oscar2025`
- Enter your name
- ✓ See voting categories and can vote

### Test 4: Admin Panel
- Tap Admin tab (should be visible now)
- Enter password: `adminpass`
- ✓ See genre pools and admin controls

### Test 5: Publish Selections
- In Admin tab, tap "🎲 Randomize Selections"
- Tap "💾 Save to Firestore"
- Enter password: `thunderbolts`
- ✓ Selections saved and appear in Movie Club tab

## 🔧 Optional: Customize Passwords

Edit `Config/AppConfig.swift`:

```swift
static let adminPanelPassword = "your-password"
static let publishSelectionsPassword = "your-password"
static let oscarVotingPassword = "your-password"
```

## 📚 Detailed Documentation

For more details, see:
- **MOVIE_CLUB_FEATURES_SETUP.md** - Complete setup guide
- **ADMIN_SETUP_INSTRUCTIONS.md** - Admin user setup
- **FIREBASE_SECURITY_RULES.txt** - Security rules
- **firebase_setup.json** - Sample data structure

## 🆘 Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Admin tab doesn't appear | Make sure `role: "admin"` is set in Firebase users collection, then force quit app |
| Wrong password errors | Check `Config/AppConfig.swift` for current passwords |
| Categories don't load | Create `OscarCategories` collection in Firebase |
| Can't save selections | Verify Firebase security rules are deployed |
| Submissions don't show | Check `Submissions/{month}/users/` collection exists |

## 🎉 You're Done!

All features are now active and ready to use. Your iOS app now has feature parity with the web version!

### What Users Will See:
1. Monthly movie selections with TMDB data
2. Genre pools showing available movies
3. Holding pool for reviewing submissions
4. Submission form and submission list
5. Oscar voting button (when enabled)
6. Info button for help

### What Admins Will See (You):
All of the above PLUS:
- Admin tab in tab bar
- Admin panel with selection tools
- Ability to publish monthly selections
- Oscar category management
- Holding pool approval tools

---

**Need Help?** Check the full documentation or contact support.

**Next Steps:** 
- Add more admin users
- Populate Oscar categories with movies
- Test all features before announcing to users
- Customize passwords for production

