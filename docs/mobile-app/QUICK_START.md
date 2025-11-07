# 🚀 Quick Start Guide

Get your Movie Club iOS app running in 5 minutes!

## ✅ Step-by-Step Checklist

### 1️⃣ Open Project in Xcode
- [ ] Open `Movie Club Cafe.xcodeproj` in Xcode
- [ ] Make sure you're running Xcode 15.0 or later
- [ ] Select your development team in project settings

### 2️⃣ Add Firebase SDK (2 minutes)
- [ ] In Xcode: **File → Add Packages**
- [ ] Paste: `https://github.com/firebase/firebase-ios-sdk`
- [ ] Select version: **11.0.0** or later
- [ ] Add packages:
  - ✅ **FirebaseCore**
  - ✅ **FirebaseFirestore**
- [ ] Wait for packages to download

### 3️⃣ Configure Firebase (1 minute)

**Option A - Quick (Using GoogleService-Info.plist):**
- [ ] Download `GoogleService-Info.plist` from [Firebase Console](https://console.firebase.google.com/)
- [ ] Drag it into Xcode project (make sure "Copy items" is checked)
- [ ] Update `Config/FirebaseConfig.swift` line 16 to just: `FirebaseApp.configure()`

**Option B - Flexible (Using Environment Variables):**
- [ ] **Product → Scheme → Edit Scheme**
- [ ] **Run → Arguments → Environment Variables**
- [ ] Add your Firebase credentials (see ENVIRONMENT_SETUP.md)

### 4️⃣ Build and Run! (30 seconds)
- [ ] Select a simulator (iPhone 15 Pro recommended)
- [ ] Press **⌘ + R** to build and run
- [ ] App should launch and show Movie Club interface! 🎉

### 5️⃣ Verify It Works
- [ ] You should see the gradient background (#d2d2cb → #4d695d)
- [ ] "Movie Club" title should appear at top
- [ ] Month selector should show available months
- [ ] Movie cards should load (if you have data in Firebase)

## 🎯 What You Should See

```
┌─────────────────────────────┐
│      Movie Club  [TMDB]     │  ← Header
├─────────────────────────────┤
│  [June 2025 ▼] [Watch Recap]│  ← Month selector
├──────────────┬──────────────┤
│   Action     │    Drama     │  ← Movie cards
│ [Poster Img] │ [Poster Img] │
│  ⭐⭐⭐⭐⭐    │  ⭐⭐⭐⭐⭐    │
├──────────────┼──────────────┤
│   Comedy     │   Thriller   │
│ [Poster Img] │ [Poster Img] │
│  ⭐⭐⭐⭐⭐    │  ⭐⭐⭐⭐⭐    │
├─────────────────────────────┤
│     🎬 Genre Pools          │  ← Pools section
│  [Action] [Drama] [Comedy]  │
│  [List of movies...]        │
└─────────────────────────────┘
```

## 🐛 Troubleshooting

### "FirebaseApp not initialized"
```
Fix: Make sure FirebaseConfig.shared.configure() 
     is called in Movie_Club_CafeApp.swift init()
```

### "No such module 'FirebaseCore'"
```
Fix: Add Firebase packages via File → Add Packages
     URL: https://github.com/firebase/firebase-ios-sdk
```

### "Permission denied" from Firestore
```
Fix: Update your Firebase security rules to allow read:
     Go to Firebase Console → Firestore → Rules
     Add: allow read: if true;
```

### No movies showing
```
Possible reasons:
1. No data in Firebase yet (add some via web version)
2. Wrong Firebase project (check credentials)
3. Internet connection (check simulator/device network)
```

### Images not loading
```
Fix: TMDB images should load automatically with default API key
     If not, check your internet connection
```

## 🎨 Customization Quick Tips

### Change Colors
Edit `Theme/AppTheme.swift`:
```swift
static let accentColor = Color(hex: "YOUR_COLOR")
```

### Change Access Code
Edit `Views/MovieSubmissionView.swift` line 22:
```swift
private let validAccessCode = "your_code_here"
```

### Add More Recap Links
Edit `Views/SelectedMoviesView.swift` line 12-15:
```swift
let recapLinks: [String: String] = [
    "2025-07": "youtube_video_id",
    // Add more...
]
```

## 📊 Check Your Data

Your Firebase should have these collections:

```
Firestore Database:
├─ MonthlySelections/
│  ├─ 2025-01/        ← Monthly selections
│  ├─ 2025-02/
│  └─ 2025-06/
├─ GenrePools/
│  └─ current/        ← Current pools
└─ Submissions/
   └─ 2025-06/        ← User submissions
      └─ users/
```

Add test data via Firebase Console or your web app!

## 🎓 Next Steps

Once it's running:
1. Test month selector - switch between different months
2. Tap movie cards - overlay should show details
3. Click trailer links - should open YouTube
4. Try submission form (if submissions are open)
5. Check genre pools at bottom

## 📚 Need More Help?

- **Full Documentation**: See `README.md`
- **Environment Setup**: See `ENVIRONMENT_SETUP.md`
- **Project Overview**: See `PROJECT_OVERVIEW.md`
- **Setup Details**: See `SETUP.md`

## ✨ That's It!

Your Movie Club app is now running and connected to the same Firebase database as your website. Any data you add via the web will automatically appear in the iOS app! 

---

**Time spent**: ~5 minutes
**Result**: Full-featured iOS app matching your website ✅

