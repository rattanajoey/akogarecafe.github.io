# 📐 Movie Club Cafe - Project Structure

## 🗂️ Complete File Tree

```
Movie Club Cafe/
│
├── 📱 Movie Club Cafe/                    [Main App Directory]
│   │
│   ├── 🔧 Config/
│   │   └── FirebaseConfig.swift          Firebase initialization & DB access
│   │
│   ├── 🎯 Services/
│   │   └── TMDBService.swift             TMDB API client (search, details, posters)
│   │
│   ├── 📊 Models/
│   │   └── MovieModels.swift             Data structures (Movie, Selections, Pools)
│   │
│   ├── 🎨 Theme/
│   │   └── AppTheme.swift                Colors, gradients, styling
│   │
│   ├── 🖼️ Views/
│   │   ├── MovieClubView.swift           Main container (entry point)
│   │   ├── SelectedMoviesView.swift      Monthly selections + TMDB integration
│   │   ├── GenrePoolView.swift           Genre pools display
│   │   └── MovieSubmissionView.swift     Submission form
│   │
│   ├── 🚀 App Files/
│   │   ├── Movie_Club_CafeApp.swift      App init + Firebase setup
│   │   └── ContentView.swift             Root view
│   │
│   └── 🎨 Assets.xcassets/
│       ├── AppIcon.appiconset/
│       └── AccentColor.colorset/
│
├── 📚 Documentation/
│   ├── README.md                         Complete documentation
│   ├── QUICK_START.md                    5-minute setup guide  ⭐ START HERE
│   ├── SETUP.md                          Detailed setup instructions
│   ├── ENVIRONMENT_SETUP.md              Firebase config details
│   ├── PROJECT_OVERVIEW.md               Architecture overview
│   ├── IMPLEMENTATION_SUMMARY.md         What was built
│   └── PROJECT_STRUCTURE.md              This file
│
├── ⚙️ Configuration/
│   └── .gitignore                        iOS + Firebase gitignore
│
└── 🔨 Xcode Project/
    └── Movie Club Cafe.xcodeproj/        Xcode project file

```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Device                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Movie Club App (SwiftUI)                │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Views Layer                                  │   │  │
│  │  │  • MovieClubView                              │   │  │
│  │  │  • SelectedMoviesView                         │   │  │
│  │  │  • GenrePoolView                              │   │  │
│  │  │  • MovieSubmissionView                        │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │           ↕                         ↕                 │  │
│  │  ┌──────────────────┐    ┌──────────────────┐       │  │
│  │  │  Services        │    │  Models          │       │  │
│  │  │  • TMDBService   │    │  • Movie         │       │  │
│  │  │  • FirebaseConfig│    │  • Selections    │       │  │
│  │  └──────────────────┘    │  • GenrePools    │       │  │
│  │           ↕               └──────────────────┘       │  │
│  └───────────┼──────────────────────────────────────────┘  │
│              ↕                                              │
└──────────────┼──────────────────────────────────────────────┘
               ↕
    ┌──────────┴──────────┐
    │                     │
    ↓                     ↓
┌─────────┐         ┌──────────┐
│ Firebase│         │   TMDB   │
│Firestore│         │   API    │
└─────────┘         └──────────┘
    ↑                     
    │ (Same database)     
    ↓                     
┌─────────┐               
│   Web   │               
│ Version │               
└─────────┘               
```

---

## 🎯 View Hierarchy

```
Movie_Club_CafeApp
│
└── ContentView
    │
    └── MovieClubView  ━━━━━━━━━━━━━━━━━━━━━━━┓
        │                                     ┃ Main Container
        ├── Header                            ┃ • Manages state
        │   ├── Title: "Movie Club"           ┃ • Loads Firebase data
        │   └── TMDB Logo Link                ┃ • Coordinates views
        │                                     ┃
        ├── SelectedMoviesView  ━━━━━━━━━━━━━╋━━━┓
        │   │                                 ┃   ┃ Monthly Display
        │   ├── Month Selector Dropdown       ┃   ┃ • Month dropdown
        │   ├── Recap Button (if available)   ┃   ┃ • 4 genre cards
        │   │                                 ┃   ┃ • TMDB integration
        │   └── Movie Grid (2 columns)        ┃   ┃ • Interactive overlays
        │       ├── MovieCard (Action) ━━━━━━━╋━━━╋━━━┓
        │       │   ├── Genre Header          ┃   ┃   ┃ Movie Card
        │       │   ├── Poster Image          ┃   ┃   ┃ • Poster from TMDB
        │       │   ├── Overlay (tap to show) ┃   ┃   ┃ • Star rating
        │       │   │   ├── Title             ┃   ┃   ┃ • Submitted by
        │       │   │   ├── Overview          ┃   ┃   ┃ • Trailer link
        │       │   │   ├── Details           ┃   ┃   ┃ • Tap for details
        │       │   │   └── Budget/Revenue    ┃   ┃   ┃
        │       │   ├── Title                 ┃   ┃   ┃
        │       │   ├── Rating (⭐⭐⭐⭐⭐)      ┃   ┃   ┃
        │       │   ├── Submitted By          ┃   ┃   ┃
        │       │   └── Trailer Link          ┃   ┃   ┃
        │       │                             ┃   ┃   ┃
        │       ├── MovieCard (Drama)         ┃   ┃   ┃
        │       ├── MovieCard (Comedy)        ┃   ┃   ┃
        │       └── MovieCard (Thriller)      ┃   ┃   ┃
        │                                     ┃   ┃   ┃
        └── GenrePoolView  ━━━━━━━━━━━━━━━━━━╋━━━╋━━━┛
            │                                 ┃   ┃ Genre Pools
            ├── Title: "🎬 Genre Pools"       ┃   ┃ • 4 genre cards
            │                                 ┃   ┃ • List of movies
            └── Pool Grid (2 columns)         ┃   ┃ • Submitted by
                ├── GenrePoolCard (Action)    ┃   ┃
                ├── GenrePoolCard (Drama)     ┃   ┃
                ├── GenrePoolCard (Comedy)    ┃   ┃
                └── GenrePoolCard (Thriller)  ┃   ┃
                                              ┃   ┃
Alternative View (when submissions open):     ┃   ┃
        └── MovieSubmissionView  ━━━━━━━━━━━━━╋━━━┛
            ├── Title                         ┃ Submission Form
            ├── Nickname Field                ┃ • Password protected
            ├── Password Field                ┃ • 4 genre inputs
            ├── 4 Genre Input Fields          ┃ • Firebase write
            └── Submit Button                 ┃ • Validation
                                              ┃
                                              ┗━━━━━━━━━━━━━━━━━━
```

---

## 🔧 Service Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TMDBService                          │
│  (Singleton: TMDBService.shared)                        │
│                                                         │
│  Methods:                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ searchMovie(title: String)                      │   │
│  │   → Returns: TMDBMovie?                         │   │
│  │   - Cleans title (removes year)                 │   │
│  │   - Searches TMDB API                           │   │
│  │   - Filters by quality                          │   │
│  │   - Sorts by weighted score                     │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ getMovieDetails(movieId: Int)                   │   │
│  │   → Returns: TMDBMovie                          │   │
│  │   - Fetches full movie details                  │   │
│  │   - Includes videos (trailers)                  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ getPosterURL(posterPath: String?)               │   │
│  │   → Returns: URL?                               │   │
│  │   - Generates 500px poster URL                  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ getTrailerURL(videos: TMDBVideos?)              │   │
│  │   → Returns: URL?                               │   │
│  │   - Finds YouTube trailer                       │   │
│  │   - Generates YouTube URL                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  FirebaseConfig                         │
│  (Singleton: FirebaseConfig.shared)                     │
│                                                         │
│  Methods:                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ configure()                                     │   │
│  │   - Initializes Firebase app                    │   │
│  │   - Uses env vars or GoogleService-Info.plist   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ db: Firestore                                   │   │
│  │   - Returns Firestore database instance         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Models

```
┌──────────────────────┐
│       Movie          │
├──────────────────────┤
│ + id: UUID           │
│ + title: String      │
│ + submittedBy: String│
│ + director: String?  │
│ + year: String?      │
│ + posterUrl: String? │
└──────────────────────┘
         ↑
         │ used in
         │
┌──────────────────────┐
│ MonthlySelections    │
├──────────────────────┤
│ + action: Movie?     │
│ + drama: Movie?      │
│ + comedy: Movie?     │
│ + thriller: Movie?   │
└──────────────────────┘

┌──────────────────────┐
│    GenrePools        │
├──────────────────────┤
│ + action: [Movie]    │
│ + drama: [Movie]     │
│ + comedy: [Movie]    │
│ + thriller: [Movie]  │
└──────────────────────┘

┌──────────────────────┐
│       Genre          │
│       (enum)         │
├──────────────────────┤
│ • action             │
│ • drama              │
│ • comedy             │
│ • thriller           │
├──────────────────────┤
│ + title: String      │
│ + subtitle: String   │
│ + label: String      │
└──────────────────────┘

┌──────────────────────┐
│     TMDBMovie        │
├──────────────────────┤
│ + id: Int            │
│ + title: String      │
│ + overview: String   │
│ + posterPath: String?│
│ + voteAverage: Double│
│ + releaseDate: String│
│ + runtime: Int?      │
│ + budget: Int?       │
│ + revenue: Int?      │
│ + videos: TMDBVideos?│
│ + genres: [Genre]?   │
└──────────────────────┘
```

---

## 🎨 Theme System

```
┌─────────────────────────────────────────┐
│              AppTheme                   │
├─────────────────────────────────────────┤
│ Colors:                                 │
│ • backgroundColor1: #d2d2cb (light tan) │
│ • backgroundColor2: #4d695d (green)     │
│ • accentColor: #bc252d (red)            │
│ • cardBackground: white @ 0.9 opacity   │
│ • textPrimary: #2c2c2c (dark gray)      │
│ • textSecondary: gray                   │
│                                         │
│ Gradients:                              │
│ • backgroundGradient: top → bottom      │
│   (#d2d2cb → #4d695d)                   │
│                                         │
│ Extensions:                             │
│ • Color(hex: String)                    │
│   - Converts hex strings to Color      │
└─────────────────────────────────────────┘
```

---

## 🔐 Security & Configuration

```
┌───────────────────────────────────────────────┐
│            Environment Variables              │
├───────────────────────────────────────────────┤
│                                               │
│  Firebase:                                    │
│  • FIREBASE_API_KEY                           │
│  • FIREBASE_PROJECT_ID                        │
│  • FIREBASE_APP_ID                            │
│  • FIREBASE_MESSAGING_SENDER_ID               │
│  • FIREBASE_STORAGE_BUCKET                    │
│                                               │
│  TMDB:                                        │
│  • TMDB_API_KEY (optional, has default)       │
│                                               │
│  OR                                           │
│                                               │
│  GoogleService-Info.plist                     │
│  (Contains all Firebase config)               │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 📱 iOS Requirements

```
┌────────────────────────────────────┐
│        Requirements                │
├────────────────────────────────────┤
│ • iOS 17.0+                        │
│ • Xcode 15.0+                      │
│ • Swift 5.9+                       │
│ • SwiftUI                          │
│                                    │
│ Dependencies:                      │
│ • Firebase iOS SDK 11.0+           │
│   - FirebaseCore                   │
│   - FirebaseFirestore              │
│                                    │
│ APIs:                              │
│ • Firebase Firestore (database)    │
│ • TMDB API (movie data)            │
└────────────────────────────────────┘
```

---

## 🚀 Quick Reference

### Import this to start:
```
Start here → QUICK_START.md
```

### Need help with:
```
Firebase setup    → ENVIRONMENT_SETUP.md
Understanding code → PROJECT_OVERVIEW.md
Full documentation → README.md
What was built    → IMPLEMENTATION_SUMMARY.md
```

### Files to edit for customization:
```
Colors         → Theme/AppTheme.swift
Access code    → Views/MovieSubmissionView.swift (line 22)
Recap links    → Views/SelectedMoviesView.swift (line 12-15)
Firebase       → Config/FirebaseConfig.swift
```

---

**Total Files**: 15
**Lines of Code**: ~1,500
**Setup Time**: 10 minutes
**Ready to build**: ✅

---

Created with SwiftUI • Firebase • TMDB
Matching akogarecafe.com perfectly ✨

