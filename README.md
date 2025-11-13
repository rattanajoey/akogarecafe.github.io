# Akogare Cafe (憧れカフェ)

[![Website](https://img.shields.io/badge/website-akogarecafe.com-bc252d)](https://akogarecafe.com)
[![React](https://img.shields.io/badge/React-18.3+-61dafb)](https://reactjs.org/)
[![Swift](https://img.shields.io/badge/Swift-SwiftUI-orange)](https://developer.apple.com/swift/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28)](https://firebase.google.com/)
[![Material-UI](https://img.shields.io/badge/MUI-v6-0081cb)](https://mui.com/)

> A multimedia personal website celebrating Japanese culture (anime, manga, music) and hosting a collaborative Movie Club community. Built with both a React web app and a native iOS companion app sharing a unified Firebase backend.

## 🌟 Overview

Akogare Cafe is a full-stack application featuring:
- **Web Platform**: React SPA with anime/Japanese aesthetic
- **iOS App**: Native SwiftUI app with minimalist Apple UI design
- **Cross-Platform Sync**: Real-time synchronization via Firebase
- **Social Features**: Chat, notifications, user profiles, and collaborative movie selection

## ✨ Key Features

### 🎬 Movie Club (Core Feature)
The heart of Akogare Cafe - a collaborative movie selection and discussion platform:

**Monthly Selection Process:**
- 4 genre categories: Action, Drama, Comedy, Thriller
- Members submit movies via interactive TMDB search
- Admin curates selections from the pool
- Synchronized across web and iOS
- Historical archive of past selections

**Advanced Features:**
- **Movie Discovery**: Browse and search TMDB's extensive movie database
- **Genre Pools**: View submitted movies organized by genre with posters and ratings
- **Holding Pool**: Admin area for managing pending submissions
- **Oscar Voting**: Annual voting system for best movies
- **Share & Invite**: Generate shareable invite links for new members

### 📱 iOS-Exclusive Features
The iOS app extends the Movie Club experience with:
- **Real-time Chat**: Multi-room chat system with unread indicators
- **Push Notifications**: Stay updated on new movies, chat messages, and community events
- **Analytics Dashboard**: Visualize your movie preferences and participation
- **Personal Watchlist**: Save and organize movies you want to watch
- **Google Calendar Integration**: Add movie nights to your calendar
- **Profile Management**: Customize your profile with avatar and bio
- **Admin Panel**: Comprehensive admin tools for managing the community
- **Online Users**: See who's currently active in the app

### 🎵 Music Recommendations
Curated Japanese music library with:
- Animated interactive shelf display
- Album artwork and artist information
- Smooth animations and hover effects

### ♟️ Interactive Shogi
Play traditional Japanese chess in your browser:
- Full shogi rules implementation
- Piece promotion mechanics
- Captured pieces display
- Turn-based gameplay

### 💼 Portfolio
Personal projects showcase with smooth transitions and animations.

### 🎨 Design Philosophy

**Web (Anime/Japanese Aesthetic):**
- Warm gradient backgrounds: `#d2d2cb` → `#4d695d`
- Accent color: `#bc252d` (Japanese red)
- Serif typography for elegance
- Card-based layouts with smooth Framer Motion animations
- Custom mouse follower for interactive experience
- Material-UI components with custom theming

**iOS (Minimalist Apple UI):**
- Frosted glass effects (`.ultraThinMaterial`)
- SF Rounded typography
- Clean spacing (12-24pt between elements)
- Rounded corners (12-16pt radius)
- Subtle borders and shadows
- 44pt minimum tap targets
- Native iOS design patterns
- Seamless system integration

## 🚀 Quick Start

### Prerequisites
- **Web**: Node.js 16+, npm or yarn
- **iOS**: Xcode 15+, iOS 17+ deployment target
- **Backend**: Firebase project with Firestore and Authentication enabled
- **APIs**: TMDB API key

### Web Development

```bash
# Clone the repository
git clone https://github.com/yourusername/akogarecafe.github.io.git
cd akogarecafe.github.io

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env
# Edit .env with your Firebase and TMDB keys

# Start development server
npm start              # Runs at http://localhost:3000

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### iOS Development

```bash
# Navigate to iOS project
cd "Movie Club Cafe"

# Open in Xcode
open "Movie Club Cafe.xcodeproj"

# In Xcode:
# 1. Add your GoogleService-Info.plist to Config/
# 2. Update AppConfig.swift with your TMDB API key
# 3. Configure signing & capabilities
# 4. Build and run (⌘R)
```

## 🛠️ Tech Stack

### Web Application

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18.3+ | UI framework |
| **Routing** | React Router v7 | Client-side routing with HashRouter |
| **UI Library** | Material-UI v6 | Component library |
| **Styling** | Emotion | CSS-in-JS |
| **Animation** | Framer Motion 12.4+ | Smooth animations and transitions |
| **State Management** | React Query (TanStack) | Server state, caching, and data fetching |
| **Backend** | Firebase 11.4+ | Firestore, Authentication, Storage |
| **API** | Axios | HTTP client for TMDB API |
| **Build Tool** | Create React App 5.0+ | Build configuration |
| **Deployment** | GitHub Pages | Static site hosting |

### iOS Application

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Language** | Swift 5.9+ | Native iOS development |
| **UI Framework** | SwiftUI | Declarative UI |
| **Backend** | Firebase SDK | Firestore, Auth, Storage, Functions |
| **API Integration** | URLSession | Native networking for TMDB |
| **Authentication** | Firebase Auth | Google Sign-In, Apple Sign-In, Email/Password |
| **Notifications** | Firebase Cloud Messaging | Push notifications |
| **Caching** | FirestoreCacheService | Local data persistence |
| **Calendar** | EventKit | Google Calendar integration |
| **Design** | SF Rounded, SF Symbols | Apple's design system |

### Shared Backend (Firebase)

**Firestore Collections:**
```
├── MonthlySelections/{monthId}          # Selected movies per month
├── GenrePools/current                   # Current pool of submitted movies
├── Submissions/{monthId}/users/{nickname}  # User submissions
├── HoldingPool/{submissionId}           # Pending submissions
├── Users/{userId}                       # User profiles
├── Watchlist/{userId}/movies/{movieId}  # Personal watchlists (iOS)
├── ChatRooms/{roomId}                   # Chat rooms (iOS)
├── Messages/{roomId}/messages/{msgId}   # Chat messages (iOS)
├── Notifications/{userId}/items/{notifId}  # User notifications (iOS)
└── OnlineUsers/{userId}                 # Active users status (iOS)
```

**Firebase Services:**
- **Authentication**: Email/Password, Google OAuth, Apple Sign-In
- **Firestore**: Real-time database with security rules
- **Storage**: Movie posters and user avatars
- **Cloud Functions**: Server-side logic for notifications
- **Remote Config**: Feature flags and dynamic configuration

## 📁 Project Structure

```
akogarecafe.github.io/
│
├── src/                           # React Web App
│   ├── components/
│   │   ├── MovieClub/            # Movie Club feature
│   │   │   ├── MovieClub.jsx     # Main component
│   │   │   └── MovieComponents/  # Sub-components
│   │   │       ├── MovieClubAdmin.jsx
│   │   │       ├── MovieSubmission.jsx
│   │   │       ├── MovieSearchAutocomplete.jsx
│   │   │       ├── SelectedMoviesDisplay.jsx
│   │   │       ├── GenrePool.jsx
│   │   │       ├── HoldingPool.jsx
│   │   │       ├── MovieDiscovery.jsx
│   │   │       ├── OscarVotingModal.jsx
│   │   │       └── SubmissionList.jsx
│   │   ├── Music/                # Music recommendations
│   │   ├── Shogi/                # Shogi game
│   │   ├── Portfolio/            # Portfolio section
│   │   ├── InviteShare/          # Share feature
│   │   ├── Header/               # Navigation
│   │   ├── Footer/               # Footer
│   │   └── Legal/                # Privacy & Terms
│   ├── config/
│   │   ├── firebase.js           # Firebase configuration
│   │   └── tmdb.js               # TMDB API configuration
│   ├── theme/
│   │   ├── theme.js              # Custom MUI theme
│   │   └── global.scss           # Global styles
│   ├── utils/
│   │   └── tmdb.js               # TMDB utility functions
│   ├── App.js                    # Main app component
│   └── index.js                  # Entry point
│
├── Movie Club Cafe/               # iOS Native App
│   ├── Movie Club Cafe/
│   │   ├── Movie_Club_CafeApp.swift  # App entry point
│   │   ├── ContentView.swift     # Main tab view
│   │   ├── Views/
│   │   │   ├── MovieClubView.swift        # Main movie club interface
│   │   │   ├── SelectedMoviesView.swift   # Monthly selections
│   │   │   ├── GenrePoolView.swift        # Genre pools viewer
│   │   │   ├── HoldingPoolView.swift      # Admin holding pool
│   │   │   ├── MovieSubmissionView.swift  # Submit movies
│   │   │   ├── SubmissionListView.swift   # View all submissions
│   │   │   ├── OscarVotingView.swift      # Oscar voting
│   │   │   ├── MainChatView.swift         # Chat interface
│   │   │   ├── ChatRoomView.swift         # Individual chat room
│   │   │   ├── NotificationCenterView.swift  # Notifications
│   │   │   ├── AnalyticsView.swift        # User analytics
│   │   │   ├── CalendarView.swift         # Calendar integration
│   │   │   ├── OnlineUsersView.swift      # Online users list
│   │   │   ├── MovieClubAdminView.swift   # Admin panel
│   │   │   ├── MovieClubInfoView.swift    # Info/help
│   │   │   ├── Auth/                      # Authentication views
│   │   │   │   ├── SignInView.swift
│   │   │   │   ├── SignUpView.swift
│   │   │   │   ├── ProfileView.swift
│   │   │   │   └── ForgotPasswordView.swift
│   │   │   └── Admin/                     # Admin-only views
│   │   │       ├── AdminMonthlySelectionView.swift
│   │   │       ├── AdminHoldingPoolView.swift
│   │   │       ├── AdminMonthlyHistoryView.swift
│   │   │       └── AdminOscarManagementView.swift
│   │   ├── Models/
│   │   │   ├── MovieModels.swift          # Movie data structures
│   │   │   ├── UserModel.swift            # User profile model
│   │   │   └── ChatModels.swift           # Chat models
│   │   ├── Services/
│   │   │   ├── AuthenticationService.swift   # Auth management
│   │   │   ├── TMDBService.swift             # TMDB API client
│   │   │   ├── FirestoreCacheService.swift   # Local caching
│   │   │   ├── ChatService.swift             # Chat functionality
│   │   │   ├── NotificationService.swift     # Push notifications
│   │   │   ├── WatchlistService.swift        # Watchlist management
│   │   │   ├── GoogleCalendarService.swift   # Calendar integration
│   │   │   ├── AnalyticsService.swift        # Usage analytics
│   │   │   ├── ShareHelper.swift             # Share functionality
│   │   │   ├── StorageService.swift          # Firebase Storage
│   │   │   ├── RemoteConfigService.swift     # Remote config
│   │   │   └── DeepLinkService.swift         # Deep linking
│   │   ├── Config/
│   │   │   ├── AppConfig.swift            # App configuration
│   │   │   ├── FirebaseConfig.swift       # Firebase setup
│   │   │   └── GoogleService-Info.plist   # Firebase credentials
│   │   └── Theme/
│   │       └── AppTheme.swift             # App theme constants
│   ├── Movie Club Cafe.xcodeproj/     # Xcode project
│   ├── firebase.json                   # Firebase config
│   ├── firestore.rules                 # Security rules
│   ├── storage.rules                   # Storage rules
│   └── functions/                      # Cloud Functions
│       └── index.js                    # Function definitions
│
├── public/                         # Static Assets
│   ├── index.html                  # HTML template
│   ├── manifest.json               # PWA manifest
│   ├── mouseFollower.js            # Custom cursor
│   ├── logos/                      # Brand assets
│   ├── music/                      # Music album covers
│   ├── pieces/                     # Shogi piece images
│   └── portfolio/                  # Portfolio images
│
├── docs/                           # Documentation
│   ├── README.md                   # Main documentation
│   ├── CLAUDE.md                   # AI assistant guide
│   ├── mobile-app/                 # iOS documentation
│   │   ├── PROJECT_OVERVIEW.md
│   │   ├── SETUP.md
│   │   ├── QUICK_START.md
│   │   ├── TROUBLESHOOTING.md
│   │   └── [30+ feature docs]
│   ├── FEATURE_COMPLETE.md         # Feature completion status
│   ├── SHARE_FEATURE_*.md          # Share feature docs
│   └── [Additional feature docs]
│
├── package.json                    # Node dependencies
├── .gitignore                      # Git ignore rules
├── CNAME                           # Custom domain
└── README.md                       # This file
```

## 🔑 Configuration

### Environment Variables (Web)

Create a `.env` file in the root directory:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# TMDB API
REACT_APP_TMDB_API_KEY=your_tmdb_api_key
```

### Configuration (iOS)

1. **Firebase Setup:**
   - Download `GoogleService-Info.plist` from Firebase Console
   - Place in `Movie Club Cafe/Movie Club Cafe/Config/`

2. **TMDB API:**
   - Update `AppConfig.swift` with your TMDB API key:
   ```swift
   static let tmdbApiKey = "your_tmdb_api_key"
   ```

3. **Google Sign-In (Optional):**
   - Configure OAuth client ID in Firebase Console
   - Update `Info.plist` with URL schemes

4. **Apple Sign-In:**
   - Enable in Xcode Signing & Capabilities
   - Configure in Apple Developer Portal

## 🎬 Movie Club Feature Guide

### User Flow (Web & iOS)

1. **Browse Current Selections:**
   - View this month's selected movies
   - Watch trailers via YouTube integration
   - See movie details from TMDB

2. **Submit Movies:**
   - Search TMDB database with autocomplete
   - Select genre (Action, Drama, Comedy, Thriller)
   - Submit to holding pool (password required on web)

3. **Explore Pools:**
   - Browse genre-specific pools
   - View submitted movies with posters
   - See ratings and descriptions

4. **Oscar Voting (Annual):**
   - Vote for best movies of the year
   - Participate in community awards

### Admin Features (iOS)

- **Monthly Selection:** Curate movies from holding pool
- **Pool Management:** Organize and categorize submissions
- **History Viewer:** Browse past months' selections
- **User Management:** View and manage community members
- **Notifications:** Send push notifications to users
- **Oscar Management:** Configure voting periods

## 📱 iOS App Features Deep Dive

### Authentication System
- **Multi-provider:** Email/Password, Google, Apple Sign-In
- **Secure:** Firebase Authentication with auto-admin detection
- **Profile:** Custom profiles with avatars and bios
- **Password Reset:** Email-based password recovery

### Real-time Chat
- **Multi-room:** General, movie discussions, off-topic
- **Live messaging:** Real-time message delivery
- **Unread indicators:** Badge counts for new messages
- **User presence:** See who's online

### Notifications Center
- **Push notifications:** System-level alerts
- **In-app inbox:** View notification history
- **Categorized:** Movie updates, chat mentions, admin announcements
- **Actionable:** Deep links to relevant content

### Analytics Dashboard
- **Participation metrics:** Track your movie club engagement
- **Genre preferences:** Visualize your favorite genres
- **Watch history:** See your viewing patterns
- **Community stats:** Compare with other members

### Watchlist Management
- **Personal collection:** Save movies you want to watch
- **TMDB integration:** Full movie details and posters
- **Priority sorting:** Organize by interest level
- **Share:** Export your watchlist

### Calendar Integration
- **Google Calendar sync:** Add movie nights to calendar
- **Event creation:** Automatic event details
- **Reminders:** Get notified before movie club meetings

## 🔒 Security

### Firebase Security Rules

Firestore rules enforce:
- User authentication required for all operations
- Admin-only write access to selections
- Users can only modify their own submissions
- Read access to all authenticated users

Example rule:
```javascript
match /MonthlySelections/{monthId} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}
```

### API Security

- **Environment Variables:** API keys stored securely
- **CORS:** Configured for specific domains
- **Rate Limiting:** TMDB API calls throttled
- **Input Validation:** All user inputs sanitized

## 🚀 Deployment

### Web Deployment (GitHub Pages)

```bash
# Build and deploy
npm run deploy

# Manual deployment
npm run build
# Commit build/ folder to gh-pages branch
```

**Custom Domain Setup:**
- Add CNAME file with domain
- Configure DNS A records to GitHub Pages IPs
- Enable HTTPS in GitHub repository settings

### iOS Deployment (App Store)

1. **Prepare for Submission:**
   ```bash
   # In Xcode:
   # 1. Archive the build (Product > Archive)
   # 2. Validate the archive
   # 3. Distribute to App Store Connect
   ```

2. **App Store Connect:**
   - Upload screenshots
   - Write app description
   - Set pricing and availability
   - Submit for review

3. **TestFlight (Beta Testing):**
   - Upload beta build
   - Add internal/external testers
   - Gather feedback

## 📊 Performance Optimizations

### Web
- **Code Splitting:** React lazy loading for routes
- **Image Optimization:** Compressed assets, lazy loading
- **Caching:** React Query for server state
- **CDN:** Static assets served via GitHub Pages CDN
- **Bundle Size:** Tree shaking and minification

### iOS
- **Firestore Caching:** Local persistence for offline access
- **TMDB Caching:** Cache movie data to reduce API calls
- **Image Caching:** Native URLCache for posters
- **Lazy Loading:** On-demand data fetching
- **Memory Management:** Proper cleanup of observers

## 🧪 Testing

### Web Testing

```bash
# Run tests
npm test

# Test coverage
npm test -- --coverage

# E2E testing (if configured)
npm run test:e2e
```

### iOS Testing

```bash
# In Xcode:
# Run unit tests: ⌘U
# Run UI tests: Configure XCUITest targets

# Command line
xcodebuild test -scheme "Movie Club Cafe" -destination 'platform=iOS Simulator,name=iPhone 15'
```

## 🐛 Troubleshooting

### Common Web Issues

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Firebase Connection:**
- Verify `.env` variables
- Check Firebase project settings
- Ensure Firebase rules allow access

### Common iOS Issues

**Build Failures:**
- Clean build folder (⌘⇧K)
- Delete DerivedData
- Reinstall pods (if using CocoaPods)

**Firebase Issues:**
- Verify `GoogleService-Info.plist` is in project
- Check bundle identifier matches Firebase
- Ensure Firebase SDK is initialized

**Authentication Problems:**
- Check OAuth client IDs in Firebase Console
- Verify URL schemes in Info.plist
- Ensure signing capabilities are enabled

See [TROUBLESHOOTING.md](docs/mobile-app/TROUBLESHOOTING.md) for detailed solutions.

## 📖 Documentation

All documentation is organized in the `/docs` directory:

### General Documentation
- **[Main Docs](docs/README.md)** - Comprehensive project documentation
- **[Claude AI Guide](docs/CLAUDE.md)** - Complete guide for AI assistants (cursor rules)
- **[Feature Status](docs/FEATURE_COMPLETE.md)** - Implementation completion status

### iOS-Specific Documentation
- **[Project Overview](docs/mobile-app/PROJECT_OVERVIEW.md)** - iOS app architecture
- **[Setup Guide](docs/mobile-app/SETUP.md)** - Step-by-step setup instructions
- **[Quick Start](docs/mobile-app/QUICK_START.md)** - Get started quickly
- **[Authentication](docs/mobile-app/FIREBASE_AUTH_SETUP.md)** - Auth configuration
- **[Troubleshooting](docs/mobile-app/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Project Structure](docs/mobile-app/PROJECT_STRUCTURE.md)** - Code organization

### Feature Documentation
- **[Share Feature](docs/SHARE_FEATURE_QUICK_START.md)** - Invite system
- **[Chat & Notifications](docs/mobile-app/CHAT_AND_NOTIFICATIONS_COMPLETE.md)** - Messaging
- **[Calendar Integration](docs/mobile-app/CALENDAR_UI_FEATURE.md)** - Google Calendar
- **[Watchlist](docs/mobile-app/WATCHLIST_SETUP_GUIDE.md)** - Personal watchlist
- **[Analytics](docs/mobile-app/IMPLEMENTATION_SUMMARY.md)** - Analytics dashboard
- **[Admin Panel](docs/mobile-app/AUTO_ADMIN_SETUP.md)** - Admin configuration

## 🛣️ Roadmap

### Planned Features
- [ ] Real-time chat on web (currently iOS-only)
- [ ] Enhanced movie recommendations algorithm
- [ ] User voting system for monthly selections
- [ ] Movie ratings and reviews
- [ ] Social features: followers, friends
- [ ] Advanced analytics and insights
- [ ] Integration with more streaming services
- [ ] Custom movie lists and collections
- [ ] Achievements and gamification
- [ ] Multi-language support

### In Progress
- [x] iOS app redesign (minimalist Apple UI)
- [x] TMDB search integration
- [x] Chat and notifications (iOS)
- [x] Watchlist feature (iOS)
- [x] Calendar integration (iOS)
- [x] Admin panel (iOS)

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Test thoroughly before submitting
- Update documentation as needed
- Maintain design consistency with platform (web: anime/Japanese, iOS: minimalist Apple)

## 📜 License

Private project. All rights reserved.

## 🙏 Acknowledgments

- **TMDB** - Movie data and posters
- **Firebase** - Backend infrastructure
- **Material-UI** - Web component library
- **Apple** - iOS design guidelines and SwiftUI
- **Framer Motion** - Web animations
- **React Query** - State management
- **Community** - All Movie Club members

## 🔗 Links & Resources

### Live Sites
- **Website:** [akogarecafe.com](https://akogarecafe.com)
- **GitHub:** [Repository](https://github.com/yourusername/akogarecafe.github.io)

### External Services
- **TMDB API:** [The Movie Database](https://www.themoviedb.org/)
- **Firebase Console:** [firebase.google.com](https://firebase.google.com/)
- **Material-UI:** [mui.com](https://mui.com/)
- **SwiftUI:** [developer.apple.com](https://developer.apple.com/swiftui/)

### Documentation
- **React Docs:** [reactjs.org](https://reactjs.org/)
- **React Query:** [tanstack.com/query](https://tanstack.com/query/latest)
- **Firebase Docs:** [firebase.google.com/docs](https://firebase.google.com/docs)
- **TMDB API Docs:** [developers.themoviedb.org](https://developers.themoviedb.org/3)
- **SwiftUI Tutorials:** [developer.apple.com/tutorials/swiftui](https://developer.apple.com/tutorials/swiftui)

## 📧 Contact

**Kavy Rattana**
- Website: [akogarecafe.com](https://akogarecafe.com)
- Email: contact@akogarecafe.com

## ⚡ Quick Commands Reference

### Web Development
```bash
npm start          # Start dev server (localhost:3000)
npm run build      # Build for production
npm run deploy     # Deploy to GitHub Pages
npm test           # Run tests
```

### iOS Development
```bash
open "Movie Club Cafe.xcodeproj"  # Open in Xcode
⌘R                                 # Build and run
⌘U                                 # Run tests
⌘⇧K                                # Clean build folder
```

---

<div align="center">

**Built with ❤️ by Kavy Rattana**

*Celebrating Japanese culture through technology*

[Website](https://akogarecafe.com) • [Documentation](docs/README.md) • [Report Bug](https://github.com/yourusername/akogarecafe.github.io/issues)

</div>
