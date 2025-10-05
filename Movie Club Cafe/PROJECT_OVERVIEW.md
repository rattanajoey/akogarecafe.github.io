# Movie Club Cafe iOS App - Project Overview

## 🎯 What Was Built

A complete iOS app that mirrors the Movie Club functionality from your website (akogarecafe.com), including:

### Core Features
- ✅ Monthly movie selections display with TMDB integration
- ✅ Movie posters, ratings, and detailed information
- ✅ Genre pools viewer (Action, Drama, Comedy, Thriller)
- ✅ Movie submission form
- ✅ Firebase Firestore integration (same database as web)
- ✅ TMDB API integration with movie search and details
- ✅ Month selector with historical data
- ✅ YouTube trailer links
- ✅ Matching color scheme and design from website

## 📁 Project Structure

```
Movie Club Cafe/
├── Config/
│   └── FirebaseConfig.swift           # 🔥 Firebase setup & configuration
│
├── Services/
│   └── TMDBService.swift              # 🎬 TMDB API service
│       ├── searchMovie()              # Search for movies
│       ├── getMovieDetails()          # Get detailed movie info
│       ├── getPosterURL()             # Get poster images
│       └── getTrailerURL()            # Get YouTube trailer links
│
├── Models/
│   └── MovieModels.swift              # 📊 Data structures
│       ├── Movie                      # Movie data model
│       ├── MonthlySelections          # Monthly picks
│       ├── GenrePools                 # Genre pool data
│       └── Genre enum                 # Genre definitions
│
├── Theme/
│   └── AppTheme.swift                 # 🎨 Colors & styling
│       └── Matches web: #d2d2cb → #4d695d gradient
│
├── Views/
│   ├── MovieClubView.swift            # 🏠 Main container view
│   ├── SelectedMoviesView.swift       # 📅 Monthly selections
│   │   ├── Month selector dropdown
│   │   ├── Movie cards grid (2 columns)
│   │   ├── Tap to show details overlay
│   │   └── Trailer links
│   │
│   ├── GenrePoolView.swift            # 📚 Genre pools display
│   │   └── Shows remaining movies in each genre
│   │
│   └── MovieSubmissionView.swift      # ✍️ Submission form
│       ├── Nickname & password fields
│       ├── 4 genre movie inputs
│       └── Firebase submission
│
├── ContentView.swift                  # 🚪 App entry point
└── Movie_Club_CafeApp.swift          # ⚙️ App initialization

Documentation:
├── README.md                          # Full documentation
├── SETUP.md                          # Quick setup guide
└── PROJECT_OVERVIEW.md               # This file
```

## 🎨 Design Match

### Colors (Matching Web Version)
```swift
Background Gradient: #d2d2cb → #4d695d
Accent Color:        #bc252d (red)
Text Primary:        #2c2c2c (dark gray)
Card Background:     White at 90% opacity
```

### Typography
- Header: System Serif, Bold, 34pt
- Movie Titles: Headline weight
- Body Text: Caption & Caption2
- Matches the web's Merriweather serif style

### Layout
- 2-column grid for movie cards (responsive)
- Gradient background (top to bottom)
- Rounded cards with shadows
- Tap/hover overlays for movie details

## 🔌 API Integration

### Firebase Firestore
**Collections Used:**
1. `MonthlySelections/{monthId}` - Selected movies for each month
   - Format: `2025-01`, `2025-02`, etc.
   - Contains: action, drama, comedy, thriller movies

2. `GenrePools/current` - Current pool of submitted movies
   - Updated when movies are selected
   - Shows remaining options

3. `Submissions/{monthId}/users/{nickname}` - User submissions
   - Stores user movie picks
   - Requires access code validation

### TMDB API
**Endpoints Used:**
1. `/search/movie` - Search for movies by title
2. `/movie/{id}` - Get detailed movie information
3. Includes: ratings, posters, trailers, budget, revenue, etc.

**Features:**
- Smart search with year matching
- Vote-weighted sorting
- Automatic poster image loading
- YouTube trailer link generation
- Language name localization

## 🔄 Data Flow

```
1. App Launch
   └─> FirebaseConfig.configure()
   └─> Load MonthlySelections
   └─> Load GenrePools

2. Month Selection
   └─> Fetch selections for selected month
   └─> For each movie:
       └─> Search TMDB by title
       └─> Fetch detailed movie data
       └─> Display poster & info

3. Movie Interaction
   └─> Tap card to show/hide overlay
   └─> Overlay shows full movie details
   └─> Trailer link opens YouTube

4. Movie Submission
   └─> User enters movies
   └─> Validate access code
   └─> Submit to Firebase
   └─> Success/error feedback
```

## 🚀 Key Components

### MovieClubView (Main Container)
- Entry point for the movie club feature
- Manages state for selections and pools
- Coordinates data loading from Firebase
- Shows either display mode or submission mode

### SelectedMoviesView (Core Feature)
- Displays 4 genre cards in a grid
- Month selector dropdown
- TMDB data integration
- Interactive overlays with movie details
- Star ratings (converted from 10-point scale)
- YouTube recap links for specific months

### GenrePoolView (Pool Display)
- Shows remaining movies in each genre
- Simple card layout
- Bullet-point list of movies
- Submitted by attribution

### MovieSubmissionView (Submission Form)
- Password-protected submission
- 4 genre input fields
- Firebase write operation
- Error handling and validation
- Success/update confirmation

## 🔐 Security

### Access Control
- Submission requires password: "thunderbolts"
- Case-sensitive nickname validation
- Firebase rules should be configured for:
  - Public read access to MonthlySelections & GenrePools
  - Authenticated/validated write to Submissions

### API Keys
- TMDB: Public key included (or use environment variable)
- Firebase: Configured via GoogleService-Info.plist or env vars

## 📱 iOS Features

### SwiftUI Components Used
- ScrollView, VStack, HStack, ZStack
- LazyVGrid for responsive grid layouts
- AsyncImage for network image loading
- Menu for dropdowns
- TextField & SecureField for forms
- Link for external URLs
- Alert for notifications
- Custom styled buttons and cards

### iOS APIs Used
- FirebaseCore & FirebaseFirestore
- URLSession for API calls
- DateFormatter for date handling
- JSONDecoder for API response parsing
- Task/await for async operations

## 🎯 Testing Checklist

Before deploying:
- [ ] Firebase connection works
- [ ] TMDB images load correctly
- [ ] Month selector shows all available months
- [ ] Movie cards display properly
- [ ] Overlays show/hide on tap
- [ ] Trailer links open in Safari/YouTube
- [ ] Genre pools display correctly
- [ ] Submission form validates input
- [ ] Submission writes to Firebase
- [ ] Error messages display properly

## 🔄 Syncing with Web

The iOS app reads from the **same Firebase database** as your web version:
- When you update monthly selections on web, they appear in the app
- When users submit via app, submissions go to the same collection
- Genre pools are synchronized
- No separate admin needed!

## 🎓 Next Steps

### Potential Enhancements
1. **Authentication**: Add user login with Firebase Auth
2. **Push Notifications**: Notify when new month is selected
3. **Favorites**: Let users save favorite movies
4. **Ratings**: Allow users to rate watched movies
5. **Comments**: Add discussion feature
6. **Offline Mode**: Cache movie data for offline viewing
7. **Dark Mode**: Add dark theme support
8. **iPad Layout**: Optimize for larger screens
9. **Share**: Share movies to social media
10. **Calendar Integration**: Add movie nights to calendar

### Production Checklist
- [ ] Add proper Firebase security rules
- [ ] Get your own TMDB API key (for production)
- [ ] Add app icon
- [ ] Add launch screen
- [ ] Configure App Store metadata
- [ ] Test on multiple devices
- [ ] Submit to App Store

## 📚 Resources

- [Firebase iOS Documentation](https://firebase.google.com/docs/ios)
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui/)
- [Your Website](https://akogarecafe.com)

---

Built with ❤️ to match akogarecafe.com

