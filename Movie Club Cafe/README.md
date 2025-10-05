# Movie Club Cafe iOS App

An iOS app for the Movie Club Cafe, matching the styling and functionality of the web version at akogarecafe.com.

## Features

- 📱 View monthly selected movies with rich TMDB data
- 🎬 Browse genre pools (Action, Drama, Comedy, Thriller)
- 🎥 Access movie trailers and detailed information
- 📝 Submit movie picks (when submissions are open)
- 🔥 Firebase Firestore integration for real-time data
- 🎨 Beautiful gradient design matching the website

## Setup Instructions

### 1. Install Firebase SDK

Add the Firebase SDK to your project using Swift Package Manager:

1. In Xcode, go to **File > Add Packages**
2. Enter the Firebase URL: `https://github.com/firebase/firebase-ios-sdk`
3. Select version 11.0.0 or later
4. Add the following packages:
   - FirebaseCore
   - FirebaseFirestore

### 2. Configure Firebase

You have two options:

#### Option A: Using GoogleService-Info.plist (Recommended)
1. Download your `GoogleService-Info.plist` from Firebase Console
2. Add it to your Xcode project (drag and drop into the project navigator)
3. Update `FirebaseConfig.swift` to use the plist:

```swift
FirebaseApp.configure()
```

#### Option B: Using Environment Variables
Set the following environment variables in your Xcode scheme:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

### 3. Configure TMDB API

The app uses TMDB API for movie data. You can:

1. Use the default API key (already included)
2. Or set your own using environment variable: `TMDB_API_KEY`

To set environment variables:
1. Edit Scheme (Product > Scheme > Edit Scheme)
2. Select "Run" > "Arguments" > "Environment Variables"
3. Add your variables

### 4. Add TMDB Logo Asset

1. Download the TMDB logo from `/public/logos/tmdb.svg` in the web project
2. Add it to Assets.xcassets as "tmdb"

### 5. Project Structure

```
Movie Club Cafe/
├── Config/
│   └── FirebaseConfig.swift       # Firebase configuration
├── Services/
│   └── TMDBService.swift          # TMDB API service
├── Models/
│   └── MovieModels.swift          # Data models
├── Theme/
│   └── AppTheme.swift             # Colors and styling
├── Views/
│   ├── MovieClubView.swift        # Main view
│   ├── SelectedMoviesView.swift   # Monthly selections
│   ├── GenrePoolView.swift        # Genre pools display
│   └── MovieSubmissionView.swift  # Submission form
├── ContentView.swift              # App entry point
└── Movie_Club_CafeApp.swift       # App initialization
```

## Color Theme

The app matches the web version's color scheme:
- Background Gradient: `#d2d2cb` → `#4d695d`
- Accent Color: `#bc252d`
- Text: `#2c2c2c`

## Firebase Collections

The app reads from these Firestore collections:

### MonthlySelections/{monthId}
```json
{
  "action": {
    "title": "Movie Title",
    "submittedBy": "Username",
    "director": "Director Name",
    "year": "2024"
  },
  "drama": { ... },
  "comedy": { ... },
  "thriller": { ... }
}
```

### GenrePools/current
```json
{
  "action": [
    { "title": "Movie", "submittedBy": "User" }
  ],
  "drama": [ ... ],
  "comedy": [ ... ],
  "thriller": [ ... ]
}
```

### Submissions/{monthId}/users/{nickname}
```json
{
  "accesscode": "password",
  "action": "Movie Title",
  "drama": "Movie Title",
  "comedy": "Movie Title",
  "thriller": "Movie Title",
  "submittedAt": timestamp
}
```

## Requirements

- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

## License

Same as the web version - for Movie Club Cafe use.

